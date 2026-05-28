import React from 'react';

interface FeatureCardBlockProps {
  icon?: string;
  title?: string;
  description?: string;
  /** Visual style */
  variant?: 'default' | 'glass' | 'outlined' | 'gradient' | 'minimal';
  /** Icon position */
  iconPosition?: 'top' | 'left';
  /** Accent color for icon background */
  accent?: 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose' | 'sky';
  /** Optional link */
  href?: string;
  linkLabel?: string;
  sectionId?: string;
  [key: string]: unknown;
}

const VARIANT_MAP: Record<string, string> = {
  default: 'bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/15',
  glass: 'glass glass-hover',
  outlined: 'border-2 border-indigo-500/25 hover:border-indigo-500/50 bg-transparent',
  gradient: 'bg-gradient-to-br from-indigo-950/40 to-violet-950/20 border border-indigo-500/15',
  minimal: 'hover:bg-white/5',
};

const ACCENT_MAP: Record<string, string> = {
  indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
  violet: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  rose: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
  sky: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
};

/**
 * FeatureCardBlock — Icon + title + description card.
 * Perfect for skills, services, highlights, or any feature list.
 */
export const FeatureCardBlock: React.FC<FeatureCardBlockProps> = ({
  icon = '✨',
  title = 'Feature Title',
  description = 'Describe this feature or highlight here.',
  variant = 'default',
  iconPosition = 'top',
  accent = 'indigo',
  href,
  linkLabel,
  sectionId,
}) => {
  const variantClass = VARIANT_MAP[variant] ?? VARIANT_MAP.default;
  const accentClass = ACCENT_MAP[accent] ?? ACCENT_MAP.indigo;

  const iconEl = (
    <div
      className={`flex-shrink-0 w-12 h-12 rounded-xl border flex items-center justify-center text-2xl transition-all ${accentClass}`}
    >
      {icon}
    </div>
  );

  const content = (
    <>
      {title && (
        <h3
          data-cms-field="title"
          className="text-base font-semibold text-white leading-snug"
        >
          {title}
        </h3>
      )}
      {description && (
        <p
          data-cms-field="description"
          className="text-slate-400 text-sm leading-relaxed"
        >
          {description}
        </p>
      )}
      {href && linkLabel && (
        <a
          href={href}
          className="inline-flex items-center gap-1 text-indigo-400 text-xs font-medium hover:text-indigo-300 transition-colors mt-1"
        >
          {linkLabel} →
        </a>
      )}
    </>
  );

  if (iconPosition === 'left') {
    return (
      <div
        id={sectionId}
        className={`flex gap-4 items-start p-5 rounded-2xl transition-all ${variantClass}`}
      >
        {iconEl}
        <div className="flex flex-col gap-2 min-w-0">{content}</div>
      </div>
    );
  }

  return (
    <div
      id={sectionId}
      className={`flex flex-col gap-4 p-6 rounded-2xl transition-all ${variantClass}`}
    >
      {iconEl}
      <div className="flex flex-col gap-2">{content}</div>
    </div>
  );
};
