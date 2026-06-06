import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type AlignValue =
  | 'top-left'    | 'top-center'    | 'top-right'
  | 'middle-left' | 'center'        | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

type StyleValue    = 'none' | 'card' | 'glass' | 'outlined' | 'filled';
type PaddingValue  = 'none' | 'sm' | 'md' | 'lg' | 'xl';
type RadiusValue   = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type MinHeightValue= 'none' | 'sm' | 'md' | 'lg' | 'xl';

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
   * 9-position alignment for the child block.
   *
   * The container is a flex box occupying the full width (and optionally height)
   * of its parent cell. The child is placed at the specified position within that box.
   *
   *  top-left  | top-center  | top-right
   *  mid-left  | center      | mid-right
   *  bot-left  | bot-center  | bot-right
   */
  align?: AlignValue;
  /**
   * Minimum height of the container.
   * Useful when the container is not inside a cell with an intrinsic height.
   */
  minHeight?: MinHeightValue;
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

const MIN_HEIGHT_MAP: Record<MinHeightValue, string> = {
  none: '',
  sm:   'min-h-[80px]',
  md:   'min-h-[160px]',
  lg:   'min-h-[280px]',
  xl:   'min-h-[420px]',
};

/**
 * Map an AlignValue to flex `justifyContent` + `alignItems`.
 *
 * Container uses `display: flex`. Within the row direction:
 *   - justifyContent controls horizontal position (main axis)
 *   - alignItems controls vertical position (cross axis)
 */
const ALIGN_FLEX: Record<AlignValue, { justifyContent: string; alignItems: string }> = {
  'top-left':      { justifyContent: 'flex-start', alignItems: 'flex-start' },
  'top-center':    { justifyContent: 'center',     alignItems: 'flex-start' },
  'top-right':     { justifyContent: 'flex-end',   alignItems: 'flex-start' },
  'middle-left':   { justifyContent: 'flex-start', alignItems: 'center'     },
  'center':        { justifyContent: 'center',     alignItems: 'center'     },
  'middle-right':  { justifyContent: 'flex-end',   alignItems: 'center'     },
  'bottom-left':   { justifyContent: 'flex-start', alignItems: 'flex-end'   },
  'bottom-center': { justifyContent: 'center',     alignItems: 'flex-end'   },
  'bottom-right':  { justifyContent: 'flex-end',   alignItems: 'flex-end'   },
};

// ─── ContainerBlock ───────────────────────────────────────────────────────────

/**
 * ContainerBlock — a full-width position wrapper.
 *
 * It fills the complete width of its parent cell and positions its single child
 * at one of 9 fixed locations using flexbox. This is the primary building block
 * for precise spatial positioning inside a Columns grid or any other layout.
 *
 * Typical use-cases:
 *   • Centering an icon or badge inside a grid cell
 *   • Pinning a button to the bottom-right of a card
 *   • Positioning a heading at the top-left of a section
 *
 * Style props (style, padding, borderRadius, background) control the visual box
 * itself — the same as before. The new `align` prop controls where inside the
 * box the child sits.
 */
export const ContainerBlock: React.FC<ContainerBlockProps> = ({
  style      = 'none',
  padding    = 'none',
  borderRadius = 'none',
  background,
  align      = 'center',
  minHeight  = 'none',
  children,
  sectionId,
}) => {
  const styleClass     = STYLE_MAP[style]      ?? '';
  const paddingClass   = PADDING_MAP[padding]  ?? '';
  const radiusClass    = RADIUS_MAP[borderRadius] ?? '';
  const minHeightClass = MIN_HEIGHT_MAP[minHeight] ?? '';
  const flexAlign      = ALIGN_FLEX[align]     ?? ALIGN_FLEX['center'];

  return (
    <div
      id={sectionId}
      className={`w-full h-full ${styleClass} ${paddingClass} ${radiusClass} ${minHeightClass} transition-all`}
      style={{
        display: 'flex',
        justifyContent: flexAlign.justifyContent,
        alignItems: flexAlign.alignItems,
        ...(background ? { background } : {}),
      }}
    >
      {children}
    </div>
  );
};
