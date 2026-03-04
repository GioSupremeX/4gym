import { MapPin, Phone, Mail } from "lucide-react";
import { useSettings } from "@/hooks/use-articles";

export function Footer() {
  const { data: settings } = useSettings();

  const links = [
    { label: settings?.footerLink1Label || "Υπουργείο Παιδείας", href: settings?.footerLink1Url || "https://www.minedu.gov.gr/" },
    { label: settings?.footerLink2Label || "Διεύθυνση Δευτεροβάθμιας", href: settings?.footerLink2Url || "#" },
    { label: settings?.footerLink3Label || "Περιφερειακή Διεύθυνση", href: settings?.footerLink3Url || "#" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* School Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white font-display border-b border-white/20 pb-2 inline-block">
              {settings?.schoolName || "4ο Γυμνάσιο Ρόδου"}
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
                <span>Πατριάρχου Αθηναγόρα 58, Ρόδος</span>
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
              {links.map((link, i) => (
                <li key={i}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/20 pt-8 text-center text-sm text-primary-foreground/60">
          <p>© {new Date().getFullYear()} {settings?.schoolName || "4ο Γυμνάσιο Ρόδου - Καζούλλειο"}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
