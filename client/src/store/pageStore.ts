import { create } from 'zustand';
import type { Page, PageLayout } from '../core/types/layout.types';
import { pageService } from '../services/page.service';

interface PageState {
  pages: Page[];
  current: Page | null;
  isLoading: boolean;
  error: string | null;

  fetchAll: (portfolioId: string) => Promise<void>;
  fetchOne: (portfolioId: string, pageId: string) => Promise<void>;
  create: (
    portfolioId: string,
    data: { title: string; slug: string; order?: number; layout?: PageLayout; meta?: { icon?: string } },
  ) => Promise<Page>;
  update: (portfolioId: string, pageId: string, data: Partial<Page>) => Promise<void>;
  remove: (portfolioId: string, pageId: string) => Promise<void>;
  clearCurrent: () => void;
  clearPages: () => void;
  reset: () => void;
}

export const usePageStore = create<PageState>((set) => ({
  pages: [],
  current: null,
  isLoading: false,
  error: null,

  fetchAll: async (portfolioId) => {
    set({ isLoading: true, error: null, pages: [] });
    try {
      const pages = await pageService.getAll(portfolioId);
      set({ pages, isLoading: false });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status !== 401) {
        set({ error: 'Failed to load pages', isLoading: false });
      } else {
        set({ isLoading: false });
      }
    }
  },

  fetchOne: async (portfolioId, pageId) => {
    set({ isLoading: true, error: null });
    try {
      const page = await pageService.getById(portfolioId, pageId);
      set({ current: page, isLoading: false });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status !== 401) {
        set({ error: 'Failed to load page', isLoading: false });
      } else {
        set({ isLoading: false });
      }
    }
  },

  create: async (portfolioId, data) => {
    const page = await pageService.create(portfolioId, data);
    set((state) => ({ pages: [...state.pages, page] }));
    return page;
  },

  update: async (portfolioId, pageId, data) => {
    const updated = await pageService.update(portfolioId, pageId, data);
    set((state) => ({
      pages: state.pages.map((p) => (p._id === pageId ? updated : p)),
      current: state.current?._id === pageId ? updated : state.current,
    }));
  },

  remove: async (portfolioId, pageId) => {
    await pageService.remove(portfolioId, pageId);
    set((state) => ({
      pages: state.pages.filter((p) => p._id !== pageId),
      current: state.current?._id === pageId ? null : state.current,
    }));
  },

  clearCurrent: () => set({ current: null }),
  clearPages: () => set({ pages: [], current: null }),
  reset: () => set({ pages: [], current: null, error: null, isLoading: false }),
}));
