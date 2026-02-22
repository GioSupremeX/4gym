import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Articles
  app.get(api.articles.list.path, async (req, res) => {
    const allArticles = await storage.getArticles();
    res.json(allArticles);
  });

  app.get(api.articles.get.path, async (req, res) => {
    const article = await storage.getArticle(Number(req.params.id));
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.json(article);
  });

  app.post(api.articles.create.path, async (req, res) => {
    try {
      const input = api.articles.create.input.parse(req.body);
      const article = await storage.createArticle(input);
      res.status(201).json(article);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.articles.update.path, async (req, res) => {
    try {
      const input = api.articles.update.input.parse(req.body);
      const article = await storage.updateArticle(Number(req.params.id), input);
      if (!article) return res.status(404).json({ message: "Article not found" });
      res.json(article);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.articles.delete.path, async (req, res) => {
    const success = await storage.deleteArticle(Number(req.params.id));
    if (!success) return res.status(404).json({ message: "Article not found" });
    res.status(204).end();
  });

  // Settings
  app.get(api.settings.get.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.patch(api.settings.update.path, async (req, res) => {
    try {
      const input = api.settings.update.input.parse(req.body);
      const settings = await storage.updateSettings(input);
      res.json(settings);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed the database
  seedDatabase().catch(console.error);

  return httpServer;
}

async function seedDatabase() {
  const existingArticles = await storage.getArticles();
  if (existingArticles.length === 0) {
    const seedData = [
      {
        title: "Η Υπαπαντή στο σχολείο μας: θρησκεία, πολιτισμός, διατροφή και γαλλικές γεύσεις",
        content: "Λεπτομέρειες για τον εορτασμό της Υπαπαντής στο 4ο Γυμνάσιο Ρόδου...",
      },
      {
        title: "Το 4ο Γυμνάσιο στην 1η Μαθητική συνάντηση για την Ελληνική Γλώσσα -Εορτασμός Παγκόσμιας Ημέρας Ελληνικής Γλώσσας",
        content: "Οι μαθητές μας συμμετείχαν ενεργά...",
      },
      {
        title: "Εορτασμός Παγκόσμιας ημέρας ελληνικής γλώσσας",
        content: "Μια μέρα αφιερωμένη στην πλούσια γλώσσα μας...",
      },
      {
        title: "Μαθαίνοντας με γρίφους",
        content: "Ένα πρωτοποριακό πρόγραμμα εκμάθησης...",
      },
      {
        title: "Επιτυχής υλοποίηση του Εργαστηρίου Επαγγελματικού Προσανατολισμού STEM «GO 4 MINT» στο 4ο Γυμνάσιο Ρόδου.",
        content: "Μεγάλη επιτυχία σημείωσε το εργαστήριο...",
      }
    ];

    for (const article of seedData) {
      await storage.createArticle(article);
    }
    console.log("Database seeded with sample articles.");
  }

  // Ensure settings exist
  await storage.getSettings();
}
