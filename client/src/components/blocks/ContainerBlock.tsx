import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type AlignX = 'left' | 'center' | 'right';
type AlignY = 'top' | 'middle' | 'bottom';

type StyleValue    = 'none' | 'card' | 'glass' | 'outlined' | 'filled';
type PaddingValue  = 'none' | 'sm' | 'md' | 'lg' | 'xl';
type RadiusValue   = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ContainerBlockProps {
  /** Visual style of the container box */
  style?: StyleValue;
  /** Inner padding */
  padding?: PaddingValue;
  /** Border radius */
  borderRadius?: RadiusValue;
  /** Custom background colour / gradient */
  background?: string;
  /**
   * Horizontal position of the child — left | center | right.
   * Replaces the old combined `align` prop.
   */
  alignX?: AlignX;
  /**
   * Vertical position of the child — top | middle | bottom.
   */
  alignY?: AlignY;
  textColor?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
  sectionId?: string;
  [key: string]: unknown;
}

// ─── Style Maps ───────────────────────────────────────────────────────────────

const STYLE_MAP: Record<StyleValue, string> = {
  none:     '',
  card:     'bg-white/5 border border-white/10',
  glass:    'glass',
  outlined: 'border border-white/20',
  filled:   'bg-white/8',
};

const PADDING_MAP: Record<PaddingValue, string> = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
  xl:   'p-12',
};

const RADIUS_MAP: Record<RadiusValue, string> = {
  none: '',
  sm:   'rounded-sm',
  md:   'rounded-md',
  lg:   'rounded-lg',
  xl:   'rounded-xl',
  '2xl':'rounded-2xl',
};

/** X-axis → flexbox justifyContent */
const JUSTIFY_MAP: Record<AlignX, string> = {
  left:   'flex-start',
  center: 'center',
  right:  'flex-end',
};

/** Y-axis → flexbox alignItems */
const ALIGN_ITEMS_MAP: Record<AlignY, string> = {
  top:    'flex-start',
  middle: 'center',
  bottom: 'flex-end',
};



/**
 * ContainerBlock — a full-size position wrapper.
 *
 * It fills the complete width and height of its parent cell and positions its
 * single child using two independent axes:
 *   - `alignX`: horizontal (left / center / right)
 *   - `alignY`: vertical   (top  / middle / bottom)
 */
export const ContainerBlock: React.FC<ContainerBlockProps> = ({
  style      = 'none',
  padding    = 'none',
  borderRadius = 'none',
  background,
  alignX,
  alignY,
  textColor,
  backgroundColor,
  children,
  sectionId,
}) => {
  // Resolve x/y
  const resolvedX: AlignX = alignX ?? 'center';
  const resolvedY: AlignY = alignY ?? 'middle';

  const styleClass     = STYLE_MAP[style]            ?? '';
  const paddingClass   = PADDING_MAP[padding]        ?? '';
  const radiusClass    = RADIUS_MAP[borderRadius]    ?? '';

  return (
    <div
      id={sectionId}
      className={`w-full h-full ${styleClass} ${paddingClass} ${radiusClass} transition-all`}
      style={{
        display:        'flex',
        justifyContent: JUSTIFY_MAP[resolvedX]     ?? 'center',
        alignItems:     ALIGN_ITEMS_MAP[resolvedY] ?? 'center',
        ...(backgroundColor ? { backgroundColor } : background ? { background } : {}),
        color: textColor,
      }}
    >
      {children}
    </div>
  );
};
