import { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArticleSchema, insertSiteSettingsSchema, insertAnnouncementSchema, insertCommentSchema, insertReportSchema, insertSubscriberSchema, insertContactSchema } from "@shared/schema";
import { api } from "@shared/routes";
import { codesMatch, getLoginLockout, recordFailedLogin, recordSuccessfulLogin, requireAdmin } from "./auth";

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

export async function registerRoutes(server: Server, app: Express): Promise<void> {
  // Verify the passcode on the server and keep authentication in an HttpOnly
  // session. The browser never receives the stored passcode.
  app.get("/api/admin/session", (req: Request, res: Response) => {
    res.json({ authenticated: req.session?.isAdmin === true });
  });

  app.post("/api/admin/login", async (req: Request, res: Response) => {
    const lockedFor = getLoginLockout(req);
    if (lockedFor > 0) {
      res.setHeader("Retry-After", lockedFor);
      return res.status(429).json({
        message: `Πολλές αποτυχημένες προσπάθειες. Δοκιμάστε ξανά σε ${lockedFor} δευτερόλεπτα.`,
        remainingSeconds: lockedFor,
      });
    }

    if (typeof req.body?.passcode !== "string" || req.body.passcode.length > 256) {
      return res.status(400).json({ message: "Ο κωδικός δεν είναι έγκυρος." });
    }

    const settings = await storage.getSettings();
    if (!codesMatch(req.body.passcode, settings.adminCode)) {
      const result = recordFailedLogin(req);

      if (result.locked) {
        res.setHeader("Retry-After", result.lockoutSeconds);
        return res.status(429).json({
          message: `Πολλές αποτυχημένες προσπάθειες. Η πρόσβαση κλειδώθηκε για ${result.lockoutSeconds} δευτερόλεπτα.`,
          remainingSeconds: result.lockoutSeconds,
        });
      }

      return res.status(401).json({
        message: "Λάθος κωδικός.",
        attemptsRemaining: result.remainingAttempts,
      });
    }

    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((error) => (error ? reject(error) : resolve()));
    });
    req.session.isAdmin = true;
    await new Promise<void>((resolve, reject) => {
      req.session.save((error) => (error ? reject(error) : resolve()));
    });
    recordSuccessfulLogin(req);

    res.json({ authenticated: true });
  });

  app.post("/api/admin/logout", requireAdmin, (req: Request, res: Response) => {
    req.session.destroy((error) => {
      if (error) {
        return res.status(500).json({ message: "Αποτυχία αποσύνδεσης." });
      }
      res.clearCookie("connect.sid");
      res.status(204).end();
    });
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

  app.post(api.articles.create.path, requireAdmin, async (req: Request, res: Response) => {
    const parsed = insertArticleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const article = await storage.createArticle(parsed.data);
    res.json(article);
  });

  app.patch(api.articles.update.path, requireAdmin, async (req: Request, res: Response) => {
    const parsed = insertArticleSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const article = await storage.updateArticle(Number(req.params.id), parsed.data);
    res.json(article);
  });

  app.delete(api.articles.delete.path, requireAdmin, async (req: Request, res: Response) => {
    await storage.deleteArticle(Number(req.params.id));
    res.status(204).end();
  });

  // Announcements
  app.get("/api/announcements", async (_req: Request, res: Response) => {
    const announcementsList = await storage.getAnnouncements();
    res.json(announcementsList);
  });

  app.post("/api/announcements", requireAdmin, async (req: Request, res: Response) => {
    const parsed = insertAnnouncementSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const announcement = await storage.createAnnouncement(parsed.data);
    res.json(announcement);
  });

  app.delete("/api/announcements/:id", requireAdmin, async (req: Request, res: Response) => {
    await storage.deleteAnnouncement(Number(req.params.id));
    res.status(204).end();
  });

  // Settings
  app.get(api.settings.get.path, async (_req: Request, res: Response) => {
    const settings = await storage.getSettings();
    res.json(publicSettings(settings));
  });

  app.patch(api.settings.update.path, requireAdmin, async (req: Request, res: Response) => {
    const parsed = insertSiteSettingsSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const update = { ...parsed.data };
    if (update.adminCode !== undefined) {
      const trimmedAdminCode = update.adminCode.trim();
      if (trimmedAdminCode.length === 0) {
        delete update.adminCode;
      } else if (trimmedAdminCode.length < 4 || trimmedAdminCode.length > 256) {
        return res.status(400).json({ message: "Ο κωδικός πρέπει να έχει 4 έως 256 χαρακτήρες." });
      } else {
        update.adminCode = trimmedAdminCode;
      }
    }
    const settings = await storage.updateSettings(update);
    res.json(publicSettings(settings));
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
    const parsed = insertCommentSchema.safeParse({ ...req.body, articleId: Number(req.params.id) });
    if (!parsed.success) return res.status(400).json(parsed.error);
    const comment = await storage.createComment(parsed.data);
    res.json(comment);
  });

  app.delete("/api/comments/:id", requireAdmin, async (req: Request, res: Response) => {
    await storage.deleteComment(Number(req.params.id));
    res.status(204).end();
  });

  // Reports
  app.get("/api/comments/reports", requireAdmin, async (_req: Request, res: Response) => {
    const reports = await storage.getReportedComments();
    res.json(reports);
  });

  app.post("/api/comments/:id/report", async (req: Request, res: Response) => {
    const parsed = insertReportSchema.safeParse({ ...req.body, commentId: Number(req.params.id) });
    if (!parsed.success) return res.status(400).json(parsed.error);
    const report = await storage.reportComment(parsed.data);
    res.json(report);
  });

  app.delete("/api/comments/reports/:id", requireAdmin, async (req: Request, res: Response) => {
    await storage.deleteReport(Number(req.params.id));
    res.status(204).end();
  });

  // Subscribers
  app.get("/api/subscribers", requireAdmin, async (_req: Request, res: Response) => {
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
    const parsed = insertSubscriberSchema.safeParse(req.body);
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

  app.delete("/api/subscribers/:id", requireAdmin, async (req: Request, res: Response) => {
    await storage.deleteSubscriber(Number(req.params.id));
    res.status(204).end();
  });

  // Contact Messages
  app.get("/api/contacts", requireAdmin, async (_req: Request, res: Response) => {
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
    const parsed = insertContactSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const msg = await storage.createContact(parsed.data);
    res.json(msg);
  });

  app.delete("/api/contacts/:id", requireAdmin, async (req: Request, res: Response) => {
    await storage.deleteContact(Number(req.params.id));
    res.status(204).end();
  });
}
