import React from 'react';
import { Heart } from 'lucide-react';

interface FooterLink { label: string; href: string; }

interface FooterProps {
  copyright?: string;
  links?: FooterLink[];
  showSocials?: boolean;
  [key: string]: unknown;
}

export const Footer: React.FC<FooterProps> = ({
  copyright = `© ${new Date().getFullYear()} My Portfolio`,
  links = [],
}) => {
  return (
    <footer className="border-t border-white/5 bg-[#080810]">
      <div className="container-max mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            <span>{copyright}</span>
            <span className="mx-2">·</span>
            <span className="flex items-center gap-1">
              Built with <Heart size={12} className="text-rose-400 mx-1" fill="currentColor" /> using CMS
            </span>
          </div>

          {links.length > 0 && (
            <div className="flex items-center gap-6">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
