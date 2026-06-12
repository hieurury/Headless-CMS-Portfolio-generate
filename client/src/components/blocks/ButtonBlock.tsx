import React from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
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
interface ButtonBlockProps {
  label?: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'default' | 'pill' | 'square' | 'icon-only';

  /** Horizontal position within the cell */
  alignX?: AlignX;
  /** Vertical position within the cell */
  alignY?: AlignY;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  external?: boolean;
  textColor?: string;
  backgroundColor?: string;
  sectionId?: string;
  [key: string]: unknown;
}

// ─── Style Maps ───────────────────────────────────────────────────────────────
const VARIANT_STYLES: Record<string, string> = {
  primary:
    'gradient-bg text-white hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-105',
  secondary:
    'glass glass-hover text-white border border-white/10',
  ghost:
    'text-indigo-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10',
  danger:
    'bg-rose-600 hover:bg-rose-500 text-white hover:shadow-lg hover:shadow-rose-500/25',
  success:
    'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-500/25',
  warning:
    'bg-amber-500 hover:bg-amber-400 text-black font-semibold hover:shadow-lg hover:shadow-amber-500/25',
  outline:
    'border border-indigo-500/50 text-indigo-400 hover:border-indigo-400 hover:bg-indigo-500/10',
};

const SIZE_BASE: Record<string, string> = {
  xs: 'px-3 py-1.5 text-xs',
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
  xl: 'px-10 py-5 text-lg',
};

const SHAPE_RADIUS: Record<string, string> = {
  default:    'rounded-xl',
  pill:       'rounded-full',
  square:     'rounded-none',
  'icon-only':'rounded-xl aspect-square p-0 flex items-center justify-center',
};

export const ButtonBlock: React.FC<ButtonBlockProps> = ({
  label        = 'Click Me',
  href         = '#',
  variant      = 'primary',
  size         = 'md',
  shape        = 'default',
  alignX       = 'left',
  alignY       = 'middle',
  icon,
  iconPosition = 'right',
  fullWidth    = false,
  external     = false,
  textColor,
  backgroundColor,
  sectionId,
}) => {


  const variantClass = VARIANT_STYLES[variant] ?? VARIANT_STYLES.primary;
  const baseSize     = SIZE_BASE[size]          ?? SIZE_BASE.md;
  const shapeClass   = SHAPE_RADIUS[shape]      ?? SHAPE_RADIUS.default;

  const isIconOnly     = shape === 'icon-only';
  const isExternalHref = external || href?.startsWith('http');
  const isAnchor       = href?.startsWith('#');

  const { isEditorMode, previewMode } = useEditorContext();

  const handleClick = (e: React.MouseEvent) => {
    if (isEditorMode && !previewMode) return;
    if (isAnchor && href) {
      e.preventDefault();
      const target = document.getElementById(href.slice(1));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const iconEl = icon ? (
    <span aria-hidden="true">{icon}</span>
  ) : variant === 'primary' && !isIconOnly ? (
    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 shrink-0" />
  ) : isExternalHref && !isIconOnly ? (
    <ExternalLink size={14} className="shrink-0 opacity-70" />
  ) : null;

  return (
    <div
      id={sectionId}
      style={{
        width:          '100%',
        height:         '100%',
        display:        'flex',
        justifyContent: JUSTIFY_MAP[alignX]  ?? 'flex-start',
        alignItems:     ALIGN_ITEMS_MAP[alignY] ?? 'center',
        backgroundColor: backgroundColor,
        color: textColor,
      }}
    >
      <a
        href={href}
        data-cms-field="label"
        target={isExternalHref ? '_blank' : undefined}
        rel={isExternalHref ? 'noopener noreferrer' : undefined}
        onClick={handleClick}
        className={`
          group inline-flex items-center gap-2 font-semibold transition-all duration-300
          ${variantClass} ${baseSize} ${shapeClass}
          ${fullWidth ? 'w-full justify-center' : ''}
        `}
      >
        {iconPosition === 'left' && iconEl}
        {!isIconOnly && label}
        {(iconPosition === 'right' || isIconOnly) && iconEl}
      </a>
    </div>
  );
};
