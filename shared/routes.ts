import { z } from 'zod';
import { insertArticleSchema, articles } from './schema';

export const errorSchemas = {
  notFound: z.object({ message: z.string() }),
};

export const api = {
  articles: {
    list: {
      method: 'GET' as const,
      path: '/api/articles' as const,
      responses: {
        200: z.array(z.custom<typeof articles.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/articles/:id' as const,
      responses: {
        200: z.custom<typeof articles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ArticleResponse = z.infer<typeof api.articles.get.responses[200]>;
export type ArticlesListResponse = z.infer<typeof api.articles.list.responses[200]>;
