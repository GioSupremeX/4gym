import { MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* School Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white font-display border-b border-white/20 pb-2 inline-block">
              4ο Γυμνάσιο Ρόδου
            </h3>
            <p className="text-primary-foreground/80 max-w-xs">
              Καζούλλειο Γυμνάσιο. Ένα σχολείο με ιστορία, όραμα και αγάπη για τη μάθηση.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white font-display border-b border-white/20 pb-2 inline-block">
              Επικοινωνία
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-primary-foreground/80">
                <MapPin className="h-5 w-5 shrink-0" />
                <span>Βενετοκλέων, Ρόδος 851 00</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/80">
                <Phone className="h-5 w-5 shrink-0" />
                <span>22410 22410</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/80">
                <Mail className="h-5 w-5 shrink-0" />
                <span>info@4gym-rodou.dod.sch.gr</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white font-display border-b border-white/20 pb-2 inline-block">
              Χρήσιμοι Σύνδεσμοι
            </h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="#" className="hover:text-white hover:underline">Υπουργείο Παιδείας</a></li>
              <li><a href="#" className="hover:text-white hover:underline">Πανελλήνιο Σχολικό Δίκτυο</a></li>
              <li><a href="#" className="hover:text-white hover:underline">Ψηφιακό Σχολείο</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/20 pt-8 text-center text-sm text-primary-foreground/60">
          <p>© {new Date().getFullYear()} 4ο Γυμνάσιο Ρόδου - Καζούλλειο. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
