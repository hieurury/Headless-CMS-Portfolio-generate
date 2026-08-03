import { ComponentCategory } from '../schemas/component.schema';

/**
 * Built-in Component Registry — Minimal block set.
 *
 * Only the following blocks are registered:
 *   Layout : nav-bar-wrapper, columns, container
 *   Atomic : heading, link, button, icon
 *
 * All other blocks (navbar, text, badge, image, divider, spacer, card, row,
 * section-wrapper, split, _column, nav-group, logo, stat, feature-card,
 * timeline-item) have been removed.
 */
export const BUILT_IN_COMPONENTS = [
  // ─── Layout ───────────────────────────────────────────────────────────────

  {
    type: 'nav-bar-wrapper',
    name: 'Navbar Wrapper',
    description:
      'Composable sticky navbar container. Drop Columns(2) inside: left Heading · right Links + Button.',
    category: ComponentCategory.LAYOUT,
    version: '1.0.0',
    isBuiltIn: true,
    schema: {
      type: 'object',
      properties: {
        sticky: { type: 'boolean' },
        transparent: { type: 'boolean' },
        background: {
          type: 'string',
          enum: ['dark', 'glass', 'light', 'none'],
        },
        padding: { type: 'string', enum: ['sm', 'md', 'lg', 'xl'] },
        maxWidth: { type: 'string', enum: ['lg', 'xl', '2xl', 'full'] },
      },
    },
    defaultProps: {
      sticky: true,
      transparent: false,
      background: 'dark',
      padding: 'lg',
      maxWidth: 'xl',
    },
  },

  {
    type: 'columns',
    name: 'Columns',
    description:
      'Side-by-side equal-width column grid. Children map directly to cells by index.',
    category: ComponentCategory.LAYOUT,
    version: '2.0.0',
    isBuiltIn: true,
    schema: {
      type: 'object',
      properties: {
        columns: { type: 'string', enum: ['2', '3', '4', '5', '6'] },
        gap: { type: 'string', enum: ['none', 'sm', 'md', 'lg', 'xl'] },
        align: { type: 'string', enum: ['start', 'center', 'end', 'stretch'] },
      },
    },
    defaultProps: { columns: '2', gap: 'md', align: 'stretch' },
  },
  {
    type: 'rows',
    name: 'Rows',
    description: 'Rows',
    category: ComponentCategory.LAYOUT,
    version: '2.0.0',
    isBuiltIn: true,
    schema: {
      type: 'object',
      properties: {
        rows: { type: 'string', enum: ['2', '3', '4', '5', '6'] },
        gap: { type: 'string', enum: ['none', 'sm', 'md', 'lg', 'xl'] },
        align: { type: 'string', enum: ['start', 'center', 'end', 'stretch'] },
      },
    },
    defaultProps: { rows: '2', gap: 'md', align: 'stretch' },
  },

  {
    type: 'container',
    name: 'Container',
    description:
      'Full-size position wrapper — places one child block at any of 9 positions within the cell.',
    category: ComponentCategory.LAYOUT,
    version: '2.0.0',
    isBuiltIn: true,
    schema: {
      type: 'object',
      properties: {
        align: {
          type: 'string',
          enum: [
            'top-left',
            'top-center',
            'top-right',
            'middle-left',
            'center',
            'middle-right',
            'bottom-left',
            'bottom-center',
            'bottom-right',
          ],
        },
        minHeight: { type: 'string', enum: ['none', 'sm', 'md', 'lg', 'xl'] },
        style: {
          type: 'string',
          enum: ['none', 'card', 'glass', 'outlined', 'filled'],
        },
        padding: { type: 'string', enum: ['none', 'sm', 'md', 'lg', 'xl'] },
        borderRadius: {
          type: 'string',
          enum: ['none', 'sm', 'md', 'lg', 'xl', '2xl'],
        },
      },
    },
    defaultProps: {
      align: 'center',
      minHeight: 'none',
      style: 'none',
      padding: 'none',
      borderRadius: 'none',
    },
  },

  // ─── Atomic Blocks ────────────────────────────────────────────────────────

  {
    type: 'heading',
    name: 'Heading',
    description:
      'Title or heading text with level, size, alignment, and optional gradient.',
    category: ComponentCategory.CONTENT,
    version: '1.0.0',
    isBuiltIn: true,
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        level: { type: 'string', enum: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
        size: {
          type: 'string',
          enum: ['sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'],
        },
        align: { type: 'string', enum: ['left', 'center', 'right'] },
        color: { type: 'string' },
        gradient: { type: 'boolean' },
      },
      required: ['text'],
    },
    defaultProps: {
      text: 'Your Heading Here',
      level: 'h2',
      size: 'xl',
      align: 'left',
      gradient: false,
    },
  },

  {
    type: 'link',
    name: 'Link',
    description:
      'Inline navigation link with optional icon and style variants.',
    category: ComponentCategory.CONTENT,
    version: '1.0.0',
    isBuiltIn: true,
    schema: {
      type: 'object',
      properties: {
        label: { type: 'string' },
        href: { type: 'string' },
        variant: {
          type: 'string',
          enum: ['default', 'muted', 'underline', 'highlight', 'ghost'],
        },
        size: { type: 'string', enum: ['sm', 'base', 'lg'] },
        align: { type: 'string', enum: ['left', 'center', 'right'] },
        external: { type: 'boolean' },
        icon: { type: 'string' },
        iconPosition: { type: 'string', enum: ['left', 'right'] },
      },
      required: ['label', 'href'],
    },
    defaultProps: {
      label: 'Link',
      href: '#',
      variant: 'default',
      size: 'base',
      align: 'left',
      external: false,
    },
  },

  {
    type: 'button',
    name: 'Button',
    description:
      'Call-to-action button with style, size, shape, and icon options.',
    category: ComponentCategory.CONTENT,
    version: '1.0.0',
    isBuiltIn: true,
    schema: {
      type: 'object',
      properties: {
        label: { type: 'string' },
        href: { type: 'string' },
        variant: {
          type: 'string',
          enum: [
            'primary',
            'secondary',
            'ghost',
            'danger',
            'success',
            'warning',
            'outline',
          ],
        },
        size: { type: 'string', enum: ['xs', 'sm', 'md', 'lg', 'xl'] },
        shape: {
          type: 'string',
          enum: ['default', 'pill', 'square', 'icon-only'],
        },
        align: { type: 'string', enum: ['left', 'center', 'right'] },
        icon: { type: 'string' },
        iconPosition: { type: 'string', enum: ['left', 'right'] },
        fullWidth: { type: 'boolean' },
        external: { type: 'boolean' },
      },
      required: ['label'],
    },
    defaultProps: {
      label: 'Click Me',
      href: '#',
      variant: 'primary',
      size: 'md',
      shape: 'default',
      align: 'left',
      fullWidth: false,
      external: false,
    },
  },

  {
    type: 'icon',
    name: 'Icon',
    description:
      'Emoji or symbol icon with size, color, and alignment controls.',
    category: ComponentCategory.CONTENT,
    version: '1.0.0',
    isBuiltIn: true,
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        size: {
          type: 'string',
          enum: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
        },
        color: { type: 'string' },
        align: { type: 'string', enum: ['left', 'center', 'right'] },
        variant: {
          type: 'string',
          enum: ['default', 'circle', 'square', 'glow'],
        },
        bgColor: { type: 'string' },
      },
    },
    defaultProps: {
      name: '⭐',
      size: 'lg',
      align: 'center',
      variant: 'default',
    },
  },
];

/** Types that were removed and must be purged from DB on startup */
export const REMOVED_COMPONENT_TYPES = [
  'navbar',
  'text',
  'badge',
  'image',
  'divider',
  'spacer',
  'card',
  'row',
  'section-wrapper',
  'split',
  '_column',
  'nav-group',
  'logo',
  'stat',
  'feature-card',
  'timeline-item',
];
