import { create } from 'zustand';
import type { Portfolio } from '../core/types/layout.types';
import { portfolioService } from '../services/portfolio.service';

interface PortfolioState {
  portfolios: Portfolio[];
  current: Portfolio | null;
  isLoading: boolean;
  error: string | null;

  fetchAll: () => Promise<void>;
  fetchOne: (id: string) => Promise<void>;
  create: (data: {
    title: string;
    slug: string;
    description?: string;
    categories?: string[];
    meta?: { theme?: string; primaryColor?: string; fontFamily?: string; icon?: string; categories?: string[] };
  }) => Promise<Portfolio>;
  update: (id: string, data: Partial<Portfolio>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearCurrent: () => void;
  reset: () => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolios: [],
  current: null,
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const portfolios = await portfolioService.getAll();
      set({ portfolios, isLoading: false });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      // Don't show error for 401 — the API interceptor handles redirect
      if (status !== 401) {
        set({ error: 'Failed to load portfolios', isLoading: false });
      } else {
        set({ isLoading: false });
      }
    }
  },

  fetchOne: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const portfolio = await portfolioService.getById(id);
      set({ current: portfolio, isLoading: false });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status !== 401) {
        set({ error: 'Failed to load portfolio', isLoading: false });
      } else {
        set({ isLoading: false });
      }
    }
  },

  create: async (data) => {
    const portfolio = await portfolioService.create(data);
    set((state) => ({ portfolios: [portfolio, ...state.portfolios] }));
    return portfolio;
  },

  update: async (id, data) => {
    const updated = await portfolioService.update(id, data);
    set((state) => ({
      portfolios: state.portfolios.map((p) => (p._id === id ? updated : p)),
      current: state.current?._id === id ? updated : state.current,
    }));
  },

  remove: async (id) => {
    await portfolioService.remove(id);
    set((state) => ({
      portfolios: state.portfolios.filter((p) => p._id !== id),
      current: state.current?._id === id ? null : state.current,
    }));
  },

  clearCurrent: () => set({ current: null }),

  // Called on logout to prevent stale data from previous user session
  reset: () => set({ portfolios: [], current: null, error: null, isLoading: false }),
}));
