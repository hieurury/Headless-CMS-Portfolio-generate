import React, { useEffect, useState } from 'react';
import { useParams, Link, NavLink } from 'react-router-dom';
import { PageRenderer } from '../../core/renderer/PageRenderer';
import { publicService, type PublicPageResponse } from '../../services/public.service';
import type { PageLayout } from '../../core/types/layout.types';
import { Loader2, Lock, LayoutGrid, ChevronRight } from 'lucide-react';

/**
 * PublicPortfolioPage — the public-facing runtime renderer.
 *
 * Route: /p/:portfolioSlug/:pageSlug
 * No authentication required.
 * Renders the JSON layout with a top page-navigation bar.
 */
export const PublicPortfolioPage: React.FC = () => {
  const { portfolioSlug, pageSlug } = useParams<{
    portfolioSlug: string;
    pageSlug: string;
  }>();
  const [data, setData] = useState<PublicPageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!portfolioSlug || !pageSlug) return;
      setIsLoading(true);
      setError(null);
      try {
        const result = await publicService.getPage(portfolioSlug, decodeURIComponent(pageSlug));
        setData(result);
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        setError(
          status === 404
            ? 'This portfolio page is not available or has not been published yet.'
            : 'Failed to load page. Please try again.',
        );
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [portfolioSlug, pageSlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-indigo-400" />
          <p className="text-slate-400 text-sm">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-800 flex items-center justify-center">
            <Lock size={28} className="text-slate-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Not Available</h1>
          <p className="text-slate-400 text-sm mb-6">
            {error ?? 'This portfolio page could not be found.'}
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
          >
            ← Explore Portfolios
          </Link>
        </div>
      </div>
    );
  }

  const hasMultiplePages = data.allPages.length > 1;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* SEO title */}
      <title>{`${data.page.title} — ${data.portfolio.title}`}</title>

      {/* ── Top navigation bar ─────────────────────────────────────── */}
      {hasMultiplePages && (
        <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#08080f]/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 h-12 flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {/* Back to portfolio hub */}
            <Link
              to={`/p/${portfolioSlug}`}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all shrink-0 mr-2"
            >
              <LayoutGrid size={12} />
              <span className="hidden sm:inline">{data.portfolio.title}</span>
            </Link>

            <ChevronRight size={12} className="text-slate-700 shrink-0" />

            {/* Page tabs */}
            <div className="flex items-center gap-1 ml-2 overflow-x-auto">
              {data.allPages.map((p) => (
                <NavLink
                  key={p.slug}
                  to={`/p/${portfolioSlug}/${p.slug}`}
                  className={({ isActive }) =>
                    `shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {p.title}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* ── Runtime renderer ───────────────────────────────────────── */}
      <PageRenderer layout={data.page.layout as PageLayout} />
    </div>
  );
};
