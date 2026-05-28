import React from 'react';

interface DividerBlockProps {
  style?: 'solid' | 'dashed' | 'dotted' | 'gradient';
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  sectionId?: string;
  [key: string]: unknown;
}

const SPACING_MAP: Record<string, string> = {
  sm: 'my-4',
  md: 'my-8',
  lg: 'my-12',
  xl: 'my-16',
};

export const DividerBlock: React.FC<DividerBlockProps> = ({
  style = 'solid',
  spacing = 'md',
  color,
  sectionId,
}) => {
  const spacingClass = SPACING_MAP[spacing] ?? 'my-8';

  if (style === 'gradient') {
    return (
      <div className={`w-full ${spacingClass}`} id={sectionId}>
        <div
          className="h-px w-full"
          style={{
            background: color
              ? `linear-gradient(to right, transparent, ${color}, transparent)`
              : 'linear-gradient(to right, transparent, rgba(99,102,241,0.5), transparent)',
          }}
        />
      </div>
    );
  }

  const borderStyleMap: Record<string, React.CSSProperties['borderStyle']> = {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
  };

  return (
    <div className={`w-full ${spacingClass}`} id={sectionId}>
      <hr
        style={{
          borderStyle: borderStyleMap[style] ?? 'solid',
          borderColor: color ?? 'rgba(255,255,255,0.06)',
          borderTopWidth: '1px',
        }}
      />
    </div>
  );
};
