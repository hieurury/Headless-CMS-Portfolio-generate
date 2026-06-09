import type React from "react";
import type { LayoutSection } from "../../types/layout.types";
import { useEditorContext } from "../../context/EditorContext";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import RowsGridRenderer from "./RowsGridRenderer";

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
            {/* Selection ring */}
            <div
                className={`absolute inset-0 pointer-events-none rounded-sm transition-all duration-100 ${isSelected ? 'ring-2 ring-inset ring-indigo-500 z-20' : ''
                    }`}
            />

            {/* Hover ring */}
            {!isSelected && (
                <div
                    className="cms-hover-ring absolute inset-0 pointer-events-none rounded-sm z-10"
                    style={{ boxShadow: 'inset 0 0 0 1px rgba(129,140,248,0.35)', opacity: 0, transition: 'opacity 0.1s' }}
                />
            )}
            <RowsGridRenderer section={section} depth={depth} />
        </div>

    )
}

export default RowsEditorWrapper;