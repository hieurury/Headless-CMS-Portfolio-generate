import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { t } from '../../../i18n';
import { Sun, Moon, Menu, X, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { theme, language, toggleTheme, toggleLanguage } = useUIStore();
  const { isAuthenticated, user } = useAuthStore();
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

  const scrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('features-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      ref={navRef}
      id="home-navbar"
      className={`home-navbar ${scrolled ? 'home-navbar--scrolled' : ''}`}
    >
      <div className="home-navbar__inner">
        {/* Logo */}
        <Link to="/" className="home-navbar__logo" id="navbar-logo">
          <img
            src="/icons.svg"
            alt="Ruryfo CMS Logo"
            className="home-navbar__logo-mark"
          />
          <span className="home-navbar__logo-text">Ruryfo CMS</span>
        </Link>

        {/* Right side: Links & Controls */}
        <div className="home-navbar__right">
          {/* Desktop links */}
          <div className="home-navbar__links" id="navbar-links">
            <a
              href="#features-section"
              onClick={scrollToFeatures}
              className="home-navbar__link"
              id="navbar-features"
            >
              {language === 'vi' ? 'Tính năng' : 'Features'}
            </a>
            <Link
              to="/explore"
              className="home-navbar__link"
              id="navbar-community"
            >
              {language === 'vi' ? 'Showcase' : 'Showcase'}
            </Link>
          </div>

          {/* Controls */}
          <div className="home-navbar__controls" id="navbar-controls">
            {/* Language toggle */}
            <button
              id="navbar-lang-toggle"
              className="home-navbar__icon-btn"
              onClick={toggleLanguage}
              title={
                language === 'en'
                  ? 'Switch to Vietnamese'
                  : 'Chuyển sang Tiếng Anh'
              }
              aria-label="Toggle language"
            >
              <span className="home-navbar__lang-label">
                {language.toUpperCase()}
              </span>
            </button>

            {/* Theme toggle */}
            <button
              id="navbar-theme-toggle"
              className="home-navbar__icon-btn"
              onClick={toggleTheme}
              title={
                theme === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Auth CTA */}
            {isAuthenticated ? (
              <Link
                to={`/${user?.username}/dashboard`}
                className="home-navbar__login flex items-center gap-1.5"
                id="navbar-dashboard"
              >
                <LayoutDashboard size={14} />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link to="/login" className="home-navbar__login" id="navbar-login">
                {tr.nav.login}
              </Link>
            )}

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
          <a
            href="#features-section"
            className="home-navbar__mobile-link"
            onClick={(e) => {
              setMobileOpen(false);
              scrollToFeatures(e);
            }}
          >
            {language === 'vi' ? 'Tính năng' : 'Features'}
          </a>
          <Link
            to="/explore"
            className="home-navbar__mobile-link"
            onClick={() => setMobileOpen(false)}
          >
            {language === 'vi' ? 'Showcase cộng đồng' : 'Community Showcase'}
          </Link>
          <Link
            to={isAuthenticated ? `/${user?.username}/dashboard` : '/login'}
            className="home-navbar__mobile-link home-navbar__mobile-link--cta"
            onClick={() => setMobileOpen(false)}
          >
            {isAuthenticated ? 'Dashboard' : tr.nav.login}
          </Link>
        </div>
      )}
    </nav>
  );
};
