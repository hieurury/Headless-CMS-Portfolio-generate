import type { ComponentType, ReactNode } from 'react';

// ─── Field Schema Types ───────────────────────────────────────────────────────

/** Describes a single editable field in the props editor UI */
export interface FieldSchema {
  type:
    | 'string'
    | 'number'
    | 'boolean'
    | 'select'
    | 'color'
    | 'image'
    | 'link'
    | 'textarea'
    | 'array'
    | 'table'
    | 'spacing'; // free-form CSS shorthand, e.g. "8px 16px" or "4px 8px 12px 0"
  label: string;
  description?: string;
  placeholder?: string;
  options?: string[]; // for 'select'
  itemSchema?: Record<string, FieldSchema>; // for 'array' — shape of each item
  itemLabel?: string; // for 'array' — label for each item (e.g. "Link", "Skill")
  min?: number; // for 'number'
  max?: number; // for 'number'
  rows?: number; // for 'textarea'
}

// ─── Registry Entry ───────────────────────────────────────────────────────────

/**
 * A registered component definition.
 * Each entry maps a string `type` to a React component + metadata for editor UI.
 */
export interface RegistryEntry {
  type: string;
  component: ComponentType<Record<string, unknown>>;
  displayName: string;
  description?: string;
  icon?: ReactNode;
  category: 'layout' | 'content' | 'media' | 'navigation' | 'form' | 'block';
  isAtom?: boolean;
  isContainer?: boolean;
  isInternal?: boolean;
  /**
   * When true, children are passed directly as the component's children
   * (no ContainerDropZone wrapper at this level).
   * Use for layout components like Columns where children must be direct
   * DOM children for CSS grid/flex to work correctly.
   * Each child is expected to be its own container with its own drop zone.
   */
  passChildrenDirect?: boolean;
  schema?: Record<string, FieldSchema>;
  defaultProps?: Record<string, unknown>;
  defaultChildren?: () => import('../types/layout.types').LayoutSection[];
}
