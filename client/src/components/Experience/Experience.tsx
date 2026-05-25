import React from 'react';
import { MapPin, Calendar } from 'lucide-react';

interface Job {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description?: string;
  highlights?: string[];
  logo?: string;
  location?: string;
}

interface ExperienceProps {
  title?: string;
  jobs?: Job[];
  [key: string]: unknown;
}

export const Experience: React.FC<ExperienceProps> = ({
  title = 'Work Experience',
  jobs = [],
}) => {
  return (
    <section className="section-padding bg-[#0d0d14]">
      <div className="container-max mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-indigo-400 tracking-widest uppercase mb-3">Career</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">{title}</h2>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-violet-500/30 to-transparent hidden md:block" />

          <div className="space-y-8">
            {jobs.map((job, i) => (
              <div key={i} className="md:pl-20 relative">
                {/* Timeline dot */}
                <div className="absolute left-6 top-6 w-4 h-4 rounded-full bg-indigo-500 border-2 border-indigo-300/50 shadow-lg shadow-indigo-500/50 hidden md:block" />

                <div className="glass glass-hover rounded-2xl p-6 space-y-4 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-white">{job.role}</h3>
                      <p className="text-indigo-400 font-semibold mt-1">{job.company}</p>
                    </div>
                    <div className="flex flex-col gap-1.5 text-sm text-slate-500 shrink-0">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-indigo-500" />
                        {job.startDate} — {job.endDate ?? 'Present'}
                      </span>
                      {job.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-indigo-500" />
                          {job.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {job.description && (
                    <p className="text-slate-400 text-sm leading-relaxed">{job.description}</p>
                  )}

                  {job.highlights && job.highlights.length > 0 && (
                    <ul className="space-y-2">
                      {job.highlights.map((h, hi) => (
                        <li key={hi} className="flex items-start gap-2 text-sm text-slate-400">
                          <span className="text-indigo-400 mt-1 shrink-0">▸</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
