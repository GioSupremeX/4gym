import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  schoolName: text("school_name").notNull().default("4ο ΓΥΜΝΑΣΙΟ ΡΟΔΟΥ – ΚΑΖΟΥΛΛΕΙΟ"),
  aboutTitle: text("about_title").notNull().default("Καλώς Ήρθατε Στο 4ο Γυμνάσιο Ρόδου - Καζούλλειο"),
  aboutText: text("about_text").notNull().default("Το 4ο Γυμνάσιο Ρόδου – Καζούλλειο αποτελεί έναν χώρο μάθησης, δημιουργίας και συνεργασίας. Στόχος μας είναι η ολόπλευρη ανάπτυξη των μαθητών μας, μέσα από τη γνώση, τον σεβασμό και τη συμμετοχή στη σχολική ζωή."),
  logoUrl: text("logo_url"),
  heroImageUrl: text("hero_image_url"),
});

export const insertArticleSchema = createInsertSchema(articles).omit({ id: true, publishedAt: true });
export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({ id: true });

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;
export type ArticleResponse = Article;
export type ArticlesListResponse = Article[];

export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type UpdateSiteSettings = Partial<InsertSiteSettings>;
