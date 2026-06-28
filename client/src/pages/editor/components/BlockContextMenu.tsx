import React, { useEffect, useRef, useState } from 'react';
import { useEditorContext } from '../../../core/context/EditorContext';
import { componentRegistry } from '../../../core/registry/ComponentRegistry';
import { findSectionById } from '../../../core/utils/layoutUtils';
import { FieldRenderer } from './SmartPropEditor';
import { ChevronRight, Check } from 'lucide-react';

export interface ContextMenuState {
  sectionId: string;
  x: number;
  y: number;
}

interface BlockContextMenuProps {
  state: ContextMenuState | null;
  onClose: () => void;
}

const MenuItem: React.FC<{
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  children?: React.ReactNode;
  rightSlot?: React.ReactNode;
}> = ({ label, icon, onClick, children, rightSlot }) => {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  return (
    <div
      className="relative px-4 py-2 text-sm flex items-center justify-between hover:bg-white/10 cursor-pointer transition-colors"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {rightSlot}
        {children && <ChevronRight size={14} className="text-[var(--color-text-faint)]" />}
      </div>

      {/* Submenu */}
      {children && isHovered && (
        <div className="absolute top-0 left-full ml-1 min-w-[180px] bg-[#0c0c1a]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-md py-1 z-50 cursor-default" onClick={e => e.stopPropagation()}>
          {children}
        </div>
      )}
    </div>
  );
};

export const BlockContextMenu: React.FC<BlockContextMenuProps> = ({ state, onClose }) => {
  const { sections, onPropsChange, isEditorMode, previewMode } = useEditorContext();
  const menuRef = useRef<HTMLDivElement>(null);

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
  if (!entry || !entry.schema) return null;

  const schema = entry.schema;
  const props = section.props || {};

  // Filter properties
  const contextMenuFields = Object.entries(schema).filter(
    ([, fieldSchema]) => ['select', 'boolean', 'color'].includes(fieldSchema.type)
  );

  const colorFields = contextMenuFields.filter(([, s]) => s.type === 'color');
  const selectFields = contextMenuFields.filter(([, s]) => s.type === 'select');
  const booleanFields = contextMenuFields.filter(([, s]) => s.type === 'boolean');

  const handleFieldChange = (key: string, value: unknown) => {
    onPropsChange(state.sectionId, { ...props, [key]: value });
  };

  // Ensure the menu stays within the viewport
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const MENU_WIDTH = 240;
  
  let { x, y } = state;

  if (x + MENU_WIDTH > viewportWidth) {
    x = viewportWidth - MENU_WIDTH - 10;
  }
  if (y + 300 > viewportHeight) {
    y = Math.max(10, viewportHeight - 350); 
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] flex flex-col rounded-md shadow-2xl shadow-black/80 border border-white/10 bg-[#0c0c1a]/95 backdrop-blur-xl text-[var(--color-text)]"
      style={{
        left: x,
        top: y,
        width: MENU_WIDTH,
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/8 bg-white/5 select-none shrink-0 rounded-t-md">
        <span className="text-[var(--color-text)] font-semibold flex items-center" style={{ lineHeight: 1 }}>
          {entry.icon ?? '⚙️'}
        </span>
        <span className="text-xs font-semibold text-[var(--color-text)] truncate flex-1">
          {entry.displayName ?? section.type}
        </span>
      </div>

      <div className="py-1">
        {contextMenuFields.length === 0 && (
          <div className="text-xs text-[var(--color-text-faint)] text-center py-4">
            No formatting options available.
          </div>
        )}

        {/* Select Fields */}
        {selectFields.map(([key, fieldSchema]) => (
          <MenuItem key={key} label={fieldSchema.label}>
            {fieldSchema.options?.map(opt => (
              <div 
                key={opt}
                className={`px-4 py-2 text-sm hover:bg-white/10 cursor-pointer flex items-center justify-between transition-colors ${props[key] === opt ? 'text-indigo-400 font-medium bg-white/5' : ''}`}
                onClick={() => handleFieldChange(key, opt)}
              >
                <span>{opt}</span>
                {props[key] === opt && <Check size={14} />}
              </div>
            ))}
          </MenuItem>
        ))}

        {/* Boolean Fields */}
        {booleanFields.map(([key, fieldSchema]) => (
          <MenuItem 
            key={key} 
            label={fieldSchema.label}
            onClick={() => handleFieldChange(key, !props[key])}
            rightSlot={
              <div className={`w-8 h-4 rounded-full transition-colors relative ${props[key] ? 'bg-emerald-500' : 'bg-white/20'}`}>
                <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${props[key] ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            }
          />
        ))}

        {/* Color Fields */}
        {colorFields.length > 0 && (
          <MenuItem label="Màu sắc">
            <div className="p-4 space-y-4 w-64 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {colorFields.map(([key, fieldSchema]) => (
                <div key={key}>
                  <FieldRenderer
                    fieldKey={key}
                    schema={{...fieldSchema, label: fieldSchema.label === 'Màu sắc' ? 'Màu' : fieldSchema.label}}
                    value={props[key]}
                    onChange={handleFieldChange}
                  />
                </div>
              ))}
            </div>
          </MenuItem>
        )}
      </div>
    </div>
  );
};
