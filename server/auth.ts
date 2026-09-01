import { createHash, timingSafeEqual } from "crypto";
import type { NextFunction, Request, Response } from "express";

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATIONS_SECONDS = [30, 120, 600, 1800] as const;
const ESCALATION_RESET_MS = 24 * 60 * 60 * 1000;

type LoginAttemptState = {
  failedAttempts: number;
  escalationLevel: number;
  lockedUntil: number;
  lastFailureAt: number;
};

const loginAttempts = new Map<string, LoginAttemptState>();

function getClientKey(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function getState(key: string, now: number): LoginAttemptState {
  const existing = loginAttempts.get(key);
  if (existing && now - existing.lastFailureAt <= ESCALATION_RESET_MS) {
    return existing;
  }

  const freshState: LoginAttemptState = {
    failedAttempts: 0,
    escalationLevel: 0,
    lockedUntil: 0,
    lastFailureAt: now,
  };
  loginAttempts.set(key, freshState);
  return freshState;
}

export function getLoginLockout(req: Request): number {
  const now = Date.now();
  const key = getClientKey(req);
  const state = loginAttempts.get(key);

  if (!state || state.lockedUntil <= now) {
    if (state?.lockedUntil && state.lockedUntil <= now) {
      state.lockedUntil = 0;
    }
    return 0;
  }

  return Math.ceil((state.lockedUntil - now) / 1000);
}

export function recordFailedLogin(req: Request): {
  locked: boolean;
  remainingAttempts: number;
  lockoutSeconds: number;
} {
  const now = Date.now();
  const state = getState(getClientKey(req), now);

  state.failedAttempts += 1;
  state.lastFailureAt = now;

  if (state.failedAttempts < MAX_FAILED_ATTEMPTS) {
    return {
      locked: false,
      remainingAttempts: MAX_FAILED_ATTEMPTS - state.failedAttempts,
      lockoutSeconds: 0,
    };
  }

  const lockoutSeconds =
    LOCKOUT_DURATIONS_SECONDS[
      Math.min(state.escalationLevel, LOCKOUT_DURATIONS_SECONDS.length - 1)
    ];

  state.failedAttempts = 0;
  state.escalationLevel = Math.min(
    state.escalationLevel + 1,
    LOCKOUT_DURATIONS_SECONDS.length - 1,
  );
  state.lockedUntil = now + lockoutSeconds * 1000;

  return { locked: true, remainingAttempts: 0, lockoutSeconds };
}

export function recordSuccessfulLogin(req: Request): void {
  loginAttempts.delete(getClientKey(req));
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.session?.isAdmin === true) {
    return next();
  }

  res.status(401).json({ message: "Απαιτείται σύνδεση διαχειριστή." });
}

export function codesMatch(providedCode: string, storedCode: string): boolean {
  const providedDigest = createHash("sha256").update(providedCode).digest();
  const storedDigest = createHash("sha256").update(storedCode).digest();
  return timingSafeEqual(providedDigest, storedDigest);
}

export function resetLoginAttemptsForTests(): void {
  loginAttempts.clear();
}