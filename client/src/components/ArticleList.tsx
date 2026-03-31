import { Link } from "wouter";
import { useArticles } from "@/hooks/use-articles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, ChevronRight, ImageIcon, Calendar, ArrowRight, Tag } from "lucide-react";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_LABELS: Record<string, string> = {
  general: "Γενικά",
  teachers: "Εκπαιδευτικοί",
  heads: "Διεύθυνση",
  schedule: "Ωράριο",
  rules: "Κανονισμός",
  evaluation: "Αξιολόγηση",
  students: "Μαθητές",
  activities: "Δραστηριότητες",
  contact: "Επικοινωνία",
};

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  teachers: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  heads: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  schedule: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  rules: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  evaluation: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  students: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  activities: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  contact: "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300",
};

export function ArticleList() {
  const { data: articles, isLoading } = useArticles();

  if (isLoading) {
    return (
      <Card className="border-2 border-primary/15 shadow-xl overflow-hidden rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 pb-4">
          <CardTitle className="flex items-center gap-2 text-white font-display text-xl">
            <Newspaper className="h-5 w-5" />
            Τελευταία Άρθρα
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const latestArticles = [...(articles || [])]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 5);

  return (
    <Card className="border-2 border-primary/15 shadow-xl overflow-hidden rounded-2xl flex flex-col">
      <CardHeader className="bg-gradient-to-r from-primary to-primary/80 pb-4 pt-5">
        <CardTitle className="flex items-center gap-2 text-white font-display text-xl">
          <Newspaper className="h-5 w-5" />
          Τελευταία Άρθρα
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow">
        <ul className="divide-y divide-border/60">
          {latestArticles.map((article: any, idx: number) => (
            <li key={article.id} className="group">
              <Link href={`/articles/${article.id}`} className="flex gap-3 p-3.5 hover:bg-primary/5 transition-all duration-200 items-start">
                {article.imageUrls?.[0] ? (
                  <img
                    src={article.imageUrls[0]}
                    alt=""
                    className="h-16 w-16 object-cover rounded-xl shrink-0 border border-primary/10 group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl flex items-center justify-center shrink-0 border border-primary/10">
                    <ImageIcon className="h-7 w-7 text-primary/40" />
                  </div>
                )}
                <div className="flex-grow min-w-0 space-y-1.5">
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-sm leading-snug">
                    {article.title}
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${CATEGORY_COLORS[article.category] || CATEGORY_COLORS.general}`}>
                      <Tag className="h-2.5 w-2.5" />
                      {CATEGORY_LABELS[article.category] || article.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Calendar className="h-2.5 w-2.5" />
                      {format(new Date(article.publishedAt), "d MMM yyyy", { locale: el })}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-primary/40 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 shrink-0 mt-1" />
              </Link>
            </li>
          ))}
          {latestArticles.length === 0 && (
            <li className="p-10 text-center">
              <Newspaper className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground italic text-sm">Δεν υπάρχουν άρθρα ακόμα.</p>
            </li>
          )}
        </ul>
      </CardContent>
      <div className="p-4 border-t border-primary/10 bg-gradient-to-r from-primary/5 to-primary/3">
        <Link
          href="/articles"
          className="flex items-center justify-center gap-2 text-sm font-bold text-primary hover:text-primary/80 group transition-colors"
        >
          Προβολή όλων των άρθρων
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
    </Card>
  );
}
