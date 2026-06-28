import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type AlignX = 'left' | 'center' | 'right';
type AlignY = 'top' | 'middle' | 'bottom';

type StyleValue    = 'none' | 'card' | 'glass' | 'outlined' | 'filled';
type RadiusValue   = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type MaxWidthValue = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface ContainerBlockProps {
  /** Visual style of the container box */
  style?: StyleValue;
  /** CSS shorthand, e.g. "8px 16px" — applied to the outer container */
  padding?: string;
  /** CSS shorthand, e.g. "8px 16px" — applied to the outer container */
  margin?: string;
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
  /**
   * Maximum width of the content area inside the container.
   * 'none' means no constraint (fills parent width).
   */
  maxWidth?: MaxWidthValue;
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

const RADIUS_MAP: Record<RadiusValue, string> = {
  none: '',
  sm:   'rounded-sm',
  md:   'rounded-md',
  lg:   'rounded-lg',
  xl:   'rounded-xl',
  '2xl':'rounded-2xl',
};

/** Content max-width — constrains the inner wrapper, not the container itself */
const MAX_WIDTH_MAP: Record<MaxWidthValue, string> = {
  none: '',
  sm:   'max-w-screen-sm',   // 640px
  md:   'max-w-screen-md',   // 768px
  lg:   'max-w-screen-lg',   // 1024px
  xl:   'max-w-screen-xl',   // 1280px
  '2xl':'max-w-screen-2xl', // 1536px
  full: 'max-w-full',
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
  padding,
  margin,
  borderRadius = 'none',
  background,
  alignX,
  alignY,
  maxWidth   = 'none',
  textColor,
  backgroundColor,
  children,
  sectionId,
}) => {
  // Resolve x/y
  const resolvedX: AlignX = alignX ?? 'center';
  const resolvedY: AlignY = alignY ?? 'middle';

  const styleClass     = STYLE_MAP[style]            ?? '';
  const radiusClass    = RADIUS_MAP[borderRadius]    ?? '';
  const maxWidthClass  = MAX_WIDTH_MAP[maxWidth]     ?? '';

  return (
    <div
      id={sectionId}
      className={`w-full h-full ${styleClass} ${radiusClass} transition-all`}
      style={{
        display:        'flex',
        justifyContent: JUSTIFY_MAP[resolvedX]     ?? 'center',
        alignItems:     ALIGN_ITEMS_MAP[resolvedY] ?? 'center',
        ...(backgroundColor ? { backgroundColor } : background ? { background } : {}),
        color: textColor,
        padding: padding || undefined,
        margin: margin || undefined,
      }}
    >
      {/* Inner wrapper constrains the content width */}
      <div className={`w-full ${maxWidthClass} transition-all`}>
        {children}
      </div>
    </div>
  );
};
