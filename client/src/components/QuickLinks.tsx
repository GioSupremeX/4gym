import { Link } from "wouter";
import { Newspaper, BookOpen, Users, Calendar, Mail, GraduationCap } from "lucide-react";

const LINKS = [
  { icon: Newspaper, label: "Όλα τα Νέα", href: "/articles", color: "from-blue-500 to-blue-600" },
  { icon: BookOpen, label: "Ανακοινώσεις", href: "/announcements", color: "from-violet-500 to-violet-600" },
  { icon: GraduationCap, label: "Εκπαιδευτικοί", href: "/about/teachers", color: "from-emerald-500 to-emerald-600" },
  { icon: Calendar, label: "Δραστηριότητες", href: "/activities", color: "from-orange-500 to-orange-600" },
  { icon: Users, label: "Μαθητές", href: "/students", color: "from-pink-500 to-pink-600" },
  { icon: Mail, label: "Επικοινωνία", href: "/contact", color: "from-cyan-500 to-cyan-600" },
];

export function QuickLinks() {
  return (
    <section className="py-12 bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {LINKS.map((link, i) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <div className="group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-primary/5 bg-white dark:bg-background hover:border-primary/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-bold text-center leading-tight group-hover:text-primary transition-colors">
                    {link.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
