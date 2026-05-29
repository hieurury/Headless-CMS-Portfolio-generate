import React from 'react';
import { Menu, X } from 'lucide-react';
import { useEditorContext } from '../../core/context/EditorContext';

interface NavLink {
  label: string;
  href: string;
}

export interface NavbarBlockProps {
  logo?: string;
  links?: NavLink[];
  ctaLabel?: string;
  ctaHref?: string;
  sticky?: boolean;
  transparent?: boolean;
  [key: string]: unknown;
}

/**
 * NavbarBlock — a composable navigation block.
 *
 * This is an Atomic Block, not a Section template.
 * Add it as the first block on any page for site navigation.
 * Uses useEditorContext to disable navigation in editor mode.
 */
export const NavbarBlock: React.FC<NavbarBlockProps> = ({
  logo = 'My Portfolio',
  links = [],
  ctaLabel,
  ctaHref = '#contact',
  sticky = true,
  transparent = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const { isEditorMode, previewMode } = useEditorContext();
  const isEditing = isEditorMode && !previewMode;

  React.useEffect(() => {
    if (isEditing) return; // No scroll listener in editor
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [isEditing]);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isEditing) return;
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.getElementById(href.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navBg =
    transparent && !scrolled
      ? 'bg-transparent'
      : 'bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/5 shadow-lg';

  return (
    <nav
      className={`w-full z-50 transition-all duration-300 ${sticky ? 'sticky top-0' : ''} ${navBg}`}
    >
      <div className="container-max px-6 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            data-cms-field="logo"
            href={isEditing ? undefined : '/'}
            onClick={(e) => { if (!isEditing) handleAnchorClick(e, '/'); }}
            className="text-xl font-bold gradient-text select-none"
          >
            {logo}
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {(links as NavLink[]).map((link, i) => (
              <a
                key={i}
                href={isEditing ? undefined : link.href}
                onClick={(e) => handleAnchorClick(e as React.MouseEvent<HTMLAnchorElement>, link.href)}
                className="text-sm text-slate-400 hover:text-white transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-indigo-400 transition-all group-hover:w-full" />
              </a>
            ))}
            {ctaLabel && (
              <a
                data-cms-field="ctaLabel"
                href={isEditing ? undefined : ctaHref}
                onClick={(e) => handleAnchorClick(e as React.MouseEvent<HTMLAnchorElement>, ctaHref ?? '')}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25"
              >
                {ctaLabel}
              </a>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            onClick={() => { if (!isEditing) setIsOpen(!isOpen); }}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && !isEditing && (
          <div className="md:hidden border-t border-white/5 py-4 space-y-3 animate-fade-in">
            {(links as NavLink[]).map((link, i) => (
              <a
                key={i}
                href={link.href}
                className="block text-slate-400 hover:text-white py-2 transition-colors"
                onClick={(e) => {
                  handleAnchorClick(e as React.MouseEvent<HTMLAnchorElement>, link.href);
                  setIsOpen(false);
                }}
              >
                {link.label}
              </a>
            ))}
            {ctaLabel && (
              <a
                href={ctaHref}
                className="block w-full text-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium"
                onClick={(e) => {
                  handleAnchorClick(e as React.MouseEvent<HTMLAnchorElement>, ctaHref ?? '');
                  setIsOpen(false);
                }}
              >
                {ctaLabel}
              </a>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
