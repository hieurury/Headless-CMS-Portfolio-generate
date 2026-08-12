/**
 * Template Library — pre-built layout trees composed from existing Layout + Block components.
 *
 * ARCHITECTURE RULE:
 *   Every template MUST be a pure block tree — no monolithic components.
 *   Decompose every pattern to its atomic units: Layout blocks + Atomic blocks.
 */

import React from 'react';
import { PanelTop, Compass, Puzzle, LayoutTemplate, LayoutGrid, Type, Mail } from 'lucide-react';
import type { LayoutSection } from '../types/layout.types';

export interface TemplateEntry {
  id: string;
  name: string;
  description: string;
  category: 'navigation' | 'components' | 'hero' | 'layout';
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
    id: 'navbar-modern',
    name: 'Modern Navbar',
    description: 'Sticky glassmorphism navigation bar',
    category: 'navigation',
    icon: <PanelTop size={24} />,
    build: (): LayoutSection => ({
      id: uid('nav'),
      type: 'nav-bar-wrapper',
      name: 'navbar',
      props: {
        sticky: true,
        background: 'glass',
        padding: 'lg',
        maxWidth: 'xl',
      },
      children: [
        {
          id: uid('cols-outer'),
          type: 'columns',
          name: '',
          props: { columns: '2', gap: 'md', align: 'center', colSpans: [1, 2] },
          children: [
            // Cell 0: Logo / Heading
            {
              id: uid('heading'),
              type: 'heading',
              name: '',
              props: { text: 'STUDIO.', level: 'h2', size: '2xl', align: 'left', gradient: false, letterSpacing: 'tighter' },
              children: [],
            },
            // Cell 1: Nav links + CTA (Flex block for better spacing)
            {
              id: uid('flex-nav'),
              type: 'flex',
              name: '',
              props: { direction: 'row', gap: 'lg', justify: 'end', align: 'center' },
              children: [
                {
                  id: uid('lnk-about'),
                  type: 'link',
                  name: '',
                  props: { label: 'Projects', href: '#projects', variant: 'nav' },
                  children: [],
                },
                {
                  id: uid('lnk-work'),
                  type: 'link',
                  name: '',
                  props: { label: 'Services', href: '#services', variant: 'nav' },
                  children: [],
                },
                {
                  id: uid('btn-cta'),
                  type: 'button',
                  name: '',
                  props: { label: 'Let\'s Talk', href: '#contact', variant: 'solid', size: 'sm', shape: 'pill' },
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
  // HERO
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: 'hero-minimal',
    name: 'Minimal Hero',
    description: 'Clean, typography-focused hero section',
    category: 'hero',
    icon: <Type size={24} />,
    build: (): LayoutSection => ({
      id: uid('hero-container'),
      type: 'container',
      name: 'Hero Section',
      props: {
        style: 'none',
        padding: '120px 24px',
        maxWidth: 'lg',
        alignX: 'center',
        alignY: 'middle',
      },
      children: [
        {
          id: uid('hero-rows'),
          type: 'rows',
          name: '',
          props: { rows: 4, gap: 'lg', alignX: 'center' },
          children: [
            {
              id: uid('hero-badge'),
              type: 'badge',
              name: '',
              props: { text: 'Available for freelance', variant: 'outline', size: 'md', shape: 'pill' },
              children: [],
            },
            {
              id: uid('hero-title'),
              type: 'heading',
              name: '',
              props: { 
                text: 'Crafting Digital Experiences That Matter.', 
                level: 'h1', 
                size: '5xl', 
                textAlign: 'center', 
                letterSpacing: 'tighter' 
              },
              children: [],
            },
            {
              id: uid('hero-desc'),
              type: 'description',
              name: '',
              props: { 
                text: 'I transform complex problems into intuitive, beautiful, and accessible user interfaces. Partnering with visionary brands worldwide.', 
                size: 'lg', 
                textAlign: 'center' 
              },
              children: [],
            },
            {
              id: uid('hero-flex-btn'),
              type: 'flex',
              name: '',
              props: { direction: 'row', gap: 'md', justify: 'center' },
              children: [
                {
                  id: uid('btn-primary'),
                  type: 'button',
                  name: '',
                  props: { label: 'View My Work', variant: 'solid', size: 'lg', shape: 'default' },
                  children: [],
                },
                {
                  id: uid('btn-secondary'),
                  type: 'button',
                  name: '',
                  props: { label: 'About Me', variant: 'ghost', size: 'lg', shape: 'default' },
                  children: [],
                },
              ]
            }
          ]
        }
      ]
    })
  },

  // ════════════════════════════════════════════════════════════════════════════
  // BENTO GRID / LAYOUT
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: 'bento-grid',
    name: 'Bento Grid',
    description: 'Modern asymmetric grid layout for features or gallery',
    category: 'layout',
    icon: <LayoutGrid size={24} />,
    build: (): LayoutSection => ({
      id: uid('bento-wrapper'),
      type: 'container',
      name: 'Bento Wrapper',
      props: {
        style: 'none',
        padding: '64px 24px',
        maxWidth: 'xl',
      },
      children: [
        {
          id: uid('bento-cols'),
          type: 'columns',
          name: '',
          props: { columns: '2', gap: 'lg', alignY: 'stretch', colSpans: [1, 2] },
          children: [
            // Left smaller column
            {
              id: uid('bento-col-1'),
              type: 'container',
              name: '',
              props: { style: 'card', borderRadius: 'lg', padding: '32px' },
              children: [
                {
                  id: uid('c1-rows'),
                  type: 'rows',
                  name: '',
                  props: { rows: 2, gap: 'md' },
                  children: [
                    {
                      id: uid('c1-title'),
                      type: 'heading',
                      name: '',
                      props: { text: 'Design Systems', level: 'h3', size: '2xl', letterSpacing: 'tight' },
                      children: [],
                    },
                    {
                      id: uid('c1-desc'),
                      type: 'description',
                      name: '',
                      props: { text: 'Building robust, scalable design systems that power enterprise applications seamlessly.', size: 'sm' },
                      children: [],
                    }
                  ]
                }
              ]
            },
            // Right larger column (split into rows)
            {
              id: uid('bento-col-2-rows'),
              type: 'rows',
              name: '',
              props: { rows: 2, gap: 'lg' },
              children: [
                {
                  id: uid('bento-c2-top'),
                  type: 'container',
                  name: '',
                  props: { style: 'glass-subtle', borderRadius: 'lg', padding: '0' },
                  children: [
                    {
                      id: uid('c2-img'),
                      type: 'image',
                      name: '',
                      props: { url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop', aspectRatio: '16/9', borderRadius: 'lg', objectFit: 'cover' },
                      children: []
                    }
                  ]
                },
                {
                  id: uid('bento-c2-bot-cols'),
                  type: 'columns',
                  name: '',
                  props: { columns: 2, gap: 'lg' },
                  children: [
                    {
                      id: uid('bento-c2-bot-left'),
                      type: 'container',
                      name: '',
                      props: { style: 'card', borderRadius: 'lg', padding: '24px' },
                      children: [
                         {
                           id: uid('c2-bl-heading'),
                           type: 'heading',
                           name: '',
                           props: { text: 'Prototyping', level: 'h4', size: 'xl' },
                           children: []
                         }
                      ]
                    },
                    {
                      id: uid('bento-c2-bot-right'),
                      type: 'container',
                      name: '',
                      props: { style: 'filled', borderRadius: 'lg', padding: '24px' },
                      children: [
                        {
                           id: uid('c2-br-heading'),
                           type: 'heading',
                           name: '',
                           props: { text: 'Development', level: 'h4', size: 'xl' },
                           children: []
                         }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    })
  },

  // ════════════════════════════════════════════════════════════════════════════
  // COMPONENTS
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: 'cta-section',
    name: 'Call to Action',
    description: 'A sharp, high-contrast CTA block to encourage contact',
    category: 'components',
    icon: <Mail size={24} />,
    build: (): LayoutSection => ({
      id: uid('cta-wrap'),
      type: 'container',
      name: 'CTA Section',
      props: {
        style: 'none',
        padding: '96px 24px',
        maxWidth: 'lg',
      },
      children: [
        {
          id: uid('cta-box'),
          type: 'container',
          name: '',
          props: { style: 'outlined-subtle', padding: '64px 32px', borderRadius: 'sm', alignX: 'center', alignY: 'middle', backgroundColor: 'var(--color-surface-2)' },
          children: [
            {
              id: uid('cta-rows'),
              type: 'rows',
              name: '',
              props: { rows: 3, gap: 'md', alignX: 'center' },
              children: [
                {
                  id: uid('cta-heading'),
                  type: 'heading',
                  name: '',
                  props: { text: 'Let\'s Collaborate', size: '4xl', letterSpacing: 'tighter', textAlign: 'center' },
                  children: [],
                },
                {
                  id: uid('cta-desc'),
                  type: 'description',
                  name: '',
                  props: { text: 'Have a project in mind? Reach out and let\'s build something incredible together.', textAlign: 'center' },
                  children: [],
                },
                {
                  id: uid('cta-flex'),
                  type: 'flex',
                  name: '',
                  props: { direction: 'row', gap: 'md', justify: 'center', margin: '24px 0 0 0' },
                  children: [
                    {
                      id: uid('cta-btn-1'),
                      type: 'button',
                      name: '',
                      props: { label: 'Dribbble', variant: 'outline', size: 'md' },
                      children: [],
                    },
                    {
                      id: uid('cta-btn-2'),
                      type: 'button',
                      name: '',
                      props: { label: 'LinkedIn', variant: 'outline', size: 'md' },
                      children: [],
                    },
                    {
                      id: uid('cta-btn-3'),
                      type: 'button',
                      name: '',
                      props: { label: 'Email', variant: 'solid', size: 'md' },
                      children: [],
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    })
  }

];

// ─── Category Meta ────────────────────────────────────────────────────────────

export const TEMPLATE_CATEGORIES = [
  { id: 'navigation', label: 'Navigation', icon: <Compass size={14} /> },
  { id: 'hero', label: 'Hero Sections', icon: <LayoutTemplate size={14} /> },
  { id: 'layout', label: 'Layouts & Grids', icon: <LayoutGrid size={14} /> },
  { id: 'components', label: 'Components', icon: <Puzzle size={14} /> },
];
