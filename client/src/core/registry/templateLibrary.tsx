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
import { PanelTop, Image as ImageIconLucide } from 'lucide-react';
import type { LayoutSection } from '../types/layout.types';

export interface TemplateEntry {
  id: string;
  name: string;
  description: string;
  category: 'navigation' | 'components';
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

  // ════════════════════════════════════════════════════════════════════════════
  // COMPONENTS
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: 'image-card',
    name: 'Image Card',
    description: 'A feature card with an image and descriptive content',
    category: 'components',
    icon: <ImageIconLucide size={24} />,
    build: (): LayoutSection => ({
      id: uid('img-card'),
      type: 'container',
      name: 'Image Card',
      props: {
        style: 'card',
        padding: 'md',
        borderRadius: 'lg',
      },
      children: [
        {
          id: uid('cols'),
          type: 'columns',
          name: '',
          props: { columns: '2', gap: 'lg', align: 'center', colSpans: [1, 2] },
          children: [
            // Cell 0: Image (Left)
            {
              id: uid('img'),
              type: 'image',
              name: '',
              props: {
                url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
                alt: 'Card Image',
                aspectRatio: '4/3',
                objectFit: 'cover',
                borderRadius: 'md',
              },
              children: [],
            },
            // Cell 1: Content Rows (Right)
            {
              id: uid('rows'),
              type: 'rows',
              name: '',
              props: { rows: '4', gap: 'sm', align: 'stretch' },
              children: [
                {
                  id: uid('badge'),
                  type: 'badge',
                  name: '',
                  props: { text: 'New', variant: 'subtle', color: 'indigo', size: 'sm', shape: 'pill' },
                  children: [],
                },
                {
                  id: uid('heading'),
                  type: 'heading',
                  name: '',
                  props: { text: 'Feature Title', level: 'h3', size: '2xl', align: 'left' },
                  children: [],
                },
                {
                  id: uid('desc'),
                  type: 'description',
                  name: '',
                  props: { text: 'This is a description of the feature. It highlights the key benefits and provides more context to the user.', size: 'base', align: 'left' },
                  children: [],
                },
                {
                  id: uid('btn-cols'),
                  type: 'columns',
                  name: '',
                  props: { columns: '2', gap: 'md', align: 'center', colSpans: [1, 1] },
                  children: [
                    {
                      id: uid('btn1'),
                      type: 'button',
                      name: '',
                      props: { label: 'Get Started', variant: 'primary', size: 'md', alignX: 'left' },
                      children: [],
                    },
                    {
                      id: uid('btn2'),
                      type: 'button',
                      name: '',
                      props: { label: 'Learn More', variant: 'outline', size: 'md', alignX: 'left' },
                      children: [],
                    },
                  ],
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
  { id: 'components', label: 'Components', icon: '🧩' },
];
