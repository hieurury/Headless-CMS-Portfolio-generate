import React, { useEffect, useRef, useState } from 'react';
import { useEditorContext } from '../../../core/context/EditorContext';
import { componentRegistry } from '../../../core/registry/ComponentRegistry';
import { findSectionById } from '../../../core/utils/layoutUtils';
import { Copy, Scissors, ClipboardPaste } from 'lucide-react';

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
      className={`px-4 py-2 text-sm flex items-center gap-2 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed text-[var(--color-text-faint)]' : 'hover:bg-white/10 cursor-pointer'}`}
      onClick={() => {
        if (!disabled && onClick) onClick();
      }}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
};

export const BlockContextMenu: React.FC<BlockContextMenuProps> = ({ state, onClose, onRemove, onPaste }) => {
  const { sections, isEditorMode, previewMode } = useEditorContext();
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
    const handleClickOutside = (e: MouseEvent) => {
      if (e.button !== 0) return; // Ignore right/middle clicks for closing
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Use a slight delay so the event that opened the menu doesn't close it
    setTimeout(() => {
      window.addEventListener('mousedown', handleClickOutside);
    }, 10);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
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

  const handleCopy = () => {
    localStorage.setItem('cms-editor-clipboard', JSON.stringify(section));
    onClose();
  };

  const handleCut = () => {
    localStorage.setItem('cms-editor-clipboard', JSON.stringify(section));
    onRemove(state.sectionId);
    onClose();
  };

  const handlePaste = () => {
    const data = localStorage.getItem('cms-editor-clipboard');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        onPaste(state.sectionId, parsed);
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
      className="fixed z-[9999] flex flex-col rounded-md shadow-2xl shadow-black/80 border border-white/10 bg-[#0c0c1a]/95 backdrop-blur-xl text-[var(--color-text)] py-1"
      style={{ left: x, top: y, width: MENU_WIDTH }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/8 select-none shrink-0 mb-1">
        <span className="text-[var(--color-text)] font-semibold flex items-center" style={{ lineHeight: 1 }}>
          {entry.icon ?? '⚙️'}
        </span>
        <span className="text-xs font-semibold text-[var(--color-text)] truncate flex-1">
          {entry.displayName ?? section.type}
        </span>
      </div>

      <MenuItem label="Sao chép" icon={<Copy size={14} />} onClick={handleCopy} />
      <MenuItem label="Cắt" icon={<Scissors size={14} />} onClick={handleCut} />
      <MenuItem label="Dán" icon={<ClipboardPaste size={14} />} onClick={handlePaste} disabled={!hasClipboard} />
    </div>
  );
};
