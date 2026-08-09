import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { publicService, type PublicPortfolioCard } from '../../services/public.service';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useI18n } from '../../hooks/useI18n';
import { UserNavMenu } from '../../components/common/UserNavMenu';
import {
  Search, Folder, Users, ChevronLeft, ChevronRight,
  Loader2, Globe, Sun, Moon, ChevronDown, Check
} from 'lucide-react';

const LIMIT = 12;

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'technology', label: 'Technology' },
  { id: 'design', label: 'Design' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'photography', label: 'Photography' },
  { id: 'business', label: 'Business' },
  { id: 'writing', label: 'Writing' },
  { id: 'education', label: 'Education' },
];

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { theme, language, toggleTheme, toggleLanguage } = useUIStore();
  const { t } = useI18n();

  const initialQuery = searchParams.get('q') ?? '';
  const initialCategory = searchParams.get('category') ?? '';
  const initialPage = parseInt(searchParams.get('page') ?? '1', 10);

  const [query, setQuery] = useState(initialQuery);
  const [categories, setCategories] = useState<string[]>(initialCategory ? initialCategory.split(',') : []);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [page, setPage] = useState(initialPage);
  const [portfolios, setPortfolios] = useState<PublicPortfolioCard[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── SEO meta for /explore ──────────────────────────────────────────
  useEffect(() => {
    document.title = 'Khám phá Portfolio — Ruryfo CMS';
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute('content', 'Khám phá các portfolio cá nhân được xây dựng trên Ruryfo CMS. Tìm kiếm và xem portfolio của mọi người trên nền tảng HieuRury.');
    }
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = 'https://cms.hieurury.id.vn/explore';

    return () => {
      document.title = 'Ruryfo CMS — Nền tảng tạo Portfolio cá nhân tự động bởi HieuRury';
    };
  }, []);

  const load = useCallback(async (q: string, pg: number, cat: string) => {
    setIsLoading(true);

    try {
      // Exclude own portfolios if authenticated
      const excludeOwnerId = isAuthenticated ? useAuthStore.getState().user?._id : undefined;
      const res = await publicService.listAll(
        q,
        pg,
        LIMIT,
        excludeOwnerId,
        cat,
      );
      setPortfolios(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setPortfolios([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void load(query, page, categories.join(','));
    // Sync URL params
    const p: Record<string, string> = { page: String(page) };
    if (query) p.q = query;
    if (categories.length > 0) p.category = categories.join(',');
    setSearchParams(p, { replace: true });
  }, [query, page, categories, load, setSearchParams]);

  const handleSearch = (val: string) => {
    setInputValue(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(val);
      setPage(1);
    }, 400);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* ── Top Nav ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          {/* Back Button */}
          <Link to="/" className="flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mr-2">
            <ChevronLeft size={20} />
            <span className="font-bold hidden sm:block">{t('explore.back')}</span>
          </Link>

          {/* Search & Filter */}
          <div className="flex-1 max-w-xl flex items-center gap-2">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
              <input
                id="explore-search"
                value={inputValue}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={t('explore.searchPlaceholder')}
                className="w-full pl-9 pr-4 py-2 rounded-sm bg-transparent border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-colors"
              />
            </div>
            <div className="relative hidden sm:block" ref={categoryRef}>
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center justify-between gap-2 py-2 pl-3 pr-2 w-36 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] hover:border-[var(--color-text)] transition-colors"
              >
                <span className="truncate">
                  {categories.length === 0 
                    ? t('explore.categories.all' as any) 
                    : categories.length === 1 
                      ? t(`explore.categories.${categories[0]}` as any)
                      : language === 'en' ? `${categories.length} selected` : `${categories.length} danh mục`}
                </span>
                <ChevronDown size={14} className={`text-[var(--color-text-muted)] transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm shadow-xl z-50 py-1">
                  <div 
                    className="px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-[var(--color-surface-2)] transition-colors"
                    onClick={() => { setCategories([]); setPage(1); setIsCategoryOpen(false); }}
                  >
                    <div className="w-4 h-4 border border-[var(--color-border)] rounded-sm flex items-center justify-center bg-[var(--color-bg)]">
                      {categories.length === 0 && <Check size={12} className="text-[var(--color-text)]" />}
                    </div>
                    <span className="text-sm text-[var(--color-text)]">{t('explore.categories.all' as any)}</span>
                  </div>
                  <div className="w-full h-px bg-[var(--color-border)] my-1" />
                  {CATEGORIES.filter(c => c.id !== 'all').map(c => {
                    const isSelected = categories.includes(c.id);
                    return (
                      <div 
                        key={c.id}
                        className="px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-[var(--color-surface-2)] transition-colors"
                        onClick={() => {
                          const newCats = isSelected ? categories.filter(id => id !== c.id) : [...categories, c.id];
                          setCategories(newCats);
                          setPage(1);
                        }}
                      >
                        <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${isSelected ? 'border-[var(--color-text)] bg-[var(--color-text)]' : 'border-[var(--color-border)] bg-[var(--color-bg)]'}`}>
                          {isSelected && <Check size={12} className="text-[var(--color-bg)]" />}
                        </div>
                        <span className="text-sm text-[var(--color-text)]">{t(`explore.categories.${c.id}` as any)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] transition-colors"
                onClick={toggleLanguage}
                title={language === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang Tiếng Anh'}
              >
                <span className="text-xs font-bold uppercase">{language}</span>
              </button>

              <button
                className="w-8 h-8 flex items-center justify-center rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] transition-colors"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>

            <div className="w-[1px] h-5 bg-[var(--color-border)] mx-1" />

            {isAuthenticated ? (
              <UserNavMenu />
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-sm border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] text-sm font-medium hover:opacity-85 transition-colors"
                >
                  {t('auth.createOne')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* ── Page header ──────────────────────────────────────────── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center">
              <Globe size={20} className="text-[var(--color-text)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('explore.title')}</h1>
              <p className="text-[var(--color-text-muted)] text-sm">
                {isLoading ? '...' : `${total} ${total !== 1 ? t('explore.portfolioCountPlural') : t('explore.portfolioCount')} ${t('explore.found')}`}
                {query && !isLoading && <span className="font-medium text-[var(--color-text)]"> {t('explore.forQuery').replace('{query}', query)}</span>}
              </p>
            </div>
          </div>
        </div>

        {/* ── Loading ───────────────────────────────────────────────── */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-[var(--color-text-muted)]" />
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────────────── */}
        {!isLoading && portfolios.length === 0 && (
          <div className="text-center py-24 border border-dashed border-[var(--color-border)] rounded-sm bg-[var(--color-surface)]/50">
            <div className="w-16 h-16 mx-auto mb-4 rounded-sm border border-[var(--color-border)] bg-[var(--color-bg)] flex items-center justify-center shadow-sm">
              <Folder size={24} className="text-[var(--color-text-muted)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-text)] mb-1">{t('explore.noPortfoliosFound')}</h3>
            <p className="text-[var(--color-text-muted)] text-sm max-w-sm mx-auto">
              {query || categories.length > 0 ? t('explore.noResultsFilters') : t('explore.noPortfoliosAvailable')}
            </p>
            {(query || categories.length > 0) && (
              <button
                onClick={() => { setInputValue(''); setQuery(''); setCategories([]); setPage(1); }}
                className="mt-5 px-4 py-2 rounded-sm bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors text-sm font-medium"
              >
                {t('explore.clearFilters')}
              </button>
            )}
          </div>
        )}

        {/* ── Grid ──────────────────────────────────────────────────── */}
        {!isLoading && portfolios.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {portfolios.map((p) => (
              <Link
                key={p._id}
                to={`/p/${p.slug}`}
                id={`portfolio-card-${p.slug}`}
                className="group flex flex-col rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-text-muted)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden min-h-[180px]"
              >
                {/* Colour accent strip based on primaryColor */}
                <div
                  className="h-1.5 w-full"
                  style={{
                    background: p.meta?.primaryColor
                      ? `linear-gradient(90deg, ${p.meta.primaryColor}80, ${p.meta.primaryColor}20)`
                      : 'var(--color-text-muted)',
                  }}
                />

                <div className="p-5 flex flex-col flex-1">
                  {/* Icon + status */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-sm border border-[var(--color-border)] bg-[var(--color-bg)] flex items-center justify-center"
                    >
                      <Folder size={18} className="text-[var(--color-text)]" />
                    </div>
                    <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] font-medium">
                      <Globe size={11} /> {language === 'en' ? 'Live' : 'Đang hoạt động'}
                    </span>
                  </div>

                  {/* Title + description */}
                  <h3 className="font-bold text-[var(--color-text)] group-hover:opacity-80 transition-opacity line-clamp-1 mb-1">
                    {p.title}
                  </h3>
                  {p.description && (
                    <p className="text-[var(--color-text-muted)] text-xs line-clamp-2 mb-3">
                      {p.description}
                    </p>
                  )}

                  {/* Owner + stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] mt-auto">
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                      {p.ownerAvatar ? (
                        <img src={p.ownerAvatar} alt={p.ownerName} className="w-6 h-6 rounded-full object-cover border border-[var(--color-border)]" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center border border-[var(--color-border)]">
                          <Users size={12} />
                        </div>
                      )}
                      <span className="truncate max-w-[90px] font-medium">{p.ownerName}</span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-[10px] text-[var(--color-text-faint)] font-medium uppercase tracking-wider">
                        {p.pageCount} {t('explore.pages')}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-faint)] font-medium uppercase tracking-wider">
                        {p.postCount || 0} {t('explore.posts')}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────── */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
              .reduce<(number | '...')[]>((acc, n, idx, arr) => {
                if (idx > 0 && (n as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) =>
                n === '...' ? (
                  <span key={`ellipsis-${i}`} className="text-[var(--color-text-faint)] px-1">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => handlePageChange(n as number)}
                    className={`w-9 h-9 rounded-sm text-sm font-medium transition-all ${
                      page === n
                        ? 'bg-[var(--color-text)] text-[var(--color-bg)]'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                    }`}
                  >
                    {n}
                  </button>
                ),
              )}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
