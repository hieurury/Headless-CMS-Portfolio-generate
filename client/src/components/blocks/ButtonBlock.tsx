import React from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditorContext } from '../../core/context/EditorContext';

// ─── Shared position maps ─────────────────────────────────────────────────────
type AlignX = 'left' | 'center' | 'right';
type AlignY = 'top' | 'middle' | 'bottom';

const JUSTIFY_MAP: Record<AlignX, string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};
const ALIGN_ITEMS_MAP: Record<AlignY, string> = {
  top: 'flex-start',
  middle: 'center',
  bottom: 'flex-end',
};

// ─── Props ────────────────────────────────────────────────────────────────────
export interface ButtonBlockProps {
  label?: string;
  href?: string;
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'default' | 'square' | 'pill' | 'icon-only';

  alignX?: AlignX;
  alignY?: AlignY;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  external?: boolean;
  textColor?: string;
  backgroundColor?: string;
  sectionId?: string;
  margin?: string;
  padding?: string;
  [key: string]: unknown;
}

// ─── Style Maps ───────────────────────────────────────────────────────────────
const VARIANT_STYLES: Record<string, string> = {
  solid:
    'bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-90 border border-[var(--color-text)] shadow-sm hover:shadow-md',
  outline:
    'bg-transparent border border-[var(--color-border-strong)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)] shadow-sm',
  ghost:
    'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] border border-transparent',
};

const SIZE_BASE: Record<string, string> = {
  xs: 'px-3 py-1.5 text-xs',
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
  xl: 'px-10 py-5 text-lg',
};

const SHAPE_RADIUS: Record<string, string> = {
  default: 'rounded-sm',
  square: 'rounded-none',
  pill: 'rounded-full',
  'icon-only': 'rounded-sm aspect-square p-0 flex items-center justify-center',
};

export const ButtonBlock: React.FC<ButtonBlockProps> = ({
  label = 'Click Me',
  href = '#',
  variant = 'solid',
  size = 'md',
  shape = 'default',
  alignX = 'left',
  alignY = 'middle',
  icon,
  iconPosition = 'right',
  fullWidth = false,
  external = false,
  textColor,
  backgroundColor,
  sectionId,
  margin,
  padding,
}) => {

  const variantClass = VARIANT_STYLES[variant] ?? VARIANT_STYLES.solid;
  const baseSize = SIZE_BASE[size] ?? SIZE_BASE.md;
  const shapeClass = SHAPE_RADIUS[shape] ?? SHAPE_RADIUS.default;

  const isIconOnly = shape === 'icon-only';
  const isExternalHref = external || href?.startsWith('http');
  const isAnchor = href?.startsWith('#');
  const isPageLink = href?.startsWith('/') && !href.startsWith('//');

  const { isEditorMode, previewMode } = useEditorContext();
  const { username, portfolioSlug } = useParams<{ username: string; portfolioSlug: string }>();
  const navigate = useNavigate();

  let finalHref = href;
  if (isPageLink && username && portfolioSlug) {
    const pageSlug = href === '/' ? '' : href;
    finalHref = `/${username}/${portfolioSlug}${pageSlug}`;
  }

  const handleClick = (e: React.MouseEvent) => {
    if (isEditorMode) {
      e.preventDefault();
      if (!previewMode) return;
      if (isAnchor && href) {
        const target = document.getElementById(href.slice(1));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    if (isAnchor && href) {
      e.preventDefault();
      const target = document.getElementById(href.slice(1));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    } else if (isPageLink && username && portfolioSlug && !isExternalHref) {
      e.preventDefault();
      navigate(finalHref);
    }
  };

  let SelectedIcon: React.ElementType | null = null;
  if (icon) {
    const iconNames = Object.keys(LucideIcons);
    const foundName = iconNames.find((k) => k.toLowerCase() === icon.toLowerCase());
    if (foundName) {
      SelectedIcon = (LucideIcons as any)[foundName];
    }
  }

  const iconEl = SelectedIcon ? (
    <SelectedIcon size={16} className="shrink-0" aria-hidden="true" />
  ) : icon ? (
    <span aria-hidden="true">{icon}</span>
  ) : variant === 'solid' && !isIconOnly ? (
    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 shrink-0" />
  ) : isExternalHref && !isIconOnly ? (
    <ExternalLink size={14} className="shrink-0 opacity-70" />
  ) : null;

  const hasUrl = Boolean(href && href !== '#');
  const sharedClasses = `
    group inline-flex items-center gap-2 font-medium transition-all duration-200
    ${variantClass} ${baseSize} ${shapeClass}
    ${fullWidth ? 'w-full justify-center' : ''}
  `.trim();

  const content = (
    <>
      {!isIconOnly && <span>{label}</span>}
      {iconEl && (
        <span className={iconPosition === 'right' ? 'order-last' : 'order-first'}>
          {iconEl}
        </span>
      )}
    </>
  );

  return (
    <div
      id={sectionId}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: JUSTIFY_MAP[alignX] ?? 'flex-start',
        alignItems: ALIGN_ITEMS_MAP[alignY] ?? 'center',
        backgroundColor: backgroundColor,
        color: textColor,
        margin: margin || undefined,
        padding: padding || undefined,
      }}
    >
      {hasUrl ? (
        <a
          href={finalHref}
          data-cms-field="label"
          target={isExternalHref ? '_blank' : undefined}
          rel={isExternalHref ? 'noopener noreferrer' : undefined}
          onClick={handleClick}
          className={sharedClasses}
        >
          {content}
        </a>
      ) : (
        <button
          type="button"
          data-cms-field="label"
          onClick={handleClick}
          className={sharedClasses}
        >
          {content}
        </button>
      )}
    </div>
  );
};
