import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useEditorContext } from '../../core/context/EditorContext';

interface ButtonBlockProps {
  label?: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center' | 'right';
  icon?: string;
  fullWidth?: boolean;
  sectionId?: string;
  [key: string]: unknown;
}

const VARIANT_STYLES: Record<string, string> = {
  primary:
    'gradient-bg text-white hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-105',
  secondary:
    'glass glass-hover text-white border border-white/10',
  ghost:
    'text-indigo-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10',
  danger:
    'bg-rose-600 hover:bg-rose-500 text-white hover:shadow-lg hover:shadow-rose-500/25',
};

const SIZE_STYLES: Record<string, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-sm rounded-xl',
  lg: 'px-8 py-4 text-base rounded-xl',
};

const ALIGN_MAP: Record<string, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

export const ButtonBlock: React.FC<ButtonBlockProps> = ({
  label = 'Click Me',
  href = '#',
  variant = 'primary',
  size = 'md',
  align = 'left',
  icon,
  fullWidth = false,
  sectionId,
}) => {
  const variantClass = VARIANT_STYLES[variant] ?? VARIANT_STYLES.primary;
  const sizeClass = SIZE_STYLES[size] ?? SIZE_STYLES.md;
  const alignClass = ALIGN_MAP[align] ?? 'justify-start';

  const isExternalHref = href?.startsWith('http');
  const isAnchor = href?.startsWith('#');

  const { isEditorMode, previewMode } = useEditorContext();

  const handleClick = (e: React.MouseEvent) => {
    // Disable all click behaviors in editor mode
    if (isEditorMode && !previewMode) return;
    if (isAnchor && href) {
      e.preventDefault();
      const target = document.getElementById(href.slice(1));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`w-full py-2 flex ${alignClass}`} id={sectionId}>
      <a
        href={href}
        data-cms-field="label"
        target={isExternalHref ? '_blank' : undefined}
        rel={isExternalHref ? 'noopener noreferrer' : undefined}
        onClick={handleClick}
        className={`
          inline-flex items-center gap-2 font-semibold transition-all duration-300
          ${variantClass} ${sizeClass}
          ${fullWidth ? 'w-full justify-center' : ''}
        `}
      >
        {icon && <span>{icon}</span>}
        {label}
        {variant === 'primary' && !icon && (
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        )}
      </a>
    </div>
  );
};
