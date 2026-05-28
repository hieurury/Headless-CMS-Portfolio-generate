import React from 'react';

interface StatBlockProps {
  value?: string;
  label?: string;
  description?: string;
  icon?: string;
  /** Color accent for the value */
  accent?: 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose' | 'sky';
  /** Visual style */
  variant?: 'default' | 'card' | 'minimal' | 'bordered';
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  sectionId?: string;
  [key: string]: unknown;
}

const ACCENT_MAP: Record<string, string> = {
  indigo: 'text-indigo-400',
  violet: 'text-violet-400',
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  rose: 'text-rose-400',
  sky: 'text-sky-400',
};

const ACCENT_BG_MAP: Record<string, string> = {
  indigo: 'bg-indigo-500/10 border-indigo-500/20',
  violet: 'bg-violet-500/10 border-violet-500/20',
  emerald: 'bg-emerald-500/10 border-emerald-500/20',
  amber: 'bg-amber-500/10 border-amber-500/20',
  rose: 'bg-rose-500/10 border-rose-500/20',
  sky: 'bg-sky-500/10 border-sky-500/20',
};

const ALIGN_MAP: Record<string, string> = {
  left: 'text-left items-start',
  center: 'text-center items-center',
  right: 'text-right items-end',
};

/**
 * StatBlock — Displays a stat/metric with value, label, and optional icon.
 * Great for "5+ years experience", "20 projects", "98% satisfaction".
 */
export const StatBlock: React.FC<StatBlockProps> = ({
  value = '0',
  label = 'Stat Label',
  description,
  icon,
  accent = 'indigo',
  variant = 'default',
  align = 'center',
  sectionId,
}) => {
  const accentClass = ACCENT_MAP[accent] ?? ACCENT_MAP.indigo;
  const accentBgClass = ACCENT_BG_MAP[accent] ?? ACCENT_BG_MAP.indigo;
  const alignClass = ALIGN_MAP[align] ?? ALIGN_MAP.center;

  if (variant === 'minimal') {
    return (
      <div id={sectionId} className={`flex flex-col gap-1 ${alignClass}`}>
        {icon && <span className="text-2xl mb-1">{icon}</span>}
        <span
          data-cms-field="value"
          className={`text-4xl md:text-5xl font-bold tabular-nums ${accentClass}`}
        >
          {value}
        </span>
        <span data-cms-field="label" className="text-slate-400 text-sm font-medium">
          {label}
        </span>
        {description && (
          <span className="text-slate-600 text-xs">{description}</span>
        )}
      </div>
    );
  }

  if (variant === 'bordered') {
    return (
      <div
        id={sectionId}
        className={`flex flex-col gap-2 p-5 rounded-2xl border ${accentBgClass} ${alignClass}`}
      >
        {icon && <span className="text-3xl mb-1">{icon}</span>}
        <span
          data-cms-field="value"
          className={`text-3xl md:text-4xl font-bold tabular-nums ${accentClass}`}
        >
          {value}
        </span>
        <span data-cms-field="label" className="text-white text-sm font-semibold">
          {label}
        </span>
        {description && (
          <span className="text-slate-500 text-xs leading-relaxed">{description}</span>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        id={sectionId}
        className={`glass rounded-2xl p-6 flex flex-col gap-3 ${alignClass} transition-all hover:bg-white/5`}
      >
        {icon && (
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl ${accentBgClass}`}>
            {icon}
          </div>
        )}
        <span
          data-cms-field="value"
          className={`text-4xl md:text-5xl font-bold tabular-nums ${accentClass}`}
        >
          {value}
        </span>
        <div>
          <span data-cms-field="label" className="text-white font-semibold block">
            {label}
          </span>
          {description && (
            <span className="text-slate-500 text-sm leading-relaxed mt-1 block">
              {description}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default
  return (
    <div id={sectionId} className={`flex flex-col gap-1 ${alignClass}`}>
      {icon && <span className="text-3xl mb-2">{icon}</span>}
      <span
        data-cms-field="value"
        className={`text-5xl md:text-6xl font-bold tabular-nums tracking-tight ${accentClass}`}
      >
        {value}
      </span>
      <span data-cms-field="label" className="text-slate-300 font-medium">
        {label}
      </span>
      {description && (
        <span className="text-slate-500 text-sm">{description}</span>
      )}
    </div>
  );
};
