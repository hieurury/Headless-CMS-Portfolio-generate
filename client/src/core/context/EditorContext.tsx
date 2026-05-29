import React, { createContext, useContext } from 'react';
import type { LayoutSection } from '../types/layout.types';

export interface EditorContextValue {
  isEditorMode: boolean;
  /** true = Preview mode (links work, no editing). false = Edit mode (inline editing active). */
  previewMode: boolean;
  selectedSectionId: string | null;
  selectedFieldKey: string | null;
  sections: LayoutSection[];

  // Selection
  onSectionSelect: (id: string) => void;
  onFieldSelect: (sectionId: string, fieldKey: string) => void;

  // Preview mode toggle
  onTogglePreviewMode: () => void;

  // Top-level reorder (by index, from sidebar or preview sort)
  onSectionReorder: (oldIndex: number, newIndex: number) => void;

  // Child management (for container blocks)
  onAddChild: (parentId: string, childType?: string) => void;
  onRemoveSection: (sectionId: string) => void;
  onMoveToContainer: (sectionId: string, toContainerId: string | null, toIndex?: number) => void;
  onReorderChildren: (parentId: string, oldIndex: number, newIndex: number) => void;
  /** Replace an _empty slot block with a real block that was dragged onto it */
  onReplaceEmptySlot: (sectionId: string, slotId: string) => void;

  // Props / name editing (works for any depth — finds section by id)
  onPropsChange: (sectionId: string, newProps: Record<string, unknown>) => void;
  onNameChange: (sectionId: string, name: string) => void;
}

const noop = () => {};

const EditorContext = createContext<EditorContextValue>({
  isEditorMode: false,
  previewMode: false,
  selectedSectionId: null,
  selectedFieldKey: null,
  sections: [],
  onSectionSelect: noop,
  onFieldSelect: noop,
  onTogglePreviewMode: noop,
  onSectionReorder: noop,
  onAddChild: noop,
  onRemoveSection: noop,
  onMoveToContainer: noop,
  onReorderChildren: noop,
  onReplaceEmptySlot: noop,
  onPropsChange: noop,
  onNameChange: noop,
});

export const EditorProvider: React.FC<{
  value: EditorContextValue;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
);

export const useEditorContext = () => useContext(EditorContext);
