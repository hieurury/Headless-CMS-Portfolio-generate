import api from './api';
import type { Portfolio } from '../core/types/layout.types';

export const portfolioService = {
  getAll: async (): Promise<Portfolio[]> => {
    const res = await api.get<Portfolio[]>('/portfolios');
    return res.data;
  },

  getById: async (id: string): Promise<Portfolio> => {
    const res = await api.get<Portfolio>(`/portfolios/${id}`);
    return res.data;
  },

  create: async (data: {
    title: string;
    slug: string;
    description?: string;
    categories?: string[];
    meta?: { theme?: string; primaryColor?: string; fontFamily?: string; icon?: string; categories?: string[] };
  }): Promise<Portfolio> => {
    const res = await api.post<Portfolio>('/portfolios', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Portfolio>): Promise<Portfolio> => {
    const res = await api.patch<Portfolio>(`/portfolios/${id}`, data);
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/portfolios/${id}`);
  },
};
