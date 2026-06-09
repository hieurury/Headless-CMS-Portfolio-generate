import type React from "react";
import type { LayoutSection } from "../../types/layout.types";
import { useEditorContext } from "../../context/EditorContext";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';

const RowsEditorWrapper: React.FC<{
    section: LayoutSection;
    depth: number;
}> = ({ section, depth }) => {
    const {
        isEditorMode,
        previewMode,
        selectedSectionId,
        onSectionSelect,
    } = useEditorContext();

    const isSelected = isEditorMode && !previewMode && selectedSectionId === section.id;

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: section.id,
        disabled: !isEditorMode || previewMode,
    });

    const dragStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.25 : 1,
        zIndex: isDragging ? 999 : undefined,
        width: '100%',
        height: '100%',
        minWidth: 0,
    };
    return (
        <div
            ref={setNodeRef} style={dragStyle}
            id={section.name || section.id}
            {...(isEditorMode && !previewMode ? { ...attributes, ...listeners } : {})}
            className={`relative cms-block cms-container-block select-none touch-none${isDragging ? ' shadow-2xl shadow-indigo-500/20' : ''
                }${isSelected ? ' z-10' : ''}`}
            onClick={(e) => { e.stopPropagation(); onSectionSelect(section.id); }}
        >
            <div></div>

        </div>

    )
}

export default RowsEditorWrapper;