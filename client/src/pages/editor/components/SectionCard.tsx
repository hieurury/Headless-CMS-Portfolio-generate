import React from 'react';
import { ArrowUp, ArrowDown, Trash2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { LayoutSection } from '../../../core/types/layout.types';
import { componentRegistry } from '../../../core/registry/ComponentRegistry';
import clsx from 'clsx';

const CATEGORY_COLORS: Record<string, string> = {
  navigation: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  layout: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  content: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  form: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  media: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  block: 'bg-[var(--color-accent)] text-[var(--color-bg)] font-semibold border-[var(--color-border)]',
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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'group flex items-center gap-2 p-2.5 rounded-md border cursor-pointer transition-all duration-200',
        isSelected
          ? 'border-[var(--color-border)] bg-[var(--color-accent)] text-[var(--color-bg)]'
          : 'border-[var(--color-border)] bg-white/2 hover:border-[var(--color-border)] hover:bg-[var(--color-surface-2)]',
        isDragging && 'shadow-2xl shadow-black/50',
      )}
      onClick={onSelect}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-1 text-slate-700 hover:text-[var(--color-text-muted)] cursor-grab active:cursor-grabbing shrink-0 touch-none"
        onClick={(e) => e.stopPropagation()}
        title="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>

      {/* Index */}
      <span className="w-4 text-xs text-[var(--color-text-faint)] font-mono text-center shrink-0">
        {index + 1}
      </span>

      {/* Icon + type badge */}
      <div className="flex items-center gap-1.5 shrink-0">
        {entry?.icon && <span className="text-sm leading-none">{entry.icon}</span>}
        <span
          className={clsx(
            'px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold border',
            colorClass,
          )}
        >
          {section.type}
        </span>
      </div>

      {/* Display name + anchor name */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--color-text)] truncate">
          {entry?.displayName ?? section.type}
        </p>
        {section.name && (
          <p className="text-[10px] text-[var(--color-text)] font-semibold font-mono mt-0.5 truncate">
            #{section.name}
          </p>
        )}
      </div>

      {/* Actions — shown on hover */}
      <div
        className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-1 rounded text-[var(--color-text-faint)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Move up"
        >
          <ArrowUp size={12} />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="p-1 rounded text-[var(--color-text-faint)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Move down"
        >
          <ArrowDown size={12} />
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete "${section.type}" section?`)) onDelete();
          }}
          className="p-1 rounded text-[var(--color-text-faint)] hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Delete section"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};
