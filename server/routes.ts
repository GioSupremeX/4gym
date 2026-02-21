import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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
}
