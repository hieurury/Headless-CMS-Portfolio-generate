import React from 'react';

export interface ColumnsBlockProps {
  columns?: number | string;
  /** Optional per-column span weights. Length must equal columns count.
   *  e.g. [1, 2] → CSS `1fr 2fr` (second column is twice as wide as first).
   *  Falls back to equal widths if not provided or length mismatch. */
  colSpans?: number[];
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  alignX?: 'start' | 'center' | 'end' | 'stretch';
  alignY?: 'start' | 'center' | 'end' | 'stretch';
  children?: React.ReactNode;
  textColor?: string;
  backgroundColor?: string;
  sectionId?: string;
  [key: string]: unknown;
}

const ALIGN_MAP: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
};

/**
 * ColumnsBlock — N-column grid layout with optional non-uniform column widths.
 *
 * Gap between columns is always 0. Content spacing is the responsibility
 * of wrapper or child elements.
 *
 * If `colSpans` is provided and matches `columns` count, each entry defines
 * the relative width of that column in `fr` units.
 * e.g. colSpans=[1,2] with columns=2 → CSS `grid-template-columns: 1fr 2fr`
 */
export const ColumnsBlock: React.FC<ColumnsBlockProps> = ({
  columns = 2,
  colSpans,
  alignX = 'stretch',
  alignY = 'stretch',
  textColor,
  backgroundColor,
  children,
  sectionId,
}) => {
  const colCount = Number(columns) || 2;

  const spans = Array.isArray(colSpans) && colSpans.length === colCount && colSpans.every(s => s > 0)
    ? colSpans
    : null;

  const gridTemplate = spans
    ? spans.map(s => `${s}fr`).join(' ')
    : `repeat(${colCount}, minmax(0, 1fr))`;

  return (
    <div
      id={sectionId}
      style={{
        display: 'grid',
        gridTemplateColumns: gridTemplate,
        gap: 0,
        justifyItems: ALIGN_MAP[alignX as string] ?? 'stretch',
        alignItems: ALIGN_MAP[alignY as string] ?? 'stretch',
        width: '100%',
        backgroundColor: backgroundColor,
        color: textColor,
      }}
    >
      {children}
    </div>
  );
};
