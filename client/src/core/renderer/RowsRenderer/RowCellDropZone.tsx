import { useDroppable } from "@dnd-kit/core";
import { Plus, SplitSquareHorizontal } from "lucide-react";
/** Special type for the empty-slot placeholder block */
export const EMPTY_SLOT_TYPE = '_empty';
export const CONTAINER_DROP_PREFIX = 'drop:';
export const ROW_CELL_PREFIX = '_rowcell-';

export const toDropId = (id: string) => `${CONTAINER_DROP_PREFIX}${id}`;

const RowCellDropZone: React.FC<{
    rowId: string;
    cellIndex: number;
    /** span > 1 means this cell is a merged cell — show split button */
    span?: number;
}> = ({ rowId, cellIndex, span = 1 }) => {
    const dropId = `${ROW_CELL_PREFIX}${rowId}:${cellIndex}`;
    const { isOver, setNodeRef } = useDroppable({ id: toDropId(dropId) });

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.dispatchEvent(
            new CustomEvent('cms:fillRowCell', { detail: { rowId, cellIndex } }),
        );
    };

    const handleSplit = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.dispatchEvent(
            new CustomEvent('cms:splitRowCell', { detail: { rowId, cellIndex } }),
        );
    };

    return (
        <div
            ref={setNodeRef}
            onClick={handleClick}
            style={{ width: '100%', height: '100%', minHeight: 48, position: 'relative' }}
            className={`
        group relative select-none cursor-pointer
        flex items-center justify-center transition-all duration-150
        ${isOver
                    ? 'bg-indigo-500/15 text-indigo-400 shadow-[inset_0_0_0_1.5px_rgba(99,102,241,0.7)]'
                    : 'bg-white/2 text-slate-700 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] hover:bg-white/4 hover:text-indigo-400 hover:shadow-[inset_0_0_0_1px_rgba(99,102,241,0.3)]'
                }
      `}
        >
            {isOver ? (
                <span className="text-[10px] font-medium">Drop here</span>
            ) : (
                <Plus size={14} className="opacity-30 group-hover:opacity-80 transition-opacity" />
            )}

            {/* Split button — only shown when this is a merged cell (span > 1) */}
            {span > 1 && (
                <button
                    data-editor-chrome
                    onClick={handleSplit}
                    title={`Split merged column (currently ${span}×)`}
                    className="
                        absolute top-1 right-1
                        w-5 h-5 rounded
                        bg-[#1a1a2e] border border-violet-500/50
                        flex items-center justify-center
                        text-violet-400 hover:text-white
                        hover:bg-violet-600 hover:border-violet-400
                        transition-all duration-150 opacity-0 group-hover:opacity-100
                      "
                >
                    <SplitSquareHorizontal size={10} />
                </button>
            )}
        </div>
    );
};
export default RowCellDropZone