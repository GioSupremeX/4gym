import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import express from "express";
import session from "express-session";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import type { AdminUser, SiteSettings } from "@shared/schema";

// Keep this integration test independent of a provisioned database. Routes
// still run normally; only their storage adapter is replaced in memory.
process.env.DATABASE_URL = "postgresql://unused:unused@127.0.0.1:1/unused";
process.env.SESSION_SECRET = "test-only-session-secret-for-auth-tests";

type StorageOverrides = Record<string, (...args: any[]) => any>;
type TestClient = { cookie?: string };

let server: Server;
let baseUrl: string;
let cleanupStorage: (() => void) | undefined;
let closeDatabasePool: (() => Promise<void>) | undefined;
let auth: typeof import("./auth");
let routeModule: typeof import("./routes");
let storageModule: typeof import("./storage");
let settings: SiteSettings;
let users: Map<number, AdminUser>;
let loginAttempts: Map<string, any>;

const originalOverrides = new Map<string, unknown>();

function makeUser(id: number, username: string, role: string, passwordHash: string): AdminUser {
  return {
    id,
    username,
    role,
    active: "true",
    passwordHash,
    twoFactorSecret: null,
    twoFactorEnabled: "false",
    twoFactorRecoveryCodes: [],
    authVersion: 1,
    createdAt: new Date(),
    lastLoginAt: null,
  };
}

function installStorageOverrides(overrides: StorageOverrides): void {
  const mutableStorage = storageModule.storage as unknown as Record<string, unknown>;
  for (const [name, implementation] of Object.entries(overrides)) {
    if (!originalOverrides.has(name)) {
      originalOverrides.set(name, Object.hasOwn(mutableStorage, name) ? mutableStorage[name] : undefined);
    }
    mutableStorage[name] = implementation;
  }
  cleanupStorage = () => {
    for (const [name, original] of originalOverrides) {
      if (original === undefined) delete mutableStorage[name];
      else mutableStorage[name] = original;
    }
    originalOverrides.clear();
  };
}

async function request(
  client: TestClient,
  path: string,
  method = "GET",
  body?: unknown,
): Promise<{ response: Response; data: any }> {
  const headers: Record<string, string> = {};
  if (client.cookie) headers.cookie = client.cookie;
  if (body !== undefined) {
    headers["content-type"] = "application/json";
    headers.origin = baseUrl;
  }
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) client.cookie = setCookie.split(";")[0];
  return {
    response,
    data: response.status === 204 ? undefined : await response.json(),
  };
}

async function login(username: string, passcode: string): Promise<TestClient> {
  const client: TestClient = {};
  const { response, data } = await request(client, "/api/admin/login", "POST", { username, passcode });
  assert.equal(response.status, 200, `login for ${username} should succeed`);
  return client;
}

before(async () => {
  auth = await import("./auth");
  routeModule = await import("./routes");
  storageModule = await import("./storage");
  const { pool } = await import("./db");
  closeDatabasePool = () => pool.end();

  settings = {
    id: 1,
    schoolName: "Test",
    adminCode: "unused",
    aboutTitle: "",
    aboutText: "",
    logoUrl: null,
    heroImageUrl: null,
    footerLink1Label: "",
    footerLink1Url: "",
    footerLink2Label: "",
    footerLink2Url: "",
    footerLink3Label: "",
    footerLink3Url: "",
    footerAddress: "",
    footerPhone: "",
    footerEmail: "",
    footerDescription: "",
    aboutPageContent: "",
    studentsPageContent: "",
    activitiesPageContent: "",
    announcementsPageContent: "",
    contactPageContent: "",
    stats1Number: "",
    stats1Label: "",
    stats2Number: "",
    stats2Label: "",
    stats3Number: "",
    stats3Label: "",
    magazineTitle: "",
    magazineImageUrl: "",
    magazineButtonLabel: "",
    magazineButtonUrl: "",
    magazineEnabled: "true",
    commentsEnabled: "true",
    messagesEnabled: "true",
    subscribeEnabled: "true",
    creditsEnabled: "true",
    commentCooldown: "60",
    messageCooldown: "60",
    subscribeCooldown: "300",
  };

  const passwordHash = await auth.hashPassword("Initial-Test-Password-123!");
  users = new Map([
    [1, makeUser(1, "administrator", "owner", passwordHash)],
    [2, makeUser(2, "testadmin", "admin", passwordHash)],
    [3, makeUser(3, "testeditor", "editor", passwordHash)],
    [4, makeUser(4, "testmoderator", "moderator", passwordHash)],
  ]);
  loginAttempts = new Map();

  installStorageOverrides({
    getSettings: async () => ({ ...settings }),
    updateSettings: async (update: Partial<SiteSettings>) => {
      settings = { ...settings, ...update };
      return { ...settings };
    },
    getAdminUsers: async () => [...users.values()],
    getAdminUserById: async (id: number) => users.get(id),
    getAdminUserByUsername: async (username: string) =>
      [...users.values()].find((user) => user.username === username),
    updateAdminUser: async (id: number, update: Partial<AdminUser>) => {
      const user = users.get(id);
      if (!user) return undefined;
      const updated = { ...user, ...update };
      users.set(id, updated);
      return updated;
    },
    createAdminUser: async (input: Partial<AdminUser>) => {
      const id = Math.max(...users.keys()) + 1;
      const created = {
        ...makeUser(id, input.username!, input.role || "editor", input.passwordHash!),
        ...input,
        id,
      } as AdminUser;
      users.set(id, created);
      return created;
    },
    getLoginAttempt: async (key: string) => loginAttempts.get(key),
    saveLoginAttempt: async (key: string, update: Record<string, unknown>) => {
      const previous = loginAttempts.get(key);
      const saved = {
        attemptKey: key,
        failedAttempts: 0,
        escalationLevel: 0,
        lockedUntil: null,
        lastFailureAt: new Date(),
        ...previous,
        ...update,
      };
      loginAttempts.set(key, saved);
      return saved;
    },
    deleteLoginAttempt: async (key: string) => {
      loginAttempts.delete(key);
    },
    createAuditLog: async () => undefined,
    createArticle: async (article: Record<string, unknown>) => ({
      id: 1,
      ...article,
      publishedAt: new Date(),
    }),
    getReportedComments: async () => [],
  });

  const app = express();
  app.use(express.json());
  app.use(
    session({
      secret: "test-only-session-secret-for-auth-tests",
      resave: false,
      saveUninitialized: false,
    }),
  );
  server = createServer(app);
  await routeModule.registerRoutes(server, app);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  cleanupStorage?.();
  if (server?.listening) {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
  await closeDatabasePool?.();
});

test("owner 2FA enrollment, enforcement, login, and role permissions", async () => {
  const owner = await login("administrator", "Initial-Test-Password-123!");
  const olderOwnerSession = await login("administrator", "Initial-Test-Password-123!");

  // Enrollment starts by storing a secret but does not enable the 2FA gate.
  const setup = await request(owner, "/api/admin/2fa/setup");
  assert.equal(setup.response.status, 200);
  assert.equal(users.get(1)?.twoFactorEnabled, "false");
  assert.equal(setup.data.recoveryCodes.length, 8);

  const enrollmentCredits = await request(owner, "/api/admin/credits", "PATCH", {
    creditsEnabled: "false",
  });
  assert.equal(enrollmentCredits.response.status, 200, "credits remain available during enrollment");
  const enrollmentAccounts = await request(owner, "/api/admin/users");
  assert.equal(enrollmentAccounts.response.status, 200, "account controls remain available during enrollment");
  const enrollmentPassword = await request(owner, "/api/admin/account/password", "POST", {
    currentPassword: "Initial-Test-Password-123!",
    newPassword: "Updated-Test-Password-456!",
  });
  assert.equal(enrollmentPassword.response.status, 200, "password controls remain available during enrollment");

  // This password-only session is created before 2FA is confirmed and remains
  // valid for the updated auth version, but must not inherit the verified flag.
  const unverifiedOwner = await login("administrator", "Updated-Test-Password-456!");
  const confirmation = await request(owner, "/api/admin/2fa/confirm", "POST", {
    code: auth.generateTotpCode(setup.data.secret),
  });
  assert.equal(confirmation.response.status, 200);
  assert.equal(users.get(1)?.twoFactorEnabled, "true");

  const deniedCredits = await request(unverifiedOwner, "/api/admin/credits", "PATCH", {
    creditsEnabled: "true",
  });
  assert.equal(deniedCredits.response.status, 403);
  assert.equal(deniedCredits.data.code, "OWNER_2FA_REQUIRED");
  assert.equal((await request(unverifiedOwner, "/api/admin/users")).response.status, 403);
  const deniedPassword = await request(unverifiedOwner, "/api/admin/account/password", "POST", {
    currentPassword: "Updated-Test-Password-456!",
    newPassword: "Another-Test-Password-789!",
  });
  assert.equal(deniedPassword.response.status, 403);

  // The session that completed enrollment is verified and keeps access.
  assert.equal(
    (await request(owner, "/api/admin/credits", "PATCH", { creditsEnabled: "true" })).response.status,
    200,
  );
  assert.equal((await request(owner, "/api/admin/users")).response.status, 200);

  const totpLogin = await login("administrator", "Updated-Test-Password-456!");
  const pendingTotpSession = await request(totpLogin, "/api/admin/session");
  assert.equal(pendingTotpSession.data.requiresTwoFactor, true);
  const totpVerification = await request(totpLogin, "/api/admin/verify-2fa", "POST", {
    code: auth.generateTotpCode(setup.data.secret),
  });
  assert.equal(totpVerification.response.status, 200, "a valid TOTP code completes login");
  assert.equal(
    (await request(totpLogin, "/api/admin/credits", "PATCH", { creditsEnabled: "false" })).response.status,
    200,
  );

  const recoveryLogin = await login("administrator", "Updated-Test-Password-456!");
  const pendingRecoverySession = await request(recoveryLogin, "/api/admin/session");
  assert.equal(pendingRecoverySession.data.requiresTwoFactor, true);
  const recoveryCode = setup.data.recoveryCodes[0] as string;
  const recoveryVerification = await request(recoveryLogin, "/api/admin/verify-2fa", "POST", {
    code: recoveryCode,
  });
  assert.equal(recoveryVerification.response.status, 200, "a valid recovery code completes login");
  assert.equal(
    users.get(1)?.twoFactorRecoveryCodes?.length,
    7,
    "a successful recovery login consumes exactly one code",
  );

  const invalidRecoveryLogin = await login("administrator", "Updated-Test-Password-456!");
  const invalidRecovery = await request(invalidRecoveryLogin, "/api/admin/verify-2fa", "POST", {
    code: "not-a-valid-recovery-code",
  });
  assert.equal(invalidRecovery.response.status, 401, "an unknown recovery code is rejected");
  const reusedRecovery = await request(invalidRecoveryLogin, "/api/admin/verify-2fa", "POST", {
    code: recoveryCode,
  });
  assert.equal(reusedRecovery.response.status, 401, "a consumed recovery code cannot be reused");

  const admin = await login("testadmin", "Initial-Test-Password-123!");
  const editor = await login("testeditor", "Initial-Test-Password-123!");
  const moderator = await login("testmoderator", "Initial-Test-Password-123!");

  assert.equal((await request(admin, "/api/admin/users")).response.status, 200);
  assert.equal((await request(editor, "/api/admin/users")).response.status, 403);
  assert.equal((await request(moderator, "/api/admin/users")).response.status, 403);

  const article = { title: "Permission test", content: "Test content", category: "general" };
  assert.equal((await request(admin, "/api/articles", "POST", article)).response.status, 200);
  assert.equal((await request(editor, "/api/articles", "POST", article)).response.status, 200);
  assert.equal((await request(moderator, "/api/articles", "POST", article)).response.status, 403);

  assert.equal((await request(admin, "/api/comments/reports")).response.status, 200);
  assert.equal((await request(moderator, "/api/comments/reports")).response.status, 200);
  assert.equal((await request(editor, "/api/comments/reports")).response.status, 403);

  // Confirm the session started before setup was revoked by the password change,
  // rather than accidentally treating that revocation as a 2FA denial.
  const oldSession = await request(olderOwnerSession, "/api/admin/credits", "PATCH", {
    creditsEnabled: "true",
  });
  assert.equal(oldSession.response.status, 401);
});
