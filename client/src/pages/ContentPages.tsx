import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Trophy, MessageSquare, Bell } from "lucide-react";
import { useSettings } from "@/hooks/use-articles";
import { useQuery } from "@tanstack/react-query";
import { Announcement } from "@shared/schema";

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
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto text-center whitespace-pre-wrap mb-12">
              {description}
            </p>
            {children}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export function AboutPage() {
  const { data: settings, isLoading } = useSettings();
  if (isLoading) return <div className="p-20 text-center">Φόρτωση...</div>;
  return <GenericPage title="Το σχολείο μας" description={settings?.aboutPageContent || ""} icon={BookOpen} />;
}

export function StudentsPage() {
  const { data: settings, isLoading } = useSettings();
  if (isLoading) return <div className="p-20 text-center">Φόρτωση...</div>;
  return <GenericPage title="Μαθητές" description={settings?.studentsPageContent || "Εδώ μπορείτε να βρείτε πληροφορίες για τις μαθητικές κοινότητες, το ωρολόγιο πρόγραμμα και άλλες χρήσιμες ανακοινώσεις για τους μαθητές μας."} icon={Users} />;
}

export function ActivitiesPage() {
  const { data: settings, isLoading } = useSettings();
  if (isLoading) return <div className="p-20 text-center">Φόρτωση...</div>;
  return <GenericPage title="Δραστηριότητες" description={settings?.activitiesPageContent || ""} icon={Trophy} />;
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
  const { data: settings, isLoading } = useSettings();
  if (isLoading) return <div className="p-20 text-center">Φόρτωση...</div>;
  return <GenericPage title="Επικοινωνία" description={settings?.contactPageContent || ""} icon={Users} />;
}
