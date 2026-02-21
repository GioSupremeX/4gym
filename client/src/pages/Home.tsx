import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { MagazineCard } from "@/components/MagazineCard";
import { ArticleList } from "@/components/ArticleList";
import { CalendarSection } from "@/components/CalendarSection";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      <Navigation />

      <main className="flex-grow">
        {/* Main 3-Column Layout */}
        <section className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Magazine */}
            <div className="lg:col-span-3">
              <MagazineCard />
            </div>

            {/* Center Column: Welcome & Hero */}
            <div className="lg:col-span-6 space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-primary tracking-tight leading-tight">
                  Καλώς Ήρθατε Στο<br />
                  <span className="text-4xl sm:text-5xl text-foreground">4ο Γυμνάσιο Ρόδου</span><br />
                  <span className="text-2xl sm:text-3xl text-primary/80 italic">"Καζούλλειο"</span>
                </h1>
                <Separator className="mx-auto w-24 bg-accent h-1" />
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Ένας χώρος μάθησης, δημιουργίας και πολιτισμού. Στο σχολείο μας στοχεύουμε στην ολόπλευρη ανάπτυξη των μαθητών μας, καλλιεργώντας τη γνώση και το ήθος.
                </p>
              </div>

              {/* Hero Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform hover:scale-[1.01] transition-transform duration-500">
                {/* Classic school building placeholder */}
                <img
                  src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&h=800&fit=crop"
                  alt="4ο Γυμνάσιο Ρόδου Κτίριο"
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

            {/* Right Column: Latest Articles */}
            <div className="lg:col-span-3">
              <ArticleList />
            </div>

          </div>
        </section>

        {/* Bottom Section: Calendar & Art */}
        <CalendarSection />

        {/* School Motto Banner */}
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
