import React from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { useEditorContext } from '../../core/context/EditorContext';

interface LinkBlockProps {
  label?: string;
  href?: string;
  /** inline = plain text link | nav = subtle nav-style | underline = underlined | pill = pill button style */
  variant?: 'inline' | 'nav' | 'underline' | 'pill';
  size?: 'sm' | 'base' | 'lg';
  align?: 'left' | 'center' | 'right';
  color?: string;
  external?: boolean;
  showIcon?: boolean;
  sectionId?: string;
  [key: string]: unknown;
}

const VARIANT_STYLES: Record<string, string> = {
  inline:
    'text-indigo-400 hover:text-indigo-300 transition-colors',
  nav:
    'text-slate-400 hover:text-white font-medium transition-colors px-2 py-1 rounded-md hover:bg-white/5',
  underline:
    'text-slate-200 underline underline-offset-4 decoration-indigo-500/50 hover:decoration-indigo-400 transition-colors',
  pill:
    'px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all text-sm font-medium',
};

const SIZE_STYLES: Record<string, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
};

const ALIGN_MAP: Record<string, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

export const LinkBlock: React.FC<LinkBlockProps> = ({
  label = 'Link',
  href = '#',
  variant = 'nav',
  size = 'base',
  align = 'left',
  external = false,
  showIcon = false,
  sectionId,
}) => {
  const { isEditorMode, previewMode } = useEditorContext();

  const variantClass = VARIANT_STYLES[variant] ?? VARIANT_STYLES.nav;
  const sizeClass = SIZE_STYLES[size] ?? SIZE_STYLES.base;
  const alignClass = ALIGN_MAP[align] ?? 'justify-start';

  const isExternalHref = external || href?.startsWith('http');
  const isAnchor = href?.startsWith('#');

  const handleClick = (e: React.MouseEvent) => {
    if (isEditorMode && !previewMode) return;
    if (isAnchor && href) {
      e.preventDefault();
      const target = document.getElementById(href.slice(1));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`flex ${alignClass}`} id={sectionId}>
      <a
        href={href}
        data-cms-field="label"
        target={isExternalHref ? '_blank' : undefined}
        rel={isExternalHref ? 'noopener noreferrer' : undefined}
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 ${variantClass} ${sizeClass}`}
      >
        {label}
        {showIcon && isExternalHref && <ExternalLink size={12} className="opacity-60" />}
        {showIcon && !isExternalHref && variant === 'inline' && (
          <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
        )}
      </a>
    </div>
  );
};
