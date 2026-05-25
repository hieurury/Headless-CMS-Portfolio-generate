/**
 * Registry bootstrap — registers all built-in portfolio components.
 *
 * Import this file ONCE at app startup (main.tsx) before rendering.
 * After this runs, `componentRegistry.resolve('hero')` returns the Hero component.
 *
 * To add a new component:
 *   1. Create the component in src/components/
 *   2. Add an entry here
 *   3. Add a corresponding entry in the backend component-registry.ts
 */

import type React from 'react';
import { componentRegistry } from './ComponentRegistry';
import { Navbar } from '../../components/Navbar/Navbar';
import { Hero } from '../../components/Hero/Hero';
import { About } from '../../components/About/About';
import { Skills } from '../../components/Skills/Skills';
import { Projects } from '../../components/Projects/Projects';
import { Experience } from '../../components/Experience/Experience';
import { Education } from '../../components/Education/Education';
import { Contact } from '../../components/Contact/Contact';
import { Footer } from '../../components/Footer/Footer';

componentRegistry.register({
  type: 'navbar',
  component: Navbar as React.ComponentType<Record<string, unknown>>,
  displayName: 'Navigation Bar',
  category: 'navigation',
});

componentRegistry.register({
  type: 'hero',
  component: Hero as React.ComponentType<Record<string, unknown>>,
  displayName: 'Hero Section',
  category: 'layout',
});

componentRegistry.register({
  type: 'about',
  component: About as React.ComponentType<Record<string, unknown>>,
  displayName: 'About Section',
  category: 'content',
});

componentRegistry.register({
  type: 'skills',
  component: Skills as React.ComponentType<Record<string, unknown>>,
  displayName: 'Skills Grid',
  category: 'content',
});

componentRegistry.register({
  type: 'projects',
  component: Projects as React.ComponentType<Record<string, unknown>>,
  displayName: 'Projects Grid',
  category: 'content',
});

componentRegistry.register({
  type: 'experience',
  component: Experience as React.ComponentType<Record<string, unknown>>,
  displayName: 'Work Experience',
  category: 'content',
});

componentRegistry.register({
  type: 'education',
  component: Education as React.ComponentType<Record<string, unknown>>,
  displayName: 'Education',
  category: 'content',
});

componentRegistry.register({
  type: 'contact',
  component: Contact as React.ComponentType<Record<string, unknown>>,
  displayName: 'Contact Section',
  category: 'form',
});

componentRegistry.register({
  type: 'footer',
  component: Footer as React.ComponentType<Record<string, unknown>>,
  displayName: 'Footer',
  category: 'layout',
});

console.log(
  `[ComponentRegistry] ✅ ${componentRegistry.getTypes().length} components registered:`,
  componentRegistry.getTypes(),
);

export { componentRegistry };
