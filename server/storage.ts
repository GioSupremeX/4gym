import { articles, siteSettings, announcements, type Article, type InsertArticle, type SiteSettings, type UpdateSiteSettings, type Announcement, type InsertAnnouncement } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
