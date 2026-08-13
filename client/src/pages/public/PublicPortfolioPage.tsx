import React, { useEffect, useState } from 'react';
import { useParams, Link, NavLink } from 'react-router-dom';
import { PageRenderer } from '../../core/renderer/PageRenderer';
import { publicService, type PublicPageResponse } from '../../services/public.service';
import type { PageLayout } from '../../core/types/layout.types';
import { Loader2, Lock, LayoutGrid, ChevronRight, X, Users, Compass } from 'lucide-react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

      {/* ── Floating Sidebar Toggle ── */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-1/2 right-0 -translate-y-1/2 bg-[var(--color-surface)] border border-r-0 border-[var(--color-border)] p-2.5 rounded-l-md shadow-lg z-[9999] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors group"
        title="Portfolio Details"
      >
        <LayoutGrid size={20} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* ── Sidebar Overlay ── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar Panel ── */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-[var(--color-bg)] border-l border-[var(--color-border)] shadow-2xl z-[9999] transform transition-transform duration-300 flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-2">
            <LayoutGrid size={18} className="text-[var(--color-text-muted)]" />
            <span className="font-bold text-[var(--color-text)] truncate">{data.portfolio.title}</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-sm hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          {/* Info */}
          <div>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-3">{t('publicHub.by')}</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center border border-[var(--color-border)]">
                <Users size={16} className="text-[var(--color-text-muted)]" />
              </div>
              <span className="text-sm font-bold text-[var(--color-text)]">{data.portfolio.ownerName || username}</span>
            </div>
            {data.portfolio.description && (
              <p className="text-sm text-[var(--color-text-muted)] mt-4 leading-relaxed">
                {data.portfolio.description}
              </p>
            )}
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-2">
              {t('publicHub.pagesTab')}
            </p>
            <div className="flex flex-col gap-1">
              {data.allPages.map((p) => {
                const displaySlug = p.urlSlug === '/' || p.urlSlug === '' ? 'home' : p.urlSlug;
                return (
                  <NavLink
                    key={p.urlSlug}
                    to={`/${username}/${portfolioSlug}/${displaySlug}`}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) =>
                      `px-3 py-2.5 rounded-sm text-sm font-medium transition-all flex items-center justify-between group ${
                        isActive
                          ? 'bg-[var(--color-text)] text-[var(--color-bg)] shadow-sm'
                          : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'
                      }`
                    }
                  >
                    {p.title}
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-border)] shrink-0">
          <Link
            to="/explore"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-sm bg-[var(--color-surface-2)] hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] text-[var(--color-text)] text-sm font-bold transition-colors"
          >
            <Compass size={16} />
            {t('explore.explore')}
          </Link>
        </div>
      </div>

      {/* ── Runtime renderer ───────────────────────────────────────── */}
      <PageRenderer layout={data.page.layout as PageLayout} />
    </div>
  );
};
