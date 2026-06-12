import api from './api';
import type { PageLayout } from '../core/types/layout.types';

interface GenerateLayoutResponse {
  layout: PageLayout;
  sectionsGenerated: number;
}

export const aiService = {
  generateLayout: async (
    prompt: string,
    portfolioId: string,
    pageId?: string,
    currentLayout?: PageLayout,
  ): Promise<GenerateLayoutResponse> => {
    const res = await api.post<GenerateLayoutResponse>('/ai/generate-layout', {
      prompt,
      portfolioId,
      pageId,
      currentLayout,
    });
    return res.data;
  },
};
