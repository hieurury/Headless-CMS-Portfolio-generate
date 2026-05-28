import React from 'react';
import type { PageLayout } from '../types/layout.types';
import { SectionRenderer, isDropId, fromDropId } from './SectionRenderer';
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
import { findParent } from '../utils/layoutUtils';

interface PageRendererProps {
  layout: PageLayout;
  className?: string;
}

/**
 * Custom collision detection: prefer drop zones (container drops) over sort items.
 * This ensures dragging over a container highlights it as a drop target.
 */
function customCollisionDetection(args: Parameters<typeof pointerWithin>[0]) {
  // First: try to find pointer collisions with droppable containers
  const pointerCollisions = pointerWithin(args);
  const dropZoneCollisions = pointerCollisions.filter(
    (c) => typeof c.id === 'string' && isDropId(c.id as string),
  );
  if (dropZoneCollisions.length > 0) return dropZoneCollisions;

  // Fallback: closest center for sortable reordering
  return closestCenter(args);
}

/**
 * PageRenderer — renders layout sections in editor or production mode.
 *
 * In editor mode: wraps in a single DndContext that handles:
 * - Top-level section reorder
 * - Child reorder within a container
 * - Cross-container moves (drag from anywhere → drop into a container)
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

    // ── Case 1: Dropped INTO a container drop zone ────────────────────
    if (isDropId(overId)) {
      const containerId = fromDropId(overId);
      if (activeId !== containerId) {
        onMoveToContainer(activeId, containerId);
      }
      return;
    }

    // ── Case 2: Dropped onto another item — find parent context ───────
    const activeParentInfo = findParent(sections, activeId);
    const overParentInfo = findParent(sections, overId);

    if (!activeParentInfo || !overParentInfo) return;

    const activeParentId = activeParentInfo.parent?.id ?? null;
    const overParentId = overParentInfo.parent?.id ?? null;

    // Same parent (top level or same container) → reorder
    if (activeParentId === overParentId) {
      if (activeParentId === null) {
        // Top-level reorder
        const oldIdx = sections.findIndex((s) => s.id === activeId);
        const newIdx = sections.findIndex((s) => s.id === overId);
        if (oldIdx !== -1 && newIdx !== -1) {
          onSectionReorder(oldIdx, newIdx);
        }
      } else {
        // Reorder within same container
        const parent = activeParentInfo.parent!;
        const oldIdx = parent.children?.findIndex((c) => c.id === activeId) ?? -1;
        const newIdx = parent.children?.findIndex((c) => c.id === overId) ?? -1;
        if (oldIdx !== -1 && newIdx !== -1) {
          onReorderChildren(activeParentId!, oldIdx, newIdx);
        }
      }
    } else {
      // Different parent → move to the over item's container
      onMoveToContainer(activeId, overParentId ?? '', overParentInfo.index);
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
