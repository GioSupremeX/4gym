import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink } from "lucide-react";
import { useSettings } from "@/hooks/use-articles";

export function MagazineCard() {
  const { data: settings } = useSettings();

  if (settings?.magazineEnabled === "false") return null;

  return (
    <Card className="overflow-hidden border-2 border-primary/15 shadow-xl rounded-2xl group">
      <CardHeader className="bg-gradient-to-r from-primary to-primary/80 py-4 px-5">
        <CardTitle className="text-lg font-display font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          {settings?.magazineTitle || "Το Περιοδικό Μας"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative">
        <div className="relative overflow-hidden" style={{ maxHeight: "240px" }}>
          <img
            src={settings?.magazineImageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80"}
            alt="School Magazine"
            className="object-cover w-full h-60 transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent flex items-end p-5">
            <a
              href={settings?.magazineButtonUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-white text-primary font-bold py-2.5 px-4 rounded-xl hover:bg-primary hover:text-white transition-all duration-300 text-sm shadow-lg hover:shadow-xl hover:scale-105"
            >
              <ExternalLink className="h-4 w-4" />
              {settings?.magazineButtonLabel || "Διαβάστε το Τεύχος"}
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
