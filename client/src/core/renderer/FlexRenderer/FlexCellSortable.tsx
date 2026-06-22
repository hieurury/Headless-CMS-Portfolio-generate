import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SectionRenderer } from '../SectionRenderer';
import type { LayoutSection } from '../../types/layout.types';

const FlexCellSortable: React.FC<{
  child: LayoutSection;
  depth: number;
}> = ({ child, depth }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: child.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        flexShrink: 0,
        cursor: isDragging ? 'grabbing' : undefined,
      }}
      {...attributes}
      {...listeners}
    >
      <SectionRenderer section={child} isChild depth={depth + 1} />
    </div>
  );
};

export default FlexCellSortable;
