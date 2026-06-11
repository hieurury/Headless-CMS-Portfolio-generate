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

export interface ImageBlockProps {
  url?: string;
  alt?: string;
  aspectRatio?: 'auto' | '16/9' | '4/3' | '1/1' | '3/4';
  objectFit?: 'cover' | 'contain' | 'fill';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  alignX?: AlignX;
  alignY?: AlignY;
  sectionId?: string;
  [key: string]: unknown;
}

const ASPECT_RATIO_MAP: Record<string, string> = {
  auto:   'auto',
  '16/9': '16 / 9',
  '4/3':  '4 / 3',
  '1/1':  '1 / 1',
  '3/4':  '3 / 4',
};

const RADIUS_MAP: Record<string, string> = {
  none:  '',
  sm:    'rounded-sm',
  md:    'rounded-md',
  lg:    'rounded-lg',
  xl:    'rounded-xl',
  '2xl': 'rounded-2xl',
  full:  'rounded-full',
};

export const ImageBlock: React.FC<ImageBlockProps> = ({
  url          = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
  alt          = 'Image',
  aspectRatio  = 'auto',
  objectFit    = 'cover',
  borderRadius = 'md',
  alignX       = 'center',
  alignY       = 'middle',
  sectionId,
}) => {
  const radiusClass = RADIUS_MAP[borderRadius] ?? 'rounded-md';
  const ratioStyle  = ASPECT_RATIO_MAP[aspectRatio] ?? 'auto';

  return (
    <div
      id={sectionId}
      className="cms-block-wrapper"
      style={{
        width:          '100%',
        height:         '100%',
        display:        'flex',
        justifyContent: JUSTIFY_MAP[alignX]     ?? 'center',
        alignItems:     ALIGN_ITEMS_MAP[alignY] ?? 'center',
      }}
    >
      <div className="w-full flex" style={{ justifyContent: JUSTIFY_MAP[alignX] ?? 'center' }}>
        <img
          data-cms-field="url"
          src={url}
          alt={alt}
          className={`max-w-full ${radiusClass}`}
          style={{
            aspectRatio: ratioStyle !== 'auto' ? ratioStyle : undefined,
            objectFit,
            width: '100%',
            height: ratioStyle !== 'auto' ? '100%' : 'auto',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/1e1e2e/818cf8?text=Image+Not+Found';
          }}
        />
      </div>
    </div>
  );
};
