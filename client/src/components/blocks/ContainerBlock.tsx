import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type AlignX = 'left' | 'center' | 'right';
type AlignY = 'top' | 'middle' | 'bottom';

/** Legacy combined align value — still accepted for backwards compat */
type LegacyAlign =
  | 'top-left'    | 'top-center'    | 'top-right'
  | 'middle-left' | 'center'        | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

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
   * Replaces the old combined `align` prop.
   */
  alignY?: AlignY;
  /**
   * @deprecated Use alignX + alignY instead.
   * Legacy single-value align is still parsed for backwards compatibility.
   */
  align?: LegacyAlign;
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

// ─── Legacy → split helper ────────────────────────────────────────────────────
/**
 * Parse a legacy combined `align` value (e.g. "top-right", "middle-left",
 * "center") into separate { x, y } components.
 */
function parseLegacyAlign(legacy: string): { x: AlignX; y: AlignY } {
  const MAP: Record<string, { x: AlignX; y: AlignY }> = {
    'top-left':      { x: 'left',   y: 'top'    },
    'top-center':    { x: 'center', y: 'top'    },
    'top-right':     { x: 'right',  y: 'top'    },
    'middle-left':   { x: 'left',   y: 'middle' },
    'center':        { x: 'center', y: 'middle' },
    'middle-right':  { x: 'right',  y: 'middle' },
    'bottom-left':   { x: 'left',   y: 'bottom' },
    'bottom-center': { x: 'center', y: 'bottom' },
    'bottom-right':  { x: 'right',  y: 'bottom' },
  };
  return MAP[legacy] ?? { x: 'center', y: 'middle' };
}

// ─── ContainerBlock ───────────────────────────────────────────────────────────

/**
 * ContainerBlock — a full-size position wrapper.
 *
 * It fills the complete width and height of its parent cell and positions its
 * single child using two independent axes:
 *   - `alignX`: horizontal (left / center / right)
 *   - `alignY`: vertical   (top  / middle / bottom)
 *
 * Legacy `align` prop (e.g. "top-right") is still accepted and silently
 * converted to the equivalent `alignX` + `alignY` values.
 */
export const ContainerBlock: React.FC<ContainerBlockProps> = ({
  style      = 'none',
  padding    = 'none',
  borderRadius = 'none',
  background,
  alignX,
  alignY,
  align,       // legacy
  textColor,
  backgroundColor,
  children,
  sectionId,
}) => {
  // Resolve x/y — new props take priority; fall back to parsed legacy align
  let resolvedX: AlignX = alignX ?? 'center';
  let resolvedY: AlignY = alignY ?? 'middle';

  if (align && !alignX && !alignY) {
    const parsed = parseLegacyAlign(align);
    resolvedX = parsed.x;
    resolvedY = parsed.y;
  }

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
