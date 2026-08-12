import React from 'react';

// ─── Shared position maps ─────────────────────────────────────────────────────
type AlignX = 'left' | 'center' | 'right';
type AlignY = 'top' | 'middle' | 'bottom';

const JUSTIFY_MAP: Record<AlignX, string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};
const ALIGN_ITEMS_MAP: Record<AlignY, string> = {
  top: 'flex-start',
  middle: 'center',
  bottom: 'flex-end',
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface HeadingBlockProps {
  text?: string;
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  /** Text alignment within the heading element */
  textAlign?: 'left' | 'center' | 'right';
  /** Horizontal position of the block within its cell (left / center / right) */
  alignX?: AlignX;
  /** Vertical position of the block within its cell (top / middle / bottom) */
  alignY?: AlignY;
  textColor?: string;
  backgroundColor?: string;
  color?: string;
  gradient?: boolean;
  letterSpacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
  sectionId?: string;
  /** CSS shorthand string, e.g. "8px 16px" or "4px 8px 12px 0" */
  margin?: string;
  /** CSS shorthand string, e.g. "8px 16px" or "4px 8px 12px 0" */
  padding?: string;
  [key: string]: unknown;
}

const SIZE_MAP: Record<string, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl md:text-5xl',
  '5xl': 'text-5xl md:text-7xl',
};

const TEXT_ALIGN_MAP: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export const HeadingBlock: React.FC<HeadingBlockProps> = ({
  text = 'Your Heading Here',
  level = 'h2',
  size = 'xl',
  textAlign = 'left',
  alignX = 'left',
  alignY = 'middle',
  textColor,
  backgroundColor,
  color,
  gradient = false,
  letterSpacing = 'tight',
  sectionId,
  margin,
  padding,
}) => {
  const safeLevel = String(level).startsWith('h') ? String(level).toLowerCase() : `h${level}`;
  const validLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const Tag = (validLevels.includes(safeLevel) ? safeLevel : 'h2') as React.ElementType;
  const sizeClass = SIZE_MAP[size] ?? 'text-xl';
  const textAlignClass = TEXT_ALIGN_MAP[textAlign] ?? 'text-left';
  const textClass = gradient ? 'bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text)] via-[var(--color-text-muted)] to-[var(--color-text-faint)]' : '';
  const trackingClass = `tracking-${letterSpacing}`;

  return (
    <div
      id={sectionId}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: JUSTIFY_MAP[alignX] ?? 'flex-start',
        alignItems: ALIGN_ITEMS_MAP[alignY] ?? 'center',
        backgroundColor: backgroundColor,
      }}
    >
      <div
        className={textAlignClass}
        style={{
          margin: margin || undefined,
          padding: padding || undefined,
        }}
      >
        <Tag
          data-cms-field="text"
          className={`font-bold leading-tight ${sizeClass} ${trackingClass} ${textClass} cursor-text transition-all`}
          style={(textColor || color) && !gradient ? { color: textColor || color } : undefined}
        >
          {text}
        </Tag>
      </div>
    </div>
  );
};
