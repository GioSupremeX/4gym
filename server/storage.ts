import { articles, siteSettings, announcements, comments, reportedComments, subscribers, contacts, adminUsers, adminLoginAttempts, adminAuditLogs, type Article, type InsertArticle, type SiteSettings, type UpdateSiteSettings, type Announcement, type InsertAnnouncement, type Comment, type InsertComment, type ReportedComment, type InsertReport, type Subscriber, type InsertSubscriber, type Contact, type InsertContact, type AdminUser, type InsertAdminUser, type AdminLoginAttempt, type AdminAuditLog } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, lt } from "drizzle-orm";

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

  // Admin accounts and security
  getAdminUsers(): Promise<AdminUser[]>;
  getAdminUserById(id: number): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  updateAdminUser(id: number, update: Partial<InsertAdminUser>): Promise<AdminUser | undefined>;
  deleteAdminUser(id: number): Promise<void>;
  getLoginAttempt(key: string): Promise<AdminLoginAttempt | undefined>;
  saveLoginAttempt(key: string, update: {
    failedAttempts?: number;
    escalationLevel?: number;
    lockedUntil?: Date | null;
    lastFailureAt?: Date;
  }): Promise<AdminLoginAttempt>;
  deleteLoginAttempt(key: string): Promise<void>;
  createAuditLog(log: {
    adminUserId?: number | null;
    username: string;
    action: string;
    ipAddress: string;
    details?: string;
  }): Promise<AdminAuditLog>;

  // Comments
  getCommentsByArticle(articleId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<void>;

  // Reports
  getReportedComments(): Promise<(ReportedComment & { comment: Comment })[]>;
  reportComment(report: InsertReport): Promise<ReportedComment>;
  deleteReport(id: number): Promise<void>;

  // Subscribers
  getSubscribers(): Promise<Subscriber[]>;
  createSubscriber(sub: InsertSubscriber): Promise<Subscriber>;
  deleteSubscriber(id: number): Promise<void>;

  // Contact Messages
  getContacts(): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  deleteContact(id: number): Promise<void>;
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

  async updateAnnouncement(id: number, update: Partial<InsertAnnouncement>): Promise<Announcement | undefined> {
    const [updated] = await db.update(announcements).set(update).where(eq(announcements.id, id)).returning();
    return updated;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  async getSettings(): Promise<SiteSettings> {
    let [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
    if (!settings) {
      [settings] = await db.insert(siteSettings).values({ id: 1 }).returning();
    }
    // Merge defaults for any new columns that may be undefined on existing rows
    const defaults = {
      messagesEnabled: "true",
      subscribeEnabled: "true",
      creditsEnabled: "true",
      commentCooldown: "60",
      messageCooldown: "60",
      subscribeCooldown: "300",
    };
    return { ...defaults, ...settings } as SiteSettings;
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

  async getAdminUsers(): Promise<AdminUser[]> {
    return await db.select().from(adminUsers).orderBy(adminUsers.username);
  }

  async getAdminUserById(id: number): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return user;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return user;
  }

  async createAdminUser(user: InsertAdminUser): Promise<AdminUser> {
    const [created] = await db.insert(adminUsers).values(user).returning();
    return created;
  }

  async updateAdminUser(id: number, update: Partial<InsertAdminUser>): Promise<AdminUser | undefined> {
    const [updated] = await db.update(adminUsers).set(update).where(eq(adminUsers.id, id)).returning();
    return updated;
  }

  async deleteAdminUser(id: number): Promise<void> {
    await db.delete(adminUsers).where(eq(adminUsers.id, id));
  }

  async getLoginAttempt(key: string): Promise<AdminLoginAttempt | undefined> {
    const [attempt] = await db.select().from(adminLoginAttempts).where(eq(adminLoginAttempts.attemptKey, key));
    return attempt;
  }

  async saveLoginAttempt(
    key: string,
    update: {
      failedAttempts?: number;
      escalationLevel?: number;
      lockedUntil?: Date | null;
      lastFailureAt?: Date;
    },
  ): Promise<AdminLoginAttempt> {
    const [saved] = await db
      .insert(adminLoginAttempts)
      .values({ attemptKey: key, ...update })
      .onConflictDoUpdate({ target: adminLoginAttempts.attemptKey, set: update })
      .returning();
    return saved;
  }

  async deleteLoginAttempt(key: string): Promise<void> {
    await db.delete(adminLoginAttempts).where(eq(adminLoginAttempts.attemptKey, key));
  }

  async createAuditLog(log: {
    adminUserId?: number | null;
    username: string;
    action: string;
    ipAddress: string;
    details?: string;
  }): Promise<AdminAuditLog> {
    const [created] = await db.insert(adminAuditLogs).values(log).returning();
    return created;
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

  async getSubscribers(): Promise<Subscriber[]> {
    return await db.select().from(subscribers).orderBy(desc(subscribers.createdAt));
  }

  async createSubscriber(sub: InsertSubscriber): Promise<Subscriber> {
    const [created] = await db.insert(subscribers).values(sub).returning();
    return created;
  }

  async deleteSubscriber(id: number): Promise<void> {
    await db.delete(subscribers).where(eq(subscribers.id, id));
  }

  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const [created] = await db.insert(contacts).values(contact).returning();
    return created;
  }

  async deleteContact(id: number): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }
}

export const storage = new DatabaseStorage();
