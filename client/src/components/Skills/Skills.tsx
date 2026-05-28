import React from 'react';
import { getScheme, type ColorScheme } from '../../core/theme/colorSchemes';

interface Skill { name: string; level?: number; icon?: string; }
interface SkillCategory { name: string; skills: Skill[]; }

interface SkillsProps {
  title?: string;
  subtitle?: string;
  categories?: unknown[];
  layout?: 'progress' | 'grid' | 'tags' | 'compact';
  colorScheme?: ColorScheme;
  [key: string]: unknown;
}

function normalizeCategories(raw: unknown[]): SkillCategory[] {
  return (raw as SkillCategory[]).filter(c => c && typeof c === 'object' && c.name);
}

const TAG_ACCENTS: ColorScheme[] = ['indigo', 'violet', 'emerald', 'sky', 'amber'];

// ─── Layout: Progress Bars ─────────────────────────────────

const ProgressSkills: React.FC<SkillsProps> = ({ title = 'Skills & Technologies', subtitle, categories = [], colorScheme }) => {
  const s = getScheme(colorScheme);
  const cats = normalizeCategories(categories);

  return (
    <section className={`section-padding ${s.sectionBg}`}>
      <div className="container-max mx-auto">
        <div className="text-center mb-16">
          <p className={`text-sm font-semibold ${s.accent} tracking-widest uppercase mb-3`}>Expertise</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h2>
          {subtitle && <p className="text-slate-400 text-lg">{subtitle}</p>}
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {cats.map((cat) => (
            <div key={cat.name} className="glass rounded-2xl p-6 space-y-5">
              <h3 className={`text-lg font-semibold text-white border-b pb-3 border-white/5`}>{cat.name}</h3>
              <div className="space-y-4">
                {(cat.skills ?? []).map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-300 text-sm font-medium">{skill.name}</span>
                      {skill.level !== undefined && <span className={`text-xs ${s.accent} font-mono`}>{skill.level}%</span>}
                    </div>
                    {skill.level !== undefined && (
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${s.progressFrom} ${s.progressTo} transition-all duration-1000`} style={{ width: `${skill.level}%` }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Layout: Grid (icon cards) ─────────────────────────────

const GridSkills: React.FC<SkillsProps> = ({ title = 'Skills & Technologies', subtitle, categories = [], colorScheme }) => {
  const s = getScheme(colorScheme);
  const cats = normalizeCategories(categories);

  return (
    <section className={`section-padding ${s.sectionBg}`}>
      <div className="container-max mx-auto">
        <div className="text-center mb-16">
          <p className={`text-sm font-semibold ${s.accent} tracking-widest uppercase mb-3`}>Expertise</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h2>
          {subtitle && <p className="text-slate-400 text-lg">{subtitle}</p>}
        </div>
        {cats.map((cat) => (
          <div key={cat.name} className="mb-10">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">{cat.name}</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {(cat.skills ?? []).map((skill) => (
                <div key={skill.name} className="glass glass-hover rounded-xl p-4 text-center transition-all group">
                  {skill.icon
                    ? <img src={skill.icon} alt={skill.name} className="w-8 h-8 mx-auto mb-2 object-contain" />
                    : <div className={`w-8 h-8 mx-auto mb-2 rounded-lg ${s.accentBg} flex items-center justify-center ${s.accent} text-xs font-bold`}>{skill.name.slice(0, 2)}</div>
                  }
                  <p className="text-xs text-slate-400 group-hover:text-white transition-colors font-medium leading-tight">{skill.name}</p>
                  {skill.level !== undefined && (
                    <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${s.progressFrom} ${s.progressTo} rounded-full`} style={{ width: `${skill.level}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── Layout: Tags (badge cloud) ────────────────────────────

const TagsSkills: React.FC<SkillsProps> = ({ title = 'Skills & Technologies', subtitle, categories = [], colorScheme }) => {
  const s = getScheme(colorScheme);
  const cats = normalizeCategories(categories);

  return (
    <section className={`section-padding ${s.sectionBg}`}>
      <div className="container-max mx-auto">
        <div className="text-center mb-16">
          <p className={`text-sm font-semibold ${s.accent} tracking-widest uppercase mb-3`}>Expertise</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h2>
          {subtitle && <p className="text-slate-400 text-lg">{subtitle}</p>}
        </div>
        <div className="space-y-8">
          {cats.map((cat, ci) => {
            const tagS = getScheme(TAG_ACCENTS[ci % TAG_ACCENTS.length]);
            return (
              <div key={cat.name} className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="sm:w-36 shrink-0">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-widest">{cat.name}</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {(cat.skills ?? []).map((skill) => (
                    <span key={skill.name} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 ${tagS.tagClass}`}>
                      {skill.name}
                      {skill.level !== undefined && <span className="ml-1.5 opacity-60 text-xs">{skill.level}%</span>}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ─── Layout: Compact (3-col list) ──────────────────────────

const CompactSkills: React.FC<SkillsProps> = ({ title = 'Skills & Technologies', subtitle, categories = [], colorScheme }) => {
  const s = getScheme(colorScheme);
  const cats = normalizeCategories(categories);

  return (
    <section className="section-padding">
      <div className="container-max mx-auto">
        <div className="mb-12">
          <p className={`text-sm font-semibold ${s.accent} tracking-widest uppercase mb-2`}>Expertise</p>
          <h2 className="text-4xl font-bold text-white">{title}</h2>
          {subtitle && <p className="text-slate-400 mt-2">{subtitle}</p>}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {cats.map((cat) => (
            <div key={cat.name} className="space-y-2">
              <h3 className={`${s.accent} text-xs font-semibold uppercase tracking-widest pb-2 border-b ${s.accentBorder}`}>{cat.name}</h3>
              <div className="space-y-0">
                {(cat.skills ?? []).map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between py-1.5">
                    <span className="text-slate-300 text-sm">{skill.name}</span>
                    {skill.level !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${s.progressFrom} ${s.progressTo} rounded-full`} style={{ width: `${skill.level}%` }} />
                        </div>
                        <span className="text-xs text-slate-600 w-8 text-right font-mono">{skill.level}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Main Export ───────────────────────────────────────────

export const Skills: React.FC<SkillsProps> = (props) => {
  switch (props.layout) {
    case 'grid': return <GridSkills {...props} />;
    case 'tags': return <TagsSkills {...props} />;
    case 'compact': return <CompactSkills {...props} />;
    default: return <ProgressSkills {...props} />;
  }
};
