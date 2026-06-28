import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePortfolioStore } from '../../store/portfolioStore';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { t } from '../../i18n';
import {
  Plus,
  Folder,
  ExternalLink,
  Trash2,
  Loader2,
  LayoutGrid,
  LogOut,
  Globe,
  Lock,
  Copy,
  Check,
  Sun,
  Moon,
  Briefcase,
  FileText,
  Code,
  Palette,
  Laptop,
  Camera,
  Book,
  Video,
  Image as ImageIcon,
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

export const DashboardPage: React.FC = () => {
  const { portfolios, fetchAll, create, remove, isLoading, error } =
    usePortfolioStore();
  const { logout } = useAuthStore();
  const { theme, language, toggleTheme, toggleLanguage } = useUIStore();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    icon: 'Folder',
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const lang = t(language).dashboard;

  const handleCopyLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    void navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const cleanSlug = form.slug.replace(/-+/g, '-').replace(/^-+|-+$/g, '');
      const p = await create({
        title: form.title,
        slug: cleanSlug,
        description: form.description,
        meta: { icon: form.icon },
      });
      setShowCreate(false);
      setForm({ title: '', slug: '', description: '', icon: 'Folder' });
      navigate(`/dashboard/portfolios/${p._id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      setCreateError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setCreating(false);
    }
  };

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

  const SelectedIconComp =
    ICONS.find((ic) => ic.name === form.icon)?.component || Folder;

  return (
    <div className="min-h-screen">
      {/* Top Nav (Styled matching Landing Page) */}
      <nav className="home-navbar home-navbar--scrolled">
        <div className="home-navbar__inner container-max px-6">
          {/* Logo */}
          <Link to="/" className="home-navbar__logo">
            <img
              src="icons.svg"
              alt="CMS Portfolio Logo"
              className="home-navbar__logo-mark"
            />
            <span className="home-navbar__logo-text">CMS Portfolio</span>
          </Link>

          <div className="home-navbar__right">
            <div className="home-navbar__links">
              <Link to="/explore" className="home-navbar__link">
                {lang.community}
              </Link>
            </div>

            <div className="home-navbar__controls">
              <button
                className="home-navbar__icon-btn"
                onClick={toggleLanguage}
                title={
                  language === 'en'
                    ? 'Switch to Vietnamese'
                    : 'Chuyển sang Tiếng Anh'
                }
              >
                <span className="home-navbar__lang-label">
                  {language.toUpperCase()}
                </span>
              </button>

              <button
                className="home-navbar__icon-btn"
                onClick={toggleTheme}
                title={
                  theme === 'dark'
                    ? 'Switch to light mode'
                    : 'Switch to dark mode'
                }
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="home-navbar__icon-btn"
                title={lang.signOut}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container-max mx-auto px-6 pt-24 pb-12">
        {/* Header row */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)] mb-1">
              {lang.myPortfolios}
            </h1>
            <p className="text-[var(--color-text-muted)] text-sm">
              {portfolios.length}{' '}
              {portfolios.length !== 1
                ? lang.portfoliosCountPlural
                : lang.portfoliosCount}
            </p>
          </div>
          <button
            id="create-portfolio-btn"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] font-semibold text-sm hover:opacity-85 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <Plus size={18} /> {lang.newPortfolio}
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
            <div className="w-20 h-20 mx-auto mb-6 rounded-xl border border-red-500/20 bg-red-500/5 flex items-center justify-center">
              <LayoutGrid size={36} className="text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
              Could not load portfolios
            </h3>
            <p className="text-[var(--color-text-muted)] mb-6 text-sm">
              {error}
            </p>
            <button
              onClick={() => {
                void fetchAll();
              }}
              className="px-6 py-3 rounded-lg border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] font-semibold hover:opacity-85 transition-all shadow-sm hover:shadow-md"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && portfolios.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm flex items-center justify-center">
              <LayoutGrid
                size={36}
                className="text-[var(--color-text-muted)]"
              />
            </div>
            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
              {lang.noPortfolios}
            </h3>
            <p className="text-[var(--color-text-muted)] mb-6">
              Create your first portfolio to get started
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 rounded-lg border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] font-semibold hover:opacity-85 transition-all shadow-sm hover:shadow-md"
            >
              {lang.createPortfolio}
            </button>
          </div>
        )}

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {portfolios.map((p) => {
            const IconComp =
              ICONS.find((ic) => ic.name === p.meta?.icon)?.component || Folder;
            return (
              <div
                key={p._id}
                className="bg-[var(--color-surface)] rounded-lg p-6 space-y-4 shadow-sm border border-transparent hover:border-[var(--color-border-hover)] hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] flex items-center justify-center text-xl">
                    <IconComp size={22} className="text-[var(--color-text)]" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {p.isPublished ? (
                      <Globe size={14} className="text-emerald-500" />
                    ) : (
                      <Lock
                        size={14}
                        className="text-[var(--color-text-muted)]"
                      />
                    )}
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {p.isPublished ? lang.public : lang.private}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[var(--color-text)] group-hover:opacity-80 transition-opacity line-clamp-1">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 font-mono">
                    /{p.slug}
                  </p>
                  {p.description && (
                    <p className="text-sm text-[var(--color-text-faint)] mt-2 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border)]">
                  <Link
                    to={`/dashboard/portfolios/${p._id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    <ExternalLink size={14} /> {lang.manage}
                  </Link>

                  {p.isPublished && (
                    <>
                      {/* View public */}
                      <Link
                        to={`/p/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-md text-[var(--color-text-muted)] hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                        title="View public portfolio"
                      >
                        <Globe size={15} />
                      </Link>
                      {/* Copy link */}
                      <button
                        onClick={() => handleCopyLink(p.slug, p._id)}
                        className="p-2 rounded-md text-[var(--color-text-muted)] hover:text-violet-500 hover:bg-violet-500/10 transition-colors"
                        title="Copy public link"
                      >
                        {copiedId === p._id ? (
                          <Check size={15} className="text-emerald-500" />
                        ) : (
                          <Copy size={15} />
                        )}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      if (confirm('Delete this portfolio?')) remove(p._id);
                    }}
                    className="p-2 rounded-md text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title={lang.delete}
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreate(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-8 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">
              {lang.createPortfolio}
            </h2>
            {createError && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {createError}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex gap-4">
                <div className="relative shrink-0">
                  <label className="block text-sm text-[var(--color-text-muted)] mb-1.5">
                    Icon
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="h-[46px] w-[54px] flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    <SelectedIconComp size={20} />
                  </button>
                  {showIconPicker && (
                    <div className="absolute top-[100%] mt-2 left-0 w-[220px] p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl grid grid-cols-5 gap-1 z-20">
                      {ICONS.map((ic) => (
                        <button
                          key={ic.name}
                          type="button"
                          onClick={() => {
                            setForm({ ...form, icon: ic.name });
                            setShowIconPicker(false);
                          }}
                          className={`p-2 rounded flex items-center justify-center transition-colors ${form.icon === ic.name ? 'bg-[var(--color-surface-2)] border border-[var(--color-border)]' : 'hover:bg-[var(--color-surface-2)]'}`}
                          title={ic.name}
                        >
                          <ic.component
                            size={18}
                            className="text-[var(--color-text)]"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-[var(--color-text-muted)] mb-1.5">
                    Title
                  </label>
                  <input
                    id="portfolio-title"
                    value={form.title}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        title: e.target.value,
                        slug: slugify(e.target.value),
                      })
                    }
                    placeholder="My Developer Portfolio"
                    required
                    className="h-[46px] w-full px-4 rounded-lg bg-transparent border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-muted)] mb-1.5">
                  Slug
                </label>
                <input
                  id="portfolio-slug"
                  value={form.slug}
                  onChange={(e) =>
                    setForm({ ...form, slug: slugify(e.target.value) })
                  }
                  placeholder="my-developer-portfolio"
                  required
                  className="h-[46px] w-full px-4 rounded-lg bg-transparent border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-all font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-muted)] mb-1.5">
                  Description (optional)
                </label>
                <input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="A short description..."
                  className="h-[46px] w-full px-4 rounded-lg bg-transparent border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 h-[46px] rounded-lg border border-[var(--color-border)] text-[var(--color-text)] font-medium transition-all hover:bg-[var(--color-surface-2)] shadow-sm"
                >
                  Cancel
                </button>
                <button
                  id="portfolio-create-confirm"
                  type="submit"
                  disabled={creating}
                  className="flex-1 flex items-center justify-center gap-2 h-[46px] rounded-lg border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] font-semibold transition-all disabled:opacity-60 hover:opacity-85 shadow-sm hover:shadow-md"
                >
                  {creating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
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
