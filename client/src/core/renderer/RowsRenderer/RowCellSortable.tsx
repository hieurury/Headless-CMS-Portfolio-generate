import { useSortable } from "@dnd-kit/sortable";
import { SectionRenderer } from "../SectionRenderer";
import type { LayoutSection } from "../../types/layout.types";
import { CSS } from '@dnd-kit/utilities';

const RowCellSortable: React.FC<{
    child: LayoutSection;
    depth: number;
    span?: number;
}> = ({ child, depth, span }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: child.id });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.4 : 1,
                width: '100%',
                height: '100%',
                minHeight: 48 * span,
                display: 'flex',
                flexDirection: 'column',
                cursor: isDragging ? 'grabbing' : undefined,
            }}
            {...attributes}
            {...listeners}
        >
            <SectionRenderer section={child} isChild depth={depth + 1} />
        </div>
    );
};
export default RowCellSortable