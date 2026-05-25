import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import clsx from 'clsx';

interface NavLink { label: string; href: string; }

interface NavbarProps {
  logo?: string;
  links?: NavLink[];
  ctaLabel?: string;
  ctaHref?: string;
  sticky?: boolean;
  [key: string]: unknown;
}

export const Navbar: React.FC<NavbarProps> = ({
  logo = 'Portfolio',
  links = [],
  ctaLabel,
  ctaHref = '#contact',
  sticky = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={clsx(
        'w-full z-50 transition-all duration-300',
        sticky && 'sticky top-0',
        scrolled
          ? 'bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/5 shadow-lg'
          : 'bg-transparent',
      )}
    >
      <div className="container-max px-6 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="text-xl font-bold gradient-text">
            {logo}
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-slate-400 hover:text-white transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-indigo-400 transition-all group-hover:w-full" />
              </a>
            ))}
            {ctaLabel && (
              <a
                href={ctaHref}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25"
              >
                {ctaLabel}
              </a>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-white/5 py-4 space-y-3 animate-fade-in">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block text-slate-400 hover:text-white py-2 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {ctaLabel && (
              <a
                href={ctaHref}
                className="block w-full text-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium"
                onClick={() => setIsOpen(false)}
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
