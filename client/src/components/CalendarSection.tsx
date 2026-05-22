import { Calendar as CalendarIcon, BookOpen, Users, Clock, TrendingUp } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { el } from "date-fns/locale";
import { useSettings } from "@/hooks/use-articles";

export function CalendarSection() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { data: settings } = useSettings();

  const stats = [
    {
      value: settings?.stats1Number || "60+",
      label: settings?.stats1Label || "Χρόνια Ιστορίας",
      icon: Clock,
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-200 dark:border-blue-800/40",
    },
    {
      value: settings?.stats2Number || "300+",
      label: settings?.stats2Label || "Μαθητές",
      icon: Users,
      gradient: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-200 dark:border-emerald-800/40",
    },
    {
      value: settings?.stats3Number || "15+",
      label: settings?.stats3Label || "Εκπαιδευτικοί",
      icon: BookOpen,
      gradient: "from-violet-500 to-violet-600",
      bg: "bg-violet-50 dark:bg-violet-950/30",
      border: "border-violet-200 dark:border-violet-800/40",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-secondary/20 via-primary/5 to-secondary/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.025]" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-3">
            Το Σχολείο μας
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-accent to-accent/40 rounded-full mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Stats Cards */}
          <div className="space-y-5">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-5 p-5 rounded-2xl border-2 ${stat.bg} ${stat.border} hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group`}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <div className={`text-4xl font-display font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>
                    <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                  <TrendingUp className="ml-auto h-5 w-5 text-muted-foreground/30 group-hover:text-muted-foreground/50 transition-colors" />
                </div>
              );
            })}
          </div>

          {/* Calendar */}
          <div className="bg-white dark:bg-background rounded-3xl border-2 border-primary/15 shadow-2xl overflow-hidden">
            {/* 🔹 Clean white header with dark text for contrast */}
            <div className="bg-white dark:bg-background px-6 py-4 border-b-2 border-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md">
                  <CalendarIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl leading-none text-foreground">Ημερολόγιο</h3>
                  <p className="text-muted-foreground text-xs mt-1 font-medium">Σχολικός Προγραμματισμός</p>
                </div>
              </div>
            </div>
            <div className="p-4 flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={el}
                className="w-full"
                classNames={{
                  months: "w-full",
                  month: "w-full",
                  caption: "flex justify-center pt-1 relative items-center mb-4",
                  caption_label: "text-base font-display font-bold text-primary",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-8 w-8 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors inline-flex items-center justify-center",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse",
                  head_row: "flex w-full",
                  head_cell: "text-muted-foreground font-semibold text-[0.75rem] uppercase tracking-wider rounded-md flex-1 text-center py-2",
                  row: "flex w-full mt-1",
                  cell: "flex-1 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-primary/5 [&:has([aria-selected])]:bg-primary/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-9 w-full p-0 font-normal rounded-lg hover:bg-primary/10 hover:text-primary transition-colors aria-selected:opacity-100 inline-flex items-center justify-center",
                  day_selected: "bg-primary text-white hover:bg-primary/90 hover:text-white focus:bg-primary focus:text-white rounded-lg font-bold shadow-md",
                  day_today: "bg-accent/20 text-accent-foreground font-bold border border-accent/40 rounded-lg",
                  day_outside: "text-muted-foreground/30 opacity-50",
                  day_disabled: "text-muted-foreground opacity-30",
                }}
              />
            </div>
            <div className="px-5 pb-5">
              <div className="flex items-center gap-4 p-3.5 bg-primary/5 rounded-xl border border-primary/10">
                <div className="w-3 h-3 bg-primary rounded-full shadow-sm shadow-primary/50 animate-pulse" />
                <p className="text-sm text-muted-foreground font-medium">
                  Σημερινή ημέρα επισημασμένη
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
