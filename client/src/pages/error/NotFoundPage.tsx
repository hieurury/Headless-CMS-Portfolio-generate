import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { t } from '../../i18n';
import {
  LayoutGrid,
  RotateCcw,
  Compass,
  ArrowLeft,
  FileQuestion,
  Home,
  Sun,
  Moon,
} from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { language, theme, toggleTheme, toggleLanguage } = useUIStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const tr = t(language).notFound;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col justify-between relative overflow-hidden grid-pattern selection:bg-[var(--color-accent)] selection:text-[var(--color-bg)]">
      {/* Top minimalistic status bar */}
      <header className="w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]/60 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/icons.svg"
            alt="CMS Portfolio Logo"
            className="w-6 h-6 object-contain transition-transform group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="font-bold text-sm tracking-tight text-[var(--color-text)]">
            CMS Portfolio
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1 rounded-md text-xs font-mono font-medium border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
            title="Switch Language"
          >
            {language.toUpperCase()}
          </button>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* Main 404 Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center z-10">
        <div className="w-full max-w-xl mx-auto flex flex-col items-center">
          {/* Status Chip */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface-2)]/80 text-[var(--color-text-muted)] text-xs font-mono mb-8 shadow-sm animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-pulse" />
            <span>{tr.badge}</span>
          </div>

          {/* Graphic 404 Display */}
          <div className="relative mb-6 select-none">
            <div className="text-8xl sm:text-9xl font-black font-mono tracking-tighter text-[var(--color-text)] opacity-90 leading-none">
              404
            </div>
            {/* Center icon badge overlay */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded border border-[var(--color-border-strong)] bg-[var(--color-surface)] shadow-lg flex items-center justify-center">
              <FileQuestion size={26} className="text-[var(--color-text)]" />
            </div>
          </div>

          {/* Heading & Subtitle */}
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] tracking-tight mb-3">
            {tr.title}
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm sm:text-base max-w-md mb-8 leading-relaxed">
            {tr.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md mb-8">
            <Link
              to={`/${user?.username}/dashboard`}
              className="flex-1 min-w-[160px] h-11 px-5 rounded border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm active:scale-[0.98]"
            >
              <LayoutGrid size={16} />
              {tr.backToDashboard}
            </Link>

            <button
              onClick={() => window.location.reload()}
              className="h-11 px-4 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] font-medium text-sm flex items-center justify-center gap-2 hover:bg-[var(--color-surface-2)] hover:border-[var(--color-border-hover)] transition-all shadow-sm"
              title={tr.reloadPage}
            >
              <RotateCcw size={15} />
              {tr.reloadPage}
            </button>

            <button
              onClick={() => navigate(-1)}
              className="h-11 px-4 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-medium text-sm flex items-center justify-center gap-2 hover:bg-[var(--color-surface-2)] transition-all shadow-sm"
              title="Go Back"
            >
              <ArrowLeft size={15} />
            </button>
          </div>

          {/* Secondary Quick Navigation */}
          <div className="w-full max-w-md pt-6 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span className="font-mono">{tr.quickNav}:</span>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="hover:text-[var(--color-text)] flex items-center gap-1 transition-colors"
              >
                <Home size={12} /> {tr.home}
              </Link>
              <span className="text-[var(--color-border-strong)]">/</span>
              <Link
                to="/explore"
                className="hover:text-[var(--color-text)] flex items-center gap-1 transition-colors"
              >
                <Compass size={12} /> {tr.exploreShowcase}
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer system status line */}
      <footer className="w-full border-t border-[var(--color-border)] bg-[var(--color-surface)]/40 px-6 py-3 text-center text-xs font-mono text-[var(--color-text-faint)] z-10 flex items-center justify-between">
        <span>{tr.systemCode}</span>
        <span className="hidden sm:inline">CMS · TECHNICAL_WORKSPACE</span>
      </footer>
    </div>
  );
};
