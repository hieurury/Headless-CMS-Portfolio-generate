import type { ComponentType } from 'react';

/**
 * A registered component definition.
 * Each entry maps a string `type` to a React component.
 */
export interface RegistryEntry {
  type: string;
  component: ComponentType<Record<string, unknown>>;
  displayName: string;
  category: 'layout' | 'content' | 'media' | 'navigation' | 'form';
}
