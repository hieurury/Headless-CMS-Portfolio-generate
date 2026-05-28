import React from 'react';

interface HeadingBlockProps {
  text?: string;
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  align?: 'left' | 'center' | 'right';
  color?: string;
  gradient?: boolean;
  sectionId?: string;
  [key: string]: unknown;
}

const SIZE_MAP: Record<string, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl md:text-5xl',
  '5xl': 'text-5xl md:text-7xl',
};

const ALIGN_MAP: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export const HeadingBlock: React.FC<HeadingBlockProps> = ({
  text = 'Your Heading Here',
  level = 'h2',
  size = 'xl',
  align = 'left',
  color,
  gradient = false,
  sectionId,
}) => {
  const Tag = level as React.ElementType;
  const sizeClass = SIZE_MAP[size] ?? 'text-xl';
  const alignClass = ALIGN_MAP[align] ?? 'text-left';

  const textClass = gradient
    ? 'gradient-text'
    : color
    ? ''
    : 'text-white';

  return (
    <div className={`w-full py-2 ${alignClass}`} id={sectionId}>
      <Tag
        className={`font-bold leading-tight ${sizeClass} ${textClass}`}
        style={color && !gradient ? { color } : undefined}
      >
        {text}
      </Tag>
    </div>
  );
};
