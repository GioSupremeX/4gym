import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Trophy, MessageSquare } from "lucide-react";
import { useSettings } from "@/hooks/use-articles";
import { Skeleton } from "@/components/ui/skeleton";

export function GenericPage({ title, description, icon: Icon }: { title: string; description: string; icon: any }) {
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
          <CardContent className="p-8 md:p-12 text-center">
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto whitespace-pre-wrap">
              {description}
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 rounded-xl bg-muted/30 border border-border/50">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg mx-auto mb-4" />
                  <div className="h-4 w-3/4 bg-muted rounded mx-auto mb-2" />
                  <div className="h-3 w-1/2 bg-muted rounded mx-auto" />
                </div>
              ))}
            </div>
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
  return <GenericPage title="Μαθητές" description={settings?.studentsPageContent || ""} icon={Users} />;
}

export function ActivitiesPage() {
  const { data: settings, isLoading } = useSettings();
  if (isLoading) return <div className="p-20 text-center">Φόρτωση...</div>;
  return <GenericPage title="Δραστηριότητες" description={settings?.activitiesPageContent || ""} icon={Trophy} />;
}

export function AnnouncementsPage() {
  const { data: settings, isLoading } = useSettings();
  if (isLoading) return <div className="p-20 text-center">Φόρτωση...</div>;
  return <GenericPage title="Ανακοινώσεις" description={settings?.announcementsPageContent || ""} icon={MessageSquare} />;
}

export function ContactPage() {
  const { data: settings, isLoading } = useSettings();
  if (isLoading) return <div className="p-20 text-center">Φόρτωση...</div>;
  return <GenericPage title="Επικοινωνία" description={settings?.contactPageContent || ""} icon={Users} />;
}
