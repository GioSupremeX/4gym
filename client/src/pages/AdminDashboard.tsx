import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { useSettings, useArticles } from "@/hooks/use-articles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Edit2, Settings, Newspaper, ArrowLeft, Image as ImageIcon, Link as LinkIcon, FileText, BookOpen, Upload, X, Bell } from "lucide-react";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Announcement } from "@shared/schema";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { data: articles, isLoading: articlesLoading } = useArticles();
  
  // ... existing mutations ...

  if (settingsLoading) return <Loader2 className="animate-spin" />;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md shadow-2xl border-2 border-primary/10">
          <CardHeader className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-display font-bold text-primary">Control Room Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Enter Passcode</label>
              <Input 
                type="password" 
                value={passcode} 
                onChange={(e) => setPasscode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && passcode === settings?.adminCode) setIsAuthenticated(true);
                }}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={() => {
                if (passcode === settings?.adminCode) setIsAuthenticated(true);
                else toast({ title: "Σφάλμα", description: "Λάθος κωδικός.", variant: "destructive" });
              }}
            >
              Unlock
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    // ... existing return ...
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2 font-display text-primary">
            <Settings className="h-8 w-8" />
            Control Room
          </h1>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Επιστροφή στην Αρχική
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">Γενικές</TabsTrigger>
            <TabsTrigger value="pages">Σελίδες</TabsTrigger>
            <TabsTrigger value="announcements">Ανακοινώσεις</TabsTrigger>
            <TabsTrigger value="magazine">Περιοδικό</TabsTrigger>
            <TabsTrigger value="articles">Άρθρα</TabsTrigger>
          </TabsList>

          <TabsContent value="announcements">
            <Card className="border-2 border-primary/10 shadow-lg">
              <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-primary font-display">
                  <Bell className="h-5 w-5" /> Διαχείριση Ανακοινώσεων
                </CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" /> Νέα Ανακοίνωση
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="font-body">
                    <DialogHeader>
                      <DialogTitle className="font-display text-primary">Δημιουργία Ανακοίνωσης</DialogTitle>
                    </DialogHeader>
                    <form
                      className="space-y-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        createAnnouncement.mutate(Object.fromEntries(formData));
                      }}
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider">Τίτλος</label>
                        <Input name="title" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider">Περιεχόμενο</label>
                        <Textarea name="content" required rows={6} />
                      </div>
                      <Button type="submit" className="w-full" disabled={createAnnouncement.isPending}>
                        Δημοσίευση
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {announcements?.map((ann) => (
                    <div key={ann.id} className="flex items-center justify-between p-4 border rounded-xl bg-background">
                      <div>
                        <h4 className="font-bold">{ann.title}</h4>
                        <p className="text-xs text-muted-foreground uppercase">{new Date(ann.publishedAt).toLocaleDateString("el-GR")}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteAnnouncement.mutate(ann.id)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ... Other tabs remain mostly same, just ensuring they use updated settings/schema ... */}
          <TabsContent value="general">
            <Card className="border-2 border-primary/10 shadow-lg">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="flex items-center gap-2 text-primary font-display">
                  <Settings className="h-5 w-5" /> Config Site
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">URL Hero Image</label>
                      <Input name="heroImageUrl" defaultValue={settings?.heroImageUrl || ""} placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Passcode Διαχείρισης</label>
                      <Input name="adminCode" defaultValue={settings?.adminCode} placeholder="1234" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full mt-6" disabled={updateSettings.isPending}>
                    Save Config
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages">
            <Card className="border-2 border-primary/10 shadow-lg">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="flex items-center gap-2 text-primary font-display">
                  <FileText className="h-5 w-5" /> Edit Pages
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
                      <label className="text-sm font-bold uppercase tracking-wider text-primary">Ανακοινώσεις (Περιγραφή)</label>
                      <Textarea name="announcementsPageContent" defaultValue={settings?.announcementsPageContent} rows={4} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-primary">Επικοινωνία</label>
                      <Textarea name="contactPageContent" defaultValue={settings?.contactPageContent} rows={4} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={updateSettings.isPending}>
                    Save Content
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="magazine">
            <Card className="border-2 border-primary/10 shadow-lg">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="flex items-center gap-2 text-primary font-display">
                  <BookOpen className="h-5 w-5" /> Edit Περιοδικό
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
                  <Input name="magazineTitle" defaultValue={settings?.magazineTitle} placeholder="Τίτλος" />
                  <Input name="magazineImageUrl" defaultValue={settings?.magazineImageUrl} placeholder="URL Εικόνας" />
                  <Input name="magazineButtonLabel" defaultValue={settings?.magazineButtonLabel} placeholder="Label Κουμπιού" />
                  <Input name="magazineButtonUrl" defaultValue={settings?.magazineButtonUrl} placeholder="Link Κουμπιού" />
                  <Button type="submit" className="w-full" disabled={updateSettings.isPending}>Save Magazine</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/10 shadow-lg mt-8">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="flex items-center gap-2 text-primary font-display">
                  <LinkIcon className="h-5 w-5" /> Edit Footer Links
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-xl">
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Link 1 Label</label>
                      <Input name="footerLink1Label" defaultValue={settings?.footerLink1Label} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Link 1 URL</label>
                      <Input name="footerLink1Url" defaultValue={settings?.footerLink1Url} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-xl">
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Link 2 Label</label>
                      <Input name="footerLink2Label" defaultValue={settings?.footerLink2Label} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Link 2 URL</label>
                      <Input name="footerLink2Url" defaultValue={settings?.footerLink2Url} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-xl">
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Link 3 Label</label>
                      <Input name="footerLink3Label" defaultValue={settings?.footerLink3Label} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Link 3 URL</label>
                      <Input name="footerLink3Url" defaultValue={settings?.footerLink3Url} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={updateSettings.isPending}>Save Footer Links</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="articles">
            <Card className="border-2 border-primary/10 shadow-lg">
              <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-primary font-display">
                  <Newspaper className="h-5 w-5" /> Articles
                </CardTitle>
                <Dialog onOpenChange={(open) => !open && setNewArticleImages([])}>
                  <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4"/> Νέο</Button></DialogTrigger>
                  <DialogContent className="font-body max-w-2xl max-h-[90vh] overflow-y-auto">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      createArticle.mutate({ ...Object.fromEntries(formData), imageUrls: newArticleImages });
                    }} className="space-y-4">
                      <Input name="title" placeholder="Τίτλος" required />
                      <div className="p-4 border rounded-xl bg-muted/20">
                        <div className="grid grid-cols-4 gap-2 mb-4">
                          {newArticleImages.map((img, i) => (
                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                              <img src={img} className="object-cover w-full h-full" />
                              <button type="button" onClick={() => setNewArticleImages(p => p.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center text-white"><X/></button>
                            </div>
                          ))}
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground"><Upload/><span className="text-[10px]">Import</span></button>
                          <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => handleFileUpload(e, false)} />
                        </div>
                        <div className="flex gap-2">
                          <Input id="link-add" placeholder="URL Εικόνας" />
                          <Button type="button" onClick={() => { const i = document.getElementById('link-add') as HTMLInputElement; if(i.value){setNewArticleImages(p=>[...p, i.value]); i.value='';} }}>Add</Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Κατηγορία</label>
                        <select name="category" className="w-full p-2 border rounded-md bg-background">
                          <option value="general">Γενικά</option>
                          <option value="teachers">Εκπαιδευτικό Προσωπικό</option>
                          <option value="heads">Υπεύθυνοι Τμημάτων</option>
                          <option value="schedule">Ωράριο</option>
                          <option value="rules">Κανονισμός</option>
                          <option value="evaluation">Αυτοαξιολόγηση</option>
                        </select>
                      </div>
                      <Textarea name="content" placeholder="Περιεχόμενο" rows={8} required />
                      <Button type="submit" className="w-full" disabled={createArticle.isPending}>Publish</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {articles?.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-4 border rounded-xl bg-background">
                      <div className="flex items-center gap-4">
                        {a.imageUrls?.[0] ? <img src={a.imageUrls[0]} className="w-12 h-12 rounded object-cover" /> : <div className="w-12 h-12 bg-muted rounded flex items-center justify-center"><ImageIcon/></div>}
                        <h4 className="font-bold">{a.title}</h4>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => {
                              setEditingArticle(a);
                              setEditArticleImages(a.imageUrls || []);
                            }}>
                              <Edit2 className="h-5 w-5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="font-body max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="font-display text-primary">Επεξεργασία Άρθρου</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              const formData = new FormData(e.currentTarget);
                              updateArticle.mutate({ id: a.id, ...Object.fromEntries(formData), imageUrls: editArticleImages });
                            }} className="space-y-4">
                              <Input name="title" defaultValue={a.title} placeholder="Τίτλος" required />
                              <div className="p-4 border rounded-xl bg-muted/20">
                                <div className="grid grid-cols-4 gap-2 mb-4">
                                  {editArticleImages.map((img, i) => (
                                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                                      <img src={img} className="object-cover w-full h-full" />
                                      <button type="button" onClick={() => setEditArticleImages(p => p.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center text-white"><X/></button>
                                    </div>
                                  ))}
                                  <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground"><Upload/><span className="text-[10px]">Import</span></button>
                                </div>
                            <div className="flex gap-2">
                              <Input id={`link-edit-${a.id}`} placeholder="URL Εικόνας" />
                              <Button type="button" onClick={() => { const i = document.getElementById(`link-edit-${a.id}`) as HTMLInputElement; if(i.value){setEditArticleImages(p=>[...p, i.value]); i.value='';} }}>Add</Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Κατηγορία</label>
                            <select name="category" defaultValue={a.category || "general"} className="w-full p-2 border rounded-md bg-background text-foreground">
                              <option value="general">Γενικά</option>
                              <option value="teachers">Εκπαιδευτικό Προσωπικό</option>
                              <option value="heads">Υπεύθυνοι Τμημάτων</option>
                              <option value="schedule">Ωράριο</option>
                              <option value="rules">Κανονισμός</option>
                              <option value="evaluation">Αυτοαξιολόγηση</option>
                            </select>
                          </div>
                          <Textarea name="content" defaultValue={a.content} placeholder="Περιεχόμενο" rows={8} required />
                              <Button type="submit" className="w-full" disabled={updateArticle.isPending}>Ενημέρωση</Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteArticle.mutate(a.id)}>
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
