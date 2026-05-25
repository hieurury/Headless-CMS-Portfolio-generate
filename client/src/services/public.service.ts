import api from './api';

export interface PublicPortfolioCard {
  _id: string;
  title: string;
  slug: string;
  description: string;
  ownerName: string;
  pageCount: number;
  meta: { theme?: string; primaryColor?: string; fontFamily?: string };
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PublicPortfolioHub {
  title: string;
  slug: string;
  description: string;
  ownerName: string;
  meta: Record<string, unknown>;
  pages: { _id: string; title: string; slug: string; order: number }[];
}

export interface PublicPageResponse {
  portfolio: { title: string; slug: string; meta: Record<string, unknown> };
  page: { _id: string; title: string; slug: string; layout: { sections: unknown[] } };
  allPages: { title: string; slug: string }[];
}

export const publicService = {
  /** List all published portfolios with optional search + pagination */
  listAll: async (
    query?: string,
    page = 1,
    limit = 12,
  ): Promise<PaginatedResult<PublicPortfolioCard>> => {
    const params = new URLSearchParams();
    if (query && query.trim()) params.set('q', query.trim());
    params.set('page', String(page));
    params.set('limit', String(limit));
    const res = await api.get<PaginatedResult<PublicPortfolioCard>>(
      `/public?${params.toString()}`,
    );
    return res.data;
  },

  /** Get hub page for a portfolio (meta + page list) */
  getPortfolio: async (portfolioSlug: string): Promise<PublicPortfolioHub> => {
    const res = await api.get<PublicPortfolioHub>(`/public/${portfolioSlug}`);
    return res.data;
  },

  /** Get full layout + navigation for a specific page */
  getPage: async (
    portfolioSlug: string,
    pageSlug: string,
  ): Promise<PublicPageResponse> => {
    const res = await api.get<PublicPageResponse>(
      `/public/${portfolioSlug}/${pageSlug}`,
    );
    return res.data;
  },
};
