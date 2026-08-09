import React, { useEffect, useState } from 'react';
import { useParams, Link, NavLink } from 'react-router-dom';
import { PageRenderer } from '../../core/renderer/PageRenderer';
import { publicService, type PublicPageResponse } from '../../services/public.service';
import type { PageLayout } from '../../core/types/layout.types';
import { Loader2, Lock, LayoutGrid, ChevronRight } from 'lucide-react';
import { SeoHelmet } from '../../core/renderer/SeoHelmet';
import { useI18n } from '../../hooks/useI18n';

/**
 * PublicPortfolioPage — the public-facing runtime renderer.
 *
 * Route: /p/:portfolioSlug/:pageSlug
 * No authentication required.
 * Renders the JSON layout with a top page-navigation bar.
 */
export const PublicPortfolioPage: React.FC = () => {
  const { username, portfolioSlug, pageSlug } = useParams<{
    username: string;
    portfolioSlug: string;
    pageSlug: string;
  }>();
  const [data, setData] = useState<PublicPageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    const load = async () => {
      if (!username || !portfolioSlug || !pageSlug) return;
      setIsLoading(true);
      try {
        const result = await publicService.getPage(username, portfolioSlug, pageSlug);
        setData(result);
      } catch {
        setError('This page is not available or has not been published.');
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [username, portfolioSlug, pageSlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-[var(--color-text-muted)]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center shadow-sm">
            <Lock size={28} className="text-[var(--color-text-muted)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-3">{t('publicHub.notAvailable')}</h1>
          <p className="text-[var(--color-text-muted)] text-sm mb-6">
            {error ?? t('publicHub.notAvailableDesc')}
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] text-sm font-semibold hover:opacity-85 transition-opacity shadow-sm"
          >
            ← {t('explore.title')}
          </Link>
        </div>
      </div>
    );
  }

  // Enrich meta for better AIO context
  const enrichedMeta = {
    ...(data.portfolio.meta as any),
    aio: {
      ...(data.portfolio.meta as any)?.aio,
      authorName: (data.portfolio.meta as any)?.aio?.authorName || data.portfolio.ownerName,
      bio: (data.portfolio.meta as any)?.aio?.bio || data.portfolio.description,
    },
    seo: {
      ...(data.portfolio.meta as any)?.seo,
      description: (data.portfolio.meta as any)?.seo?.description || data.portfolio.description,
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* SEO & AIO */}
      <SeoHelmet 
        portfolioTitle={data.portfolio.title}
        pageTitle={data.page.title}
        meta={enrichedMeta}
      />

      {/* ── Top navigation bar — always shown when portfolio has pages ── */}
      <nav className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {/* Back to portfolio hub */}
          <Link
            to={`/${username}/${portfolioSlug}`}
            className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] px-2 py-1.5 rounded-sm hover:bg-[var(--color-surface-2)] transition-all shrink-0 font-medium"
          >
            <LayoutGrid size={12} />
            <span className="truncate max-w-[120px]">{data.portfolio.title}</span>
          </Link>

          {data.allPages.length > 1 && (
            <>
              <ChevronRight size={12} className="text-[var(--color-border)] shrink-0 mx-1" />
              {/* Page tabs — use urlSlug (no leading slash) for correct URL matching */}
              <div className="flex items-center gap-1 ml-1 overflow-x-auto">
                {data.allPages.map((p) => (
                  <NavLink
                    key={p.urlSlug}
                    to={`/${username}/${portfolioSlug}/${p.urlSlug}`}
                    className={({ isActive }) =>
                      `shrink-0 px-3 py-1.5 rounded-sm text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[var(--color-text)] text-[var(--color-bg)] shadow-sm'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                      }`
                    }
                  >
                    {p.title}
                  </NavLink>
                ))}
              </div>
            </>
          )}
        </div>
      </nav>

      {/* ── Runtime renderer ───────────────────────────────────────── */}
      <PageRenderer layout={data.page.layout as PageLayout} />
    </div>
  );
};
