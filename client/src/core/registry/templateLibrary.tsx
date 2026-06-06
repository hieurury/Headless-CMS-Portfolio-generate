/**
 * Template Library — pre-built layout trees composed from existing Layout + Block components.
 *
 * ARCHITECTURE RULE:
 *   Every template MUST be a pure block tree — no monolithic components.
 *   Decompose every pattern to its atomic units: Layout blocks + Atomic blocks.
 *
 *   Example — Navbar:
 *     nav-bar-wrapper
 *     └── columns (2-col)
 *         ├── heading    (cell 0)
 *         └── columns (4-col) — link · link · link · button  (cell 1)
 *
 * When added to the canvas, the entire tree is injected (not just a single node).
 */

import React from 'react';
import { PanelTop } from 'lucide-react';
import type { LayoutSection } from '../types/layout.types';

export interface TemplateEntry {
  id: string;
  name: string;
  description: string;
  category: 'navigation';
  /** Lucide icon rendered in the template card */
  icon: React.ReactNode;
  /** Builds and returns the LayoutSection tree to inject into the canvas */
  build: () => LayoutSection;
}

// ─── ID Helpers ───────────────────────────────────────────────────────────────

let _counter = 0;
function uid(prefix = 'tpl'): string {
  return `${prefix}-${Date.now()}-${++_counter}`;
}

// ─── Template Definitions ─────────────────────────────────────────────────────

export const templateLibrary: TemplateEntry[] = [

  // ════════════════════════════════════════════════════════════════════════════
  // NAVIGATION
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: 'navbar-default',
    name: 'Navbar',
    description: 'Sticky navigation bar with logo and links',
    category: 'navigation',
    icon: <PanelTop size={24} />,
    build: (): LayoutSection => ({
      id: uid('nav'),
      type: 'nav-bar-wrapper',
      name: 'navbar',
      props: {
        sticky: true,
        background: 'dark',
        padding: 'lg',
        maxWidth: 'xl',
      },
      children: [
        {
          id: uid('cols-outer'),
          type: 'columns',
          name: '',
          props: { columns: '2', gap: 'md', align: 'center' },
          children: [
            // ── Cell 0: Logo / Heading ─────────────────────────────
            {
              id: uid('heading'),
              type: 'heading',
              name: '',
              props: { text: 'My Portfolio', level: 'h2', size: 'xl', align: 'left', gradient: false },
              children: [],
            },
            // ── Cell 1: Nav links + CTA (4-col inner columns) ──────
            {
              id: uid('cols-inner'),
              type: 'columns',
              name: '',
              props: { columns: '4', gap: 'sm', align: 'center' },
              children: [
                {
                  id: uid('lnk-about'),
                  type: 'link',
                  name: '',
                  props: { label: 'About', href: '#about' },
                  children: [],
                },
                {
                  id: uid('lnk-work'),
                  type: 'link',
                  name: '',
                  props: { label: 'Work', href: '#work' },
                  children: [],
                },
                {
                  id: uid('lnk-contact'),
                  type: 'link',
                  name: '',
                  props: { label: 'Contact', href: '#contact' },
                  children: [],
                },
                {
                  id: uid('btn-cta'),
                  type: 'button',
                  name: '',
                  props: { label: 'Hire Me', href: '#contact', variant: 'primary', size: 'sm' },
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    }),
  },

];

// ─── Category Meta ────────────────────────────────────────────────────────────

export const TEMPLATE_CATEGORIES = [
  { id: 'navigation', label: 'Navigation', icon: '🧭' },
];
