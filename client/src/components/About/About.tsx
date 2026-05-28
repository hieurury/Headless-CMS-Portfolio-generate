import React from 'react';
import { CheckCircle } from 'lucide-react';
import { getScheme, type ColorScheme } from '../../core/theme/colorSchemes';

interface AboutProps {
  title?: string;
  bio?: string;
  profileImage?: string;
  highlights?: unknown[];
  imagePosition?: 'left' | 'right';
  layout?: 'image-side' | 'centered' | 'stats' | 'minimal';
  colorScheme?: ColorScheme;
  [key: string]: unknown;
}

function normalizeStringArray(arr: unknown[]): string[] {
  return arr.map((item) => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object' && 'value' in item)
      return String((item as Record<string, unknown>).value ?? '');
    return '';
  }).filter(Boolean);
}

// ─── Layout: Image Side ────────────────────────────────────

const ImageSideAbout: React.FC<AboutProps> = ({
  title = 'About Me', bio = '', profileImage, highlights = [], imagePosition = 'right', colorScheme,
}) => {
  const s = getScheme(colorScheme);
  const normalized = normalizeStringArray(highlights);

  const content = (
    <div className="flex-1 space-y-6">
      <p className={`text-sm font-semibold ${s.accent} tracking-widest uppercase`}>About</p>
      <h2 className="text-4xl md:text-5xl font-bold text-white">{title}</h2>
      <p className="text-slate-400 text-lg leading-relaxed">{bio}</p>
      {normalized.length > 0 && (
        <ul className="space-y-3">
          {normalized.map((h, i) => (
            <li key={i} className="flex items-center gap-3 text-slate-300">
              <CheckCircle size={18} className={`${s.accent} shrink-0`} /> {h}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const image = (
    <div className="flex-1 flex justify-center">
      <div className="relative">
        <div className={`absolute inset-0 rounded-2xl ${s.glowColor} blur-2xl scale-110`} />
        {profileImage
          ? <img src={profileImage} alt="Profile" className="relative w-72 h-72 md:w-80 md:h-80 object-cover rounded-2xl border border-white/10" />
          : (
            <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-2xl glass flex items-center justify-center">
              <div className="text-8xl select-none">👨‍💻</div>
            </div>
          )
        }
      </div>
    </div>
  );

  return (
    <section className="section-padding">
      <div className="container-max mx-auto">
        <div className={`flex flex-col md:flex-row gap-16 items-center ${imagePosition === 'left' ? 'md:flex-row-reverse' : ''}`}>
          {content} {image}
        </div>
      </div>
    </section>
  );
};

// ─── Layout: Centered ──────────────────────────────────────

const CenteredAbout: React.FC<AboutProps> = ({
  title = 'About Me', bio = '', profileImage, highlights = [], colorScheme,
}) => {
  const s = getScheme(colorScheme);
  const normalized = normalizeStringArray(highlights);

  return (
    <section className="section-padding">
      <div className="container-max mx-auto max-w-3xl text-center">
        {profileImage && (
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className={`absolute inset-0 rounded-full ${s.glowColor} blur-xl scale-110`} />
              <img src={profileImage} alt="Profile" className={`relative w-32 h-32 object-cover rounded-full border-2 ${s.accentBorder}`} />
            </div>
          </div>
        )}
        <p className={`text-sm font-semibold ${s.accent} tracking-widest uppercase mb-3`}>About</p>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">{title}</h2>
        <p className="text-slate-400 text-xl leading-relaxed mb-10">{bio}</p>
        {normalized.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center">
            {normalized.map((h, i) => (
              <span key={i} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-slate-300 text-sm`}>
                <CheckCircle size={14} className={s.accent} /> {h}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ─── Layout: Stats ─────────────────────────────────────────

const STAT_EMOJIS = ['🏆', '🚀', '💡', '⚡', '🎯', '🌟', '✨', '🔥'];

const StatsAbout: React.FC<AboutProps> = ({
  title = 'About Me', bio = '', profileImage, highlights = [], imagePosition = 'right', colorScheme,
}) => {
  const s = getScheme(colorScheme);
  const normalized = normalizeStringArray(highlights);

  return (
    <section className="section-padding">
      <div className="container-max mx-auto space-y-16">
        <div className={`flex flex-col md:flex-row gap-16 items-center ${imagePosition === 'left' ? 'md:flex-row-reverse' : ''}`}>
          <div className="flex-1 space-y-5">
            <p className={`text-sm font-semibold ${s.accent} tracking-widest uppercase`}>About</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white">{title}</h2>
            <p className="text-slate-400 text-lg leading-relaxed">{bio}</p>
          </div>
          <div className="flex-shrink-0">
            {profileImage
              ? <img src={profileImage} alt="Profile" className="w-64 h-64 object-cover rounded-2xl border border-white/10" />
              : <div className="w-64 h-64 rounded-2xl glass flex items-center justify-center"><div className="text-7xl">👨‍💻</div></div>
            }
          </div>
        </div>
        {normalized.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {normalized.map((h, i) => (
              <div key={i} className={`glass rounded-2xl p-5 text-center border border-white/5 hover:${s.accentBorder} transition-all`}>
                <div className="text-2xl mb-2">{STAT_EMOJIS[i % STAT_EMOJIS.length]}</div>
                <p className="text-slate-300 text-sm leading-snug">{h}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ─── Layout: Minimal ──────────────────────────────────────

const MinimalAbout: React.FC<AboutProps> = ({
  title = 'About Me', bio = '', highlights = [], colorScheme,
}) => {
  const s = getScheme(colorScheme);
  const normalized = normalizeStringArray(highlights);

  return (
    <section className="section-padding">
      <div className="container-max mx-auto max-w-4xl">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <p className={`text-sm font-mono ${s.accent} mb-4`}>// about me</p>
            <h2 className="text-5xl font-black text-white leading-tight mb-2">{title}</h2>
            <div className={`w-16 h-1 bg-gradient-to-r ${s.gradientBgFrom} ${s.gradientBgTo} rounded mb-8`} />
            <p className="text-slate-400 text-lg leading-relaxed">{bio}</p>
          </div>
          {normalized.length > 0 && (
            <div className="space-y-0 pt-2">
              {normalized.map((h, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
                  <span className={`${s.accent} font-mono text-sm w-8 shrink-0`}>{String(i + 1).padStart(2, '0')}.</span>
                  <span className="text-slate-300 text-sm">{h}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// ─── Main Export ───────────────────────────────────────────

export const About: React.FC<AboutProps> = (props) => {
  switch (props.layout) {
    case 'centered': return <CenteredAbout {...props} />;
    case 'stats': return <StatsAbout {...props} />;
    case 'minimal': return <MinimalAbout {...props} />;
    default: return <ImageSideAbout {...props} />;
  }
};
