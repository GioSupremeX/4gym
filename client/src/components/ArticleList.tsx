import { Link } from "wouter";
import { useArticles } from "@/hooks/use-articles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, ChevronRight, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export function ArticleList() {
  const { data: articles, isLoading } = useArticles();

  if (isLoading && !articles) {
    return (
      <Card className="h-full border-2 border-primary/10 shadow-lg flex flex-col">
        <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
          <CardTitle className="flex items-center gap-2 text-xl text-primary font-display">
            <Newspaper className="h-5 w-5" />
            Τελευταία άρθρα...
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  const generalArticles = articles?.filter(a => a.category === "general").slice(0, 5) || [];

  return (
    <Card className="h-full border-2 border-primary/10 shadow-lg flex flex-col">
      <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
        <CardTitle className="flex items-center gap-2 text-xl text-primary font-display">
          <Newspaper className="h-5 w-5" />
          Τελευταία άρθρα...
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow">
        <ul className="divide-y divide-border">
          {generalArticles.map((article: any) => (
            <li key={article.id} className="group relative transition-colors hover:bg-muted/50">
              <Link href={`/articles/${article.id}`} className="block p-4">
                <div className="flex items-center gap-3">
                  {article.imageUrls?.[0] ? (
                    <img src={article.imageUrls[0]} alt="" className="h-12 w-12 object-cover rounded-md shrink-0 border border-primary/10" />
                  ) : (
                    <div className="h-12 w-12 bg-primary/5 rounded-md flex items-center justify-center shrink-0 border border-primary/10">
                      <ImageIcon className="h-6 w-6 text-primary/40" />
                    </div>
                  )}
                  <div className="flex-grow space-y-1">
                    <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1 text-sm">
                      {article.title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase font-bold tracking-wider">
                      {format(new Date(article.publishedAt), "PPP", { locale: el })}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              </Link>
            </li>
          ))}
          {generalArticles.length === 0 && (
            <li className="p-8 text-center text-muted-foreground italic text-sm">
              Δεν υπάρχουν νέα ακόμα.
            </li>
          )}
        </ul>
      </CardContent>
      <div className="p-4 border-t border-primary/10 bg-primary/5 text-center">
        <Link href="/articles" className="text-sm font-semibold text-primary hover:underline">
          Προβολή όλων των άρθρων
        </Link>
      </div>
    </Card>
  );
}
