import { useState } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Article } from "@shared/schema";
import { Input } from "@/components/ui/input";

export function SiteSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: articles } = useQuery<Article[]>({ queryKey: ["/api/articles"] });

  const results = !query.trim()
    ? []
    : (articles || []).filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.content.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-primary/5"
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Αναζήτηση</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setQuery(""); }} />
          <div className="absolute right-0 top-full mt-2 w-[340px] md:w-[420px] bg-white dark:bg-background border-2 border-primary/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-up">
            <div className="p-3 border-b border-primary/10 flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Αναζήτηση άρθρων..."
                className="border-0 shadow-none focus-visible:ring-0 h-10"
              />
              {query && (
                <button onClick={() => setQuery("")} className="p-1 hover:bg-muted rounded">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="max-h-[360px] overflow-y-auto">
              {results.length === 0 && query.trim() && (
                <div className="p-6 text-center text-sm text-muted-foreground">Δεν βρέθηκαν αποτελέσματα.</div>
              )}
              {results.map((article) => (
                <Link key={article.id} href={`/articles/${article.id}`} onClick={() => { setOpen(false); setQuery(""); }}>
                  <div className="flex items-center gap-3 p-3 hover:bg-primary/5 transition-colors border-b border-primary/5 last:border-0 cursor-pointer">
                    <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{article.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{new Date(article.publishedAt).toLocaleDateString("el-GR")}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
