import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { useSettings, useArticles } from "@/hooks/use-articles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Edit2, Settings, Newspaper, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { data: articles, isLoading: articlesLoading } = useArticles();

  // Settings Mutation
  const updateSettings = useMutation({
    mutationFn: async (values: any) => {
      const res = await fetch(api.settings.update.path, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.settings.get.path] });
      toast({ title: "Επιτυχία", description: "Οι ρυθμίσεις ενημερώθηκαν." });
    },
  });

  // Article Mutations
  const createArticle = useMutation({
    mutationFn: async (values: any) => {
      const res = await fetch(api.articles.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to create article");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.articles.list.path] });
      toast({ title: "Επιτυχία", description: "Το άρθρο δημοσιεύτηκε." });
    },
  });

  const deleteArticle = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(buildUrl(api.articles.delete.path, { id }), {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete article");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.articles.list.path] });
      toast({ title: "Επιτυχία", description: "Το άρθρο διαγράφηκε." });
    },
  });

  if (settingsLoading || articlesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            Διαχείριση Ιστοσελίδας
          </h1>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Επιστροφή στην Αρχική
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" /> Ρυθμίσεις Σχολείου
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  updateSettings.mutate(Object.fromEntries(formData));
                }}
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Όνομα Σχολείου</label>
                  <Input name="schoolName" defaultValue={settings?.schoolName} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Τίτλος 'Σχετικά'</label>
                  <Input name="aboutTitle" defaultValue={settings?.aboutTitle} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Κείμενο 'Σχετικά'</label>
                  <Textarea name="aboutText" defaultValue={settings?.aboutText} rows={4} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL Λογοτύπου</label>
                  <Input name="logoUrl" defaultValue={settings?.logoUrl || ""} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL Hero Image</label>
                  <Input name="heroImageUrl" defaultValue={settings?.heroImageUrl || ""} placeholder="https://..." />
                </div>
                <Button type="submit" className="w-full" disabled={updateSettings.isPending}>
                  {updateSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Αποθήκευση Ρυθμίσεων
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Articles Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5" /> Άρθρα
              </CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Νέο Άρθρο
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Δημιουργία Άρθρου</DialogTitle>
                  </DialogHeader>
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      createArticle.mutate(Object.fromEntries(formData));
                    }}
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Τίτλος</label>
                      <Input name="title" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">URL Εικόνας</label>
                      <Input name="imageUrl" placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Περιεχόμενο</label>
                      <Textarea name="content" required rows={6} />
                    </div>
                    <Button type="submit" className="w-full" disabled={createArticle.isPending}>
                      Δημοσίευση
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {articles?.map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                    <div className="flex items-center gap-3 truncate mr-4">
                      {article.imageUrl ? (
                        <img src={article.imageUrl} className="h-10 w-10 object-cover rounded" alt="" />
                      ) : (
                        <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="truncate">
                        <h4 className="font-medium truncate">{article.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(article.publishedAt).toLocaleDateString("el-GR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το άρθρο;")) {
                            deleteArticle.mutate(article.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {articles?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Δεν υπάρχουν άρθρα.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
