/**
 * ════════════════════════════════════════════════════════════════════════
 * BLOCK CATALOGUE — Single source of truth cho AI generation + validation.
 *
 * File này được dùng bởi:
 *  1. `AiService` — normalizeNode() dùng BLOCK_DEFS để clamp props
 *  2. `LayoutArchitectAgent` — layout.schema.ts import VALID_BLOCK_TYPES
 *
 * Phải luôn đồng bộ với `client/src/core/registry/index.tsx`.
 * Mỗi block type, mỗi prop, mỗi enum option ở đây phản ánh đúng React component
 * thực sự sẽ render JSON này. Nếu một prop không có ở đây, AI không biết nó
 * tồn tại — không thể hallucinate, và nếu hallucinate thì normalizer sẽ strip về default.
 * ════════════════════════════════════════════════════════════════════════
 */

export type PropKind = 'string' | 'text' | 'boolean' | 'color' | 'number';

export interface PropDef {
  kind: PropKind;
  /** Allowed values khi prop là enum. Omit cho free text/number/boolean/color. */
  options?: string[];
  default?: unknown;
}

export interface BlockDef {
  /** Terminal node — không bao giờ có children. */
  isAtom: boolean;
  /**
   * Children rule:
   *  - 'none'    → atomic block, không cho phép children
   *  - 'single'  → tối đa 1 child
   *  - 'columns' → số children PHẢI bằng props.columns
   *  - 'rows'    → số children PHẢI bằng props.rows
   *  - 'any'     → bất kỳ số children (flex groups)
   */
  childRule: 'none' | 'single' | 'columns' | 'rows' | 'any';
  props: Record<string, PropDef>;
}

export const COMMON_STYLE_PROPS: Record<string, PropDef> = {
  textColor: { kind: 'color' },
  backgroundColor: { kind: 'color' },
  margin: { kind: 'string' },
  padding: { kind: 'string' },
};

const ALIGN_X_LCR: PropDef = {
  kind: 'string',
  options: ['left', 'center', 'right'],
};
const ALIGN_Y_TMB: PropDef = {
  kind: 'string',
  options: ['top', 'middle', 'bottom'],
};

export const BLOCK_DEFS: Record<string, BlockDef> = {
  'nav-bar-wrapper': {
    isAtom: false,
    childRule: 'single',
    props: {
      ...COMMON_STYLE_PROPS,
      sticky: { kind: 'boolean', default: true },
      transparent: { kind: 'boolean', default: false },
      background: {
        kind: 'string',
        options: ['dark', 'glass', 'light', 'none'],
        default: 'dark',
      },
      padding: {
        kind: 'string',
        default: 'lg',
      },
      maxWidth: {
        kind: 'string',
        options: ['lg', 'xl', '2xl', 'full'],
        default: 'xl',
      },
      alignX: ALIGN_X_LCR,
      alignY: ALIGN_Y_TMB,
    },
  },
  columns: {
    isAtom: false,
    childRule: 'columns',
    props: {
      ...COMMON_STYLE_PROPS,
      columns: { kind: 'string', options: ['2', '3', '4'], default: '2' },
      gap: {
        kind: 'string',
        options: ['none', 'sm', 'md', 'lg', 'xl'],
        default: 'md',
      },
      alignX: {
        kind: 'string',
        options: ['start', 'center', 'end', 'stretch'],
        default: 'stretch',
      },
      alignY: {
        kind: 'string',
        options: ['start', 'center', 'end', 'stretch'],
        default: 'stretch',
      },
      colSpans: { kind: 'string' },
    },
  },
  rows: {
    isAtom: false,
    childRule: 'rows',
    props: {
      ...COMMON_STYLE_PROPS,
      rows: { kind: 'string', options: ['2', '3', '4'], default: '2' },
      gap: {
        kind: 'string',
        options: ['none', 'sm', 'md', 'lg', 'xl'],
        default: 'md',
      },
      alignX: {
        kind: 'string',
        options: ['start', 'center', 'end', 'stretch'],
        default: 'stretch',
      },
      alignY: {
        kind: 'string',
        options: ['start', 'center', 'end', 'stretch'],
        default: 'stretch',
      },
      rowSpans: { kind: 'string' },
    },
  },
  flex: {
    isAtom: false,
    childRule: 'any',
    props: {
      ...COMMON_STYLE_PROPS,
      direction: {
        kind: 'string',
        options: ['row', 'column', 'row-reverse', 'column-reverse'],
        default: 'row',
      },
      gap: {
        kind: 'string',
        options: ['none', 'sm', 'md', 'lg', 'xl'],
        default: 'md',
      },
      justify: {
        kind: 'string',
        options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
        default: 'start',
      },
      align: {
        kind: 'string',
        options: ['start', 'center', 'end', 'stretch', 'baseline'],
        default: 'center',
      },
      wrap: {
        kind: 'string',
        options: ['nowrap', 'wrap', 'wrap-reverse'],
        default: 'wrap',
      },
    },
  },
  container: {
    isAtom: false,
    childRule: 'single',
    props: {
      ...COMMON_STYLE_PROPS,
      style: {
        kind: 'string',
        options: ['none', 'card', 'glass', 'outlined', 'filled'],
        default: 'none',
      },
      borderRadius: {
        kind: 'string',
        options: ['none', 'sm', 'md', 'lg', 'xl', '2xl'],
        default: 'none',
      },
      maxWidth: {
        kind: 'string',
        options: ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'],
        default: 'none',
      },
      alignX: ALIGN_X_LCR,
      alignY: ALIGN_Y_TMB,
    },
  },
  heading: {
    isAtom: true,
    childRule: 'none',
    props: {
      ...COMMON_STYLE_PROPS,
      text: { kind: 'string', default: 'Heading' },
      level: {
        kind: 'string',
        options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        default: 'h2',
      },
      size: {
        kind: 'string',
        options: ['sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'],
        default: 'xl',
      },
      textAlign: {
        kind: 'string',
        options: ['left', 'center', 'right'],
        default: 'left',
      },
      alignX: ALIGN_X_LCR,
      alignY: ALIGN_Y_TMB,
      gradient: { kind: 'boolean', default: false },
      marginTop: {
        kind: 'string',
        options: ['none', 'sm', 'md', 'lg', 'xl', '2xl'],
        default: 'none',
      },
      marginBottom: {
        kind: 'string',
        options: ['none', 'sm', 'md', 'lg', 'xl', '2xl'],
        default: 'md',
      },
      paddingTop: {
        kind: 'string',
        options: ['none', 'sm', 'md', 'lg', 'xl', '2xl'],
        default: 'none',
      },
      paddingBottom: {
        kind: 'string',
        options: ['none', 'sm', 'md', 'lg', 'xl', '2xl'],
        default: 'none',
      },
    },
  },
  description: {
    isAtom: true,
    childRule: 'none',
    props: {
      ...COMMON_STYLE_PROPS,
      text: { kind: 'text', default: 'Description text.' },
      size: {
        kind: 'string',
        options: ['xs', 'sm', 'base', 'lg', 'xl'],
        default: 'base',
      },
      textAlign: {
        kind: 'string',
        options: ['left', 'center', 'right'],
        default: 'left',
      },
      alignX: ALIGN_X_LCR,
      alignY: ALIGN_Y_TMB,
    },
  },
  link: {
    isAtom: true,
    childRule: 'none',
    props: {
      ...COMMON_STYLE_PROPS,
      label: { kind: 'string', default: 'Link' },
      href: { kind: 'string', default: '#' },
      variant: {
        kind: 'string',
        options: ['inline', 'nav', 'underline', 'pill'],
        default: 'nav',
      },
      size: { kind: 'string', options: ['sm', 'base', 'lg'], default: 'base' },
      alignX: ALIGN_X_LCR,
      alignY: ALIGN_Y_TMB,
      showIcon: { kind: 'boolean', default: false },
      external: { kind: 'boolean', default: false },
    },
  },
  button: {
    isAtom: true,
    childRule: 'none',
    props: {
      ...COMMON_STYLE_PROPS,
      label: { kind: 'string', default: 'Click Me' },
      href: { kind: 'string', default: '#' },
      variant: {
        kind: 'string',
        options: [
          'primary',
          'secondary',
          'ghost',
          'danger',
          'success',
          'warning',
          'outline',
        ],
        default: 'primary',
      },
      size: {
        kind: 'string',
        options: ['xs', 'sm', 'md', 'lg', 'xl'],
        default: 'md',
      },
      shape: {
        kind: 'string',
        options: ['default', 'pill', 'square', 'icon-only'],
        default: 'default',
      },
      alignX: ALIGN_X_LCR,
      alignY: ALIGN_Y_TMB,
      icon: { kind: 'string', default: '' },
      iconPosition: {
        kind: 'string',
        options: ['left', 'right'],
        default: 'right',
      },
      fullWidth: { kind: 'boolean', default: false },
      external: { kind: 'boolean', default: false },
    },
  },
  icon: {
    isAtom: true,
    childRule: 'none',
    props: {
      ...COMMON_STYLE_PROPS,
      name: { kind: 'string', default: 'Sparkles' },
      size: {
        kind: 'string',
        options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
        default: 'md',
      },
      shape: {
        kind: 'string',
        options: ['none', 'circle', 'square', 'rounded'],
        default: 'rounded',
      },
      accent: {
        kind: 'string',
        options: [
          'indigo',
          'violet',
          'emerald',
          'amber',
          'rose',
          'sky',
          'slate',
        ],
        default: 'indigo',
      },
      color: { kind: 'color' },
      alignX: ALIGN_X_LCR,
      alignY: ALIGN_Y_TMB,
    },
  },
  image: {
    isAtom: true,
    childRule: 'none',
    props: {
      ...COMMON_STYLE_PROPS,
      url: {
        kind: 'string',
        default:
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
      },
      alt: { kind: 'string', default: 'Image' },
      aspectRatio: {
        kind: 'string',
        options: ['auto', '16/9', '4/3', '1/1', '3/4'],
        default: 'auto',
      },
      objectFit: {
        kind: 'string',
        options: ['cover', 'contain', 'fill'],
        default: 'cover',
      },
      borderRadius: {
        kind: 'string',
        options: ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'],
        default: 'md',
      },
      alignX: ALIGN_X_LCR,
      alignY: ALIGN_Y_TMB,
    },
  },
  badge: {
    isAtom: true,
    childRule: 'none',
    props: {
      ...COMMON_STYLE_PROPS,
      text: { kind: 'string', default: 'New' },
      variant: {
        kind: 'string',
        options: ['solid', 'outline', 'subtle'],
        default: 'subtle',
      },
      color: {
        kind: 'string',
        options: [
          'indigo',
          'rose',
          'emerald',
          'amber',
          'sky',
          'slate',
          'violet',
        ],
        default: 'indigo',
      },
      size: { kind: 'string', options: ['sm', 'md', 'lg'], default: 'sm' },
      shape: { kind: 'string', options: ['rounded', 'pill'], default: 'pill' },
      alignX: ALIGN_X_LCR,
      alignY: ALIGN_Y_TMB,
    },
  },
};

/** Danh sách tất cả block types hợp lệ — dùng để validate AI output */
export const VALID_BLOCK_TYPES = Object.keys(BLOCK_DEFS) as Array<keyof typeof BLOCK_DEFS>;
