import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePostStore } from '../../store/postStore';
import { ArrowLeft, Loader2, Calendar, Tag, User } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';

/**
 * PostPreviewPage
 * A simple readonly view for a post to preview its content.
 */
export const PostPreviewPage: React.FC = () => {
  const { portfolioId, postId } = useParams<{ portfolioId: string; postId: string }>();
  const { currentPost, currentPostType, fetchPostById, fetchPostTypeById, isLoading, error } = usePostStore();

  useEffect(() => {
    if (postId) {
      fetchPostById(postId);
    }
  }, [postId, fetchPostById]);

  useEffect(() => {
    if (currentPost?.postTypeId) {
      fetchPostTypeById(currentPost.postTypeId);
    }
  }, [currentPost?.postTypeId, fetchPostTypeById]);

  if (isLoading || !currentPost) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-[var(--color-text-muted)]" />
          <p className="text-[var(--color-text-muted)]">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link to={`/dashboard/portfolios/${portfolioId}`} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:underline">
            ← Back to portfolio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Preview toolbar */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
        <div className="container-max mx-auto px-6 h-14 flex items-center gap-4">
          <Link
            to={`/dashboard/portfolios/${portfolioId}/posts/${postId}/edit`}
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Edit
          </Link>
          <div className="w-px h-4 bg-[var(--color-border)]" />
          <span className="text-sm text-[var(--color-text-muted)]">
            Previewing: <span className="text-[var(--color-text)] font-medium">{currentPost.title}</span>
          </span>
          <div className="w-px h-4 bg-[var(--color-border)]" />
          <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-2)] px-2 py-1 rounded-md capitalize">
            {currentPost.status}
          </span>
        </div>
      </div>

      {/* Post Content */}
      <main className="pt-24 pb-20 container-max mx-auto px-6 max-w-4xl">
        {currentPost.coverImage && (
          <div className="w-full h-[400px] rounded-2xl overflow-hidden mb-8 border border-[var(--color-border)]">
            <img src={currentPost.coverImage} alt={currentPost.title} className="w-full h-full object-cover" />
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{currentPost.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-muted)] mb-10">
          {currentPost.createdAt && (
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              {new Date(currentPost.createdAt).toLocaleDateString()}
            </div>
          )}
          {currentPost.tags && currentPost.tags.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Tag size={14} />
              {currentPost.tags.join(', ')}
            </div>
          )}
        </div>

        {/* Dynamic Fields */}
        <div className="space-y-10">
          {currentPostType?.customFieldsSchema?.map((field) => {
            const value = currentPost.customFieldsData?.[field.name];
            if (!value) return null;

            if (field.type === 'markdown') {
              return (
                <div key={field.name} data-color-mode="dark" className="prose prose-invert max-w-none">
                  <MDEditor.Markdown source={value} style={{ backgroundColor: 'transparent' }} />
                </div>
              );
            }

            if (field.type === 'image') {
              return (
                <div key={field.name} className="my-6">
                  <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">{field.label}</p>
                  <img src={value} alt={field.label} className="rounded-xl border border-[var(--color-border)] max-w-full" />
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
