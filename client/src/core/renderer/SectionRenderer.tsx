import React from 'react';
import type { LayoutSection } from '../types/layout.types';
import { componentRegistry } from '../registry/ComponentRegistry';

interface SectionRendererProps {
  section: LayoutSection;
}

/**
 * SectionRenderer — resolves a single layout section to its React component.
 *
 * This is the core runtime unit:
 *   section.type → ComponentRegistry.resolve() → <Component {...section.props} />
 *
 * If the type is unregistered, renders a graceful fallback
 * (visible in dev, invisible in production).
 */
export const SectionRenderer: React.FC<SectionRendererProps> = ({ section }) => {
  const Component = componentRegistry.resolve(section.type);

  if (!Component) {
    if (import.meta.env.DEV) {
      return (
        <div
          style={{
            border: '2px dashed #f59e0b',
            borderRadius: '8px',
            padding: '2rem',
            margin: '1rem',
            background: 'rgba(245, 158, 11, 0.05)',
            color: '#f59e0b',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
          }}
        >
          <strong>⚠ Unknown section type: "{section.type}"</strong>
          <pre style={{ marginTop: '0.5rem', opacity: 0.7 }}>
            {JSON.stringify(section.props, null, 2)}
          </pre>
        </div>
      );
    }
    // Production: silently skip unknown sections
    return null;
  }

  // Render children sections recursively if present
  const childrenRendered =
    section.children && section.children.length > 0 ? (
      <div className="section-children">
        {section.children.map((child) => (
          <SectionRenderer key={child.id} section={child} />
        ))}
      </div>
    ) : undefined;

  return (
    <Component
      {...(section.props as Record<string, unknown>)}
      sectionId={section.id}
      children={childrenRendered}
    />
  );
};
