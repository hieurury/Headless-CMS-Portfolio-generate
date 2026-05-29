import React from 'react';
import type { PageLayout } from '../types/layout.types';
import { SectionRenderer, isDropId, fromDropId, EMPTY_SLOT_TYPE } from './SectionRenderer';
import { useEditorContext } from '../context/EditorContext';
import {
  DndContext,
  closestCenter,
  pointerWithin,
  type DragEndEvent,
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
} from '@dnd-kit/sortable';
import { findParent, findSectionById } from '../utils/layoutUtils';

interface PageRendererProps {
  layout: PageLayout;
  className?: string;
}

/**
 * Custom collision detection.
 *
 * Priority:
 *   1. _empty slot droppables (innermost, most specific) — so dragging over an
 *      empty slot highlights IT, not its ancestor container.
 *   2. Regular container droppables.
 *   3. Fallback: closestCenter for sortable reordering.
 */
function customCollisionDetection(args: Parameters<typeof pointerWithin>[0]) {
  const pointerCollisions = pointerWithin(args);

  // Split drop-id collisions into _empty-slot vs regular container
  const emptySlotCollisions = pointerCollisions.filter(
    (c) => typeof c.id === 'string' && isDropId(c.id as string) &&
      fromDropId(c.id as string).startsWith('_empty'),
  );
  if (emptySlotCollisions.length > 0) return emptySlotCollisions;

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (!layout?.sections?.length && !isEditorMode) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // ── Case 1: Dropped onto a droppable zone ─────────────────────────
    if (isDropId(overId)) {
      const targetId = fromDropId(overId);

      // Sub-case A: Dropped onto an _empty slot → REPLACE the slot
      // (not move-to-container, since _empty is not a real container)
      if (targetId.startsWith('_empty')) {
        if (activeId !== targetId) {
          onReplaceEmptySlot(activeId, targetId);
        }
        return;
      }

      // Sub-case B: Dropped into a real container → move inside it
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
        // (that case is handled by Case 1; if we reach here it means the
        //  _empty slot was the nearest sortable item, not its droppable zone)
        const targetSection = findSectionById(sections, overId);
        if (targetSection?.type === EMPTY_SLOT_TYPE) {
          // Treat as replace
          onReplaceEmptySlot(activeId, overId);
          return;
        }
        const parent = activeParentInfo.parent!;
        const oldIdx = parent.children?.findIndex((c) => c.id === activeId) ?? -1;
        const newIdx = parent.children?.findIndex((c) => c.id === overId) ?? -1;
        if (oldIdx !== -1 && newIdx !== -1) onReorderChildren(activeParentId!, oldIdx, newIdx);
      }
    } else {
      // Different parent case.
      // Only valid cross-container move is via an explicit _empty slot (Case 1).
      // If we reach here, the target is a regular block in a different container
      // (or at a different level). Do nothing — block stays in original position.
      // This prevents blocks from being accidentally ejected from their group.
      const targetSection = findSectionById(sections, overId);
      if (targetSection?.type === EMPTY_SLOT_TYPE) {
        // Edge case: _empty slot reached as a sortable item rather than droppable
        onReplaceEmptySlot(activeId, overId);
      }
      // All other cross-container drops: silently ignore.
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
      onDragEnd={handleDragEnd}
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

      {/* Ghost overlay while dragging */}
      <DragOverlay dropAnimation={null}>
        <div className="bg-indigo-600/15 border-2 border-indigo-500/60 rounded-xl h-12 flex items-center justify-center px-4 gap-2 text-indigo-400 text-sm font-medium backdrop-blur-sm shadow-lg shadow-indigo-500/20">
          <span className="text-base">✦</span>
          Moving block...
        </div>
      </DragOverlay>
    </DndContext>
  );
};
