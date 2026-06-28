import React, { useState } from 'react';
import {
  Sparkles,
  Loader2,
  AlertCircle,
  Zap,
  Plus,
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
    color:
      'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text)]',
    prompt:
      'Tạo portfolio cho Full Stack Developer tên là Alex. Sử dụng cấu trúc MODERN HERO (chia 2 cột với ảnh). Thêm section About, sau đó là section Skills dạng Feature Cards (chứa React, Node.js, Docker). Tiếp theo là Projects Grid (3 cột, dùng Card) và một Experience Timeline. Cuối trang là Footer có các nút liên hệ.',
  },
  {
    icon: Palette,
    label: 'UX / UI Designer',
    color: 'from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-300',
    prompt:
      'Tạo portfolio cho UX/UI Designer. Bắt đầu với CREATIVE HERO có tiêu đề thật nổi bật và hiệu ứng gradient. Phần chính là BENTO GRID hiển thị các dự án thiết kế. Thêm section Kỹ năng sử dụng các Card dạng glass, và kết thúc với phần Contact có các nút mạng xã hội lớn.',
  },
  {
    icon: BarChart2,
    label: 'Data Scientist',
    color:
      'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300',
    prompt:
      'Portfolio cho Data Scientist tên Sarah. Sử dụng cấu trúc thanh lịch. Thêm một thanh METRICS/STATS để hiển thị "5+ năm kinh nghiệm", "20+ mô hình ML". Danh sách các công trình nghiên cứu sử dụng cấu trúc Card Grid, và lịch sử học thuật sử dụng Timeline. Cần có phần giới thiệu kỹ năng (Python, SQL).',
  },
  {
    icon: Briefcase,
    label: 'Freelance Consultant',
    color:
      'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300',
    prompt:
      'Tạo trang web cho Freelance Web Consultant. Phong cách chuyên nghiệp. Bắt đầu với Hero section căn giữa kèm nút CTA lớn. Tiếp theo là các Dịch vụ cung cấp sử dụng Feature Cards trong lưới 3 cột. Cần có phần chia sẻ các khách hàng lớn và section Contact có viền gradient nổi bật.',
  },
  {
    icon: GraduationCap,
    label: 'Academic Researcher',
    color: 'from-sky-500/20 to-cyan-500/10 border-sky-500/30 text-sky-300',
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
  onAddBlocks,
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
    <div className="relative flex flex-col items-center justify-center min-h-full px-6 py-16 overflow-hidden">
      {/* ── Ambient glow background ──────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(99,102,241,0.08) 0%, transparent 70%)',
        }}
      />

      {/* ── Icon ────────────────────────────────────────────────── */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-[var(--color-surface-2)] border border-[var(--color-border-hover)] flex items-center justify-center shadow-md shadow-black/10 backdrop-blur-sm">
          <Sparkles size={34} className="text-violet-400" />
        </div>
        {/* Pulse ring */}
        <div
          className="absolute inset-0 rounded-3xl ring-2 ring-violet-500/20 animate-ping"
          style={{ animationDuration: '3s' }}
        />
      </div>

      {/* ── Heading ─────────────────────────────────────────────── */}
      <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2 text-center">
        {tr.heading}
      </h2>
      <p className="text-[var(--color-text-faint)] text-sm text-center mb-8 max-w-sm leading-relaxed">
        {tr.description}{' '}
        <button
          onClick={onAddBlocks}
          className="text-[var(--color-text)] font-semibold hover:text-[var(--color-text)] font-medium transition-colors underline-offset-2 hover:underline"
        >
          {tr.addBlocksManually}
        </button>
      </p>

      {/* ── Example chips ────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-2 mb-7 max-w-xl">
        {EXAMPLES.map(({ icon: Icon, label, color, prompt: ex }) => (
          <button
            key={label}
            onClick={() => {
              setPrompt(ex);
              setError(null);
            }}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-medium
              border border-r-[4px] bg-gradient-to-r transition-all duration-200
              hover:scale-105 hover:shadow-lg active:scale-95
              ${color}
            `}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Prompt box ───────────────────────────────────────────── */}
      <div className="w-full max-w-xl">
        <div
          className={`
            relative rounded-md border transition-all duration-200
            ${
              isReady
                ? 'border-violet-500/40 shadow-lg shadow-black/10'
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
            className="w-full px-5 pt-4 pb-2 bg-transparent text-[var(--color-text)] text-sm placeholder-slate-700 focus:outline-none resize-none leading-relaxed disabled:opacity-50"
          />

          {/* Bottom bar inside textarea card */}
          <div className="flex items-center justify-between px-5 pb-3">
            <span
              className={`text-xs transition-colors ${isReady ? 'text-emerald-500' : 'text-slate-700'}`}
            >
              {isReady
                ? `✓ Ready · ${charCount} chars`
                : `${Math.max(0, 10 - charCount)} more chars needed`}
            </span>
            <button
              onClick={() => handleGenerate()}
              disabled={isLoading || !isReady}
              className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-[var(--color-text)] text-[var(--color-bg)] text-sm font-semibold
                hover:shadow-lg hover:shadow-violet-500/30 hover:scale-[1.03] transition-all duration-200
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
          <div className="mt-3 flex items-start gap-2 px-4 py-3 rounded-md bg-red-500/10 border border-red-500/20">
            <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}
        {generated !== null && (
          <div className="mt-3 flex items-center gap-2 px-4 py-3 rounded-md bg-emerald-500/10 border border-emerald-500/20">
            <Zap size={14} className="text-emerald-400 shrink-0" />
            <p className="text-xs text-emerald-400 font-semibold">
              ✓ {generated} sections generated
            </p>
          </div>
        )}
      </div>

      {/* ── Divider ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 my-8 w-full max-w-xl">
        <div className="flex-1 h-px bg-[var(--color-surface-2)]" />
        <span className="text-xs text-slate-700 font-medium">
          {tr.orStartBlank}
        </span>
        <div className="flex-1 h-px bg-[var(--color-surface-2)]" />
      </div>

      {/* ── Manual add button ────────────────────────────────────── */}
      <button
        onClick={onAddBlocks}
        className="flex items-center gap-2 px-5 py-2.5 rounded-md border border-[var(--color-border)] bg-white/3 hover:bg-white/8 hover:border-[var(--color-border-hover)]
          text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-sm font-medium transition-all duration-200 group"
      >
        <Plus
          size={15}
          className="group-hover:rotate-90 transition-transform duration-200"
        />
        {tr.addBlocksManually}
      </button>

      {/* ── Footer note ─────────────────────────────────────────── */}
      <p className="mt-8 text-[11px] text-slate-700 text-center">
        ⚠ {tr.warning}
      </p>
    </div>
  );
};
