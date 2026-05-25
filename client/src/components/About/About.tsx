import React from 'react';
import { CheckCircle } from 'lucide-react';

interface AboutProps {
  title?: string;
  bio?: string;
  profileImage?: string;
  highlights?: string[];
  imagePosition?: 'left' | 'right';
  [key: string]: unknown;
}

export const About: React.FC<AboutProps> = ({
  title = 'About Me',
  bio = '',
  profileImage,
  highlights = [],
  imagePosition = 'right',
}) => {
  const content = (
    <div className="flex-1 space-y-6">
      <div>
        <p className="text-sm font-semibold text-indigo-400 tracking-widest uppercase mb-3">About</p>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{title}</h2>
      </div>
      <p className="text-slate-400 text-lg leading-relaxed">{bio}</p>
      {highlights.length > 0 && (
        <ul className="space-y-3">
          {highlights.map((h, i) => (
            <li key={i} className="flex items-center gap-3 text-slate-300">
              <CheckCircle size={18} className="text-indigo-400 shrink-0" />
              {h}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const image = profileImage ? (
    <div className="flex-1 flex justify-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-2xl scale-110" />
        <img
          src={profileImage}
          alt="Profile"
          className="relative w-72 h-72 md:w-80 md:h-80 object-cover rounded-2xl border border-white/10"
        />
      </div>
    </div>
  ) : (
    <div className="flex-1 flex justify-center">
      <div className="relative w-72 h-72 md:w-80 md:h-80">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-violet-600/20 blur-xl" />
        <div className="relative w-full h-full rounded-2xl glass flex items-center justify-center">
          <div className="text-8xl select-none">👨‍💻</div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="section-padding">
      <div className="container-max mx-auto">
        <div className={`flex flex-col md:flex-row gap-16 items-center ${imagePosition === 'left' ? 'md:flex-row-reverse' : ''}`}>
          {content}
          {image}
        </div>
      </div>
    </section>
  );
};
