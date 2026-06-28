import React from 'react';
import * as LucideIcons from 'lucide-react';

// ─── Shared position maps ─────────────────────────────────────────────────────
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

// ─── Props ────────────────────────────────────────────────────────────────────
interface IconBlockProps {
  /** Name of the Lucide icon, e.g. "Star", "Zap", "Code2" */
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: string;
  /** Background shape behind the icon */
  shape?: 'none' | 'circle' | 'square' | 'rounded';
  /** Accent palette for background + icon tint */
  accent?: 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose' | 'sky' | 'slate' | 'custom';

  /** Horizontal position within the cell */
  alignX?: AlignX;
  /** Vertical position within the cell */
  alignY?: AlignY;
  textColor?: string;
  backgroundColor?: string;
  sectionId?: string;
  /** CSS shorthand, e.g. "8px 16px" */
  margin?: string;
  /** CSS shorthand, e.g. "8px 16px" */
  padding?: string;
  [key: string]: unknown;
}

// ─── Style Maps ───────────────────────────────────────────────────────────────
const ICON_PX: Record<string, number> = {
  xs: 14, sm: 18, md: 24, lg: 32, xl: 40, '2xl': 56,
};

const WRAPPER_SIZE: Record<string, string> = {
  xs: 'w-7 h-7', sm: 'w-9 h-9', md: 'w-12 h-12',
  lg: 'w-16 h-16', xl: 'w-20 h-20', '2xl': 'w-28 h-28',
};

const ACCENT_STYLES: Record<string, { bg: string; text: string }> = {
  indigo:  { bg: 'bg-indigo-500/15 border border-indigo-500/25',   text: 'text-indigo-400' },
  violet:  { bg: 'bg-violet-500/15 border border-violet-500/25',   text: 'text-violet-400' },
  emerald: { bg: 'bg-emerald-500/15 border border-emerald-500/25', text: 'text-emerald-400' },
  amber:   { bg: 'bg-amber-500/15 border border-amber-500/25',     text: 'text-amber-400' },
  rose:    { bg: 'bg-rose-500/15 border border-rose-500/25',       text: 'text-rose-400' },
  sky:     { bg: 'bg-sky-500/15 border border-sky-500/25',         text: 'text-sky-400' },
  slate:   { bg: 'bg-white/5 border border-white/10',              text: 'text-slate-400' },
  custom:  { bg: '',                                                text: '' },
};

const SHAPE_RADIUS: Record<string, string> = {
  none: '', circle: 'rounded-full', square: 'rounded-none', rounded: 'rounded-xl',
};

export const IconBlock: React.FC<IconBlockProps> = ({
  name    = 'Sparkles',
  size    = 'md',
  color,
  shape   = 'rounded',
  accent  = 'indigo',
  alignX  = 'left',
  alignY  = 'middle',
  textColor,
  backgroundColor,
  sectionId,
  margin,
  padding,
}) => {


  const iconKey = Object.keys(LucideIcons).find(
    (k) => k.toLowerCase() === (name ?? 'sparkles').toLowerCase(),
  ) ?? 'Sparkles';

  const IconComponent = (LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
  >)[iconKey];

  const px           = ICON_PX[size]          ?? 24;
  const wrapperSize  = WRAPPER_SIZE[size]     ?? WRAPPER_SIZE.md;
  const accentStyle  = ACCENT_STYLES[accent]  ?? ACCENT_STYLES.indigo;
  const shapeClass   = SHAPE_RADIUS[shape]    ?? SHAPE_RADIUS.rounded;
  const hasBackground = shape !== 'none';

  return (
    <div
      id={sectionId}
      style={{
        width:          '100%',
        height:         '100%',
        display:        'flex',
        justifyContent: JUSTIFY_MAP[alignX]  ?? 'flex-start',
        alignItems:     ALIGN_ITEMS_MAP[alignY] ?? 'center',
        margin: margin || undefined,
        padding: padding || undefined,
      }}
    >
      {hasBackground ? (
        <div
          className={`flex items-center justify-center shrink-0 ${wrapperSize} ${accentStyle.bg} ${shapeClass}`}
          style={backgroundColor ? { backgroundColor, borderColor: backgroundColor } : undefined}
        >
          {IconComponent && (
            <IconComponent
              size={px}
              className={accentStyle.text}
              style={(textColor || color) ? { color: textColor || color } : undefined}
            />
          )}
        </div>
      ) : (
        IconComponent && (
          <IconComponent
            size={px}
            style={(textColor || color) ? { color: textColor || color } : undefined}
            className={accentStyle.text}
          />
        )
      )}
    </div>
  );
};
