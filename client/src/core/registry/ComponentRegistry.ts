import type { ComponentType } from 'react';
import type { RegistryEntry } from '../types/registry.types';

/**
 * ComponentRegistry — the central map from layout section type → React component.
 *
 * This is the core of the runtime renderer architecture.
 * AI generation (Phase 3+) generates JSON using these type keys.
 * The renderer resolves each type at runtime to the matching component.
 */
class ComponentRegistry {
  private readonly _registry = new Map<string, RegistryEntry>();

  /**
   * Register a component with its type key.
   * Call this during app initialization — before any rendering occurs.
   */
  register(entry: RegistryEntry): void {
    if (this._registry.has(entry.type)) {
      console.warn(
        `[ComponentRegistry] Type "${entry.type}" is already registered. Overwriting.`,
      );
    }
    this._registry.set(entry.type, entry);
  }

  /**
   * Resolve a type string to its React component.
   * Returns undefined if the type is not registered.
   */
  resolve(type: string): ComponentType<Record<string, unknown>> | undefined {
    return this._registry.get(type)?.component;
  }

  /**
   * Check if a type is registered.
   */
  has(type: string): boolean {
    return this._registry.has(type);
  }

  /**
   * Get all registered entries (useful for debugging / editor UI).
   */
  getAll(): RegistryEntry[] {
    return Array.from(this._registry.values());
  }

  /**
   * Get all registered type keys.
   */
  getTypes(): string[] {
    return Array.from(this._registry.keys());
  }
}

// Singleton registry instance — shared across the entire app
export const componentRegistry = new ComponentRegistry();
