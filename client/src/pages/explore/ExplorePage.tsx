import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { publicService, type PublicPortfolioCard } from '../../services/public.service';
import { useAuthStore } from '../../store/authStore';
import {
  Search, Folder, Users, ChevronLeft, ChevronRight,
  Loader2, Globe, Sparkles, LayoutGrid, LogOut,
} from 'lucide-react';

const LIMIT = 12;

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuthStore();

  const initialQuery = searchParams.get('q') ?? '';
  const initialPage = parseInt(searchParams.get('page') ?? '1', 10);

  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [page, setPage] = useState(initialPage);
  const [portfolios, setPortfolios] = useState<PublicPortfolioCard[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const load = useCallback(async (q: string, pg: number) => {
    setIsLoading(true);
    try {
      // Exclude own portfolios if authenticated
      const res = await publicService.listAll(
        q,
        pg,
        LIMIT,
        isAuthenticated && user?._id ? user._id : undefined,
      );
      setPortfolios(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setPortfolios([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?._id]);

  useEffect(() => {
    void load(query, page);
    // Sync URL params
    const p: Record<string, string> = { page: String(page) };
    if (query) p.q = query;
    setSearchParams(p, { replace: true });
  }, [query, page, load, setSearchParams]);

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
    <div className="min-h-screen bg-[#08080f]">
      {/* ── Top Nav ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 mr-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <LayoutGrid size={16} className="text-white" />
            </div>
            <span className="font-bold text-white hidden sm:block">Portfolio CMS</span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-xl relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              id="explore-search"
              value={inputValue}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name, description, or creator..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors"
                >
                  <LogOut size={14} /> <span className="hidden sm:inline">Sign out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                >
                  Get Started
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center">
              <Globe size={20} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Explore Portfolios</h1>
              <p className="text-slate-500 text-sm">
                {isLoading ? 'Loading...' : `${total} public portfolio${total !== 1 ? 's' : ''} found`}
                {query && !isLoading && <span className="text-indigo-400"> for "{query}"</span>}
              </p>
            </div>
          </div>
        </div>

        {/* ── Loading ───────────────────────────────────────────────── */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-indigo-400" />
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────────────── */}
        {!isLoading && portfolios.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
              <Sparkles size={36} className="text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No portfolios found</h3>
            <p className="text-slate-500 text-sm">
              {query ? `No results for "${query}" — try different keywords` : 'No public portfolios yet. Be the first!'}
            </p>
            {query && (
              <button
                onClick={() => { setInputValue(''); setQuery(''); setPage(1); }}
                className="mt-4 text-indigo-400 hover:underline text-sm"
              >
                Clear search
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
                className="group block rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 overflow-hidden"
              >
                {/* Colour accent strip based on primaryColor */}
                <div
                  className="h-1.5 w-full"
                  style={{
                    background: p.meta?.primaryColor
                      ? `linear-gradient(90deg, ${p.meta.primaryColor}80, ${p.meta.primaryColor}20)`
                      : 'linear-gradient(90deg, #6366f180, #6366f120)',
                  }}
                />

                <div className="p-5">
                  {/* Icon + status */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{
                        background: p.meta?.primaryColor
                          ? `${p.meta.primaryColor}18`
                          : '#6366f118',
                        border: `1px solid ${p.meta?.primaryColor ?? '#6366f1'}30`,
                      }}
                    >
                      <Folder size={20} style={{ color: p.meta?.primaryColor ?? '#818cf8' }} />
                    </div>
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                      <Globe size={11} /> Live
                    </span>
                  </div>

                  {/* Title + description */}
                  <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1">
                    {p.title}
                  </h3>
                  {p.description && (
                    <p className="text-slate-500 text-xs line-clamp-2 mb-3">
                      {p.description}
                    </p>
                  )}

                  {/* Owner + page count */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Users size={12} />
                      <span className="truncate max-w-[90px]">{p.ownerName}</span>
                    </div>
                    <span className="text-xs text-slate-600">
                      {p.pageCount} page{p.pageCount !== 1 ? 's' : ''}
                    </span>
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
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
                  <span key={`ellipsis-${i}`} className="text-slate-600 px-1">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => handlePageChange(n as number)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      page === n
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {n}
                  </button>
                ),
              )}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
