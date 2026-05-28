import React from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { getScheme, type ColorScheme } from '../../core/theme/colorSchemes';

interface HeroProps {
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  backgroundImage?: string;
  alignment?: 'left' | 'center' | 'right';
  layout?: 'fullscreen' | 'split' | 'minimal' | 'centered-card';
  badge?: string;
  colorScheme?: ColorScheme;
  [key: string]: unknown;
}

function handleSmoothScroll(e: React.MouseEvent, href: string | undefined) {
  if (!href) return;
  if (href.startsWith('#')) {
    e.preventDefault();
    document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }
}

// ─── Shared CTA row ────────────────────────────────────────

const CTAButtons: React.FC<
  Pick<HeroProps, 'ctaLabel' | 'ctaHref' | 'secondaryCtaLabel' | 'secondaryCtaHref' | 'colorScheme'> & { justify?: string }
> = ({ ctaLabel, ctaHref, secondaryCtaLabel, secondaryCtaHref, colorScheme, justify = 'center' }) => {
  const s = getScheme(colorScheme);
  return (
    <div className="flex flex-wrap gap-4" style={{ justifyContent: justify }}>
      {ctaLabel && (
        <a
          href={ctaHref}
          data-cms-field="ctaLabel"
          onClick={(e) => handleSmoothScroll(e, ctaHref)}
          className={`group flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${s.gradientBgFrom} ${s.gradientBgTo} text-white font-semibold hover:shadow-xl ${s.buttonShadow} transition-all duration-300 hover:scale-105`}
        >
          {ctaLabel}
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </a>
      )}
      {secondaryCtaLabel && (
        <a
          href={secondaryCtaHref}
          data-cms-field="secondaryCtaLabel"
          onClick={(e) => handleSmoothScroll(e, secondaryCtaHref)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl glass glass-hover text-white font-semibold transition-all duration-300"
        >
          {secondaryCtaLabel}
        </a>
      )}
    </div>
  );
};

// ─── Gradient heading split ────────────────────────────────

const GradientHeading: React.FC<{ heading: string; colorScheme?: ColorScheme; size?: string }> = ({
  heading, colorScheme, size = 'text-5xl md:text-7xl',
}) => {
  const s = getScheme(colorScheme);
  const words = heading.split(' ');
  const last = words.slice(-1).join(' ');
  const rest = words.slice(0, -1).join(' ');
  return (
    <h1 data-cms-field="heading" className={`${size} font-bold leading-tight max-w-4xl`}>
      <span className="text-white">{rest} </span>
      <span className={`bg-gradient-to-r ${s.gradientFrom} ${s.gradientVia} ${s.gradientTo} scheme-gradient-text`}>
        {last}
      </span>
    </h1>
  );
};

// ─── Layout: Fullscreen ────────────────────────────────────

const FullscreenHero: React.FC<HeroProps> = ({
  heading = "Hi, I'm a Developer", subheading, ctaLabel, ctaHref,
  secondaryCtaLabel, secondaryCtaHref, alignment = 'center', badge, colorScheme,
}) => {
  const s = getScheme(colorScheme);
  const alignClass = { left: 'text-left items-start', center: 'text-center items-center', right: 'text-right items-end' }[alignment] ?? 'text-center items-center';
  const justify = alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start';

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full ${s.glowColor} blur-[120px]`} />
        <div className={`absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full ${s.glow2Color} blur-[100px]`} />
      </div>
      <div className="absolute inset-0 grid-pattern opacity-100 pointer-events-none" />

      <div className={`container-max px-6 mx-auto flex flex-col ${alignClass} gap-8 py-24 animate-slide-up`}>
        {badge && (
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm ${s.accent} font-medium`}>
            <span className={`w-2 h-2 rounded-full ${s.pulseClass} animate-pulse`} />
            {badge}
          </div>
        )}
        <GradientHeading heading={heading} colorScheme={colorScheme} />
        {subheading && (
          <p data-cms-field="subheading" className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
            {subheading}
          </p>
        )}
        <CTAButtons ctaLabel={ctaLabel} ctaHref={ctaHref} secondaryCtaLabel={secondaryCtaLabel} secondaryCtaHref={secondaryCtaHref} colorScheme={colorScheme} justify={justify} />
        <div className="mt-16 flex flex-col items-center gap-2 text-slate-600 animate-bounce">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown size={16} />
        </div>
      </div>
    </section>
  );
};

// ─── Layout: Split ─────────────────────────────────────────

const SplitHero: React.FC<HeroProps> = ({
  heading = "Hi, I'm a Developer", subheading, ctaLabel, ctaHref,
  secondaryCtaLabel, secondaryCtaHref, badge, colorScheme,
}) => {
  const s = getScheme(colorScheme);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l ${s.glowColor} to-transparent`} />
        <div className={`absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full ${s.glow2Color} blur-[100px]`} />
      </div>

      <div className="container-max px-6 mx-auto grid md:grid-cols-2 gap-12 items-center py-24">
        <div className="flex flex-col gap-7 animate-slide-up">
          {badge && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm ${s.accent} font-medium w-fit`}>
              <span className={`w-2 h-2 rounded-full ${s.pulseClass} animate-pulse`} /> {badge}
            </div>
          )}
          <GradientHeading heading={heading} colorScheme={colorScheme} size="text-5xl md:text-6xl" />
          {subheading && (
            <p data-cms-field="subheading" className="text-lg text-slate-400 leading-relaxed">
              {subheading}
            </p>
          )}
          <CTAButtons ctaLabel={ctaLabel} ctaHref={ctaHref} secondaryCtaLabel={secondaryCtaLabel} secondaryCtaHref={secondaryCtaHref} colorScheme={colorScheme} justify="flex-start" />
        </div>

        <div className="hidden md:flex items-center justify-center relative animate-slide-left">
          <div className="relative w-80 h-80">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${s.gradientBgFrom} ${s.gradientBgTo} opacity-15 blur-3xl`} />
            <div className="relative w-full h-full rounded-3xl glass border border-white/10 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)`, backgroundSize: '20px 20px' }} />
              <div className="text-center p-8 relative z-10">
                <div className="text-7xl mb-4">👨‍💻</div>
                <div className="flex gap-2 justify-center flex-wrap">
                  {['React', 'TypeScript', 'Node.js'].map(t => (
                    <span key={t} className={`px-3 py-1 rounded-full text-xs font-medium ${s.tagClass}`}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Layout: Minimal ───────────────────────────────────────

const MinimalHero: React.FC<HeroProps> = ({
  heading = "Hi, I'm a Developer", subheading, ctaLabel, ctaHref,
  secondaryCtaLabel, secondaryCtaHref, badge, colorScheme,
}) => {
  const s = getScheme(colorScheme);

  return (
    <section className="relative py-32 md:py-48 overflow-hidden">
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent ${s.dividerVia} to-transparent pointer-events-none`} />
      <div className="container-max px-6 mx-auto max-w-4xl animate-slide-up">
        {badge && (
          <p className={`${s.accent} text-sm font-mono mb-6 tracking-wider`}>// {badge}</p>
        )}
        <h1 data-cms-field="heading" className="text-6xl md:text-8xl font-black text-white leading-[0.9] mb-8 tracking-tight">
          {heading}
        </h1>
        <div className={`h-1 w-24 bg-gradient-to-r ${s.gradientBgFrom} ${s.gradientBgTo} rounded mb-8`} />
        {subheading && (
          <p data-cms-field="subheading" className="text-xl text-slate-400 max-w-xl leading-relaxed mb-10">
            {subheading}
          </p>
        )}
        <CTAButtons ctaLabel={ctaLabel} ctaHref={ctaHref} secondaryCtaLabel={secondaryCtaLabel} secondaryCtaHref={secondaryCtaHref} colorScheme={colorScheme} justify="flex-start" />
      </div>
    </section>
  );
};

// ─── Layout: Centered Card ─────────────────────────────────

const CenteredCardHero: React.FC<HeroProps> = ({
  heading = "Hi, I'm a Developer", subheading, ctaLabel, ctaHref,
  secondaryCtaLabel, secondaryCtaHref, badge, colorScheme,
}) => {
  const s = getScheme(colorScheme);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 py-24">
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute inset-0 bg-gradient-to-br ${s.glowColor} via-transparent ${s.glow2Color}`} />
      </div>
      <div className="relative max-w-2xl w-full glass rounded-3xl p-10 md:p-14 text-center space-y-7 border border-white/10 shadow-2xl animate-scale-in">
        <div className={`absolute -top-px left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent ${s.dividerVia} to-transparent`} />
        {badge && (
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${s.accentBg} ${s.accentBorder} border text-sm ${s.accent} font-medium`}>
            <span className={`w-2 h-2 rounded-full ${s.pulseClass} animate-pulse`} /> {badge}
          </div>
        )}
        <GradientHeading heading={heading} colorScheme={colorScheme} size="text-4xl md:text-6xl" />
        {subheading && (
          <p data-cms-field="subheading" className="text-slate-400 text-lg leading-relaxed">
            {subheading}
          </p>
        )}
        <CTAButtons ctaLabel={ctaLabel} ctaHref={ctaHref} secondaryCtaLabel={secondaryCtaLabel} secondaryCtaHref={secondaryCtaHref} colorScheme={colorScheme} />
      </div>
    </section>
  );
};

// ─── Main Export ───────────────────────────────────────────

export const Hero: React.FC<HeroProps> = (props) => {
  switch (props.layout) {
    case 'split': return <SplitHero {...props} />;
    case 'minimal': return <MinimalHero {...props} />;
    case 'centered-card': return <CenteredCardHero {...props} />;
    default: return <FullscreenHero {...props} />;
  }
};
