import { useQuery } from "@tanstack/react-query";
import { api, type ArticlesListResponse, type ArticleResponse, type SiteSettingsResponse } from "@shared/routes";

// GET /api/articles
export function useArticles() {
  return useQuery({
    queryKey: [api.articles.list.path],
    queryFn: async () => {
      const res = await fetch(api.articles.list.path);
      if (!res.ok) throw new Error("Failed to fetch articles");
      return (await res.json()) as ArticlesListResponse;
    },
  });
}

// GET /api/articles/:id
export function useArticle(id: number) {
  return useQuery({
    queryKey: [api.articles.get.path, id],
    queryFn: async () => {
      const url = api.articles.get.path.replace(":id", id.toString());
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch article");
      return (await res.json()) as ArticleResponse;
    },
    enabled: !!id,
  });
}

// GET /api/settings
export function useSettings() {
  return useQuery({
    queryKey: [api.settings.get.path],
    queryFn: async () => {
      const res = await fetch(api.settings.get.path);
      if (!res.ok) throw new Error("Failed to fetch settings");
      return (await res.json()) as SiteSettingsResponse;
    },
  });
}
