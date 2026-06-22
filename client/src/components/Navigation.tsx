import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, X, Settings, ChevronDown, ChevronRight, Sun, Moon } from "lucide-react";
import { SiteSearch } from "@/components/SiteSearch";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSettings } from "@/hooks/use-articles";
import { useTheme } from "@/components/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { label: "Αρχική", href: "/" },
  { 
    label: "Το σχολείο μας", 
    href: "/about",
    submenu: [
      {
        label: "Οι εκπαιδευτικοί μας",
        items: [
          { label: "Εκπαιδευτικό Προσωπικό", href: "/about/teachers" },
          { label: "Υπεύθυνοι Τμημάτων", href: "/about/heads" }
        ]
      },
      {
        label: "Λειτουργία",
        items: [
          { label: "Ωράριο", href: "/about/schedule" },
          { label: "Κανονισμός", href: "/about/rules" }
        ]
      },
      {
        label: "Εσωτερική Αυτοαξιολόγηση",
        items: [
          { label: "Εκθέσεις", href: "/about/evaluation" }
        ]
      }
    ]
  },
  { label: "Μαθητές", href: "/students" },
  { label: "Δραστηριότητες", href: "/activities" },
  { label: "Ανακοινώσεις", href: "/announcements" },
  { label: "Επικοινωνία", href: "/contact" },
];

export function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { data: settings } = useSettings();
  const { theme, setTheme } = useTheme();

  const logoUrl = settings?.logoUrl;
  const schoolName = settings?.schoolName || "4ο ΓΥΜΝΑΣΙΟ ΡΟΔΟΥ";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-primary/15 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 school-header-gradient/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-80 smooth-transition">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-12 w-12 object-contain drop-shadow-sm" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-lg font-display paper-shadow-lg">
                4
              </div>
            )}
            <div className="hidden flex-col sm:flex">
              <span className="text-sm font-bold leading-none text-primary uppercase">{schoolName}</span>
              <span className="text-xs font-medium text-muted-foreground uppercase text-zinc-600 dark:text-zinc-400">ΚΑΖΟΥΛΛΕΙΟ</span>
            </div>
          </Link>

          <div className="hidden md:flex md:gap-x-1 items-center">
            {NAV_ITEMS.map((item) => (
              item.submenu ? (
                <DropdownMenu key={item.label}>
                  <DropdownMenuTrigger asChild>
                    <button className={cn(
                      "nav-link text-foreground/70 flex items-center gap-1",
                      location.startsWith(item.href) && "text-primary font-semibold"
                    )}>
                      {item.label} <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-white dark:bg-zinc-950 border-2 shadow-xl z-[60]">
                    {item.submenu.map((sub) => (
                      <DropdownMenuSub key={sub.label}>
                        <DropdownMenuSubTrigger className="focus:bg-primary/10">
                          <span className="flex-1">{sub.label}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="bg-white dark:bg-zinc-950 border-2 shadow-xl z-[70]">
                          {sub.items.map((subItem) => (
                            <DropdownMenuItem key={subItem.href} asChild className="focus:bg-primary/10">
                              <Link href={subItem.href} className="w-full cursor-pointer">{subItem.label}</Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
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
              )
            ))}
            
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
              <SiteSearch />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-muted-foreground hover:text-primary transition-colors"
                title={theme === "dark" ? "Light Mode" : "Dark Mode"}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Link href="/secret/edit" className="text-muted-foreground hover:text-primary transition-colors">
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <div className="flex items-center gap-2 md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
            </div>
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <div className="flex flex-col gap-4 mt-8 pb-8">
                {NAV_ITEMS.map((item) => (
                  <div key={item.label}>
                    {item.submenu ? (
                      <div className="space-y-2">
                        <div className="text-lg font-bold text-primary px-2">{item.label}</div>
                        {item.submenu.map(sub => (
                          <div key={sub.label} className="pl-4 space-y-1">
                            <div className="text-sm font-semibold text-muted-foreground">{sub.label}</div>
                            {sub.items.map(subItem => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                className={cn(
                                  "block py-1 pl-2 text-md transition-colors hover:text-primary border-l-2 border-transparent",
                                  location === subItem.href && "text-primary font-bold border-primary"
                                )}
                                onClick={() => setIsOpen(false)}
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          "block py-2 text-lg font-medium transition-colors hover:text-primary",
                          location === item.href && "text-primary font-bold"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
                <Link
                  href="/secret/edit"
                  className="text-lg font-medium text-muted-foreground flex items-center gap-2 mt-4 border-t pt-4"
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
