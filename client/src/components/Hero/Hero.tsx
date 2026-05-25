import React from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';

interface HeroProps {
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  backgroundImage?: string;
  alignment?: 'left' | 'center' | 'right';
  [key: string]: unknown;
}

export const Hero: React.FC<HeroProps> = ({
  heading = "Hi, I'm a Developer",
  subheading = 'Building beautiful digital experiences',
  ctaLabel = 'View My Work',
  ctaHref = '#projects',
  secondaryCtaLabel,
  secondaryCtaHref = '#contact',
  alignment = 'center',
}) => {
  const alignClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[alignment];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className={`container-max px-6 mx-auto flex flex-col ${alignClass} gap-8 py-24 animate-slide-up`}>
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-indigo-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          Available for opportunities
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-bold leading-tight max-w-4xl">
          <span className="text-white">{heading.split(' ').slice(0, -1).join(' ')} </span>
          <span className="gradient-text">{heading.split(' ').slice(-1)}</span>
        </h1>

        {/* Subheading */}
        {subheading && (
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
            {subheading}
          </p>
        )}

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 mt-2" style={{ justifyContent: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start' }}>
          {ctaLabel && (
            <a
              href={ctaHref}
              className="group flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white font-semibold hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-105"
            >
              {ctaLabel}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </a>
          )}
          {secondaryCtaLabel && (
            <a
              href={secondaryCtaHref}
              className="flex items-center gap-2 px-6 py-3 rounded-xl glass glass-hover text-white font-semibold transition-all duration-300"
            >
              {secondaryCtaLabel}
            </a>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 flex flex-col items-center gap-2 text-slate-600 animate-bounce">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown size={16} />
        </div>
      </div>
    </section>
  );
};
