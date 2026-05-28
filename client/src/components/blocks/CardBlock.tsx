import React from 'react';

interface CardBlockProps {
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'glass' | 'outlined' | 'elevated' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  accentColor?: string;
  showHeader?: boolean;
  children?: React.ReactNode;
  sectionId?: string;
  [key: string]: unknown;
}

const VARIANT_MAP: Record<string, string> = {
  default: 'bg-white/5 border border-white/10',
  glass: 'glass',
  outlined: 'border-2 border-indigo-500/30',
  elevated: 'bg-[#111] shadow-xl shadow-black/40',
  gradient: 'border border-white/5',
};

const PADDING_MAP: Record<string, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const RADIUS_MAP: Record<string, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
};

/**
 * CardBlock — A styled card container that can hold child blocks.
 * isContainer: true — supports drag-and-drop of blocks inside.
 */
export const CardBlock: React.FC<CardBlockProps> = ({
  title,
  subtitle,
  variant = 'default',
  padding = 'md',
  radius = 'xl',
  accentColor,
  showHeader = false,
  children,
  sectionId,
}) => {
  const variantClass = VARIANT_MAP[variant] ?? VARIANT_MAP.default;
  const paddingClass = PADDING_MAP[padding] ?? 'p-6';
  const radiusClass = RADIUS_MAP[radius] ?? 'rounded-xl';

  const isGradient = variant === 'gradient';

  return (
    <div
      id={sectionId}
      className={`w-full transition-all ${variantClass} ${radiusClass} overflow-hidden`}
      style={isGradient ? {
        background: accentColor
          ? `linear-gradient(135deg, ${accentColor}22, transparent)`
          : 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
        borderTop: accentColor ? `2px solid ${accentColor}` : '2px solid rgba(99,102,241,0.5)',
      } : undefined}
    >
      {/* Card header */}
      {showHeader && (title || subtitle) && (
        <div
          className="px-6 py-4 border-b border-white/5"
          style={accentColor ? { borderBottomColor: `${accentColor}30` } : undefined}
        >
          {title && (
            <h3
              data-cms-field="title"
              className="text-base font-semibold text-white"
              style={accentColor ? { color: accentColor } : undefined}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p data-cms-field="subtitle" className="text-sm text-slate-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Card body */}
      <div className={paddingClass}>
        {children ?? (
          <div className="text-slate-600 text-xs text-center py-4 border border-dashed border-white/10 rounded-lg">
            Drop blocks here
          </div>
        )}
      </div>
    </div>
  );
};
