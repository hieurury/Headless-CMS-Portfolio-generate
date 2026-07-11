import React, { useCallback } from 'react';
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove as dndArrayMove,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import type { LayoutSection } from '../../types/layout.types';
import FlexCellSortable from './FlexCellSortable';
import { EmptySlotBlock } from '../SectionRenderer';
import type { EmptySlotVariant } from '../SectionRenderer';

const _FlexEditGrid: React.FC<{
  section: LayoutSection;
  depth: number;
  flexStyle: React.CSSProperties;
}> = ({ section, depth, flexStyle }) => {

  const direction = (section.props?.direction as string) ?? 'row';
  const isRow = direction === 'row' || direction === 'row-reverse';

  // Determine the correct empty slot variant based on flex direction
  const emptyVariant: EmptySlotVariant = isRow ? 'flex-h' : 'flex-v';

  // ── Split children into real blocks vs empty slots ─────────────────
  const allChildren = section.children ?? [];
  const realChildren = allChildren.filter(
    (c) => c && c.type !== '_colpad' && c.type !== '_column' && c.type !== '_empty'
  );
  const emptySlots = allChildren.filter((c) => c.type === '_empty');

  // ── Drag reorder (real children only) ────────────────────────────
  const handleDragEnd = useCallback(
    (event: import('@dnd-kit/core').DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIdx = realChildren.findIndex((c) => c.id === active.id);
      const newIdx = realChildren.findIndex((c) => c.id === over.id);
      if (oldIdx === -1 || newIdx === -1) return;
      // Preserve empty slots at original positions in children array — rebuild
      const reorderedReal = dndArrayMove(realChildren, oldIdx, newIdx);
      // Reconstruct children: real blocks in order, then empty slots at end
      const reordered = [...reorderedReal, ...emptySlots];
      window.dispatchEvent(
        new CustomEvent('cms:reorderFlexCells', {
          detail: { flexId: section.id, children: reordered },
        }),
      );
    },
    [realChildren, emptySlots, section.id],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const filledIds = realChildren.map((c) => c.id);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={filledIds}
        strategy={isRow ? horizontalListSortingStrategy : verticalListSortingStrategy}
      >
        <div style={{ position: 'relative', width: '100%' }}>
          <div id={section.name || section.id} style={flexStyle}>
            {/* Real children — sortable */}
            {realChildren.map((child) => (
              <FlexCellSortable key={child.id} child={child} depth={depth} />
            ))}
            {/* Empty slots at end — droppable + clickable add zones */}
            {emptySlots.map((slot) => (
              <EmptySlotBlock key={slot.id} section={slot} variant={emptyVariant} />
            ))}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default _FlexEditGrid;
