import React, { useState } from 'react';
import { GripVertical, ChevronRight, Plus, Trash2, Eye, Settings } from 'lucide-react';
import { CSS } from '@dnd-kit/utilities';
import type { LayoutSection } from '../../../core/types/layout.types';
import { componentRegistry } from '../../../core/registry/ComponentRegistry';
import clsx from 'clsx';
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
  useSortable,
} from '@dnd-kit/sortable';

// ─── Colour palette per category ─────────────────────────────────────────────

const CAT_COLOR: Record<string, { dot: string; bg: string; text: string }> = {
  navigation: { dot: 'bg-sky-400',     bg: 'bg-sky-500/10',    text: 'text-sky-400' },
  layout:     { dot: 'bg-violet-400',  bg: 'bg-violet-500/10', text: 'text-violet-400' },
  content:    { dot: 'bg-emerald-400', bg: 'bg-emerald-500/10',text: 'text-emerald-400' },
  form:       { dot: 'bg-amber-400',   bg: 'bg-amber-500/10',  text: 'text-amber-400' },
  media:      { dot: 'bg-pink-400',    bg: 'bg-pink-500/10',   text: 'text-pink-400' },
  block:      { dot: 'bg-indigo-400',  bg: 'bg-indigo-500/10', text: 'text-indigo-400' },
};

const getColor = (cat?: string) => CAT_COLOR[cat ?? ''] ?? CAT_COLOR.block;

/**
 * Filter out null/undefined gaps and legacy _colpad placeholders.
 * Columns blocks may contain null entries for index-alignment.
 */
const validChildren = (children: LayoutSection[] | undefined): LayoutSection[] =>
  (children ?? []).filter((c): c is LayoutSection => !!c && c.type !== '_colpad');

// ─── Shared interface for child-related props ─────────────────────────────────

interface ChildNodeSharedProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onReorderChildren: (parentId: string, oldIndex: number, newIndex: number) => void;
}

// ─── SortableChildrenList — owns the DndContext for its children ──────────────
/**
 * Separate component so that hooks (useSensors) are called at component
 * top level — not inside conditionals or render loops.
 */
const SortableChildrenList: React.FC<{
  parentId: string;
  children: LayoutSection[];
  depth: number;
  indent: number;
} & ChildNodeSharedProps> = ({
  parentId,
  children,
  depth,
  indent,
  selectedId,
  onSelect,
  onDelete,
  onAddChild,
  onReorderChildren,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const valid = validChildren(children);
    const oldIndex = valid.findIndex((c) => c.id === active.id);
    const newIndex = valid.findIndex((c) => c.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorderChildren(parentId, oldIndex, newIndex);
    }
  };

  const valid = validChildren(children);

  return (
    <div className="relative">
      {/* Vertical guide line */}
      <div
        className="absolute top-0 bottom-0 w-px bg-white/6"
        style={{ left: `${Math.max(6, indent) + 16}px` }}
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={valid.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-0.5 mt-0.5">
            {valid.map((child) => (
              <LayerNode
                key={child.id}
                section={child}
                depth={depth + 1}
                selectedId={selectedId}
                onSelect={onSelect}
                onDelete={onDelete}
                onAddChild={onAddChild}
                onReorderChildren={onReorderChildren}
                isSortable
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

// ─── Individual draggable node ────────────────────────────────────────────────


interface LayerNodeProps {
  section: LayoutSection;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onReorderChildren: (parentId: string, oldIndex: number, newIndex: number) => void;
  /** If set, this node is sortable within its parent */
  isSortable?: boolean;
}

const LayerNode: React.FC<LayerNodeProps> = ({
  section,
  depth,
  selectedId,
  onSelect,
  onDelete,
  onAddChild,
  onReorderChildren,
  isSortable = false,
}) => {
  const entry = componentRegistry.getEntry(section.type);
  const color = getColor(entry?.category);
  const isContainer = entry?.isContainer ?? false;
  const visibleChildren = validChildren(section.children);
  const hasChildren = visibleChildren.length > 0;
  const isSelected = selectedId === section.id;
  const [expanded, setExpanded] = useState(true);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id, disabled: !isSortable });

  const style = isSortable
    ? { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
    : undefined;

  const indent = depth * 14;


  return (
    <div ref={isSortable ? setNodeRef : undefined} style={style} className="w-full">
      {/* ── Row ─────────────────────────────────────────────────── */}
      <div
        className={clsx(
          'group flex items-center gap-1 rounded-lg py-1 pr-1 cursor-pointer transition-all duration-150',
          isSelected
            ? 'bg-indigo-500/15 text-white'
            : 'text-slate-400 hover:bg-white/5 hover:text-white',
          isDragging && 'shadow-xl shadow-black/40',
        )}
        style={{ paddingLeft: `${Math.max(6, indent)}px` }}
        onClick={() => onSelect(section.id)}
      >
        {/* Drag handle */}
        {isSortable && (
          <button
            {...attributes}
            {...listeners}
            className="p-0.5 text-slate-700 hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0 touch-none opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={12} />
          </button>
        )}

        {/* Tree connector for non-sortable children */}
        {!isSortable && depth > 0 && (
          <div className="w-3 shrink-0 flex items-center justify-center">
            <div className="w-2 h-px bg-white/10" />
          </div>
        )}

        {/* Expand chevron */}
        {isContainer || hasChildren ? (
          <button
            className={clsx(
              'p-0.5 shrink-0 transition-transform duration-150',
              expanded ? 'rotate-90' : 'rotate-0',
              'text-slate-600 hover:text-slate-300',
            )}
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          >
            <ChevronRight size={12} />
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        {/* Icon */}
        <span className={clsx('flex items-center justify-center w-5 h-5 rounded shrink-0', color.bg, color.text)}>
          {entry?.icon ?? <Settings size={11} />}
        </span>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <p className={clsx('text-xs font-medium truncate leading-tight', isSelected ? 'text-white' : '')}>
            {entry?.displayName ?? section.type}
          </p>
          {section.name && (
            <p className="text-[10px] text-indigo-400 font-mono truncate opacity-70">
              #{section.name}
            </p>
          )}
        </div>

        {/* Category dot */}
        <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0 opacity-60', color.dot)} />

        {/* Actions */}
        <div
          className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {isContainer && (
            <button
              title="Add block inside"
              onClick={() => onAddChild(section.id)}
              className="p-1 rounded text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
            >
              <Plus size={10} />
            </button>
          )}
          <button
            title="Remove"
            onClick={() => {
              if (confirm(`Remove "${entry?.displayName ?? section.type}"?`)) {
                onDelete(section.id);
              }
            }}
            className="p-1 rounded text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>

      {/* ── Children (sortable tree) ──────────────────────────────── */}
      {expanded && hasChildren && (
        <SortableChildrenList
          parentId={section.id}
          children={visibleChildren}
          depth={depth}
          indent={indent}
          selectedId={selectedId}
          onSelect={onSelect}
          onDelete={onDelete}
          onAddChild={onAddChild}
          onReorderChildren={onReorderChildren}
        />
      )}
    </div>
  );
};

// ─── LayersPanel ──────────────────────────────────────────────────────────────

interface LayersPanelProps {
  sections: LayoutSection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
  onAddChild: (parentId: string) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
  onReorderChildren: (parentId: string, oldIndex: number, newIndex: number) => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  sections,
  selectedId,
  onSelect,
  onDelete,
  onAddClick,
  onAddChild,
  onReorder,
  onReorderChildren,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) onReorder(oldIndex, newIndex);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Eye size={12} className="text-slate-600" />
          Layers
          <span className="text-slate-700 font-mono normal-case tracking-normal">{sections.length}</span>
        </span>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium transition-all"
        >
          <Plus size={11} /> Add
        </button>
      </div>

      {/* Empty state */}
      {sections.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-white/10 rounded-xl">
          <p className="text-xs text-slate-600">No sections yet</p>
        </div>
      )}

      {/* Tree (top-level sortable) */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.filter(Boolean).map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-0.5">
            {sections.filter(Boolean).map((section) => (
              <LayerNode
                key={section.id}
                section={section}
                depth={0}
                selectedId={selectedId}
                onSelect={onSelect}
                onDelete={onDelete}
                onAddChild={onAddChild}
                onReorderChildren={onReorderChildren}
                isSortable
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
