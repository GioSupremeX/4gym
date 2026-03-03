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
          
          {/* School Info / Stats */}
          <Card className="flex-1 border-2 border-primary/20 shadow-lg bg-white">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
               <CardTitle className="text-2xl font-display text-primary flex items-center gap-2">
                 <span className="bg-primary text-white p-1 rounded">Το</span> Σχολείο μας
               </CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex flex-col justify-center gap-6 h-full min-h-[300px]">
              <div className="space-y-2">
                <h4 className="text-4xl font-display font-bold text-primary">60+</h4>
                <p className="text-muted-foreground font-medium uppercase tracking-wider">Χρόνια Ιστορίας</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-4xl font-display font-bold text-primary">300+</h4>
                <p className="text-muted-foreground font-medium uppercase tracking-wider">Μαθητές</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-4xl font-display font-bold text-primary">35+</h4>
                <p className="text-muted-foreground font-medium uppercase tracking-wider">Εκπαιδευτικοί</p>
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
