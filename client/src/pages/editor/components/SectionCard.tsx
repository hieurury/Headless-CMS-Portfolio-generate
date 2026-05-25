import React from 'react';
import { ArrowUp, ArrowDown, Trash2, ChevronRight } from 'lucide-react';
import type { LayoutSection } from '../../../core/types/layout.types';
import { componentRegistry } from '../../../core/registry/ComponentRegistry';
import clsx from 'clsx';

const CATEGORY_COLORS: Record<string, string> = {
  navigation: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  layout: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  content: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  form: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  media: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
};

interface SectionCardProps {
  section: LayoutSection;
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  section,
  index,
  total,
  isSelected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
}) => {
  const entry = componentRegistry.getAll().find((e) => e.type === section.type);
  const colorClass =
    CATEGORY_COLORS[entry?.category ?? 'content'] ?? CATEGORY_COLORS.content;

  return (
    <div
      className={clsx(
        'group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200',
        isSelected
          ? 'border-indigo-500/50 bg-indigo-500/10'
          : 'border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/5',
      )}
      onClick={onSelect}
    >
      {/* Index */}
      <span className="w-5 text-xs text-slate-600 font-mono text-center shrink-0">
        {index + 1}
      </span>

      {/* Type badge */}
      <span
        className={clsx(
          'px-2 py-0.5 rounded-md text-xs font-mono font-semibold border',
          colorClass,
        )}
      >
        {section.type}
      </span>

      {/* Display name */}
      <span className="flex-1 text-sm text-slate-300 truncate min-w-0">
        {entry?.displayName ?? section.type}
      </span>

      <ChevronRight
        size={14}
        className={clsx(
          'transition-colors shrink-0',
          isSelected ? 'text-indigo-400' : 'text-slate-600',
        )}
      />

      {/* Actions — shown on hover */}
      <div
        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Move up"
        >
          <ArrowUp size={13} />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Move down"
        >
          <ArrowDown size={13} />
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete "${section.type}" section?`)) onDelete();
          }}
          className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Delete section"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};
