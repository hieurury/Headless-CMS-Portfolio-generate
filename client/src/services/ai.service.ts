import api from './api';
import type { PageLayout, PortfolioColors, PortfolioFonts, PageLayoutSettings } from '../core/types/layout.types';

export type AiMode = 'fast' | 'think';

export interface LayoutDiff {
  added: string[];
  modified: string[];
  deleted: Array<{ id: string; type: string; label: string }>;
}

interface GenerateLayoutResponse {
  layout: PageLayout;
  sectionsGenerated: number;
  markdownTree: string;
  mode: AiMode;
  layoutDiff: LayoutDiff | null;
  summary: string;
}

export interface PortfolioDesignMeta {
  pageLayout?: PageLayoutSettings;
  colors?: PortfolioColors;
  fonts?: PortfolioFonts;
}

export const aiService = {
  generateLayout: async (
    prompt: string,
    portfolioId: string,
    pageId?: string,
    currentLayout?: PageLayout,
    portfolioMeta?: PortfolioDesignMeta,
    mode: AiMode = 'fast',
  ): Promise<GenerateLayoutResponse> => {
    const res = await api.post<GenerateLayoutResponse>('/ai/generate-layout', {
      prompt,
      portfolioId,
      pageId,
      currentLayout,
      pageMeta: portfolioMeta,
      mode,
    });
    return res.data;
  },
};
