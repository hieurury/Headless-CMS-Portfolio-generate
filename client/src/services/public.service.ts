import api from './api';

export interface PublicPortfolioCard {
  _id: string;
  title: string;
  slug: string;
  description: string;
  ownerName: string;
  ownerAvatar: string;
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

/** A page entry in the hub page list — includes urlSlug for correct link building */
export interface PublicPageEntry {
  _id: string;
  title: string;
  slug: string;
  /** Normalized slug safe for use in URLs — strips leading /, converts "/" to "home" */
  urlSlug: string;
  order: number;
  meta?: { icon?: string };
}

export interface PublicPortfolioHub {
  title: string;
  slug: string;
  description: string;
  ownerName: string;
  meta: Record<string, unknown>;
  pages: PublicPageEntry[];
}

export interface PublicPageNavEntry {
  title: string;
  slug: string;
  urlSlug: string;
}

export interface PublicPageResponse {
  portfolio: { title: string; slug: string; description?: string; ownerName?: string; meta: Record<string, unknown> };
  page: { _id: string; title: string; slug: string; layout: { sections: unknown[] } };
  /** All published pages in this portfolio with normalized slugs for navigation */
  allPages: PublicPageNavEntry[];
}

export interface PublicPostResponse {
  portfolio: { title: string; slug: string; description?: string; ownerName?: string; meta: Record<string, any> };
  post: { title: string; slug: string; customFieldsData: Record<string, any>; coverImage?: string; tags?: string[]; createdAt?: string; readingTime?: number; viewCount?: number };
  postType: { customFieldsSchema: any[] };
  allPages: PublicPageNavEntry[];
}

/** Mirror the backend normalizeSlug utility on the frontend */
export function normalizeSlug(slug: string): string {
  const stripped = slug.replace(/^\/+/, '');
  return stripped.length > 0 ? stripped : 'home';
}

export const publicService = {
  /**
   * List all published portfolios with optional search + pagination.
   * Pass excludeOwnerId to hide the current user's own portfolios.
   */
  listAll: async (
    query?: string,
    page = 1,
    limit = 12,
    excludeOwnerId?: string,
  ): Promise<PaginatedResult<PublicPortfolioCard>> => {
    const params = new URLSearchParams();
    if (query && query.trim()) params.set('q', query.trim());
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (excludeOwnerId) params.set('excludeOwnerId', excludeOwnerId);
    const res = await api.get<PaginatedResult<PublicPortfolioCard>>(
      `/public?${params.toString()}`,
    );
    return res.data;
  },

  /** Get hub page for a portfolio (meta + page list with urlSlugs) */
  getPortfolio: async (portfolioSlug: string): Promise<PublicPortfolioHub> => {
    const res = await api.get<PublicPortfolioHub>(`/public/${portfolioSlug}`);
    return res.data;
  },

  /** Get full layout + navigation for a specific page (uses urlSlug in URL) */
  getPage: async (
    portfolioSlug: string,
    pageUrlSlug: string,
  ): Promise<PublicPageResponse> => {
    const res = await api.get<PublicPageResponse>(
      `/public/${portfolioSlug}/${pageUrlSlug}`,
    );
    return res.data;
  },

  /** Get a public post */
  getPost: async (
    portfolioSlug: string,
    postSlug: string,
  ): Promise<PublicPostResponse> => {
    const res = await api.get<PublicPostResponse>(
      `/public/${portfolioSlug}/posts/${postSlug}`,
    );
    return res.data;
  },
};
