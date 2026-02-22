import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, X, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSettings } from "@/hooks/use-articles";

const NAV_ITEMS = [
  { label: "Αρχική", href: "/" },
  { label: "Το σχολείο μας", href: "/about" },
  { label: "Μαθητές", href: "/students" },
  { label: "Δραστηριότητες", href: "/activities" },
  { label: "Ανακοινώσεις", href: "/announcements" },
  { label: "Επικοινωνία", href: "/contact" },
];

export function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { data: settings } = useSettings();

  const logoUrl = settings?.logoUrl;
  const schoolName = settings?.schoolName || "4ο ΓΥΜΝΑΣΙΟ ΡΟΔΟΥ";

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-10 w-10 object-contain" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl font-display shadow-lg">
                4
              </div>
            )}
            <div className="hidden flex-col sm:flex">
              <span className="text-sm font-bold leading-none text-primary uppercase">{schoolName}</span>
              <span className="text-xs font-medium text-muted-foreground uppercase">ΚΑΖΟΥΛΛΕΙΟ</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:gap-x-2 items-center">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "nav-link text-foreground/70",
                  location === item.href && "text-primary font-semibold after:w-full"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/secret/edit" className="ml-4 text-muted-foreground hover:text-primary transition-colors">
              <Settings className="h-5 w-5" />
            </Link>
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 mt-8">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary",
                      location === item.href && "text-primary font-bold"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/secret/edit"
                  className="text-lg font-medium text-muted-foreground flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-5 w-5" /> Διαχείριση
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
