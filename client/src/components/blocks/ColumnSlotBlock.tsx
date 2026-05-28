import React from 'react';

interface ColumnSlotBlockProps {
  children?: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  gap?: 'none' | 'sm' | 'md' | 'lg';
  sectionId?: string;
  [key: string]: unknown;
}

/**
 * ColumnSlotBlock — internal vertical-stack slot inside a ColumnsBlock.
 *
 * Each slot occupies exactly one grid cell (1fr) from the parent Columns grid.
 * Children are stacked vertically from top to bottom.
 * min-width: 0 is critical to prevent grid blowout.
 */
export const ColumnSlotBlock: React.FC<ColumnSlotBlockProps> = ({
  children,
  align = 'start',
  gap = 'md',
  sectionId,
}) => {
  const gapMap: Record<string, string> = {
    none: '0px',
    sm: '8px',
    md: '16px',
    lg: '24px',
  };

  const alignMap: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
  };

  return (
    <div
      id={sectionId}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: gapMap[gap] ?? '16px',
        alignItems: alignMap[align] ?? 'flex-start',
        width: '100%',
        minWidth: 0,        // prevents grid cell blowout
        minHeight: '40px',
      }}
    >
      {children}
    </div>
  );
};
