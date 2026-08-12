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
  Image as ImageIcon,
  AlignLeft,
  Tag,
  LayoutList,
  Table as TableIcon,
} from 'lucide-react';
import { componentRegistry } from './ComponentRegistry';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const makeEmptyNode = () => ({
  id: `_empty-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type: '_empty' as const,
  name: '',
  props: {},
  children: [],
});

// ─── Block Components ─────────────────────────────────────────────────────────
import { NavBarWrapperBlock } from '../../components/blocks/NavBarWrapperBlock';
import { ColumnsBlock } from '../../components/blocks/ColumnsBlock';
import { ContainerBlock } from '../../components/blocks/ContainerBlock';
import { HeadingBlock } from '../../components/blocks/HeadingBlock';
import { LinkBlock } from '../../components/blocks/LinkBlock';
import { ButtonBlock } from '../../components/blocks/ButtonBlock';
import { IconBlock } from '../../components/blocks/IconBlock';
import { RowsBlock } from '../../components/blocks/RowsBlock';
import { ImageBlock } from '../../components/blocks/ImageBlock';
import { DescriptionBlock } from '../../components/blocks/DescriptionBlock';
import { BadgeBlock } from '../../components/blocks/BadgeBlock';
import { FlexBlock } from '../../components/blocks/FlexBlock';
import { TableBlock } from '../../components/blocks/TableBlock';


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
    alignX: 'center',
    alignY: 'middle',
    textColor: '',
    backgroundColor: '',
  },
  schema: {
    textColor: { type: 'color', label: 'Text Color' },
    backgroundColor: { type: 'color', label: 'Background Color' },
    sticky: { type: 'boolean', label: 'Sticky on Scroll' },
    transparent: { type: 'boolean', label: 'Transparent at Top' },
    background: { type: 'select', label: 'Background Style', options: ['dark', 'glass', 'light', 'none'] },
    padding: { type: 'select', label: 'Horizontal Padding', options: ['sm', 'md', 'lg', 'xl'] },
    maxWidth: { type: 'select', label: 'Content Max Width', options: ['lg', 'xl', '2xl', 'full'] },
    alignX: { type: 'select', label: 'Horizontal (X)', options: ['left', 'center', 'right'] },
    alignY: { type: 'select', label: 'Vertical (Y)', options: ['top', 'middle', 'bottom'] },
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
  defaultChildren: () => [
    makeEmptyNode(),
    makeEmptyNode(),
  ],
  defaultProps: {
    columns: '2',
    gap: 'md',
    alignX: 'stretch',
    alignY: 'stretch',
    margin: '',
    padding: '',
    textColor: '',
    backgroundColor: '',
  },
  schema: {
    textColor: { type: 'color', label: 'Text Color' },
    backgroundColor: { type: 'color', label: 'Background Color' },
    margin: { type: 'spacing', label: 'Margin', placeholder: '0', description: 'CSS shorthand — e.g. 8px 16px' },
    padding: { type: 'spacing', label: 'Padding', placeholder: '0', description: 'CSS shorthand — e.g. 8px 16px' },
    columns: { type: 'number', label: 'Number of Columns', min: 1, max: 12 },
    gap: { type: 'select', label: 'Column Gap', options: ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] },
    alignX: { type: 'select', label: 'Horizontal Align (X)', options: ['start', 'center', 'end', 'stretch'] },
    alignY: { type: 'select', label: 'Vertical Align (Y)', options: ['start', 'center', 'end', 'stretch'] },
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
  defaultChildren: () => [
    makeEmptyNode(),
    makeEmptyNode(),
  ],
  defaultProps: {
    rows: '2',
    gap: 'md',
    alignX: 'stretch',
    alignY: 'stretch',
    margin: '',
    padding: '',
    textColor: '',
    backgroundColor: '',
  },
  schema: {
    textColor: { type: 'color', label: 'Text Color' },
    backgroundColor: { type: 'color', label: 'Background Color' },
    margin: { type: 'spacing', label: 'Margin', placeholder: '0', description: 'CSS shorthand — e.g. 8px 16px' },
    padding: { type: 'spacing', label: 'Padding', placeholder: '0', description: 'CSS shorthand — e.g. 8px 16px' },
    rows: { type: 'number', label: 'Number of Rows', min: 1, max: 12 },
    gap: { type: 'select', label: 'Row Gap', options: ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] },
    alignX: { type: 'select', label: 'Horizontal Align (X)', options: ['start', 'center', 'end', 'stretch'] },
    alignY: { type: 'select', label: 'Vertical Align (Y)', options: ['start', 'center', 'end', 'stretch'] },
  }
})

componentRegistry.register({
  type: 'flex',
  component: FlexBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Flex',
  description: 'Flexible container — children auto-size to content. Perfect for button groups, icon rows, tags, and any layout where items should not be forced into equal-width cells.',
  icon: <LayoutList size={16} />,
  category: 'layout',
  isContainer: true,
  defaultChildren: () => [makeEmptyNode()],
  defaultProps: {
    direction: 'row',
    gap: 'md',
    justify: 'start',
    align: 'center',
    wrap: 'wrap',
    margin: '',
    padding: '',
    textColor: '',
    backgroundColor: '',
  },
  schema: {
    textColor: { type: 'color', label: 'Text Color' },
    backgroundColor: { type: 'color', label: 'Background Color' },
    margin: { type: 'spacing', label: 'Margin', placeholder: '0', description: 'CSS shorthand — e.g. 8px 16px' },
    padding: { type: 'spacing', label: 'Padding', placeholder: '0', description: 'CSS shorthand — e.g. 8px 16px' },
    direction: { type: 'select', label: 'Direction', options: ['row', 'column', 'row-reverse', 'column-reverse'] },
    gap: { type: 'select', label: 'Gap', options: ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] },
    justify: { type: 'select', label: 'Justify (main axis)', options: ['start', 'center', 'end', 'between', 'around', 'evenly'] },
    align: { type: 'select', label: 'Align (cross axis)', options: ['start', 'center', 'end', 'stretch', 'baseline'] },
    wrap: { type: 'select', label: 'Wrap', options: ['nowrap', 'wrap', 'wrap-reverse'] },
  },
});
componentRegistry.register({
  type: 'container',
  component: ContainerBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Container',
  description: 'Full-size position wrapper — places one block at any of 9 positions within the cell using separate X/Y controls',
  icon: <LayoutPanelTop size={16} />,
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
    style: 'none',
    padding: '',
    margin: '',
    borderRadius: 'none',
    maxWidth: 'none',
    alignX: 'center',
    alignY: 'middle',
    textColor: '',
    backgroundColor: '',
  },
  schema: {
    textColor: { type: 'color', label: 'Text Color' },
    backgroundColor: { type: 'color', label: 'Background Color' },
    maxWidth: {
      type: 'select',
      label: 'Content Max Width',
      description: 'Constrains the maximum horizontal width of child content inside the container',
      options: ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'],
    },
    alignX: {
      type: 'select',
      label: 'Horizontal (X)',
      description: 'Horizontal position of the child inside the container',
      options: ['left', 'center', 'right'],
    },
    alignY: {
      type: 'select',
      label: 'Vertical (Y)',
      description: 'Vertical position of the child inside the container',
      options: ['top', 'middle', 'bottom'],
    },
    style: { type: 'select', label: 'Box Style', options: ['none', 'card', 'glass', 'glass-subtle', 'glass-strong', 'outlined', 'outlined-subtle', 'filled'] },
    borderRadius: { type: 'select', label: 'Border Radius', options: ['none', 'sm', 'md', 'lg', 'full'] },
    margin: { type: 'spacing', label: 'Margin', placeholder: '0', description: 'CSS shorthand — e.g. 8px 16px (T/B · L/R) or 4px 8px 12px 0' },
    padding: { type: 'spacing', label: 'Padding', placeholder: '0', description: 'CSS shorthand — e.g. 8px 16px (T/B · L/R) or 4px 8px 12px 0' },
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
    margin: '',
    padding: '',
    textAlign: 'left',
    alignX: 'left',
    alignY: 'middle',
    gradient: false,
    letterSpacing: 'tight',
    textColor: '',
    backgroundColor: '',
  },
  schema: {
    textColor: { type: 'color', label: 'Text Color' },
    backgroundColor: { type: 'color', label: 'Background Color' },
    text: { type: 'string', label: 'Heading Text', placeholder: 'Your Heading Here' },
    level: { type: 'select', label: 'HTML Level', options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
    size: { type: 'select', label: 'Size', options: ['sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] },
    textAlign: { type: 'select', label: 'Text Align', options: ['left', 'center', 'right'] },
    alignX: { type: 'select', label: 'Horizontal (X)', options: ['left', 'center', 'right'] },
    alignY: { type: 'select', label: 'Vertical (Y)', options: ['top', 'middle', 'bottom'] },
    gradient: { type: 'boolean', label: 'Gradient Effect' },
    letterSpacing: { type: 'select', label: 'Letter Spacing', options: ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'] },
    margin: { type: 'spacing', label: 'Margin', placeholder: '0', description: 'CSS shorthand — e.g. 8px 16px (T/B · L/R) or 4px 8px 12px 0 (T · R · B · L)' },
    padding: { type: 'spacing', label: 'Padding', placeholder: '0', description: 'CSS shorthand — e.g. 8px 16px (T/B · L/R) or 4px 8px 12px 0 (T · R · B · L)' },
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
    alignX: 'left',
    alignY: 'middle',
    showIcon: false,
    external: false,
    margin: '',
    padding: '',
    textColor: '',
    backgroundColor: '',
  },
  schema: {
    textColor: { type: 'color', label: 'Text Color' },
    backgroundColor: { type: 'color', label: 'Background Color' },
    label: { type: 'string', label: 'Link Text', placeholder: 'About' },
    href: { type: 'link', label: 'URL / Anchor', placeholder: '#about or /page or https://...' },
    variant: { type: 'select', label: 'Style', options: ['inline', 'nav', 'underline', 'pill'] },
    size: { type: 'select', label: 'Size', options: ['sm', 'base', 'lg'] },
    alignX: { type: 'select', label: 'Horizontal (X)', options: ['left', 'center', 'right'] },
    alignY: { type: 'select', label: 'Vertical (Y)', options: ['top', 'middle', 'bottom'] },
    showIcon: { type: 'boolean', label: 'Show Arrow / External Icon' },
    external: { type: 'boolean', label: 'Open in new tab' },
    margin: { type: 'spacing', label: 'Margin', placeholder: '0', description: 'CSS shorthand — e.g. 8px 16px' },
    padding: { type: 'spacing', label: 'Padding', placeholder: '0', description: 'CSS shorthand — e.g. 8px 16px' },
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
    variant: 'solid',
    size: 'md',
    shape: 'default',
    alignX: 'left',
    alignY: 'middle',
    icon: '',
    iconPosition: 'right',
    margin: '',
    padding: '',
    fullWidth: false,
    external: false,
    textColor: '',
    backgroundColor: '',
  },
  schema: {
    textColor: { type: 'color', label: 'Text Color' },
    backgroundColor: { type: 'color', label: 'Background Color' },
    label: { type: 'string', label: 'Button Label', placeholder: 'Click Me' },
    href: { type: 'link', label: 'Link / URL', placeholder: '#about or /page or https://...' },
    variant: { type: 'select', label: 'Style', options: ['solid', 'ghost', 'outline'] },
    size: { type: 'select', label: 'Size', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { type: 'select', label: 'Shape', options: ['default', 'square', 'pill', 'icon-only'] },
    alignX: { type: 'select', label: 'Horizontal (X)', options: ['left', 'center', 'right'] },
    alignY: { type: 'select', label: 'Vertical (Y)', options: ['top', 'middle', 'bottom'] },
    icon: { type: 'icon', label: 'Icon', hasPosition: true },
    fullWidth: { type: 'boolean', label: 'Full Width' },
    external: { type: 'boolean', label: 'Open in new tab' },
    margin: { type: 'spacing', label: 'Margin', placeholder: '0', description: 'CSS shorthand — e.g. 8px 16px' },
    padding: { type: 'spacing', label: 'Padding', placeholder: '0', description: 'CSS shorthand — e.g. 8px 16px' },
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
    alignX: 'left',
    alignY: 'middle',
    margin: '',
    padding: '',
    color: '',
    textColor: '',
    backgroundColor: '',
  },
  schema: {
    textColor: { type: 'color', label: 'Text Color' },
    backgroundColor: { type: 'color', label: 'Background Color' },
    name: { type: 'icon', label: 'Icon Name (Lucide)' },
    size: { type: 'select', label: 'Size', options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    shape: { type: 'select', label: 'Background Shape', options: ['none', 'square', 'rounded'] },
    color: { type: 'color', label: 'Custom Icon Color' },
    alignX: { type: 'select', label: 'Horizontal (X)', options: ['left', 'center', 'right'] },
    alignY: { type: 'select', label: 'Vertical (Y)', options: ['top', 'middle', 'bottom'] },
    margin: { type: 'spacing', label: 'Margin', placeholder: '0', description: 'CSS shorthand — e.g. 8px 16px' },
    padding: { type: 'spacing', label: 'Padding', placeholder: '0', description: 'CSS shorthand — e.g. 8px 16px' },
  },
});

componentRegistry.register({
  type: 'image',
  component: ImageBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Image',
  description: 'An image block with customizable aspect ratio, fit, and rounded corners',
  icon: <ImageIcon size={16} />,
  category: 'block',
  isAtom: true,
  defaultProps: {
    url: '',
    alt: 'Image',
    aspectRatio: 'auto',
    objectFit: 'cover',
    filter: 'none',
    borderRadius: 'md',
    alignX: 'center',
    alignY: 'middle',
    textColor: '',
    backgroundColor: '',
  },
  schema: {
    textColor: { type: 'color', label: 'Text Color' },
    backgroundColor: { type: 'color', label: 'Background Color' },
    url: { type: 'image', label: 'Image URL', placeholder: 'https://...' },
    alt: { type: 'string', label: 'Alt Text', placeholder: 'Description of the image' },
    aspectRatio: { type: 'select', label: 'Aspect Ratio', options: ['auto', '16/9', '4/3', '1/1', '3/4'] },
    objectFit: { type: 'select', label: 'Object Fit', options: ['cover', 'contain', 'fill'] },
    filter: { type: 'select', label: 'Image Filter', options: ['none', 'grayscale', 'sepia', 'blur'] },
    borderRadius: { type: 'select', label: 'Border Radius', options: ['none', 'sm', 'md', 'lg', 'full'] },
    alignX: { type: 'select', label: 'Horizontal (X)', options: ['left', 'center', 'right'] },
    alignY: { type: 'select', label: 'Vertical (Y)', options: ['top', 'middle', 'bottom'] },
  },
});

componentRegistry.register({
  type: 'description',
  component: DescriptionBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Description',
  description: 'A block of text suitable for paragraphs, descriptions, or body copy',
  icon: <AlignLeft size={16} />,
  category: 'block',
  isAtom: true,
  defaultProps: {
    text: 'Enter your description here. This block is perfect for paragraphs and longer text.',
    size: 'base',
    textAlign: 'left',
    alignX: 'left',
    alignY: 'middle',
    margin: '',
    padding: '',
    textColor: '',
    backgroundColor: '',
  },
  schema: {
    textColor: { type: 'color', label: 'Text Color' },
    backgroundColor: { type: 'color', label: 'Background Color' },
    text: { type: 'textarea', label: 'Text Content', placeholder: 'Write your description...' },
    size: { type: 'select', label: 'Text Size', options: ['xs', 'sm', 'base', 'lg', 'xl'] },
    textAlign: { type: 'select', label: 'Text Align', options: ['left', 'center', 'right'] },
    alignX: { type: 'select', label: 'Horizontal (X)', options: ['left', 'center', 'right'] },
    alignY: { type: 'select', label: 'Vertical (Y)', options: ['top', 'middle', 'bottom'] },
    margin: { type: 'spacing', label: 'Margin', placeholder: '0', description: 'CSS shorthand — e.g. 8px 16px' },
    padding: { type: 'spacing', label: 'Padding', placeholder: '0', description: 'CSS shorthand — e.g. 8px 16px' },
  },
});

componentRegistry.register({
  type: 'badge',
  component: BadgeBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Badge',
  description: 'A small tag or badge used to highlight status, tags, or features',
  icon: <Tag size={16} />,
  category: 'block',
  isAtom: true,
  defaultProps: {
    text: 'New Feature',
    variant: 'subtle',
    size: 'sm',
    shape: 'rounded',
    alignX: 'left',
    alignY: 'middle',
    margin: '',
    padding: '',
    textColor: '',
    backgroundColor: '',
  },
  schema: {
    textColor: { type: 'color', label: 'Text Color' },
    backgroundColor: { type: 'color', label: 'Background Color' },
    text: { type: 'string', label: 'Badge Text', placeholder: 'New Feature' },
    variant: { type: 'select', label: 'Style Variant', options: ['solid', 'outline', 'subtle'] },
    size: { type: 'select', label: 'Size', options: ['sm', 'md', 'lg'] },
    shape: { type: 'select', label: 'Shape', options: ['rounded', 'square'] },
    alignX: { type: 'select', label: 'Horizontal (X)', options: ['left', 'center', 'right'] },
    alignY: { type: 'select', label: 'Vertical (Y)', options: ['top', 'middle', 'bottom'] },
    margin: { type: 'spacing', label: 'Margin', placeholder: '0', description: 'CSS shorthand — e.g. 8px 16px' },
    padding: { type: 'spacing', label: 'Padding', placeholder: '0', description: 'CSS shorthand — e.g. 8px 16px' },
  },
});

componentRegistry.register({
  type: 'table',
  component: TableBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Table',
  description: 'A data table with rows and columns',
  icon: <TableIcon size={16} />,
  category: 'block',
  isAtom: true,
  defaultProps: {
    tableData: {
      headers: ['Column 1', 'Column 2', 'Column 3'],
      rows: [
        ['Row 1, Cell 1', 'Row 1, Cell 2', 'Row 1, Cell 3'],
        ['Row 2, Cell 1', 'Row 2, Cell 2', 'Row 2, Cell 3'],
      ],
    },
    alignX: 'left',
    alignY: 'middle',
    striped: true,
    bordered: true,
    textColor: '',
    backgroundColor: '',
  },
  schema: {
    textColor: { type: 'color', label: 'Text Color' },
    backgroundColor: { type: 'color', label: 'Background Color' },
    headerBackgroundColor: { type: 'color', label: 'Header Background Color' },
    borderColor: { type: 'color', label: 'Border Color' },
    striped: { type: 'boolean', label: 'Striped Rows' },
    bordered: { type: 'boolean', label: 'Bordered' },
    tableData: { type: 'table', label: 'Table Data' },
    alignX: { type: 'select', label: 'Horizontal (X)', options: ['left', 'center', 'right'] },
    alignY: { type: 'select', label: 'Vertical (Y)', options: ['top', 'middle', 'bottom'] },
  },
});

console.log(
  `[ComponentRegistry] ✅ ${componentRegistry.getTypes().length} blocks registered:`,
  componentRegistry.getTypes(),
);

export { componentRegistry };
