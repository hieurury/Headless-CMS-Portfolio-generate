import React, { useCallback } from 'react';
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove as dndArrayMove, horizontalListSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';

import type { LayoutSection } from '../../types/layout.types';
import FlexCellDropZone from './FlexCellDropZone';
import FlexCellSortable from './FlexCellSortable';

const _FlexEditGrid: React.FC<{
  section: LayoutSection;
  depth: number;
  flexStyle: React.CSSProperties;
}> = ({ section, depth, flexStyle }) => {

  const direction = (section.props?.direction as string) ?? 'row';
  const isRow = direction === 'row' || direction === 'row-reverse';

  // ── Filter valid children ──────────────────────────────────────────
  const validChildren = (section.children ?? []).filter(
    (c) => c && c.type !== '_colpad' && c.type !== '_column' && c.type !== '_empty'
  );

  // ── Drag reorder ───────────────────────────────────────────────────
  const handleDragEnd = useCallback(
    (event: import('@dnd-kit/core').DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIdx = validChildren.findIndex((c) => c.id === active.id);
      const newIdx = validChildren.findIndex((c) => c.id === over.id);
      if (oldIdx === -1 || newIdx === -1) return;
      const reordered = dndArrayMove(validChildren, oldIdx, newIdx);
      window.dispatchEvent(
        new CustomEvent('cms:reorderFlexCells', {
          detail: { flexId: section.id, children: reordered },
        }),
      );
    },
    [validChildren, section.id],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const filledIds = validChildren.map((c) => c.id);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={filledIds}
        strategy={isRow ? horizontalListSortingStrategy : verticalListSortingStrategy}
      >
        <div style={{ position: 'relative', width: '100%' }}>
          <div id={section.name || section.id} style={flexStyle}>
            {validChildren.map((child) => (
              <FlexCellSortable key={child.id} child={child} depth={depth} />
            ))}
            {/* Always show a drop zone at the end to add more children */}
            <FlexCellDropZone
              flexId={section.id}
              cellIndex={validChildren.length}
              direction={direction}
            />
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default _FlexEditGrid;
