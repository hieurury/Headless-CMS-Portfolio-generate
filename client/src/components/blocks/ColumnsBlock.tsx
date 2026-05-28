import React from 'react';

type ColCount = 2 | 3 | 4 | '2' | '3' | '4';

interface ColumnsBlockProps {
  columns?: ColCount;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  children?: React.ReactNode;
  sectionId?: string;
  [key: string]: unknown;
}

/**
 * ColumnsBlock — splits its children into N equal-width columns.
 *
 * Uses CSS grid with explicit column count (no responsive breakpoints)
 * so it always renders correctly inside the editor's constrained preview area.
 *
 * Children are _column slot blocks, one per column.
 * The grid ensures each slot fills exactly 1/N of the parent width.
 */
export const ColumnsBlock: React.FC<ColumnsBlockProps> = ({
  columns = 2,
  gap = 'md',
  align = 'start',
  children,
  sectionId,
}) => {
  // Handle both number and string values (schema select returns strings)
  const colCount = Number(columns) || 2;

  const gapStyle: Record<string, string> = {
    none: '0px',
    sm: '12px',
    md: '24px',
    lg: '40px',
    xl: '64px',
  };

  const alignStyle: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
  };

  return (
    <div id={sectionId} className="w-full py-2">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
          gap: gapStyle[gap as string] ?? '24px',
          alignItems: alignStyle[align as string] ?? 'flex-start',
          width: '100%',
        }}
      >
        {children}
      </div>
    </div>
  );
};
