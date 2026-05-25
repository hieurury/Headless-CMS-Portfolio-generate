import React from 'react';
import { ExternalLink, Link2, Star } from 'lucide-react';

interface Project {
  name: string;
  description: string;
  image?: string;
  tags?: string[];
  demoUrl?: string;
  githubUrl?: string;
  featured?: boolean;
}

interface ProjectsProps {
  title?: string;
  subtitle?: string;
  projects?: Project[];
  columns?: 2 | 3 | 4;
  [key: string]: unknown;
}

export const Projects: React.FC<ProjectsProps> = ({
  title = 'My Projects',
  subtitle = 'Things I have built',
  projects = [],
  columns = 3,
}) => {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <section className="section-padding">
      <div className="container-max mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-indigo-400 tracking-widest uppercase mb-3">Work</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h2>
          {subtitle && <p className="text-slate-400 text-lg">{subtitle}</p>}
        </div>

        <div className={`grid gap-6 ${gridCols}`}>
          {projects.map((project) => (
            <article
              key={project.name}
              className="glass glass-hover rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10"
            >
              {/* Image / Placeholder */}
              <div className="h-48 bg-gradient-to-br from-indigo-900/40 to-violet-900/30 relative overflow-hidden">
                {project.image ? (
                  <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-6xl opacity-30">{'</>'}</div>
                  </div>
                )}
                {project.featured && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium">
                    <Star size={10} fill="currentColor" /> Featured
                  </div>
                )}
              </div>

              <div className="p-5 space-y-3">
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {project.name}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                  {project.description}
                </p>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-full text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Links */}
                <div className="flex gap-3 pt-2">
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <ExternalLink size={14} /> Live Demo
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      <Link2 size={14} /> Code
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
