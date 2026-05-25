import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { usePortfolioStore } from '../../store/portfolioStore';
import { usePageStore } from '../../store/pageStore';
import {
  ArrowLeft, Plus, FileText, Eye, Trash2,
  Loader2, Code2, ChevronRight, Pencil, Globe, Lock,
} from 'lucide-react';

export const PortfolioDetailPage: React.FC = () => {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const navigate = useNavigate();
  const { current: portfolio, fetchOne } = usePortfolioStore();
  const { pages, fetchAll, create, remove, update, isLoading } = usePageStore();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (portfolioId) {
      fetchOne(portfolioId);
      fetchAll(portfolioId);
    }
  }, [portfolioId, fetchOne, fetchAll]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioId) return;
    setCreating(true);
    try {
      const slug = form.slug || (form.title === 'Home' ? '/' : `/${form.title.toLowerCase().replace(/\s+/g, '-')}`);
      await create(portfolioId, { title: form.title, slug, layout: { sections: [] } });
      setShowCreate(false);
      setForm({ title: '', slug: '' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-md">
        <div className="container-max mx-auto px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} /> Dashboard
          </button>
          <ChevronRight size={14} className="text-slate-600" />
          <span className="text-white font-medium">{portfolio?.title ?? '...'}</span>
        </div>
      </header>

      <main className="container-max mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Pages</h1>
            <p className="text-slate-400 text-sm font-mono">/{portfolio?.slug}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Publish toggle */}
            {portfolio && (
              <button
                onClick={() => {
                  if (portfolioId) {
                    void usePortfolioStore.getState().update(portfolioId, {
                      isPublished: !portfolio.isPublished,
                    });
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                  portfolio.isPublished
                    ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                    : 'border-white/10 text-slate-400 bg-white/5 hover:bg-white/10'
                }`}
                title={portfolio.isPublished ? 'Click to unpublish' : 'Click to publish'}
              >
                {portfolio.isPublished ? <Globe size={14} /> : <Lock size={14} />}
                {portfolio.isPublished ? 'Published' : 'Draft'}
              </button>
            )}
            <button
              id="create-page-btn"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-105"
            >
              <Plus size={18} /> New Page
            </button>
          </div>
        </div>

        {isLoading && pages.length === 0 && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-indigo-400" />
          </div>
        )}

        {!isLoading && pages.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl glass flex items-center justify-center">
              <FileText size={36} className="text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No pages yet</h3>
            <p className="text-slate-400 mb-6">Add your first page to start building</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 rounded-xl gradient-bg text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            >
              Create Page
            </button>
          </div>
        )}

        <div className="space-y-3">
          {pages.map((page) => (
            <div key={page._id} className="glass glass-hover rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-violet-400" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{page.title}</h3>
                <div className="flex items-center gap-3 mt-0.5">
                  <code className="text-xs text-slate-500 font-mono">{page.slug}</code>
                  <span className="text-slate-700">·</span>
                  <span className="text-xs text-slate-500">
                    {page.layout?.sections?.length ?? 0} section{(page.layout?.sections?.length ?? 0) !== 1 ? 's' : ''}
                  </span>
                  {/* Published status badge */}
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-md ${
                    page.isPublished
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-slate-600 bg-white/5'
                  }`}>
                    {page.isPublished ? <Globe size={10} /> : <Lock size={10} />}
                    {page.isPublished ? 'Public' : 'Draft'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Publish/Unpublish toggle */}
                <button
                  onClick={() => {
                    if (portfolioId)
                      update(portfolioId, page._id, { isPublished: !page.isPublished } as Parameters<typeof update>[2]);
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    page.isPublished
                      ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                      : 'text-slate-600 hover:text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                  title={page.isPublished ? 'Unpublish page' : 'Publish page'}
                >
                  <Globe size={16} />
                </button>

                {/* Edit */}
                <Link
                  to={`/dashboard/portfolios/${portfolioId}/pages/${page._id}/edit`}
                  className="p-2 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  title="Open editor"
                >
                  <Pencil size={16} />
                </Link>

                {/* JSON Inspector */}
                <button
                  onClick={() => {
                    const json = JSON.stringify(page.layout, null, 2);
                    const w = window.open('', '_blank');
                    w?.document.write(`<pre style="background:#0a0a0f;color:#e2e8f0;padding:2rem;font-family:monospace;font-size:13px;white-space:pre-wrap;">${json}</pre>`);
                  }}
                  className="p-2 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                  title="Inspect JSON layout"
                >
                  <Code2 size={16} />
                </button>

                {/* Preview */}
                <Link
                  to={`/preview/${portfolioId}/${encodeURIComponent(page._id)}`}
                  className="p-2 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                  title="Preview page"
                >
                  <Eye size={16} />
                </Link>

                {/* Delete */}
                <button
                  onClick={() => {
                    if (portfolioId && confirm('Delete this page?'))
                      remove(portfolioId, page._id);
                  }}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete page"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md glass rounded-2xl p-8 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white mb-2">Create New Page</h2>
            <p className="text-slate-400 text-sm mb-6">The page will start empty. Use the AI editor to generate a layout.</p>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Page Title</label>
                <input
                  id="page-title"
                  value={form.title}
                  onChange={(e) => setForm({
                    title: e.target.value,
                    slug: e.target.value === 'Home' ? '/' : `/${e.target.value.toLowerCase().replace(/\s+/g, '-')}`,
                  })}
                  placeholder="Home, About, Projects..."
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Slug</label>
                <input
                  id="page-slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="/ or /about"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-mono text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 rounded-xl glass glass-hover text-slate-300 font-medium transition-all">
                  Cancel
                </button>
                <button
                  id="page-create-confirm"
                  type="submit"
                  disabled={creating}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl gradient-bg text-white font-semibold transition-all disabled:opacity-60"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
