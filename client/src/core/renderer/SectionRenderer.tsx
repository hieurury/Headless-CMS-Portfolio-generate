import React, { useRef } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, Settings } from 'lucide-react';
import type { LayoutSection } from '../types/layout.types';
import { componentRegistry } from '../registry/ComponentRegistry';
import { useEditorContext } from '../context/EditorContext';

// ─── Drop ID helpers ──────────────────────────────────────────────────────────
export const CONTAINER_DROP_PREFIX = 'drop:';
export const toDropId = (id: string) => `${CONTAINER_DROP_PREFIX}${id}`;
export const fromDropId = (dropId: string) => dropId.replace(CONTAINER_DROP_PREFIX, '');
export const isDropId = (id: string) => id.startsWith(CONTAINER_DROP_PREFIX);

// ─── Container Drop Zone ──────────────────────────────────────────────────────

/**
 * Renders the empty/children area of a container block in editor mode.
 * Uses useDroppable so blocks can be dragged in.
 * Also renders a SortableContext for reordering children within.
 */
const ContainerDropZone: React.FC<{
  section: LayoutSection;
  renderedChildren: React.ReactNode;
  isEmpty: boolean;
}> = ({ section, renderedChildren, isEmpty }) => {
  const { isOver, setNodeRef } = useDroppable({ id: toDropId(section.id) });
  // onAddChild not needed here — button dispatches custom event directly

  return (
    <div
      ref={setNodeRef}
      className={`
        relative min-h-[56px] rounded-lg transition-all duration-200 w-full
        ${isOver
          ? 'bg-indigo-500/12 ring-2 ring-inset ring-indigo-500/60'
          : 'bg-transparent'
        }
        ${isEmpty ? 'border border-dashed border-white/10' : ''}
      `}
    >
      {isEmpty && !isOver ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 py-4">
          <p className="text-xs text-slate-600 font-medium">Drop blocks here</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Dispatch a custom event to open AddPanel in child mode
              window.dispatchEvent(new CustomEvent('cms:addChild', {
                detail: { parentId: section.id },
              }));
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-500 hover:text-white hover:bg-white/10 text-xs transition-all"
          >
            <Plus size={12} /> Add block
          </button>
        </div>
      ) : (
        <SortableContext
          items={(section.children ?? []).map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {renderedChildren}
          {/* Drop indicator when dragging over */}
          {isOver && (
            <div className="h-1 mx-4 my-1 rounded-full bg-indigo-500/60 animate-pulse" />
          )}
          {/* Add block button at bottom */}
          {(section.children?.length ?? 0) > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent('cms:addChild', {
                  detail: { parentId: section.id },
                }));
              }}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-white/10 text-slate-700 hover:text-slate-400 hover:border-indigo-500/30 text-xs transition-all"
            >
              <Plus size={11} /> Add block
            </button>
          )}
        </SortableContext>
      )}
    </div>
  );
};

// ─── SectionRenderer ──────────────────────────────────────────────────────────

interface SectionRendererProps {
  section: LayoutSection;
  /** true = top-level section in preview — gets its own sortable drag handle */
  isRoot?: boolean;
  /** true = this is a child inside a container block */
  isChild?: boolean;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({
  section,
  // isRoot and isChild reserved for future use — all items are sortable in their context
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isRoot: _isRoot = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isChild: _isChild = false,
}) => {
  const {
    isEditorMode,
    selectedSectionId,
    onSectionSelect,
    onFieldSelect,
    onRemoveSection,
  } = useEditorContext();

  const Component = componentRegistry.resolve(section.type);
  const entry = componentRegistry.getEntry(section.type);
  const isSelected = isEditorMode && selectedSectionId === section.id;
  const isContainer = entry?.isContainer ?? false;
  const passChildrenDirect = entry?.passChildrenDirect ?? false;
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Every item is sortable (within its SortableContext — either top-level or parent container)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    disabled: !isEditorMode,
  });

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

  // ── Render children (recursive) ──────────────────────────────────────
  const renderedChildren =
    (section.children?.length ?? 0) > 0 ? (
      <>
        {section.children!.map((child) => (
          <SectionRenderer
            key={child.id}
            section={child}
            isRoot={false}
            isChild={true}
          />
        ))}
      </>
    ) : null;

  // ── Determine how children are passed to the component ───────────────
  let childrenForComponent: React.ReactNode;

  if (!isEditorMode || !isContainer) {
    // Production or non-container: pass children directly
    childrenForComponent = renderedChildren;
  } else if (passChildrenDirect) {
    // e.g. ColumnsBlock: children MUST be direct DOM children for CSS grid.
    // Each child (_column) is itself a container and handles its own drop zone.
    // Wrap in SortableContext so columns can be reordered by dragging.
    childrenForComponent = (
      <SortableContext
        items={(section.children ?? []).map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        {renderedChildren}
      </SortableContext>
    );
  } else {
    // Normal container (Card, Row, Container): wrap in a single drop zone
    childrenForComponent = (
      <ContainerDropZone
        section={section}
        renderedChildren={renderedChildren}
        isEmpty={!section.children?.length}
      />
    );
  }

  const sectionContent = (
    <Component
      {...(section.props as Record<string, unknown>)}
      sectionId={section.name || section.id}
    >
      {childrenForComponent}
    </Component>
  );

  // ── Production mode ──────────────────────────────────────────────────
  if (!isEditorMode) {
    return (
      <div id={section.name || section.id}>
        {/* In production, pass children directly without editor UI */}
        <Component
          {...(section.props as Record<string, unknown>)}
          sectionId={section.name || section.id}
        >
          {renderedChildren}
        </Component>
      </div>
    );
  }

  // ── Editor mode ──────────────────────────────────────────────────────

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Walk up to find data-cms-field
    let el = e.target as HTMLElement | null;
    while (el && el !== wrapperRef.current) {
      const fieldKey = el.getAttribute('data-cms-field');
      if (fieldKey) {
        onFieldSelect(section.id, fieldKey);
        return;
      }
      el = el.parentElement;
    }
    onSectionSelect(section.id);
  };

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.25 : 1,
    zIndex: isDragging ? 999 : undefined,
    width: '100%',
    minWidth: 0, // prevent grid cell blowout when inside CSS grid
  };

  return (
    <div
      ref={(node) => {
        (wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        setNodeRef(node);
      }}
      id={section.name || section.id}
      style={dragStyle}
      className={`relative group/section select-none${isDragging ? ' shadow-2xl shadow-indigo-500/20' : ''}${isSelected ? ' z-10' : ''}`}
      onClick={handleClick}
    >
      {/* Selection / hover ring */}
      <div
        className={`
          absolute inset-0 z-10 pointer-events-none rounded-sm transition-all duration-150
          ${isSelected
            ? 'ring-2 ring-inset ring-indigo-500'
            : 'group-hover/section:ring-1 group-hover/section:ring-inset group-hover/section:ring-indigo-500/30'
          }
        `}
      />

      {/* Floating label — floats ABOVE the element (translateY -100%) to avoid overlap */}
      <div
        className={`
          absolute left-0 z-30 flex items-center
          pointer-events-none
          transition-all duration-150
          ${isSelected || isDragging
            ? 'opacity-100'
            : 'opacity-0 group-hover/section:opacity-100'
          }
        `}
        style={{ top: 0, transform: 'translateY(-100%)' }}
      >
        <div
          className={`
            flex items-center gap-1 px-2 py-0.5 rounded-t-md text-[10px] font-medium
            pointer-events-auto whitespace-nowrap
            shadow-lg shadow-black/40
            ${isSelected
              ? 'bg-indigo-600 text-white'
              : 'bg-[#1a1a2e]/95 border border-white/10 text-slate-300'
            }
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-0.5 hover:text-white touch-none shrink-0"
            title="Drag to reorder"
          >
            <GripVertical size={11} />
          </button>
          <span className="shrink-0 flex items-center">{entry?.icon ?? <Settings size={11} />}</span>
          <span className="max-w-[120px] truncate">{entry?.displayName ?? section.type}</span>
          {section.name && (
            <span className="font-mono opacity-70 shrink-0">#{section.name}</span>
          )}
          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Remove "${entry?.displayName ?? section.type}"?`)) {
                onRemoveSection(section.id);
              }
            }}
            className="ml-1 p-0.5 rounded hover:bg-red-500/40 hover:text-red-400 text-slate-500 transition-all shrink-0"
            title="Remove"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>

      {sectionContent}
    </div>
  );
};
