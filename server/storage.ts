import { articles, siteSettings, announcements, comments, reportedComments, type Article, type InsertArticle, type SiteSettings, type UpdateSiteSettings, type Announcement, type InsertAnnouncement, type Comment, type InsertComment, type ReportedComment, type InsertReport } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Articles
  getArticles(): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article>;
  deleteArticle(id: number): Promise<void>;

  // Announcements
  getAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(ann: InsertAnnouncement): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<void>;

  // Settings
  getSettings(): Promise<SiteSettings>;
  updateSettings(settings: UpdateSiteSettings): Promise<SiteSettings>;

  // Comments
  getCommentsByArticle(articleId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<void>;

  // Reports
  getReportedComments(): Promise<(ReportedComment & { comment: Comment })[]>;
  reportComment(report: InsertReport): Promise<ReportedComment>;
  deleteReport(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getArticles(): Promise<Article[]> {
    return await db.select().from(articles).orderBy(desc(articles.publishedAt));
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const [article] = await db.insert(articles).values({
      ...insertArticle,
      category: insertArticle.category || "general"
    }).returning();
    return article;
  }

  async updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article> {
    const [updated] = await db.update(articles).set(article).where(eq(articles.id, id)).returning();
    return updated;
  }

  async deleteArticle(id: number): Promise<void> {
    await db.delete(articles).where(eq(articles.id, id));
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).orderBy(desc(announcements.publishedAt));
  }

  async createAnnouncement(ann: InsertAnnouncement): Promise<Announcement> {
    const [created] = await db.insert(announcements).values(ann).returning();
    return created;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  async getSettings(): Promise<SiteSettings> {
    let [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
    if (!settings) {
      [settings] = await db.insert(siteSettings).values({ id: 1 }).returning();
    }
    return settings;
  }

  async updateSettings(update: UpdateSiteSettings): Promise<SiteSettings> {
    let [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
    if (!settings) {
      [settings] = await db.insert(siteSettings).values({ id: 1, ...update }).returning();
    } else {
      [settings] = await db.update(siteSettings).set(update).where(eq(siteSettings.id, 1)).returning();
    }
    return settings;
  }

  async getCommentsByArticle(articleId: number): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.articleId, articleId)).orderBy(desc(comments.publishedAt));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [created] = await db.insert(comments).values(comment).returning();
    return created;
  }

  async deleteComment(id: number): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
    await db.delete(reportedComments).where(eq(reportedComments.commentId, id));
  }

  async getReportedComments(): Promise<(ReportedComment & { comment: Comment })[]> {
    const reported = await db.select().from(reportedComments).orderBy(desc(reportedComments.reportedAt));
    return Promise.all(reported.map(async (r) => {
      const [comment] = await db.select().from(comments).where(eq(comments.id, r.commentId));
      return { ...r, comment };
    }));
  }

  async reportComment(report: InsertReport): Promise<ReportedComment> {
    const [created] = await db.insert(reportedComments).values(report).returning();
    return created;
  }

  async deleteReport(id: number): Promise<void> {
    await db.delete(reportedComments).where(eq(reportedComments.id, id));
  }
}

export const storage = new DatabaseStorage();
