import React from 'react';

export interface FlexBlockProps {
  direction?: 'row' | 'column';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  children?: React.ReactNode;
  textColor?: string;
  backgroundColor?: string;
  margin?: string;
  padding?: string;
  sectionId?: string;
  [key: string]: unknown;
}

const GAP_MAP: Record<string, string> = {
  none: '0',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
};

const JUSTIFY_MAP: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

const ALIGN_MAP: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

/**
 * FlexBlock — a flexible container where child blocks auto-size to their content.
 *
 * Unlike Columns (fixed grid cells) or Rows (fixed grid rows), Flex lets children
 * flow naturally in a row or column direction with optional wrapping.
 * Perfect for button groups, icon rows, navigation links, tags, etc.
 */
export const FlexBlock: React.FC<FlexBlockProps> = ({
  direction = 'row',
  gap = 'md',
  justify = 'start',
  align = 'center',
  wrap = 'wrap',
  textColor,
  backgroundColor,
  margin,
  padding,
  children,
  sectionId,
}) => {
  return (
    <div
      id={sectionId}
      style={{
        display: 'flex',
        flexDirection: direction,
        gap: GAP_MAP[gap] || '0',
        justifyContent: JUSTIFY_MAP[justify] || 'flex-start',
        alignItems: ALIGN_MAP[align] || 'center',
        flexWrap: wrap as React.CSSProperties['flexWrap'],
        width: '100%',
        backgroundColor,
        color: textColor,
        margin: margin || undefined,
        padding: padding || undefined,
      }}
    >
      {children}
    </div>
  );
};
