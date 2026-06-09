import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import {
  GripVertical, Trash2, Plus, Minus, Settings,
} from 'lucide-react';
import { componentRegistry } from '../../core/registry/ComponentRegistry';
import { useEditorContext } from '../../core/context/EditorContext';
import { findSectionById } from '../../core/utils/layoutUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PanelPos { x: number; y: number }

// Sentinel meaning "not yet positioned" — placed by useLayoutEffect
const UNSET: PanelPos = { x: -9999, y: -9999 };

// ─── FloatingControlPanel ─────────────────────────────────────────────────────
/**
 * FloatingControlPanel — a draggable floating toolbar for the selected block.
 *
 * Default position: horizontally centred at the bottom of the viewport
 * (above a 24px margin), so it never covers the canvas content by default.
 *
 * The user can drag it anywhere via the grip handle.
 * Position resets to bottom-centre whenever the selected block changes.
 */
const FloatingControlPanel: React.FC = () => {
  const {
    isEditorMode,
    previewMode,
    selectedSectionId,
    sections,
    onRemoveSection,
  } = useEditorContext();

  // ── Position state ───────────────────────────────────────────────────────
  const [pos, setPos] = useState<PanelPos>(UNSET);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragStart = useRef<{ mx: number; my: number; px: number; py: number }>({
    mx: 0, my: 0, px: 0, py: 0,
  });

  // Centre-bottom by default every time selection changes
  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el || !selectedSectionId) return;
    const w = el.offsetWidth || 320;
    const h = el.offsetHeight || 64;
    setPos({
      x: Math.round((window.innerWidth - w) / 2),
      y: Math.round(window.innerHeight - h - 24),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSectionId]);

  // Grip drag
  const onGripMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: dragStart.current.px + ev.clientX - dragStart.current.mx,
        y: dragStart.current.py + ev.clientY - dragStart.current.my,
      });
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [pos]);

  // ── Selected section ─────────────────────────────────────────────────────
  const selectedSection = selectedSectionId
    ? findSectionById(sections, selectedSectionId)
    : null;

  const entry = selectedSection ? componentRegistry.getEntry(selectedSection.type) : null;

  if (!isEditorMode || previewMode || !selectedSection || !entry) return null;

  const isColumns   = selectedSection.type === 'columns';
  const isContainer = !!(entry.isContainer) && !isColumns;
  const passChildrenDirect = !!(entry as { passChildrenDirect?: boolean }).passChildrenDirect;
  const canAddFreeChild    = isContainer && !passChildrenDirect && selectedSection.type !== 'container';
  const colCount = isColumns ? Number(selectedSection.props?.columns ?? 2) : 0;
  const colSpans = isColumns ? (selectedSection.props?.colSpans as number[] | undefined) : undefined;

  // Determine visibility: initially hidden until layout effect fires
  const isVisible = pos !== UNSET;

  return (
    <div
      ref={panelRef}
      data-editor-chrome
      style={{
        position:  'fixed',
        left:      pos.x,
        top:       pos.y,
        zIndex:    9999,
        userSelect: 'none',
        minWidth:  260,
        maxWidth:  420,
        visibility: isVisible ? 'visible' : 'hidden',
      }}
      className="flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/70 border border-white/12 bg-[#0c0c1a]/97 backdrop-blur-md"
    >
      {/* ── Header / Grip ──────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 border-b border-white/8 cursor-grab active:cursor-grabbing select-none bg-white/3"
        onMouseDown={onGripMouseDown}
        data-editor-chrome
      >
        <GripVertical size={14} className="text-slate-600 shrink-0" />

        {/* Block icon */}
        <span className="shrink-0 text-indigo-400 flex items-center" style={{ lineHeight: 1 }}>
          {entry.icon ?? <Settings size={14} />}
        </span>

        {/* Display name */}
        <span className="text-sm font-semibold text-white truncate flex-1">
          {entry.displayName ?? selectedSection.type}
        </span>

        {/* Columns badge */}
        {isColumns && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/6 text-slate-400 shrink-0">
            {colCount} col
            {colSpans && colSpans.some(s => s !== 1) && (
              <span className="ml-1 text-indigo-400">
                {colSpans.map(s => `${s}fr`).join(' · ')}
              </span>
            )}
          </span>
        )}

        {/* Anchor name */}
        {selectedSection.name && (
          <span className="text-[10px] font-mono text-slate-500 shrink-0">
            #{selectedSection.name}
          </span>
        )}
      </div>

      {/* ── Actions ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-3 py-2" data-editor-chrome>

        {/* Add slot — free-child containers */}
        {canAddFreeChild && (
          <ActionBtn
            icon={<Plus size={14} />}
            label="Add slot"
            color="indigo"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent('cms:addEmptySlot', { detail: { parentId: selectedSection.id } }),
              )
            }
          />
        )}

        {/* Columns controls */}
        {isColumns && (
          <>
            <ActionBtn
              icon={<Plus size={14} />}
              label="Add column"
              color="indigo"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent('cms:addColCell', { detail: { columnsId: selectedSection.id } }),
                )
              }
            />
            {colCount > 1 && (
              <ActionBtn
                icon={<Minus size={14} />}
                label="Remove last column"
                color="rose"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent('cms:removeLastCol', { detail: { columnsId: selectedSection.id } }),
                  )
                }
              />
            )}
            {/* Column count readout */}
            <span className="text-[11px] text-slate-500 font-mono px-2">
              {colCount} col
            </span>
          </>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Delete */}
        <ActionBtn
          icon={<Trash2 size={14} />}
          label={`Delete ${entry.displayName}`}
          color="red"
          onClick={() => {
            if (confirm(`Remove "${entry.displayName ?? selectedSection.type}"?`)) {
              onRemoveSection(selectedSection.id);
            }
          }}
        />
      </div>
    </div>
  );
};

// ─── ActionBtn ────────────────────────────────────────────────────────────────
const ActionBtn: React.FC<{
  icon: React.ReactNode;
  label: string;
  color: 'indigo' | 'rose' | 'red' | 'slate';
  onClick: () => void;
}> = ({ icon, label, color, onClick }) => {
  const colorMap = {
    indigo: 'hover:bg-indigo-500/20 hover:text-indigo-300 border-indigo-500/20',
    rose:   'hover:bg-rose-500/20 hover:text-rose-300 border-rose-500/20',
    red:    'hover:bg-red-500/20 hover:text-red-300 border-red-500/20',
    slate:  'hover:bg-white/10 hover:text-white border-white/10',
  };
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={label}
      data-editor-chrome
      className={`
        flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
        text-slate-400 text-xs font-medium
        border border-transparent transition-all duration-150
        ${colorMap[color]}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export { FloatingControlPanel };
