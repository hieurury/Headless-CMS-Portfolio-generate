import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePageStore } from '../../store/pageStore';
import { PageRenderer } from '../../core/renderer/PageRenderer';
import { ArrowLeft, Loader2, Code2 } from 'lucide-react';

/**
 * PortfolioPreviewPage — the runtime renderer in action.
 *
 * 1. Fetches the page JSON from the API
 * 2. Passes layout to PageRenderer
 * 3. PageRenderer → SectionRenderer → ComponentRegistry → React Component
 *
 * This is a full-screen preview of how the portfolio will look.
 */
export const PortfolioPreviewPage: React.FC = () => {
  const { portfolioId, pageId } = useParams<{ portfolioId: string; pageId: string }>();
  const { current: page, fetchOne, isLoading, error } = usePageStore();

  useEffect(() => {
    if (portfolioId && pageId) {
      fetchOne(portfolioId, pageId);
    }
  }, [portfolioId, pageId, fetchOne]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-[var(--color-text-muted)]" />
          <p className="text-[var(--color-text-muted)]">Loading page...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error ?? 'Page not found'}</p>
          <Link to="/dashboard" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:underline">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Preview toolbar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl glass border border-white/10 shadow-xl backdrop-blur-lg">
          <Link
            to={`/dashboard/portfolios/${portfolioId}`}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-sm text-slate-400">
            Previewing: <span className="text-white font-medium">{page.title}</span>
          </span>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-xs font-mono text-slate-500">{page.slug}</span>
          <div className="w-px h-4 bg-white/10" />
          <button
            onClick={() => {
              const json = JSON.stringify(page.layout, null, 2);
              const w = window.open('', '_blank');
              w?.document.write(
                `<pre style="background:#0a0a0f;color:#e2e8f0;padding:2rem;font-family:monospace;font-size:13px;">${json}</pre>`,
              );
            }}
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <Code2 size={14} /> JSON
          </button>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-xs text-slate-600">
            {page.layout?.sections?.length ?? 0} sections
          </span>
        </div>
      </div>

      {/* Runtime Renderer — the core of Phase 2 */}
      <PageRenderer layout={page.layout} />
    </div>
  );
};
