import React from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { useEditorContext } from '../../core/context/EditorContext';

// ─── Shared position maps ─────────────────────────────────────────────────────
type AlignX = 'left' | 'center' | 'right';
type AlignY = 'top'  | 'middle' | 'bottom';

const JUSTIFY_MAP: Record<AlignX, string> = {
  left:   'flex-start',
  center: 'center',
  right:  'flex-end',
};
const ALIGN_ITEMS_MAP: Record<AlignY, string> = {
  top:    'flex-start',
  middle: 'center',
  bottom: 'flex-end',
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface LinkBlockProps {
  label?: string;
  href?: string;
  /** inline = plain text link | nav = subtle nav-style | underline = underlined | pill = pill button style */
  variant?: 'inline' | 'nav' | 'underline' | 'pill';
  size?: 'sm' | 'base' | 'lg';
  /** @deprecated Use alignX instead */
  align?: 'left' | 'center' | 'right';
  /** Horizontal position within the cell */
  alignX?: AlignX;
  /** Vertical position within the cell */
  alignY?: AlignY;
  color?: string;
  external?: boolean;
  showIcon?: boolean;
  sectionId?: string;
  [key: string]: unknown;
}

// ─── Style Maps ───────────────────────────────────────────────────────────────
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
  sm: 'text-sm', base: 'text-base', lg: 'text-lg',
};

export const LinkBlock: React.FC<LinkBlockProps> = ({
  label    = 'Link',
  href     = '#',
  variant  = 'nav',
  size     = 'base',
  align    = 'left',
  alignX,
  alignY   = 'middle',
  external = false,
  showIcon = false,
  sectionId,
}) => {
  const { isEditorMode, previewMode } = useEditorContext();

  const resolvedX: AlignX = alignX ?? (align as AlignX) ?? 'left';

  const variantClass = VARIANT_STYLES[variant] ?? VARIANT_STYLES.nav;
  const sizeClass    = SIZE_STYLES[size]        ?? SIZE_STYLES.base;

  const isExternalHref = external || href?.startsWith('http');
  const isAnchor       = href?.startsWith('#');

  const handleClick = (e: React.MouseEvent) => {
    if (isEditorMode && !previewMode) return;
    if (isAnchor && href) {
      e.preventDefault();
      const target = document.getElementById(href.slice(1));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      id={sectionId}
      style={{
        width:          '100%',
        height:         '100%',
        display:        'flex',
        justifyContent: JUSTIFY_MAP[resolvedX]  ?? 'flex-start',
        alignItems:     ALIGN_ITEMS_MAP[alignY] ?? 'center',
      }}
    >
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
