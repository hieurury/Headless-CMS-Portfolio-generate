import api from './api';

export interface PublicPortfolioCard {
  _id: string;
  title: string;
  slug: string;
  description: string;
  ownerUsername: string;
  ownerName: string;     // fullName or username fallback
  ownerAvatar: string;
  ownerEmail: string;
  pageCount: number;
  postCount: number;
  categories?: string[];
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

/** A page entry in the hub page list */
export interface PublicPageEntry {
  _id: string;
  title: string;
  slug: string;
  /** Normalized slug safe for use in URLs */
  urlSlug: string;
  order: number;
  meta?: { icon?: string };
}

export interface PublicPortfolioHub {
  username: string;
  ownerName: string;
  ownerAvatar: string;
  ownerEmail: string;
  title: string;
  slug: string;
  description: string;
  meta: Record<string, unknown>;
  pages: PublicPageEntry[];
  posts: {
    _id: string;
    title: string;
    slug: string;
    excerpt?: string;
    coverImage?: string;
    views: number;
    createdAt: string;
  }[];
}

export interface PublicPageNavEntry {
  title: string;
  slug: string;
  urlSlug: string;
}

export interface PublicPageResponse {
  portfolio: {
    title: string;
    slug: string;
    description?: string;
    ownerName?: string;
    ownerUsername?: string;
    meta: Record<string, unknown>;
  };
  page: { _id: string; title: string; slug: string; layout: { sections: unknown[] } };
  allPages: PublicPageNavEntry[];
}

export interface PublicPostResponse {
  portfolio: {
    title: string;
    slug: string;
    description?: string;
    ownerName?: string;
    ownerUsername?: string;
    meta: Record<string, any>;
  };
  post: {
    title: string;
    slug: string;
    customFieldsData: Record<string, any>;
    coverImage?: string;
    tags?: string[];
    createdAt?: string;
    readingTime?: number;
    viewCount?: number;
  };
  postType: { customFieldsSchema: any[] };
  allPages: PublicPageNavEntry[];
}

export interface UserPublicProfile {
  username: string;
  fullName?: string | null;
  age?: number | null;
  email: string;
  avatar?: string | null;
  background?: string | null;
  slogan?: string | null;
  occupation?: string | null;
  interests?: string[];
  portfolios: {
    _id: string;
    title: string;
    slug: string;
    description: string;
    meta: any;
    categories: string[];
    pageCount: number;
  }[];
}

/** Mirror the backend normalizeSlug utility on the frontend */
export function normalizeSlug(slug: string): string {
  const stripped = slug.replace(/^\/+/, '');
  return stripped.length > 0 ? stripped : 'home';
}

export const publicService = {
  /**
   * List all published portfolios with optional search + pagination.
   * Pass excludeUsername to hide the current user's own portfolios.
   */
  listAll: async (
    query?: string,
    page = 1,
    limit = 12,
    excludeUsername?: string,
    category?: string,
  ): Promise<PaginatedResult<PublicPortfolioCard>> => {
    const params = new URLSearchParams();
    if (query && query.trim()) params.set('q', query.trim());
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (excludeUsername) params.set('excludeUsername', excludeUsername);
    if (category && category !== 'all') params.set('category', category);
    const res = await api.get<PaginatedResult<PublicPortfolioCard>>(
      `/public?${params.toString()}`,
    );
    return res.data;
  },

  /** Get user's public profile + portfolios */
  getUserProfile: async (username: string): Promise<UserPublicProfile> => {
    const res = await api.get<UserPublicProfile>(`/public/user/${username}`);
    return res.data;
  },

  /** Get hub page for a portfolio (meta + page list with urlSlugs) */
  getPortfolio: async (
    username: string,
    portfolioSlug: string,
  ): Promise<PublicPortfolioHub> => {
    const res = await api.get<PublicPortfolioHub>(
      `/public/user/${username}/${portfolioSlug}`,
    );
    return res.data;
  },

  /** Get full layout + navigation for a specific page */
  getPage: async (
    username: string,
    portfolioSlug: string,
    pageUrlSlug: string,
  ): Promise<PublicPageResponse> => {
    const res = await api.get<PublicPageResponse>(
      `/public/user/${username}/${portfolioSlug}/${pageUrlSlug}`,
    );
    return res.data;
  },

  /** Get a public post */
  getPost: async (
    username: string,
    portfolioSlug: string,
    postSlug: string,
  ): Promise<PublicPostResponse> => {
    const res = await api.get<PublicPostResponse>(
      `/public/user/${username}/${portfolioSlug}/post/${postSlug}`,
    );
    return res.data;
  },
};
