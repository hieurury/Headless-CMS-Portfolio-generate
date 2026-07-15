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
export interface IconBlockProps {
  /** Name of the Lucide icon, e.g. "Star", "Zap", "Code2" */
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: string;
  /** Background shape behind the icon */
  shape?: 'none' | 'square' | 'rounded';

  alignX?: AlignX;
  alignY?: AlignY;
  textColor?: string;
  backgroundColor?: string;
  sectionId?: string;
  margin?: string;
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

const SHAPE_RADIUS: Record<string, string> = {
  none: '', square: 'rounded-none', rounded: 'rounded-sm',
};

export const IconBlock: React.FC<IconBlockProps> = ({
  name    = 'Sparkles',
  size    = 'md',
  color,
  shape   = 'rounded',
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
          className={`flex items-center justify-center shrink-0 ${wrapperSize} bg-[var(--color-surface)] border border-[var(--color-border)] ${shapeClass}`}
          style={backgroundColor ? { backgroundColor, borderColor: backgroundColor } : undefined}
        >
          {IconComponent && (
            <IconComponent
              size={px}
              className="text-[var(--color-text)]"
              style={(textColor || color) ? { color: textColor || color } : undefined}
            />
          )}
        </div>
      ) : (
        IconComponent && (
          <IconComponent
            size={px}
            style={(textColor || color) ? { color: textColor || color } : undefined}
            className="text-[var(--color-text)]"
          />
        )
      )}
    </div>
  );
};
