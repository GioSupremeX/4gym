import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Trophy, MessageSquare, Bell, FileText, ArrowLeft, Newspaper } from "lucide-react";
import { useSettings } from "@/hooks/use-articles";
import { useQuery } from "@tanstack/react-query";
import { Announcement, Article } from "@shared/schema";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function GenericPage({ title, description, icon: Icon, children }: { title: string; description: string; icon: any, children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto shadow-xl border-2 border-primary/10">
          <CardHeader className="bg-primary/5 border-b border-primary/10 text-center py-12">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Icon className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-4xl font-display font-bold text-primary uppercase tracking-tight">
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 md:p-12">
            {description && (
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto text-center whitespace-pre-wrap mb-12">
                {description}
              </p>
            )}
            {children}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
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
          <Card key={art.id} className="relative overflow-hidden border-2 border-primary/10 hover:border-primary/30 shadow-md hover:shadow-xl transition-all duration-300 group rounded-2xl">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl text-primary font-display font-bold leading-tight group-hover:translate-x-1 transition-transform">{art.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Separator className="mb-6 opacity-50" />
              {art.imageUrls && art.imageUrls.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {art.imageUrls.map((url, i) => (
                    <img key={i} src={url} alt="" className="rounded-xl object-cover aspect-video shadow-md" />
                  ))}
                </div>
              )}
              <p className="text-lg text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {art.content}
              </p>
            </CardContent>
          </Card>
        ))}
        {(!articles || articles.length === 0) && (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-primary/10">
            <FileText className="h-16 w-16 text-muted-foreground/20 mx-auto mb-6" />
            <p className="text-2xl font-display text-muted-foreground italic">Δεν υπάρχει περιεχόμενο ακόμα.</p>
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

  if (isLoading) return <div className="p-20 text-center font-display text-primary animate-pulse">Φόρτωση...</div>;
  if (!article) return <div className="p-20 text-center font-display text-destructive">Το άρθρο δεν βρέθηκε.</div>;

  const recommendations = allArticles?.filter(a => a.id !== article.id).slice(0, 3) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-8 hover:text-primary transition-colors">
            <Link href={article.category === "general" ? "/articles" : "/"}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Επιστροφή
            </Link>
          </Button>

          <Card className="shadow-2xl border-2 border-primary/10 rounded-3xl overflow-hidden mb-12">
            <CardHeader className="bg-primary/5 border-b border-primary/10 p-8 md:p-12">
              <div className="flex items-center gap-3 text-primary mb-4 font-bold uppercase tracking-widest text-sm">
                <FileText className="h-5 w-5" />
                <span>{article.category === "general" ? "Νέα & Ανακοινώσεις" : article.category}</span>
              </div>
              <CardTitle className="text-4xl md:text-5xl font-display font-bold text-primary leading-tight">
                {article.title}
              </CardTitle>
              <div className="mt-6 flex items-center text-muted-foreground font-medium">
                {new Date(article.publishedAt).toLocaleDateString("el-GR", { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </CardHeader>
            <CardContent className="p-8 md:p-12">
              {article.imageUrls && article.imageUrls.length > 0 && (
                <div className="grid grid-cols-1 gap-8 mb-12">
                  {article.imageUrls.map((url, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                      <img src={url} alt="" className="w-full h-auto object-cover max-h-[600px]" />
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

          {recommendations.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-display font-bold text-primary">Διαβάστε επίσης</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendations.map((rec) => (
                  <Link key={rec.id} href={`/articles/${rec.id}`}>
                    <Card className="cursor-pointer hover:shadow-xl transition-all h-full border-2 border-primary/5 hover:border-primary/20">
                      <CardContent className="p-4 space-y-3">
                        {rec.imageUrls?.[0] && (
                          <img src={rec.imageUrls[0]} alt="" className="w-full aspect-video object-cover rounded-lg" />
                        )}
                        <h4 className="font-bold line-clamp-2 leading-tight">{rec.title}</h4>
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
  );
}

export function AllArticlesPage() {
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  if (isLoading) return <div className="p-20 text-center font-display text-primary animate-pulse">Φόρτωση...</div>;

  const generalArticles = articles?.filter(a => a.category === "general") || [];

  return (
    <GenericPage title="Όλα τα Νέα" description="Δείτε όλα τα πρόσφατα νέα και ανακοινώσεις του σχολείου μας." icon={Newspaper}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {generalArticles.map((art) => (
          <Link key={art.id} href={`/articles/${art.id}`}>
            <Card className="cursor-pointer hover:shadow-2xl transition-all border-2 border-primary/5 hover:border-primary/20 rounded-3xl overflow-hidden h-full flex flex-col group">
              {art.imageUrls?.[0] && (
                <div className="aspect-video overflow-hidden">
                  <img src={art.imageUrls[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <CardHeader className="flex-grow">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  {new Date(art.publishedAt).toLocaleDateString("el-GR")}
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
          <Button variant="link" className="mt-4 p-0 h-auto font-bold text-primary">Διαβάστε περισσότερα...</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function ActivitiesPage() {
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { data: articles, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles/category/activities"],
  });

  if (settingsLoading || articlesLoading) return <div className="p-20 text-center">Φόρτωση...</div>;

  return (
    <GenericPage title="Δραστηριότητες" description={settings?.activitiesPageContent || ""} icon={Trophy}>
      <div className="space-y-8 mt-12">
        {articles?.map((art) => (
          <ArticleCard key={art.id} article={art} />
        ))}
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

export function ContactPage() {
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { data: articles, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles/category/contact"],
  });

  if (settingsLoading || articlesLoading) return <div className="p-20 text-center">Φόρτωση...</div>;

  return (
    <GenericPage title="Επικοινωνία" description={settings?.contactPageContent || ""} icon={Users}>
      <div className="space-y-8 mt-12">
        {articles?.map((art) => (
          <ArticleCard key={art.id} article={art} />
        ))}
      </div>
    </GenericPage>
  );
}
