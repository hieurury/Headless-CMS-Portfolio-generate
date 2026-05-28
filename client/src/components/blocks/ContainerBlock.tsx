import React from 'react';

interface ContainerBlockProps {
  style?: 'card' | 'glass' | 'outlined' | 'filled' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  background?: string;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children?: React.ReactNode;
  sectionId?: string;
  [key: string]: unknown;
}

const STYLE_MAP: Record<string, string> = {
  card: 'bg-white/5 border border-white/10',
  glass: 'glass',
  outlined: 'border border-white/20',
  filled: 'bg-white/8',
  none: '',
};

const PADDING_MAP: Record<string, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-12',
};

const MAX_WIDTH_MAP: Record<string, string> = {
  none: 'max-w-none',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

const RADIUS_MAP: Record<string, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
};

export const ContainerBlock: React.FC<ContainerBlockProps> = ({
  style = 'card',
  padding = 'md',
  maxWidth = 'none',
  background,
  borderRadius = 'xl',
  children,
  sectionId,
}) => {
  const styleClass = STYLE_MAP[style] ?? STYLE_MAP.card;
  const paddingClass = PADDING_MAP[padding] ?? 'p-6';
  const maxWidthClass = MAX_WIDTH_MAP[maxWidth] ?? 'max-w-none';
  const radiusClass = RADIUS_MAP[borderRadius] ?? 'rounded-xl';

  return (
    <div className="w-full py-2" id={sectionId}>
      <div
        className={`w-full ${maxWidthClass} ${styleClass} ${paddingClass} ${radiusClass} transition-all`}
        style={background ? { background } : undefined}
      >
        {children ?? (
          <div className="text-slate-600 text-sm text-center py-4 border border-dashed border-white/10 rounded-lg">
            Container — add blocks inside via the editor
          </div>
        )}
      </div>
    </div>
  );
};
