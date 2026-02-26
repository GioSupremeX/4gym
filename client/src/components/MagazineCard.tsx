import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { useSettings } from "@/hooks/use-articles";

export function MagazineCard() {
  const { data: settings } = useSettings();

  return (
    <Card className="overflow-hidden border-2 border-primary/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-primary/5 border-b border-primary/10 py-4">
        <CardTitle className="text-xl font-display font-bold text-primary flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {settings?.magazineTitle || "Το Περιοδικό Μας"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative aspect-[3/4] group">
          <img
            src={settings?.magazineImageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80"}
            alt="School Magazine"
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
            <Button className="w-full bg-primary hover:bg-primary/90 shadow-lg" asChild>
              <a href={settings?.magazineButtonUrl || "#"} target="_blank" rel="noopener noreferrer">
                {settings?.magazineButtonLabel || "Διαβάστε το Τεύχος"}
              </a>
            </Button>
          </div>
        </div>
        <div className="p-4 bg-muted/30 md:hidden">
          <Button className="w-full bg-primary hover:bg-primary/90" asChild>
            <a href={settings?.magazineButtonUrl || "#"} target="_blank" rel="noopener noreferrer">
              {settings?.magazineButtonLabel || "Διαβάστε το Τεύχος"}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
