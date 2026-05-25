import React from 'react';
import type { PageLayout } from '../types/layout.types';
import { SectionRenderer } from './SectionRenderer';

interface PageRendererProps {
  layout: PageLayout;
  className?: string;
}

/**
 * PageRenderer — iterates over layout.sections[] and renders each via SectionRenderer.
 *
 * This is the top-level renderer entry point.
 * Used by PortfolioPreviewPage to render a full portfolio page from JSON.
 *
 * Runtime flow:
 *   MongoDB layout JSON
 *     → PageRenderer (sections loop)
 *       → SectionRenderer (type resolution)
 *         → React Component
 */
export const PageRenderer: React.FC<PageRendererProps> = ({
  layout,
  className = '',
}) => {
  if (!layout?.sections || layout.sections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center px-4">
        <div className="max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Empty Page</h3>
          <p className="text-slate-500 text-sm">
            This page has no sections yet. Add components through the CMS to see them rendered here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`page-renderer ${className}`}>
      {layout.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
};
