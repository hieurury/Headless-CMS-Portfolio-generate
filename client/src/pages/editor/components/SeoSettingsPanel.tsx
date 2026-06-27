import React, { useState } from 'react';
import { usePortfolioStore } from '../../../store/portfolioStore';
import { Save, Loader2, Globe, Sparkles } from 'lucide-react';
import clsx from 'clsx';

export const SeoSettingsPanel: React.FC = () => {
  const { current: portfolio, update } = usePortfolioStore();
  const [isSaving, setIsSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Fallbacks if undefined
  const [seo, setSeo] = useState(portfolio?.meta?.seo || {});
  const [aio, setAio] = useState(portfolio?.meta?.aio || {});

  const handleSave = async () => {
    if (!portfolio) return;
    setIsSaving(true);
    try {
      await update(portfolio._id, {
        meta: {
          ...portfolio.meta,
          seo,
          aio,
        },
      });
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2000);
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!portfolio) return null;

  return (
    <div className="flex flex-col h-full overflow-y-auto overscroll-contain pb-12 p-3">
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
          <Globe size={12} className="text-[var(--color-text-faint)]" />
          SEO & AI Context
        </span>
      </div>

      <div className="space-y-6">
        {/* SEO SECTION */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
            <Globe size={14} /> Global SEO
          </h3>
          
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Meta Title</label>
            <input
              type="text"
              value={seo.title || ''}
              onChange={(e) => setSeo({ ...seo, title: e.target.value })}
              className="w-full text-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md px-2.5 py-1.5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
              placeholder={portfolio.title}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Meta Description</label>
            <textarea
              value={seo.description || ''}
              onChange={(e) => setSeo({ ...seo, description: e.target.value })}
              className="w-full text-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md px-2.5 py-1.5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] min-h-[80px]"
              placeholder="Brief description for search engines..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Open Graph Image URL</label>
            <input
              type="text"
              value={seo.ogImage || ''}
              onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
              className="w-full text-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md px-2.5 py-1.5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
              placeholder="https://example.com/image.png"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Keywords (comma separated)</label>
            <input
              type="text"
              value={seo.keywords?.join(', ') || ''}
              onChange={(e) => setSeo({ ...seo, keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) })}
              className="w-full text-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md px-2.5 py-1.5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
              placeholder="portfolio, designer, react..."
            />
          </div>
        </div>

        <div className="h-px bg-[var(--color-border)] w-full" />

        {/* AI CONTEXT SECTION */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
            <Sparkles size={14} className="text-indigo-400" /> AI Optimization (GEO)
          </h3>
          <p className="text-xs text-[var(--color-text-faint)] leading-relaxed">
            These fields generate JSON-LD schema to help AI engines understand your identity and work.
          </p>
          
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Author Name</label>
            <input
              type="text"
              value={aio.authorName || ''}
              onChange={(e) => setAio({ ...aio, authorName: e.target.value })}
              className="w-full text-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md px-2.5 py-1.5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Job Title / Role</label>
            <input
              type="text"
              value={aio.jobTitle || ''}
              onChange={(e) => setAio({ ...aio, jobTitle: e.target.value })}
              className="w-full text-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md px-2.5 py-1.5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
              placeholder="Frontend Developer"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Short Bio</label>
            <textarea
              value={aio.bio || ''}
              onChange={(e) => setAio({ ...aio, bio: e.target.value })}
              className="w-full text-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md px-2.5 py-1.5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] min-h-[80px]"
              placeholder="A short factual bio for AI to digest..."
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={clsx(
            'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all mt-4',
            'bg-[var(--color-text)] text-[var(--color-bg)] hover:bg-[var(--color-text-muted)]'
          )}
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : savedFeedback ? <Globe size={16} /> : <Save size={16} />}
          {isSaving ? 'Saving...' : savedFeedback ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};
