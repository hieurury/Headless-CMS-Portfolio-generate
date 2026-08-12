import React, { useEffect, useRef, useState } from 'react';
import { useEditorContext } from '../../../core/context/EditorContext';
import { componentRegistry } from '../../../core/registry/ComponentRegistry';
import { findSectionById } from '../../../core/utils/layoutUtils';
import { Copy, Scissors, ClipboardPaste, Trash2 } from 'lucide-react';

export interface ContextMenuState {
  sectionId: string;
  x: number;
  y: number;
}

interface BlockContextMenuProps {
  state: ContextMenuState | null;
  onClose: () => void;
  onRemove: (id: string) => void;
  onPaste: (id: string, section: any) => void;
}

const MenuItem: React.FC<{
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ label, icon, onClick, disabled }) => {
  return (
    <div
      className={`px-3 py-1.5 mx-1.5 rounded-sm text-xs font-medium flex items-center gap-2 transition-colors ${disabled ? 'opacity-40 cursor-not-allowed text-[var(--color-text-muted)]' : 'hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer'}`}
      onClick={() => {
        if (!disabled && onClick) onClick();
      }}
    >
      <span className={disabled ? '' : 'text-[var(--color-text)]'}>{icon}</span>
      <span>{label}</span>
    </div>
  );
};

export const BlockContextMenu: React.FC<BlockContextMenuProps> = ({ state, onClose, onRemove, onPaste }) => {
  const { sections, isEditorMode, previewMode, selectedSectionIds, onRemoveSections } = useEditorContext();
  const menuRef = useRef<HTMLDivElement>(null);
  
  // check clipboard
  const [hasClipboard, setHasClipboard] = useState(false);

  useEffect(() => {
    if (state) {
      const data = localStorage.getItem('cms-editor-clipboard');
      setHasClipboard(!!data);
    }
  }, [state]);

  // Handle clicking outside to close
  useEffect(() => {
    if (!state) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay adding the listener so the event that opened the menu doesn't immediately close it
    const timerId = setTimeout(() => {
      window.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('touchstart', handleClickOutside);
    }, 10);
    return () => {
      clearTimeout(timerId);
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('touchstart', handleClickOutside);
    };
  }, [state, onClose]);

  // Handle Escape key to close
  useEffect(() => {
    if (!state) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, onClose]);

  if (!state || !isEditorMode || previewMode) return null;

  const section = findSectionById(sections, state.sectionId);
  if (!section) return null;

  const entry = componentRegistry.getEntry(section.type);
  if (!entry) return null;

  const isMultiSelect = selectedSectionIds.length > 1 && selectedSectionIds.includes(state.sectionId);
  const targetIds = isMultiSelect ? selectedSectionIds : [state.sectionId];

  const handleCopy = () => {
    if (isMultiSelect) {
      const targetSections = targetIds.map(id => findSectionById(sections, id)).filter(Boolean);
      localStorage.setItem('cms-editor-clipboard', JSON.stringify(targetSections));
    } else {
      localStorage.setItem('cms-editor-clipboard', JSON.stringify(section));
    }
    onClose();
  };

  const handleCut = () => {
    if (isMultiSelect) {
      const targetSections = targetIds.map(id => findSectionById(sections, id)).filter(Boolean);
      localStorage.setItem('cms-editor-clipboard', JSON.stringify(targetSections));
      onRemoveSections(targetIds);
    } else {
      localStorage.setItem('cms-editor-clipboard', JSON.stringify(section));
      onRemove(state.sectionId);
    }
    onClose();
  };

  const handleDelete = () => {
    if (isMultiSelect) {
      onRemoveSections(targetIds);
    } else {
      onRemove(state.sectionId);
    }
    onClose();
  };

  const handlePaste = () => {
    const data = localStorage.getItem('cms-editor-clipboard');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          // Reverse so sequential inserting after targetId maintains the original order
          [...parsed].reverse().forEach(p => onPaste(state.sectionId, p));
        } else {
          onPaste(state.sectionId, parsed);
        }
      } catch (e) {
        console.error('Failed to parse clipboard data', e);
      }
    }
    onClose();
  };

  // Ensure the menu stays within the viewport
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const MENU_WIDTH = 200;
  
  let { x, y } = state;

  if (x + MENU_WIDTH > viewportWidth) {
    x = viewportWidth - MENU_WIDTH - 10;
  }
  if (y + 150 > viewportHeight) {
    y = Math.max(10, viewportHeight - 160); 
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] flex flex-col rounded-sm shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-xl text-[var(--color-text)] py-1.5"
      style={{ left: x, top: y, width: MENU_WIDTH }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <div className="flex items-center gap-2 px-3 pb-2 pt-1 border-b border-[var(--color-border)] select-none shrink-0 mb-1">
        <span className="text-[var(--color-text)] font-semibold flex items-center" style={{ lineHeight: 1 }}>
          {isMultiSelect ? '📦' : (entry.icon ?? '⚙️')}
        </span>
        <span className="text-xs font-semibold text-[var(--color-text)] truncate flex-1">
          {isMultiSelect ? `Đã chọn ${targetIds.length} mục` : (entry.displayName ?? section.type)}
        </span>
      </div>

      <MenuItem label="Sao chép" icon={<Copy size={14} />} onClick={handleCopy} />
      <MenuItem label="Cắt" icon={<Scissors size={14} />} onClick={handleCut} />
      <MenuItem label="Dán" icon={<ClipboardPaste size={14} />} onClick={handlePaste} disabled={!hasClipboard} />
      <div className="h-px bg-white/10 mx-2 my-1" />
      <MenuItem label="Xoá" icon={<Trash2 size={14} className="text-red-400" />} onClick={handleDelete} />
    </div>
  );
};
