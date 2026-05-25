import React from 'react';

interface Skill { name: string; level?: number; icon?: string; }
interface SkillCategory { name: string; skills: Skill[]; }

interface SkillsProps {
  title?: string;
  subtitle?: string;
  categories?: SkillCategory[];
  [key: string]: unknown;
}

export const Skills: React.FC<SkillsProps> = ({
  title = 'Skills & Technologies',
  subtitle = 'Technologies I work with',
  categories = [],
}) => {
  return (
    <section className="section-padding bg-[#0d0d14]">
      <div className="container-max mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-indigo-400 tracking-widest uppercase mb-3">Expertise</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h2>
          {subtitle && <p className="text-slate-400 text-lg">{subtitle}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {categories.map((category) => (
            <div key={category.name} className="glass rounded-2xl p-6 space-y-5">
              <h3 className="text-lg font-semibold text-white border-b border-white/5 pb-3">
                {category.name}
              </h3>
              <div className="space-y-4">
                {category.skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-300 text-sm font-medium">{skill.name}</span>
                      {skill.level !== undefined && (
                        <span className="text-xs text-indigo-400 font-mono">{skill.level}%</span>
                      )}
                    </div>
                    {skill.level !== undefined && (
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000"
                          style={{ width: `${skill.level}%` }}
                        />
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
