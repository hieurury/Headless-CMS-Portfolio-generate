import React, { useState } from 'react';
import {
  Sparkles,
  Loader2,
  AlertCircle,
  Zap,
  Code2,
  Palette,
  BarChart2,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import { useUIStore } from '../../../store/uiStore';
import { t } from '../../../i18n';
import { aiService } from '../../../services/ai.service';
import type { PageLayout } from '../../../core/types/layout.types';

// ─── Example portfolio prompts ────────────────────────────────────────────────

const EXAMPLES = [
  {
    icon: Code2,
    label: 'Full-Stack Dev',
    color: 'bg-sky-500/10 border-sky-500/25 text-sky-400 hover:bg-sky-500/15 hover:border-sky-400/40',
    prompt:
      'Tạo portfolio cho Full Stack Developer tên là Alex. Sử dụng cấu trúc MODERN HERO (chia 2 cột với ảnh). Thêm section About, sau đó là section Skills dạng Feature Cards (chứa React, Node.js, Docker). Tiếp theo là Projects Grid (3 cột, dùng Card) và một Experience Timeline. Cuối trang là Footer có các nút liên hệ.',
  },
  {
    icon: Palette,
    label: 'UX / UI Designer',
    color: 'bg-pink-500/10 border-pink-500/25 text-pink-400 hover:bg-pink-500/15 hover:border-pink-400/40',
    prompt:
      'Tạo portfolio cho UX/UI Designer. Bắt đầu với CREATIVE HERO có tiêu đề thật nổi bật và hiệu ứng gradient. Phần chính là BENTO GRID hiển thị các dự án thiết kế. Thêm section Kỹ năng sử dụng các Card dạng glass, và kết thúc với phần Contact có các nút mạng xã hội lớn.',
  },
  {
    icon: BarChart2,
    label: 'Data Scientist',
    color: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-400/40',
    prompt:
      'Portfolio cho Data Scientist tên Sarah. Sử dụng cấu trúc thanh lịch. Thêm một thanh METRICS/STATS để hiển thị "5+ năm kinh nghiệm", "20+ mô hình ML". Danh sách các công trình nghiên cứu sử dụng cấu trúc Card Grid, và lịch sử học thuật sử dụng Timeline. Cần có phần giới thiệu kỹ năng (Python, SQL).',
  },
  {
    icon: Briefcase,
    label: 'Freelance Consultant',
    color: 'bg-amber-500/10 border-amber-500/25 text-amber-400 hover:bg-amber-500/15 hover:border-amber-400/40',
    prompt:
      'Tạo trang web cho Freelance Web Consultant. Phong cách chuyên nghiệp. Bắt đầu với Hero section căn giữa kèm nút CTA lớn. Tiếp theo là các Dịch vụ cung cấp sử dụng Feature Cards trong lưới 3 cột. Cần có phần chia sẻ các khách hàng lớn và section Contact có viền gradient nổi bật.',
  },
  {
    icon: GraduationCap,
    label: 'Academic Researcher',
    color: 'bg-violet-500/10 border-violet-500/25 text-violet-400 hover:bg-violet-500/15 hover:border-violet-400/40',
    prompt:
      'Portfolio học thuật cho Giáo sư Đại học. Giao diện Minimalist, tập trung vào nội dung. Bắt đầu với Hero gọn gàng. Danh sách các bài báo khoa học xuất bản (dạng Card 2 cột), kinh nghiệm giảng dạy (dạng Timeline), và lịch sử học vấn. Footer đơn giản và chuyên nghiệp.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface EmptyCanvasPromptProps {
  portfolioId: string;
  pageId: string;
  onLayoutGenerated: (layout: PageLayout) => void;
  onAddBlocks: () => void;
}

export const EmptyCanvasPrompt: React.FC<EmptyCanvasPromptProps> = ({
  portfolioId,
  pageId,
  onLayoutGenerated,
  onAddBlocks: _onAddBlocks,
}) => {
  const { language } = useUIStore();
  const tr = t(language).editor.emptyCanvasPrompt;
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<number | null>(null);

  const handleGenerate = async (text?: string) => {
    const finalPrompt = (text ?? prompt).trim();
    if (finalPrompt.length < 10) {
      setError(tr.shortPrompt);
      return;
    }
    setIsLoading(true);
    setError(null);
    setGenerated(null);
    try {
      const result = await aiService.generateLayout(
        finalPrompt,
        portfolioId,
        pageId,
        undefined,
      );
      onLayoutGenerated(result.layout);
      setGenerated(result.sectionsGenerated);
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
    <div className="relative flex flex-col items-center justify-center min-h-full px-6 py-14 overflow-hidden">

      {/* ── AI Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col items-center mb-7">
        {/* Icon row: small inline badge style */}
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
          >
            <Sparkles size={16} className="text-[var(--color-text)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
            {tr.heading}
          </h2>
        </div>

        <p className="text-[var(--color-text-faint)] text-sm text-center max-w-sm leading-relaxed">
          {tr.description}{' '}
          <button
            onClick={_onAddBlocks}
            className="text-[var(--color-text-muted)] font-semibold hover:text-[var(--color-text)] transition-colors underline-offset-2 hover:underline"
          >
            {tr.addBlocksManually}
          </button>
        </p>
      </div>

      {/* ── Example chips ─────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-lg">
        {EXAMPLES.map(({ icon: Icon, label, color, prompt: ex }) => (
          <button
            key={label}
            onClick={() => {
              setPrompt(ex);
              setError(null);
            }}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium
              border transition-all duration-150
              ${color}
            `}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Prompt box ────────────────────────────────────────────── */}
      <div className="w-full max-w-xl">
        <div
          className={`
            relative rounded-sm border transition-all duration-200
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
            className="w-full px-5 pt-4 pb-2 bg-transparent text-[var(--color-text)] text-sm placeholder-[var(--color-text-faint)] focus:outline-none resize-none leading-relaxed disabled:opacity-50"
          />

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-5 pb-3">
            <span
              className={`text-xs transition-colors ${
                isReady
                  ? 'text-[var(--color-text-muted)]'
                  : 'text-[var(--color-text-faint)]'
              }`}
            >
              {isReady
                ? `✓ Ready · ${charCount} chars`
                : `${Math.max(0, 10 - charCount)} more chars needed`}
            </span>
            <button
              onClick={() => handleGenerate()}
              disabled={isLoading || !isReady}
              className="flex items-center gap-2 px-4 py-1.5 rounded-sm bg-[var(--color-text)] text-[var(--color-bg)] text-sm font-semibold
                hover:shadow-md hover:shadow-black/30 hover:scale-[1.03] transition-all duration-200
                disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> {tr.generating}
                </>
              ) : (
                <>
                  <Sparkles size={13} /> {tr.generate}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error / success */}
        {error && (
          <div className="mt-3 flex items-start gap-2 px-4 py-3 rounded-sm bg-[var(--color-error-bg)] border border-[var(--color-error-border)]">
            <AlertCircle size={14} className="text-[var(--color-error)] mt-0.5 shrink-0" />
            <p className="text-xs text-[var(--color-error)]">{error}</p>
          </div>
        )}
        {generated !== null && (
          <div className="mt-3 flex items-center gap-2 px-4 py-3 rounded-sm bg-[var(--color-success-bg)] border border-[var(--color-success-border)]">
            <Zap size={14} className="text-[var(--color-text-muted)] shrink-0" />
            <p className="text-xs text-[var(--color-text-muted)] font-semibold">
              ✓ {generated} sections generated
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
