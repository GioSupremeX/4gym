import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Trophy, MessageSquare } from "lucide-react";

export default function GenericPage({ title, description, icon: Icon }: { title: string; description: string; icon: any }) {
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
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
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
  return <GenericPage title="Το σχολείο μας" description="Το 4ο Γυμνάσιο Ρόδου - Καζούλλειο έχει μια μακρά ιστορία εκπαιδευτικής προσφοράς στην τοπική κοινωνία της Ρόδου." icon={BookOpen} />;
}

export function StudentsPage() {
  return <GenericPage title="Μαθητές" description="Εδώ μπορείτε να βρείτε πληροφορίες για τις μαθητικές κοινότητες, το ωρολόγιο πρόγραμμα και άλλες χρήσιμες ανακοινώσεις για τους μαθητές μας." icon={Users} />;
}

export function ActivitiesPage() {
  return <GenericPage title="Δραστηριότητες" description="Το σχολείο μας συμμετέχει σε πλήθος εκπαιδευτικών προγραμμάτων, αθλητικών δραστηριοτήτων και πολιτιστικών εκδηλώσεων." icon={Trophy} />;
}

export function AnnouncementsPage() {
  return <GenericPage title="Ανακοινώσεις" description="Μείνετε ενημερωμένοι για όλες τις τελευταίες ανακοινώσεις, εγγραφές και εκδηλώσεις του σχολείου μας." icon={MessageSquare} />;
}

export function ContactPage() {
  return <GenericPage title="Επικοινωνία" description="Μπορείτε να επικοινωνήσετε μαζί μας τηλεφωνικά, μέσω email ή να μας επισκεφθείτε στον χώρο του σχολείου." icon={Users} />;
}
