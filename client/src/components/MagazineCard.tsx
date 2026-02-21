import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function MagazineCard() {
  return (
    <Card className="overflow-hidden border-2 border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
      <CardHeader className="bg-primary/5 pb-4">
        <CardTitle className="flex items-center gap-2 text-xl text-primary font-display">
          <BookOpen className="h-5 w-5" />
          Τα STARακια
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex-grow flex flex-col items-center gap-4 text-center">
        <div className="relative aspect-[3/4] w-full max-w-[200px] overflow-hidden rounded-md shadow-md transform group-hover:scale-105 transition-transform duration-500">
          {/* Student magazine cover placeholder */}
          <img
            src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=500&fit=crop"
            alt="Περιοδικό Τα STARακια"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-4">
            <span className="text-white font-bold text-lg drop-shadow-md">Τεύχος 24</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Διαβάστε το τελευταίο τεύχος του μαθητικού μας περιοδικού, γεμάτο με άρθρα, συνεντεύξεις και δημιουργίες των μαθητών μας.
        </p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button className="w-full bg-primary hover:bg-primary/90 text-lg font-bold shadow-md hover:shadow-lg transition-all h-12" size="lg">
          ΑΝΟΙΓΜΑ ΠΕΡΙΟΔΙΚΟΥ
        </Button>
      </CardFooter>
    </Card>
  );
}
