import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { publicService, type PublicPortfolioHub } from '../../services/public.service';
import {
  Loader2, Lock, FileText, ArrowRight, Globe, Users, LayoutGrid,
} from 'lucide-react';
import { SeoHelmet } from '../../core/renderer/SeoHelmet';

export const PublicPortfolioHubPage: React.FC = () => {
  const { portfolioSlug } = useParams<{ portfolioSlug: string }>();
  const [data, setData] = useState<PublicPortfolioHub | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="min-h-screen flex items-center justify-center bg-[#08080f]">
        <Loader2 size={36} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08080f] px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
            <Lock size={28} className="text-slate-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Not Available</h1>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
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

  const primaryColor = (data.meta?.primaryColor as string | undefined) ?? '#6366f1';

  return (
    <div className="min-h-screen bg-[#08080f]">
      <SeoHelmet 
        portfolioTitle={data.title}
        pageTitle="Hub"
        meta={data.meta}
      />
      {/* ── Nav ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link
            to="/explore"
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <LayoutGrid size={14} /> Explore
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-white text-sm font-medium">{data.title}</span>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400">
            <Globe size={12} /> Published
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* ── Hero ───────────────────────────────────────────────────── */}
        <div className="text-center mb-14">
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}30, ${primaryColor}10)`,
              border: `1px solid ${primaryColor}40`,
              boxShadow: `0 20px 60px ${primaryColor}20`,
            }}
          >
            <LayoutGrid size={32} style={{ color: primaryColor }} />
          </div>

          <h1 className="text-4xl font-bold text-white mb-3">{data.title}</h1>

          {data.description && (
            <p className="text-slate-400 text-lg max-w-xl mx-auto mb-4">
              {data.description}
            </p>
          )}

          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Users size={14} />
            <span>by <span className="text-slate-300 font-medium">{data.ownerName}</span></span>
          </div>
        </div>

        {/* ── Pages list ─────────────────────────────────────────────── */}
        {data.pages.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-white/10">
            <FileText size={36} className="mx-auto mb-3 text-slate-600" />
            <p className="text-slate-500">No published pages yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">
              {data.pages.length} Page{data.pages.length !== 1 ? 's' : ''}
            </h2>
            {data.pages.map((page, i) => (
              <Link
                key={page.urlSlug}
                to={`/p/${portfolioSlug}/${page.urlSlug}`}
                id={`hub-page-link-${page.urlSlug}`}
                className="group flex items-center justify-between p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                    style={{
                      background: `${primaryColor}20`,
                      color: primaryColor,
                      border: `1px solid ${primaryColor}30`,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-white font-semibold group-hover:text-indigo-300 transition-colors">
                      {page.title}
                    </p>
                    <p className="text-xs text-slate-600 font-mono">/{page.urlSlug}</p>
                  </div>
                </div>
                <ArrowRight
                  size={18}
                  className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all"
                />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
