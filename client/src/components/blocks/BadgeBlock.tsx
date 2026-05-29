import React from 'react';

interface BadgeBlockProps {
  label?: string;
  variant?: 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose' | 'sky' | 'slate';
  align?: 'left' | 'center' | 'right';
  dot?: boolean;
  sectionId?: string;
  [key: string]: unknown;
}

const VARIANT_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', dot: 'bg-indigo-400' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', dot: 'bg-violet-400' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', dot: 'bg-rose-400' },
  sky: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20', dot: 'bg-sky-400' },
  slate: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', dot: 'bg-slate-400' },
};

const ALIGN_MAP: Record<string, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

export const BadgeBlock: React.FC<BadgeBlockProps> = ({
  label = 'New',
  variant = 'indigo',
  align = 'left',
  dot = false,
  sectionId,
}) => {
  const styles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.indigo;
  const alignClass = ALIGN_MAP[align] ?? 'justify-start';

  return (
    <div className={`w-full py-1 flex ${alignClass}`} id={sectionId}>
      <span
        data-cms-field="label"
        className={`
          inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border cursor-text
          ${styles.bg} ${styles.text} ${styles.border}
        `}
      >
        {dot && (
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${styles.dot}`} />
        )}
        {label}
      </span>
    </div>
  );
};
