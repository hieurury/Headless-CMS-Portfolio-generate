import React, { useState } from 'react';
import {
  Sparkles, Loader2, AlertCircle, Zap, Plus,
  Code2, Palette, BarChart2, Briefcase, GraduationCap,
} from 'lucide-react';
import { aiService } from '../../../services/ai.service';
import type { PageLayout } from '../../../core/types/layout.types';

// ─── Example portfolio prompts ────────────────────────────────────────────────

const EXAMPLES = [
  {
    icon: Code2,
    label: 'Full-Stack Dev',
    color: 'from-indigo-500/20 to-violet-500/10 border-indigo-500/30 text-indigo-300',
    prompt:
      'Full stack developer named Alex with hero, about, skills (React, Node.js, Python, Docker), 4 projects with GitHub links, experience timeline, and contact form',
  },
  {
    icon: Palette,
    label: 'UX / UI Designer',
    color: 'from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-300',
    prompt:
      'UX/UI designer portfolio for Sarah — projects-first layout with creative hero, 5 design projects, about me with design philosophy, tools (Figma, Adobe XD), and contact',
  },
  {
    icon: BarChart2,
    label: 'Data Scientist',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300',
    prompt:
      'Data scientist and ML engineer portfolio with technical skills (Python, TensorFlow, PyTorch, SQL), research projects with GitHub links, academic experience, and publications',
  },
  {
    icon: Briefcase,
    label: 'Freelance Consultant',
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300',
    prompt:
      'Freelance web consultant with corporate layout: professional hero, 10 years of experience, education in Computer Science, key clients, services offered, and contact',
  },
  {
    icon: GraduationCap,
    label: 'Academic Researcher',
    color: 'from-sky-500/20 to-cyan-500/10 border-sky-500/30 text-sky-300',
    prompt:
      'Academic researcher and professor portfolio with about, publications as projects, teaching experience, education (PhD), speaking engagements, and academic contact',
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
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<number | null>(null);

  const handleGenerate = async (text?: string) => {
    const finalPrompt = (text ?? prompt).trim();
    if (finalPrompt.length < 10) {
      setError('Please describe the portfolio (at least 10 characters)');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGenerated(null);
    try {
      const result = await aiService.generateLayout(finalPrompt, portfolioId, pageId);
      onLayoutGenerated(result.layout);
      setGenerated(result.sectionsGenerated);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Generation failed — please try again';
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
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-600/30 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center shadow-xl shadow-violet-500/10 backdrop-blur-sm">
          <Sparkles size={34} className="text-violet-400" />
        </div>
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-3xl ring-2 ring-violet-500/20 animate-ping" style={{ animationDuration: '3s' }} />
      </div>

      {/* ── Heading ─────────────────────────────────────────────── */}
      <h2 className="text-2xl font-bold text-white mb-2 text-center">
        Start with AI
      </h2>
      <p className="text-slate-500 text-sm text-center mb-8 max-w-sm leading-relaxed">
        Describe your portfolio and Gemini will generate a full layout in seconds.
        Or{' '}
        <button
          onClick={onAddBlocks}
          className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors underline-offset-2 hover:underline"
        >
          add blocks manually
        </button>
        .
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
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
              border bg-gradient-to-r transition-all duration-200
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
            relative rounded-2xl border transition-all duration-200
            ${isReady
              ? 'border-violet-500/40 shadow-lg shadow-violet-500/10'
              : 'border-white/10'
            }
            bg-[#0d0d1a]
          `}
        >
          <textarea
            value={prompt}
            onChange={(e) => { setPrompt(e.target.value); setError(null); }}
            placeholder="e.g. Portfolio for a React developer named John with dark theme. Include about, skills (React, Node, Docker), 3 projects with GitHub links, and a contact form."
            rows={4}
            disabled={isLoading}
            className="w-full px-5 pt-4 pb-2 bg-transparent text-slate-300 text-sm placeholder-slate-700 focus:outline-none resize-none leading-relaxed disabled:opacity-50"
          />

          {/* Bottom bar inside textarea card */}
          <div className="flex items-center justify-between px-5 pb-3">
            <span className={`text-xs transition-colors ${isReady ? 'text-emerald-500' : 'text-slate-700'}`}>
              {isReady ? `✓ Ready · ${charCount} chars` : `${Math.max(0, 10 - charCount)} more chars needed`}
            </span>
            <button
              onClick={() => handleGenerate()}
              disabled={isLoading || !isReady}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold
                hover:shadow-lg hover:shadow-violet-500/30 hover:scale-[1.03] transition-all duration-200
                disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? (
                <><Loader2 size={13} className="animate-spin" /> Generating…</>
              ) : (
                <><Sparkles size={13} /> Generate</>
              )}
            </button>
          </div>
        </div>

        {/* Error / success */}
        {error && (
          <div className="mt-3 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}
        {generated !== null && (
          <div className="mt-3 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Zap size={14} className="text-emerald-400 shrink-0" />
            <p className="text-xs text-emerald-400 font-semibold">
              ✓ {generated} sections generated by Gemini
            </p>
          </div>
        )}
      </div>

      {/* ── Divider ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 my-8 w-full max-w-xl">
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-xs text-slate-700 font-medium">or start blank</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* ── Manual add button ────────────────────────────────────── */}
      <button
        onClick={onAddBlocks}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/3 hover:bg-white/8 hover:border-white/20
          text-slate-400 hover:text-white text-sm font-medium transition-all duration-200 group"
      >
        <Plus size={15} className="group-hover:rotate-90 transition-transform duration-200" />
        Add blocks manually
      </button>

      {/* ── Footer note ─────────────────────────────────────────── */}
      <p className="mt-8 text-[11px] text-slate-700 text-center">
        ⚠ AI generation will replace the current layout
      </p>
    </div>
  );
};
