import React from 'react';

interface SpacerBlockProps {
  height?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  sectionId?: string;
  [key: string]: unknown;
}

const HEIGHT_MAP: Record<string, string> = {
  xs: 'h-4',
  sm: 'h-8',
  md: 'h-16',
  lg: 'h-24',
  xl: 'h-32',
  '2xl': 'h-48',
};

export const SpacerBlock: React.FC<SpacerBlockProps> = ({
  height = 'md',
  sectionId,
}) => {
  const heightClass = HEIGHT_MAP[height] ?? 'h-16';

  return (
    <div
      className={`w-full ${heightClass} select-none`}
      id={sectionId}
      aria-hidden="true"
    />
  );
};
