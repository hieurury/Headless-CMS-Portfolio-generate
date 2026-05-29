import React from 'react';

interface SplitBlockProps {
  /** Left column width as percentage: 50, 40, 33, 60, 67 */
  leftWidth?: '33' | '40' | '50' | '60' | '67';
  /** Vertical alignment of both columns */
  verticalAlign?: 'start' | 'center' | 'end';
  /** Gap between columns */
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  /** Reverse column order */
  reverse?: boolean;
  children?: React.ReactNode;
  sectionId?: string;
  [key: string]: unknown;
}

const GAP_MAP: Record<string, string> = {
  sm: '24px',
  md: '40px',
  lg: '64px',
  xl: '96px',
};

const VALIGN_MAP: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
};

/**
 * SplitBlock — A 2-column layout container.
 *
 * Uses CSS grid with INLINE STYLES (not Tailwind responsive classes) so it
 * always renders correctly inside the editor's constrained preview area.
 * Tailwind md: breakpoints don't activate in the editor canvas since it's
 * not a real viewport resize.
 *
 * Children should be exactly 2 _column slot blocks.
 */
export const SplitBlock: React.FC<SplitBlockProps> = ({
  leftWidth = '50',
  verticalAlign = 'center',
  gap = 'lg',
  reverse = false,
  children,
  sectionId,
}) => {
  // Width mapping for CSS grid template columns
  const gridTemplate: Record<string, string> = {
    '33': '1fr 2fr',
    '40': '2fr 3fr',
    '50': '1fr 1fr',
    '60': '3fr 2fr',
    '67': '2fr 1fr',
  };
  const template = gridTemplate[leftWidth] ?? '1fr 1fr';

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: template,   // ALWAYS use grid — no md: breakpoint
    gap: GAP_MAP[gap] ?? GAP_MAP.lg,
    alignItems: VALIGN_MAP[verticalAlign] ?? 'center',
    width: '100%',
    direction: reverse ? 'rtl' : 'ltr',
  };

  return (
    <div id={sectionId} style={gridStyle}>
      {children ?? (
        <>
          <div style={{ direction: 'ltr' }} className="min-h-[100px] border border-dashed border-white/10 rounded-xl p-6 text-center text-slate-600 text-sm flex items-center justify-center">
            Left column
          </div>
          <div style={{ direction: 'ltr' }} className="min-h-[100px] border border-dashed border-white/10 rounded-xl p-6 text-center text-slate-600 text-sm flex items-center justify-center">
            Right column
          </div>
        </>
      )}
    </div>
  );
};
