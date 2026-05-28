import React from 'react';

interface RowBlockProps {
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  sectionId?: string;
  [key: string]: unknown;
}

/**
 * RowBlock — a vertical stack container (flex-col).
 *
 * "Row" in this system = a row of the page that grows downward.
 * Items are stacked one below another, each taking full width.
 * Use this to group blocks vertically without any side-by-side splitting.
 *
 * For side-by-side / horizontal splitting, use Columns.
 */
export const RowBlock: React.FC<RowBlockProps> = ({
  gap = 'md',
  align = 'stretch',
  padding = 'none',
  children,
  sectionId,
}) => {
  const gapMap: Record<string, string> = {
    none: '0px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '40px',
  };

  const alignMap: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
  };

  const paddingMap: Record<string, string> = {
    none: '0',
    sm: '12px',
    md: '20px',
    lg: '32px',
  };

  return (
    <div
      id={sectionId}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: gapMap[gap] ?? '16px',
        alignItems: alignMap[align] ?? 'stretch',
        padding: paddingMap[padding] ?? '0',
        width: '100%',
      }}
    >
      {children ?? (
        <span
          style={{
            fontSize: '12px',
            color: '#4b5563',
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: '6px',
            padding: '8px 12px',
            textAlign: 'center',
          }}
        >
          Drop blocks here
        </span>
      )}
    </div>
  );
};
