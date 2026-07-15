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
            className={`relative cms-block cms-container-block select-none touch-none${isDragging ? ' shadow-2xl shadow-black/30' : ''
                }${isSelected ? ' z-10' : ''}`}
            onClick={(e) => { e.stopPropagation(); onSectionSelect(section.id); }}
            onContextMenu={(e) => {
                if (!isEditorMode || previewMode) return;
                e.preventDefault();
                e.stopPropagation();
                onSectionSelect(section.id);
                window.dispatchEvent(new CustomEvent('cms:openContextMenu', {
                    detail: { sectionId: section.id, x: e.clientX, y: e.clientY }
                }));
            }}
        >
            {/* Selection ring */}
            <div
                className={`absolute inset-0 pointer-events-none rounded-sm transition-all duration-100 ${isSelected ? 'ring-2 ring-inset ring-[rgba(255,255,255,0.4)] z-20' : ''
                    }`}
            />

            {/* Hover ring */}
            {!isSelected && (
                <div
                    className="cms-hover-ring absolute inset-0 pointer-events-none rounded-sm z-10"
                    style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)', opacity: 0, transition: 'opacity 0.1s' }}
                />
            )}
            <RowsGridRenderer section={section} depth={depth} />
        </div>

    )
}

export default RowsEditorWrapper;