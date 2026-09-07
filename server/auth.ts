import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  scrypt,
  timingSafeEqual,
} from "crypto";
import type { NextFunction, Request, Response } from "express";
import type { AdminUser } from "@shared/schema";
import { storage } from "./storage";

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATIONS_SECONDS = [30, 120, 600, 1800] as const;
const ESCALATION_RESET_MS = 24 * 60 * 60 * 1000;
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_SCRYPT_OPTIONS = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

declare global {
  namespace Express {
    interface Request {
      adminUser?: AdminUser;
    }
  }
}

function getClientKey(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function getPasswordKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, PASSWORD_KEY_LENGTH, PASSWORD_SCRYPT_OPTIONS, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = await getPasswordKey(password, salt);
  return `scrypt$${PASSWORD_SCRYPT_OPTIONS.N}$${PASSWORD_SCRYPT_OPTIONS.r}$${PASSWORD_SCRYPT_OPTIONS.p}$${salt.toString("base64")}$${derivedKey.toString("base64")}`;
}

export async function verifyPassword(password: string, encodedHash: string): Promise<boolean> {
  const parts = encodedHash.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, n, r, p, encodedSalt, encodedKey] = parts;
  const salt = Buffer.from(encodedSalt, "base64");
  const expectedKey = Buffer.from(encodedKey, "base64");
  if (!salt.length || expectedKey.length !== PASSWORD_KEY_LENGTH) return false;

  const derivedKey = await getPasswordKey(password, salt);
  return timingSafeEqual(derivedKey, expectedKey) &&
    Number(n) === PASSWORD_SCRYPT_OPTIONS.N &&
    Number(r) === PASSWORD_SCRYPT_OPTIONS.r &&
    Number(p) === PASSWORD_SCRYPT_OPTIONS.p;
}

function getEncryptionKey(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET must be set to encrypt 2FA secrets.");
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return `v1:${iv.toString("base64")}:${cipher.getAuthTag().toString("base64")}:${ciphertext.toString("base64")}`;
}

export function decryptSecret(encoded: string): string {
  const [, encodedIv, encodedTag, encodedCiphertext] = encoded.split(":");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(encodedIv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(encodedTag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encodedCiphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

function base32Encode(value: Buffer): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let buffer = 0;
  let output = "";
  for (let index = 0; index < value.length; index += 1) {
    const byte = value[index];
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(buffer >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += alphabet[(buffer << (5 - bits)) & 31];
  return output;
}

function base32Decode(value: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let buffer = 0;
  const output: number[] = [];
  for (const char of value.replace(/=+$/, "").toUpperCase()) {
    const index = alphabet.indexOf(char);
    if (index < 0) throw new Error("Invalid base32 secret.");
    buffer = (buffer << 5) | index;
    bits += 5;
    if (bits >= 8) {
      output.push((buffer >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(output);
}

export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export function generateTotpCode(secret: string, timestamp = Date.now()): string {
  const counter = Math.floor(timestamp / 1000 / 30);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  counterBuffer.writeUInt32BE(counter >>> 0, 4);
  const digest = createHmac("sha256", base32Decode(secret)).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binaryCode =
    ((digest[offset] & 0x7f) << 24) |
    (digest[offset + 1] << 16) |
    (digest[offset + 2] << 8) |
    digest[offset + 3];
  return String(binaryCode % 1_000_000).padStart(6, "0");
}

export function verifyTotpCode(secret: string, code: string): boolean {
  if (!/^\d{6}$/.test(code)) return false;
  for (const offset of [-30_000, 0, 30_000]) {
    const expected = generateTotpCode(secret, Date.now() + offset);
    if (timingSafeEqual(Buffer.from(expected), Buffer.from(code))) return true;
  }
  return false;
}

export function timingSafeLegacyMatch(providedCode: string, storedCode: string): boolean {
  const providedDigest = createHash("sha256").update(providedCode).digest();
  const storedDigest = createHash("sha256").update(storedCode).digest();
  return timingSafeEqual(providedDigest, storedDigest);
}

export function generateRecoveryCodes(): string[] {
  return Array.from({ length: 8 }, () => `${randomBytes(4).toString("hex")}-${randomBytes(4).toString("hex")}`);
}

export function getLoginLockout(req: Request): Promise<number> {
  return storage.getLoginAttempt(getClientKey(req)).then((attempt) => {
    if (!attempt || !attempt.lockedUntil) return 0;
    const remaining = Math.ceil((attempt.lockedUntil.getTime() - Date.now()) / 1000);
    return Math.max(0, remaining);
  });
}

export async function recordFailedLogin(req: Request): Promise<{
  locked: boolean;
  remainingAttempts: number;
  lockoutSeconds: number;
}> {
  const key = getClientKey(req);
  const now = new Date();
  const existing = await storage.getLoginAttempt(key);
  const isStale = existing && now.getTime() - existing.lastFailureAt.getTime() > ESCALATION_RESET_MS;
  const failedAttempts = (isStale ? 0 : existing?.failedAttempts || 0) + 1;
  const escalationLevel = isStale ? 0 : existing?.escalationLevel || 0;

  if (failedAttempts < MAX_FAILED_ATTEMPTS) {
    await storage.saveLoginAttempt(key, {
      failedAttempts,
      escalationLevel,
      lockedUntil: null,
      lastFailureAt: now,
    });
    return {
      locked: false,
      remainingAttempts: MAX_FAILED_ATTEMPTS - failedAttempts,
      lockoutSeconds: 0,
    };
  }

  const lockoutSeconds = LOCKOUT_DURATIONS_SECONDS[
    Math.min(escalationLevel, LOCKOUT_DURATIONS_SECONDS.length - 1)
  ];
  await storage.saveLoginAttempt(key, {
    failedAttempts: 0,
    escalationLevel: Math.min(escalationLevel + 1, LOCKOUT_DURATIONS_SECONDS.length - 1),
    lockedUntil: new Date(now.getTime() + lockoutSeconds * 1000),
    lastFailureAt: now,
  });
  return { locked: true, remainingAttempts: 0, lockoutSeconds };
}

export function recordSuccessfulLogin(req: Request): Promise<void> {
  return storage.deleteLoginAttempt(getClientKey(req));
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.session?.adminUserId) {
    res.status(401).json({ message: "Απαιτείται σύνδεση διαχειριστή." });
    return;
  }

  const user = await storage.getAdminUserById(req.session.adminUserId);
  if (
    !user ||
    user.active === "false" ||
    req.session.authVersion !== user.authVersion
  ) {
    req.session.destroy(() => undefined);
    res.status(401).json({ message: "Η διαχειριστική συνεδρία δεν είναι πλέον έγκυρη." });
    return;
  }

  req.adminUser = user;
  next();
}

export function requireRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await requireAdmin(req, res, () => undefined);
    if (res.headersSent) return;
    if (!req.adminUser || !roles.includes(req.adminUser.role)) {
      res.status(403).json({ message: "Δεν έχετε δικαιώματα για αυτή την ενέργεια." });
      return;
    }
    next();
  };
}

export const adminRolePermissions: Record<string, string[]> = {
  owner: ["Owner"],
  admin: ["Περιεχόμενο", "Αναφορές", "Ιδιωτικά μηνύματα", "Διαχείριση λογαριασμών"],
  editor: ["Άρθρα", "Ανακοινώσεις"],
  moderator: ["Σχόλια", "Αναφορές"],
};

export function requireSameOrigin(req: Request, res: Response, next: NextFunction): void {
  const origin = req.get("origin");
  if (origin && origin !== `${req.protocol}://${req.get("host")}`) {
    res.status(403).json({ message: "Μη έγκυρη προέλευση αιτήματος." });
    return;
  }
  const referer = req.get("referer");
  if (!origin && referer) {
    try {
      if (new URL(referer).origin !== `${req.protocol}://${req.get("host")}`) {
        res.status(403).json({ message: "Μη έγκυρη προέλευση αιτήματος." });
        return;
      }
    } catch {
      res.status(403).json({ message: "Μη έγκυρη προέλευση αιτήματος." });
      return;
    }
  }
  next();
}

export function getClientIp(req: Request): string {
  return getClientKey(req);
}