import React from 'react';

type AlignX = 'left' | 'center' | 'right';
type AlignY = 'top'  | 'middle' | 'bottom';

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

export interface DescriptionBlockProps {
  text?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  textAlign?: 'left' | 'center' | 'right';
  alignX?: AlignX;
  alignY?: AlignY;
  textColor?: string;
  backgroundColor?: string;
  color?: string;
  sectionId?: string;
  /** CSS shorthand string, e.g. "8px 16px" */
  margin?: string;
  /** CSS shorthand string, e.g. "8px 16px" */
  padding?: string;
  [key: string]: unknown;
}

const SIZE_MAP: Record<string, string> = {
  xs:   'text-xs',
  sm:   'text-sm',
  base: 'text-base',
  lg:   'text-lg',
  xl:   'text-xl',
};

const TEXT_ALIGN_MAP: Record<string, string> = {
  left:   'text-left',
  center: 'text-center',
  right:  'text-right',
};

export const DescriptionBlock: React.FC<DescriptionBlockProps> = ({
  text      = 'Enter your description here. This block is perfect for paragraphs and longer text.',
  size      = 'base',
  textAlign = 'left',
  alignX    = 'left',
  alignY    = 'middle',
  textColor,
  backgroundColor,
  color,
  sectionId,
  margin,
  padding,
}) => {
  const sizeClass  = SIZE_MAP[size]           ?? 'text-base';
  const textAlignClass = TEXT_ALIGN_MAP[textAlign] ?? 'text-left';

  return (
    <div
      id={sectionId}
      style={{
        width:          '100%',
        height:         '100%',
        display:        'flex',
        justifyContent: JUSTIFY_MAP[alignX]     ?? 'flex-start',
        alignItems:     ALIGN_ITEMS_MAP[alignY] ?? 'center',
        backgroundColor: backgroundColor,
      }}
    >
      <div
        className={`w-full ${textAlignClass}`}
        style={{
          margin: margin || undefined,
          padding: padding || undefined,
        }}
      >
        <p
          data-cms-field="text"
          className={`leading-relaxed ${sizeClass} cursor-text`}
          style={textColor ? { color: textColor } : color ? { color } : { color: 'var(--cms-desc-color, #94a3b8)' }}
        >
          {text}
        </p>
      </div>
    </div>
  );
};
