import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { usePortfolioStore } from '../../store/portfolioStore';
import { usePageStore } from '../../store/pageStore';
import { useUIStore } from '../../store/uiStore';
import { usePostStore } from '../../store/postStore';
import { CATEGORY_LABELS } from '../../core/types/layout.types';
import { UserNavMenu } from '../../components/common/UserNavMenu';
import { CategoryPicker } from '../../components/common/CategoryPicker';
import { t } from '../../i18n';
import {
  ArrowLeft, Plus, FileText, Eye, Trash2,
  Loader2, Code2, ChevronRight, Pencil, Globe, Lock, Check,
  Folder, Briefcase, Code, Palette, Laptop, Camera, Book, Video, Image as ImageIcon, Sun, Moon,
  Layers, Tag, AlignLeft, Settings, X, GripVertical, Settings2,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

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
  const { postTypes, posts, fetchPostTypes, fetchPosts, removePost, createPostType, removePostType } = usePostStore();
  const [activeTab, setActiveTab] = useState<'pages' | 'posts'>('pages');
  const [showCreate, setShowCreate] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '', icon: 'FileText' });
  const [creating, setCreating] = useState(false);
  const [selectedPostTypeId, setSelectedPostTypeId] = useState<string>('');

  // Edit Portfolio modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    slug: '',
    description: '',
    icon: 'Folder',
    categories: ['technology'] as string[],
  });
  const [showEditIconPicker, setShowEditIconPicker] = useState(false);
  const [updatingPortfolio, setUpdatingPortfolio] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // PostType creation modal state
  const [showPostTypeModal, setShowPostTypeModal] = useState(false);
  const [ptForm, setPtForm] = useState({ name: '', description: '' });
  const [ptFields, setPtFields] = useState<Array<{ name: string; label: string; type: string; options: string }>>([]);
  const [ptSaving, setPtSaving] = useState(false);
  const [ptError, setPtError] = useState<string | null>(null);

  const lang = t(language).dashboard;
  const { user } = useAuthStore();
  const userId = user?._id;
  useEffect(() => {
    if (portfolioId) {
      fetchOne(portfolioId);
      fetchAll(portfolioId);
    }
  }, [portfolioId, fetchOne, fetchAll]);

  useEffect(() => {
    if (activeTab === 'posts') {
      void fetchPostTypes();
      void fetchPosts(selectedPostTypeId || undefined);

    }
  }, [activeTab, fetchPostTypes, fetchPosts, selectedPostTypeId]);

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

  const handleOpenEditPortfolio = () => {
    if (portfolio) {
      setEditForm({
        title: portfolio.title || '',
        slug: portfolio.slug || '',
        description: portfolio.description || '',
        icon: portfolio.meta?.icon || 'Folder',
        categories: portfolio.categories?.length ? [...portfolio.categories] : ['technology'],
      });
      setEditError(null);
      setShowEditModal(true);
    }
  };

  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioId || !editForm.title.trim()) return;
    setUpdatingPortfolio(true);
    setEditError(null);
    try {
      await usePortfolioStore.getState().update(portfolioId, {
        title: editForm.title.trim(),
        slug: editForm.slug.trim(),
        description: editForm.description.trim(),
        categories: editForm.categories,
        meta: {
          ...portfolio?.meta,
          icon: editForm.icon,
        },
      });
      setShowEditModal(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update portfolio';
      setEditError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setUpdatingPortfolio(false);
    }
  };

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

  const handleCreatePostType = async (e: React.FormEvent) => {
    e.preventDefault();
    setPtSaving(true);
    setPtError(null);
    try {
      const customFieldsSchema = ptFields.map((f) => ({
        name: f.name.trim().replace(/\s+/g, '_').toLowerCase(),
        label: f.label.trim(),
        type: f.type,
        options: f.options ? f.options.split(',').map((o) => o.trim()).filter(Boolean) : undefined,
      }));
      await createPostType({
        name: ptForm.name.trim(),
        description: ptForm.description.trim() || undefined,
        customFieldsSchema,
      });
      setShowPostTypeModal(false);
      setPtForm({ name: '', description: '' });
      setPtFields([]);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create post type';
      setPtError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setPtSaving(false);
    }
  };

  const addPtField = () =>
    setPtFields((prev) => [...prev, { name: '', label: '', type: 'text', options: '' }]);

  const updatePtField = (i: number, key: string, val: string) =>
    setPtFields((prev) => prev.map((f, idx) => (idx === i ? { ...f, [key]: val } : f)));

  const removePtField = (i: number) =>
    setPtFields((prev) => prev.filter((_, idx) => idx !== i));

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
              className="w-8 h-8 flex items-center justify-center rounded text-xs font-bold text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-colors"
              title={language === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang Tiếng Anh'}
            >
              {language.toUpperCase()}
            </button>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

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
      </header>

      <main className="container-max mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-1">{portfolio?.title ?? '...'}</h1>
            <p className="text-[var(--color-text-muted)] text-xs sm:text-sm font-mono">/{portfolio?.slug}</p>
            {(portfolio?.categories ?? ['technology']).length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                {(portfolio?.categories ?? ['technology']).map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-mono font-medium border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
                  >
                    {CATEGORY_LABELS[cat]?.[language as 'vi' | 'en'] ?? cat}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Edit Portfolio Info */}
            <button
              id="edit-portfolio-btn"
              onClick={handleOpenEditPortfolio}
              className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold transition-all border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] shadow-sm"
              title={language === 'vi' ? 'Chỉnh sửa thông tin portfolio' : 'Edit portfolio info'}
            >
              <Pencil size={13} />
              <span>{lang.editPortfolio || (language === 'vi' ? 'Sửa thông tin' : 'Edit Info')}</span>
            </button>

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
                className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold transition-all border ${portfolio.isPublished
                  ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 shadow-sm'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'
                  }`}
                title={portfolio.isPublished ? 'Click to unpublish' : 'Click to publish'}
              >
                {portfolio.isPublished ? <Globe size={14} className="text-emerald-500" /> : <Lock size={14} />}
                {portfolio.isPublished ? lang.public : lang.private}
              </button>
            )}
            {activeTab === 'pages' && (
              <button
                id="create-page-btn"
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2 rounded border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] font-semibold text-xs hover:opacity-85 transition-all shadow-sm active:scale-[0.98]"
              >
                <Plus size={16} /> {lang.newPage}
              </button>
            )}
            {activeTab === 'posts' && selectedPostTypeId && (
              <button
                id="create-post-btn"
                onClick={() => navigate(`/dashboard/portfolios/${portfolioId}/posts/new?postTypeId=${selectedPostTypeId}`)}
                className="flex items-center gap-2 px-4 py-2 rounded border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] font-semibold text-xs hover:opacity-85 transition-all shadow-sm active:scale-[0.98]"
              >
                <Plus size={16} /> New Post
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 border-b border-[var(--color-border)]">
          <button
            onClick={() => setActiveTab('pages')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === 'pages'
              ? 'border-[var(--color-text)] text-[var(--color-text)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
          >
            <FileText size={15} />
            {lang.pages}
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
              {pages.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === 'posts'
              ? 'border-[var(--color-text)] text-[var(--color-text)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
          >
            <Layers size={15} />
            Posts
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
              {posts.length}
            </span>
          </button>
        </div>

        {/* ── Pages Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'pages' && (
          <>
            {isLoading && pages.length === 0 && (
              <div className="flex items-center justify-center py-24">
                <Loader2 size={32} className="animate-spin text-[var(--color-text-muted)]" />
              </div>
            )}

            {!isLoading && pages.length === 0 && (
              <div className="relative border border-[var(--color-border)] bg-[var(--color-surface)]/60 rounded p-8 sm:p-12 overflow-hidden text-center grid-pattern mb-6 light-sweep">
                <div className="relative z-10">
                  <div className="w-14 h-14 mx-auto mb-4 rounded border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text)] shadow-sm">
                    <FileText size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-text)] tracking-tight mb-1">
                    {lang.noPages}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto mb-6 leading-relaxed">
                    Add your first page to start structuring your layout with visual drag & drop sections.
                  </p>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] text-xs font-semibold hover:opacity-90 transition-all shadow-sm active:scale-[0.98]"
                  >
                    <Plus size={15} />
                    {lang.createPage}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {pages.map((page) => {
                const IconComp = ICONS.find(ic => ic.name === page.meta?.icon)?.component || FileText;
                return (
                  <div key={page._id} className="bg-[var(--color-surface)] border border-[var(--color-border)] border-l-[4px] border-l-[var(--color-text)] shadow-sm hover:shadow-md rounded p-4 sm:p-5 flex items-center gap-4 transition-all duration-200 group">
                    <div className="w-10 h-10 rounded border border-[var(--color-border)] bg-[var(--color-surface-2)] flex items-center justify-center shrink-0">
                      <IconComp size={18} className="text-[var(--color-text)]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-[var(--color-text)] group-hover:opacity-80 transition-opacity">{page.title}</h3>
                      <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                        <code className="text-xs text-[var(--color-text-muted)] font-mono">{page.slug}</code>
                        <span className="text-[var(--color-text-faint)]">·</span>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {page.layout?.sections?.length ?? 0} {(page.layout?.sections?.length ?? 0) !== 1 ? lang.sectionsPlural : lang.sections}
                        </span>
                        {/* Published status badge */}
                        <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-medium px-1.5 py-0.5 rounded-sm ${page.isPublished
                          ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20'
                          : 'text-[var(--color-text-faint)] border border-[var(--color-border)] bg-[var(--color-surface-2)]'
                          }`}>
                          {page.isPublished ? <Globe size={10} className="text-emerald-500" /> : <Lock size={10} />}
                          {page.isPublished ? lang.public : lang.private}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Publish/Unpublish toggle */}
                      <button
                        onClick={() => {
                          if (portfolioId)
                            update(portfolioId, page._id, { isPublished: !page.isPublished } as Parameters<typeof update>[2]);
                        }}
                        className={`p-2 rounded border border-[var(--color-border)] transition-colors ${page.isPublished
                          ? 'text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/30'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                          }`}
                        title={page.isPublished ? 'Unpublish page' : 'Publish page'}
                      >
                        <Globe size={14} />
                      </button>

                      {/* Edit */}
                      <Link
                        to={`/dashboard/portfolios/${portfolioId}/pages/${page._id}/edit`}
                        className="p-2 rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
                        title="Open editor"
                      >
                        <Pencil size={14} />
                      </Link>

                      {/* JSON Inspector */}
                      <button
                        onClick={() => {
                          const json = JSON.stringify(page.layout, null, 2);
                          const w = window.open('', '_blank');
                          w?.document.write(`<pre style="background:var(--color-bg);color:var(--color-text);padding:2rem;font-family:monospace;font-size:13px;white-space:pre-wrap;">${json}</pre>`);
                        }}
                        className="p-2 rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
                        title="Inspect JSON layout"
                      >
                        <Code2 size={14} />
                      </button>

                      {/* Preview */}
                      <Link
                        to={`/preview/${portfolioId}/${encodeURIComponent(page._id)}`}
                        className="p-2 rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
                        title="Preview page"
                      >
                        <Eye size={14} />
                      </Link>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (portfolioId && confirm('Delete this page?'))
                            remove(portfolioId, page._id);
                        }}
                        className="p-2 rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Delete page"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Posts Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {/* PostType filter row */}
            <div>
              {/* PostType header row */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Post Types</p>
                <button
                  onClick={() => { setShowPostTypeModal(true); setPtError(null); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-all"
                >
                  <Plus size={12} /> New Collection Type
                </button>
              </div>

              {postTypes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 border border-dashed border-[var(--color-border)] rounded-md gap-3 bg-[var(--color-surface)]/50">
                  <Layers size={22} className="text-[var(--color-text-muted)]" />
                  <p className="text-xs text-[var(--color-text-muted)] font-mono">No post types configured yet.</p>
                  <button
                    onClick={() => { setShowPostTypeModal(true); setPtError(null); }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] text-xs font-semibold hover:opacity-90 transition-all shadow-sm"
                  >
                    <Plus size={13} /> Create First Post Type
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedPostTypeId('')}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium border transition-all ${selectedPostTypeId === ''
                      ? 'border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]'
                      }`}
                  >
                    All
                  </button>
                  {postTypes.map((pt) => (
                    <div key={pt._id} className="relative group/pt flex items-center">
                      <button
                        onClick={() => setSelectedPostTypeId(pt._id)}
                        className={`pl-3 pr-7 py-1.5 rounded-md text-xs font-medium border transition-all ${selectedPostTypeId === pt._id
                          ? 'border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)]'
                          : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]'
                          }`}
                      >
                        {pt.name}
                        {pt.customFieldsSchema?.length > 0 && (
                          <span className="ml-1.5 opacity-60 font-mono text-[10px]">{pt.customFieldsSchema.length} fields</span>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete post type "${pt.name}"?`)) {
                            void removePostType(pt._id);
                            if (selectedPostTypeId === pt._id) setSelectedPostTypeId('');
                          }
                        }}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded opacity-0 group-hover/pt:opacity-100 text-[var(--color-text-faint)] hover:text-red-500 transition-all"
                        title="Delete post type"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Posts list */}
            {posts.length === 0 ? (
              <div className="relative text-center py-14 border border-dashed border-[var(--color-border)] rounded bg-[var(--color-surface)]/50 light-sweep">
                <div className="relative z-10">
                  <AlignLeft size={24} className="mx-auto mb-2 text-[var(--color-text-muted)]" />
                  <p className="text-xs text-[var(--color-text-muted)] mb-4">No posts published in this portfolio yet.</p>
                  {selectedPostTypeId ? (
                    <button
                      onClick={() => navigate(`/dashboard/portfolios/${portfolioId}/posts/new?postTypeId=${selectedPostTypeId}`)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] font-semibold text-xs hover:opacity-90 transition-all shadow-sm"
                    >
                      <Plus size={13} /> Create First Post
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const firstPt = postTypes[0];
                        if (firstPt) {
                          navigate(`/dashboard/portfolios/${portfolioId}/posts/new?postTypeId=${firstPt._id}`);
                        } else {
                          setShowPostTypeModal(true);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] font-semibold text-xs hover:opacity-90 transition-all shadow-sm"
                    >
                      <Plus size={13} /> {postTypes.length > 0 ? 'Create First Post' : 'Configure Post Type First'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => {
                  const pt = postTypes.find((p) => p._id === post.postTypeId);
                  return (
                    <div
                      key={post._id}
                      className="bg-[var(--color-surface)] border border-transparent border-l-[5px] border-l-[var(--color-text)] shadow-sm hover:shadow-md rounded-lg p-5 flex items-center gap-4 transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] flex items-center justify-center shrink-0">
                        <AlignLeft size={18} className="text-[var(--color-text)]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[var(--color-text)] group-hover:opacity-80 transition-opacity truncate">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <code className="text-xs text-[var(--color-text-muted)] font-mono truncate max-w-[160px]">{post.slug}</code>
                          {pt && (
                            <span className="text-xs px-1.5 py-0.5 rounded-md bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                              {pt.name}
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-md ${post.status === 'published'
                            ? 'text-emerald-500 bg-emerald-500/10'
                            : 'text-[var(--color-text-faint)] border border-[var(--color-border)]'
                            }`}>
                            {post.status === 'published' ? <Globe size={10} /> : <Lock size={10} />}
                            {post.status}
                          </span>
                          {post.tags && post.tags.length > 0 && (
                            <span className="flex items-center gap-1 text-xs text-[var(--color-text-faint)]">
                              <Tag size={10} /> {post.tags.slice(0, 2).join(', ')}{post.tags.length > 2 ? ` +${post.tags.length - 2}` : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Preview / View Public */}
                        <a
                          href={`/p/${portfolio?.slug}/post/${post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
                          title="View public post"
                        >
                          <Eye size={16} />
                        </a>
                        {
                          userId == post.authorId && (
                            <>
                              <button
                                onClick={() => navigate(`/dashboard/portfolios/${portfolioId}/posts/${post._id}/edit`)}
                                className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
                                title="Edit post"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Delete this post?')) void removePost(post._id);
                                }}
                                className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                title="Delete post"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )
                        }

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded p-6 sm:p-7 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-5 tracking-tight flex items-center gap-2">
              <Plus size={18} />
              {lang.createPage}
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex gap-3">
                <div className="relative shrink-0">
                  <label className="block text-xs font-mono text-[var(--color-text-muted)] mb-1.5">Icon</label>
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="h-10 w-12 flex items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] hover:border-[var(--color-text)] transition-colors"
                  >
                    {(() => {
                      const C = ICONS.find(ic => ic.name === form.icon)?.component || FileText;
                      return <C size={18} />;
                    })()}
                  </button>
                  {showIconPicker && (
                    <div className="absolute top-[100%] mt-2 left-0 w-[220px] p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded shadow-xl grid grid-cols-5 gap-1 z-20">
                      {ICONS.map(ic => (
                        <button
                          key={ic.name}
                          type="button"
                          onClick={() => { setForm({ ...form, icon: ic.name }); setShowIconPicker(false); }}
                          className={`p-2 rounded flex items-center justify-center transition-colors ${form.icon === ic.name ? 'bg-[var(--color-surface-2)] border border-[var(--color-border)]' : 'hover:bg-[var(--color-surface-2)]'}`}
                          title={ic.name}
                        >
                          <ic.component size={16} className="text-[var(--color-text)]" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-mono text-[var(--color-text-muted)] mb-1.5">Page Title</label>
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
                    className="h-10 w-full px-3 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-all text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-[var(--color-text-muted)] mb-1.5">Slug</label>
                <input
                  id="page-slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="/ or /about"
                  className="h-10 w-full px-3 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-all font-mono text-xs"
                />
              </div>
              <div className="flex gap-2.5 pt-3">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 h-10 rounded border border-[var(--color-border)] text-[var(--color-text)] font-medium text-xs transition-all hover:bg-[var(--color-surface-2)]">
                  Cancel
                </button>
                <button
                  id="page-create-confirm"
                  type="submit"
                  disabled={creating}
                  className="flex-1 flex items-center justify-center gap-2 h-10 rounded border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] font-semibold text-xs transition-all disabled:opacity-60 hover:opacity-90 shadow-sm"
                >
                  {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Create Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Create PostType Modal ──────────────────────────────────────────── */}
      {showPostTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowPostTypeModal(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded p-6 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
                <Settings size={16} /> New Post Type
              </h2>
              <button onClick={() => setShowPostTypeModal(false)} className="p-1.5 rounded hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] transition-colors">
                <X size={16} />
              </button>
            </div>

            {ptError && (
              <div className="mb-4 px-4 py-2.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {ptError}
              </div>
            )}

            <form onSubmit={handleCreatePostType} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-mono text-[var(--color-text-muted)] mb-1.5">Name *</label>
                <input
                  id="posttype-name"
                  value={ptForm.name}
                  onChange={(e) => setPtForm({ ...ptForm, name: e.target.value })}
                  placeholder="e.g. Blog Post, Project, Product"
                  required
                  className="h-10 w-full px-3 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-all text-xs"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono text-[var(--color-text-muted)] mb-1.5">Description (optional)</label>
                <input
                  value={ptForm.description}
                  onChange={(e) => setPtForm({ ...ptForm, description: e.target.value })}
                  placeholder="Short description of this post type"
                  className="h-10 w-full px-3 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-all text-xs"
                />
              </div>

              {/* Custom Fields */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono text-[var(--color-text-muted)]">Custom Fields</label>
                  <button
                    type="button"
                    onClick={addPtField}
                    className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    <Plus size={13} /> Add Field
                  </button>
                </div>

                {ptFields.length === 0 ? (
                  <div
                    onClick={addPtField}
                    className="flex items-center justify-center py-6 rounded border border-dashed border-[var(--color-border)] text-xs text-[var(--color-text-faint)] hover:border-[var(--color-text-muted)] hover:text-[var(--color-text-muted)] cursor-pointer transition-all gap-2"
                  >
                    <Plus size={13} /> Click to add a custom field
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ptFields.map((field, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded border border-[var(--color-border)] bg-[var(--color-surface-2)]">
                        <GripVertical size={14} className="mt-2.5 text-[var(--color-text-faint)] shrink-0" />
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <input
                            value={field.label}
                            onChange={(e) => updatePtField(i, 'label', e.target.value)}
                            placeholder="Label (e.g. Price)"
                            className="h-8 px-2.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-xs placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-all"
                          />
                          <input
                            value={field.name}
                            onChange={(e) => updatePtField(i, 'name', e.target.value)}
                            placeholder="Key (e.g. price)"
                            className="h-8 px-2.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-xs placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-all font-mono"
                          />
                          <select
                            value={field.type}
                            onChange={(e) => updatePtField(i, 'type', e.target.value)}
                            className="h-8 px-2.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-xs focus:outline-none focus:border-[var(--color-text)] transition-all cursor-pointer"
                          >
                            <option value="text">Text</option>
                            <option value="textarea">Textarea</option>
                            <option value="markdown">Markdown ✦</option>
                            <option value="number">Number</option>
                            <option value="url">URL</option>
                            <option value="date">Date</option>
                            <option value="select">Select</option>
                            <option value="image">Image ✦</option>
                          </select>
                          {field.type === 'select' ? (
                            <input
                              value={field.options}
                              onChange={(e) => updatePtField(i, 'options', e.target.value)}
                              placeholder="Options: A, B, C"
                              className="h-8 px-2.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-xs placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-all"
                            />
                          ) : (
                            <div className="h-8" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removePtField(i)}
                          className="p-1.5 mt-0.5 rounded text-[var(--color-text-faint)] hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostTypeModal(false)}
                  className="flex-1 h-10 rounded border border-[var(--color-border)] text-[var(--color-text)] font-medium text-xs transition-all hover:bg-[var(--color-surface-2)]"
                >
                  Cancel
                </button>
                <button
                  id="posttype-create-confirm"
                  type="submit"
                  disabled={ptSaving || !ptForm.name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 h-10 rounded border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] font-semibold text-xs transition-all disabled:opacity-50 hover:opacity-85 shadow-sm"
                >
                  {ptSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Portfolio Modal ──────────────────────────────────────────── */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded p-6 sm:p-7 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
                <Pencil size={16} />
                {lang.editPortfolioModalTitle || (language === 'vi' ? 'Sửa thông tin Portfolio' : 'Edit Portfolio Info')}
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {editError && (
              <div className="mb-4 px-4 py-2.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {editError}
              </div>
            )}

            <form onSubmit={handleSavePortfolio} className="space-y-4">
              <div className="flex gap-3">
                <div className="relative shrink-0">
                  <label className="block text-xs font-mono text-[var(--color-text-muted)] mb-1.5">
                    Icon
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowEditIconPicker(!showEditIconPicker)}
                    className="h-10 w-12 flex items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] hover:border-[var(--color-text)] transition-colors"
                  >
                    {(() => {
                      const C =
                        ICONS.find((ic) => ic.name === editForm.icon)
                          ?.component || Folder;
                      return <C size={18} />;
                    })()}
                  </button>
                  {showEditIconPicker && (
                    <div className="absolute top-[100%] mt-2 left-0 w-[220px] p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded shadow-xl grid grid-cols-5 gap-1 z-20">
                      {ICONS.map((ic) => (
                        <button
                          key={ic.name}
                          type="button"
                          onClick={() => {
                            setEditForm({
                              ...editForm,
                              icon: ic.name,
                            });
                            setShowEditIconPicker(false);
                          }}
                          className={`p-2 rounded flex items-center justify-center transition-colors ${
                            editForm.icon === ic.name
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
                    id="edit-portfolio-title"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        title: e.target.value,
                        slug: slugify(e.target.value),
                      })
                    }
                    placeholder="Portfolio Title"
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
                  id="edit-portfolio-slug"
                  value={editForm.slug}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      slug: slugify(e.target.value),
                    })
                  }
                  placeholder="portfolio-slug"
                  required
                  className="h-10 w-full px-3 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-all font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[var(--color-text-muted)] mb-1.5">
                  Description (optional)
                </label>
                <input
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="A short description..."
                  className="h-10 w-full px-3 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-all text-xs"
                />
              </div>

              {/* Category Picker */}
              <CategoryPicker
                selectedCategories={editForm.categories}
                onChange={(categories) =>
                  setEditForm({
                    ...editForm,
                    categories,
                  })
                }
                min={1}
                max={3}
              />

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 h-10 rounded border border-[var(--color-border)] text-[var(--color-text)] font-medium text-xs transition-all hover:bg-[var(--color-surface-2)]"
                >
                  Cancel
                </button>
                <button
                  id="portfolio-edit-confirm"
                  type="submit"
                  disabled={updatingPortfolio || !editForm.title.trim()}
                  className="flex-1 flex items-center justify-center gap-2 h-10 rounded border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] font-semibold text-xs transition-all disabled:opacity-60 hover:opacity-90 shadow-sm"
                >
                  {updatingPortfolio ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  {lang.saveChanges || (language === 'vi' ? 'Lưu thay đổi' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
