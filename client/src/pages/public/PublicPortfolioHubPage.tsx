import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { publicService, type PublicPortfolioHub } from '../../services/public.service';
import { useUIStore } from '../../store/uiStore';
import {
  Loader2, Lock, FileText, ArrowRight, Globe, Users, LayoutGrid, Sun, Moon, Folder, Briefcase, Code, Palette, Laptop, Camera, Book, Video, Image as ImageIcon
} from 'lucide-react';

const ICONS = [
  { name: 'Folder', component: Folder },
  { name: 'Briefcase', component: Briefcase },
  { name: 'FileText', component: FileText },
  { name: 'Code', component: Code },
  { name: 'Palette', component: Palette },
  { name: 'Laptop', component: Laptop },
  { name: 'Camera', component: Camera },
  { name: 'Book', component: Book },
  { name: 'Video', component: Video },
  { name: 'ImageIcon', component: ImageIcon },
];

export const PublicPortfolioHubPage: React.FC = () => {
  const { portfolioSlug } = useParams<{ portfolioSlug: string }>();
  const [data, setData] = useState<PublicPortfolioHub | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme, language, toggleTheme, toggleLanguage } = useUIStore();

  useEffect(() => {
    const load = async () => {
      if (!portfolioSlug) return;
      setIsLoading(true);
      try {
        const result = await publicService.getPortfolio(portfolioSlug);
        setData(result);
      } catch {
        setError('This portfolio is not available or has not been published.');
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [portfolioSlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <Loader2 size={36} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center shadow-sm">
            <Lock size={28} className="text-[var(--color-text-muted)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-3">Not Available</h1>
          <p className="text-[var(--color-text-muted)] text-sm mb-6">{error}</p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] text-sm font-semibold hover:opacity-85 transition-opacity shadow-sm"
          >
            ← Explore Portfolios
          </Link>
        </div>
      </div>
    );
  }

  const PortfolioIcon = ICONS.find(ic => ic.name === data.meta?.icon)?.component || Folder;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* ── Nav ────────────────────────────────────────────────────── */}
      <nav className="home-navbar home-navbar--scrolled sticky top-0 z-40">
        <div className="home-navbar__inner container-max px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/explore"
              className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-sm font-medium transition-colors"
            >
              <LayoutGrid size={16} /> Explore
            </Link>
            <span className="text-[var(--color-border)]">/</span>
            <span className="text-[var(--color-text)] text-sm font-semibold">{data.title}</span>
            <div className="ml-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-xs font-medium text-emerald-500 border border-emerald-500/20 hidden sm:flex">
              <Globe size={12} /> Published
            </div>
          </div>
          
          <div className="home-navbar__right">
            <div className="home-navbar__controls">
              <button
                className="home-navbar__icon-btn"
                onClick={toggleLanguage}
                title={language === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang Tiếng Anh'}
              >
                <span className="home-navbar__lang-label">{language.toUpperCase()}</span>
              </button>
              
              <button
                className="home-navbar__icon-btn"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-24 sm:py-32">
        {/* ── Hero ───────────────────────────────────────────────────── */}
        <div className="text-center mb-16 animate-slide-up">
          <div
            className="w-24 h-24 mx-auto mb-6 rounded-lg flex items-center justify-center bg-[var(--color-text)] text-[var(--color-bg)] shadow-md"
          >
            <PortfolioIcon size={40} />
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--color-text)] mb-4 tracking-tight">{data.title}</h1>

          {data.description && (
            <p className="text-[var(--color-text-muted)] text-lg max-w-xl mx-auto mb-6 leading-relaxed">
              {data.description}
            </p>
          )}

          <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-text-faint)] bg-[var(--color-surface)] w-fit mx-auto px-4 py-2 rounded-lg border border-[var(--color-border)] shadow-sm">
            <Users size={16} />
            <span>by <span className="text-[var(--color-text)] font-semibold">{data.ownerName}</span></span>
          </div>
        </div>

        {/* ── Pages list ─────────────────────────────────────────────── */}
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          {data.pages.length === 0 ? (
            <div className="text-center py-20 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/50">
              <FileText size={40} className="mx-auto mb-4 text-[var(--color-text-faint)]" />
              <p className="text-[var(--color-text-muted)] font-medium">No published pages yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                  Pages
                </h2>
                <div className="h-px bg-[var(--color-border)] flex-1" />
                <span className="text-xs font-medium text-[var(--color-text-faint)] bg-[var(--color-surface-2)] px-2 py-1 rounded-md">
                  {data.pages.length} {data.pages.length !== 1 ? 'items' : 'item'}
                </span>
              </div>
              
              <div className="grid gap-3">
                {data.pages.map((page) => {
                  const PageIcon = ICONS.find(ic => ic.name === page.meta?.icon)?.component || FileText;
                  return (
                  <Link
                    key={page.urlSlug}
                    to={`/p/${portfolioSlug}/${page.urlSlug}`}
                    id={`hub-page-link-${page.urlSlug}`}
                    className="group flex items-center justify-between p-4 sm:p-5 rounded-lg border-0 bg-[var(--color-surface)] shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 sm:gap-5">
                      <div
                        className="w-10 h-10 rounded-md flex items-center justify-center text-sm font-bold shrink-0 bg-[var(--color-text)] text-[var(--color-bg)] transition-transform duration-300 group-hover:scale-110 shadow-sm"
                      >
                        <PageIcon size={20} />
                      </div>
                      <div>
                        <p className="text-[var(--color-text)] font-bold text-lg group-hover:opacity-80 transition-opacity">
                          {page.title}
                        </p>
                        <p className="text-sm text-[var(--color-text-faint)] font-mono mt-0.5">/{page.urlSlug}</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center group-hover:bg-[var(--color-text)] group-hover:text-[var(--color-bg)] text-[var(--color-text-muted)] transition-all duration-300 transform group-hover:translate-x-1 shadow-sm">
                      <ArrowRight size={18} />
                    </div>
                  </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
