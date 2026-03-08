import { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArticleSchema, insertSiteSettingsSchema, insertAnnouncementSchema, insertCommentSchema, insertReportSchema } from "@shared/schema";
import { api } from "@shared/routes";

export async function registerRoutes(server: Server, app: Express): Promise<void> {
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

  app.post(api.articles.create.path, async (req: Request, res: Response) => {
    const parsed = insertArticleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const article = await storage.createArticle(parsed.data);
    res.json(article);
  });

  app.patch(api.articles.update.path, async (req: Request, res: Response) => {
    const parsed = insertArticleSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const article = await storage.updateArticle(Number(req.params.id), parsed.data);
    res.json(article);
  });

  app.delete(api.articles.delete.path, async (req: Request, res: Response) => {
    await storage.deleteArticle(Number(req.params.id));
    res.status(204).end();
  });

  // Announcements
  app.get("/api/announcements", async (_req: Request, res: Response) => {
    const announcementsList = await storage.getAnnouncements();
    res.json(announcementsList);
  });

  app.post("/api/announcements", async (req: Request, res: Response) => {
    const parsed = insertAnnouncementSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const announcement = await storage.createAnnouncement(parsed.data);
    res.json(announcement);
  });

  app.delete("/api/announcements/:id", async (req: Request, res: Response) => {
    await storage.deleteAnnouncement(Number(req.params.id));
    res.status(204).end();
  });

  // Settings
  app.get(api.settings.get.path, async (_req: Request, res: Response) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.patch(api.settings.update.path, async (req: Request, res: Response) => {
    const parsed = insertSiteSettingsSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const settings = await storage.updateSettings(parsed.data);
    res.json(settings);
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
    const parsed = insertCommentSchema.safeParse({ ...req.body, articleId: Number(req.params.id) });
    if (!parsed.success) return res.status(400).json(parsed.error);
    const comment = await storage.createComment(parsed.data);
    res.json(comment);
  });

  app.delete("/api/comments/:id", async (req: Request, res: Response) => {
    await storage.deleteComment(Number(req.params.id));
    res.status(204).end();
  });

  // Reports
  app.get("/api/comments/reports", async (_req: Request, res: Response) => {
    const reports = await storage.getReportedComments();
    res.json(reports);
  });

  app.post("/api/comments/:id/report", async (req: Request, res: Response) => {
    const parsed = insertReportSchema.safeParse({ ...req.body, commentId: Number(req.params.id) });
    if (!parsed.success) return res.status(400).json(parsed.error);
    const report = await storage.reportComment(parsed.data);
    res.json(report);
  });

  app.delete("/api/comments/reports/:id", async (req: Request, res: Response) => {
    await storage.deleteReport(Number(req.params.id));
    res.status(204).end();
  });
}
