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
const MARGIN_TOP_MAP: Record<string, string> = {
  none: '', sm: 'mt-2', md: 'mt-4', lg: 'mt-8', xl: 'mt-12', '2xl': 'mt-16',
};
const MARGIN_BOTTOM_MAP: Record<string, string> = {
  none: '', sm: 'mb-2', md: 'mb-4', lg: 'mb-8', xl: 'mb-12', '2xl': 'mb-16',
};
const PADDING_TOP_MAP: Record<string, string> = {
  none: '', sm: 'pt-2', md: 'pt-4', lg: 'pt-8', xl: 'pt-12', '2xl': 'pt-16',
};
const PADDING_BOTTOM_MAP: Record<string, string> = {
  none: '', sm: 'pb-2', md: 'pb-4', lg: 'pb-8', xl: 'pb-12', '2xl': 'pb-16',
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
  sectionId?: string;
  marginTop?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  paddingTop?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  paddingBottom?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
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
  sectionId,
  marginTop,
  marginBottom,
  paddingTop,
  paddingBottom,
}) => {
  const safeLevel = String(level).startsWith('h') ? String(level).toLowerCase() : `h${level}`;
  const validLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const Tag = (validLevels.includes(safeLevel) ? safeLevel : 'h2') as React.ElementType;
  const sizeClass = SIZE_MAP[size] ?? 'text-xl';
  const textAlignClass = TEXT_ALIGN_MAP[textAlign] ?? 'text-left';
  const textClass = gradient ? 'gradient-text' : '';

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
      <div className={`${MARGIN_TOP_MAP[marginTop || 'none']} ${MARGIN_BOTTOM_MAP[marginBottom || 'none']} ${PADDING_TOP_MAP[paddingTop || 'none']} ${PADDING_BOTTOM_MAP[paddingBottom || 'none']} ${textAlignClass}`}>
        <Tag
          data-cms-field="text"
          className={`font-bold leading-tight ${sizeClass} ${textClass} cursor-text`}
          style={(textColor || color) && !gradient ? { color: textColor || color } : undefined}
        >
          {text}
        </Tag>
      </div>
    </div>
  );
};
