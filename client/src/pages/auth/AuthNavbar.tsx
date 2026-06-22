import React from 'react';
import { Link } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { Sun, Moon, Globe } from 'lucide-react';

export const AuthNavbar: React.FC = () => {
  const { theme, language, toggleTheme, toggleLanguage } = useUIStore();

  return (
    <nav className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-40">
      <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="w-10 h-10 rounded-lg bg-[var(--color-text)] flex items-center justify-center shadow-md">
          <span className="text-[var(--color-bg)] font-bold text-xl">C</span>
        </div>
        <span className="text-[var(--color-text)] font-semibold text-lg hidden sm:block">
          CMS Portfolio
        </span>
      </Link>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-transparent hover:bg-[var(--color-surface-2)] text-[var(--color-text)] transition-colors shadow-sm"
          title="Toggle Language"
        >
          <Globe size={18} />
          <span className="text-sm font-medium uppercase">{language}</span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-transparent hover:bg-[var(--color-surface-2)] text-[var(--color-text)] transition-colors shadow-sm"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </nav>
  );
};
