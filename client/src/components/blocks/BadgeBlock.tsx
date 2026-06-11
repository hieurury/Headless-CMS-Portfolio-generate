import React from 'react';

type AlignX = 'left' | 'center' | 'right';
type AlignY = 'top'  | 'middle' | 'bottom';

const JUSTIFY_MAP: Record<AlignX, string> = {
  left:   'flex-start',
  center: 'center',
  right:  'flex-end',
};
const ALIGN_ITEMS_MAP: Record<AlignY, string> = {
  top:    'flex-start',
  middle: 'center',
  bottom: 'flex-end',
};

export interface BadgeBlockProps {
  text?: string;
  variant?: 'solid' | 'outline' | 'subtle';
  color?: 'indigo' | 'rose' | 'emerald' | 'amber' | 'sky' | 'slate' | 'violet';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill';
  alignX?: AlignX;
  alignY?: AlignY;
  textColor?: string;
  backgroundColor?: string;
  sectionId?: string;
  [key: string]: unknown;
}

const SIZE_MAP: Record<string, string> = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
};

const SHAPE_MAP: Record<string, string> = {
  rounded: 'rounded-md',
  pill:    'rounded-full',
};

const COLOR_MAP: Record<string, Record<string, string>> = {
  solid: {
    indigo:  'bg-indigo-500 text-white border border-indigo-500',
    rose:    'bg-rose-500 text-white border border-rose-500',
    emerald: 'bg-emerald-500 text-white border border-emerald-500',
    amber:   'bg-amber-500 text-white border border-amber-500',
    sky:     'bg-sky-500 text-white border border-sky-500',
    slate:   'bg-slate-700 text-white border border-slate-700',
    violet:  'bg-violet-500 text-white border border-violet-500',
  },
  subtle: {
    indigo:  'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    rose:    'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    amber:   'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    sky:     'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    slate:   'bg-slate-500/20 text-slate-300 border border-slate-500/30',
    violet:  'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  },
  outline: {
    indigo:  'bg-transparent text-indigo-400 border border-indigo-500/50',
    rose:    'bg-transparent text-rose-400 border border-rose-500/50',
    emerald: 'bg-transparent text-emerald-400 border border-emerald-500/50',
    amber:   'bg-transparent text-amber-400 border border-amber-500/50',
    sky:     'bg-transparent text-sky-400 border border-sky-500/50',
    slate:   'bg-transparent text-slate-400 border border-slate-600',
    violet:  'bg-transparent text-violet-400 border border-violet-500/50',
  },
};

export const BadgeBlock: React.FC<BadgeBlockProps> = ({
  text      = 'New Feature',
  variant   = 'subtle',
  color     = 'indigo',
  size      = 'sm',
  shape     = 'pill',
  alignX    = 'left',
  alignY    = 'middle',
  textColor,
  backgroundColor,
  sectionId,
}) => {
  const sizeClass  = SIZE_MAP[size] ?? SIZE_MAP.sm;
  const shapeClass = SHAPE_MAP[shape] ?? SHAPE_MAP.pill;
  const colorClass = COLOR_MAP[variant]?.[color] ?? COLOR_MAP.subtle.indigo;

  return (
    <div
      id={sectionId}
      style={{
        width:          '100%',
        height:         '100%',
        display:        'flex',
        justifyContent: JUSTIFY_MAP[alignX]     ?? 'flex-start',
        alignItems:     ALIGN_ITEMS_MAP[alignY] ?? 'center',
      }}
    >
      <div className="py-1">
        <span
          data-cms-field="text"
          className={`inline-block font-medium cursor-text transition-colors ${sizeClass} ${shapeClass} ${colorClass}`}
          style={{
            ...(backgroundColor ? { backgroundColor, borderColor: backgroundColor } : {}),
            ...(textColor ? { color: textColor } : {}),
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};
