import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useUIStore } from '../../../store/uiStore';
import { t } from '../../../i18n';
import { Sun, Moon, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { theme, language, toggleTheme, toggleLanguage } = useUIStore();
  const tr = t(language);
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // GSAP mount animation
  useEffect(() => {
    if (!navRef.current) return;
    gsap.fromTo(
      navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.2 },
    );
  }, []);

  // Scroll listener for solid background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      id="home-navbar"
      className={`home-navbar ${scrolled ? 'home-navbar--scrolled' : ''}`}
    >
      <div className="home-navbar__inner">
        {/* Logo */}
        <Link to="/" className="home-navbar__logo" id="navbar-logo">
          <span className="home-navbar__logo-mark">◆</span>
          <span className="home-navbar__logo-text">CMS Portfolio</span>
        </Link>

        {/* Right side: Links & Controls */}
        <div className="home-navbar__right">
          {/* Desktop links */}
          <div className="home-navbar__links" id="navbar-links">
            <Link to="/docs" className="home-navbar__link" id="navbar-docs">
              {tr.nav.docs}
            </Link>
            <Link to="/explore" className="home-navbar__link" id="navbar-community">
              {tr.nav.community}
            </Link>
          </div>

          {/* Controls */}
          <div className="home-navbar__controls" id="navbar-controls">
            {/* Language toggle */}
            <button
              id="navbar-lang-toggle"
              className="home-navbar__icon-btn"
              onClick={toggleLanguage}
              title={language === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang Tiếng Anh'}
              aria-label="Toggle language"
            >
              <span className="home-navbar__lang-label">{language.toUpperCase()}</span>
            </button>

            {/* Theme toggle */}
            <button
              id="navbar-theme-toggle"
              className="home-navbar__icon-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Login */}
            <Link to="/login" className="home-navbar__login" id="navbar-login">
              {tr.nav.login}
            </Link>

            {/* Mobile menu button */}
            <button
              id="navbar-mobile-menu"
              className="home-navbar__icon-btn home-navbar__hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="home-navbar__mobile" id="navbar-mobile-dropdown">
          <Link to="/docs" className="home-navbar__mobile-link" onClick={() => setMobileOpen(false)}>
            {tr.nav.docs}
          </Link>
          <Link to="/explore" className="home-navbar__mobile-link" onClick={() => setMobileOpen(false)}>
            {tr.nav.community}
          </Link>
          <Link to="/login" className="home-navbar__mobile-link home-navbar__mobile-link--cta" onClick={() => setMobileOpen(false)}>
            {tr.nav.login}
          </Link>
        </div>
      )}
    </nav>
  );
};
