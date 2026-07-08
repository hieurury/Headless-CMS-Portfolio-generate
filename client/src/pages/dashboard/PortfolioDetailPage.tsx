import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { usePortfolioStore } from '../../store/portfolioStore';
import { usePageStore } from '../../store/pageStore';
import { useUIStore } from '../../store/uiStore';
import { t } from '../../i18n';
import {
  ArrowLeft, Plus, FileText, Eye, Trash2,
  Loader2, Code2, ChevronRight, Pencil, Globe, Lock,
  Folder, Briefcase, Code, Palette, Laptop, Camera, Book, Video, Image as ImageIcon, Sun, Moon
} from 'lucide-react';

const ICONS = [
  { name: 'FileText', component: FileText },
  { name: 'Folder', component: Folder },
  { name: 'Briefcase', component: Briefcase },
  { name: 'Code', component: Code },
  { name: 'Palette', component: Palette },
  { name: 'Laptop', component: Laptop },
  { name: 'Camera', component: Camera },
  { name: 'Book', component: Book },
  { name: 'Video', component: Video },
  { name: 'ImageIcon', component: ImageIcon },
];

export const PortfolioDetailPage: React.FC = () => {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const navigate = useNavigate();
  const { current: portfolio, fetchOne } = usePortfolioStore();
  const { pages, fetchAll, create, remove, update, isLoading } = usePageStore();
  const { theme, language, toggleTheme, toggleLanguage } = useUIStore();
  const [showCreate, setShowCreate] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '', icon: 'FileText' });
  const [creating, setCreating] = useState(false);

  const lang = t(language).dashboard;

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
      await create(portfolioId, { title: form.title, slug, layout: { sections: [] }, meta: { icon: form.icon } });
      setShowCreate(false);
      setForm({ title: '', slug: '', icon: 'FileText' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
        <div className="container-max mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors text-sm"
            >
              <ArrowLeft size={16} /> {lang.dashboard}
            </button>
            <ChevronRight size={14} className="text-[var(--color-border)]" />
            <span className="text-[var(--color-text)] font-medium">{portfolio?.title ?? '...'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-colors"
              title={language === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang Tiếng Anh'}
            >
              {language.toUpperCase()}
            </button>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      <main className="container-max mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)] mb-1">{lang.pages}</h1>
            <p className="text-[var(--color-text-muted)] text-sm font-mono">/{portfolio?.slug}</p>
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
                    ? 'border-[var(--color-border-hover)] text-[var(--color-text)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]'
                }`}
                title={portfolio.isPublished ? 'Click to unpublish' : 'Click to publish'}
              >
                {portfolio.isPublished ? <Globe size={14} /> : <Lock size={14} />}
                {portfolio.isPublished ? lang.public : lang.private}
              </button>
            )}
            <button
              id="create-page-btn"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] font-semibold text-sm hover:opacity-85 transition-all shadow-sm hover:shadow-md"
            >
              <Plus size={18} /> {lang.newPage}
            </button>
          </div>
        </div>

        {isLoading && pages.length === 0 && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-[var(--color-text-muted)]" />
          </div>
        )}

        {!isLoading && pages.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center">
              <FileText size={36} className="text-[var(--color-text-muted)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">{lang.noPages}</h3>
            <p className="text-[var(--color-text-muted)] mb-6">Add your first page to start building</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 rounded-lg border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] font-semibold hover:opacity-85 transition-all shadow-sm hover:shadow-md"
            >
              {lang.createPage}
            </button>
          </div>
        )}

        <div className="space-y-3">
          {pages.map((page) => {
            const IconComp = ICONS.find(ic => ic.name === page.meta?.icon)?.component || FileText;
            return (
            <div key={page._id} className="bg-[var(--color-surface)] border border-transparent border-l-[5px] border-l-[var(--color-text)] shadow-sm hover:shadow-md rounded-lg p-5 flex items-center gap-4 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] flex items-center justify-center shrink-0">
                <IconComp size={18} className="text-[var(--color-text)]" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--color-text)] group-hover:opacity-80 transition-opacity">{page.title}</h3>
                <div className="flex items-center gap-3 mt-0.5">
                  <code className="text-xs text-[var(--color-text-muted)] font-mono">{page.slug}</code>
                  <span className="text-[var(--color-text-faint)]">·</span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {page.layout?.sections?.length ?? 0} {(page.layout?.sections?.length ?? 0) !== 1 ? lang.sectionsPlural : lang.sections}
                  </span>
                  {/* Published status badge */}
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-md ${
                    page.isPublished
                      ? 'text-[var(--color-text-muted)] bg-[var(--color-surface-2)]'
                      : 'text-[var(--color-text-faint)] border border-[var(--color-border)]'
                  }`}>
                    {page.isPublished ? <Globe size={10} /> : <Lock size={10} />}
                    {page.isPublished ? lang.public : lang.private}
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
                      ? 'text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                  }`}
                  title={page.isPublished ? 'Unpublish page' : 'Publish page'}
                >
                  <Globe size={16} />
                </button>

                {/* Edit */}
                <Link
                  to={`/dashboard/portfolios/${portfolioId}/pages/${page._id}/edit`}
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
                  title="Open editor"
                >
                  <Pencil size={16} />
                </Link>

                {/* JSON Inspector */}
                <button
                  onClick={() => {
                    const json = JSON.stringify(page.layout, null, 2);
                    const w = window.open('', '_blank');
                    w?.document.write(`<pre style="background:var(--color-bg);color:var(--color-text);padding:2rem;font-family:monospace;font-size:13px;white-space:pre-wrap;">${json}</pre>`);
                  }}
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
                  title="Inspect JSON layout"
                >
                  <Code2 size={16} />
                </button>

                {/* Preview */}
                <Link
                  to={`/preview/${portfolioId}/${encodeURIComponent(page._id)}`}
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
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
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Delete page"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </main>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-8 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">{lang.createPage}</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex gap-4">
                <div className="relative shrink-0">
                  <label className="block text-sm text-[var(--color-text-muted)] mb-1.5">Icon</label>
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="h-[46px] w-[54px] flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    {(() => {
                      const C = ICONS.find(ic => ic.name === form.icon)?.component || FileText;
                      return <C size={20} />;
                    })()}
                  </button>
                  {showIconPicker && (
                    <div className="absolute top-[100%] mt-2 left-0 w-[220px] p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl grid grid-cols-5 gap-1 z-20">
                      {ICONS.map(ic => (
                        <button
                          key={ic.name}
                          type="button"
                          onClick={() => { setForm({ ...form, icon: ic.name }); setShowIconPicker(false); }}
                          className={`p-2 rounded flex items-center justify-center transition-colors ${form.icon === ic.name ? 'bg-[var(--color-surface-2)] border border-[var(--color-border)]' : 'hover:bg-[var(--color-surface-2)]'}`}
                          title={ic.name}
                        >
                          <ic.component size={18} className="text-[var(--color-text)]" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-[var(--color-text-muted)] mb-1.5">Page Title</label>
                  <input
                    id="page-title"
                    value={form.title}
                    onChange={(e) => setForm({
                      ...form,
                      title: e.target.value,
                      slug: e.target.value === 'Home' ? '/' : `/${e.target.value.toLowerCase().replace(/\s+/g, '-')}`,
                    })}
                    placeholder="Home, About, Projects..."
                    required
                    className="h-[46px] w-full px-4 rounded-lg bg-transparent border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-muted)] mb-1.5">Slug</label>
                <input
                  id="page-slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="/ or /about"
                  className="h-[46px] w-full px-4 rounded-lg bg-transparent border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-all font-mono text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 h-[46px] rounded-lg border border-[var(--color-border)] text-[var(--color-text)] font-medium transition-all hover:bg-[var(--color-surface-2)] shadow-sm">
                  Cancel
                </button>
                <button
                  id="page-create-confirm"
                  type="submit"
                  disabled={creating}
                  className="flex-1 flex items-center justify-center gap-2 h-[46px] rounded-lg border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] font-semibold transition-all disabled:opacity-60 hover:opacity-85 shadow-sm hover:shadow-md"
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
