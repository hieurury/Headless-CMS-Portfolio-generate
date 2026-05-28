import type { LayoutSection } from '../types/layout.types';
import { arrayMove } from '@dnd-kit/sortable';

/**
 * Recursively search all nested sections to find one by id.
 */
export function findSectionById(
  sections: LayoutSection[],
  id: string,
): LayoutSection | null {
  for (const s of sections) {
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
    if (sections[i].id === id) return { parent: _parent, index: i };
    if (sections[i].children?.length) {
      const found = findParent(sections[i].children!, id, sections[i]);
      if (found) return found;
    }
  }
  return null;
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

  const recurse = (list: LayoutSection[]): LayoutSection[] => {
    const filtered: LayoutSection[] = [];
    for (const s of list) {
      if (s.id === id) {
        removed = s;
      } else if (s.children?.length) {
        filtered.push({ ...s, children: recurse(s.children) });
      } else {
        filtered.push(s);
      }
    }
    return filtered;
  };

  return [recurse(sections), removed];
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
    if (s.id === id) return { ...s, name };
    if (s.children?.length) {
      return { ...s, children: updateSectionName(s.children, id, name) };
    }
    return s;
  });
}
