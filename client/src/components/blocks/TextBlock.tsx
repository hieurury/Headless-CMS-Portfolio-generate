import React from 'react';

interface TextBlockProps {
  content?: string;
  size?: 'sm' | 'base' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right';
  color?: string;
  muted?: boolean;
  sectionId?: string;
  [key: string]: unknown;
}

const SIZE_MAP: Record<string, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const ALIGN_MAP: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export const TextBlock: React.FC<TextBlockProps> = ({
  content = 'Write your paragraph text here.',
  size = 'base',
  align = 'left',
  color,
  muted = false,
  sectionId,
}) => {
  const sizeClass = SIZE_MAP[size] ?? 'text-base';
  const alignClass = ALIGN_MAP[align] ?? 'text-left';
  const colorClass = color ? '' : muted ? 'text-slate-400' : 'text-slate-200';

  return (
    <div className={`w-full py-1 ${alignClass}`} id={sectionId}>
      <p
        className={`${sizeClass} ${colorClass} leading-relaxed whitespace-pre-line`}
        style={color ? { color } : undefined}
      >
        {content}
      </p>
    </div>
  );
};
