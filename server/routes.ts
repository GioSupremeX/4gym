import { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { randomBytes, createHash } from "crypto";
import { z } from "zod";
import { storage } from "./storage";
import { insertArticleSchema, insertSiteSettingsSchema, insertAnnouncementSchema, insertCommentSchema, insertReportSchema, insertSubscriberSchema, insertContactSchema, type AdminUser } from "@shared/schema";
import { api } from "@shared/routes";
import { decryptSecret, encryptSecret, generateRecoveryCodes, generateTotpSecret, getClientIp, getLoginLockout, hashPassword, recordFailedLogin, recordSuccessfulLogin, requireAdmin, requireOwnerTwoFactor, requireRole, requireSameOrigin, timingSafeLegacyMatch, verifyPassword, verifyTotpCode } from "./auth";

// Simple in-memory cooldown tracker (IP -> { endpoint: timestamp })
const cooldownMap = new Map<string, Map<string, number>>();

function publicSettings(settings: Awaited<ReturnType<typeof storage.getSettings>>) {
  const { adminCode: _adminCode, ...safeSettings } = settings;
  return safeSettings;
}

function checkCooldown(ip: string, endpoint: string, seconds: number): boolean {
  const now = Date.now();
  let userMap = cooldownMap.get(ip);
  if (!userMap) {
    userMap = new Map();
    cooldownMap.set(ip, userMap);
  }
  const last = userMap.get(endpoint) || 0;
  if (now - last < seconds * 1000) return false;
  userMap.set(endpoint, now);
  return true;
}

function getCooldownRemaining(ip: string, endpoint: string, seconds: number): number {
  const userMap = cooldownMap.get(ip);
  if (!userMap) return 0;
  const last = userMap.get(endpoint) || 0;
  const remaining = Math.ceil((seconds * 1000 - (Date.now() - last)) / 1000);
  return Math.max(0, remaining);
}

const usernameSchema = z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9._-]{2,63}$/, "Το όνομα χρήστη πρέπει να έχει 3-64 χαρακτήρες.");
const strongPasswordSchema = z.string().min(12, "Ο κωδικός πρέπει να έχει τουλάχιστον 12 χαρακτήρες.").max(256);
const passwordRecoverySchema = z.object({
  username: usernameSchema,
  recoveryCodes: z.tuple([
    z.string().trim().toLowerCase().regex(/^[a-f0-9]{8}-[a-f0-9]{8}$/),
    z.string().trim().toLowerCase().regex(/^[a-f0-9]{8}-[a-f0-9]{8}$/),
  ]),
  newPassword: strongPasswordSchema,
}).strict();
const articleImagesSchema = z.array(z.string().max(500_000)).max(6).refine(
  (images) => images.reduce((total, image) => total + image.length, 0) <= 3_000_000,
  "Οι εικόνες του άρθρου είναι πολύ μεγάλες συνολικά.",
);
const articlePayloadSchema = insertArticleSchema.extend({
  title: z.string().trim().min(1).max(200),
  content: z.string().min(1).max(100_000),
  imageUrls: articleImagesSchema.optional(),
});
const settingsPayloadSchema = insertSiteSettingsSchema.partial().superRefine((settings, context) => {
  const imageFields = ["logoUrl", "heroImageUrl", "magazineImageUrl"] as const;
  let totalInlineImageCharacters = 0;
  for (const field of imageFields) {
    const value = settings[field];
    if (typeof value !== "string" || !value.startsWith("data:")) continue;
    if (!/^data:image\/(?:webp|jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/i.test(value)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [field],
        message: "Οι εικόνες πρέπει να είναι έγκυρα αρχεία JPG, PNG ή WebP.",
      });
      continue;
    }
    if (value.length > 700_000) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [field],
        message: "Η εικόνα είναι πολύ μεγάλη. Συμπιέστε την πριν την αποθήκευση.",
      });
    }
    totalInlineImageCharacters += value.length;
  }
  if (totalInlineImageCharacters > 1_800_000) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Το συνολικό μέγεθος των εισαγόμενων εικόνων είναι πολύ μεγάλο.",
    });
  }
});
const announcementPayloadSchema = insertAnnouncementSchema.extend({
  title: z.string().trim().min(1).max(200),
  content: z.string().min(1).max(100_000),
});
const commentPayloadSchema = insertCommentSchema.extend({
  authorName: z.string().trim().min(1).max(100),
  authorEmail: z.string().email().max(320),
  content: z.string().trim().min(1).max(3_000),
});
const reportPayloadSchema = insertReportSchema.extend({
  reason: z.string().trim().min(1).max(1_000),
});
const subscriberPayloadSchema = insertSubscriberSchema.extend({
  email: z.string().email().max(320),
});
const contactPayloadSchema = insertContactSchema.extend({
  name: z.string().trim().min(1).max(120),
  email: z.string().email().max(320),
  subject: z.string().max(200).nullable().optional(),
  message: z.string().trim().min(1).max(5_000),
});
const safeUser = (user: AdminUser) => ({
  id: user.id,
  username: user.username,
  role: user.role,
  active: user.active,
  twoFactorEnabled: user.twoFactorEnabled,
  createdAt: user.createdAt,
  lastLoginAt: user.lastLoginAt,
});

function audit(req: Request, action: string, details?: Record<string, unknown>): void {
  if (!req.adminUser) return;
  void storage.createAuditLog({
    adminUserId: req.adminUser.id,
    username: req.adminUser.username,
    action,
    ipAddress: getClientIp(req),
    details: details ? JSON.stringify(details) : undefined,
  }).catch((error) => console.error("Audit log error:", error));
}

function completeAdminSession(req: Request, user: AdminUser, twoFactorVerified = false): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) return reject(error);
      req.session.isAdmin = true;
      req.session.adminUserId = user.id;
      req.session.authVersion = user.authVersion;
      req.session.twoFactorVerified = twoFactorVerified;
      delete req.session.pendingTwoFactorUserId;
      delete req.session.pendingTwoFactorExpiresAt;
      delete req.session.pendingTwoFactorAuthVersion;
      req.session.save((saveError) => (saveError ? reject(saveError) : resolve()));
    });
  });
}

function pendingTwoFactorSession(req: Request, user: AdminUser): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) return reject(error);
      req.session.pendingTwoFactorUserId = user.id;
      req.session.pendingTwoFactorExpiresAt = Date.now() + 5 * 60 * 1000;
      req.session.pendingTwoFactorAuthVersion = user.authVersion;
      req.session.save((saveError) => (saveError ? reject(saveError) : resolve()));
    });
  });
}

function validAdminPassword(value: unknown): value is string {
  return typeof value === "string" && strongPasswordSchema.safeParse(value).success;
}

function loginError(res: Response, req: Request): Promise<Response> {
  return recordFailedLogin(req).then((result) => {
    if (result.locked) {
      res.setHeader("Retry-After", result.lockoutSeconds);
      return res.status(429).json({
        message: `Πολλές αποτυχημένες προσπάθειες. Η πρόσβαση κλειδώθηκε για ${result.lockoutSeconds} δευτερόλεπτα.`,
        remainingSeconds: result.lockoutSeconds,
      });
    }
    return res.status(401).json({
      message: "Λάθος στοιχεία σύνδεσης.",
      attemptsRemaining: result.remainingAttempts,
    });
  });
}

export async function registerRoutes(server: Server, app: Express): Promise<void> {
  app.get("/api/admin/session", async (req: Request, res: Response) => {
    res.setHeader("Cache-Control", "no-store");
    const sessionUser = req.session?.adminUserId
      ? await storage.getAdminUserById(req.session.adminUserId)
      : undefined;
    const pendingUser = req.session?.pendingTwoFactorUserId
      ? await storage.getAdminUserById(req.session.pendingTwoFactorUserId)
      : undefined;
    res.json({
      authenticated: Boolean(sessionUser && sessionUser.active !== "false" && req.session?.authVersion === sessionUser.authVersion),
      user: sessionUser ? safeUser(sessionUser) : undefined,
      requiresTwoFactor: Boolean(
        pendingUser &&
        pendingUser.active !== "false" &&
        req.session?.pendingTwoFactorExpiresAt &&
        req.session.pendingTwoFactorExpiresAt > Date.now() &&
        req.session.pendingTwoFactorAuthVersion === pendingUser.authVersion,
      ),
    });
  });

  app.post("/api/admin/password/recover", requireSameOrigin, async (req: Request, res: Response) => {
    const lockedFor = await getLoginLockout(req);
    if (lockedFor > 0) {
      res.setHeader("Retry-After", lockedFor);
      return res.status(429).json({
        message: `Πολλές αποτυχημένες προσπάθειες. Δοκιμάστε ξανά σε ${lockedFor} δευτερόλεπτα.`,
        remainingSeconds: lockedFor,
      });
    }

    const parsed = passwordRecoverySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Τα στοιχεία ανάκτησης δεν είναι έγκυρα." });
    }

    const [firstCode, secondCode] = parsed.data.recoveryCodes;
    if (firstCode === secondCode) return loginError(res, req);

    const user = await storage.getAdminUserByUsername(parsed.data.username);
    const storedHashes = user?.twoFactorRecoveryCodes || [];
    if (
      !user ||
      user.active === "false" ||
      user.twoFactorEnabled !== "true" ||
      storedHashes.length < 2
    ) {
      return loginError(res, req);
    }

    const matchedHashes = new Set<string>();
    for (const recoveryCode of parsed.data.recoveryCodes) {
      for (const storedHash of storedHashes) {
        if (!matchedHashes.has(storedHash) && await verifyPassword(recoveryCode, storedHash)) {
          matchedHashes.add(storedHash);
          break;
        }
      }
    }
    if (matchedHashes.size !== 2) return loginError(res, req);

    const usedHashes = Array.from(matchedHashes) as [string, string];
    const remainingHashes = storedHashes.filter((hash) => !matchedHashes.has(hash));
    const updatedUser = await storage.resetAdminPasswordWithRecoveryCodes(
      user.id,
      await hashPassword(parsed.data.newPassword),
      usedHashes,
      remainingHashes,
    );
    if (!updatedUser) return loginError(res, req);

    await recordSuccessfulLogin(req);
    void storage.createAuditLog({
      adminUserId: updatedUser.id,
      username: updatedUser.username,
      action: "account.password_recovered",
      ipAddress: getClientIp(req),
    }).catch((error) => console.error("Audit log error:", error));

    res.json({ message: "Ο κωδικός άλλαξε. Συνδεθείτε με τον νέο κωδικό και την επαλήθευση δύο βημάτων." });
  });

  app.post("/api/admin/login", requireSameOrigin, async (req: Request, res: Response) => {
    const lockedFor = await getLoginLockout(req);
    if (lockedFor > 0) {
      res.setHeader("Retry-After", lockedFor);
      return res.status(429).json({
        message: `Πολλές αποτυχημένες προσπάθειες. Δοκιμάστε ξανά σε ${lockedFor} δευτερόλεπτα.`,
        remainingSeconds: lockedFor,
      });
    }

    const usernameResult = usernameSchema.safeParse(req.body?.username || "administrator");
    if (!usernameResult.success || typeof req.body?.passcode !== "string" || req.body.passcode.length > 256) {
      return res.status(400).json({ message: "Τα στοιχεία σύνδεσης δεν είναι έγκυρα." });
    }

    const username = usernameResult.data;
    const passcode = req.body.passcode;
    const settings = await storage.getSettings();
    let user = await storage.getAdminUserByUsername(username);

    // One-time migration path for the old shared passcode.
    if (!user && username === "administrator" && (await storage.getAdminUsers()).length === 0) {
      const legacyMatches = timingSafeLegacyMatch(passcode, settings.adminCode);
      if (legacyMatches) {
        user = await storage.createAdminUser({
          username: "administrator",
          passwordHash: await hashPassword(passcode),
           role: "owner",
          active: "true",
          twoFactorEnabled: "false",
          authVersion: 1,
        });
        await storage.updateSettings({ adminCode: randomBytes(32).toString("hex") });
      }
    }

    if (user && username === "administrator" && user.role === "admin") {
      user = await storage.updateAdminUser(user.id, { role: "owner" }) || user;
    }

    if (
      !user ||
      user.active === "false" ||
      !(user.passwordHash && await verifyPassword(passcode, user.passwordHash))
    ) {
      return loginError(res, req);
    }

    if (user.twoFactorEnabled === "true" && user.twoFactorSecret) {
      await pendingTwoFactorSession(req, user);
      return res.json({ authenticated: false, requiresTwoFactor: true });
    }

    await completeAdminSession(req, user);
    await storage.updateAdminUser(user.id, { lastLoginAt: new Date() });
    await recordSuccessfulLogin(req);
    void storage.createAuditLog({
      adminUserId: user.id,
      username: user.username,
      action: "login.success",
      ipAddress: getClientIp(req),
    }).catch((error) => console.error("Audit log error:", error));

    res.json({ authenticated: true, user: safeUser(user) });
  });

  app.post("/api/admin/verify-2fa", requireSameOrigin, async (req: Request, res: Response) => {
    const pendingUserId = req.session?.pendingTwoFactorUserId;
    if (
      !pendingUserId ||
      !req.session.pendingTwoFactorExpiresAt ||
      req.session.pendingTwoFactorExpiresAt < Date.now() ||
      req.session.pendingTwoFactorAuthVersion === undefined
    ) {
      return res.status(401).json({ message: "Η επαλήθευση δύο βημάτων έληξε." });
    }

    const codeResult = z.string().trim().safeParse(req.body?.code);
    if (!codeResult.success || codeResult.data.length > 256) {
      return res.status(400).json({ message: "Ο κωδικός επαλήθευσης δεν είναι έγκυρος." });
    }

    let user = await storage.getAdminUserById(pendingUserId);
    if (!user || user.authVersion !== req.session.pendingTwoFactorAuthVersion) {
      return res.status(401).json({ message: "Η επαλήθευση δύο βημάτων έληξε. Συνδεθείτε ξανά." });
    }
    let valid = false;
    let usedRecoveryCode = false;
    if (user?.twoFactorEnabled === "true" && user.twoFactorSecret) {
      const secret = decryptSecret(user.twoFactorSecret);
      valid = verifyTotpCode(secret, codeResult.data);
      if (!valid && user.twoFactorRecoveryCodes?.length) {
        for (const hashedCode of user.twoFactorRecoveryCodes) {
          if (await verifyPassword(codeResult.data, hashedCode)) {
            const updatedUser = await storage.consumeAdminRecoveryCode(user.id, hashedCode);
            if (updatedUser) {
              user = updatedUser;
              valid = true;
              usedRecoveryCode = true;
            }
            break;
          }
        }
      }
    }

    if (!valid || !user || user.active === "false") {
      return loginError(res, req);
    }

    await completeAdminSession(req, user, true);
    await storage.updateAdminUser(user.id, { lastLoginAt: new Date() });
    await recordSuccessfulLogin(req);
    void storage.createAuditLog({
      adminUserId: user.id,
      username: user.username,
      action: "login.2fa_success",
      ipAddress: getClientIp(req),
      details: usedRecoveryCode ? JSON.stringify({ recoveryCodeUsed: true }) : undefined,
    }).catch((error) => console.error("Audit log error:", error));
    res.json({ authenticated: true, user: safeUser(user) });
  });

  app.post("/api/admin/logout", requireSameOrigin, requireAdmin, (req: Request, res: Response) => {
    audit(req, "logout");
    req.session.destroy((error) => {
      if (error) {
        return res.status(500).json({ message: "Αποτυχία αποσύνδεσης." });
      }
      res.clearCookie("connect.sid");
      res.status(204).end();
    });
  });

  app.get("/api/admin/users", requireRole("owner", "admin"), requireOwnerTwoFactor, async (_req: Request, res: Response) => {
    const users = await storage.getAdminUsers();
    res.setHeader("Cache-Control", "no-store");
    res.json(users.map(safeUser));
  });

  app.post("/api/admin/users", requireSameOrigin, requireRole("owner", "admin"), requireOwnerTwoFactor, async (req: Request, res: Response) => {
    const usernameResult = usernameSchema.safeParse(req.body?.username);
    if (!usernameResult.success || !validAdminPassword(req.body?.password)) {
      return res.status(400).json({ message: "Χρησιμοποιήστε όνομα χρήστη 3-64 χαρακτήρων και κωδικό τουλάχιστον 12 χαρακτήρων." });
    }
    try {
      const role = req.body?.role === "moderator" || req.body?.role === "editor" || req.body?.role === "admin"
        ? req.body.role
        : "editor";
      const user = await storage.createAdminUser({
        username: usernameResult.data,
        passwordHash: await hashPassword(req.body.password),
        role,
        active: "true",
        twoFactorEnabled: "false",
        authVersion: 1,
      });
      audit(req, "admin_user.created", { userId: user.id, username: user.username });
      res.status(201).json(safeUser(user));
    } catch (error: any) {
      if (error?.code === "23505") return res.status(409).json({ message: "Το όνομα χρήστη υπάρχει ήδη." });
      throw error;
    }
  });

  app.delete("/api/admin/users/:id", requireSameOrigin, requireRole("owner", "admin"), requireOwnerTwoFactor, async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId === req.adminUser?.id) {
      return res.status(400).json({ message: "Δεν μπορείτε να διαγράψετε τον τρέχοντα λογαριασμό." });
    }
    const users = await storage.getAdminUsers();
    const target = users.find((user) => user.id === userId);
    if (!target) return res.status(404).json({ message: "Ο λογαριασμός δεν βρέθηκε." });
    if (target.role === "owner" || target.username === "administrator") {
      return res.status(403).json({ message: "Ο owner λογαριασμός administrator δεν μπορεί να διαγραφεί." });
    }
    if (users.filter((user) => user.active !== "false").length <= 1) {
      return res.status(400).json({ message: "Πρέπει να παραμείνει τουλάχιστον ένας ενεργός διαχειριστής." });
    }
    await storage.deleteAdminUser(userId);
    audit(req, "admin_user.deleted", { userId, username: target.username });
    res.status(204).end();
  });

  app.post("/api/admin/account/password", requireSameOrigin, requireAdmin, requireOwnerTwoFactor, async (req: Request, res: Response) => {
    if (!req.adminUser || typeof req.body?.currentPassword !== "string" || !validAdminPassword(req.body?.newPassword)) {
      return res.status(400).json({ message: "Ο νέος κωδικός πρέπει να έχει τουλάχιστον 12 χαρακτήρες." });
    }
    if (!(await verifyPassword(req.body.currentPassword, req.adminUser.passwordHash))) {
      return res.status(401).json({ message: "Ο τρέχων κωδικός είναι λανθασμένος." });
    }
    const nextVersion = req.adminUser.authVersion + 1;
    const updated = await storage.updateAdminUser(req.adminUser.id, {
      passwordHash: await hashPassword(req.body.newPassword),
      authVersion: nextVersion,
    });
    if (!updated) return res.status(404).json({ message: "Ο λογαριασμός δεν βρέθηκε." });
    req.session.authVersion = nextVersion;
    audit(req, "account.password_changed");
    res.json({ message: "Ο κωδικός άλλαξε. Οι άλλες ενεργές συνεδρίες ακυρώθηκαν." });
  });

  app.get("/api/admin/2fa/setup", requireSameOrigin, requireAdmin, async (req: Request, res: Response) => {
    if (!req.adminUser) return res.status(401).json({ message: "Απαιτείται σύνδεση διαχειριστή." });
    if (req.adminUser.twoFactorEnabled === "true") {
      return res.status(409).json({ message: "Η επαλήθευση δύο βημάτων είναι ήδη ενεργή." });
    }
    const secret = generateTotpSecret();
    const recoveryCodes = generateRecoveryCodes();
    await storage.updateAdminUser(req.adminUser.id, {
      twoFactorSecret: encryptSecret(secret),
      twoFactorRecoveryCodes: await Promise.all(recoveryCodes.map(hashPassword)),
      twoFactorEnabled: "false",
    });
    const issuer = encodeURIComponent("4o Gymnasio Rodou");
    const account = encodeURIComponent(req.adminUser.username);
    audit(req, "account.2fa_setup_started");
    res.json({
      secret,
      otpauthUri: `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=SHA256&digits=6&period=30`,
      recoveryCodes,
    });
  });

  app.post("/api/admin/2fa/confirm", requireSameOrigin, requireAdmin, async (req: Request, res: Response) => {
    if (!req.adminUser || typeof req.body?.code !== "string") {
      return res.status(400).json({ message: "Ο κωδικός επαλήθευσης δεν είναι έγκυρος." });
    }
    const user = await storage.getAdminUserById(req.adminUser.id);
    if (!user?.twoFactorSecret || !verifyTotpCode(decryptSecret(user.twoFactorSecret), req.body.code)) {
      return res.status(400).json({ message: "Ο κωδικός επαλήθευσης δεν είναι σωστός." });
    }
    const updated = await storage.updateAdminUser(user.id, { twoFactorEnabled: "true" });
    req.session.twoFactorVerified = true;
    await new Promise<void>((resolve, reject) => {
      req.session.save((error) => (error ? reject(error) : resolve()));
    });
    audit(req, "account.2fa_enabled");
    res.json({ enabled: updated?.twoFactorEnabled === "true" });
  });

  app.post("/api/admin/2fa/test-recovery-code", requireSameOrigin, requireAdmin, async (req: Request, res: Response) => {
    if (!req.adminUser || typeof req.body?.code !== "string" || req.body.code.trim().length > 256) {
      return res.status(400).json({ message: "Ο recovery code δεν είναι έγκυρος." });
    }
    const user = await storage.getAdminUserById(req.adminUser.id);
    if (!user?.twoFactorSecret || user.twoFactorEnabled === "true" || !user.twoFactorRecoveryCodes?.length) {
      return res.status(400).json({ message: "Δεν υπάρχει ενεργή ρύθμιση 2FA προς έλεγχο." });
    }
    let valid = false;
    for (const hashedCode of user.twoFactorRecoveryCodes) {
      if (await verifyPassword(req.body.code.trim(), hashedCode)) {
        valid = true;
        break;
      }
    }
    if (!valid) return res.status(400).json({ message: "Ο recovery code δεν είναι σωστός." });
    res.json({ valid: true });
  });

  app.post("/api/admin/2fa/disable", requireSameOrigin, requireAdmin, async (req: Request, res: Response) => {
    if (!req.adminUser) {
      return res.status(401).json({ message: "Απαιτείται σύνδεση διαχειριστή." });
    }

    const rawInput = req.body?.password ?? req.body?.code ?? "";
    const input = typeof rawInput === "string" ? rawInput.trim() : "";

    let authorized = false;

    // 1. Check account login password
    if (input && req.adminUser.passwordHash) {
      try {
        if (await verifyPassword(input, req.adminUser.passwordHash)) {
          authorized = true;
        }
      } catch {
        // ignore
      }
    }

    // 2. Check 6-digit TOTP code from Authenticator app
    if (!authorized && input && req.adminUser.twoFactorSecret) {
      try {
        const secret = decryptSecret(req.adminUser.twoFactorSecret);
        if (verifyTotpCode(secret, input)) {
          authorized = true;
        }
      } catch {
        // ignore
      }
    }

    // 3. Check recovery code
    if (!authorized && input && req.adminUser.twoFactorRecoveryCodes && req.adminUser.twoFactorRecoveryCodes.length > 0) {
      try {
        const codeHash = createHash("sha256").update(input.toLowerCase()).digest("hex");
        if (req.adminUser.twoFactorRecoveryCodes.includes(codeHash)) {
          authorized = true;
        }
      } catch {
        // ignore
      }
    }

    if (!authorized) {
      return res.status(400).json({
        message: "Εισάγετε τον κωδικό πρόσβασης του λογαριασμού σας ή τον 6-ψήφιο κωδικό από το Authenticator app.",
      });
    }

    const nextVersion = req.adminUser.authVersion + 1;
    await storage.updateAdminUser(req.adminUser.id, {
      twoFactorSecret: null,
      twoFactorRecoveryCodes: [],
      twoFactorEnabled: "false",
      authVersion: nextVersion,
    });
    req.session.authVersion = nextVersion;
    req.session.twoFactorVerified = true;
    await new Promise<void>((resolve) => req.session.save(() => resolve()));

    audit(req, "account.2fa_disabled");
    res.json({ enabled: false, message: "Η επαλήθευση δύο βημάτων απενεργοποιήθηκε επιτυχώς." });
  });

  // Articles
  app.get(api.articles.list.path, async (_req: Request, res: Response) => {
    const articlesList = await storage.getArticles();
    res.json(articlesList);
  });

  app.get(api.articles.get.path, async (req: Request, res: Response) => {
    const article = await storage.getArticle(Number(req.params.id));
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  });

  app.post(api.articles.create.path, requireSameOrigin, requireRole("owner", "admin", "editor"), async (req: Request, res: Response) => {
    const parsed = articlePayloadSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const article = await storage.createArticle(parsed.data);
    audit(req, "article.created", { articleId: article.id });
    res.json(article);
  });

  app.patch(api.articles.update.path, requireSameOrigin, requireRole("owner", "admin", "editor"), async (req: Request, res: Response) => {
    const parsed = articlePayloadSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const article = await storage.updateArticle(Number(req.params.id), parsed.data);
    audit(req, "article.updated", { articleId: Number(req.params.id) });
    res.json(article);
  });

  app.delete(api.articles.delete.path, requireSameOrigin, requireRole("owner", "admin", "editor"), async (req: Request, res: Response) => {
    await storage.deleteArticle(Number(req.params.id));
    audit(req, "article.deleted", { articleId: Number(req.params.id) });
    res.status(204).end();
  });

  // Announcements
  app.get("/api/announcements", async (_req: Request, res: Response) => {
    const announcementsList = await storage.getAnnouncements();
    res.json(announcementsList);
  });

  app.post("/api/announcements", requireSameOrigin, requireRole("owner", "admin", "editor"), async (req: Request, res: Response) => {
    const parsed = announcementPayloadSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const announcement = await storage.createAnnouncement(parsed.data);
    audit(req, "announcement.created", { announcementId: announcement.id });
    res.json(announcement);
  });

  app.delete("/api/announcements/:id", requireSameOrigin, requireRole("owner", "admin", "editor"), async (req: Request, res: Response) => {
    await storage.deleteAnnouncement(Number(req.params.id));
    audit(req, "announcement.deleted", { announcementId: Number(req.params.id) });
    res.status(204).end();
  });

  app.patch("/api/announcements/:id", requireSameOrigin, requireRole("owner", "admin", "editor"), async (req: Request, res: Response) => {
    const parsed = announcementPayloadSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const announcement = await storage.updateAnnouncement(Number(req.params.id), parsed.data);
    if (!announcement) return res.status(404).json({ message: "Η ανακοίνωση δεν βρέθηκε." });
    audit(req, "announcement.updated", { announcementId: announcement.id });
    res.json(announcement);
  });

  // Settings
  app.get(api.settings.get.path, async (_req: Request, res: Response) => {
    const settings = await storage.getSettings();
    res.json(publicSettings(settings));
  });

  app.patch(api.settings.update.path, requireSameOrigin, requireRole("owner", "admin"), async (req: Request, res: Response) => {
    const parsed = settingsPayloadSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const { adminCode: _ignoredAdminCode, creditsEnabled: _ignoredCreditsEnabled, ...update } = parsed.data;
    const settings = await storage.updateSettings(update);
    audit(req, "settings.updated", { fields: Object.keys(update) });
    res.json(publicSettings(settings));
  });

  app.patch("/api/admin/credits", requireSameOrigin, requireRole("owner"), requireOwnerTwoFactor, async (req: Request, res: Response) => {
    if (req.body?.creditsEnabled !== "true" && req.body?.creditsEnabled !== "false") {
      return res.status(400).json({ message: "Μη έγκυρη τιμή credits." });
    }
    const settings = await storage.updateSettings({ creditsEnabled: req.body.creditsEnabled });
    audit(req, "credits.toggled", { enabled: req.body.creditsEnabled === "true" });
    res.json({ creditsEnabled: settings.creditsEnabled });
  });

  // Category Articles
  app.get("/api/articles/category/:category", async (req: Request, res: Response) => {
    const articlesList = await storage.getArticles();
    const filtered = articlesList.filter(a => a.category === req.params.category);
    res.json(filtered);
  });

  // Comments
  app.get("/api/articles/:id/comments", async (req: Request, res: Response) => {
    const comments = await storage.getCommentsByArticle(Number(req.params.id));
    res.json(comments);
  });

  app.post("/api/articles/:id/comments", async (req: Request, res: Response) => {
    const settings = await storage.getSettings();
    if (settings.commentsEnabled === "false") {
      return res.status(403).json({ message: "Τα σχόλια είναι απενεργοποιημένα." });
    }
    const cooldownSeconds = parseInt(settings.commentCooldown || "60", 10);
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    if (!checkCooldown(ip, "comment", cooldownSeconds)) {
      const remaining = getCooldownRemaining(ip, "comment", cooldownSeconds);
      return res.status(429).json({ message: `Περιμένετε ${remaining} δευτερόλεπτα πριν ξανά σχολιάσετε.` });
    }
    const parsed = commentPayloadSchema.safeParse({ ...req.body, articleId: Number(req.params.id) });
    if (!parsed.success) return res.status(400).json(parsed.error);
    const comment = await storage.createComment(parsed.data);
    res.json(comment);
  });

  app.delete("/api/comments/:id", requireSameOrigin, requireRole("owner", "admin", "moderator"), async (req: Request, res: Response) => {
    await storage.deleteComment(Number(req.params.id));
    audit(req, "comment.deleted", { commentId: Number(req.params.id) });
    res.status(204).end();
  });

  // Reports
  app.get("/api/comments/reports", requireRole("owner", "admin", "moderator"), async (_req: Request, res: Response) => {
    const reports = await storage.getReportedComments();
    res.json(reports);
  });

  app.post("/api/comments/:id/report", async (req: Request, res: Response) => {
    const parsed = reportPayloadSchema.safeParse({ ...req.body, commentId: Number(req.params.id) });
    if (!parsed.success) return res.status(400).json(parsed.error);
    const report = await storage.reportComment(parsed.data);
    res.json(report);
  });

  app.delete("/api/comments/reports/:id", requireSameOrigin, requireRole("owner", "admin", "moderator"), async (req: Request, res: Response) => {
    await storage.deleteReport(Number(req.params.id));
    audit(req, "comment_report.deleted", { reportId: Number(req.params.id) });
    res.status(204).end();
  });

  // Subscribers
  app.get("/api/subscribers", requireRole("owner", "admin"), async (_req: Request, res: Response) => {
    const subs = await storage.getSubscribers();
    res.json(subs);
  });

  app.post("/api/subscribers", async (req: Request, res: Response) => {
    const settings = await storage.getSettings();
    if (settings.subscribeEnabled === "false") {
      return res.status(403).json({ message: "Η εγγραφή στο newsletter είναι απενεργοποιημένη." });
    }
    const cooldownSeconds = parseInt(settings.subscribeCooldown || "300", 10);
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    if (!checkCooldown(ip, "subscribe", cooldownSeconds)) {
      const remaining = getCooldownRemaining(ip, "subscribe", cooldownSeconds);
      return res.status(429).json({ message: `Περιμένετε ${remaining} δευτερόλεπτα πριν ξανά εγγραφείτε.` });
    }
    const parsed = subscriberPayloadSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    try {
      const sub = await storage.createSubscriber(parsed.data);
      res.json(sub);
    } catch (e: any) {
      if (e.message?.includes("duplicate") || e.code === "23505") {
        return res.status(409).json({ message: "Email already subscribed" });
      }
      throw e;
    }
  });

  app.delete("/api/subscribers/:id", requireSameOrigin, requireRole("owner", "admin"), async (req: Request, res: Response) => {
    await storage.deleteSubscriber(Number(req.params.id));
    audit(req, "subscriber.deleted", { subscriberId: Number(req.params.id) });
    res.status(204).end();
  });

  // Contact Messages
  app.get("/api/contacts", requireRole("owner", "admin"), async (_req: Request, res: Response) => {
    const msgs = await storage.getContacts();
    res.json(msgs);
  });

  app.post("/api/contacts", async (req: Request, res: Response) => {
    const settings = await storage.getSettings();
    if (settings.messagesEnabled === "false") {
      return res.status(403).json({ message: "Η αποστολή μηνυμάτων είναι απενεργοποιημένη." });
    }
    const cooldownSeconds = parseInt(settings.messageCooldown || "60", 10);
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    if (!checkCooldown(ip, "message", cooldownSeconds)) {
      const remaining = getCooldownRemaining(ip, "message", cooldownSeconds);
      return res.status(429).json({ message: `Περιμένετε ${remaining} δευτερόλεπτα πριν ξανά στείλετε μήνυμα.` });
    }
    const parsed = contactPayloadSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const msg = await storage.createContact(parsed.data);
    res.json(msg);
  });

  app.delete("/api/contacts/:id", requireSameOrigin, requireRole("owner", "admin"), async (req: Request, res: Response) => {
    await storage.deleteContact(Number(req.params.id));
    audit(req, "contact.deleted", { contactId: Number(req.params.id) });
    res.status(204).end();
  });
}
