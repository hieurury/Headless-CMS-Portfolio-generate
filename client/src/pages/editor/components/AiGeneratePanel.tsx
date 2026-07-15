import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, Zap } from 'lucide-react';
import { useUIStore } from '../../../store/uiStore';
import { usePortfolioStore } from '../../../store/portfolioStore';
import { t } from '../../../i18n';
import { aiService } from '../../../services/ai.service';
import type { PageLayout } from '../../../core/types/layout.types';

interface AiGeneratePanelProps {
  portfolioId: string;
  pageId: string;
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
  const { current: portfolio } = usePortfolioStore();
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
      // Build portfolio design meta to help AI pick consistent colors/fonts
      const portfolioMeta = portfolio?.meta
        ? {
            pageLayout: portfolio.meta.pageLayout,
            colors: portfolio.meta.colors,
            fonts: portfolio.meta.fonts,
          }
        : undefined;

      const result = await aiService.generateLayout(
        prompt,
        portfolioId,
        pageId,
        currentLayout,
        portfolioMeta,
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

  const charCount = prompt.trim().length;
  const isReady = charCount >= 10;

  return (
    <div className="flex flex-col h-full justify-end">
      <div className="space-y-4">
        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-[var(--color-error-bg)] border border-[var(--color-error-border)]">
            <AlertCircle size={14} className="text-[var(--color-error)] mt-0.5 shrink-0" />
            <p className="text-xs text-[var(--color-error)]">{error}</p>
          </div>
        )}

        {/* Success feedback */}
        {lastSectionsCount !== null && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-[var(--color-success-bg)] border border-[var(--color-success-border)]">
            <Zap size={14} className="text-[var(--color-text-muted)] shrink-0" />
            <p className="text-xs text-[var(--color-text-muted)] font-semibold">
              ✓ {lastSectionsCount} sections generated
            </p>
          </div>
        )}

        {/* Prompt box */}
        <div
          className={`
            relative rounded-md border transition-all duration-200
            ${
              isReady
                ? 'border-[var(--color-border-hover)] shadow-md shadow-black/20'
                : 'border-[var(--color-border)]'
            }
            bg-[var(--color-surface-2)]
          `}
        >
          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setError(null);
            }}
            placeholder={tr.promptPlaceholder}
            rows={4}
            disabled={isLoading}
            className="w-full px-4 pt-4 pb-2 bg-transparent text-[var(--color-text)] text-sm placeholder-[var(--color-text-faint)] focus:outline-none resize-none leading-relaxed disabled:opacity-50"
          />

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-4 pb-3">
            <span
              className={`text-xs transition-colors ${
                isReady
                  ? 'text-[var(--color-text-muted)]'
                  : 'text-[var(--color-text-faint)]'
              }`}
            >
              {isReady
                ? `✓ Ready · ${charCount}/2000 chars`
                : `${Math.max(0, 10 - charCount)} more chars needed`}
            </span>
            <button
              onClick={handleGenerate}
              disabled={isLoading || !isReady}
              className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-[var(--color-text)] text-[var(--color-bg)] text-sm font-semibold
                hover:shadow-md hover:shadow-black/30 hover:scale-[1.03] transition-all duration-200
                disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> {tr.generating}
                </>
              ) : (
                <>
                  <Sparkles size={13} /> {tr.generateLayout}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
