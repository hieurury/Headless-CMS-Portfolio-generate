import type { LayoutSection } from '../types/layout.types';
import { arrayMove } from '@dnd-kit/sortable';

/**
 * Recursively search all nested sections to find one by id.
 * Skips null/undefined entries (can appear in Columns sparse children).
 */
export function findSectionById(
  sections: LayoutSection[],
  id: string,
): LayoutSection | null {
  for (const s of sections) {
    if (!s) continue;                         // guard against null gaps
    if (s.id === id) return s;
    if (s.children?.length) {
      const found = findSectionById(s.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Find the parent of a section (null = top-level).
 * Returns { parent, index } where parent.children[index] === target section.
 */
export function findParent(
  sections: LayoutSection[],
  id: string,
  _parent: LayoutSection | null = null,
): { parent: LayoutSection | null; index: number } | null {
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    if (!s) continue;                         // guard against null gaps
    if (s.id === id) return { parent: _parent, index: i };
    if (s.children?.length) {
      const found = findParent(s.children, id, s);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Check if a section (childId) is a descendant of another section (parentId).
 */
export function isDescendant(
  sections: LayoutSection[],
  parentId: string,
  childId: string,
): boolean {
  let currentId = childId;
  while (true) {
    const parentInfo = findParent(sections, currentId);
    if (!parentInfo || !parentInfo.parent) return false;
    if (parentInfo.parent.id === parentId) return true;
    currentId = parentInfo.parent.id;
  }
}

/**
 * Immutably remove a section by id (from any nesting level).
 * Returns [newSections, removedSection].
 */
export function removeSection(
  sections: LayoutSection[],
  id: string,
): [LayoutSection[], LayoutSection | null] {
  let removed: LayoutSection | null = null;

  const recurse = (list: LayoutSection[], isColumnsChildren = false): LayoutSection[] => {
    const filtered: LayoutSection[] = [];
    for (const s of list) {
      if (!s) { 
        if (isColumnsChildren) filtered.push(s); 
        continue; 
      }
      if (s.id === id) {
        removed = s;
        if (isColumnsChildren) filtered.push(null as unknown as LayoutSection);
      } else if (s.children?.length) {
        filtered.push({ ...s, children: recurse(s.children, s.type === 'columns') });
      } else {
        filtered.push(s);
      }
    }
    return filtered;
  };

  return [recurse(sections, false), removed];
}

/**
 * Immutably add a section as a child of the given parent (by parentId).
 * If atIndex is provided, inserts at that position; otherwise appends.
 */
export function addChildToSection(
  sections: LayoutSection[],
  parentId: string,
  child: LayoutSection,
  atIndex?: number,
): LayoutSection[] {
  return sections.map((s) => {
    if (!s) return s;                         // guard against null gaps
    if (s.id === parentId) {
      const children = [...(s.children ?? [])];
      if (atIndex !== undefined) {
        children.splice(atIndex, 0, child);
      } else {
        children.push(child);
      }
      return { ...s, children };
    }
    if (s.children?.length) {
      return { ...s, children: addChildToSection(s.children, parentId, child, atIndex) };
    }
    return s;
  });
}

/**
 * Immutably reorder children of a container.
 */
export function reorderChildren(
  sections: LayoutSection[],
  parentId: string,
  oldIndex: number,
  newIndex: number,
): LayoutSection[] {
  return sections.map((s) => {
    if (!s) return s;                         // guard against null gaps
    if (s.id === parentId) {
      return { ...s, children: arrayMove(s.children ?? [], oldIndex, newIndex) };
    }
    if (s.children?.length) {
      return { ...s, children: reorderChildren(s.children, parentId, oldIndex, newIndex) };
    }
    return s;
  });
}

/**
 * Move a section (by id) from its current location to a new parent.
 * If toParentId is null, moves to top level at toIndex.
 * If toParentId is set, moves into that container's children at toIndex.
 *
 * NOTE: This is a two-step operation — remove then insert.
 */
export function moveSection(
  sections: LayoutSection[],
  sectionId: string,
  toParentId: string | null,
  toIndex?: number,
): LayoutSection[] {
  // Remove from current location
  const [withoutSection, movedSection] = removeSection(sections, sectionId);
  if (!movedSection) return sections; // not found

  // Insert into new location
  if (toParentId === null) {
    // Add to top level
    const newSections = [...withoutSection];
    const insertAt = toIndex !== undefined ? toIndex : newSections.length;
    newSections.splice(insertAt, 0, movedSection);
    return newSections;
  } else {
    // Add to a container's children
    return addChildToSection(withoutSection, toParentId, movedSection, toIndex);
  }
}

/**
 * Immutably update props of a section by id (at any nesting level).
 */
export function updateSectionProps(
  sections: LayoutSection[],
  id: string,
  newProps: Record<string, unknown>,
): LayoutSection[] {
  return sections.map((s) => {
    if (!s) return s;                         // guard against null gaps
    if (s.id === id) return { ...s, props: newProps };
    if (s.children?.length) {
      return { ...s, children: updateSectionProps(s.children, id, newProps) };
    }
    return s;
  });
}

/**
 * Immutably update the name of a section by id (at any nesting level).
 */
export function updateSectionName(
  sections: LayoutSection[],
  id: string,
  name: string,
): LayoutSection[] {
  return sections.map((s) => {
    if (!s) return s;                         // guard against null gaps
    if (s.id === id) return { ...s, name };
    if (s.children?.length) {
      return { ...s, children: updateSectionName(s.children, id, name) };
    }
    return s;
  });
}

/**
 * Immutably replace a section (by id) with a new section at the same position.
 * Used to replace an _empty placeholder with a real block.
 */
export function replaceSection(
  sections: LayoutSection[],
  targetId: string,
  replacement: LayoutSection,
): LayoutSection[] {
  return sections.map((s) => {
    if (!s) return s;                         // guard against null gaps
    if (s.id === targetId) return replacement;
    if (s.children?.length) {
      return { ...s, children: replaceSection(s.children, targetId, replacement) };
    }
    return s;
  });
}

/**
 * Insert a block into a Columns block's children at a specific cell index.
 *
 * The Columns architecture maps `children[i]` directly to grid cell `i`.
 * When inserting at index > current children count, gaps are preserved as
 * null entries so that subsequent cell indices remain correctly aligned.
 *
 * All recursive utility functions guard against null with `if (!s) continue/return`.
 *
 * If a child already exists at `cellIndex`, the new block replaces it.
 */
export function insertIntoColumnsCell(
  sections: LayoutSection[],
  columnsId: string,
  block: LayoutSection,
  cellIndex: number,
): LayoutSection[] {
  return sections.map((s) => {
    if (!s) return s;                         // guard against null gaps
    if (s.id === columnsId) {
      const existing = s.children ?? [];
      const length = Math.max(existing.length, cellIndex + 1);
      // Build index-aligned array; preserve existing children, null for gaps
      const children = Array.from({ length }, (_, i) => existing[i] ?? null);
      children[cellIndex] = block;
      return { ...s, children: children as LayoutSection[] };
    }
    if (s.children?.length) {
      return { ...s, children: insertIntoColumnsCell(s.children, columnsId, block, cellIndex) };
    }
    return s;
  });
}

/**
 * Insert a block into a Rows block's children at a specific cell index.
 */
export function insertIntoRowsCell(
  sections: LayoutSection[],
  rowsId: string,
  block: LayoutSection,
  cellIndex: number,
): LayoutSection[] {
  return sections.map((s) => {
    if (!s) return s;                         // guard against null gaps
    if (s.id === rowsId) {
      const existing = s.children ?? [];
      const length = Math.max(existing.length, cellIndex + 1);
      const children = Array.from({ length }, (_, i) => existing[i] ?? null);
      children[cellIndex] = block;
      return { ...s, children: children as LayoutSection[] };
    }
    if (s.children?.length) {
      return { ...s, children: insertIntoRowsCell(s.children, rowsId, block, cellIndex) };
    }
    return s;
  });
}
