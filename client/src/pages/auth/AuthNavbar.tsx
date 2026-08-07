import React from 'react';
import { Link } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { Sun, Moon, Globe } from 'lucide-react';

export const AuthNavbar: React.FC = () => {
  const { theme, language, toggleTheme, toggleLanguage } = useUIStore();

  return (
    <nav
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 40,
      }}
    >
      {/* Brand — mirrors home Navbar markup */}
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
          opacity: 1,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        {/* Logo SVG icon — same as home Navbar */}
        <img
          src="/icons.svg"
          alt="Ruryfo CMS Logo"
          style={{
            width: 28,
            height: 28,
            color: 'var(--color-text)',
            filter: theme === 'dark' ? 'invert(1)' : 'invert(0)',
          }}
        />

        {/* Brand name */}
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--color-text)',
            letterSpacing: '-0.3px',
          }}
          className="hidden sm:block"
        >
          Ruryfo CMS
        </span>
      </Link>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Language toggle */}
        <button
          onClick={toggleLanguage}
          title="Toggle Language"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            background: 'none',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-muted)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'color 0.15s, background 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-surface-2)';
            e.currentTarget.style.color = 'var(--color-text)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = 'var(--color-text-muted)';
          }}
        >
          <Globe size={15} />
          <span>{language}</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          style={{
            padding: '6px 8px',
            background: 'none',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.15s, background 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-surface-2)';
            e.currentTarget.style.color = 'var(--color-text)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = 'var(--color-text-muted)';
          }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </nav>
  );
};
