import React from 'react';
import { GraduationCap } from 'lucide-react';

interface EducationEntry {
  institution: string;
  degree: string;
  field?: string;
  startYear?: string;
  endYear?: string;
  gpa?: string;
  description?: string;
  logo?: string;
}

interface EducationProps {
  title?: string;
  entries?: EducationEntry[];
  [key: string]: unknown;
}

export const Education: React.FC<EducationProps> = ({
  title = 'Education',
  entries = [],
}) => {
  return (
    <section className="section-padding">
      <div className="container-max mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-indigo-400 tracking-widest uppercase mb-3">Background</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">{title}</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {entries.map((entry, i) => (
            <div key={i} className="glass glass-hover rounded-2xl p-6 space-y-3 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  {entry.logo ? (
                    <img src={entry.logo} alt={entry.institution} className="w-8 h-8 object-contain" />
                  ) : (
                    <GraduationCap size={22} className="text-indigo-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{entry.institution}</h3>
                  <p className="text-indigo-400 text-sm font-medium">
                    {entry.degree}{entry.field ? ` · ${entry.field}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span>{entry.startYear} — {entry.endYear ?? 'Present'}</span>
                {entry.gpa && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <span>GPA: {entry.gpa}</span>
                  </>
                )}
              </div>

              {entry.description && (
                <p className="text-slate-400 text-sm">{entry.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
