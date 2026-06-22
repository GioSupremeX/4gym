import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Trophy, MessageSquare, Bell, FileText, ArrowLeft, Newspaper, Clock } from "lucide-react";
import { useSettings } from "@/hooks/use-articles";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Announcement, Article } from "@shared/schema";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CommentSection } from "@/components/CommentSection";
import { SocialShare } from "@/components/SocialShare";
import { ReadingProgress } from "@/components/ReadingProgress";
import { ImageLightbox } from "@/components/ImageLightbox";
import { SeoHead } from "@/components/SeoHead";
import { Printer } from "lucide-react";

export function GenericPage({ title, description, icon: Icon, children }: { title: string; description: string; icon: any, children?: React.ReactNode }) {
  return (
    <>
      <SeoHead title={title} description={description?.slice(0, 160) || ""} />
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-primary/5 font-body">
        <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16 animate-fade-up">
        <Card className="max-w-4xl mx-auto paper-shadow-lg border-2 border-primary/15 rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/8 to-primary/5 border-b border-primary/10 text-center py-16 md:py-20">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-8 shadow-lg">
              <Icon className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-4xl md:text-5xl font-display font-bold text-primary uppercase tracking-tight leading-tight">
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 md:p-16">
            {description && (
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto text-center whitespace-pre-wrap mb-12 font-light">
                {description}
              </p>
            )}
            {children}
          </CardContent>
        </Card>
      </main>
      <Footer />
      </div>
    </>
  );
}

export function CategoryPage({ category, title }: { category: string, title: string }) {
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: [`/api/articles/category/${category}`],
  });

  if (isLoading) return <div className="p-20 text-center font-display text-primary animate-pulse">Φόρτωση...</div>;

  return (
    <GenericPage title={title} description="" icon={FileText}>
      <div className="space-y-8 max-w-3xl mx-auto">
        {articles?.map((art) => (
          <Card key={art.id} className="relative overflow-hidden border-2 border-primary/15 hover:border-primary/40 paper-shadow hover:paper-shadow-lg card-hover group rounded-3xl">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary to-primary/60" />
            <CardHeader className="pb-6 pl-6 pr-6 pt-6">
              <CardTitle className="text-2xl md:text-3xl text-primary font-display font-bold leading-tight group-hover:translate-x-2 smooth-transition">
                {art.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pl-6 pr-6 pb-6">
              <Separator className="mb-6 opacity-30" />
              {art.imageUrls && art.imageUrls.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {art.imageUrls.map((url, i) => (
                    <img key={i} src={url} alt="" className="rounded-2xl object-cover aspect-video paper-shadow-lg hover:paper-shadow-lg smooth-transition" />
                  ))}
                </div>
              )}
              <p className="text-base md:text-lg text-muted-foreground whitespace-pre-wrap leading-relaxed font-light">
                {art.content}
              </p>
            </CardContent>
          </Card>
        ))}
        {(!articles || articles.length === 0) && (
          <div className="text-center py-20 md:py-28 bg-gradient-to-br from-primary/8 to-primary/5 rounded-3xl border-2 border-dashed border-primary/15">
            <FileText className="h-16 w-16 text-muted-foreground/20 mx-auto mb-6" />
            <p className="text-xl md:text-2xl font-display text-muted-foreground italic">Δεν υπάρχει περιεχόμενο ακόμα.</p>
          </div>
        )}
      </div>
    </GenericPage>
  );
}

export function ArticlePage({ params }: { params: { id: string } }) {
  const { data: article, isLoading } = useQuery<Article>({
    queryKey: [`/api/articles/${params.id}`],
  });
  const { data: allArticles } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });
  const { data: settings } = useSettings();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (isLoading) return <div className="p-20 text-center font-display text-primary animate-pulse">Φόρτωση...</div>;
  if (!article) return <div className="p-20 text-center font-display text-destructive">Το άρθρο δεν βρέθηκε.</div>;

  const recommendations = allArticles?.filter(a => a.id !== article.id).slice(0, 3) || [];

  return (
    <>
      <SeoHead title={article.title} description={article.content.slice(0, 160)} />
      <div className="min-h-screen flex flex-col bg-background font-body">
        <ReadingProgress />
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-12 animate-fade-up">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <Button variant="ghost" asChild className="hover:text-primary transition-colors">
                <Link href={article.category === "general" ? "/articles" : "/"}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Επιστροφή
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 border-primary/20 hover:bg-primary/5">
                  <Printer className="h-4 w-4" />
                  <span className="hidden sm:inline">Εκτύπωση</span>
                </Button>
                <SocialShare title={article.title} url={`/articles/${article.id}`} />
              </div>
            </div>

          <Card className="shadow-2xl border-2 border-primary/10 rounded-3xl overflow-hidden mb-12">
            <CardHeader className="bg-primary/5 border-b border-primary/10 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${CATEGORY_COLORS[article.category] || CATEGORY_COLORS.general}`}>
                  {CATEGORY_LABELS[article.category] || article.category}
                </span>
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                  {new Date(article.publishedAt).toLocaleDateString("el-GR", { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <CardTitle className="text-4xl md:text-5xl font-display font-bold text-primary leading-tight">
                {article.title}
              </CardTitle>
              <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {Math.ceil(article.content.split(/\s+/).length / 200)} λεπτά ανάγνωσης
                </span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  {article.content.split(/\s+/).length} λέξεις
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-8 md:p-12">
              {article.imageUrls && article.imageUrls.length > 0 && (
                <div className="grid grid-cols-1 gap-8 mb-12">
                  {article.imageUrls.map((url, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden shadow-lg border-4 border-white group cursor-zoom-in">
                      <img src={url} alt="" className="w-full h-auto object-cover max-h-[600px] group-hover:scale-105 transition-transform duration-700" onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }} />
                    </div>
                  ))}
                </div>
              )}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-xl text-foreground leading-relaxed whitespace-pre-wrap">
                  {article.content}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <CommentSection articleId={article.id} commentsEnabled={settings?.commentsEnabled !== "false"} />

          {recommendations.length > 0 && (
            <div className="space-y-6 mt-16">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary/40 rounded-full" />
                <h3 className="text-2xl font-display font-bold text-primary">Διαβάστε επίσης</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendations.map((rec, idx) => (
                  <Link key={rec.id} href={`/articles/${rec.id}`} className="animate-fade-up" style={{ animationDelay: `${idx * 150}ms` }}>
                    <Card className="cursor-pointer hover:shadow-xl transition-all h-full border-2 border-primary/5 hover:border-primary/20 overflow-hidden group">
                      {rec.imageUrls?.[0] && (
                        <div className="aspect-video overflow-hidden">
                          <img src={rec.imageUrls[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                      )}
                      <CardContent className="p-4 space-y-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${CATEGORY_COLORS[rec.category] || CATEGORY_COLORS.general}`}>
                          {CATEGORY_LABELS[rec.category] || rec.category}
                        </span>
                        <h4 className="font-bold line-clamp-2 leading-tight text-sm">{rec.title}</h4>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                          {new Date(rec.publishedAt).toLocaleDateString("el-GR")}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      </div>
      {lightboxOpen && article.imageUrls && (
        <ImageLightbox
          images={article.imageUrls}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  general: "Γενικά", teachers: "Εκπαιδευτικοί", heads: "Διεύθυνση",
  schedule: "Ωράριο", rules: "Κανονισμός", evaluation: "Αξιολόγηση",
  students: "Μαθητές", activities: "Δραστηριότητες", contact: "Επικοινωνία"
};

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-blue-100 text-blue-700", teachers: "bg-purple-100 text-purple-700",
  heads: "bg-red-100 text-red-700", schedule: "bg-green-100 text-green-700",
  rules: "bg-orange-100 text-orange-700", evaluation: "bg-teal-100 text-teal-700",
  students: "bg-pink-100 text-pink-700", activities: "bg-yellow-100 text-yellow-700",
  contact: "bg-gray-100 text-gray-700"
};

export function AllArticlesPage() {
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  if (isLoading) return <div className="p-20 text-center font-display text-primary animate-pulse">Φόρτωση...</div>;

  const allSorted = [...(articles || [])].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <GenericPage title="Όλα τα Νέα" description="Δείτε όλα τα πρόσφατα νέα και ανακοινώσεις του σχολείου μας." icon={Newspaper}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {allSorted.map((art, idx) => (
          <Link key={art.id} href={`/articles/${art.id}`} className="animate-fade-up" style={{ animationDelay: `${idx * 100}ms` }}>
            <Card className="cursor-pointer hover:shadow-2xl transition-all border-2 border-primary/5 hover:border-primary/20 rounded-3xl overflow-hidden h-full flex flex-col group">
              {art.imageUrls?.[0] && (
                <div className="aspect-video overflow-hidden relative">
                  <img src={art.imageUrls[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )}
              <CardHeader className="flex-grow">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${CATEGORY_COLORS[art.category] || CATEGORY_COLORS.general}`}>
                    {CATEGORY_LABELS[art.category] || art.category}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {new Date(art.publishedAt).toLocaleDateString("el-GR")}
                  </span>
                </div>
                <CardTitle className="text-2xl font-display font-bold text-primary leading-tight group-hover:text-primary transition-colors">
                  {art.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                  {art.content}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </GenericPage>
  );
}

export function AboutPage() {
  const { data: settings, isLoading } = useSettings();
  if (isLoading) return <div className="p-20 text-center">Φόρτωση...</div>;
  return <GenericPage title="Το σχολείο μας" description={settings?.aboutPageContent || ""} icon={BookOpen} />;
}

export function StudentsPage() {
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { data: articles, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles/category/students"],
  });

  if (settingsLoading || articlesLoading) return <div className="p-20 text-center">Φόρτωση...</div>;

  return (
    <GenericPage title="Μαθητές" description={settings?.studentsPageContent || ""} icon={Users}>
      <div className="space-y-8 mt-12">
        {articles?.map((art) => (
          <ArticleCard key={art.id} article={art} />
        ))}
      </div>
    </GenericPage>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Card className="relative overflow-hidden border-2 border-primary/10 hover:border-primary/30 shadow-md hover:shadow-xl transition-all duration-300 group rounded-2xl">
      <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
      <CardHeader className="pb-4">
        <Link href={`/articles/${article.id}`}>
          <CardTitle className="text-3xl text-primary font-display font-bold leading-tight group-hover:translate-x-1 transition-transform cursor-pointer">
            {article.title}
          </CardTitle>
        </Link>
      </CardHeader>
      <CardContent>
        <Separator className="mb-6 opacity-50" />
        {article.imageUrls && article.imageUrls.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {article.imageUrls.map((url, i) => (
              <img key={i} src={url} alt="" className="rounded-xl object-cover aspect-video shadow-md" />
            ))}
          </div>
        )}
        <p className="text-lg text-muted-foreground whitespace-pre-wrap leading-relaxed line-clamp-4">
          {article.content}
        </p>
        <Link href={`/articles/${article.id}`}>
          <span className="mt-4 inline-block font-bold text-primary hover:underline cursor-pointer">Διαβάστε περισσότερα...</span>
        </Link>
      </CardContent>
    </Card>
  );
}

export function ActivitiesPage() {
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { data: articles, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  if (settingsLoading || articlesLoading) return <div className="p-20 text-center">Φόρτωση...</div>;

  const activitiesArticles = articles?.filter(a => a.category === "activities" || a.category === "general") || [];

  return (
    <GenericPage title="Δραστηριότητες" description={settings?.activitiesPageContent || ""} icon={Trophy}>
      <div className="space-y-8 mt-12">
        {activitiesArticles.length > 0 ? (
          activitiesArticles.map((art) => (
            <ArticleCard key={art.id} article={art} />
          ))
        ) : (
          <div className="text-center py-12 bg-muted/20 rounded-2xl border-2 border-dashed border-primary/10">
            <p className="text-muted-foreground italic">Δεν υπάρχουν ακόμα δραστηριότητες.</p>
          </div>
        )}
      </div>
    </GenericPage>
  );
}

export function AnnouncementsPage() {
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { data: announcements, isLoading: annLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  if (settingsLoading || annLoading) return <div className="p-20 text-center font-display text-primary animate-pulse">Φόρτωση...</div>;

  return (
    <GenericPage title="Ανακοινώσεις" description={settings?.announcementsPageContent || ""} icon={MessageSquare}>
      <div className="space-y-8 max-w-3xl mx-auto">
        {announcements?.map((ann) => (
          <Card key={ann.id} className="relative overflow-hidden border-2 border-primary/10 hover:border-primary/30 shadow-md hover:shadow-xl transition-all duration-300 group rounded-2xl">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-primary/10 text-primary p-3 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="px-4 py-1.5 bg-muted rounded-full text-xs font-bold text-muted-foreground uppercase tracking-widest shadow-inner">
                  {new Date(ann.publishedAt).toLocaleDateString("el-GR", { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <CardTitle className="text-3xl text-primary font-display font-bold leading-tight group-hover:translate-x-1 transition-transform">{ann.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Separator className="mb-6 opacity-50" />
              <p className="text-lg text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {ann.content}
              </p>
            </CardContent>
          </Card>
        ))}
        {(!announcements || announcements.length === 0) && (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-primary/10">
            <Bell className="h-16 w-16 text-muted-foreground/20 mx-auto mb-6" />
            <p className="text-2xl font-display text-muted-foreground italic">Δεν υπάρχουν πρόσφατες ανακοινώσεις.</p>
          </div>
        )}
      </div>
    </GenericPage>
  );
}

import { ContactForm } from "@/components/ContactForm";

export function ContactPage() {
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { data: articles, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles/category/contact"],
  });

  if (settingsLoading || articlesLoading) return <div className="p-20 text-center">Φόρτωση...</div>;

  return (
    <GenericPage title="Επικοινωνία" description={settings?.contactPageContent || ""} icon={Users}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12 max-w-5xl mx-auto">
        <ContactForm />
        <div className="space-y-8">
          <h3 className="text-xl font-display font-bold text-primary">Επισήμανση</h3>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>Για την αμέση επικοινωνία με το σχολείο, συμπληρώστε τη φόρμα από την αριστερή. Θα σας απαντήσουμε το συντομότερο δυνατό.</p>
            <p>Επίσης μπορείτε να επισκεφθείτε το σχολείο την ώρα λειτουργίας.</p>
          </div>
          {articles && articles.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="font-bold mb-4">Σχετικά Άρθρα</h4>
              <div className="space-y-3">
                {articles.slice(0, 3).map((art) => (
                  <Link key={art.id} href={`/articles/${art.id}`}>
                    <div className="p-3 border rounded-xl bg-background hover:border-primary/20 transition-colors">
                      <p className="font-bold text-sm">{art.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </GenericPage>
  );
}
