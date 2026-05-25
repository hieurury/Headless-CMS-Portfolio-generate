import api from './api';
import type { Page, PageLayout } from '../core/types/layout.types';

export const pageService = {
  getAll: async (portfolioId: string): Promise<Page[]> => {
    const res = await api.get<Page[]>(`/portfolios/${portfolioId}/pages`);
    return res.data;
  },

  getById: async (portfolioId: string, pageId: string): Promise<Page> => {
    const res = await api.get<Page>(
      `/portfolios/${portfolioId}/pages/${pageId}`,
    );
    return res.data;
  },

  create: async (
    portfolioId: string,
    data: {
      title: string;
      slug: string;
      order?: number;
      layout?: PageLayout;
    },
  ): Promise<Page> => {
    const res = await api.post<Page>(
      `/portfolios/${portfolioId}/pages`,
      data,
    );
    return res.data;
  },

  update: async (
    portfolioId: string,
    pageId: string,
    data: Partial<Page>,
  ): Promise<Page> => {
    const res = await api.patch<Page>(
      `/portfolios/${portfolioId}/pages/${pageId}`,
      data,
    );
    return res.data;
  },

  remove: async (portfolioId: string, pageId: string): Promise<void> => {
    await api.delete(`/portfolios/${portfolioId}/pages/${pageId}`);
  },
};
