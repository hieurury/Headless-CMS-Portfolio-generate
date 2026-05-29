import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Settings, ImageIcon, Plus, X } from 'lucide-react';
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

// ─── Empty Slot Block ─────────────────────────────────────────────────────────
/**
 * EmptySlotBlock — a placeholder that renders as a droppable drop zone.
 *
 * Flow:
 * 1. User presses "+" on a container control → `_empty` block added as child
 * 2. Empty slot renders here as a visible drop target
 * 3. User clicks the empty slot → opens AddPanel to pick a block type
 * 4. PageEditorPage replaces this `_empty` block with the chosen block
 *
 * The slot does NOT use useDroppable — it relies on being a SortableContext
 * item. When the parent ContainerDropZone's droppable fires and activeId lands
 * at an _empty slot position, PageEditorPage swaps it.
 */
const EmptySlotBlock: React.FC<{
  section: LayoutSection;
}> = ({ section }) => {
  const { isEditorMode, previewMode, onRemoveSection } = useEditorContext();
  const { isOver, setNodeRef } = useDroppable({ id: toDropId(section.id) });

  if (!isEditorMode || previewMode) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('cms:fillEmptySlot', { detail: { slotId: section.id } }),
    );
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        relative w-full rounded-lg border border-dashed select-none
        flex items-center justify-center gap-2
        transition-all duration-150
        ${isOver
          ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400 min-h-[56px]'
          : 'border-white/15 bg-white/2 text-slate-600 hover:border-indigo-500/50 hover:text-slate-400 hover:bg-white/4'
        }
      `}
      style={{ minHeight: 48 }}
    >
      {/* Click area to open AddPanel */}
      <button
        onClick={handleClick}
        className="flex items-center gap-2 flex-1 justify-center py-2 cursor-pointer"
      >
        <Plus size={12} />
        <span className="text-[11px] font-medium">
          {isOver ? 'Drop here' : 'Empty slot — click to add or drop a block'}
        </span>
      </button>

      {/* Delete empty slot button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemoveSection(section.id);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-slate-700 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
        title="Remove empty slot"
      >
        <X size={12} />
      </button>
    </div>
  );
};

// ─── Container Drop Zone ──────────────────────────────────────────────────────
/**
 * Container drop zone — wraps children of a container block.
 *
 * IMPORTANT CONSTRAINTS:
 * - If the container has NO children: shows a non-interactive empty state.
 *   The user must press "+" on the control bar to create an empty slot first.
 * - If the container HAS at least one `_empty` slot: that slot is droppable.
 * - Regular (non-empty) children are sortable within the container.
 *
 * This prevents accidental drops into containers that are already "full"
 * or don't have an explicit empty slot.
 */
const ContainerDropZone: React.FC<{
  section: LayoutSection;
  renderedChildren: React.ReactNode;
  isEmpty: boolean;
}> = ({ section, renderedChildren, isEmpty }) => {
  // Only register a droppable if container has NO children at all
  // (the EmptySlotBlock handles its own droppable when it exists)
  const hasEmptySlot = section.children?.some((c) => c.type === EMPTY_SLOT_TYPE) ?? false;
  const { isOver, setNodeRef } = useDroppable({
    id: toDropId(section.id),
    // Disable the container-level droppable when we have content without empty slots
    // This forces the user to use "+" to add an empty slot first
    disabled: !isEmpty && !hasEmptySlot,
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative w-full transition-all duration-150 ${
        isOver && (isEmpty || hasEmptySlot)
          ? 'bg-indigo-500/8 ring-1 ring-inset ring-indigo-500/40 rounded-lg'
          : ''
      }`}
      style={{ minHeight: isEmpty ? 48 : undefined }}
    >
      {isEmpty ? (
        /* ── Truly empty container — non-droppable placeholder ── */
        /* User must press "+" on the control bar first */
        <div
          className="flex items-center justify-center w-full rounded-lg border border-dashed border-white/8 text-slate-700"
          style={{ minHeight: 48 }}
        >
          <span className="text-[10px] font-medium select-none">
            Press + to add blocks
          </span>
        </div>
      ) : (
        /* ── Has children (including possible empty slots) ── */
        <SortableContext
          items={(section.children ?? []).map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {renderedChildren}
          {isOver && hasEmptySlot && (
            <div className="h-0.5 mx-2 mt-1 rounded-full bg-indigo-500/60 animate-pulse" />
          )}
        </SortableContext>
      )}
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
      className="absolute z-[300] rounded-xl shadow-2xl shadow-black/70 border border-indigo-500/40 overflow-hidden"
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
        <ImageIcon size={11} className="text-indigo-400 shrink-0" />
        <span className="text-xs font-semibold text-indigo-400">{schema.label}</span>
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
            placeholder-slate-700 focus:outline-none focus:border-indigo-500/60 transition-colors"
        />
        {schema.type === 'image' && val && (
          <div className="h-20 rounded-lg overflow-hidden bg-white/5 border border-white/10">
            <img src={val} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        )}
        <button
          onClick={confirm}
          className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
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
  depth?: number;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({ section, depth = 0 }) => {
  const {
    isEditorMode,
    previewMode,
    selectedSectionId,
    onSectionSelect,
    onFieldSelect,
    onRemoveSection,
    onPropsChange,
  } = useEditorContext();

  // ── Empty slot: special rendering ─────────────────────────────────────────
  if (section.type === EMPTY_SLOT_TYPE) {
    if (!isEditorMode || previewMode) return null;
    return <EmptySlotBlock section={section} />;
  }

  const Component = componentRegistry.resolve(section.type);
  const entry = componentRegistry.getEntry(section.type);
  const isSelected = isEditorMode && !previewMode && selectedSectionId === section.id;
  const isContainer = entry?.isContainer ?? false;
  const passChildrenDirect = entry?.passChildrenDirect ?? false;

  // ── Refs ─────────────────────────────────────────────────────────────────
  const wrapperRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(section.props);
  propsRef.current = section.props;
  const sectionIdRef = useRef(section.id);
  sectionIdRef.current = section.id;
  const onPropsChangeRef = useRef(onPropsChange);
  onPropsChangeRef.current = onPropsChange;

  // ── State ─────────────────────────────────────────────────────────────────
  const [pendingEditField, setPendingEditField] = useState<string | null>(null);
  const [fieldPicker, setFieldPicker] = useState<FieldPickerState | null>(null);

  // ── Sortable ──────────────────────────────────────────────────────────────
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    disabled: !isEditorMode || previewMode,
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
          />
        ))}
      </>
    ) : null;

  // ── How children are passed to the component ─────────────────────────────
  let childrenForComponent: React.ReactNode;
  if (!isEditorMode || !isContainer) {
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
        isEmpty={!section.children?.length}
      />
    );
  }

  // ── Preview / Production render (no editor chrome) ───────────────────────
  if (!isEditorMode || previewMode) {
    return (
      <div id={section.name || section.id}>
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
    onSectionSelect(section.id);
    setFieldPicker(null);
  };

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.25 : 1,
    zIndex: isDragging ? 999 : undefined,
    width: '100%',
    minWidth: 0,
  };

  // Containers that can add free children (row, section-wrapper, card, etc.)
  // passChildrenDirect containers (columns, split) use _column slots instead
  const canAddFreeChild = isContainer && !passChildrenDirect;
  // passChildrenDirect containers can also add a new column/slot
  const canAddColumn = passChildrenDirect && (section.type === 'columns' || section.type === 'split');

  return (
    <div
      ref={(node) => {
        (wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        setNodeRef(node);
      }}
      id={section.name || section.id}
      style={dragStyle}
      // cms-block: used by CSS :has() hover isolation
      // cms-container-block: applied to container blocks so CSS keeps their
      //   control label visible (dim) even when a child block is hovered.
      className={`relative cms-block select-none${
        isContainer ? ' cms-container-block' : ''
      }${isDragging ? ' shadow-2xl shadow-indigo-500/20' : ''}${isSelected ? ' z-10' : ''}`}
      onClickCapture={handleCapture}
      onClick={handleClick}
    >
      {/* ── Selection ring (always shown when selected) ───────────────── */}
      <div
        className={`absolute inset-0 pointer-events-none rounded-sm transition-all duration-100 ${
          isSelected ? 'ring-2 ring-inset ring-indigo-500 z-20' : ''
        }`}
      />

      {/* ── Hover ring ── controlled purely by CSS :has() in index.css ── */}
      {/*
        The cms-hover-ring class is targeted by:
          .cms-block:hover > .cms-hover-ring  → show ring
          .cms-block:has(.cms-block:hover) > .cms-hover-ring → hide (child hovered)
        The ring is invisible by default and only shows via CSS hover.
      */}
      {!isSelected && (
        <div
          className="cms-hover-ring absolute inset-0 pointer-events-none rounded-sm z-10"
          style={{
            boxShadow: 'inset 0 0 0 1px rgba(129,140,248,0.35)',
            opacity: 0,
            transition: 'opacity 0.1s',
          }}
        />
      )}

      {/* ── Control label ──────────────────────────────────────────────────
        LEAF blocks: appears inside block at top-left corner (top:0, left:0).
          Hidden when any child cms-block is hovered (CSS :has() rule).
        CONTAINER blocks: appears ABOVE the block (top: -22px) so it never
          overlaps with child controls. Depth-based left offset staggers
          nested container labels horizontally.
          Always visible at dim opacity (0.35); full opacity on hover.
        Selected: always opacity-100.
      */}
      <div
        className={`cms-control absolute flex items-center pointer-events-none transition-all duration-150 ${
          isContainer ? 'cms-container-control' : ''
        } ${
          isSelected || isDragging ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          zIndex: 30 + depth,
          // Container labels float ABOVE the block in the gap area
          top: isContainer ? -22 : 0,
          // Stagger left by depth so nested container labels don't stack identically
          left: isContainer ? depth * 8 : 0,
        }}
      >
        <div
          className={`flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium pointer-events-auto whitespace-nowrap shadow-lg shadow-black/60 ${
            isContainer ? 'rounded-t-md rounded-br-md' : 'rounded-br-md'
          } ${
            isSelected
              ? 'bg-indigo-600 text-white'
              : isContainer
              ? 'bg-[#0e0e1c]/98 border border-b-0 border-white/15 text-slate-400'
              : 'bg-[#12121e]/95 border-r border-b border-white/10 text-slate-300'
          }`}
          onClick={(e) => e.stopPropagation()}
          data-editor-chrome
        >
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-0.5 hover:text-white touch-none shrink-0"
            title="Drag to reorder"
            data-editor-chrome
          >
            <GripVertical size={11} />
          </button>

          <span className="shrink-0 flex items-center">{entry?.icon ?? <Settings size={11} />}</span>
          <span className="max-w-[100px] truncate">{entry?.displayName ?? section.type}</span>

          {section.name && (
            <span className="font-mono opacity-60 shrink-0 text-[9px]">#{section.name}</span>
          )}

          {/* "+" — add empty slot for containers */}
          {(canAddFreeChild || canAddColumn) && (
            <button
              data-editor-chrome
              onClick={(e) => {
                e.stopPropagation();
                // Dispatch event — PageEditorPage adds a _empty slot to this container
                window.dispatchEvent(
                  new CustomEvent('cms:addEmptySlot', { detail: { parentId: section.id } }),
                );
              }}
              className="ml-0.5 p-0.5 rounded hover:bg-indigo-500/30 hover:text-indigo-300 text-slate-500 transition-all shrink-0"
              title="Add empty slot"
            >
              <Plus size={10} />
            </button>
          )}

          {/* Delete */}
          <button
            data-editor-chrome
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Remove "${entry?.displayName ?? section.type}"?`)) {
                onRemoveSection(section.id);
              }
            }}
            className="ml-0.5 p-0.5 rounded hover:bg-red-500/40 hover:text-red-400 text-slate-500 transition-all shrink-0"
            title="Remove"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>

      {/* ── The actual component ──────────────────────────────────────── */}
      <Component {...(section.props as Record<string, unknown>)} sectionId={section.name || section.id}>
        {childrenForComponent}
      </Component>

      {/* ── Inline field picker ───────────────────────────────────────── */}
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
