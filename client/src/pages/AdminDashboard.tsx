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
import { Loader2, Plus, Trash2, Edit2, Settings, Newspaper, ArrowLeft, Image as ImageIcon, Link as LinkIcon, FileText } from "lucide-react";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { data: articles, isLoading: articlesLoading } = useArticles();

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
    <div className="min-h-screen bg-muted/30 p-4 sm:p-8 font-body">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2 font-display text-primary">
            <Settings className="h-8 w-8" />
            Διαχείριση Ιστοσελίδας
          </h1>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Επιστροφή στην Αρχική
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Γενικές Ρυθμίσεις</TabsTrigger>
            <TabsTrigger value="pages">Περιεχόμενο Σελίδων</TabsTrigger>
            <TabsTrigger value="articles">Άρθρα</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="border-2 border-primary/10 shadow-lg">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="flex items-center gap-2 text-primary font-display">
                  <Settings className="h-5 w-5" /> Γενικές Ρυθμίσεις
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    updateSettings.mutate(Object.fromEntries(formData));
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Όνομα Σχολείου</label>
                      <Input name="schoolName" defaultValue={settings?.schoolName} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">URL Λογοτύπου</label>
                      <Input name="logoUrl" defaultValue={settings?.logoUrl || ""} placeholder="https://..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">URL Hero Image</label>
                    <Input name="heroImageUrl" defaultValue={settings?.heroImageUrl || ""} placeholder="https://..." />
                  </div>
                  
                  <Separator className="my-6" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" /> Σύνδεσμοι Footer
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Label {i}</label>
                          <Input name={`footerLink${i}Label`} defaultValue={(settings as any)?.[`footerLink${i}Label`]} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">URL {i}</label>
                          <Input name={`footerLink${i}Url`} defaultValue={(settings as any)?.[`footerLink${i}Url`]} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button type="submit" className="w-full mt-6" disabled={updateSettings.isPending}>
                    {updateSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Αποθήκευση Γενικών Ρυθμίσεων
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages">
            <Card className="border-2 border-primary/10 shadow-lg">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="flex items-center gap-2 text-primary font-display">
                  <FileText className="h-5 w-5" /> Περιεχόμενο Σελίδων
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    updateSettings.mutate(Object.fromEntries(formData));
                  }}
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-primary">Το σχολείο μας</label>
                      <Textarea name="aboutPageContent" defaultValue={settings?.aboutPageContent} rows={4} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-primary">Μαθητές</label>
                      <Textarea name="studentsPageContent" defaultValue={settings?.studentsPageContent} rows={4} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-primary">Δραστηριότητες</label>
                      <Textarea name="activitiesPageContent" defaultValue={settings?.activitiesPageContent} rows={4} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-primary">Ανακοινώσεις</label>
                      <Textarea name="announcementsPageContent" defaultValue={settings?.announcementsPageContent} rows={4} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-primary">Επικοινωνία</label>
                      <Textarea name="contactPageContent" defaultValue={settings?.contactPageContent} rows={4} />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={updateSettings.isPending}>
                    {updateSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Αποθήκευση Περιεχομένου Σελίδων
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="articles">
            <Card className="border-2 border-primary/10 shadow-lg">
              <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-primary font-display">
                  <Newspaper className="h-5 w-5" /> Διαχείριση Άρθρων
                </CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="shadow-md">
                      <Plus className="h-4 w-4 mr-1" /> Νέο Άρθρο
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="font-body">
                    <DialogHeader>
                      <DialogTitle className="font-display text-primary">Δημιουργία Άρθρου</DialogTitle>
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
                        <label className="text-sm font-bold uppercase tracking-wider">Τίτλος</label>
                        <Input name="title" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider">URL Εικόνας</label>
                        <Input name="imageUrl" placeholder="https://..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider">Περιεχόμενο</label>
                        <Textarea name="content" required rows={6} />
                      </div>
                      <Button type="submit" className="w-full" disabled={createArticle.isPending}>
                        Δημοσίευση Άρθρου
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {articles?.map((article) => (
                    <div key={article.id} className="flex items-center justify-between p-4 border rounded-xl bg-background hover:border-primary/20 transition-colors shadow-sm">
                      <div className="flex items-center gap-4 truncate mr-4">
                        {article.imageUrl ? (
                          <img src={article.imageUrl} className="h-12 w-12 object-cover rounded-lg border border-primary/10 shadow-sm" alt="" />
                        ) : (
                          <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center border border-border">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="truncate">
                          <h4 className="font-bold truncate text-foreground">{article.title}</h4>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {new Date(article.publishedAt).toLocaleDateString("el-GR")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                          onClick={() => {
                            if (confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το άρθρο;")) {
                              deleteArticle.mutate(article.id);
                            }
                          }}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {articles?.length === 0 && (
                    <div className="text-center py-12 bg-muted/20 rounded-xl border-2 border-dashed border-border">
                      <Newspaper className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground font-medium">Δεν υπάρχουν άρθρα ακόμα.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
