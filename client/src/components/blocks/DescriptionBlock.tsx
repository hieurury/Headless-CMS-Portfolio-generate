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
  align?: 'left' | 'center' | 'right';
  alignX?: AlignX;
  alignY?: AlignY;
  color?: string;
  sectionId?: string;
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
  align     = 'left',
  alignX    = 'left',
  alignY    = 'middle',
  color,
  sectionId,
}) => {
  const sizeClass  = SIZE_MAP[size]           ?? 'text-base';
  const textAlign  = TEXT_ALIGN_MAP[align]    ?? 'text-left';

  return (
    <div
      id={sectionId}
      style={{
        width:          '100%',
        height:         '100%',
        display:        'flex',
        justifyContent: JUSTIFY_MAP[alignX]     ?? 'flex-start',
        alignItems:     ALIGN_ITEMS_MAP[alignY] ?? 'center',
      }}
    >
      <div className={`py-1 w-full ${textAlign}`}>
        <p
          data-cms-field="text"
          className={`leading-relaxed ${sizeClass} cursor-text`}
          style={color ? { color } : { color: 'var(--cms-desc-color, #94a3b8)' }}
        >
          {text}
        </p>
      </div>
    </div>
  );
};
