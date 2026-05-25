import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePortfolioStore } from '../../store/portfolioStore';
import { useAuthStore } from '../../store/authStore';
import {
  Plus, Folder, ExternalLink, Trash2, Loader2,
  LayoutGrid, LogOut, Globe, Lock, Copy, Check,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { portfolios, fetchAll, create, remove, isLoading, error } = usePortfolioStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    void navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const p = await create(form);
      setShowCreate(false);
      setForm({ title: '', slug: '', description: '' });
      navigate(`/dashboard/portfolios/${p._id}`);
    } finally {
      setCreating(false);
    }
  };

  const slugify = (s: string) =>
    s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <div className="min-h-screen">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-md">
        <div className="container-max mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-white">Portfolio CMS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/explore"
              className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <Globe size={15} /> Explore
            </Link>
            <span className="text-slate-400 text-sm hidden sm:block">Hi, {user?.name}</span>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container-max mx-auto px-6 py-12">
        {/* Header row */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">My Portfolios</h1>
            <p className="text-slate-400 text-sm">{portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            id="create-portfolio-btn"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-105"
          >
            <Plus size={18} /> New Portfolio
          </button>
        </div>

        {/* Loading */}
        {isLoading && portfolios.length === 0 && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-indigo-400" />
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && portfolios.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <LayoutGrid size={36} className="text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Could not load portfolios</h3>
            <p className="text-slate-400 mb-6 text-sm">{error}</p>
            <button
              onClick={() => { void fetchAll(); }}
              className="px-6 py-3 rounded-xl gradient-bg text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && portfolios.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl glass flex items-center justify-center">
              <LayoutGrid size={36} className="text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No portfolios yet</h3>
            <p className="text-slate-400 mb-6">Create your first portfolio to get started</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 rounded-xl gradient-bg text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            >
              Create Portfolio
            </button>
          </div>
        )}

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {portfolios.map((p) => (
            <div key={p._id} className="glass glass-hover rounded-2xl p-6 space-y-4 transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Folder size={22} className="text-indigo-400" />
                </div>
                <div className="flex items-center gap-1.5">
                  {p.isPublished
                    ? <Globe size={14} className="text-emerald-400" />
                    : <Lock size={14} className="text-slate-500" />}
                  <span className="text-xs text-slate-500">{p.isPublished ? 'Published' : 'Draft'}</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{p.title}</h3>
                <p className="text-xs text-slate-500 mt-1 font-mono">/{p.slug}</p>
                {p.description && (
                  <p className="text-sm text-slate-400 mt-2 line-clamp-2">{p.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <Link
                  to={`/dashboard/portfolios/${p._id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                >
                  <ExternalLink size={14} /> Manage
                </Link>

                {p.isPublished && (
                  <>
                    {/* View public */}
                    <Link
                      to={`/p/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      title="View public portfolio"
                    >
                      <Globe size={15} />
                    </Link>
                    {/* Copy link */}
                    <button
                      onClick={() => handleCopyLink(p.slug, p._id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                      title="Copy public link"
                    >
                      {copiedId === p._id ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                    </button>
                  </>
                )}

                <button
                  onClick={() => { if (confirm('Delete this portfolio?')) remove(p._id); }}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete portfolio"
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
            <h2 className="text-xl font-bold text-white mb-6">Create New Portfolio</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Title</label>
                <input
                  id="portfolio-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })}
                  placeholder="My Developer Portfolio"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Slug</label>
                <input
                  id="portfolio-slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                  placeholder="my-developer-portfolio"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Description (optional)</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="A short description..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 rounded-xl glass glass-hover text-slate-300 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  id="portfolio-create-confirm"
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
