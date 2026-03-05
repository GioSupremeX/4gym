import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Trophy } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { el } from "date-fns/locale";
import { useSettings } from "@/hooks/use-articles";

export function CalendarSection() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { data: settings } = useSettings();

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
              <div className="space-y-1">
                <h4 className="text-4xl font-display font-bold text-primary">{settings?.stats1Number || "60+"}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">{settings?.stats1Label || "Χρόνια Ιστορίας"}</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-4xl font-display font-bold text-primary">{settings?.stats2Number || "300+"}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">{settings?.stats2Label || "Μαθητές"}</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-4xl font-display font-bold text-primary">{settings?.stats3Number || "35+"}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">{settings?.stats3Label || "Εκπαιδευτικοί"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card className="flex-1 border-2 border-primary/20 shadow-lg bg-white dark:bg-zinc-900">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2 text-primary font-display whitespace-nowrap overflow-hidden text-ellipsis">
                <CalendarIcon className="h-5 w-5 shrink-0" />
                <span className="truncate">Προγραμματισμός Μήνα</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex justify-center items-center h-full">
              <div className="w-full max-w-[350px] overflow-hidden">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={el}
                  className="rounded-md border shadow-sm bg-white dark:bg-zinc-950 p-4 scale-90 sm:scale-100 transition-all"
                  classNames={{
                    head_cell: "text-muted-foreground font-normal text-[0.8rem]",
                    cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-primary/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                  }}
                />
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  );
}
