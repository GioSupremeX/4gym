import { MapPin, Phone, Mail, Copy, Check, ExternalLink, BookOpen, Calendar, Users, FileText } from "lucide-react";
import { useSettings } from "@/hooks/use-articles";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

function CopyableItem({ icon: Icon, text, label }: { icon: any; text: string; label: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "Αντιγράφηκε!", description: `${label} αντιγράφηκε στο clipboard.` });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Απέτυχε", variant: "destructive" });
    }
  };
  return (
    <div className="flex items-center gap-3 text-primary-foreground/85 group cursor-pointer" onClick={handleCopy}>
      <Icon className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
      <span className="flex-1 hover:text-white transition-colors">{text}</span>
      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10" title={`Αντιγραφή ${label}`}>
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

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
    { label: settings?.footerLink3Label || "Περιφεριακή Διεύθυνση", href: settings?.footerLink3Url || "#" },
  ];

  const quickAccess = [
    { label: "Όλα τα Νέα", href: "/articles", icon: FileText },
    { label: "Ανακοινώσεις", href: "/announcements", icon: BookOpen },
    { label: "Δραστηριότητες", href: "/activities", icon: Calendar },
    { label: "Μαθητές", href: "/students", icon: Users },
  ];

  return (
    <footer className="bg-gradient-to-r from-primary via-primary/98 to-primary text-primary-foreground mt-auto relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/greek-vase.png')] opacity-5"></div>
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* School Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-display border-b-2 border-white/30 pb-3 inline-block hover:border-white/50 transition-colors">
              {settings?.schoolName || "4ο Γυμνάσιο Ρόδου"}
            </h3>
            <p className="text-primary-foreground/85 max-w-xs leading-relaxed font-light">
              {settings?.footerDescription || "Καζούλλειο Γυμνάσιο. Ένα σχολείο με ιστορία, όραμα και αγάπη για τη μάθηση."}
            </p>
          </div>

          {/* Quick Access */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-display border-b-2 border-white/30 pb-3 inline-block hover:border-white/50 transition-colors">
              Γρήγορη Πρόσβαση
            </h3>
            <ul className="space-y-3 text-primary-foreground/85">
              {quickAccess.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <a href={link.href} className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2">
                      <Icon className="h-4 w-4" /> {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-display border-b-2 border-white/30 pb-3 inline-block hover:border-white/50 transition-colors">
              Επικοινωνία
            </h3>
            <div className="space-y-4">
              <CopyableItem icon={MapPin} text={settings?.footerAddress || "Πατριάρχου Αθηναγόρα 58, Ρόδος"} label="Διεύθυνση" />
              <CopyableItem icon={Phone} text={settings?.footerPhone || "22410 22410"} label="Τηλέφωνο" />
              <CopyableItem icon={Mail} text={settings?.footerEmail || "info@4gym-rodou.dod.sch.gr"} label="Email" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-display border-b-2 border-white/30 pb-3 inline-block hover:border-white/50 transition-colors">
              Χρήσιμοι Σύνδεσμοι
            </h3>
            <ul className="space-y-3 text-primary-foreground/85">
              {links.map((link, i) => (
                <li key={i}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2">
                    {link.label} <ExternalLink className="h-3 w-3" />
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
