import React from 'react';

interface ImageBlockProps {
  src?: string;
  alt?: string;
  caption?: string;
  width?: string;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  align?: 'left' | 'center' | 'right';
  sectionId?: string;
  [key: string]: unknown;
}

const RADIUS_MAP: Record<string, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

const ALIGN_MAP: Record<string, string> = {
  left: 'items-start',
  center: 'items-center',
  right: 'items-end',
};

export const ImageBlock: React.FC<ImageBlockProps> = ({
  src,
  alt = 'Image',
  caption,
  width = '100%',
  borderRadius = 'lg',
  align = 'center',
  sectionId,
}) => {
  const radiusClass = RADIUS_MAP[borderRadius] ?? 'rounded-lg';
  const alignClass = ALIGN_MAP[align] ?? 'items-center';

  if (!src) {
    return (
      <div
        className={`w-full py-2 flex flex-col ${alignClass}`}
        id={sectionId}
      >
      <div
          data-cms-field="src"
          className={`flex items-center justify-center bg-white/5 border border-dashed border-white/10 text-slate-500 text-sm ${radiusClass} cursor-pointer hover:bg-white/8 hover:border-indigo-500/30 transition-all`}
          style={{ width, minHeight: '120px' }}
        >
          📷 No image URL set
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full py-2 flex flex-col ${alignClass}`} id={sectionId}>
      <figure style={{ width }} className="flex flex-col gap-2">
        <img
          data-cms-field="src"
          src={src}
          alt={alt}
          className={`w-full object-cover ${radiusClass} cursor-pointer`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="%23374151"/><text x="12" y="16" text-anchor="middle" fill="%236B7280" font-size="8">IMG</text></svg>';
          }}
        />
        {caption && (
          <figcaption className="text-xs text-slate-500 text-center">{caption}</figcaption>
        )}
      </figure>
    </div>
  );
};
