import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { publicService, type PublicPortfolioHub } from '../../services/public.service';
import { useUIStore } from '../../store/uiStore';
import { useI18n } from '../../hooks/useI18n';
import { Loader2, Lock, FileText, ArrowRight, Globe, Users, Sun, Moon, Folder, Briefcase, Code, Palette, Laptop, Camera, Book, Video, Image as ImageIcon, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserNavMenu } from '../../components/common/UserNavMenu';
import { SeoHelmet } from '../../core/renderer/SeoHelmet';

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
  const { username, portfolioSlug } = useParams<{ username: string; portfolioSlug: string }>();
  const [data, setData] = useState<PublicPortfolioHub | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pages' | 'posts'>('pages');
  const navigate = useNavigate();
  const { theme, language, toggleTheme, toggleLanguage } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const { t } = useI18n();

  useEffect(() => {
    const load = async () => {
      if (!username || !portfolioSlug) return;
      setIsLoading(true);
      try {
        const result = await publicService.getPortfolio(username, portfolioSlug);
        
        const homePage = result.pages.find(p => p.urlSlug === 'home' || p.urlSlug === '/' || p.urlSlug === '');
        if (homePage) {
          navigate(`/${username}/${portfolioSlug}/home`, { replace: true });
          return;
        }

        setData(result);
      } catch {
        setError('This portfolio is not available or has not been published.');
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [username, portfolioSlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <Loader2 size={36} className="animate-spin text-[var(--color-text-muted)]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center shadow-sm">
            <Lock size={28} className="text-[var(--color-text-muted)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-3">{t('publicHub.notAvailable')}</h1>
          <p className="text-[var(--color-text-muted)] text-sm mb-6">{t('publicHub.notAvailableDesc')}</p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] text-sm font-semibold hover:opacity-85 transition-opacity shadow-sm"
          >
            ← {t('explore.title')}
          </Link>
        </div>
      </div>
    );
  }

  const PortfolioIcon = ICONS.find(ic => ic.name === data.meta?.icon)?.component || Folder;

  // Enrich meta for better AIO context
  const metaAny = data.meta as any;
  const enrichedMeta = {
    ...metaAny,
    aio: {
      ...metaAny?.aio,
      authorName: metaAny?.aio?.authorName || data.ownerName,
      bio: metaAny?.aio?.bio || data.description,
    },
    seo: {
      ...metaAny?.seo,
      description: metaAny?.seo?.description || data.description,
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <SeoHelmet 
        portfolioTitle={data.title}
        pageTitle="Hub"
        meta={enrichedMeta}
      />
      {/* ── Nav ────────────────────────────────────────────────────── */}
      <nav className="home-navbar home-navbar--scrolled sticky top-0 z-40">
        <div className="home-navbar__inner container-max px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/explore"
              className="flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mr-2"
            >
              <ChevronLeft size={20} />
              <span className="font-bold hidden sm:block">{t('explore.explore')}</span>
            </Link>
            <span className="text-[var(--color-border)]">/</span>
            {username && (
              <>
                <Link
                  to={`/${username}`}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-sm font-mono transition-colors"
                >
                  {data?.username ?? username}
                </Link>
                <span className="text-[var(--color-border)]">/</span>
              </>
            )}
            <span className="text-[var(--color-text)] text-sm font-semibold">{data.title}</span>
            <div className="ml-3 flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[var(--color-surface-2)] text-xs font-medium text-[var(--color-text-muted)] border border-[var(--color-border)] hidden sm:flex">
              <Globe size={12} /> {language === 'en' ? 'Published' : 'Đã xuất bản'}
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

            <div
              style={{
                width: 1,
                height: 22,
                background: 'var(--color-border)',
                margin: '0 4px',
              }}
            />
            {isAuthenticated ? (
              <UserNavMenu />
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors hidden sm:block"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-sm border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] text-sm font-medium hover:opacity-85 transition-colors"
                >
                  {t('auth.createOne')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-24 sm:py-32">
        {/* ── Hero ───────────────────────────────────────────────────── */}
        <div className="text-center mb-16 animate-slide-up">
          <div
            className="w-24 h-24 mx-auto mb-6 rounded-sm flex items-center justify-center bg-[var(--color-text)] text-[var(--color-bg)] shadow-md"
          >
            <PortfolioIcon size={40} />
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--color-text)] mb-4 tracking-tight">{data.title}</h1>

          {data.description && (
            <p className="text-[var(--color-text-muted)] text-lg max-w-xl mx-auto mb-6 leading-relaxed">
              {data.description}
            </p>
          )}

          <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-text-faint)] bg-[var(--color-surface)] w-fit mx-auto px-4 py-2 rounded-sm border border-[var(--color-border)] shadow-sm">
            {data.ownerAvatar ? (
              <img src={data.ownerAvatar} alt={data.ownerName} className="w-5 h-5 rounded-full object-cover border border-[var(--color-border)]" />
            ) : (
              <Users size={16} />
            )}
            <span>{t('publicHub.by')} <span className="text-[var(--color-text)] font-semibold">{data.ownerName}</span></span>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-6 border-b border-[var(--color-border)] mb-8 animate-slide-up" style={{ animationDelay: '50ms' }}>
          <button
            onClick={() => setActiveTab('pages')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'pages' ? 'border-[var(--color-text)] text-[var(--color-text)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
          >
            {t('publicHub.pagesTab')} ({data.pages.length})
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'posts' ? 'border-[var(--color-text)] text-[var(--color-text)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
          >
            {t('publicHub.postsTab')} ({data.posts?.length || 0})
          </button>
        </div>

        {/* ── Tab Content ────────────────────────────────────────────── */}
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          {activeTab === 'pages' && (
            data.pages.length === 0 ? (
              <div className="text-center py-20 rounded-sm border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/50">
                <FileText size={40} className="mx-auto mb-4 text-[var(--color-text-faint)]" />
                <p className="text-[var(--color-text-muted)] font-medium">{t('publicHub.noPublishedPages')}</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {data.pages.map((page) => {
                  const PageIcon = ICONS.find(ic => ic.name === page.meta?.icon)?.component || FileText;
                  const displaySlug = page.urlSlug === '/' || page.urlSlug === '' ? 'home' : page.urlSlug;
                  return (
                  <Link
                    key={page.urlSlug}
                    to={`/${username}/${portfolioSlug}/${displaySlug}`}
                    id={`hub-page-link-${page.urlSlug}`}
                    className="group flex items-center justify-between p-4 sm:p-5 rounded-sm border-0 bg-[var(--color-surface)] shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 sm:gap-5">
                      <div
                        className="w-10 h-10 rounded-sm flex items-center justify-center text-sm font-bold shrink-0 bg-[var(--color-text)] text-[var(--color-bg)] transition-transform duration-300 group-hover:scale-110 shadow-sm"
                      >
                        <PageIcon size={20} />
                      </div>
                      <div>
                        <p className="text-[var(--color-text)] font-bold text-lg group-hover:opacity-80 transition-opacity">
                          {page.title}
                        </p>
                        <p className="text-sm text-[var(--color-text-faint)] font-mono mt-0.5">/{displaySlug}</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-sm bg-[var(--color-surface-2)] flex items-center justify-center group-hover:bg-[var(--color-text)] group-hover:text-[var(--color-bg)] text-[var(--color-text-muted)] transition-all duration-300 transform group-hover:translate-x-1 shadow-sm">
                      <ArrowRight size={18} />
                    </div>
                  </Link>
                  );
                })}
              </div>
            )
          )}

          {activeTab === 'posts' && (
            (!data.posts || data.posts.length === 0) ? (
              <div className="text-center py-20 rounded-sm border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/50">
                <FileText size={40} className="mx-auto mb-4 text-[var(--color-text-faint)]" />
                <p className="text-[var(--color-text-muted)] font-medium">{t('publicHub.noPublishedPosts')}</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {data.posts.map((post) => (
                  <Link
                    key={post.slug}
                    to={`/${username}/${portfolioSlug}/post/${post.slug}`}
                    className="group flex flex-col p-4 rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm hover:shadow-md transition-all duration-300 min-h-[160px]"
                  >
                    {post.coverImage && (
                      <div className="w-full h-32 mb-4 rounded-sm overflow-hidden shrink-0 border border-[var(--color-border)]">
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    )}
                    <div className="flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-text-muted)] transition-colors line-clamp-2">{post.title}</h3>
                      {post.excerpt && (
                        <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-4 flex-1">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-[var(--color-text-faint)] font-medium uppercase tracking-wider mt-auto pt-4 border-t border-[var(--color-border)]">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span>{post.views} {t('publicHub.views')}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};
