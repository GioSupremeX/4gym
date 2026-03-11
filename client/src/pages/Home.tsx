import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { MagazineCard } from "@/components/MagazineCard";
import { ArticleList } from "@/components/ArticleList";
import { CalendarSection } from "@/components/CalendarSection";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/hooks/use-articles";
import { Skeleton } from "@/components/ui/skeleton";

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
        <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-8 space-y-8 lg:space-y-10">
              <div className="text-center space-y-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-primary tracking-tight leading-tight">
                  {aboutTitle}
                </h1>
                <Separator className="mx-auto w-32 bg-gradient-to-r from-accent via-accent to-accent/50 h-1.5 rounded-full" />
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
                  {aboutText}
                </p>
              </div>

              <div className="relative rounded-3xl overflow-hidden paper-shadow-lg border border-primary/10 transform hover:scale-[1.02] smooth-transition group">
                <img
                  src={heroImage}
                  alt={schoolName}
                  className="w-full h-auto object-cover aspect-video group-hover:brightness-110 smooth-transition"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-50 group-hover:opacity-40 smooth-transition"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white text-center">
                  <p className="text-xl md:text-2xl font-display font-bold drop-shadow-lg">
                    Ιστορικό Κτίριο - Σύγχρονη Εκπαίδευση
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8 lg:space-y-10">
              <MagazineCard />
              <ArticleList />
            </div>
          </div>
        </section>

        <CalendarSection />

        <section className="bg-gradient-to-r from-primary via-primary/95 to-primary text-white py-16 md:py-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/greek-vase.png')] opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-transparent to-primary/0"></div>
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold italic leading-relaxed">
              "Γηράσκω δ' αεί πολλά διδασκόμενος"
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/90 font-light">- Σόλων ο Αθηναίος</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
