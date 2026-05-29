import React from 'react';

interface SectionWrapperProps {
  title?: string;
  subtitle?: string;
  label?: string;
  /** Alignment of the header text */
  align?: 'left' | 'center' | 'right';
  /** Vertical padding of the section */
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  /** Background style */
  background?: 'default' | 'alternate' | 'dark' | 'gradient' | 'none';
  /** Max width constraint */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Custom background color */
  bgColor?: string;
  /** Show divider line under header */
  showDivider?: boolean;
  children?: React.ReactNode;
  sectionId?: string;
  [key: string]: unknown;
}

const PADDING_MAP: Record<string, string> = {
  sm: 'py-12 px-6',
  md: 'py-20 px-6',
  lg: 'py-28 px-6',
  xl: 'py-36 px-6',
};

const BG_MAP: Record<string, string> = {
  default: '',
  alternate: 'bg-[#0d0d14]',
  dark: 'bg-[#060609]',
  gradient: 'bg-gradient-to-b from-indigo-950/20 to-transparent',
  none: '',
};

const MAX_WIDTH_MAP: Record<string, string> = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  full: 'max-w-none',
};

const ALIGN_MAP: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/**
 * SectionWrapperBlock — A full-width section container with optional header.
 * Wrap any combination of blocks inside to create custom sections.
 * isContainer: true
 */
export const SectionWrapperBlock: React.FC<SectionWrapperProps> = ({
  title,
  subtitle,
  label,
  align = 'center',
  padding = 'lg',
  background = 'default',
  maxWidth = 'xl',
  bgColor,
  showDivider = false,
  children,
  sectionId,
}) => {
  const paddingClass = PADDING_MAP[padding] ?? PADDING_MAP.md;
  const bgClass = BG_MAP[background] ?? '';
  const maxWClass = MAX_WIDTH_MAP[maxWidth] ?? MAX_WIDTH_MAP.xl;
  const alignClass = ALIGN_MAP[align] ?? ALIGN_MAP.center;
  const hasHeader = !!(title || subtitle || label);

  return (
    <section
      id={sectionId}
      className={`w-full ${paddingClass} ${bgClass}`}
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      <div className={`mx-auto w-full ${maxWClass}`}>
        {hasHeader && (
          <div className={`mb-12 ${alignClass}`}>
            {label && (
              <p data-cms-field="label" className="text-sm font-semibold text-indigo-400 tracking-widest uppercase mb-3 cursor-text">
                {label}
              </p>
            )}
            {title && (
              <h2
                data-cms-field="title"
                className="text-4xl md:text-5xl font-bold text-white mb-4"
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                data-cms-field="subtitle"
                className="text-slate-400 text-lg max-w-2xl mx-auto"
              >
                {subtitle}
              </p>
            )}
            {showDivider && (
              <div
                className={`mt-6 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent ${align === 'left' ? 'mr-auto' : align === 'right' ? 'ml-auto' : 'mx-auto'} w-48`}
              />
            )}
          </div>
        )}

        {/* Content area — children blocks render here */}
        {children ?? (
          <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center text-slate-600 text-sm">
            Drop blocks here to build your section
          </div>
        )}
      </div>
    </section>
  );
};
