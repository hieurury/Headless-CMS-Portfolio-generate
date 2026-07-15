import api from './api';
import type { PageLayout, PortfolioColors, PortfolioFonts, PageLayoutSettings } from '../core/types/layout.types';

interface GenerateLayoutResponse {
  layout: PageLayout;
  sectionsGenerated: number;
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
  ): Promise<GenerateLayoutResponse> => {
    const res = await api.post<GenerateLayoutResponse>('/ai/generate-layout', {
      prompt,
      portfolioId,
      pageId,
      currentLayout,
      portfolioMeta,
    });
    return res.data;
  },
};
