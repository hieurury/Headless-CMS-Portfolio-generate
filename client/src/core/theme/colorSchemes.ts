/**
 * Color scheme token system.
 * Each scheme maps a name to a set of Tailwind class strings.
 * All class strings are written in FULL so Tailwind JIT detects them statically.
 */

export type ColorScheme =
  | 'indigo'   // blue-indigo-violet (default)
  | 'violet'   // purple-violet-fuchsia
  | 'emerald'  // green-emerald-teal
  | 'rose'     // red-rose-pink
  | 'amber'    // orange-amber-yellow
  | 'cyan'     // cyan-sky-blue
  | 'slate';   // neutral monochrome

export interface SchemeTokens {
  accent: string;
  accentLight: string;
  accentBg: string;
  accentBorder: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  gradientBgFrom: string;
  gradientBgTo: string;
  glowColor: string;
  glow2Color: string;
  progressFrom: string;
  progressTo: string;
  tagClass: string;
  buttonClass: string;
  buttonShadow: string;
  dotClass: string;
  dotShadow: string;
  sectionBg: string;
  pulseClass: string;
  dividerVia: string;
}

const SCHEMES: Record<ColorScheme, SchemeTokens> = {
  indigo: {
    accent: 'text-indigo-400',
    accentLight: 'text-indigo-300',
    accentBg: 'bg-indigo-500/10',
    accentBorder: 'border-indigo-500/20',
    gradientFrom: 'from-indigo-400',
    gradientVia: 'via-violet-400',
    gradientTo: 'to-indigo-300',
    gradientBgFrom: 'from-indigo-600',
    gradientBgTo: 'to-violet-600',
    glowColor: 'bg-indigo-600/10',
    glow2Color: 'bg-violet-600/8',
    progressFrom: 'from-indigo-500',
    progressTo: 'to-violet-500',
    tagClass: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    buttonClass: 'bg-indigo-600 hover:bg-indigo-500',
    buttonShadow: 'hover:shadow-indigo-500/30',
    dotClass: 'bg-indigo-500 border-indigo-300/50',
    dotShadow: 'shadow-indigo-500/50',
    sectionBg: 'bg-[#0d0d14]',
    pulseClass: 'bg-indigo-400',
    dividerVia: 'via-indigo-500/40',
  },
  violet: {
    accent: 'text-violet-400',
    accentLight: 'text-violet-300',
    accentBg: 'bg-violet-500/10',
    accentBorder: 'border-violet-500/20',
    gradientFrom: 'from-violet-400',
    gradientVia: 'via-purple-400',
    gradientTo: 'to-fuchsia-300',
    gradientBgFrom: 'from-violet-600',
    gradientBgTo: 'to-fuchsia-600',
    glowColor: 'bg-violet-600/12',
    glow2Color: 'bg-fuchsia-600/8',
    progressFrom: 'from-violet-500',
    progressTo: 'to-fuchsia-500',
    tagClass: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
    buttonClass: 'bg-violet-600 hover:bg-violet-500',
    buttonShadow: 'hover:shadow-violet-500/30',
    dotClass: 'bg-violet-500 border-violet-300/50',
    dotShadow: 'shadow-violet-500/50',
    sectionBg: 'bg-[#0e0a14]',
    pulseClass: 'bg-violet-400',
    dividerVia: 'via-violet-500/40',
  },
  emerald: {
    accent: 'text-emerald-400',
    accentLight: 'text-emerald-300',
    accentBg: 'bg-emerald-500/10',
    accentBorder: 'border-emerald-500/20',
    gradientFrom: 'from-emerald-400',
    gradientVia: 'via-teal-400',
    gradientTo: 'to-cyan-300',
    gradientBgFrom: 'from-emerald-600',
    gradientBgTo: 'to-teal-600',
    glowColor: 'bg-emerald-600/10',
    glow2Color: 'bg-teal-600/8',
    progressFrom: 'from-emerald-500',
    progressTo: 'to-teal-500',
    tagClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-500',
    buttonShadow: 'hover:shadow-emerald-500/30',
    dotClass: 'bg-emerald-500 border-emerald-300/50',
    dotShadow: 'shadow-emerald-500/50',
    sectionBg: 'bg-[#0a0f0d]',
    pulseClass: 'bg-emerald-400',
    dividerVia: 'via-emerald-500/40',
  },
  rose: {
    accent: 'text-rose-400',
    accentLight: 'text-rose-300',
    accentBg: 'bg-rose-500/10',
    accentBorder: 'border-rose-500/20',
    gradientFrom: 'from-rose-400',
    gradientVia: 'via-pink-400',
    gradientTo: 'to-rose-300',
    gradientBgFrom: 'from-rose-600',
    gradientBgTo: 'to-pink-600',
    glowColor: 'bg-rose-600/10',
    glow2Color: 'bg-pink-600/8',
    progressFrom: 'from-rose-500',
    progressTo: 'to-pink-500',
    tagClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    buttonClass: 'bg-rose-600 hover:bg-rose-500',
    buttonShadow: 'hover:shadow-rose-500/30',
    dotClass: 'bg-rose-500 border-rose-300/50',
    dotShadow: 'shadow-rose-500/50',
    sectionBg: 'bg-[#120a0d]',
    pulseClass: 'bg-rose-400',
    dividerVia: 'via-rose-500/40',
  },
  amber: {
    accent: 'text-amber-400',
    accentLight: 'text-amber-300',
    accentBg: 'bg-amber-500/10',
    accentBorder: 'border-amber-500/20',
    gradientFrom: 'from-amber-400',
    gradientVia: 'via-orange-400',
    gradientTo: 'to-yellow-300',
    gradientBgFrom: 'from-amber-600',
    gradientBgTo: 'to-orange-600',
    glowColor: 'bg-amber-600/10',
    glow2Color: 'bg-orange-600/8',
    progressFrom: 'from-amber-500',
    progressTo: 'to-orange-500',
    tagClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    buttonClass: 'bg-amber-600 hover:bg-amber-500',
    buttonShadow: 'hover:shadow-amber-500/30',
    dotClass: 'bg-amber-500 border-amber-300/50',
    dotShadow: 'shadow-amber-500/50',
    sectionBg: 'bg-[#120f0a]',
    pulseClass: 'bg-amber-400',
    dividerVia: 'via-amber-500/40',
  },
  cyan: {
    accent: 'text-cyan-400',
    accentLight: 'text-cyan-300',
    accentBg: 'bg-cyan-500/10',
    accentBorder: 'border-cyan-500/20',
    gradientFrom: 'from-cyan-400',
    gradientVia: 'via-sky-400',
    gradientTo: 'to-blue-300',
    gradientBgFrom: 'from-cyan-600',
    gradientBgTo: 'to-sky-600',
    glowColor: 'bg-cyan-600/10',
    glow2Color: 'bg-sky-600/8',
    progressFrom: 'from-cyan-500',
    progressTo: 'to-sky-500',
    tagClass: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    buttonClass: 'bg-cyan-600 hover:bg-cyan-500',
    buttonShadow: 'hover:shadow-cyan-500/30',
    dotClass: 'bg-cyan-500 border-cyan-300/50',
    dotShadow: 'shadow-cyan-500/50',
    sectionBg: 'bg-[#0a0f14]',
    pulseClass: 'bg-cyan-400',
    dividerVia: 'via-cyan-500/40',
  },
  slate: {
    accent: 'text-slate-300',
    accentLight: 'text-slate-200',
    accentBg: 'bg-slate-500/10',
    accentBorder: 'border-slate-500/20',
    gradientFrom: 'from-slate-200',
    gradientVia: 'via-white',
    gradientTo: 'to-slate-300',
    gradientBgFrom: 'from-slate-700',
    gradientBgTo: 'to-slate-600',
    glowColor: 'bg-slate-600/10',
    glow2Color: 'bg-slate-500/8',
    progressFrom: 'from-slate-500',
    progressTo: 'to-slate-400',
    tagClass: 'bg-slate-500/10 text-slate-300 border border-slate-500/20',
    buttonClass: 'bg-slate-700 hover:bg-slate-600',
    buttonShadow: 'hover:shadow-slate-500/20',
    dotClass: 'bg-slate-400 border-slate-300/50',
    dotShadow: 'shadow-slate-400/30',
    sectionBg: 'bg-[#0c0c0f]',
    pulseClass: 'bg-slate-300',
    dividerVia: 'via-slate-400/40',
  },
};

/** Get scheme tokens — falls back to 'indigo' if not found. */
export function getScheme(scheme?: string | null): SchemeTokens {
  return SCHEMES[(scheme as ColorScheme) ?? 'indigo'] ?? SCHEMES.indigo;
}

export const ALL_SCHEMES = Object.keys(SCHEMES) as ColorScheme[];
