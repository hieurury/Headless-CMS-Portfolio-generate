import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useUIStore } from '../../../store/uiStore';
import { t } from '../../../i18n';
import { ChevronLeft, ChevronRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Mock feature slide images (placeholder SVG data)
const FEATURE_IMAGES = [
  {
    bg: '#1a1a1a',
    illustration: (
      <svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg">
        {/* Drag & Drop Editor illustration */}
        <rect x="20" y="20" width="360" height="220" rx="6" fill="#242424" stroke="#333" strokeWidth="1"/>
        <rect x="40" y="40" width="100" height="180" rx="4" fill="#1a1a1a" stroke="#333" strokeWidth="1"/>
        <rect x="50" y="55" width="80" height="12" rx="2" fill="#3a3a3a"/>
        <rect x="50" y="75" width="60" height="8" rx="2" fill="#2f2f2f"/>
        <rect x="50" y="90" width="70" height="8" rx="2" fill="#2f2f2f"/>
        <rect x="50" y="110" width="80" height="12" rx="2" fill="#3a3a3a"/>
        <rect x="50" y="130" width="55" height="8" rx="2" fill="#2f2f2f"/>
        <rect x="50" y="145" width="65" height="8" rx="2" fill="#2f2f2f"/>
        <rect x="50" y="165" width="80" height="12" rx="2" fill="#3a3a3a"/>
        <rect x="50" y="185" width="50" height="8" rx="2" fill="#2f2f2f"/>
        {/* Canvas area */}
        <rect x="155" y="40" width="205" height="180" rx="4" fill="#1e1e1e"/>
        {/* Content blocks on canvas */}
        <rect x="170" y="55" width="175" height="30" rx="3" fill="#2a2a2a" stroke="#383838" strokeWidth="1"/>
        <text x="185" y="75" fill="#666" fontSize="11" fontFamily="monospace">Heading Block</text>
        <rect x="170" y="95" width="175" height="50" rx="3" fill="#2a2a2a" stroke="#383838" strokeWidth="1"/>
        <text x="185" y="115" fill="#666" fontSize="10" fontFamily="monospace">Text Block</text>
        <rect x="170" y="155" width="84" height="50" rx="3" fill="#2a2a2a" stroke="#383838" strokeWidth="1"/>
        <rect x="262" y="155" width="83" height="50" rx="3" fill="#2a2a2a" stroke="#383838" strokeWidth="1"/>
        {/* Drag handle dots */}
        <circle cx="163" cy="70" r="2" fill="#555"/>
        <circle cx="163" cy="120" r="2" fill="#555"/>
        <circle cx="163" cy="180" r="2" fill="#555"/>
        {/* Active selection */}
        <rect x="170" y="95" width="175" height="50" rx="3" fill="none" stroke="#888" strokeWidth="1.5" strokeDasharray="3,3"/>
      </svg>
    ),
  },
  {
    bg: '#181818',
    illustration: (
      <svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg">
        {/* API illustration */}
        <rect x="20" y="20" width="360" height="220" rx="6" fill="#1e1e1e" stroke="#2a2a2a" strokeWidth="1"/>
        {/* Terminal header */}
        <rect x="20" y="20" width="360" height="28" rx="6" fill="#252525"/>
        <circle cx="38" cy="34" r="5" fill="#ff5f57"/>
        <circle cx="54" cy="34" r="5" fill="#febc2e"/>
        <circle cx="70" cy="34" r="5" fill="#28c840"/>
        <text x="40" y="65" fill="#888" fontSize="10" fontFamily="monospace">GET /api/v1/portfolios</text>
        <rect x="32" y="75" width="340" height="1" fill="#2a2a2a"/>
        <text x="40" y="95" fill="#666" fontSize="9" fontFamily="monospace">Authorization: Bearer eyJhbGci...</text>
        <text x="40" y="115" fill="#666" fontSize="9" fontFamily="monospace">Content-Type: application/json</text>
        <rect x="32" y="130" width="340" height="1" fill="#2a2a2a"/>
        <text x="40" y="150" fill="#555" fontSize="9" fontFamily="monospace">{"{"}</text>
        <text x="52" y="165" fill="#777" fontSize="9" fontFamily="monospace">"status": 200,</text>
        <text x="52" y="178" fill="#777" fontSize="9" fontFamily="monospace">"data": [ ... ],</text>
        <text x="52" y="191" fill="#777" fontSize="9" fontFamily="monospace">"total": 42</text>
        <text x="40" y="204" fill="#555" fontSize="9" fontFamily="monospace">{"}"}</text>
        {/* Status badge */}
        <rect x="320" y="55" width="48" height="18" rx="3" fill="#1a3a1a"/>
        <text x="334" y="68" fill="#5a9" fontSize="10" fontFamily="monospace">200 OK</text>
      </svg>
    ),
  },
  {
    bg: '#161616',
    illustration: (
      <svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg">
        {/* Multi-language illustration */}
        <rect x="20" y="20" width="360" height="220" rx="6" fill="#1c1c1c" stroke="#2a2a2a" strokeWidth="1"/>
        {/* Browser header */}
        <rect x="20" y="20" width="360" height="32" rx="6" fill="#222"/>
        <rect x="60" y="28" width="220" height="16" rx="3" fill="#2a2a2a"/>
        <text x="75" y="40" fill="#555" fontSize="9" fontFamily="monospace">https://portfolio.cms/vi/about</text>
        {/* Flag circles */}
        <circle cx="340" cy="36" r="8" fill="#1a3050"/>
        <text x="336" y="40" fill="#aac" fontSize="8">VI</text>
        {/* Page content */}
        <rect x="40" y="65" width="140" height="16" rx="2" fill="#282828"/>
        <text x="48" y="78" fill="#666" fontSize="11">Giới thiệu</text>
        <rect x="40" y="90" width="300" height="8" rx="2" fill="#222"/>
        <rect x="40" y="105" width="260" height="8" rx="2" fill="#222"/>
        <rect x="40" y="120" width="280" height="8" rx="2" fill="#222"/>
        {/* Language toggle */}
        <rect x="40" y="150" width="100" height="28" rx="4" fill="#242424" stroke="#333" strokeWidth="1"/>
        <rect x="40" y="150" width="50" height="28" rx="4" fill="#333"/>
        <text x="55" y="169" fill="#e0e0e0" fontSize="11">VI</text>
        <text x="107" y="169" fill="#666" fontSize="11">EN</text>
        {/* Second language */}
        <rect x="40" y="195" width="300" height="8" rx="2" fill="#1e1e1e"/>
        <text x="40" y="205" fill="#444" fontSize="9" fontFamily="monospace">Auto-detected · 12 languages supported</text>
      </svg>
    ),
  },
  {
    bg: '#181818',
    illustration: (
      <svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg">
        {/* Community illustration */}
        <rect x="20" y="20" width="360" height="220" rx="6" fill="#1c1c1c" stroke="#2a2a2a" strokeWidth="1"/>
        {/* Grid of portfolio cards */}
        {[0,1,2,3,4,5].map((i) => (
          <g key={i}>
            <rect x={32 + (i % 3) * 122} y={35 + Math.floor(i / 3) * 103} width="110" height="90" rx="4" fill="#222" stroke="#2a2a2a" strokeWidth="1"/>
            <rect x={32 + (i % 3) * 122} y={35 + Math.floor(i / 3) * 103} width="110" height="48" rx="4" fill="#1a1a1a"/>
            <circle cx={48 + (i % 3) * 122} cy={96 + Math.floor(i / 3) * 103} r="8" fill="#2a2a2a"/>
            <rect x={62 + (i % 3) * 122} y={90 + Math.floor(i / 3) * 103} width="60" height="7" rx="2" fill="#2f2f2f"/>
            <rect x={62 + (i % 3) * 122} y={102 + Math.floor(i / 3) * 103} width="40" height="5" rx="2" fill="#262626"/>
            <rect x={32 + (i % 3) * 122} y={112 + Math.floor(i / 3) * 103} width="110" height="1" fill="#252525"/>
            <rect x={40 + (i % 3) * 122} y={117 + Math.floor(i / 3) * 103} width="70" height="5" rx="2" fill="#2a2a2a"/>
          </g>
        ))}
      </svg>
    ),
  },
];

export const FeaturesSection: React.FC = () => {
  const { language } = useUIStore();
  const tr = t(language);
  const [activeSlide, setActiveSlide] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const features = tr.features.items;
  const total = features.length;

  const goNext = () => setActiveSlide((prev) => (prev + 1) % total);
  const goPrev = () => setActiveSlide((prev) => (prev - 1 + total) % total);

  // Auto-play
  useEffect(() => {
    autoPlayRef.current = setInterval(goNext, 10000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate slide change
  useEffect(() => {
    if (!sliderRef.current) return;
    gsap.fromTo(
      sliderRef.current,
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' },
    );
  }, [activeSlide]);

  // GSAP ScrollTrigger
  useEffect(() => {
    if (!sectionRef.current || !textRef.current) return;
    gsap.fromTo(
      textRef.current,
      { x: -50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          once: true,
        },
      },
    );
    gsap.fromTo(
      sliderRef.current,
      { x: 50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          once: true,
        },
      },
    );
  }, []);

  const feature = features[activeSlide];
  const img = FEATURE_IMAGES[activeSlide];

  return (
    <section ref={sectionRef} id="features-section" className="features-section">
      <div className="features-section__inner">
        {/* Left: text */}
        <div ref={textRef} className="features-text">
          <span className="section-label" id="features-label">{tr.features.sectionLabel}</span>
          <h2 className="features-title" id="features-title">{tr.features.title}</h2>
          <p className="features-subtitle">{tr.features.subtitle}</p>

          {/* Feature content */}
          <div className="features-card" id="features-card">
            <h3 className="features-card__name">{feature.name}</h3>
            <p className="features-card__desc">{feature.description}</p>
            <div className="features-card__badges">
              {feature.badges.map((badge) => (
                <span key={badge} className="features-badge">{badge}</span>
              ))}
            </div>
          </div>

          {/* Slide dots */}
          <div className="features-dots" id="features-dots" aria-label="Slide indicators">
            {features.map((_, i) => (
              <button
                key={i}
                className={`features-dot ${i === activeSlide ? 'features-dot--active' : ''}`}
                onClick={() => setActiveSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right: slider */}
        <div className="features-slider">
          <div ref={sliderRef} className="features-slide" id="features-slide">
            <div
              className="features-slide__img"
              style={{ background: img.bg }}
            >
              {img.illustration}
            </div>
          </div>

          {/* Controls */}
          <div className="features-controls" id="features-controls">
            <button
              id="features-prev"
              className="features-ctrl-btn"
              onClick={() => {
                goPrev();
                if (autoPlayRef.current) {
                  clearInterval(autoPlayRef.current);
                  autoPlayRef.current = setInterval(goNext, 10000);
                }
              }}
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="features-counter">
              {String(activeSlide + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
            <button
              id="features-next"
              className="features-ctrl-btn"
              onClick={() => {
                goNext();
                if (autoPlayRef.current) {
                  clearInterval(autoPlayRef.current);
                  autoPlayRef.current = setInterval(goNext, 10000);
                }
              }}
              aria-label="Next slide"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
