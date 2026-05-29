import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconBlockProps {
  /** Name of the Lucide icon, e.g. "Star", "Zap", "Code2" */
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: string;
  /** Background shape behind the icon */
  shape?: 'none' | 'circle' | 'square' | 'rounded';
  /** Accent palette for background + icon tint */
  accent?: 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose' | 'sky' | 'slate' | 'custom';
  align?: 'left' | 'center' | 'right';
  sectionId?: string;
  [key: string]: unknown;
}

// Map size token → px value for the Lucide <Icon> component
const ICON_PX: Record<string, number> = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 32,
  xl: 40,
  '2xl': 56,
};

// Wrapper size (the background shape)
const WRAPPER_SIZE: Record<string, string> = {
  xs: 'w-7 h-7',
  sm: 'w-9 h-9',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
  '2xl': 'w-28 h-28',
};

const ACCENT_STYLES: Record<string, { bg: string; text: string }> = {
  indigo:  { bg: 'bg-indigo-500/15 border border-indigo-500/25',  text: 'text-indigo-400' },
  violet:  { bg: 'bg-violet-500/15 border border-violet-500/25',  text: 'text-violet-400' },
  emerald: { bg: 'bg-emerald-500/15 border border-emerald-500/25', text: 'text-emerald-400' },
  amber:   { bg: 'bg-amber-500/15 border border-amber-500/25',    text: 'text-amber-400' },
  rose:    { bg: 'bg-rose-500/15 border border-rose-500/25',      text: 'text-rose-400' },
  sky:     { bg: 'bg-sky-500/15 border border-sky-500/25',        text: 'text-sky-400' },
  slate:   { bg: 'bg-white/5 border border-white/10',             text: 'text-slate-400' },
  custom:  { bg: '',                                               text: '' },
};

const SHAPE_RADIUS: Record<string, string> = {
  none:    '',
  circle:  'rounded-full',
  square:  'rounded-none',
  rounded: 'rounded-xl',
};

const ALIGN_MAP: Record<string, string> = {
  left:   'justify-start',
  center: 'justify-center',
  right:  'justify-end',
};

export const IconBlock: React.FC<IconBlockProps> = ({
  name = 'Sparkles',
  size = 'md',
  color,
  shape = 'rounded',
  accent = 'indigo',
  align = 'left',
  sectionId,
}) => {
  // Resolve the Lucide icon by name (case-insensitive)
  const iconKey = Object.keys(LucideIcons).find(
    (k) => k.toLowerCase() === (name ?? 'sparkles').toLowerCase(),
  ) ?? 'Sparkles';

  const IconComponent = (LucideIcons as Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>>)[iconKey];

  const px = ICON_PX[size] ?? 24;
  const wrapperSize = WRAPPER_SIZE[size] ?? WRAPPER_SIZE.md;
  const accentStyle = ACCENT_STYLES[accent] ?? ACCENT_STYLES.indigo;
  const shapeClass = SHAPE_RADIUS[shape] ?? SHAPE_RADIUS.rounded;
  const alignClass = ALIGN_MAP[align] ?? 'justify-start';

  const hasBackground = shape !== 'none';

  return (
    <div className={`flex ${alignClass}`} id={sectionId}>
      {hasBackground ? (
        <div
          className={`flex items-center justify-center shrink-0 ${wrapperSize} ${accentStyle.bg} ${shapeClass}`}
        >
          {IconComponent && (
            <IconComponent
              size={px}
              className={accentStyle.text}
              style={color ? { color } : undefined}
            />
          )}
        </div>
      ) : (
        IconComponent && (
          <IconComponent
            size={px}
            style={color ? { color } : undefined}
            className={accentStyle.text}
          />
        )
      )}
    </div>
  );
};
