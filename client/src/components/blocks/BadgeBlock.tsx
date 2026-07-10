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
  size?: 'sm' | 'md' | 'lg';
  shape?: 'square' | 'rounded';
  alignX?: AlignX;
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

const SIZE_MAP: Record<string, string> = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-1',
  lg: 'text-sm px-2.5 py-1.5',
};

const SHAPE_MAP: Record<string, string> = {
  square:  'rounded-none',
  rounded: 'rounded-sm',
};

const VARIANT_MAP: Record<string, string> = {
  solid:  'bg-[var(--color-text)] text-[var(--color-bg)] border border-[var(--color-text)]',
  subtle: 'bg-[var(--color-text)]/10 text-[var(--color-text)] border border-[var(--color-border)]',
  outline: 'bg-transparent text-[var(--color-text)] border border-[var(--color-border-strong)]',
};

export const BadgeBlock: React.FC<BadgeBlockProps> = ({
  text      = 'Badge',
  variant   = 'subtle',
  size      = 'sm',
  shape     = 'rounded',
  alignX    = 'left',
  alignY    = 'middle',
  textColor,
  backgroundColor,
  sectionId,
  margin,
  padding,
}) => {
  const sizeClass  = SIZE_MAP[size] ?? SIZE_MAP.sm;
  const shapeClass = SHAPE_MAP[shape] ?? SHAPE_MAP.rounded;
  const colorClass = VARIANT_MAP[variant] ?? VARIANT_MAP.subtle;

  return (
    <div
      id={sectionId}
      style={{
        width:          '100%',
        height:         '100%',
        display:        'flex',
        justifyContent: JUSTIFY_MAP[alignX]     ?? 'flex-start',
        alignItems:     ALIGN_ITEMS_MAP[alignY] ?? 'center',
        margin: margin || undefined,
        padding: padding || undefined,
      }}
    >
      <div className="py-1">
        <span
          data-cms-field="text"
          className={`inline-block font-medium cursor-text transition-colors tracking-wide ${sizeClass} ${shapeClass} ${colorClass}`}
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
