import { db } from "./db";
import { articles, siteSettings, type InsertArticle, type Article, type SiteSettings, type UpdateSiteSettings } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getArticles(): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
  
  getSettings(): Promise<SiteSettings>;
  updateSettings(settings: UpdateSiteSettings): Promise<SiteSettings>;
}

export class DatabaseStorage implements IStorage {
  async getArticles(): Promise<Article[]> {
    return await db.select().from(articles);
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const [article] = await db.insert(articles).values(insertArticle).returning();
    return article;
  }

  async updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined> {
    const [updated] = await db.update(articles).set(article).where(eq(articles.id, id)).returning();
    return updated;
  }

  async deleteArticle(id: number): Promise<boolean> {
    const result = await db.delete(articles).where(eq(articles.id, id)).returning();
    return result.length > 0;
  }

  async getSettings(): Promise<SiteSettings> {
    const [settings] = await db.select().from(siteSettings);
    if (!settings) {
      // Create default settings if they don't exist
      const [newSettings] = await db.insert(siteSettings).values({}).returning();
      return newSettings;
    }
    return settings;
  }

  async updateSettings(updates: UpdateSiteSettings): Promise<SiteSettings> {
    const current = await this.getSettings();
    const [updated] = await db.update(siteSettings).set(updates).where(eq(siteSettings.id, current.id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
