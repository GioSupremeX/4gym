import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { el } from "date-fns/locale";

export function CalendarSection() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <section className="py-12 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          
          {/* Creative Student Drawing Placeholder */}
          <Card className="flex-1 border-none shadow-none bg-transparent lg:max-w-md">
            <CardHeader className="px-0 pt-0">
               <CardTitle className="text-2xl font-display text-primary flex items-center gap-2">
                 <span className="bg-primary text-white p-1 rounded">Το</span> Ημερολόγιό μας...
               </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative aspect-video lg:aspect-square w-full overflow-hidden rounded-2xl shadow-xl rotate-[-2deg] hover:rotate-0 transition-transform duration-500 border-4 border-white">
                {/* School drawing / art placeholder */}
                <img 
                  src="https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&h=800&fit=crop" 
                  alt="Student Art" 
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
                  <p className="font-display font-bold text-primary text-lg">Καλλιτεχνικές Δημιουργίες</p>
                  <p className="text-sm text-muted-foreground">Έργα των μαθητών της Γ' Τάξης</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card className="flex-1 border-2 border-primary/20 shadow-lg">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2 text-primary font-display">
                <CalendarIcon className="h-5 w-5" />
                Προγραμματισμός Μήνα
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex justify-center items-center h-full">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={el}
                className="rounded-md border shadow-sm bg-white p-4 scale-110"
                classNames={{
                  head_cell: "text-muted-foreground font-normal text-[0.8rem]",
                  cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-primary/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                }}
              />
            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  );
}
