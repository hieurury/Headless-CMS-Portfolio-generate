import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { t } from '../../../i18n';

gsap.registerPlugin(ScrollTrigger);

export const Footer: React.FC = () => {
  const { language } = useUIStore();
  const { isAuthenticated, user } = useAuthStore();
  const tr = t(language);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;
    gsap.fromTo(
      footerRef.current,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 90%',
          once: true,
        },
      },
    );
  }, []);

  const scrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('features-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer ref={footerRef} id="home-footer" className="home-footer">
      <div className="home-footer__inner">
        {/* Col 1: Brand */}
        <div className="home-footer__brand">
          <div className="home-footer__logo">
            <img
              src="/icons.svg"
              alt="Ruryfo CMS Logo"
              className="home-navbar__logo-mark"
            />
            <span className="home-navbar__logo-text">Ruryfo CMS</span>
          </div>
          <p className="home-footer__tagline">{tr.footer.tagline}</p>
          {/* Socials */}
          <div className="home-footer__socials" id="footer-socials">
            <a
              id="footer-github"
              href="https://github.com/hieurury/Headless-CMS-Portfolio-generate"
              target="_blank"
              rel="noopener noreferrer"
              className="home-footer__social-link"
              aria-label="GitHub Repository"
              title="GitHub Repository"
            >
              {/* GitHub icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Col 2: Navigation */}
        <div className="home-footer__col" id="footer-nav">
          <h4 className="home-footer__col-title">{tr.footer.nav}</h4>
          <a
            href="#features-section"
            onClick={scrollToFeatures}
            className="home-footer__link"
            id="footer-features"
          >
            {language === 'vi' ? 'Tính năng & Kiến trúc' : 'Features'}
          </a>
          <Link
            to="/explore"
            className="home-footer__link"
            id="footer-community"
          >
            {language === 'vi' ? 'Showcase cộng đồng' : 'Community Showcase'}
          </Link>
          {isAuthenticated ? (
            <Link to={`/${user?.username}/dashboard`} className="home-footer__link" id="footer-dashboard">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="home-footer__link" id="footer-login">
                {tr.footer.links.login}
              </Link>
              <Link
                to="/register"
                className="home-footer__link"
                id="footer-register"
              >
                {tr.footer.links.register}
              </Link>
            </>
          )}
        </div>

        {/* Col 3: Legal */}
        <div className="home-footer__col" id="footer-legal">
          <h4 className="home-footer__col-title">{tr.footer.legal}</h4>
          <Link to="/explore" className="home-footer__link" id="footer-terms">
            {language === 'vi' ? 'Khám phá Portfolio' : 'Explore Portfolios'}
          </Link>
          <a
            href="https://github.com/hieurury/Headless-CMS-Portfolio-generate"
            target="_blank"
            rel="noopener noreferrer"
            className="home-footer__link"
            id="footer-privacy"
          >
            {language === 'vi' ? 'Mã nguồn Dự án' : 'Open Source Repo'}
          </a>
        </div>
      </div>

      <div className="home-footer__bottom">
        <span>{tr.footer.copyright}</span>
      </div>
    </footer>
  );
};
