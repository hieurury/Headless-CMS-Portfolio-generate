import React from 'react';
import { Plus, Layers } from 'lucide-react';
import { useUIStore } from '../../../store/uiStore';
import { t } from '../../../i18n';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
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
  onReorder: (oldIndex: number, newIndex: number) => void;
}

export const SectionList: React.FC<SectionListProps> = ({
  sections,
  selectedIndex,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
  onAddClick,
  onReorder,
}) => {
  const { language } = useUIStore();
  const tr = t(language).editor.sectionList;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(oldIndex, newIndex);
    }
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-[var(--color-text-muted)]" />
          <span className="text-sm font-medium text-[var(--color-text)]">
            {tr.header}
            <span className="ml-1.5 text-xs text-[var(--color-text-faint)]">
              ({sections.length})
            </span>
          </span>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[var(--color-accent)] text-[var(--color-bg)]/80 hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] text-xs font-medium transition-all hover:shadow-md hover:shadow-black/10"
        >
          <Plus size={13} /> {tr.add}
        </button>
      </div>

      {/* Empty state */}
      {sections.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-[var(--color-border)] rounded-md">
          <Layers size={28} className="text-[var(--color-text-faint)] mb-3" />
          <p className="text-sm text-[var(--color-text-faint)]">
            {tr.noSections}
          </p>
          <p className="text-xs text-[var(--color-text-faint)] mt-1">
            {tr.emptyHint}
          </p>
        </div>
      )}

      {/* Drag-and-drop section cards */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
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
        </SortableContext>
      </DndContext>
    </div>
  );
};
