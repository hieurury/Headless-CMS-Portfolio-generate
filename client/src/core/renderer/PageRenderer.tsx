import React, { useState } from 'react';
import type { PageLayout } from '../types/layout.types';
import { SectionRenderer, isDropId, fromDropId, EMPTY_SLOT_TYPE, COL_CELL_PREFIX } from './SectionRenderer';
import { useEditorContext } from '../context/EditorContext';
import {
  DndContext,
  closestCenter,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { findParent, findSectionById, isDescendant } from '../utils/layoutUtils';

interface PageRendererProps {
  layout: PageLayout;
  className?: string;
}

/**
 * Custom collision detection.
 *
 * Priority:
 *   1. ColCell droppables (empty column cells — most specific)
 *   2. _empty slot droppables
 *   3. Regular container droppables
 *   4. Fallback: closestCenter for sortable reordering
 */
function customCollisionDetection(args: Parameters<typeof pointerWithin>[0]) {
  const pointerCollisions = pointerWithin(args);

  // Priority 1: ColCell drop zones (empty Columns cells)
  const colCellCollisions = pointerCollisions.filter(
    (c) => typeof c.id === 'string' && isDropId(c.id as string) &&
      fromDropId(c.id as string).startsWith(COL_CELL_PREFIX),
  );
  if (colCellCollisions.length > 0) return colCellCollisions;

  // Priority 2: _empty slot droppables (innermost, most specific)
  const emptySlotCollisions = pointerCollisions.filter(
    (c) => typeof c.id === 'string' && isDropId(c.id as string) &&
      fromDropId(c.id as string).startsWith('_empty'),
  );
  if (emptySlotCollisions.length > 0) return emptySlotCollisions;

  // Priority 3: Regular container droppables
  const containerCollisions = pointerCollisions.filter(
    (c) => typeof c.id === 'string' && isDropId(c.id as string),
  );
  if (containerCollisions.length > 0) return containerCollisions;

  return closestCenter(args);
}

/**
 * PageRenderer — renders layout sections in editor or production mode.
 *
 * In editor mode: wraps in a single DndContext that handles:
 * - Top-level section reorder
 * - Child reorder within a container
 * - Cross-container moves (drag from anywhere → drop into a container)
 * - Replace _empty slot when something is dragged onto it
 *
 * DragOverlay renders a live clone of the active block while dragging
 * so the original stays visible as a dimmed ghost at its source position.
 */
export const PageRenderer: React.FC<PageRendererProps> = ({
  layout,
  className = '',
}) => {
  const {
    isEditorMode,
    sections,
    onSectionReorder,
    onMoveToContainer,
    onReorderChildren,
    onReplaceEmptySlot,
  } = useEditorContext();

  // Track which section is being dragged so DragOverlay can clone it
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (!layout?.sections?.length && !isEditorMode) return null;

  const activeSection = activeId ? findSectionById(sections, activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Reject drop if trying to drop a section into itself or its descendants
    const targetIdCheck = isDropId(overId) ? fromDropId(overId).split(':')[0].replace(COL_CELL_PREFIX, '') : overId;
    if (isDescendant(layout.sections, activeId, targetIdCheck)) {
      return;
    }

    // ── Case 1: Dropped onto a droppable zone ─────────────────────────────────
    if (isDropId(overId)) {
      const targetId = fromDropId(overId);

      // Sub-case A: Dropped onto a ColCell drop zone (empty column cell)
      // targetId format: `_colcell-<columnsId>:<cellIndex>`
      if (targetId.startsWith(COL_CELL_PREFIX)) {
        const rest = targetId.slice(COL_CELL_PREFIX.length); // "<columnsId>:<cellIndex>"
        const colonIdx = rest.lastIndexOf(':');
        const columnsId = rest.slice(0, colonIdx);
        const cellIndex = parseInt(rest.slice(colonIdx + 1), 10);
        if (activeId !== columnsId) {
          onMoveToContainer(activeId, columnsId, cellIndex);
        }
        return;
      }

      // Sub-case B: Dropped onto an _empty slot → REPLACE the slot
      if (targetId.startsWith('_empty')) {
        if (activeId !== targetId) {
          onReplaceEmptySlot(activeId, targetId);
        }
        return;
      }

      // Sub-case C: Dropped into a real container → move inside it
      if (activeId !== targetId) {
        onMoveToContainer(activeId, targetId);
      }
      return;
    }

    // ── Case 2: Dropped onto a sortable item (not a droppable zone) ───
    const activeParentInfo = findParent(sections, activeId);
    const overParentInfo   = findParent(sections, overId);

    if (!activeParentInfo || !overParentInfo) return;

    const activeParentId = activeParentInfo.parent?.id ?? null;
    const overParentId   = overParentInfo.parent?.id ?? null;

    if (activeParentId === overParentId) {
      // Same parent → reorder (top-level or within a container)
      if (activeParentId === null) {
        // Top-level
        const oldIdx = sections.findIndex((s) => s.id === activeId);
        const newIdx = sections.findIndex((s) => s.id === overId);
        if (oldIdx !== -1 && newIdx !== -1) onSectionReorder(oldIdx, newIdx);
      } else {
        // Within a container — skip if the target is an _empty slot
        const targetSection = findSectionById(sections, overId);
        if (targetSection?.type === EMPTY_SLOT_TYPE) {
          onReplaceEmptySlot(activeId, overId);
          return;
        }
        const parent = activeParentInfo.parent!;
        const oldIdx = parent.children?.findIndex((c) => c.id === activeId) ?? -1;
        const newIdx = parent.children?.findIndex((c) => c.id === overId) ?? -1;
        if (oldIdx !== -1 && newIdx !== -1) {
          if (parent.type === 'columns') {
            const currentSpans = (parent.props.colSpans as number[]) || Array(Number(parent.props.columns || 2)).fill(1);
            const reorderedSpans = arrayMove(currentSpans, oldIdx, newIdx);
            const reorderedChildren = arrayMove(parent.children || [], oldIdx, newIdx);
            window.dispatchEvent(
              new CustomEvent('cms:reorderColCells', {
                detail: { columnsId: parent.id, children: reorderedChildren, colSpans: reorderedSpans },
              }),
            );
            return;
          }
          onReorderChildren(activeParentId!, oldIdx, newIdx);
        }
      }
    } else {
      // Different parent — only valid cross-container move is via an explicit _empty slot.
      const targetSection = findSectionById(sections, overId);
      if (targetSection?.type === EMPTY_SLOT_TYPE) {
        onReplaceEmptySlot(activeId, overId);
      }
    }
  };

  if (!isEditorMode) {
    return (
      <div className={`page-renderer ${className}`}>
        {layout.sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      {/* Top-level sortable context */}
      <SortableContext
        items={layout.sections.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={`page-renderer ${className}`}>
          {layout.sections.map((section) => (
            <SectionRenderer key={section.id} section={section} isRoot={true} />
          ))}
        </div>
      </SortableContext>

      {/*
        DragOverlay — renders a live clone of the dragged block.
        - dropAnimation: smooth snap-back if dropped in invalid zone.
        - The original block remains at source with reduced opacity (handled
          by useSortable's isDragging style in SectionRenderer).
        - We render SectionRenderer in non-editor / non-draggable mode so
          the clone looks identical but has no interactive chrome.
      */}
      <DragOverlay
        dropAnimation={{
          duration: 180,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}
      >
        {activeSection ? (
          <div
            style={{
              opacity: 0.92,
              borderRadius: 12,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1.5px rgba(99,102,241,0.5)',
              pointerEvents: 'none',
              transform: 'scale(1.02)',
              transformOrigin: 'top left',
            }}
          >
            <SectionRenderer section={activeSection} isChild />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
