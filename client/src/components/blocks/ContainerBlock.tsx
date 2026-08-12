import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type AlignX = 'left' | 'center' | 'right';
type AlignY = 'top' | 'middle' | 'bottom';

type StyleValue    = 'none' | 'card' | 'glass' | 'glass-subtle' | 'glass-strong' | 'outlined' | 'outlined-subtle' | 'filled';
type RadiusValue   = 'none' | 'sm' | 'md' | 'lg' | 'full';
type MaxWidthValue = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface ContainerBlockProps {
  style?: StyleValue;
  padding?: string;
  margin?: string;
  borderRadius?: RadiusValue;
  background?: string;
  alignX?: AlignX;
  alignY?: AlignY;
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
  card:     'bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm',
  glass:    'bg-[var(--color-surface)]/80 backdrop-blur-md border border-[var(--color-border)]',
  'glass-subtle': 'bg-[var(--color-surface)]/40 backdrop-blur-sm border border-[var(--color-border)]/50',
  'glass-strong': 'bg-[var(--color-surface)]/95 backdrop-blur-xl border border-[var(--color-border)] shadow-xl',
  outlined: 'border border-[var(--color-border-strong)]',
  'outlined-subtle': 'border border-[var(--color-border)]/50',
  filled:   'bg-[var(--color-surface-2)]',
};

const RADIUS_MAP: Record<RadiusValue, string> = {
  none: '',
  sm:   'rounded-sm',
  md:   'rounded-md',
  lg:   'rounded-lg',
  full: 'rounded-full',
};

const MAX_WIDTH_MAP: Record<MaxWidthValue, string> = {
  none: '',
  sm:   'max-w-screen-sm',
  md:   'max-w-screen-md',
  lg:   'max-w-screen-lg',
  xl:   'max-w-screen-xl',
  '2xl':'max-w-screen-2xl',
  full: 'max-w-full',
};

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
      <div className={`w-full h-full flex flex-col ${maxWidthClass} transition-all`}>
        {children}
      </div>
    </div>
  );
};
