import React from 'react';
import { Calendar, MapPin } from 'lucide-react';

interface TimelineItemBlockProps {
  role?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  description?: string;
  highlights?: unknown[];
  /** Visual style */
  variant?: 'timeline' | 'card' | 'minimal';
  /** Accent color for the dot */
  accent?: 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose';
  /** Show timeline dot+line (only meaningful in list context) */
  showDot?: boolean;
  sectionId?: string;
  [key: string]: unknown;
}

const ACCENT_DOT: Record<string, string> = {
  indigo: 'bg-indigo-500 border-indigo-300/50 shadow-indigo-500/50',
  violet: 'bg-violet-500 border-violet-300/50 shadow-violet-500/50',
  emerald: 'bg-emerald-500 border-emerald-300/50 shadow-emerald-500/50',
  amber: 'bg-amber-500 border-amber-300/50 shadow-amber-500/50',
  rose: 'bg-rose-500 border-rose-300/50 shadow-rose-500/50',
};

const ACCENT_COMPANY: Record<string, string> = {
  indigo: 'text-indigo-400',
  violet: 'text-violet-400',
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  rose: 'text-rose-400',
};

function normalizeStringArray(arr: unknown[]): string[] {
  return arr
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && 'value' in item) {
        return String((item as Record<string, unknown>).value ?? '');
      }
      return '';
    })
    .filter(Boolean);
}

/**
 * TimelineItemBlock — A single timeline entry.
 * Can be used standalone or stacked inside a Row/Column to form a timeline list.
 */
export const TimelineItemBlock: React.FC<TimelineItemBlockProps> = ({
  role = 'Position Title',
  company = 'Company Name',
  startDate = '2022',
  endDate = 'Present',
  location,
  description,
  highlights = [],
  variant = 'card',
  accent = 'indigo',
  showDot = false,
  sectionId,
}) => {
  const dotClass = ACCENT_DOT[accent] ?? ACCENT_DOT.indigo;
  const companyClass = ACCENT_COMPANY[accent] ?? ACCENT_COMPANY.indigo;
  const normalizedHighlights = normalizeStringArray(highlights);

  const inner = (
    <>
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h3
            data-cms-field="role"
            className="text-lg font-bold text-white"
          >
            {role}
          </h3>
          <p
            data-cms-field="company"
            className={`font-semibold mt-0.5 ${companyClass}`}
          >
            {company}
          </p>
        </div>
        <div className="flex flex-col gap-1.5 text-sm text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} className="text-slate-600" />
            {startDate} — {endDate ?? 'Present'}
          </span>
          {location && (
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-slate-600" />
              {location}
            </span>
          )}
        </div>
      </div>

      {description && (
        <p
          data-cms-field="description"
          className="text-slate-400 text-sm leading-relaxed"
        >
          {description}
        </p>
      )}

      {normalizedHighlights.length > 0 && (
        <ul className="space-y-1.5">
          {normalizedHighlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
              <span className={`${companyClass} mt-1 shrink-0`}>▸</span>
              {h}
            </li>
          ))}
        </ul>
      )}
    </>
  );

  if (variant === 'minimal') {
    return (
      <div id={sectionId} className="flex gap-4 py-4 border-b border-white/5 last:border-0">
        {showDot && (
          <div className={`w-3 h-3 rounded-full mt-1.5 border-2 shadow-md flex-shrink-0 ${dotClass}`} />
        )}
        <div className="flex flex-col gap-2 flex-1">{inner}</div>
      </div>
    );
  }

  return (
    <div id={sectionId} className="flex gap-4">
      {showDot && (
        <div className="flex flex-col items-center pt-1.5">
          <div className={`w-4 h-4 rounded-full border-2 shadow-lg flex-shrink-0 ${dotClass}`} />
          <div className="flex-1 w-px bg-gradient-to-b from-indigo-500/30 to-transparent mt-1 min-h-[32px]" />
        </div>
      )}
      <div className="glass rounded-2xl p-5 md:p-6 space-y-3 flex-1 transition-all hover:bg-white/5">
        {inner}
      </div>
    </div>
  );
};
