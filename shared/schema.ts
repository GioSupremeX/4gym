import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  imageUrls: text("image_urls").array().default([]),
  category: text("category").notNull().default("general"), // 'general', 'teachers', 'operation', 'evaluation'
  publishedAt: timestamp("published_at").defaultNow().notNull(),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  schoolName: text("school_name").notNull().default("4ο ΓΥΜΝΑΣΙΟ ΡΟΔΟΥ – ΚΑΖΟΥΛΛΕΙΟ"),
  adminCode: text("admin_code").notNull().default("1234"),
  aboutTitle: text("about_title").notNull().default("Καλώς Ήρθατε Στο 4ο Γυμνάσιο Ρόδου - Καζούλλειο"),
  aboutText: text("about_text").notNull().default("Το 4ο Γυμνάσιο Ρόδου – Καζούλλειο αποτελεί έναν χώρο μάθησης, δημιουργίας και συνεργασίας. Στόχος μας είναι η ολόπλευρη ανάπτυξη των μαθητών μας, μέσα από τη γνώση, τον σεβασμό και τη συμμετοχή στη σχολική ζωή."),
  logoUrl: text("logo_url"),
  heroImageUrl: text("hero_image_url"),
  // Footer Links
  footerLink1Label: text("footer_link_1_label").notNull().default("Υπουργείο Παιδείας"),
  footerLink1Url: text("footer_link_1_url").notNull().default("https://www.minedu.gov.gr/"),
  footerLink2Label: text("footer_link_2_label").notNull().default("Διεύθυνση Δευτεροβάθμιας"),
  footerLink2Url: text("footer_link_2_url").notNull().default("#"),
  footerLink3Label: text("footer_link_3_label").notNull().default("Περιφερειακή Διεύθυνση"),
  footerLink3Url: text("footer_link_3_url").notNull().default("#"),
  // Page Content
  aboutPageContent: text("about_page_content").notNull().default("Το 4ο Γυμνάσιο Ρόδου - Καζούλλειο έχει μια μακρά ιστορία εκπαιδευτικής προσφοράς στην τοπική κοινωνία της Ρόδου."),
  studentsPageContent: text("students_page_content").notNull().default("Εδώ μπορείτε να βρείτε πληροφορίες για τις μαθητικές κοινότητες, το ωρολόγιο πρόγραμμα και άλλες χρήσιμες ανακοινώσεις για τους μαθητές μας."),
  activitiesPageContent: text("activities_page_content").notNull().default("Το σχολείο μας συμμετέχει σε πλήθος εκπαιδευτικών προγραμμάτων, αθλητικών δραστηριοτήτων και πολιτιστικών εκδηλώσεων."),
  announcementsPageContent: text("announcements_page_content").notNull().default("Μείνετε ενημερωμένοι για όλες τις τελευταίες ανακοινώσεις, εγγραφές και εκδηλώσεις του σχολείου μας."),
  contactPageContent: text("contact_page_content").notNull().default("Μπορείτε να επικοινωνήσετε μαζί μας τηλεφωνικά, μέσω email ή να μας επισκεφθείτε στον χώρο του σχολείου."),
  // School Stats
  stats1Number: text("stats_1_number").notNull().default("60+"),
  stats1Label: text("stats_1_label").notNull().default("Χρόνια Ιστορίας"),
  stats2Number: text("stats_2_number").notNull().default("300+"),
  stats2Label: text("stats_2_label").notNull().default("Μαθητές"),
  stats3Number: text("stats_3_number").notNull().default("35+"),
  stats3Label: text("stats_3_label").notNull().default("Εκπαιδευτικοί"),
  // Magazine Section
  magazineTitle: text("magazine_title").notNull().default("Το Περιοδικό Μας"),
  magazineImageUrl: text("magazine_image_url").notNull().default("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80"),
  magazineButtonLabel: text("magazine_button_label").notNull().default("Διαβάστε το Τεύχος"),
  magazineButtonUrl: text("magazine_button_url").notNull().default("#"),
});

export const insertArticleSchema = createInsertSchema(articles).omit({ id: true, publishedAt: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, publishedAt: true });
export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({ id: true });

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type UpdateSiteSettings = Partial<InsertSiteSettings>;
