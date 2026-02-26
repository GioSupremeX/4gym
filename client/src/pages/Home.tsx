import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { MagazineCard } from "@/components/MagazineCard";
import { ArticleList } from "@/components/ArticleList";
import { CalendarSection } from "@/components/CalendarSection";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/hooks/use-articles";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const { data: settings, isLoading } = useSettings();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background font-body">
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </main>
        <Footer />
      </div>
    );
  }

  const schoolName = settings?.schoolName || "4ο ΓΥΜΝΑΣΙΟ ΡΟΔΟΥ – ΚΑΖΟΥΛΛΕΙΟ";
  const aboutTitle = settings?.aboutTitle || "Καλώς Ήρθατε Στο 4ο Γυμνάσιο Ρόδου - Καζούλλειο";
  const aboutText = settings?.aboutText || "Το 4ο Γυμνάσιο Ρόδου – Καζούλλειο αποτελεί έναν χώρο μάθησης, δημιουργίας και συνεργασίας.";
  const heroImage = settings?.heroImageUrl || "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&h=800&fit=crop";

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      <Navigation />

      <main className="flex-grow">
        <section className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-3">
              <MagazineCard />
            </div>

            <div className="lg:col-span-6 space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-primary tracking-tight leading-tight">
                  {aboutTitle}
                </h1>
                <Separator className="mx-auto w-24 bg-accent h-1" />
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {aboutText}
                </p>
              </div>

              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform hover:scale-[1.01] transition-transform duration-500">
                <img
                  src={heroImage}
                  alt={schoolName}
                  className="w-full h-auto object-cover aspect-video"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-60"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-center">
                  <p className="text-xl font-display font-bold drop-shadow-md">
                    Ιστορικό Κτίριο - Σύγχρονη Εκπαίδευση
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <ArticleList />
            </div>

          </div>
        </section>

        <section className="container mx-auto px-4 py-8 mb-12">
          <Card className="bg-primary/5 border-2 border-primary/10 shadow-lg overflow-hidden">
            <CardContent className="p-8 text-center space-y-4">
              <h2 className="text-3xl font-display font-bold text-primary uppercase tracking-tight">
                {settings?.calendarSectionTitle || "Γ ΤΑΞΗ"}
              </h2>
              <Separator className="mx-auto w-16 bg-primary/20 h-1" />
              <p className="text-lg text-muted-foreground whitespace-pre-wrap max-w-3xl mx-auto">
                {settings?.calendarSectionText || "Ενημερώσεις για την Γ' Τάξη"}
              </p>
            </CardContent>
          </Card>
        </section>

        <CalendarSection />

        <section className="bg-primary text-white py-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/greek-vase.png')] opacity-10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl font-display font-bold italic">
              "Γηράσκω δ' αεί πολλά διδασκόμενος"
            </h2>
            <p className="mt-2 text-primary-foreground/80">- Σόλων ο Αθηναίος</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
