import React, { useEffect, useState } from 'react';
import { Trash2, Plus, Minus, Settings, Copy, Scissors, ClipboardPaste, CopyPlus } from 'lucide-react';
import { componentRegistry } from '../../core/registry/ComponentRegistry';
import { useEditorContext } from '../../core/context/EditorContext';
import { findSectionById } from '../../core/utils/layoutUtils';
import { useAlertStore } from '../../store/alertStore';
import { useUIStore } from '../../store/uiStore';
import { t } from '../../i18n';

// ─── FloatingControlPanel ─────────────────────────────────────────────────────
/**
 * FloatingControlPanel — a pinned floating toolbar for the selected block.
 *
 * Positioned fixed at the top center of the canvas.
 * Animations: slides down to appear, slides up to disappear.
 */
const FloatingControlPanel: React.FC = () => {
  const {
    isEditorMode,
    previewMode,
    selectedSectionId,
    sections,
    onRemoveSection,
  } = useEditorContext();

  const [activeData, setActiveData] = useState<{ section: any; entry: any } | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [hasClipboard, setHasClipboard] = useState(false);
  const { showConfirm } = useAlertStore();
  const { language } = useUIStore();
  const tr = t(language).editor.layersPanel;

  useEffect(() => {
    const section = selectedSectionId ? findSectionById(sections, selectedSectionId) : null;
    const entry = section ? componentRegistry.getEntry(section.type) : null;

    if (section && entry) {
      setActiveData({ section, entry });
      setHasClipboard(!!localStorage.getItem('cms-editor-clipboard'));
    } else {
      const t = setTimeout(() => {
        setActiveData(null);
      }, 200); // reduced timeout for snappier disappearance
      return () => clearTimeout(t);
    }
  }, [selectedSectionId, sections]);

  useEffect(() => {
    if (!selectedSectionId) return;

    const updatePos = () => {
      const el = document.querySelector('.cms-block.z-10');
      if (el) {
        const rect = el.getBoundingClientRect();
        setPos({
          top: rect.bottom,
          left: rect.left + rect.width / 2,
        });
      } else {
        setPos(null);
      }
    };

    updatePos();
    
    // Update on scroll or resize
    window.addEventListener('resize', updatePos);
    const container = document.querySelector('.editor-preview-container');
    if (container) {
      container.addEventListener('scroll', updatePos);
    }
    
    // ResizeObserver in case the block itself changes size
    const el = document.querySelector('.cms-block.z-10');
    let ro: ResizeObserver;
    if (el) {
      ro = new ResizeObserver(updatePos);
      ro.observe(el);
    }

    return () => {
      window.removeEventListener('resize', updatePos);
      if (container) container.removeEventListener('scroll', updatePos);
      if (ro) ro.disconnect();
    };
  }, [selectedSectionId, activeData]);

  if (!isEditorMode || previewMode || !activeData) return null;

  const { section: selectedSection, entry } = activeData;
  const isVisible = !!selectedSectionId && !!pos;

  const isColumns = selectedSection.type === 'columns';
  const isRows = selectedSection.type === 'rows';
  const isContainer = !!(entry.isContainer) && !isColumns && !isRows;
  const passChildrenDirect = !!(entry as { passChildrenDirect?: boolean }).passChildrenDirect;
  const canAddFreeChild = isContainer && !passChildrenDirect;
  const colCount = isColumns ? Number(selectedSection.props?.columns ?? 2) : 0;
  const rowCount = isRows ? Number(selectedSection.props?.rows ?? 1) : 0;

  return (
    <div
      data-editor-chrome
      style={{
        top: pos?.top ?? 0,
        left: pos?.left ?? 0,
        transform: `translateX(-50%) ${isVisible ? 'translateY(0)' : 'translateY(-8px)'}`,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
      className={`
        fixed z-[100] flex items-center p-0.5 gap-0.5
        rounded-b-md shadow-xl shadow-black/30 border border-[var(--color-border)] border-t-0
        bg-[var(--color-surface)]/95 backdrop-blur-md select-none
        transition-[opacity,transform] duration-200 ease-out
      `}
    >
      {/* ── Info / Icon ──────────────────────────────────────────────── */}
      <div
        className="flex flex-col items-center justify-center px-1.5 py-0.5 cursor-default text-[var(--color-text)] min-w-[36px]"
        title={entry.displayName ?? selectedSection.type}
      >
        {entry.icon ?? <Settings size={13} />}
        <span className="text-[8px] uppercase tracking-wider text-[var(--color-text-muted)] mt-[2px] leading-none">
          {entry.displayName ?? selectedSection.type}
        </span>
      </div>

      <div className="w-px h-5 bg-white/10 mx-0.5" />

      {/* ── Actions ────────────────────────────────────────────────────── */}
      {(canAddFreeChild || isColumns || isRows) && (
        <>
          {/* Add slot — free-child containers */}
          {canAddFreeChild && (
            <ActionBtn
              icon={<Plus size={14} />}
              label="Add slot"
              color="indigo"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('cms:addEmptySlot', { detail: { parentId: selectedSection.id } }),
                );
              }}
            />
          )}

          {/* Columns controls */}
          {isColumns && (
            <>
              <ActionBtn
                icon={<Plus size={14} />}
                label="Add column"
                color="indigo"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent('cms:addColCell', { detail: { columnsId: selectedSection.id } }),
                  );
                }}
              />
              {colCount > 1 && (
                <ActionBtn
                  icon={<Minus size={14} />}
                  label="Remove last column"
                  color="rose"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent('cms:removeLastCol', { detail: { columnsId: selectedSection.id } }),
                    );
                  }}
                />
              )}
            </>
          )}

          {/* Rows controls */}
          {isRows && (
            <>
              <ActionBtn
                icon={<Plus size={14} />}
                label="Add row"
                color="indigo"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent('cms:addRowCell', { detail: { rowsId: selectedSection.id } }),
                  );
                }}
              />
              {rowCount > 1 && (
                <ActionBtn
                  icon={<Minus size={14} />}
                  label="Remove last row"
                  color="rose"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent('cms:removeLastRow', { detail: { rowsId: selectedSection.id } }),
                    );
                  }}
                />
              )}
            </>
          )}

          {/* Separator before clipboard actions */}
          <div className="w-px h-5 bg-white/10 mx-0.5" />
        </>
      )}

      {/* Clipboard actions */}
      
      <ActionBtn
        icon={<Copy size={14} />}
        label="Copy"
        color="slate"
        onClick={() => {
          localStorage.setItem('cms-editor-clipboard', JSON.stringify(selectedSection));
          setHasClipboard(true);
        }}
      />
      <ActionBtn
        icon={<Scissors size={14} />}
        label="Cut"
        color="slate"
        onClick={() => {
          localStorage.setItem('cms-editor-clipboard', JSON.stringify(selectedSection));
          setHasClipboard(true);
          onRemoveSection(selectedSection.id);
        }}
      />
      {hasClipboard && (
        <ActionBtn
          icon={<ClipboardPaste size={14} />}
          label="Paste Below"
          color="slate"
          onClick={() => {
            const data = localStorage.getItem('cms-editor-clipboard');
            if (data) {
              try {
                const parsed = JSON.parse(data);
                window.dispatchEvent(
                  new CustomEvent('cms:pasteSection', { detail: { targetId: selectedSection.id, pastedData: parsed } })
                );
              } catch (e) {
                console.error('Failed to parse clipboard data', e);
              }
            }
          }}
        />
      )}
      <ActionBtn
        icon={<CopyPlus size={14} />}
        label="Duplicate"
        color="slate"
        onClick={() => {
          window.dispatchEvent(
            new CustomEvent('cms:pasteSection', { detail: { targetId: selectedSection.id, pastedData: selectedSection } })
          );
        }}
      />

      <div className="w-px h-5 bg-white/10 mx-0.5" />

      {/* Delete */}
      <ActionBtn
        icon={<Trash2 size={14} />}
        label={tr.remove}
        color="red"
        onClick={async () => {
          if (await showConfirm(tr.removeConfirm.replace('{type}', entry.displayName ?? selectedSection.type))) {
            onRemoveSection(selectedSection.id);
          }
        }}
      />
    </div>
  );
};

// ─── ActionBtn ────────────────────────────────────────────────────────────────
const ActionBtn: React.FC<{
  icon: React.ReactNode;
  label: string;
  color: 'indigo' | 'rose' | 'red' | 'slate';
  onClick: () => void | Promise<void>;
}> = ({ icon, label, color, onClick }) => {
  const colorMap = {
    indigo: 'hover:bg-[var(--color-text)]/10 hover:text-[var(--color-text)] border-transparent text-[var(--color-text-muted)]',
    rose:   'hover:bg-red-500/15 hover:text-red-300 border-transparent text-red-400/80',
    red:    'hover:bg-red-500/20 hover:text-red-300 border-transparent text-red-400/90',
    slate:  'hover:bg-[var(--color-text)]/10 hover:brightness-110 hover:text-[var(--color-text)] border-transparent text-[var(--color-text-muted)]',
  };
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={label}
      data-editor-chrome
      className={`
        flex items-center justify-center w-7 h-7 rounded
        border border-transparent transition-all duration-150
        ${colorMap[color]}
      `}
    >
      {icon}
    </button>
  );
};

export { FloatingControlPanel };
