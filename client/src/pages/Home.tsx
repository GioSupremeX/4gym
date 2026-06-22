import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { MagazineCard } from "@/components/MagazineCard";
import { ArticleList } from "@/components/ArticleList";
import { CalendarSection } from "@/components/CalendarSection";
import { useSettings } from "@/hooks/use-articles";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Bell, ChevronRight, Sparkles } from "lucide-react";
import { Newsletter } from "@/components/Newsletter";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { Announcement } from "@shared/schema";
import { SeoHead } from "@/components/SeoHead";

export default function Home() {
  const { data: settings, isLoading } = useSettings();
  const { data: announcements } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });
  const now = new Date();
  const currentMonth = now.getMonth(); // 0=Jan ... 5=Jun, 6=Jul
  const currentYear = now.getFullYear();
  // School year changes after June (month 5). Before July, show previous year as start.
  const schoolYearStart = currentMonth >= 5 ? currentYear : currentYear - 1;
  const schoolYearEnd = schoolYearStart + 1;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-12">
          <Skeleton className="h-[500px] w-full rounded-3xl" />
        </main>
        <Footer />
      </div>
    );
  }

  const schoolName = settings?.schoolName || "4ο ΓΥΜΝΑΣΙΟ ΡΟΔΟΥ – ΚΑΖΟΥΛΛΕΙΟ";
  const aboutTitle = settings?.aboutTitle || "Καλώς Ήρθατε Στο 4ο Γυμνάσιο Ρόδου - Καζούλλειο";
  const aboutText = settings?.aboutText || "Το 4ο Γυμνάσιο Ρόδου – Καζούλλειο αποτελεί έναν χώρο μάθησης, δημιουργίας και συνεργασίας.";
  const heroImage = settings?.heroImageUrl || "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&h=800&fit=crop";
  const recentAnnouncements = (announcements || []).slice(0, 3);

  return (
    <>
      <SeoHead title="Αρχική" description="Καλώς ήρθατε στο 4ο Γυμνάσιο Ρόδου – Καζούλλειο. Χώρος μάθησης, δημιουργίας και συνεργασίας." />
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />

      <main className="flex-grow">

        {/* ── Announcements ticker (if any) ── */}
        {recentAnnouncements.length > 0 && (
          <div className="bg-gradient-to-r from-accent/90 to-accent text-accent-foreground py-2.5 px-4 border-b border-accent/20">
            <div className="container mx-auto flex items-center gap-3 overflow-hidden">
              <div className="flex items-center gap-2 shrink-0 font-bold text-sm uppercase tracking-wider">
                <Bell className="h-3.5 w-3.5 animate-bounce" />
                Ανακοίνωση
              </div>
              <div className="h-4 w-px bg-accent-foreground/30 shrink-0" />
              <div className="flex gap-6 overflow-hidden">
                {recentAnnouncements.map((ann) => (
                  <Link
                    key={ann.id}
                    href="/announcements"
                    className="text-sm font-medium hover:underline whitespace-nowrap"
                  >
                    {ann.title}
                  </Link>
                ))}
              </div>
              <Link href="/announcements" className="shrink-0 ml-auto flex items-center gap-1 text-xs font-bold uppercase tracking-wider hover:underline">
                Όλες <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* ── Hero Section ── */}
        <section className="container mx-auto px-4 py-10 sm:px-6 lg:px-8 animate-fade-up">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

            {/* Left — hero */}
            <div className="lg:col-span-8 space-y-7">
              <div className="text-center space-y-5">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-primary/20 animate-pulse">
                  <Sparkles className="h-3.5 w-3.5" />
                  Σχολικό Έτος {schoolYearStart}–{schoolYearEnd}
                </div>
                <h1 className="text-4xl sm:text-5xl font-display font-bold text-primary tracking-tight leading-tight">
                  {aboutTitle}
                </h1>
                <div className="flex items-center justify-center gap-3">
                  <div className="h-px flex-1 max-w-16 bg-gradient-to-r from-transparent to-accent" />
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  <div className="h-px flex-1 max-w-16 bg-gradient-to-l from-transparent to-accent" />
                </div>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {aboutText}
                </p>
              </div>

              {/* Hero image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 group cursor-pointer card-hover smooth-transition">
                <img
                  src={heroImage}
                  alt={schoolName}
                  className="w-full object-cover aspect-video group-hover:scale-105 transition-transform duration-700"
                />
                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-500" />
                {/* bottom label */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">4ο Γυμνάσιο Ρόδου</p>
                      <p className="text-xl md:text-2xl font-display font-bold text-white drop-shadow-lg">
                        Ιστορικό Κτίριο – Σύγχρονη Εκπαίδευση
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick links strip */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Μαθητές", href: "/students", color: "from-blue-500 to-blue-600" },
                  { label: "Δραστηριότητες", href: "/activities", color: "from-emerald-500 to-emerald-600" },
                  { label: "Ανακοινώσεις", href: "/announcements", color: "from-violet-500 to-violet-600" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`bg-gradient-to-br ${item.color} text-white text-sm font-bold py-3 px-4 rounded-2xl text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-1.5`}
                  >
                    {item.label}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Right sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <MagazineCard />
              <ArticleList />
            </div>
          </div>
        </section>

        {/* ── Calendar & Stats ── */}
        <div className="animate-fade-up delay-200">
          <CalendarSection />
        </div>

        {/* ── Quote Banner ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-white py-20 text-center animate-fade-up delay-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_8s_linear_infinite]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/greek-vase.png')] opacity-[0.07]" />
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-6xl font-display text-white/85 leading-none mb-2 drop-shadow-lg">{'"'}</div>
            <h2 className="text-3xl md:text-4xl font-display font-bold italic leading-relaxed max-w-2xl mx-auto text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
              Γηράσκω δ' αεί πολλά διδασκόμενος
            </h2>
            <div className="mt-6 flex items-center justify-center gap-4">
              <div className="h-px w-16 bg-white/50" />
              <p className="text-base text-accent font-bold tracking-wide drop-shadow-sm">Σόλων ο Αθηναίος</p>
              <div className="h-px w-16 bg-white/50" />
            </div>
          </div>
        </section>

      </main>

      <Newsletter />
      <Footer />
      </div>
    </>
  );
}
