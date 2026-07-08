import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';

export const FLEX_CELL_PREFIX = '_flexcell-';
export const CONTAINER_DROP_PREFIX = 'drop:';
export const toDropId = (id: string) => `${CONTAINER_DROP_PREFIX}${id}`;

/**
 * Drop zone shown at the end of a Flex container to add new children.
 * Dispatches `cms:fillFlexCell` so PageEditorPage opens the block picker.
 */
const FlexCellDropZone: React.FC<{
  flexId: string;
  cellIndex: number;
  direction: string;
}> = ({ flexId, cellIndex, direction }) => {
  const dropId = `${FLEX_CELL_PREFIX}${flexId}:${cellIndex}`;
  const { isOver, setNodeRef } = useDroppable({ id: toDropId(dropId) });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('cms:fillFlexCell', { detail: { flexId, cellIndex } }),
    );
  };

  const isRow = direction === 'row' || direction === 'row-reverse';

  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      style={{
        minWidth: isRow ? 48 : '100%',
        minHeight: isRow ? '100%' : 48,
        flexShrink: 0,
      }}
      className={`
        group relative select-none cursor-pointer
        flex items-center justify-center transition-all duration-150
        rounded-md
        ${isOver
          ? 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)] shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.2)]'
          : 'bg-white/2 text-[var(--color-text-faint)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] hover:bg-white/4 hover:text-[var(--color-text-muted)] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]'
        }
      `}
    >
      {isOver ? (
        <span className="text-[10px] font-medium">Drop here</span>
      ) : (
        <Plus size={14} className="opacity-30 group-hover:opacity-80 transition-opacity" />
      )}
    </div>
  );
};

export default FlexCellDropZone;
