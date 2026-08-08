import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ImageIcon, Plus, X, Merge, SplitSquareHorizontal } from 'lucide-react';


import type { LayoutSection } from '../types/layout.types';
import { componentRegistry } from '../registry/ComponentRegistry';
import { useEditorContext } from '../context/EditorContext';

// ─── Drop ID helpers ──────────────────────────────────────────────────────────
export const CONTAINER_DROP_PREFIX = 'drop:';
export const toDropId = (id: string) => `${CONTAINER_DROP_PREFIX}${id}`;
export const fromDropId = (dropId: string) => dropId.replace(CONTAINER_DROP_PREFIX, '');
export const isDropId = (id: string) => id.startsWith(CONTAINER_DROP_PREFIX);

/** Special type for the empty-slot placeholder block */
export const EMPTY_SLOT_TYPE = '_empty';

import RowsGridRenderer from './RowsRenderer/RowsGridRenderer';
import RowsEditorWrapper from './RowsRenderer/RowsEditorWrapper';
import FlexGridRenderer from './FlexRenderer/FlexGridRenderer';
import FlexEditorWrapper from './FlexRenderer/FlexEditorWrapper';


/** ID prefix used for per-cell empty zones inside a Columns block */
export const COL_CELL_PREFIX = '_colcell-';
/** ID prefix used for drop zones inside a Flex block */
export const FLEX_CELL_PREFIX = '_flexcell-';

/** Create a new empty slot section */
export function makeEmptySlot(): LayoutSection {
  return {
    id: `_empty-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: EMPTY_SLOT_TYPE,
    name: '',
    props: {},
    children: [],
  };
}

// ─── Column Cell Drop Zone ────────────────────────────────────────────────────
/**
 * ColCellDropZone — rendered inside a Columns grid cell when that cell is empty.
 *
 * Uses a synthetic drop id based on: `colcell:<columnsId>:<cellIndex>`
 * so PageRenderer can identify which columns block and which cell index
 * a block was dropped onto.
 */
const ColCellDropZone: React.FC<{
  columnsId: string;
  cellIndex: number;
  /** span > 1 means this cell is a merged cell — show split button */
  span?: number;
}> = ({ columnsId, cellIndex, span = 1 }) => {
  const dropId = `${COL_CELL_PREFIX}${columnsId}:${cellIndex}`;
  const { isOver, setNodeRef } = useDroppable({ id: toDropId(dropId) });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('cms:fillColCell', { detail: { columnsId, cellIndex } }),
    );
  };

  const handleSplit = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('cms:splitColCell', { detail: { columnsId, cellIndex } }),
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
          ? 'bg-[var(--color-surface-2)] text-[var(--color-text)] shadow-[inset_0_0_0_1.5px_var(--color-border-hover)]'
          : 'bg-white/2 text-slate-700 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] hover:bg-white/4 hover:text-[var(--color-text)] hover:shadow-[inset_0_0_0_1.5px_var(--color-border-hover)]'
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
            bg-[var(--color-surface)] border border-[var(--color-border-hover)]
            flex items-center justify-center
            text-[var(--color-text-muted)] hover:text-[var(--color-text)]
            hover:bg-[var(--color-surface-2)] hover:border-[var(--color-border-strong)]
            transition-all duration-150 opacity-0 group-hover:opacity-100
          "
        >
          <SplitSquareHorizontal size={10} />
        </button>
      )}
    </div>
  );
};

// ─── Columns Grid Renderer ────────────────────────────────────────────────────
/**
 * ColumnsGridRenderer — special renderer for `type: 'columns'`.
 *
 * Renders an N-cell CSS grid. Children (LayoutSection[]) map to cells by index.
 * Cells without a child show ColCellDropZone.
 * Cells with a child render SectionRenderer (so the child is draggable + editable).
 *
 * Layout model:
 *   columns.children = [blockA, blockB, ...] — direct children, one per cell
 *   columns.props.columns = N — total cell count
 *
 * When N > children.length, the extra cells are empty drop zones.
 * When N < children.length (e.g. after removing a column), extra children are hidden.
 */
const ColumnsGridRenderer: React.FC<{
  section: LayoutSection;
  depth: number;
}> = ({ section, depth }) => {
  const { isEditorMode, previewMode } = useEditorContext();
  const colCount = Number(section.props?.columns ?? 2);
  const gap = (section.props?.gap as string) ?? 'none';
  const alignX = (section.props?.alignX as string) ?? 'stretch';
  const alignY = (section.props?.alignY as string) ?? 'stretch';

  const ALIGN_MAP: Record<string, string> = {
    start: 'start', center: 'center', end: 'end', stretch: 'stretch',
  };
  const GAP_MAP: Record<string, string> = {
    none: '0', sm: '0.5rem', md: '1rem', lg: '2rem', xl: '3rem',
  };
  const gapValue = GAP_MAP[gap] || 0;

  const isEditing = isEditorMode && !previewMode;

  // ── colSpans: per-cell width weights ─────────────────────────────────
  const rawSpans = section.props?.colSpans as number[] | undefined;
  const colSpans: number[] = (
    Array.isArray(rawSpans) && rawSpans.length === colCount && rawSpans.every(s => s > 0)
  ) ? rawSpans : Array(colCount).fill(1);

  const totalSpan = colSpans.reduce((a, b) => a + b, 0);

  // CSS grid template — use actual span weights
  const gridTemplate = colSpans.map(s => `${s}fr`).join(' ');

  // ── PREVIEW / PRODUCTION path — pure CSS grid, zero DnD ──────────
  if (!isEditing) {
    const realChildren = (section.children ?? []).filter(
      (c) => c && c.type !== '_colpad' && c.type !== '_empty'
    );
    return (
      <div
        id={section.name || section.id}
        style={{
          display: 'grid',
          gridTemplateColumns: gridTemplate,
          gap: gapValue,
          justifyItems: ALIGN_MAP[alignX] ?? 'stretch',
          alignItems: ALIGN_MAP[alignY] ?? 'stretch',
          width: '100%',
        }}
      >
        {Array.from({ length: colCount }, (_, i) => {
          const child = realChildren[i] ?? null;
          if (!child) return <div key={`cell-empty-${i}`} />;
          return (
            <div key={child.id} style={{ width: '100%', height: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <SectionRenderer section={child} isChild depth={depth + 1} />
            </div>
          );
        })}
      </div>
    );
  }

  // ── EDIT path — children[] is source of truth ─────────────────
  const allChildren = section.children ?? [];
  const cells = Array.from({ length: colCount }, (_, i) => {
    const raw = allChildren[i] ?? null;
    const isEmpty = !raw || raw.type === '_colpad' || raw.type === '_empty';
    const emptyNode = (raw && raw.type === '_empty') ? raw : null;
    return { index: i, span: colSpans[i], child: isEmpty ? null : raw, emptyNode, isEmpty };
  });

  const cumulativeSpans = colSpans.reduce<number[]>((acc, s) => {
    acc.push((acc[acc.length - 1] ?? 0) + s);
    return acc;
  }, []);

  return (
    <_ColumnsEditGrid
      section={section}
      depth={depth}
      colCount={colCount}
      gapValue={gapValue}
      alignX={alignX}
      alignY={alignY}
      colSpans={colSpans}
      totalSpan={totalSpan}
      gridTemplate={gridTemplate}
      cells={cells}
      cumulativeSpans={cumulativeSpans}
      ALIGN_MAP={ALIGN_MAP}
    />
  );
};

// Internal edit-mode grid (separated so hooks are not called in preview path)
const _ColumnsEditGrid: React.FC<{
  section: LayoutSection;
  depth: number;
  colCount: number;
  gapValue: string | number;
  alignX: string;
  alignY: string;
  colSpans: number[];
  totalSpan: number;
  gridTemplate: string;
  cells: { index: number; span: number; child: LayoutSection | null; emptyNode: LayoutSection | null; isEmpty: boolean }[];
  cumulativeSpans: number[];
  ALIGN_MAP: Record<string, string>;
}> = ({ section, depth, colCount, gapValue, alignX, alignY, colSpans, totalSpan, gridTemplate, cells, cumulativeSpans, ALIGN_MAP }) => {

  // ── Merge: two adjacent empty cells → one with combined span ─────────
  const handleMerge = useCallback(
    (leftIndex: number) => {
      window.dispatchEvent(
        new CustomEvent('cms:mergeColCells', {
          detail: {
            columnsId: section.id,
            leftIndex,
            newSpan: colSpans[leftIndex] + colSpans[leftIndex + 1],
            colSpans,
          },
        }),
      );
    },
    [section.id, colSpans],
  );

  const filledIds = cells.filter((c) => c.child !== null).map((c) => c.child!.id);

  return (
    <SortableContext items={filledIds} strategy={horizontalListSortingStrategy}>
      <div style={{ position: 'relative', width: '100%' }}>
        <div
          id={section.name || section.id}
          style={{
            display: 'grid',
            gridTemplateColumns: gridTemplate,
            gap: gapValue,
            justifyItems: ALIGN_MAP[alignX] ?? 'stretch',
            alignItems: ALIGN_MAP[alignY] ?? 'stretch',
            width: '100%',
          }}
        >
          {cells.map(({ index: i, child, isEmpty, emptyNode, span }) => {
            if (isEmpty) {
              // Use EmptySlotBlock for _empty nodes (new standard)
              if (emptyNode) {
                return (
                  <div key={emptyNode.id} style={{ width: '100%', height: '100%', minHeight: 48 }}>
                    <EmptySlotBlock section={emptyNode} variant="col" />
                  </div>
                );
              }
              // Fallback: ColCellDropZone for null children (legacy / after merge/split)
              return (
                <ColCellDropZone
                  key={`cell-empty-${i}`}
                  columnsId={section.id}
                  cellIndex={i}
                  span={span}
                />
              );
            }
            return (
              <ColCellSortable key={child!.id} child={child!} depth={depth} />
            );
          })}
        </div>

        {/* ── Merge buttons between adjacent EMPTY cells ────────────── */}
        {colCount >= 2 &&
          cells.slice(0, -1).map(({ index: i, isEmpty: leftEmpty }) => {
            const rightEmpty = cells[i + 1]?.isEmpty;
            if (!leftEmpty || !rightEmpty) return null;
            const pct = (cumulativeSpans[i] / totalSpan) * 100;
            return (
              <button
                key={`merge-${i}`}
                data-editor-chrome
                onClick={(e) => { e.stopPropagation(); handleMerge(i); }}
                title={`Merge columns (${colSpans[i]}fr + ${colSpans[i + 1]}fr = ${colSpans[i] + colSpans[i + 1]}fr)`}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${pct}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 30,
                }}
                className="
                    w-6 h-6 rounded-full
                    bg-[var(--color-surface)] border border-[var(--color-border-hover)]
                    flex items-center justify-center
                    text-[var(--color-text)] hover:text-white
                    hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] hover:border-[var(--color-border-hover)]
                    hover:shadow-lg hover:shadow-black/20
                    transition-all duration-150 cursor-pointer
                  "
              >
                <Merge size={11} />
              </button>
            );
          })
        }
      </div>
    </SortableContext>
  );
};


// ─── ColCellSortable ──────────────────────────────────────────────────────────
/**
 * Wraps a filled cell child inside a useSortable hook so it can be
 * drag-reordered horizontally within the Columns grid.
 */
const ColCellSortable: React.FC<{
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
        width: '100%',
        height: '100%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        cursor: isDragging ? 'grabbing' : undefined,
      }}
      {...attributes}
      {...listeners}
    >
      <SectionRenderer section={child} isChild depth={depth + 1} parentType="columns" />
    </div>
  );
};

// ─── Empty Slot Block ─────────────────────────────────────────────────────────
/**
 * EmptySlotBlock — unified droppable placeholder for all layout types.
 *
 * variant controls the size/shape:
 *   'full'   → Container (full-width dashed block)
 *   'col'    → Columns cell (full cell, fills column width)
 *   'row'    → Rows cell (full cell, fills row height)
 *   'flex-h' → Flex row direction (compact horizontal chip)
 *   'flex-v' → Flex column direction (compact vertical bar)
 */
export type EmptySlotVariant = 'full' | 'col' | 'row' | 'flex-h' | 'flex-v';

export const EmptySlotBlock: React.FC<{
  section: LayoutSection;
  variant?: EmptySlotVariant;
}> = ({ section, variant = 'full' }) => {
  const { isEditorMode, previewMode, onRemoveSection } = useEditorContext();
  const { isOver, setNodeRef } = useDroppable({ id: toDropId(section.id) });

  if (!isEditorMode || previewMode) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('cms:fillEmptySlot', { detail: { slotId: section.id } }),
    );
  };

  // Variant-based sizing
  const isCompact = variant === 'flex-h' || variant === 'flex-v';
  const isHorizontalCompact = variant === 'flex-h';

  const sizeStyle: React.CSSProperties = isCompact
    ? {
      minWidth: isHorizontalCompact ? 48 : '100%',
      minHeight: isHorizontalCompact ? '100%' : 48,
      width: isHorizontalCompact ? 48 : '100%',
      flexShrink: 0,
    }
    : { width: '100%', height: '100%', flexGrow: 1, minHeight: 40 };

  const baseClass = [
    'group relative select-none cursor-pointer',
    'flex items-center justify-center transition-all duration-150',
    isCompact ? 'rounded-md' : 'rounded-lg border border-dashed',
    isOver
      ? 'border-[var(--color-border-hover)] bg-[var(--color-surface-2)] text-[var(--color-text)]'
      : 'border-white/10 bg-white/2 text-slate-700 hover:border-[var(--color-border-hover)]/40 hover:text-[var(--color-text)] hover:bg-white/4',
    !isCompact && isOver ? 'min-h-[48px]' : '',
  ].join(' ');

  return (
    <div ref={setNodeRef} className={baseClass} style={sizeStyle}>
      <button
        onClick={handleClick}
        className="flex items-center gap-1 justify-center px-3 py-1.5 cursor-pointer rounded-md hover:bg-white/5 transition-colors"
        title="Click to add a block"
      >
        {isOver ? (
          <span className="text-[10px] font-medium">Drop here</span>
        ) : (
          <>
            <Plus size={isCompact ? 14 : 13} className="opacity-40 group-hover:opacity-100 transition-opacity" />
            {!isCompact && (
              <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Add block
              </span>
            )}
          </>
        )}
      </button>

      {/* Delete empty slot — only shown for full/col/row variants where there's room */}
      {!isCompact && (
        <button
          data-editor-chrome
          onClick={(e) => { e.stopPropagation(); onRemoveSection(section.id); }}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          title="Remove empty slot"
        >
          <X size={11} />
        </button>
      )}
    </div>
  );
};


// ─── Container Drop Zone ──────────────────────────────────────────────────────
/**
 * Container drop zone — wraps children of a generic container block (not columns/rows/flex).
 * Children always include _empty slots, so we never need the "Press +" placeholder.
 */
const ContainerDropZone: React.FC<{
  section: LayoutSection;
  renderedChildren: React.ReactNode;
}> = ({ section, renderedChildren }) => {
  const hasEmptySlot = section.children?.some((c) => c.type === EMPTY_SLOT_TYPE) ?? false;
  const hasChildren = (section.children?.length ?? 0) > 0;
  const { isOver, setNodeRef } = useDroppable({
    id: toDropId(section.id),
    disabled: hasChildren && !hasEmptySlot,
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative w-full transition-all duration-150 ${isOver && hasEmptySlot
          ? 'bg-white/5 ring-1 ring-inset ring-[var(--color-border-hover)] rounded-lg'
          : ''
        }`}
      style={{ minHeight: hasChildren ? undefined : 48 }}
    >
      <SortableContext
        items={(section.children ?? []).map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        {renderedChildren}
        {isOver && hasEmptySlot && (
          <div className="h-0.5 mx-2 mt-1 rounded-full bg-[var(--color-border-hover)] animate-pulse" />
        )}
      </SortableContext>
    </div>
  );
};

// ─── Inline Image / Link Picker ───────────────────────────────────────────────
interface FieldPickerState {
  fieldKey: string;
  top: number;
  left: number;
}

const InlineFieldPicker: React.FC<{
  state: FieldPickerState;
  schema: { type: string; label: string; placeholder?: string };
  currentValue: unknown;
  onConfirm: (value: string) => void;
  onClose: () => void;
}> = ({ state, schema, currentValue, onConfirm, onClose }) => {
  const [val, setVal] = useState(String(currentValue ?? ''));
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) onClose();
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [onClose]);

  const confirm = () => { onConfirm(val); onClose(); };

  return (
    <div
      ref={pickerRef}
      className="absolute z-[300] rounded-xl shadow-2xl shadow-black/70 border border-[var(--color-border-hover)]/40 overflow-hidden"
      style={{
        top: state.top + 8,
        left: state.left,
        background: 'rgba(8,8,18,0.98)',
        backdropFilter: 'blur(16px)',
        width: 280,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
        <ImageIcon size={11} className="text-[var(--color-text)] shrink-0" />
        <span className="text-xs font-semibold text-[var(--color-text)]">{schema.label}</span>
      </div>
      <div className="p-3 space-y-2">
        <input
          ref={inputRef}
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') confirm();
            if (e.key === 'Escape') onClose();
          }}
          placeholder={schema.placeholder ?? 'https://...'}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 text-xs
            placeholder-slate-700 focus:outline-none focus:border-[var(--color-border-hover)] transition-colors"
        />
        {schema.type === 'image' && val && (
          <div className="h-20 rounded-lg overflow-hidden bg-white/5 border border-white/10">
            <img src={val} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        )}
        <button
          onClick={confirm}
          className="w-full py-1.5 rounded-lg bg-[var(--color-accent)] text-[var(--color-bg)] hover:brightness-110 text-white text-xs font-semibold transition-all"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

// ─── ContentEditable Activation ───────────────────────────────────────────────
function activateContentEditable(
  el: HTMLElement,
  schema: { type: string },
  originalValue: string,
  onChange: (newValue: string) => void,
) {
  if (el.getAttribute('contenteditable') === 'true') return;

  el.setAttribute('contenteditable', 'true');
  el.setAttribute('spellcheck', 'false');
  // No outline here — the parent cms-block selection ring already shows
  // editing state. Adding an extra outline causes a double-border.
  el.style.outline = 'none';
  el.style.cursor = 'text';
  el.style.minWidth = '8px';

  el.focus();

  try {
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  } catch { /* ignore */ }

  let committed = false;

  const cleanup = () => {
    el.setAttribute('contenteditable', 'false');
    el.style.outline = '';
    el.style.cursor = '';
    el.style.minWidth = '';
    el.removeEventListener('blur', handleBlur);
    el.removeEventListener('keydown', handleKeydown);
  };

  const handleBlur = () => {
    if (committed) return;
    committed = true;
    const newText = el.textContent ?? '';
    cleanup();
    if (newText !== originalValue) onChange(newText);
  };

  const handleKeydown = (e: KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Escape') {
      committed = true;
      el.textContent = originalValue;
      cleanup();
      return;
    }
    if (e.key === 'Enter' && schema.type !== 'textarea') {
      e.preventDefault();
      el.blur();
    }
  };

  el.addEventListener('blur', handleBlur);
  el.addEventListener('keydown', handleKeydown);
}

// ─── SectionRenderer ──────────────────────────────────────────────────────────
interface SectionRendererProps {
  section: LayoutSection;
  isRoot?: boolean;
  isChild?: boolean;
  /** When true: render in production mode (no sortable, no editor chrome).
   *  Used by DragOverlay to clone the block without interactive features. */
  isOverlay?: boolean;
  depth?: number;
  /** The parent layout type — used to pick the correct EmptySlotBlock variant */
  parentType?: string;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({ section, isOverlay = false, depth = 0, parentType }) => {
  const {
    isEditorMode,
    previewMode,
    pointerMode,
    selectedSectionIds,
    onSectionSelect,
    onFieldSelect,
    onPropsChange,
  } = useEditorContext();

  // Overlay: render as pure production (no chrome, no sortable)
  const effectiveEditorMode = isOverlay ? false : isEditorMode;
  const effectivePreviewMode = isOverlay ? true : previewMode;

  // ── Empty slot: special rendering ─────────────────────────────────────────
  if (section.type === EMPTY_SLOT_TYPE) {
    if (!effectiveEditorMode || effectivePreviewMode) return null;
    // Map parent type to EmptySlotBlock variant
    let variant: EmptySlotVariant = 'full';
    if (parentType === 'columns') variant = 'col';
    else if (parentType === 'rows') variant = 'row';
    else if (parentType === 'flex') variant = 'flex-h'; // actual direction determined by parent
    return <EmptySlotBlock section={section} variant={variant} />;
  }

  // ── Columns block: special grid renderer — no _column wrappers ────────────
  if (section.type === 'columns') {
    if (!effectiveEditorMode || effectivePreviewMode) {
      return <ColumnsGridRenderer section={section} depth={depth} />;
    }
    return <ColumnsEditorWrapper section={section} depth={depth} />;
  }

  // ── Rows block: special grid renderer ────────────
  if (section.type === 'rows') {
    if (!effectiveEditorMode || effectivePreviewMode) {
      return <RowsGridRenderer section={section} depth={depth} />;
    }
    return <RowsEditorWrapper section={section} depth={depth} />;
  }

  // ── Flex block: flexbox renderer ────────────
  if (section.type === 'flex') {
    if (!effectiveEditorMode || effectivePreviewMode) {
      return <FlexGridRenderer section={section} depth={depth} />;
    }
    return <FlexEditorWrapper section={section} depth={depth} />;
  }

  const Component = componentRegistry.resolve(section.type);
  const entry = componentRegistry.getEntry(section.type);
  const isSelected = effectiveEditorMode && !effectivePreviewMode && selectedSectionIds.includes(section.id);
  const isContainer = entry?.isContainer ?? false;
  const passChildrenDirect = entry?.passChildrenDirect ?? false;


  // ── Refs ─────────────────────────────────────────────────────────────────
  const wrapperRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(section.props);
  const sectionIdRef = useRef(section.id);
  const onPropsChangeRef = useRef(onPropsChange);

  useEffect(() => {
    propsRef.current = section.props;
    sectionIdRef.current = section.id;
    onPropsChangeRef.current = onPropsChange;
  });

  // ── State ─────────────────────────────────────────────────────────────────
  const [pendingEditField, setPendingEditField] = useState<string | null>(null);
  const [fieldPicker, setFieldPicker] = useState<FieldPickerState | null>(null);

  // ── Sortable ──────────────────────────────────────────────────────────────
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    disabled: !effectiveEditorMode || effectivePreviewMode || pointerMode === 'select',
  });


  // ── Stable callback ───────────────────────────────────────────────────────
  const handleFieldChange = useCallback((fieldKey: string, newValue: unknown) => {
    const newProps = { ...propsRef.current, [fieldKey]: newValue };
    onPropsChangeRef.current(sectionIdRef.current, newProps);
  }, []);

  // ── useEffect: contentEditable activation ─────────────────────────────────
  useEffect(() => {
    if (!pendingEditField || !wrapperRef.current || !isEditorMode || previewMode) return;

    const el = wrapperRef.current.querySelector(
      `[data-cms-field="${pendingEditField}"]`,
    ) as HTMLElement | null;

    if (!el) { setPendingEditField(null); return; }

    const schema = entry?.schema?.[pendingEditField];
    if (!schema || (schema.type !== 'string' && schema.type !== 'textarea')) {
      setPendingEditField(null);
      return;
    }

    setPendingEditField(null);

    const originalValue = String(propsRef.current[pendingEditField] ?? '');
    activateContentEditable(el, schema, originalValue, (newText) => {
      handleFieldChange(pendingEditField, newText);
    });
  }, [pendingEditField, isEditorMode, previewMode, entry, handleFieldChange]);

  // ── Early returns (after all hooks) ──────────────────────────────────────
  if (!Component) {
    if (import.meta.env.DEV) {
      return (
        <div className="border-2 border-dashed border-amber-500/40 rounded-lg p-4 m-2 bg-amber-500/5 text-amber-400 font-mono text-xs">
          ⚠ Unknown type: &quot;{section.type}&quot;
        </div>
      );
    }
    return null;
  }

  // ── Render children (recursive) ──────────────────────────────────────────
  const renderedChildren =
    (section.children?.length ?? 0) > 0 ? (
      <>
        {section.children!.map((child) => (
          <SectionRenderer
            key={child.id}
            section={child}
            isRoot={false}
            isChild={true}
            depth={depth + 1}
            parentType={section.type}
          />
        ))}
      </>
    ) : null;

  // ── How children are passed to the component ─────────────────────────────
  let childrenForComponent: React.ReactNode;
  if (!effectiveEditorMode || !isContainer) {
    childrenForComponent = renderedChildren;
  } else if (passChildrenDirect) {

    childrenForComponent = (
      <SortableContext items={(section.children ?? []).map((c) => c.id)} strategy={verticalListSortingStrategy}>
        {renderedChildren}
      </SortableContext>
    );
  } else {
    childrenForComponent = (
      <ContainerDropZone
        section={section}
        renderedChildren={renderedChildren}
      />
    );
  }

  // ── Preview / Production render (no editor chrome) ───────────────────────
  if (!effectiveEditorMode || effectivePreviewMode) {
    return (
      <div
        id={section.name || section.id}
        style={{ width: '100%', height: '100%', minWidth: 0 }}
      >
        <Component {...(section.props as Record<string, unknown>)} sectionId={section.name || section.id}>
          {renderedChildren}
        </Component>
      </div>
    );
  }

  // ── Editor mode ──────────────────────────────────────────────────────────

  const handleCapture = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isEditorChrome = target.closest('[data-editor-chrome]');
    if (isEditorChrome) return;
    const anchor = target.closest('a');
    if (anchor) e.preventDefault();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    let el = e.target as HTMLElement | null;
    while (el && el !== wrapperRef.current) {
      const fieldKey = el.getAttribute('data-cms-field');
      if (fieldKey) {
        const schema = entry?.schema?.[fieldKey];
        if (schema) {
          onSectionSelect(section.id);
          onFieldSelect(section.id, fieldKey);

          if (schema.type === 'string' || schema.type === 'textarea') {
            setPendingEditField(fieldKey);
          } else if (schema.type === 'image' || schema.type === 'link') {
            const rect = el.getBoundingClientRect();
            const wrapperRect = wrapperRef.current?.getBoundingClientRect();
            setFieldPicker({
              fieldKey,
              top: rect.bottom - (wrapperRect?.top ?? 0),
              left: Math.max(0, rect.left - (wrapperRect?.left ?? 0)),
            });
          }
          return;
        }
      }
      el = el.parentElement;
    }
    // If holding shift/ctrl, maybe multi select? We will just pass multi flag based on pointerMode
    onSectionSelect(section.id, pointerMode === 'select' || e.shiftKey || e.ctrlKey || e.metaKey);
    setFieldPicker(null);
  };


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
      ref={(node) => {
        (wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        setNodeRef(node);
      }}
      id={section.name || section.id}
      style={dragStyle}
      // Apply drag listeners to the whole block (delay-based activation separates click from drag)
      {...(isEditorMode && !previewMode ? { ...attributes, ...listeners } : {})}
      className={`relative cms-block select-none touch-none${isContainer ? ' cms-container-block' : ''}${isDragging ? ' shadow-2xl shadow-black/20' : ''}${isSelected ? ' z-10' : ''}`}
      onClickCapture={handleCapture}
      onClick={handleClick}
    >
      {/* ── Selection ring ────────────────────────────────────────────── */}
      <div
        className={`absolute inset-0 pointer-events-none rounded-sm transition-all duration-100 ${isSelected ? 'ring-2 ring-inset ring-[var(--color-text)] z-20' : ''
          }`}
      />

      {/* ── Hover ring ─────────────────────────────────────────────────── */}
      {!isSelected && (
        <div
          className="cms-hover-ring absolute inset-0 pointer-events-none rounded-sm z-10"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(129,140,248,0.35)', opacity: 0, transition: 'opacity 0.1s' }}
        />
      )}

      {/* ── The actual component ─────────────────────────────────────── */}
      <Component {...(section.props as Record<string, unknown>)} sectionId={section.name || section.id}>
        {childrenForComponent}
      </Component>

      {/* ── Inline field picker ──────────────────────────────────────── */}
      {fieldPicker && entry?.schema?.[fieldPicker.fieldKey] && (
        <InlineFieldPicker
          state={fieldPicker}
          schema={entry.schema[fieldPicker.fieldKey]}
          currentValue={section.props[fieldPicker.fieldKey]}
          onConfirm={(newVal) => handleFieldChange(fieldPicker.fieldKey, newVal)}
          onClose={() => setFieldPicker(null)}
        />
      )}
    </div>
  );
};

// ─── ColumnsEditorWrapper ─────────────────────────────────────────────────────
/**
 * Editor-mode wrapper for `type: 'columns'`.
 *
 * Provides:
 * - Selection ring + drag chrome
 * - Control bar with: drag handle · label · "Add Column" (+) · Delete
 * - ColumnsGridRenderer inside for the actual cell layout
 *
 * The "+" button dispatches `cms:addColCell` to PageEditorPage,
 * which appends an empty slot at the next cell index and increments `columns` prop.
 * The "−" button dispatches `cms:removeLastCol` to decrement columns + trim children.
 */
const ColumnsEditorWrapper: React.FC<{
  section: LayoutSection;
  depth: number;
}> = ({ section, depth }) => {
  const {
    isEditorMode,
    previewMode,
    pointerMode,
    selectedSectionIds,
    onSectionSelect,
  } = useEditorContext();

  const isSelected = isEditorMode && !previewMode && selectedSectionIds.includes(section.id);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    disabled: !isEditorMode || previewMode || pointerMode === 'select',
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
      ref={setNodeRef}
      id={section.name || section.id}
      style={dragStyle}
      {...(isEditorMode && !previewMode && pointerMode !== 'select' ? { ...attributes, ...listeners } : {})}
      className={`relative cms-block select-none touch-none${isDragging ? ' shadow-2xl shadow-black/20' : ''
        }${isSelected ? ' z-10' : ''}`}
      onClick={(e) => { e.stopPropagation(); onSectionSelect(section.id, pointerMode === 'select' || e.shiftKey || e.ctrlKey || e.metaKey); }}
    >
      {/* Selection ring */}
      <div
        className={`absolute inset-0 pointer-events-none rounded-sm transition-all duration-100 ${isSelected ? 'ring-2 ring-inset ring-[var(--color-text)] z-20' : ''
          }`}
      />

      {/* Hover ring */}
      {!isSelected && (
        <div
          className="cms-hover-ring absolute inset-0 pointer-events-none rounded-sm z-10"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(129,140,248,0.35)', opacity: 0, transition: 'opacity 0.1s' }}
        />
      )}

      {/* Grid content */}
      <ColumnsGridRenderer section={section} depth={depth} />
    </div>
  );
};


