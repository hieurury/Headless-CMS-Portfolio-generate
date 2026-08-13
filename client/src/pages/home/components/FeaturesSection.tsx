import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useUIStore } from '../../../store/uiStore';
import { t } from '../../../i18n';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface FeatureSlideConfig {
  imageSrc?: string;
  alt: string;
}

// 4 Core Feature slides image configurations (ready for user-provided images)
const FEATURE_SLIDES: FeatureSlideConfig[] = [
  {
    imageSrc: '/landing/editor.png',
    alt: 'Visual Block Builder',
  },
  {
    imageSrc: '/landing/ai_generate.png',
    alt: 'AI Generator',
  },
  {
    imageSrc: '/landing/post.png',
    alt: 'Dynamic Post Types & REST API',
  },
  {
    imageSrc: '/landing/category.png',
    alt: 'Showcase & Categories',
  },
];

export const FeaturesSection: React.FC = () => {
  const { language } = useUIStore();
  const tr = t(language);
  const [activeSlide, setActiveSlide] = useState(0);
  const [imgErrorMap, setImgErrorMap] = useState<Record<number, boolean>>({});
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
  }, [total]);

  // Animate slide change
  useEffect(() => {
    if (!sliderRef.current) return;
    gsap.fromTo(
      sliderRef.current,
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' },
    );
  }, [activeSlide]);

  // GSAP ScrollTrigger
  useEffect(() => {
    if (!sectionRef.current || !textRef.current) return;
    gsap.fromTo(
      textRef.current,
      { x: -40, opacity: 0 },
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
      { x: 40, opacity: 0 },
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

  const feature = features[activeSlide] || features[0];
  const slide = FEATURE_SLIDES[activeSlide] || { alt: feature.name };
  const hasImage = Boolean(slide.imageSrc) && !imgErrorMap[activeSlide];

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
            <div className="features-slide__img">
              {hasImage ? (
                <img
                  src={slide.imageSrc}
                  alt={slide.alt || feature.name}
                  className="features-slide__image"
                  onError={() => setImgErrorMap((prev) => ({ ...prev, [activeSlide]: true }))}
                />
              ) : (
                <div className="features-slide__placeholder">
                  <div className="features-slide__placeholder-icon">
                    <ImageIcon size={40} />
                  </div>
                  <p className="features-slide__placeholder-title">{feature.name}</p>
                  <span className="features-slide__placeholder-hint">
                    {language === 'vi' ? 'Sẽ hiển thị hình ảnh mô tả' : 'Feature image preview'}
                  </span>
                </div>
              )}
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
