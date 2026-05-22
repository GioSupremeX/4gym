import { MapPin, Phone, Mail } from "lucide-react";
import { useSettings } from "@/hooks/use-articles";

export function Footer() {
  const { data: settings } = useSettings();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const schoolYearStart = currentMonth >= 5 ? currentYear : currentYear - 1;
  const schoolYear = `${schoolYearStart}–${schoolYearStart + 1}`;

  const links = [
    { label: settings?.footerLink1Label || "Υπουργείο Παιδείας", href: settings?.footerLink1Url || "https://www.minedu.gov.gr/" },
    { label: settings?.footerLink2Label || "Διεύθυνση Δευτεροβάθμιας", href: settings?.footerLink2Url || "#" },
    { label: settings?.footerLink3Label || "Περιφερειακή Διεύθυνση", href: settings?.footerLink3Url || "#" },
  ];

  return (
    <footer className="bg-gradient-to-r from-primary via-primary/98 to-primary text-primary-foreground mt-auto relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/greek-vase.png')] opacity-5"></div>
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* School Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-display border-b-2 border-white/30 pb-3 inline-block hover:border-white/50 smooth-transition">
              {settings?.schoolName || "4ο Γυμνάσιο Ρόδου"}
            </h3>
            <p className="text-primary-foreground/85 max-w-xs leading-relaxed font-light">
              Καζούλλειο Γυμνάσιο. Ένα σχολείο με ιστορία, όραμα και αγάπη για τη μάθηση.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-display border-b-2 border-white/30 pb-3 inline-block hover:border-white/50 smooth-transition">
              Επικοινωνία
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-primary-foreground/85 hover:text-white smooth-transition group cursor-pointer">
                <MapPin className="h-5 w-5 shrink-0 group-hover:scale-110 smooth-transition" />
                <span>Πατριάρχου Αθηναγόρα 58, Ρόδος</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/85 hover:text-white smooth-transition group cursor-pointer">
                <Phone className="h-5 w-5 shrink-0 group-hover:scale-110 smooth-transition" />
                <span>22410 22410</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/85 hover:text-white smooth-transition group cursor-pointer">
                <Mail className="h-5 w-5 shrink-0 group-hover:scale-110 smooth-transition" />
                <span>info@4gym-rodou.dod.sch.gr</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-display border-b-2 border-white/30 pb-3 inline-block hover:border-white/50 smooth-transition">
              Χρήσιμοι Σύνδεσμοι
            </h3>
            <ul className="space-y-3 text-primary-foreground/85">
              {links.map((link, i) => (
                <li key={i}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:translate-x-1 smooth-transition inline-block">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-white/20 pt-8 text-center text-sm text-primary-foreground/70">
          <p>© {currentYear} {settings?.schoolName || "4ο Γυμνάσιο Ρόδου - Καζούλλειο"} · Σχολικό Έτος {schoolYear}</p>
        </div>
      </div>
    </footer>
  );
}
