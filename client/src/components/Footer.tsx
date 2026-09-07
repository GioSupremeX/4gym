import { MapPin, Phone, Mail, Copy, Check, ExternalLink, BookOpen, Calendar, Users, FileText } from "lucide-react";
import { useSettings } from "@/hooks/use-articles";
import { queryClient } from "@/lib/queryClient";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const { toast } = useToast();
  const { data: settings } = useSettings();
  const contextClicks = useRef(0);
  const [creditsArmed, setCreditsArmed] = useState(false);
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

  const toggleCredits = useCallback(async () => {
    const sessionResponse = await fetch("/api/admin/session", { credentials: "include" });
    const session = await sessionResponse.json().catch(() => ({}));
    if (!session.authenticated || session.user?.role !== "owner") {
      toast({ title: "Απαιτείται owner", description: "Συνδεθείτε με τον λογαριασμό administrator στο Control Room.", variant: "destructive" });
      return;
    }
    const nextValue = settings?.creditsEnabled === "false" ? "true" : "false";
    const response = await fetch("/api/admin/credits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ creditsEnabled: nextValue }),
    });
    if (!response.ok) {
      toast({ title: "Αποτυχία", description: "Δεν ήταν δυνατή η αλλαγή των credits.", variant: "destructive" });
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    toast({ title: "Ενημερώθηκε", description: nextValue === "true" ? "Τα credits ενεργοποιήθηκαν." : "Τα credits απενεργοποιήθηκαν." });
  }, [settings?.creditsEnabled, toast]);

  useEffect(() => {
    const handleHotkey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "g") {
        event.preventDefault();
        void toggleCredits();
      }
    };
    window.addEventListener("keydown", handleHotkey);
    return () => window.removeEventListener("keydown", handleHotkey);
  }, [toggleCredits]);

  const handleCreditsContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    contextClicks.current += 1;
    window.setTimeout(() => {
      contextClicks.current = 0;
    }, 1600);
    if (contextClicks.current >= 2) {
      contextClicks.current = 0;
      setCreditsArmed(true);
      toast({ title: "Credits control armed", description: "Κάντε αριστερό κλικ ξανά ή χρησιμοποιήστε Ctrl/Cmd + Shift + G." });
    }
  };

  const handleCreditsClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!creditsArmed) return;
    event.preventDefault();
    setCreditsArmed(false);
    await toggleCredits();
  };

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
          {settings?.creditsEnabled !== "false" && (
            <a
              href="https://github.com/GioSupremeX"
              target="_blank"
              rel="noopener noreferrer"
              onContextMenu={handleCreditsContextMenu}
              onClick={handleCreditsClick}
              className={`mt-3 inline-flex items-center gap-1 text-xs transition-colors hover:text-white ${creditsArmed ? "text-white underline decoration-dashed underline-offset-4" : ""}`}
              title={creditsArmed ? "Κάντε αριστερό κλικ για έλεγχο credits" : "Designed by GioSupremeX"}
            >
              Designed by <span className="font-semibold">GioSupremeX</span>
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
