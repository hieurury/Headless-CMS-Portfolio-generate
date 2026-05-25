import React from 'react';
import { Plus, Layers } from 'lucide-react';
import { SectionCard } from './SectionCard';
import type { LayoutSection } from '../../../core/types/layout.types';

interface SectionListProps {
  sections: LayoutSection[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDelete: (index: number) => void;
  onAddClick: () => void;
}

export const SectionList: React.FC<SectionListProps> = ({
  sections,
  selectedIndex,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
  onAddClick,
}) => {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-300">
            Sections
            <span className="ml-1.5 text-xs text-slate-600">({sections.length})</span>
          </span>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium transition-all hover:shadow-md hover:shadow-indigo-500/20"
        >
          <Plus size={13} /> Add
        </button>
      </div>

      {/* Empty state */}
      {sections.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-white/10 rounded-xl">
          <Layers size={28} className="text-slate-600 mb-3" />
          <p className="text-sm text-slate-500">No sections yet</p>
          <p className="text-xs text-slate-600 mt-1">Use AI Generate or Add to get started</p>
        </div>
      )}

      {/* Section cards */}
      {sections.map((section, index) => (
        <SectionCard
          key={section.id}
          section={section}
          index={index}
          total={sections.length}
          isSelected={selectedIndex === index}
          onSelect={() => onSelect(index)}
          onMoveUp={() => onMoveUp(index)}
          onMoveDown={() => onMoveDown(index)}
          onDelete={() => onDelete(index)}
        />
      ))}
    </div>
  );
};
