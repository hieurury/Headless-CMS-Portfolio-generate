import React from 'react';

interface SplitBlockProps {
  /** Left column width as percentage: 50, 40, 33, 60, 67 */
  leftWidth?: '33' | '40' | '50' | '60' | '67';
  /** Vertical alignment of both columns */
  verticalAlign?: 'start' | 'center' | 'end';
  /** Gap between columns */
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  /** Reverse column order on desktop */
  reverse?: boolean;
  /** Stack threshold — stacks vertically on mobile always */
  children?: React.ReactNode;
  sectionId?: string;
  [key: string]: unknown;
}

const GAP_MAP: Record<string, string> = {
  sm: 'gap-6',
  md: 'gap-10',
  lg: 'gap-16',
  xl: 'gap-24',
};

const VALIGN_MAP: Record<string, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
};

/**
 * SplitBlock — A 2-column layout container.
 * Left and right columns each accept child blocks.
 * isContainer: true, passChildrenDirect: true
 *
 * Children should be exactly 2 _column slot blocks.
 * The left column width is controlled by leftWidth prop.
 */
export const SplitBlock: React.FC<SplitBlockProps> = ({
  leftWidth = '50',
  verticalAlign = 'center',
  gap = 'lg',
  reverse = false,
  children,
  sectionId,
}) => {
  const gapClass = GAP_MAP[gap] ?? GAP_MAP.lg;
  const valignClass = VALIGN_MAP[verticalAlign] ?? VALIGN_MAP.center;

  // Width mapping for CSS grid template columns
  const gridTemplate: Record<string, string> = {
    '33': '1fr 2fr',
    '40': '2fr 3fr',
    '50': '1fr 1fr',
    '60': '3fr 2fr',
    '67': '2fr 1fr',
  };
  const template = gridTemplate[leftWidth] ?? '1fr 1fr';

  return (
    <div
      id={sectionId}
      className={`w-full grid grid-cols-1 md:grid-cols-[var(--split-template)] ${gapClass} ${valignClass} ${reverse ? 'md:[direction:rtl] *:[direction:ltr]' : ''}`}
      style={{ '--split-template': template } as React.CSSProperties}
    >
      {children ?? (
        <>
          <div className="min-h-[100px] border border-dashed border-white/10 rounded-xl p-6 text-center text-slate-600 text-sm flex items-center justify-center">
            Left column
          </div>
          <div className="min-h-[100px] border border-dashed border-white/10 rounded-xl p-6 text-center text-slate-600 text-sm flex items-center justify-center">
            Right column
          </div>
        </>
      )}
    </div>
  );
};
