import { useArticles } from "@/hooks/use-articles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export function ArticleList() {
  const { data: articles, isLoading } = useArticles();

  // Mock data if backend is empty/loading for better preview
  const displayArticles = articles && articles.length > 0 ? articles : [
    { id: 1, title: "Έναρξη νέας σχολικής χρονιάς - Αγιασμός", publishedAt: new Date().toISOString() },
    { id: 2, title: "Εκδρομή της Γ' Γυμνασίου στην Αθήνα", publishedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 3, title: "Συμμετοχή στον διαγωνισμό Ρομποτικής", publishedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: 4, title: "Ημερίδα επαγγελματικού προσανατολισμού", publishedAt: new Date(Date.now() - 86400000 * 10).toISOString() },
  ];

  return (
    <Card className="h-full border-2 border-primary/10 shadow-lg flex flex-col">
      <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
        <CardTitle className="flex items-center gap-2 text-xl text-primary font-display">
          <Newspaper className="h-5 w-5" />
          Τελευταία άρθρα...
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow">
        {isLoading && !articles ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {displayArticles.map((article: any) => (
              <li key={article.id} className="group relative transition-colors hover:bg-muted/50">
                <a href={`/article/${article.id}`} className="block p-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1">
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {format(new Date(article.publishedAt), "dd MMMM yyyy", { locale: el })}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <div className="p-4 border-t border-primary/10 bg-primary/5 text-center">
        <a href="/articles" className="text-sm font-semibold text-primary hover:underline">
          Προβολή όλων των άρθρων
        </a>
      </div>
    </Card>
  );
}
