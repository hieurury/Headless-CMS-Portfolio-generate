import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useUIStore } from '../../../store/uiStore';
import { t } from '../../../i18n';


gsap.registerPlugin(ScrollTrigger);

export const Footer: React.FC = () => {
  const { language } = useUIStore();
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

  return (
    <footer ref={footerRef} id="home-footer" className="home-footer">
      <div className="home-footer__inner">
        {/* Col 1: Brand */}
        <div className="home-footer__brand">
          <div className="home-footer__logo">
            <span className="home-navbar__logo-mark">◆</span>
            <span className="home-navbar__logo-text">CMS Portfolio</span>
          </div>
          <p className="home-footer__tagline">{tr.footer.tagline}</p>
          {/* Socials */}
          <div className="home-footer__socials" id="footer-socials">
            <a
              id="footer-github"
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="home-footer__social-link"
              aria-label="GitHub"
            >
              {/* GitHub icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </a>
            <a
              id="footer-twitter"
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="home-footer__social-link"
              aria-label="Twitter / X"
            >
              {/* X / Twitter icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.738l7.73-8.835L1.254 2.25H8.08l4.713 5.894 5.45-5.894zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a
              id="footer-linkedin"
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="home-footer__social-link"
              aria-label="LinkedIn"
            >
              {/* LinkedIn icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Col 2: Navigation */}
        <div className="home-footer__col" id="footer-nav">
          <h4 className="home-footer__col-title">{tr.footer.nav}</h4>
          <Link to="/docs" className="home-footer__link" id="footer-docs">{tr.footer.links.docs}</Link>
          <Link to="/explore" className="home-footer__link" id="footer-community">{tr.footer.links.community}</Link>
          <Link to="/login" className="home-footer__link" id="footer-login">{tr.footer.links.login}</Link>
          <Link to="/register" className="home-footer__link" id="footer-register">{tr.footer.links.register}</Link>
        </div>

        {/* Col 3: Legal */}
        <div className="home-footer__col" id="footer-legal">
          <h4 className="home-footer__col-title">{tr.footer.legal}</h4>
          <a href="/terms" className="home-footer__link" id="footer-terms">{tr.footer.terms}</a>
          <a href="/privacy" className="home-footer__link" id="footer-privacy">{tr.footer.privacy}</a>
        </div>
      </div>

      <div className="home-footer__bottom">
        <span>{tr.footer.copyright}</span>
      </div>
    </footer>
  );
};
