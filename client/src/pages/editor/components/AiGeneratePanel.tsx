import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, Zap } from 'lucide-react';
import { useUIStore } from '../../../store/uiStore';
import { t } from '../../../i18n';
import { aiService } from '../../../services/ai.service';
import type { PageLayout } from '../../../core/types/layout.types';

interface AiGeneratePanelProps {
  portfolioId: string;
  pageId: string;
  /**
   * The layout currently shown on the canvas — including any unsaved edits
   * (manual prop changes, drag/drop, previous AI generations not yet saved).
   * MUST come from the editor's live draft state, not from the page store,
   * otherwise unsaved edits get silently reverted on the next AI prompt
   * because the AI would be "modifying" a stale, already-saved snapshot.
   */
  currentLayout?: PageLayout;
  onLayoutGenerated: (layout: PageLayout) => void;
}

export const AiGeneratePanel: React.FC<AiGeneratePanelProps> = ({
  portfolioId,
  pageId,
  currentLayout,
  onLayoutGenerated,
}) => {
  const { language } = useUIStore();
  const tr = t(language).editor.aiPanel;
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSectionsCount, setLastSectionsCount] = useState<number | null>(
    null,
  );

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.trim().length < 10) {
      setError(tr.promptTooShort);
      return;
    }
    setIsLoading(true);
    setError(null);
    setLastSectionsCount(null);
    try {
      const result = await aiService.generateLayout(
        prompt,
        portfolioId,
        pageId,
        currentLayout,
      );
      onLayoutGenerated(result.layout);
      setLastSectionsCount(result.sectionsGenerated);
      setPrompt('');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? tr.generateFailed;
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-violet-500/15 flex items-center justify-center">
          <Sparkles size={14} className="text-violet-400" />
        </div>
        <div>
          <p className="text-sm font-semibold ">{tr.header}</p>
          <p className="text-xs text-[var(--color-text-faint)]">
            {tr.subtitle}
          </p>
        </div>
      </div>

      {/* Prompt textarea */}
      <textarea
        value={prompt}
        onChange={(e) => {
          setPrompt(e.target.value);
          setError(null);
        }}
        placeholder={tr.promptPlaceholder}
        rows={4}
        className="w-full px-3 py-3 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)]  text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/50 resize-none transition-colors leading-relaxed"
      />

      {/* Character count */}
      <div className="flex items-center justify-between text-xs text-[var(--color-text-faint)]">
        <span>{prompt.length}/2000</span>
        <span
          className={
            prompt.length < 10
              ? 'text-[var(--color-text-faint)]'
              : 'text-emerald-500'
          }
        >
          {prompt.length < 10
            ? `${10 - prompt.length} ${tr.moreCharsNeeded}`
            : tr.ready}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-red-500/10 border border-red-500/20">
          <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Success feedback */}
      {lastSectionsCount !== null && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
          <Zap size={14} className="text-emerald-400 shrink-0" />
          <p className="text-xs text-emerald-400 font-semibold">
            ✓ {lastSectionsCount} sections generated
          </p>
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={isLoading || prompt.trim().length < 10}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-md bg-[var(--color-text)] text-[var(--color-bg)]  font-semibold text-sm hover:shadow-lg hover:shadow-black/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> {tr.generating}
          </>
        ) : (
          <>
            <Sparkles size={16} /> {tr.generateLayout}
          </>
        )}
      </button>

      <p className="text-xs text-[var(--color-text-faint)] text-center">
        💡 {tr.intelligenceNote}
      </p>
    </div>
  );
};
