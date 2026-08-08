import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { t } from '../../../i18n';
import { ArrowRight, Sparkles, Layers, Code, Globe2 } from 'lucide-react';

const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>
);

// ─── Particle Meteor Canvas ───────────────────────────────────────────────────
interface Meteor {
  x: number;
  y: number;
  len: number;
  speed: number;
  size: number;
  opacity: number;
  delay: number;
  active: boolean;
}

function initMeteors(count: number, w: number, h: number): Meteor[] {
  return Array.from({ length: count }, () => createMeteor(w, h, true));
}

function createMeteor(w: number, h: number, randomY = false): Meteor {
  return {
    x: Math.random() * w,
    y: randomY ? Math.random() * h - h : -Math.random() * 80,
    len: 60 + Math.random() * 100,
    speed: 1.5 + Math.random() * 2.5,
    size: 0.5 + Math.random() * 1,
    opacity: 0.3 + Math.random() * 0.5,
    delay: Math.random() * 3000,
    active: false,
  };
}

function useParticleCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>, theme: string) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let meteors: Meteor[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      meteors = initMeteors(22, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    // Stagger activate meteors
    meteors.forEach((m, i) => {
      setTimeout(() => {
        m.active = true;
      }, i * 200 + m.delay);
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      meteors.forEach((m) => {
        if (!m.active) return;

        // Angle: diagonal 30deg from vertical
        const angle = Math.PI / 6; // 30deg
        const dx = Math.sin(angle) * m.speed;
        const dy = Math.cos(angle) * m.speed;

        m.x += dx;
        m.y += dy;

        // Reset when out of view
        if (m.y > canvas.height + 50 || m.x > canvas.width + 50) {
          Object.assign(m, createMeteor(canvas.width, canvas.height));
          m.active = true;
          m.x = Math.random() * canvas.width * 0.6; // spawn on left side
        }

        // Draw meteor tail
        const tailX = m.x - Math.sin(angle) * m.len;
        const tailY = m.y - Math.cos(angle) * m.len;

        const isLight = theme === 'light';
        const rgbTail = isLight ? '100, 100, 100' : '200, 200, 200';
        const rgbHead = isLight ? '30, 30, 30' : '255, 255, 255';

        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, `rgba(${rgbTail}, 0)`);
        grad.addColorStop(0.6, `rgba(${rgbTail}, ${m.opacity * 0.4})`);
        grad.addColorStop(1, `rgba(${rgbHead}, ${m.opacity})`);

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = m.size;
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        // Head glow
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgbHead}, ${m.opacity})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef, theme]);
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
export const HeroSection: React.FC = () => {
  const { language, theme } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const tr = t(language);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const btnsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useParticleCanvas(canvasRef, theme);

  // GSAP entrance
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.4 });
    tl.fromTo(titleRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' })
      .fromTo(descRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.3')
      .fromTo(btnsRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.2')
      .fromTo(statsRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.2');
  }, []);

  return (
    <section id="hero-section" className="hero-section">
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />

      {/* Radial vignette */}
      <div className="hero-vignette" aria-hidden="true" />

      {/* Content */}
      <div ref={contentRef} className="hero-content">

        <h1 ref={titleRef} className="hero-title" id="hero-title">
          {tr.hero.title}
          <br />
          <span className="hero-title__accent">{tr.hero.titleAccent}</span>
        </h1>

        <p ref={descRef} className="hero-desc" id="hero-desc">
          {tr.hero.description}
        </p>

        <div ref={btnsRef} className="hero-btns" id="hero-btns">
          <a
            id="hero-btn-source"
            href="https://github.com/hieurury/Headless-CMS-Portfolio-generate"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-btn hero-btn--outline"
          >
            <GithubIcon />
            {tr.hero.btnSource}
          </a>
          <Link
            id="hero-btn-start"
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="hero-btn hero-btn--primary"
          >
            {isAuthenticated ? (language === 'vi' ? 'Vào Dashboard' : 'Open Dashboard') : tr.hero.btnStart}
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Real Stats & Capability Pills */}
        <div ref={statsRef} className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8 pt-6 border-t border-[var(--home-border)] text-xs font-mono text-[var(--home-text-muted)] max-w-2xl mx-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--home-border)] bg-[var(--home-surface-2)]">
            <Globe2 size={13} className="text-sky-400" />
            <span>{tr.hero.stats?.categories || '20+ Ngành nghề'}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--home-border)] bg-[var(--home-surface-2)]">
            <Layers size={13} className="text-violet-400" />
            <span>{tr.hero.stats?.blocks || '10+ Khối giao diện'}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--home-border)] bg-[var(--home-surface-2)]">
            <Sparkles size={13} className="text-emerald-400" />
            <span>{tr.hero.stats?.ai || 'Tích hợp Gemini AI'}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--home-border)] bg-[var(--home-surface-2)]">
            <Code size={13} className="text-amber-400" />
            <span>{tr.hero.stats?.customizable || '100% Tùy biến'}</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll-indicator" aria-hidden="true">
        <div className="hero-scroll-indicator__line" />
      </div>
    </section>
  );
};
