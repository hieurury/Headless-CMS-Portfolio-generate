import React, { useState, useEffect, useRef } from 'react';
import {
  GripVertical,
  ChevronRight,
  Plus,
  Trash2,
  Eye,
  Settings,
} from 'lucide-react';
import { CSS } from '@dnd-kit/utilities';
import type { LayoutSection } from '../../../core/types/layout.types';
import { componentRegistry } from '../../../core/registry/ComponentRegistry';
import { findParent, findSectionById } from '../../../core/utils/layoutUtils';
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
import { useUIStore } from '../../../store/uiStore';
import { t } from '../../../i18n';

// ─── Colour palette per category ─────────────────────────────────────────────

const CAT_COLOR: Record<string, { dot: string; bg: string; text: string }> = {
  navigation: {
    dot: 'bg-[var(--color-text)]/40',
    bg: 'bg-[var(--color-text)]/10',
    text: 'text-[var(--color-text)]',
  },
  layout: {
    dot: 'bg-[var(--color-text)]/40',
    bg: 'bg-[var(--color-text)]/10',
    text: 'text-[var(--color-text)]',
  },
  content: {
    dot: 'bg-[var(--color-text)]/40',
    bg: 'bg-[var(--color-text)]/10',
    text: 'text-[var(--color-text)]',
  },
  form: {
    dot: 'bg-[var(--color-text)]/40',
    bg: 'bg-[var(--color-text)]/10',
    text: 'text-[var(--color-text)]',
  },
  media: {
    dot: 'bg-[var(--color-text)]/40',
    bg: 'bg-[var(--color-text)]/10',
    text: 'text-[var(--color-text)]',
  },
  block: {
    dot: 'bg-[var(--color-text)]/40',
    bg: 'bg-[var(--color-text)]/10',
    text: 'text-[var(--color-text)]',
  },
};

const getColor = (cat?: string) => CAT_COLOR[cat ?? ''] ?? CAT_COLOR.block;

/**
 * Filter out null/undefined gaps and legacy _colpad placeholders.
 * Columns blocks may contain null entries for index-alignment.
 */
const validChildren = (
  children: LayoutSection[] | undefined,
): LayoutSection[] =>
  (children ?? []).filter(
    (c): c is LayoutSection => !!c && c.type !== '_colpad',
  );

// ─── Shared interface for child-related props ─────────────────────────────────

interface ChildNodeSharedProps {
  selectedIds: string[];
  onSelect: (id: string, multi?: boolean) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onReorderChildren: (
    parentId: string,
    oldIndex: number,
    newIndex: number,
  ) => void;
}

// ─── SortableChildrenList — owns the DndContext for its children ──────────────
/**
 * Separate component so that hooks (useSensors) are called at component
 * top level — not inside conditionals or render loops.
 */
const SortableChildrenList: React.FC<
  {
    children: LayoutSection[];
    depth: number;
    indent: number;
  } & ChildNodeSharedProps
> = ({
  children,
  depth,
  indent,
  selectedIds,
  onSelect,
  onDelete,
  onAddChild,
  onReorderChildren,
}) => {
  const valid = validChildren(children);

  return (
    <div className="relative">
      {/* Vertical guide line */}
      <div
        className="absolute top-0 bottom-0 w-px bg-white/6"
        style={{ left: `${Math.max(6, indent) + 16}px` }}
      />
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
              selectedIds={selectedIds}
              onSelect={onSelect}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onReorderChildren={onReorderChildren}
              isSortable
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

// ─── Individual draggable node ────────────────────────────────────────────────

interface LayerNodeProps {
  section: LayoutSection;
  depth: number;
  selectedIds: string[];
  onSelect: (id: string, multi?: boolean) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onReorderChildren: (
    parentId: string,
    oldIndex: number,
    newIndex: number,
  ) => void;
  /** If set, this node is sortable within its parent */
  isSortable?: boolean;
}

const LayerNode: React.FC<LayerNodeProps> = ({
  section,
  depth,
  selectedIds,
  onSelect,
  onDelete,
  onAddChild,
  onReorderChildren,
  isSortable = false,
}) => {
  const { language } = useUIStore();
  const tr = t(language).editor.layersPanel;
  const entry = componentRegistry.getEntry(section.type);
  const color = getColor(entry?.category);
  const isContainer = entry?.isContainer ?? false;
  const visibleChildren = validChildren(section.children);
  const hasChildren = visibleChildren.length > 0;
  const isSelected = selectedIds.includes(section.id);
  const [expanded, setExpanded] = useState(true);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected && nodeRef.current) {
      // scrollIntoView with block: 'nearest' avoids jumpy scrolling if already visible
      nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isSelected]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id, disabled: !isSortable });

  const setRefs = (node: HTMLDivElement | null) => {
    nodeRef.current = node;
    if (isSortable && setNodeRef) {
      setNodeRef(node);
    }
  };

  const style = isSortable
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }
    : undefined;

  const indent = depth * 14;

  return (
    <div ref={setRefs} style={style} className="w-full">
      {/* ── Row ─────────────────────────────────────────────────── */}
      <div
        className={clsx(
          'group flex items-center gap-1 rounded-md py-1 pr-1 cursor-pointer transition-all duration-150',
          isSelected
            ? 'bg-[var(--color-surface-2)] text-[var(--color-text)] font-semibold'
            : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]',
          isDragging && 'shadow-md shadow-black/40',
        )}
        style={{ paddingLeft: `${Math.max(6, indent)}px` }}
        onClick={(e) => onSelect(section.id, e.shiftKey || e.ctrlKey || e.metaKey)}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!selectedIds.includes(section.id)) {
            onSelect(section.id, false);
          }
          window.dispatchEvent(new CustomEvent('cms:openContextMenu', {
            detail: { sectionId: section.id, x: e.clientX, y: e.clientY }
          }));
        }}
      >
        {/* Drag handle */}
        {isSortable && (
          <button
            {...attributes}
            {...listeners}
            className="p-0.5 opacity-0 group-hover:opacity-50 hover:!opacity-100 cursor-grab active:cursor-grabbing shrink-0 touch-none transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={12} />
          </button>
        )}

        {/* Tree connector for non-sortable children */}
        {!isSortable && depth > 0 && (
          <div className="w-3 shrink-0 flex items-center justify-center">
            <div className="w-2 h-px bg-[var(--color-surface-2)] hover:brightness-110" />
          </div>
        )}

        {/* Expand chevron */}
        {isContainer || hasChildren ? (
          <button
            className={clsx(
              'p-0.5 shrink-0 transition-transform duration-150',
              expanded ? 'rotate-90' : 'rotate-0',
              'text-[var(--color-text-faint)] hover:text-[var(--color-text)]',
            )}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
          >
            <ChevronRight size={12} />
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        {/* Icon */}
        <span
          className={clsx(
            'flex items-center justify-center w-5 h-5 rounded shrink-0',
            color.bg,
            color.text,
          )}
        >
          {entry?.icon ?? <Settings size={11} />}
        </span>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate leading-tight">
            {entry?.displayName ?? section.type}
          </p>
          {section.name && (
            <p
              className={clsx(
                'text-[10px] font-semibold font-mono truncate opacity-70',
                !isSelected && 'text-[var(--color-text)]',
              )}
            >
              #{section.name}
            </p>
          )}
        </div>

        {/* Category dot */}
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full shrink-0 opacity-60',
            color.dot,
          )}
        />

        {/* Actions */}
        <div
          className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {isContainer && (
            <button
              title={tr.addBlockInside}
              onClick={() => onAddChild(section.id)}
              className="p-1 rounded text-[var(--color-text-faint)] hover:text-[var(--color-text)] font-semibold hover:bg-[var(--color-text)]/10 transition-all"
            >
              <Plus size={10} />
            </button>
          )}
          <button
            title={tr.remove}
            onClick={() => {
              if (
                confirm(
                  tr.removeConfirm.replace(
                    '{name}',
                    entry?.displayName ?? section.type,
                  ),
                )
              ) {
                onDelete(section.id);
              }
            }}
            className="p-1 rounded text-[var(--color-text-faint)] hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>

      {/* ── Children (sortable tree) ──────────────────────────────── */}
      {expanded && hasChildren && (
        <SortableChildrenList
          children={visibleChildren}
          depth={depth}
          indent={indent}
          selectedIds={selectedIds}
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

export const LayersPanel: React.FC<{
  sections: LayoutSection[];
  selectedIds: string[];
  onSelect: (id: string, multi?: boolean) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
  onAddChild: (parentId: string) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
  onReorderChildren: (
    parentId: string,
    oldIndex: number,
    newIndex: number,
  ) => void;
  onMoveToContainer: (
    sectionId: string,
    toContainerId: string | null,
    toIndex?: number,
  ) => void;
  onReplaceEmptySlot: (sectionId: string, slotId: string) => void;
}> = ({
  sections,
  selectedIds,
  onSelect,
  onDelete,
  onAddClick,
  onAddChild,
  onReorder,
  onReorderChildren,
  onMoveToContainer,
  onReplaceEmptySlot,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeParentInfo = findParent(sections, activeId);
    const overParentInfo = findParent(sections, overId);

    if (!activeParentInfo || !overParentInfo) return;

    const activeParentId = activeParentInfo.parent?.id ?? null;
    const overParentId = overParentInfo.parent?.id ?? null;

    if (activeParentId === overParentId) {
      // Same parent
      if (activeParentId === null) {
        const oldIndex = sections.findIndex((s) => s.id === activeId);
        const newIndex = sections.findIndex((s) => s.id === overId);
        if (oldIndex !== -1 && newIndex !== -1) onReorder(oldIndex, newIndex);
      } else {
        const parent = activeParentInfo.parent!;
        const valid = validChildren(parent.children);
        const oldIndex = valid.findIndex((c) => c.id === activeId);
        const newIndex = valid.findIndex((c) => c.id === overId);
        if (oldIndex !== -1 && newIndex !== -1)
          onReorderChildren(activeParentId, oldIndex, newIndex);
      }
    } else {
      // Different parents -> move cross-container
      const targetSection = findSectionById(sections, overId);
      if (targetSection?.type === '_empty') {
        onReplaceEmptySlot(activeId, overId);
        return;
      }

      const newIdx =
        overParentId === null
          ? sections.findIndex((s) => s.id === overId)
          : validChildren(overParentInfo.parent!.children).findIndex(
              (c) => c.id === overId,
            );

      onMoveToContainer(activeId, overParentId, Math.max(0, newIdx));
    }
  };

  const { language } = useUIStore();
  const tr = t(language).editor.layersPanel;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
          <Eye size={12} className="text-[var(--color-text-faint)]" />
          {tr.title}
          <span className="text-slate-700 font-mono normal-case tracking-normal">
            {sections.length}
          </span>
        </span>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--color-text)]/10 text-[var(--color-text)] hover:bg-[var(--color-text)]/20 text-xs font-medium transition-all"
        >
          <Plus size={11} /> {tr.add}
        </button>
      </div>

      {/* Empty state */}
      {sections.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-[var(--color-border)] rounded-md">
          <p className="text-xs text-[var(--color-text-faint)]">
            {tr.emptyState}
          </p>
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
                selectedIds={selectedIds}
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
