/**
 * Registry bootstrap — registers ONLY composable blocks (Layout + Atomic).
 *
 * The old monolithic Section components (Hero, About, Skills, Projects,
 * Experience, Education, Contact, Footer, Navbar) have been removed.
 *
 * All page sections are now built by composing these blocks in the Template
 * Library. Every block element has a schema and supports inline editing.
 *
 * Import this file ONCE at app startup (main.tsx) before rendering.
 */

import React from 'react';
import {
  Navigation,
  Heading1, AlignLeft, MousePointerClick, Tag, ImageIcon,
  Minus, MoveVertical, LayoutPanelTop, Columns2, Square,
  AlignJustify, Layers, SplitSquareHorizontal, TrendingUp,
  Star, Clock,
} from 'lucide-react';
import { componentRegistry } from './ComponentRegistry';

// ─── Atomic Block Components ──────────────────────────────────────────────────
import { NavbarBlock } from '../../components/blocks/NavbarBlock';
import { HeadingBlock } from '../../components/blocks/HeadingBlock';
import { TextBlock } from '../../components/blocks/TextBlock';
import { ButtonBlock } from '../../components/blocks/ButtonBlock';
import { BadgeBlock } from '../../components/blocks/BadgeBlock';
import { ImageBlock } from '../../components/blocks/ImageBlock';
import { DividerBlock } from '../../components/blocks/DividerBlock';
import { SpacerBlock } from '../../components/blocks/SpacerBlock';
import { ContainerBlock } from '../../components/blocks/ContainerBlock';
// ─── Layout / Container Block Components ─────────────────────────────────────
import { ColumnsBlock } from '../../components/blocks/ColumnsBlock';
import { ColumnSlotBlock } from '../../components/blocks/ColumnSlotBlock';
import { CardBlock } from '../../components/blocks/CardBlock';
import { RowBlock } from '../../components/blocks/RowBlock';
import { SectionWrapperBlock } from '../../components/blocks/SectionWrapperBlock';
import { SplitBlock } from '../../components/blocks/SplitBlock';
// ─── Content Atomic Blocks ────────────────────────────────────────────────────
import { StatBlock } from '../../components/blocks/StatBlock';
import { FeatureCardBlock } from '../../components/blocks/FeatureCardBlock';
import { TimelineItemBlock } from '../../components/blocks/TimelineItemBlock';

// ─── Navigation ───────────────────────────────────────────────────────────────

componentRegistry.register({
  type: 'navbar',
  component: NavbarBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Navigation Bar',
  description: 'Sticky top navigation with logo, links, and optional CTA button. Supports smooth scroll anchors.',
  icon: <Navigation size={16} />,
  category: 'navigation',
  isAtom: true,
  defaultProps: {
    logo: 'My Portfolio',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Projects', href: '#projects' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaLabel: 'Hire Me',
    ctaHref: '#contact',
    sticky: true,
    transparent: false,
  },
  schema: {
    logo: { type: 'string', label: 'Logo Text', placeholder: 'My Portfolio' },
    links: {
      type: 'array',
      label: 'Navigation Links',
      itemLabel: 'Link',
      itemSchema: {
        label: { type: 'string', label: 'Label', placeholder: 'About' },
        href: { type: 'link', label: 'URL / Anchor', placeholder: '#about or /page' },
      },
    },
    ctaLabel: { type: 'string', label: 'CTA Button Label', placeholder: 'Hire Me' },
    ctaHref: { type: 'link', label: 'CTA Button URL', placeholder: '#contact' },
    sticky: { type: 'boolean', label: 'Sticky on Scroll' },
    transparent: { type: 'boolean', label: 'Transparent when at top' },
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
  type: 'text',
  component: TextBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Text / Paragraph',
  description: 'A block of body text or paragraph content',
  icon: <AlignLeft size={16} />,
  category: 'block',
  isAtom: true,
  defaultProps: {
    content: 'Write your paragraph text here. You can add multiple lines.',
    size: 'base',
    align: 'left',
    muted: false,
  },
  schema: {
    content: { type: 'textarea', label: 'Content', rows: 4, placeholder: 'Your text here...' },
    size: { type: 'select', label: 'Font Size', options: ['sm', 'base', 'lg', 'xl'] },
    align: { type: 'select', label: 'Alignment', options: ['left', 'center', 'right'] },
    color: { type: 'color', label: 'Text Color' },
    muted: { type: 'boolean', label: 'Muted / Secondary Color' },
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
    align: 'left',
    icon: '',
  },
  schema: {
    label: { type: 'string', label: 'Button Label', placeholder: 'Click Me' },
    href: { type: 'link', label: 'Link / URL', placeholder: '#about or /page or https://...' },
    variant: { type: 'select', label: 'Style', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { type: 'select', label: 'Size', options: ['sm', 'md', 'lg'] },
    align: { type: 'select', label: 'Alignment', options: ['left', 'center', 'right'] },
    icon: { type: 'string', label: 'Icon (emoji or leave empty)', placeholder: '🚀' },
    fullWidth: { type: 'boolean', label: 'Full Width' },
  },
});

componentRegistry.register({
  type: 'badge',
  component: BadgeBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Badge / Tag',
  description: 'A small badge or tag label',
  icon: <Tag size={16} />,
  category: 'block',
  isAtom: true,
  defaultProps: {
    label: 'New',
    variant: 'indigo',
    align: 'left',
  },
  schema: {
    label: { type: 'string', label: 'Badge Label', placeholder: 'New' },
    variant: { type: 'select', label: 'Color', options: ['indigo', 'violet', 'emerald', 'amber', 'rose', 'sky', 'slate'] },
    align: { type: 'select', label: 'Alignment', options: ['left', 'center', 'right'] },
    dot: { type: 'boolean', label: 'Show Dot Indicator' },
  },
});

componentRegistry.register({
  type: 'image',
  component: ImageBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Image',
  description: 'An image with optional caption and styling',
  icon: <ImageIcon size={16} />,
  category: 'block',
  isAtom: true,
  defaultProps: {
    src: '',
    alt: 'Image',
    width: '100%',
    borderRadius: 'lg',
    align: 'center',
  },
  schema: {
    src: { type: 'image', label: 'Image URL' },
    alt: { type: 'string', label: 'Alt Text', placeholder: 'Image description' },
    caption: { type: 'string', label: 'Caption (optional)', placeholder: 'Image caption' },
    width: { type: 'string', label: 'Width', placeholder: '100% or 400px' },
    borderRadius: { type: 'select', label: 'Border Radius', options: ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'] },
    align: { type: 'select', label: 'Alignment', options: ['left', 'center', 'right'] },
  },
});

componentRegistry.register({
  type: 'divider',
  component: DividerBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Divider',
  description: 'A horizontal dividing line',
  icon: <Minus size={16} />,
  category: 'block',
  isAtom: true,
  defaultProps: {
    style: 'solid',
    spacing: 'md',
  },
  schema: {
    style: { type: 'select', label: 'Line Style', options: ['solid', 'dashed', 'dotted', 'gradient'] },
    spacing: { type: 'select', label: 'Vertical Spacing', options: ['sm', 'md', 'lg', 'xl'] },
    color: { type: 'color', label: 'Line Color' },
  },
});

componentRegistry.register({
  type: 'spacer',
  component: SpacerBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Spacer',
  description: 'Empty vertical space to control layout spacing',
  icon: <MoveVertical size={16} />,
  category: 'block',
  isAtom: true,
  defaultProps: { height: 'md' },
  schema: {
    height: { type: 'select', label: 'Height', options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
  },
});

// ─── Layout / Container Blocks ────────────────────────────────────────────────

componentRegistry.register({
  type: 'container',
  component: ContainerBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Container',
  description: 'A styled box that holds and groups other blocks',
  icon: <LayoutPanelTop size={16} />,
  category: 'layout',
  isAtom: false,
  isContainer: true,
  defaultProps: {
    padding: 'md',
    style: 'card',
    maxWidth: 'none',
  },
  schema: {
    style: { type: 'select', label: 'Style', options: ['card', 'glass', 'outlined', 'filled', 'none'] },
    padding: { type: 'select', label: 'Padding', options: ['none', 'sm', 'md', 'lg', 'xl'] },
    maxWidth: { type: 'select', label: 'Max Width', options: ['none', 'sm', 'md', 'lg', 'xl', '2xl'] },
    background: { type: 'color', label: 'Background Color' },
    borderRadius: { type: 'select', label: 'Border Radius', options: ['none', 'sm', 'md', 'lg', 'xl', '2xl'] },
  },
});

componentRegistry.register({
  type: 'columns',
  component: ColumnsBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Columns',
  description: 'Split into N side-by-side columns — each column holds other blocks',
  icon: <Columns2 size={16} />,
  category: 'layout',
  isContainer: true,
  passChildrenDirect: true,
  defaultProps: {
    columns: '2',
    gap: 'md',
    align: 'start',
  },
  schema: {
    columns: { type: 'select', label: 'Number of Columns', options: ['2', '3', '4'] },
    gap: { type: 'select', label: 'Column Gap', options: ['none', 'sm', 'md', 'lg', 'xl'] },
    align: { type: 'select', label: 'Vertical Align', options: ['start', 'center', 'end', 'stretch'] },
  },
});

// Internal column slot — not shown in AddPanel
componentRegistry.register({
  type: '_column',
  component: ColumnSlotBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Column',
  description: 'A column slot inside a Columns block',
  icon: <Square size={16} />,
  category: 'layout',
  isContainer: true,
  isInternal: true,
  defaultProps: {},
  schema: {
    align: { type: 'select', label: 'Align Items', options: ['start', 'center', 'end'] },
    gap: { type: 'select', label: 'Gap', options: ['none', 'sm', 'md', 'lg'] },
  },
});

componentRegistry.register({
  type: 'card',
  component: CardBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Card',
  description: 'A styled card that can hold other blocks inside',
  icon: <Square size={16} />,
  category: 'layout',
  isContainer: true,
  defaultProps: {
    variant: 'default',
    padding: 'md',
    radius: 'xl',
    showHeader: false,
  },
  schema: {
    variant: { type: 'select', label: 'Style', options: ['default', 'glass', 'outlined', 'elevated', 'gradient'] },
    padding: { type: 'select', label: 'Padding', options: ['none', 'sm', 'md', 'lg'] },
    radius: { type: 'select', label: 'Border Radius', options: ['none', 'sm', 'md', 'lg', 'xl', '2xl'] },
    showHeader: { type: 'boolean', label: 'Show Header' },
    title: { type: 'string', label: 'Title', placeholder: 'Card title' },
    subtitle: { type: 'string', label: 'Subtitle', placeholder: 'Subtitle' },
    accentColor: { type: 'color', label: 'Accent Color' },
  },
});

componentRegistry.register({
  type: 'row',
  component: RowBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Row',
  description: 'Vertical stack — blocks pile up from top to bottom, each taking full width',
  icon: <AlignJustify size={16} />,
  category: 'layout',
  isContainer: true,
  defaultProps: {
    gap: 'md',
    align: 'stretch',
    padding: 'none',
  },
  schema: {
    gap: { type: 'select', label: 'Gap between items', options: ['none', 'sm', 'md', 'lg', 'xl'] },
    align: { type: 'select', label: 'Align Items', options: ['start', 'center', 'end', 'stretch'] },
    padding: { type: 'select', label: 'Inner Padding', options: ['none', 'sm', 'md', 'lg'] },
  },
});

componentRegistry.register({
  type: 'section-wrapper',
  component: SectionWrapperBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Section Wrapper',
  description: 'Full-width section container with optional title, subtitle, and background. Wrap any blocks inside to build custom sections.',
  icon: <Layers size={16} />,
  category: 'layout',
  isContainer: true,
  defaultProps: {
    title: '',
    subtitle: '',
    label: '',
    align: 'center',
    padding: 'lg',
    background: 'default',
    maxWidth: 'xl',
    showDivider: false,
  },
  schema: {
    label: { type: 'string', label: 'Label (above title)', placeholder: 'About · Work · Skills' },
    title: { type: 'string', label: 'Section Title', placeholder: 'My Work' },
    subtitle: { type: 'string', label: 'Subtitle', placeholder: 'A short description' },
    align: { type: 'select', label: 'Header Alignment', options: ['left', 'center', 'right'] },
    padding: { type: 'select', label: 'Vertical Padding', options: ['sm', 'md', 'lg', 'xl'] },
    background: { type: 'select', label: 'Background', options: ['default', 'alternate', 'dark', 'gradient', 'none'] },
    bgColor: { type: 'color', label: 'Custom Background Color' },
    maxWidth: { type: 'select', label: 'Content Max Width', options: ['sm', 'md', 'lg', 'xl', 'full'] },
    showDivider: { type: 'boolean', label: 'Show Divider Line' },
  },
});

componentRegistry.register({
  type: 'split',
  component: SplitBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Split Layout',
  description: 'Two-column split — left and right columns hold any blocks. Control the width ratio.',
  icon: <SplitSquareHorizontal size={16} />,
  category: 'layout',
  isContainer: true,
  passChildrenDirect: true,
  defaultProps: {
    leftWidth: '50',
    verticalAlign: 'center',
    gap: 'lg',
    reverse: false,
  },
  defaultChildren: () => [
    { id: `_col-${Date.now()}-0`, type: '_column', name: '', props: {}, children: [] },
    { id: `_col-${Date.now()}-1`, type: '_column', name: '', props: {}, children: [] },
  ],
  schema: {
    leftWidth: {
      type: 'select',
      label: 'Left Column Width',
      description: '33% = narrow left | 50% = equal | 67% = wide left',
      options: ['33', '40', '50', '60', '67'],
    },
    verticalAlign: { type: 'select', label: 'Vertical Alignment', options: ['start', 'center', 'end'] },
    gap: { type: 'select', label: 'Gap Between Columns', options: ['sm', 'md', 'lg', 'xl'] },
    reverse: { type: 'boolean', label: 'Reverse on Desktop' },
  },
});

// ─── Content Atomic Blocks ────────────────────────────────────────────────────

componentRegistry.register({
  type: 'stat',
  component: StatBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Stat / Counter',
  description: 'Display a key metric: value + label + optional icon. Great for "5+ years", "20 projects".',
  icon: <TrendingUp size={16} />,
  category: 'content',
  isAtom: true,
  defaultProps: {
    value: '5+',
    label: 'Years Experience',
    description: '',
    icon: '🏆',
    accent: 'indigo',
    variant: 'card',
    align: 'center',
  },
  schema: {
    value: { type: 'string', label: 'Value', placeholder: '5+, 20, 98%' },
    label: { type: 'string', label: 'Label', placeholder: 'Years Experience' },
    description: { type: 'string', label: 'Description (optional)', placeholder: 'Short detail' },
    icon: { type: 'string', label: 'Icon (emoji)', placeholder: '🏆' },
    variant: { type: 'select', label: 'Style', options: ['default', 'card', 'bordered', 'minimal'] },
    accent: { type: 'select', label: 'Accent Color', options: ['indigo', 'violet', 'emerald', 'amber', 'rose', 'sky'] },
    align: { type: 'select', label: 'Alignment', options: ['left', 'center', 'right'] },
  },
});

componentRegistry.register({
  type: 'feature-card',
  component: FeatureCardBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Feature Card',
  description: 'Icon + title + description card. Use inside Columns or Row for feature lists, services, or skills.',
  icon: <Star size={16} />,
  category: 'content',
  isAtom: true,
  defaultProps: {
    icon: '✨',
    title: 'Feature Title',
    description: 'Describe this feature, skill, or service here.',
    variant: 'default',
    iconPosition: 'top',
    accent: 'indigo',
  },
  schema: {
    icon: { type: 'string', label: 'Icon (emoji)', placeholder: '🚀' },
    title: { type: 'string', label: 'Title', placeholder: 'Feature Title' },
    description: { type: 'textarea', label: 'Description', rows: 3, placeholder: 'What makes this special...' },
    variant: { type: 'select', label: 'Style', options: ['default', 'glass', 'outlined', 'gradient', 'minimal'] },
    iconPosition: { type: 'select', label: 'Icon Position', options: ['top', 'left'] },
    accent: { type: 'select', label: 'Accent Color', options: ['indigo', 'violet', 'emerald', 'amber', 'rose', 'sky'] },
    href: { type: 'link', label: 'Link URL (optional)', placeholder: '#section or https://...' },
    linkLabel: { type: 'string', label: 'Link Label (optional)', placeholder: 'Learn more' },
  },
});

componentRegistry.register({
  type: 'timeline-item',
  component: TimelineItemBlock as React.ComponentType<Record<string, unknown>>,
  displayName: 'Timeline Item',
  description: 'A single experience/education entry with role, company, dates, and achievements. Stack in a Row for a timeline.',
  icon: <Clock size={16} />,
  category: 'content',
  isAtom: true,
  defaultProps: {
    role: 'Senior Developer',
    company: 'Example Corp',
    startDate: 'Jan 2022',
    endDate: 'Present',
    location: 'Remote',
    description: 'Led development of...',
    highlights: [{ value: 'Increased performance by 40%' }, { value: 'Mentored junior developers' }],
    variant: 'card',
    accent: 'indigo',
    showDot: true,
  },
  schema: {
    variant: { type: 'select', label: 'Style', options: ['card', 'minimal'] },
    accent: { type: 'select', label: 'Accent Color', options: ['indigo', 'violet', 'emerald', 'amber', 'rose'] },
    showDot: { type: 'boolean', label: 'Show Timeline Dot' },
    role: { type: 'string', label: 'Role / Position', placeholder: 'Senior Developer' },
    company: { type: 'string', label: 'Company / Organization', placeholder: 'Example Corp' },
    startDate: { type: 'string', label: 'Start Date', placeholder: 'Jan 2022' },
    endDate: { type: 'string', label: 'End Date', placeholder: 'Present' },
    location: { type: 'string', label: 'Location', placeholder: 'Remote' },
    description: { type: 'textarea', label: 'Description', rows: 2, placeholder: 'What you did there...' },
    highlights: {
      type: 'array',
      label: 'Key Achievements',
      itemLabel: 'Achievement',
      itemSchema: {
        value: { type: 'string', label: 'Achievement', placeholder: 'Increased performance by 40%' },
      },
    },
  },
});

console.log(
  `[ComponentRegistry] ✅ ${componentRegistry.getTypes().length} blocks registered:`,
  componentRegistry.getTypes(),
);

export { componentRegistry };
