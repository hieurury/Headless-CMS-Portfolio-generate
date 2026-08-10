import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePortfolioStore } from '../../store/portfolioStore';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { UserNavMenu } from '../../components/common/UserNavMenu';
import { CategoryPicker } from '../../components/common/CategoryPicker';
import { t } from '../../i18n';
import { CATEGORY_LABELS } from '../../core/types/layout.types';
import {
  Plus,
  Folder,
  ExternalLink,
  Trash2,
  Loader2,
  LayoutGrid,
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
  Presentation,
} from 'lucide-react';
import { useSeo } from '../../hooks/useSeo';

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
  const {
    portfolios,
    fetchAll: fetchPortfolios,
    create: createPortfolio,
    remove: removePortfolio,
    isLoading: isPortfoliosLoading,
    error: portfoliosError,
  } = usePortfolioStore();

  const { theme, language, toggleTheme, toggleLanguage } = useUIStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useSeo({
    title: 'Dashboard — Ruryfo CMS',
    description: 'Quản lý các portfolio cá nhân của bạn trên Ruryfo CMS.',
    noindex: true,
  });

  // Active Tab: 'portfolios' or 'presentations'
  const [activeTab, setActiveTab] = useState<'portfolios' | 'presentations'>('portfolios');

  // Portfolio Create Modal State
  const [showCreate, setShowCreate] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    icon: 'Folder',
    categories: ['technology'] as string[],
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const lang = t(language).dashboard;

  const handleCopyLink = (slug: string, id: string) => {
    const username = user?.username ?? '';
    const url = `${window.location.origin}/${username}/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const cleanSlug = form.slug.replace(/-+/g, '-').replace(/^-+|-+$/g, '');
      const p = await createPortfolio({
        title: form.title,
        slug: cleanSlug,
        description: form.description,
        meta: { icon: form.icon },
        categories: form.categories.length > 0 ? form.categories : ['technology'],
      });
      setShowCreate(false);
      setForm({ title: '', slug: '', description: '', icon: 'Folder', categories: ['technology'] });
      navigate(`/${user?.username}/dashboard/portfolios/${p._id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      setCreateError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setCreating(false);
    }
  };

  const SelectedIconComp =
    ICONS.find((ic) => ic.name === form.icon)?.component || Folder;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Top Nav */}
      <nav className="home-navbar home-navbar--scrolled">
        <div className="home-navbar__inner container-max px-6">
          {/* Logo */}
          <Link to="/" className="home-navbar__logo">
            <img
              src="/icons.svg"
              alt="CMS Portfolio Logo"
              className="home-navbar__logo-mark"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="home-navbar__logo-text">CMS Portfolio</span>
          </Link>

          <div className="home-navbar__right">
            <div className="home-navbar__links">
              <Link to="/explore" className="home-navbar__link">
                {lang.community}
              </Link>
              <Link
                to={`/${user?.username}/dashboard/media`}
                className="home-navbar__link flex items-center gap-1.5"
              >
                <ImageIcon size={14} />
                Media
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
            </div>

            {/* Separator and User Dropdown Menu */}
            <div
              style={{
                width: 1,
                height: 22,
                background: 'var(--color-border)',
                margin: '0 4px',
              }}
            />
            <UserNavMenu />
          </div>
        </div>
      </nav>

      <main className="container-max mx-auto px-6 pt-24 pb-16">
        {/* Header row & Tabs switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-[var(--color-border)] pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] tracking-tight mb-2 flex items-center gap-2.5">
              {lang.dashboard}
            </h1>
            {/* Segmented 2 Tabs: Portfolios & Presentations */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => setActiveTab('portfolios')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-all border ${
                  activeTab === 'portfolios'
                    ? 'bg-[var(--color-text)] text-[var(--color-bg)] border-[var(--color-text)] shadow-sm'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                }`}
              >
                <LayoutGrid size={14} />
                <span>{lang.portfoliosTab}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-sm text-[10px] font-mono ${
                    activeTab === 'portfolios'
                      ? 'bg-[var(--color-bg)] text-[var(--color-text)]'
                      : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {portfolios.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('presentations')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-all border ${
                  activeTab === 'presentations'
                    ? 'bg-[var(--color-text)] text-[var(--color-bg)] border-[var(--color-text)] shadow-sm'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                }`}
              >
                <Presentation size={14} />
                <span>{lang.presentationsTab}</span>
              </button>
            </div>
          </div>

          {/* Primary Action Button: Only for Portfolios tab */}
          <div className="flex items-center gap-3">
            {activeTab === 'portfolios' && (
              <button
                id="create-portfolio-btn"
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] font-semibold text-xs hover:opacity-90 transition-all shadow-sm active:scale-[0.98]"
              >
                <Plus size={15} />
                {lang.newPortfolio}
              </button>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: PORTFOLIOS                                                  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'portfolios' && (
          <div>
            {/* Loading */}
            {isPortfoliosLoading && portfolios.length === 0 && (
              <div className="flex flex-col items-center justify-center py-28 gap-3">
                <Loader2
                  size={32}
                  className="animate-spin text-[var(--color-text-muted)]"
                />
                <p className="text-xs font-mono text-[var(--color-text-muted)]">
                  Loading portfolios...
                </p>
              </div>
            )}

            {/* Error state */}
            {!isPortfoliosLoading && portfoliosError && portfolios.length === 0 && (
              <div className="text-center py-20 px-6 max-w-lg mx-auto border border-[var(--color-border)] bg-[var(--color-surface)] rounded">
                <div className="w-12 h-12 mx-auto mb-4 rounded border border-[var(--color-error-border)] bg-[var(--color-error-bg)] flex items-center justify-center text-[var(--color-error)]">
                  <LayoutGrid size={22} />
                </div>
                <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">
                  Could not load portfolios
                </h3>
                <p className="text-[var(--color-text-muted)] mb-5 text-xs">
                  {portfoliosError}
                </p>
                <button
                  onClick={() => {
                    void fetchPortfolios();
                  }}
                  className="px-4 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] text-xs font-semibold hover:bg-[var(--color-surface-3)] transition-all shadow-sm"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {/* Clean & Elegant Empty State: Portfolios */}
            {!isPortfoliosLoading && !portfoliosError && portfolios.length === 0 && (
              <div className="relative border border-[var(--color-border)] bg-[var(--color-surface)]/60 rounded p-10 sm:p-16 text-center animate-fade-in light-sweep">
                <div className="relative z-10">
                  <div className="w-14 h-14 mx-auto mb-4 rounded border border-[var(--color-border)] bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text)] shadow-sm">
                    <LayoutGrid size={24} />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text)] tracking-tight mb-2 max-w-md mx-auto">
                    {lang.emptyPortfoliosTitle}
                  </h2>
                  <p className="text-[var(--color-text-muted)] text-xs max-w-md mx-auto mb-6 leading-relaxed">
                    {lang.emptyPortfoliosSubtitle}
                  </p>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] font-semibold text-xs hover:opacity-90 transition-all shadow-sm active:scale-[0.98]"
                  >
                    <Plus size={15} />
                    {lang.createPortfolio}
                  </button>
                </div>
              </div>
            )}

            {/* Portfolios Grid (when items exist) */}
            {!isPortfoliosLoading && portfolios.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
                {portfolios.map((p) => {
                  const IconComp =
                    ICONS.find((ic) => ic.name === p.meta?.icon)?.component || Folder;
                  return (
                    <div
                      key={p._id}
                      className="bg-[var(--color-surface)] rounded p-5 sm:p-6 shadow-sm border border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:shadow-md transition-all duration-200 group flex flex-col justify-between h-full"
                    >
                      {/* Top Content Area */}
                      <div className="flex flex-col flex-1">
                        {/* Header: Icon & Published Badge */}
                        <div className="flex items-start justify-between mb-3.5">
                          <div className="w-10 h-10 rounded border border-[var(--color-border)] bg-[var(--color-surface-2)] flex items-center justify-center text-lg shrink-0">
                            <IconComp size={18} className="text-[var(--color-text)]" />
                          </div>
                          <div
                            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[11px] font-mono font-medium ${
                              p.isPublished
                                ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                                : 'text-[var(--color-text-muted)] border-[var(--color-border)] bg-[var(--color-surface-2)]'
                            }`}
                          >
                            {p.isPublished ? (
                              <Globe
                                size={12}
                                className="text-emerald-500"
                              />
                            ) : (
                              <Lock
                                size={12}
                              />
                            )}
                            <span>
                              {p.isPublished ? lang.public : lang.private}
                            </span>
                          </div>
                        </div>

                        {/* Title & Slug */}
                        <div>
                          <h3 className="text-base font-bold text-[var(--color-text)] group-hover:opacity-85 transition-opacity line-clamp-1">
                            {p.title}
                          </h3>
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-mono">
                            /{p.slug}
                          </p>
                        </div>

                        {/* Description */}
                        {p.description && (
                          <p className="text-xs text-[var(--color-text-faint)] mt-2 line-clamp-2 leading-relaxed">
                            {p.description}
                          </p>
                        )}

                        {/* Category tags */}
                        {(p.categories ?? ['technology']).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {(p.categories ?? ['technology']).map((cat) => (
                              <span
                                key={cat}
                                className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-mono font-medium border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
                              >
                                {CATEGORY_LABELS[cat]?.[language as 'vi' | 'en'] ?? cat}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom Action Row: Uniform 4 slots across all cards */}
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-4 pt-3.5 border-t border-[var(--color-border)]">
                        <Link
                          to={`/${user?.username}/dashboard/portfolios/${p._id}`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded text-xs font-semibold text-[var(--color-text)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] transition-colors shadow-sm"
                        >
                          <ExternalLink size={13} /> {lang.manage}
                        </Link>

                        {/* View public portfolio button */}
                        {p.isPublished ? (
                          <Link
                            to={`/${user?.username ?? ''}/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors border border-[var(--color-border)] shrink-0"
                            title="View public portfolio"
                          >
                            <Globe size={14} />
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="p-2 rounded text-[var(--color-text-faint)] opacity-30 cursor-not-allowed border border-[var(--color-border)] shrink-0"
                            title="Portfolio is private (publish to view)"
                          >
                            <Globe size={14} />
                          </button>
                        )}

                        {/* Copy public link button */}
                        {p.isPublished ? (
                          <button
                            onClick={() => handleCopyLink(p.slug, p._id)}
                            className="p-2 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors border border-[var(--color-border)] shrink-0"
                            title="Copy public link"
                          >
                            {copiedId === p._id ? (
                              <Check
                                size={14}
                                className="text-emerald-500"
                              />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        ) : (
                          <button
                            disabled
                            className="p-2 rounded text-[var(--color-text-faint)] opacity-30 cursor-not-allowed border border-[var(--color-border)] shrink-0"
                            title="Portfolio is private"
                          >
                            <Copy size={14} />
                          </button>
                        )}

                        {/* Delete button */}
                        <button
                          onClick={() => {
                            if (confirm('Delete this portfolio?'))
                              removePortfolio(p._id);
                          }}
                          className="p-2 rounded text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors border border-[var(--color-border)] shrink-0"
                          title={lang.delete}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: PRESENTATIONS (Under Development - Clean & Minimal)         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'presentations' && (
          <div className="relative border border-[var(--color-border)] bg-[var(--color-surface)]/60 rounded p-10 sm:p-16 text-center animate-fade-in light-sweep">
            <div className="relative z-10">
              <div className="w-14 h-14 mx-auto mb-4 rounded border border-[var(--color-border)] bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text)] shadow-sm">
                <Presentation size={24} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text)] tracking-tight mb-2 max-w-md mx-auto">
                {lang.presentationsTitle}
              </h2>
              <p className="text-[var(--color-text-muted)] text-xs max-w-md mx-auto leading-relaxed">
                {lang.presentationsSubtitle}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ─── Modal: Create Portfolio ─────────────────────────────────────── */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreate(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded p-6 sm:p-8 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-5 tracking-tight flex items-center gap-2">
              <Plus size={18} />
              {lang.createPortfolio}
            </h2>
            {createError && (
              <div className="mb-4 px-4 py-2.5 rounded bg-[var(--color-error-bg)] border border-[var(--color-error-border)] text-[var(--color-error)] text-xs">
                {createError}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex gap-3">
                <div className="relative shrink-0">
                  <label className="block text-xs font-mono text-[var(--color-text-muted)] mb-1.5">
                    Icon
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="h-10 w-12 flex items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-surface-3)] transition-colors"
                  >
                    <SelectedIconComp size={18} />
                  </button>
                  {showIconPicker && (
                    <div className="absolute top-[100%] mt-2 left-0 w-[220px] p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded shadow-2xl grid grid-cols-5 gap-1 z-30">
                      {ICONS.map((ic) => (
                        <button
                          key={ic.name}
                          type="button"
                          onClick={() => {
                            setForm({ ...form, icon: ic.name });
                            setShowIconPicker(false);
                          }}
                          className={`p-2 rounded-sm flex items-center justify-center transition-colors ${
                            form.icon === ic.name
                              ? 'bg-[var(--color-surface-2)] border border-[var(--color-border)]'
                              : 'hover:bg-[var(--color-surface-2)]'
                          }`}
                          title={ic.name}
                        >
                          <ic.component
                            size={16}
                            className="text-[var(--color-text)]"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-mono text-[var(--color-text-muted)] mb-1.5">
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
                    className="h-10 w-full px-3 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-all text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-[var(--color-text-muted)] mb-1.5">
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
                  className="h-10 w-full px-3 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-all font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[var(--color-text-muted)] mb-1.5">
                  Description (optional)
                </label>
                <input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="A short description..."
                  className="h-10 w-full px-3 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-all text-xs"
                />
              </div>

              {/* ─── Category Picker ─── */}
              <CategoryPicker
                selectedCategories={form.categories}
                onChange={(categories) => setForm({ ...form, categories })}
                min={1}
                max={3}
              />
              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 h-10 rounded border border-[var(--color-border)] text-[var(--color-text)] font-medium text-xs transition-all hover:bg-[var(--color-surface-2)]"
                >
                  Cancel
                </button>
                <button
                  id="portfolio-create-confirm"
                  type="submit"
                  disabled={creating}
                  className="flex-1 flex items-center justify-center gap-2 h-10 rounded border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] font-semibold text-xs transition-all disabled:opacity-60 hover:opacity-90 shadow-sm"
                >
                  {creating ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                  Create Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
