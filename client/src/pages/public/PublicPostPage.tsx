import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicService, type PublicPostResponse } from '../../services/public.service';
import { Loader2, Lock, LayoutGrid, Calendar, Tag } from 'lucide-react';
import { SeoHelmet } from '../../core/renderer/SeoHelmet';
import { useI18n } from '../../hooks/useI18n';
import MDEditor from '@uiw/react-md-editor';
import MyEditor from '../editor/components/BlockNote';

/**
 * PublicPostPage
 * 
 * Route: /p/:portfolioSlug/post/:postSlug
 * No authentication required.
 * Renders a post using the portfolio's theme.
 */
export const PublicPostPage: React.FC = () => {
  const { username, portfolioSlug, postSlug } = useParams<{
    username: string;
    portfolioSlug: string;
    postSlug: string;
  }>();
  const [data, setData] = useState<PublicPostResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    const load = async () => {
      if (!username || !portfolioSlug || !postSlug) return;
      setIsLoading(true);
      setError(null);
      try {
        const result = await publicService.getPost(username, portfolioSlug, postSlug);
        setData(result);
      } catch (err: unknown) {
        setError(t('publicHub.postNotAvailableDesc'));
      } finally {
        setIsLoading(false);
      }

    };
    void load();
  }, [username, portfolioSlug, postSlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-[var(--color-text-muted)]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center shadow-sm">
            <Lock size={28} className="text-[var(--color-text-muted)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-3">{t('publicHub.notAvailable')}</h1>
          <p className="text-[var(--color-text-muted)] text-sm mb-6">
            {error ?? t('publicHub.postNotAvailableDesc')}
          </p>
          <Link
            to={`/${username}/${portfolioSlug}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] text-sm font-semibold hover:opacity-85 transition-opacity shadow-sm"
          >
            ← {t('publicHub.backToHub')}
          </Link>
        </div>
      </div>
    );
  }

  // Enrich meta for SEO
  const enrichedMeta = {
    ...(data.portfolio.meta as any),
    aio: {
      ...(data.portfolio.meta as any)?.aio,
      authorName: (data.portfolio.meta as any)?.aio?.authorName || data.portfolio.ownerName,
      bio: (data.portfolio.meta as any)?.aio?.bio || data.portfolio.description,
    },
    seo: {
      ...(data.portfolio.meta as any)?.seo,
      description: data.post.title,
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <SeoHelmet
        portfolioTitle={data.portfolio.title}
        pageTitle={data.post.title}
        meta={enrichedMeta}
      />

      {/* Top navigation bar */}
      <nav className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center gap-4 overflow-x-auto scrollbar-hide">
          <Link
            to={`/${username}/${portfolioSlug}`}
            className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] px-2 py-1.5 rounded-sm hover:bg-[var(--color-surface-2)] transition-all shrink-0 font-medium"
          >
            <LayoutGrid size={12} />
            <span className="truncate max-w-[120px]">{data.portfolio.title}</span>
          </Link>
          <div className="w-px h-4 bg-[var(--color-border)]" />
          <span className="text-sm text-[var(--color-text-muted)] truncate">
            {data.post.title}
          </span>
        </div>
      </nav>

      {/* Post Content */}
      <main className="pt-12 pb-20 max-w-4xl mx-auto px-6">
        {data.post.coverImage && (
          <div className="w-full h-[400px] rounded-sm overflow-hidden mb-8 border border-[var(--color-border)] shadow-sm">
            <img src={data.post.coverImage} alt={data.post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{data.post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-muted)] mb-10 border-b border-[var(--color-border)] pb-6">
          {data.post.createdAt && (
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              {new Date(data.post.createdAt).toLocaleDateString()}
            </div>
          )}
          {data.post.tags && data.post.tags.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Tag size={14} />
              {data.post.tags.join(', ')}
            </div>
          )}
        </div>

        {/* Dynamic Fields */}
        <div className="space-y-10">
          {data.postType?.customFieldsSchema?.map((field) => {
            const value = data.post.customFieldsData?.[field.name];
            if (!value) return null;

            if (field.type === 'markdown') {
              if (Array.isArray(value) || (typeof value === 'string' && value.trim().startsWith('['))) {
                return (
                  <div key={field.name} className="my-6 rounded-lg overflow-hidden border border-[var(--color-border)]">
                    <MyEditor value={value} editable={false} />
                  </div>
                );
              }
              return (
                <div key={field.name} data-color-mode="dark" className="prose prose-invert max-w-none">
                  <MDEditor.Markdown source={value as string} style={{ backgroundColor: 'transparent' }} />
                </div>
              );
            }

            if (field.type === 'image') {
              return (
                <div key={field.name} className="my-6">
                  <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">{field.label}</p>
                  <img src={value} alt={field.label} className="rounded-lg border border-[var(--color-border)] max-w-full shadow-sm" />
                </div>
              );
            }

            if (field.type === 'url') {
              return (
                <div key={field.name} className="my-4">
                  <span className="text-sm font-semibold text-[var(--color-text-muted)] mr-2">{field.label}:</span>
                  <a href={value} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">{value}</a>
                </div>
              );
            }

            return (
              <div key={field.name} className="my-4 flex flex-col gap-1">
                <span className="text-sm font-semibold text-[var(--color-text-muted)]">{field.label}:</span>
                <span className="text-[var(--color-text)]">{value}</span>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
