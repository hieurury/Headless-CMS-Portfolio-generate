/**
 * Registry bootstrap — registers only the minimal block set.
 * Import this file ONCE at app startup (main.tsx) before rendering.
 */

import React from 'react';
import {
  PanelTop,
  Columns2,
  LayoutPanelTop,
  Heading1,
  Link2,
  MousePointerClick,
  Sparkles,
  Rows2,
} from 'lucide-react';
import { componentRegistry } from './ComponentRegistry';

// ─── Block Components ─────────────────────────────────────────────────────────
import { NavBarWrapperBlock } from '../../components/blocks/NavBarWrapperBlock';
import { ColumnsBlock } from '../../components/blocks/ColumnsBlock';
import { ContainerBlock } from '../../components/blocks/ContainerBlock';
import { HeadingBlock } from '../../components/blocks/HeadingBlock';
import { LinkBlock } from '../../components/blocks/LinkBlock';
import { ButtonBlock } from '../../components/blocks/ButtonBlock';
import { IconBlock } from '../../components/blocks/IconBlock';
import { RowsBlock } from '../../components/blocks/RowsBlock';

// ─── NavBarWrapperBlock — composable sticky navbar container ──────────────────
componentRegistry.register({
  type: 'nav-bar-wrapper',
  component: NavBarWrapperBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Navbar Wrapper',
  description: 'Sticky navbar container. Drop Columns(2) inside → left: Logo · right: NavGroup with Links + Button.',
  icon: <PanelTop size={16} />,
  category: 'layout',
  isAtom: false,
  isContainer: true,
  defaultChildren: () => [
    {
      id: `_empty-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: '_empty',
      name: '',
      props: {},
      children: [],
    },
  ],
  defaultProps: {
    sticky: true,
    transparent: false,
    padding: 'lg',
    maxWidth: 'xl',
    background: 'dark',
  },
  schema: {
    sticky: { type: 'boolean', label: 'Sticky on Scroll' },
    transparent: { type: 'boolean', label: 'Transparent at Top' },
    background: { type: 'select', label: 'Background Style', options: ['dark', 'glass', 'light', 'none'] },
    padding: { type: 'select', label: 'Horizontal Padding', options: ['sm', 'md', 'lg', 'xl'] },
    maxWidth: { type: 'select', label: 'Content Max Width', options: ['lg', 'xl', '2xl', 'full'] },
  },
});

// ─── Layout Blocks ────────────────────────────────────────────────────────────

componentRegistry.register({
  type: 'columns',
  component: ColumnsBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Columns',
  description: 'Split into N side-by-side columns — each column holds one block directly',
  icon: <Columns2 size={16} />,
  category: 'layout',
  isContainer: true,
  // NOTE: passChildrenDirect is NOT set here — SectionRenderer handles
  // Columns with a dedicated ColumnsGridRenderer path that bypasses the
  // standard ContainerDropZone/passChildrenDirect logic entirely.
  defaultProps: {
    columns: '2',
    gap: 'md',
    align: 'stretch',
  },
  schema: {
    columns: { type: 'select', label: 'Number of Columns', options: ['2', '3', '4'] },
    gap: { type: 'select', label: 'Column Gap', options: ['none', 'sm', 'md', 'lg', 'xl'] },
    align: { type: 'select', label: 'Vertical Align', options: ['start', 'center', 'end', 'stretch'] },
  },
});
componentRegistry.register({
  type: 'rows',
  component: RowsBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Rows' as unknown as string,
  description: 'Split into N rows',
  icon: <Rows2 size={16} />,
  category: 'layout',
  isContainer: true,
  defaultProps: {
    rows: '2',
    gap: 'md',
    align: 'stretch',
  },
  schema: {
    rows: { type: 'select', label: 'Number of Rows', options: ['2', '3', '4'] },
    gap: { type: 'select', label: 'Row Gap', options: ['none', 'sm', 'md', 'lg', 'xl'] },
    align: { type: 'select', label: 'Vertical Align', options: ['start', 'center', 'end', 'stretch'] },
  }
})
componentRegistry.register({
  type: 'container',
  component: ContainerBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Container',
  description: 'Full-size position wrapper — places one block at any of 9 positions (top-left, center, bottom-right…) within the cell',
  icon: <LayoutPanelTop size={16} />,
  category: 'layout',
  isAtom: false,
  isContainer: true,
  // Starts with one empty slot so users can immediately drop a block in
  defaultChildren: () => [
    {
      id: `_empty-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: '_empty',
      name: '',
      props: {},
      children: [],
    },
  ],
  defaultProps: {
    style: 'none',
    padding: 'none',
    borderRadius: 'none',
    align: 'center',
    minHeight: 'none',
  },
  schema: {
    align: {
      type: 'select',
      label: 'Child Position',
      description: 'Where the child block sits inside the container',
      options: [
        'top-left', 'top-center', 'top-right',
        'middle-left', 'center', 'middle-right',
        'bottom-left', 'bottom-center', 'bottom-right',
      ],
    },
    minHeight: { type: 'select', label: 'Min Height', options: ['none', 'sm', 'md', 'lg', 'xl'] },
    style: { type: 'select', label: 'Box Style', options: ['none', 'card', 'glass', 'outlined', 'filled'] },
    padding: { type: 'select', label: 'Padding', options: ['none', 'sm', 'md', 'lg', 'xl'] },
    borderRadius: { type: 'select', label: 'Border Radius', options: ['none', 'sm', 'md', 'lg', 'xl', '2xl'] },
    background: { type: 'color', label: 'Background Color' },
  },
});

// ─── Atomic Blocks ────────────────────────────────────────────────────────────

componentRegistry.register({
  type: 'heading',
  component: HeadingBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Heading',
  description: 'A title or heading text with size, weight, and color options',
  icon: <Heading1 size={16} />,
  category: 'block',
  isAtom: true,
  defaultProps: {
    text: 'Your Heading Here',
    level: 'h2',
    size: 'xl',
    align: 'left',
    gradient: false,
  },
  schema: {
    text: { type: 'string', label: 'Heading Text', placeholder: 'Your Heading Here' },
    level: { type: 'select', label: 'HTML Level', options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
    size: { type: 'select', label: 'Size', options: ['sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] },
    align: { type: 'select', label: 'Alignment', options: ['left', 'center', 'right'] },
    color: { type: 'color', label: 'Text Color' },
    gradient: { type: 'boolean', label: 'Gradient Effect' },
  },
});

componentRegistry.register({
  type: 'link',
  component: LinkBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Link',
  description: 'A single hyperlink — nav style, inline, underline, or pill. Atomic unit for navigation and text links.',
  icon: <Link2 size={16} />,
  category: 'block',
  isAtom: true,
  defaultProps: {
    label: 'Link',
    href: '#',
    variant: 'nav',
    size: 'base',
    align: 'left',
    showIcon: false,
    external: false,
  },
  schema: {
    label: { type: 'string', label: 'Link Text', placeholder: 'About' },
    href: { type: 'link', label: 'URL / Anchor', placeholder: '#about or /page or https://...' },
    variant: { type: 'select', label: 'Style', options: ['inline', 'nav', 'underline', 'pill'] },
    size: { type: 'select', label: 'Size', options: ['sm', 'base', 'lg'] },
    align: { type: 'select', label: 'Alignment', options: ['left', 'center', 'right'] },
    showIcon: { type: 'boolean', label: 'Show Arrow / External Icon' },
    external: { type: 'boolean', label: 'Open in new tab' },
  },
});

componentRegistry.register({
  type: 'button',
  component: ButtonBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Button',
  description: 'A call-to-action button with customizable style',
  icon: <MousePointerClick size={16} />,
  category: 'block',
  isAtom: true,
  defaultProps: {
    label: 'Click Me',
    href: '#',
    variant: 'primary',
    size: 'md',
    shape: 'default',
    align: 'left',
    icon: '',
    iconPosition: 'right',
  },
  schema: {
    label: { type: 'string', label: 'Button Label', placeholder: 'Click Me' },
    href: { type: 'link', label: 'Link / URL', placeholder: '#about or /page or https://...' },
    variant: { type: 'select', label: 'Style', options: ['primary', 'secondary', 'ghost', 'danger', 'success', 'warning', 'outline'] },
    size: { type: 'select', label: 'Size', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { type: 'select', label: 'Shape', options: ['default', 'pill', 'square', 'icon-only'] },
    align: { type: 'select', label: 'Alignment', options: ['left', 'center', 'right'] },
    icon: { type: 'string', label: 'Icon (emoji)', placeholder: '🚀' },
    iconPosition: { type: 'select', label: 'Icon Position', options: ['left', 'right'] },
    fullWidth: { type: 'boolean', label: 'Full Width' },
    external: { type: 'boolean', label: 'Open in new tab' },
  },
});

componentRegistry.register({
  type: 'icon',
  component: IconBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Icon',
  description: 'A Lucide icon with optional background shape and accent color. Atomic — use inside cards, feature rows, or headings.',
  icon: <Sparkles size={16} />,
  category: 'block',
  isAtom: true,
  defaultProps: {
    name: 'Sparkles',
    size: 'md',
    shape: 'rounded',
    accent: 'indigo',
    align: 'left',
  },
  schema: {
    name: { type: 'string', label: 'Icon Name (Lucide)', placeholder: 'Sparkles, Star, Code2, Zap…' },
    size: { type: 'select', label: 'Size', options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    shape: { type: 'select', label: 'Background Shape', options: ['none', 'circle', 'square', 'rounded'] },
    accent: { type: 'select', label: 'Accent Color', options: ['indigo', 'violet', 'emerald', 'amber', 'rose', 'sky', 'slate'] },
    color: { type: 'color', label: 'Custom Icon Color' },
    align: { type: 'select', label: 'Alignment', options: ['left', 'center', 'right'] },
  },
});

console.log(
  `[ComponentRegistry] ✅ ${componentRegistry.getTypes().length} blocks registered:`,
  componentRegistry.getTypes(),
);

export { componentRegistry };
