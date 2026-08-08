import {
  Injectable,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerateLayoutDto } from './dto/generate-layout.dto';
import { ToolRegistry } from './tool-registry.service';
import { administratorAgent } from './agents/administrator/administrator.agent';

/**
 * ════════════════════════════════════════════════════════════════════════
 * BLOCK CATALOGUE — single source of truth for AI generation + validation.
 *
 * This MUST stay in sync with `client/src/core/registry/index.tsx`.
 * Every block type, every prop, and every enum option below mirrors the
 * real React components that will render this JSON. If a prop or option
 * is not listed here, the AI is never told it exists — so it cannot
 * hallucinate it, and if it does, our repair pass strips it back to a
 * safe default instead of silently breaking the rendered page.
 * ════════════════════════════════════════════════════════════════════════
 */

type PropKind = 'string' | 'text' | 'boolean' | 'color' | 'number';

interface PropDef {
  kind: PropKind;
  /** Allowed values when this prop is an enum (select). Omit for free text/number/boolean/color. */
  options?: string[];
  default?: unknown;
}

interface BlockDef {
  /** Terminal node — must never have children. */
  isAtom: boolean;
  /**
   * Children rule:
   *  - 'none'    → atomic block, no children allowed
   *  - 'single'  → at most 1 child (extra children get auto-wrapped into a `rows` block)
   *  - 'columns' → child count MUST equal props.columns
   *  - 'rows'    → child count MUST equal props.rows
   *  - 'any'     → any number of children allowed (e.g. flex groups)
   */
  childRule: 'none' | 'single' | 'columns' | 'rows' | 'any';
  props: Record<string, PropDef>;
}

const COMMON_STYLE_PROPS: Record<string, PropDef> = {
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

const BLOCK_DEFS: Record<string, BlockDef> = {
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
      // colSpans is a number array (e.g. [1,2]) — frontend silently falls back
      // to equal widths if length doesn't match `columns`, so no strict enum here.
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

const VALID_TYPES = Object.keys(BLOCK_DEFS);

/**
 * ════════════════════════════════════════════════════════════════════════
 * SYSTEM PROMPT — full documentation of every block + real worked examples.
 * ════════════════════════════════════════════════════════════════════════
 */
const COMPONENT_CONTEXT = `
<system_role>
You are a world-class portfolio website layout designer, creative director, and UI architect. Your job is to generate EXTREMELY DIVERSE, NOVEL, AESTHETIC, and SPACIOUS portfolio layouts using ONLY the 12 provided building blocks below.
Think like a human designer composing unique, modern, breathable UI structures. Master the use of spacing (padding, margin, gap), columns, rows, cards, glassmorphism, background colors, alignments, and typography hierarchy based on the user's prompt.
</system_role>

<critical_output_format>
- Output ONLY a single, raw, valid JSON object.
- DO NOT wrap the output in markdown code blocks (no \`\`\`json fences).
- DO NOT include any conversational text, introductory text, or explanations.
- Return exactly this root object structure: { "sections": [ ... top-level blocks ... ] }
- JSON MUST BE STRICT. Ensure 100% syntactical validity with NO trailing commas.
- Every node has the shape: { "type": "...", "name": "optional-anchor-slug", "props": { ... }, "children": [ ... ] }
- "children" is REQUIRED on every container block (use [] if empty) and FORBIDDEN on atomic blocks (omit it entirely).
</critical_output_format>

═══════════════════════════════════════════════════
BLOCK SYSTEM — ONLY these 12 blocks exist. DO NOT invent new types.
═══════════════════════════════════════════════════

── UNIVERSAL PROPS (Accepted on EVERY block below) ───────────────────────────
• padding: CSS shorthand string for internal breathing space (e.g. "5rem 2rem", "2rem", "1.5rem", "16px 24px", "0")
• margin: CSS shorthand string for external spacing (e.g. "4rem 0", "0 0 1.5rem 0", "0 0 0.75rem 0", "1rem 0")
• textColor: CSS color/hex string (e.g. "#ffffff", "#94a3b8", "#38bdf8")
• backgroundColor: CSS color/hex/rgba/gradient (e.g. "#0a0a0f", "#111827", "rgba(255,255,255,0.03)")

── NAVIGATION ─────────────────────────────────────────────────────────────
[nav-bar-wrapper] — Sticky navigation bar. Always the FIRST top-level block on any page. Exactly ONE child (usually a "columns" with columns="2": left cell = logo/heading, right cell = nested flex/columns with links + button).
Props: sticky(bool), transparent(bool), background(dark|glass|light|none), padding(sm|md|lg|xl), maxWidth(lg|xl|2xl|full), alignX(left|center|right), alignY(top|middle|bottom), textColor, backgroundColor, margin
{ "type": "nav-bar-wrapper", "props": { "sticky": true, "background": "glass", "padding": "lg", "maxWidth": "xl" }, "children": [ /* exactly 1 child */ ] }

── LAYOUT CONTAINERS (use these to structure every section & card) ────────
[container] — Box wrapper that positions exactly ONE child inside itself (hero section container, card background, centered content wrapper). isContainer.
Props: style(none|card|glass|outlined|filled), padding(CSS shorthand like "5rem 2rem", "2rem", or preset sm|md|lg|xl), margin(CSS shorthand like "3rem 0", "0"), borderRadius(none|sm|md|lg|xl|2xl), maxWidth(none|sm|md|lg|xl|2xl|full), alignX(left|center|right), alignY(top|middle|bottom), textColor, backgroundColor
{ "type": "container", "props": { "style": "glass", "padding": "4rem 2rem", "borderRadius": "2xl", "alignX": "center", "alignY": "middle", "backgroundColor": "#0a0a0f" }, "children": [ /* exactly 1 child, usually rows, columns, or flex */ ] }

[columns] — Splits content into N EQUAL-WIDTH side-by-side cells (CSS grid). The number of children MUST exactly equal "columns". Each child is itself one block (often a container/rows/card wrapping content).
Props: columns("2"|"3"|"4"), colSpans(optional number array, e.g. [1,2] = second cell twice as wide), gap(none|sm|md|lg|xl), alignX(start|center|end|stretch), alignY(start|center|end|stretch), padding, margin, textColor, backgroundColor
{ "type": "columns", "props": { "columns": "3", "gap": "lg", "alignX": "stretch", "alignY": "stretch" }, "children": [ block1, block2, block3 ] }

[rows] — Splits content into N stacked rows. Each row sizes to its own content. Children count MUST exactly equal "rows".
Props: rows("2"|"3"|"4"), rowSpans(optional), gap(none|sm|md|lg|xl), alignX(start|center|end|stretch), alignY(start|center|end|stretch), padding, margin, textColor, backgroundColor
{ "type": "rows", "props": { "rows": "3", "gap": "md" }, "children": [ block1, block2, block3 ] }

[flex] — Children flow naturally and auto-size to their own content. Use for button groups, tag/badge rows, icon rows, inline link groups. Accepts ANY number of children.
Props: direction(row|column|row-reverse|column-reverse), gap(none|sm|md|lg|xl), justify(start|center|end|between|around|evenly), align(start|center|end|stretch|baseline), wrap(nowrap|wrap|wrap-reverse), padding, margin, textColor, backgroundColor
{ "type": "flex", "props": { "direction": "row", "gap": "sm", "justify": "start", "align": "center", "wrap": "wrap" }, "children": [ badge1, badge2, badge3 ] }

── ATOMIC BLOCKS (terminal nodes — NEVER give these a "children" key) ─────
[heading] — text, level(h1-h6), size(sm|base|lg|xl|2xl|3xl|4xl|5xl), textAlign(left|center|right), gradient(bool), margin(CSS shorthand e.g. "0 0 1rem 0"), padding, alignX, alignY, textColor, backgroundColor
{ "type": "heading", "props": { "text": "Crafting Scalable Digital Products", "level": "h1", "size": "5xl", "textAlign": "left", "gradient": true, "margin": "0 0 1.25rem 0" } }

[description] — text, size(xs|sm|base|lg|xl), textAlign(left|center|right), margin(CSS shorthand e.g. "0 0 1.5rem 0"), padding, alignX, alignY, textColor, backgroundColor
{ "type": "description", "props": { "text": "Senior full-stack engineer specializing in TypeScript, React, and high-performance cloud architectures.", "size": "lg", "textAlign": "left", "margin": "0 0 2rem 0" } }

[link] — label, href, variant(inline|nav|underline|pill), size(sm|base|lg), showIcon(bool), external(bool), margin, padding, textColor, backgroundColor
{ "type": "link", "props": { "label": "Projects", "href": "#projects", "variant": "nav" } }

[button] — label, href, variant(primary|secondary|ghost|danger|success|warning|outline), size(xs|sm|md|lg|xl), shape(default|pill|square|icon-only), icon(emoji string), iconPosition(left|right), fullWidth(bool), external(bool), margin, padding, textColor, backgroundColor
{ "type": "button", "props": { "label": "Get in Touch", "href": "#contact", "variant": "primary", "size": "md", "shape": "pill" } }

[icon] — name(Lucide icon name, e.g. Code2, Rocket, Star, Mail, Github, Linkedin, Palette, Zap, Sparkles, Layers, Cpu, Globe), size(xs|sm|md|lg|xl|2xl), shape(none|circle|square|rounded), accent(indigo|violet|emerald|amber|rose|sky|slate), margin, padding, textColor, backgroundColor
{ "type": "icon", "props": { "name": "Rocket", "size": "lg", "shape": "rounded", "accent": "violet" } }

[image] — url(real working Unsplash photo URL), alt, aspectRatio(auto|16/9|4/3|1/1|3/4), objectFit(cover|contain|fill), borderRadius(none|sm|md|lg|xl|2xl|full), margin, padding
{ "type": "image", "props": { "url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop", "alt": "Portrait", "aspectRatio": "1/1", "objectFit": "cover", "borderRadius": "2xl" } }

[badge] — text, variant(solid|outline|subtle), color(indigo|rose|emerald|amber|sky|slate|violet), size(sm|md|lg), shape(rounded|pill), margin, padding
{ "type": "badge", "props": { "text": "Next.js", "variant": "subtle", "color": "sky", "size": "sm", "shape": "pill" } }

═══════════════════════════════════════════════════
SPACING & DESIGN GUIDELINES
═══════════════════════════════════════════════════
1. Generous Section Padding: Every main section container SHOULD have generous vertical padding (e.g. padding: "5rem 2rem" or "6rem 2rem") for a premium, spacious feel.
2. Clean Typography Margins: Always add bottom margin to headings (e.g. margin: "0 0 1rem 0") and descriptions (e.g. margin: "0 0 1.5rem 0") so text never crowds buttons or cards.
3. Card Inner Padding: Cards inside grids/columns SHOULD have style: "card" or "glass", borderRadius: "xl" or "2xl", and internal padding: "2rem".

═══════════════════════════════════════════════════
STRUCTURAL RULES (verify ALL before outputting)
═══════════════════════════════════════════════════
1. The FIRST top-level section is always exactly one "nav-bar-wrapper".
2. Every "container" and "nav-bar-wrapper" has EXACTLY ONE child. If you need multiple elements, wrap them in "rows", "columns", or "flex".
3. Every "columns" block's children array length MUST exactly equal its "columns" prop. Every "rows" block's children array length MUST exactly equal its "rows" prop. Count before finalizing.
4. Atomic blocks (heading, description, link, button, icon, image, badge) are terminal — NEVER give them a "children" property.
5. Use real, working Unsplash photo URLs for every "image" block (distinct URLs for each image).
6. Build rich, realistic content relevant to the user's prompt.

═══════════════════════════════════════════════════
WORKED EXAMPLE — a complete, well-structured "Hero" section
═══════════════════════════════════════════════════
{
  "type": "container",
  "name": "hero",
  "props": { "style": "none", "padding": "5rem 2rem", "margin": "0", "alignX": "center", "alignY": "middle", "backgroundColor": "#0a0a0f" },
  "children": [
    {
      "type": "columns",
      "props": { "columns": "2", "gap": "xl", "alignX": "stretch", "alignY": "center" },
      "children": [
        {
          "type": "rows",
          "props": { "rows": "4", "gap": "md" },
          "children": [
            { "type": "badge", "props": { "text": "Available for new projects", "variant": "subtle", "color": "emerald", "size": "sm", "margin": "0 0 0.5rem 0" } },
            { "type": "heading", "props": { "text": "Building High-Impact Web Applications", "level": "h1", "size": "5xl", "gradient": true, "margin": "0 0 1rem 0" } },
            { "type": "description", "props": { "text": "Senior Full-Stack Engineer crafting fast, resilient, and beautifully designed web experiences with React, Node.js, and Cloud architectures.", "size": "lg", "margin": "0 0 1.5rem 0" } },
            { "type": "flex", "props": { "direction": "row", "gap": "md", "justify": "start", "align": "center" }, "children": [
              { "type": "button", "props": { "label": "Explore Work", "href": "#projects", "variant": "primary", "size": "md", "shape": "pill" } },
              { "type": "button", "props": { "label": "Contact Me", "href": "#contact", "variant": "outline", "size": "md", "shape": "pill" } }
            ] }
          ]
        },
        { "type": "image", "props": { "url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop", "alt": "Developer portrait", "aspectRatio": "1/1", "objectFit": "cover", "borderRadius": "2xl" } }
      ]
    }
  ]
}
`;

/**
 * ════════════════════════════════════════════════════════════════════════
 * Repair / normalization helpers.
 *
 * The LLM output is treated as untrusted: even with the schema above and
 * response_format=json_object, models still drift (wrong enum values,
 * mismatched child counts, stray children on atoms). Rather than reject
 * the whole layout, we clamp it back into something the renderer can
 * always display correctly.
 * ════════════════════════════════════════════════════════════════════════
 */

interface RawNode {
  id?: string;
  type?: string;
  name?: string;
  props?: Record<string, unknown>;
  children?: unknown[];
}

function genId(): string {
  return `block-ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Clamp a single prop value against its definition; returns undefined to drop an invalid value with no safe default. */
function clampPropValue(def: PropDef, value: unknown): unknown {
  if (def.kind === 'boolean') {
    if (typeof value === 'boolean') return value;
    return def.default;
  }
  if (def.options) {
    if (typeof value === 'string' && def.options.includes(value)) return value;
    return def.default ?? def.options[0];
  }
  // string / text / color / number / unconstrained — pass through if present and primitive
  if (value === undefined || value === null) return def.default;
  if (typeof value === 'string' || typeof value === 'number') return value;
  return def.default;
}

/** Clean a node's props object against its BlockDef — clamps known enum props, leaves unknown extra keys untouched (harmless). */
function cleanProps(
  type: string,
  rawProps: Record<string, unknown>,
): Record<string, unknown> {
  const def = BLOCK_DEFS[type];
  const cleaned: Record<string, unknown> = { ...rawProps };
  if (!def) return cleaned;
  for (const [key, propDef] of Object.entries(def.props)) {
    if (key in cleaned) {
      const value = clampPropValue(propDef, cleaned[key]);
      if (value === undefined) {
        delete cleaned[key];
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

/** Builds a minimal, invisible spacer block used to pad out columns/rows that came back short. */
function emptySpacer(): RawNode {
  return { id: genId(), type: 'container', name: '', props: {}, children: [] };
}

/**
 * Recursively normalize a raw AI node into a clean LayoutSection-compatible
 * object. Returns null if the block type itself is unrecognized.
 */
function normalizeNode(raw: unknown, logger: Logger): RawNode | null {
  const node = raw as RawNode;
  if (
    !node ||
    typeof node !== 'object' ||
    !node.type ||
    !VALID_TYPES.includes(node.type)
  ) {
    if (node?.type) logger.warn(`Filtered unknown block type: "${node.type}"`);
    return null;
  }

  const def = BLOCK_DEFS[node.type];
  const cleanedProps = cleanProps(node.type, node.props ?? {});

  // Normalize children recursively first.
  let children: RawNode[] = Array.isArray(node.children)
    ? node.children
      .map((c) => normalizeNode(c, logger))
      .filter((c): c is RawNode => c !== null)
    : [];

  // Enforce child-count rules per block type so the rendered grid never breaks.
  if (def.childRule === 'none') {
    children = [];
  } else if (def.childRule === 'single') {
    if (children.length > 1) {
      // Don't silently drop content — wrap the extras into a single "rows" block.
      children = [
        {
          id: genId(),
          type: 'rows',
          name: '',
          props: { rows: String(children.length), gap: 'md' },
          children,
        },
      ];
    }
  } else if (def.childRule === 'columns') {
    const expected = Math.min(
      4,
      Math.max(2, parseInt(String(cleanedProps.columns ?? '2'), 10) || 2),
    );
    cleanedProps.columns = String(expected);
    if (children.length > expected) {
      logger.warn(
        `columns="${expected}" had ${children.length} children — trimming extras`,
      );
      children = children.slice(0, expected);
    } else if (children.length < expected) {
      logger.warn(
        `columns="${expected}" had only ${children.length} children — padding with spacers`,
      );
      while (children.length < expected) children.push(emptySpacer());
    }
  } else if (def.childRule === 'rows') {
    const expected = Math.min(
      4,
      Math.max(2, parseInt(String(cleanedProps.rows ?? '2'), 10) || 2),
    );
    cleanedProps.rows = String(expected);
    if (children.length > expected) {
      logger.warn(
        `rows="${expected}" had ${children.length} children — trimming extras`,
      );
      children = children.slice(0, expected);
    } else if (children.length < expected) {
      logger.warn(
        `rows="${expected}" had only ${children.length} children — padding with spacers`,
      );
      while (children.length < expected) children.push(emptySpacer());
    }
  }
  // 'any' (flex) — no enforcement needed.

  return {
    id: node.id && typeof node.id === 'string' ? node.id : genId(),
    type: node.type,
    name: node.name ?? '',
    props: cleanedProps,
    children,
  };
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly registry: ToolRegistry,
  ) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured. Add it to your .env file.');
    }
    this.logger.log(`AI layout engine initialized (model: ${process.env.GEMINI_MODEL || 'gemini-3.5-flash'} via AdministratorAgent)`);
  }

  async generateLayout(dto: GenerateLayoutDto): Promise<{
    layout: { sections: unknown[] };
    sectionsGenerated: number;
  }> {
    const isModification = !!dto.currentLayout;
    const basePrompt = this.buildPrompt(dto, isModification);

    try {
      this.logger.log(`Generating layout for: "${dto.prompt}"`);

      let validSections = await this.callAndNormalize(
        basePrompt,
        isModification,
        dto,
      );

      // ── Self-repair retry ──────────────────────────────────────────
      // If the first pass produced nothing usable (bad JSON, all-unknown
      // types, etc.), give the model exactly one more chance with a
      // sharper, shorter corrective instruction instead of failing outright.
      if (validSections.length === 0) {
        this.logger.warn(
          'First generation pass produced no valid blocks — retrying once',
        );
        const retryPrompt = `${basePrompt}\n\nYOUR PREVIOUS OUTPUT WAS REJECTED because it used invalid block types or malformed JSON. Re-read the BLOCK SYSTEM list above carefully. Use ONLY the 12 listed "type" values, follow the exact child-count rules, and output strictly valid JSON: { "sections": [ ... ] }`;
        validSections = await this.callAndNormalize(
          retryPrompt,
          isModification,
          dto,
        );
      }

      if (validSections.length === 0) {
        throw new BadRequestException(
          'AI generated no valid blocks — please try a more specific prompt',
        );
      }

      this.logger.log(`✅ Generated ${validSections.length} top-level blocks`);

      return {
        layout: { sections: validSections },
        sectionsGenerated: validSections.length,
      };
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }

      // ── LOG CHI TIẾT LỖI TỪ AI SERVER ──────────────────────────
      this.logger.error('=== [AI ERROR DETAILS] ===');
      this.logger.error(`Status: ${error?.status || error?.statusCode}`);
      this.logger.error(`Message: ${error?.message}`);
      this.logger.error(`Response Data: ${JSON.stringify(error?.error || error?.response?.data || error?.response || {}, null, 2)}`);
      this.logger.error(`Stack: ${error?.stack}`);
      this.logger.error('==========================');

      const message = error?.message ?? 'Unknown AI error';
      throw new BadRequestException(`AI generation failed: ${message}`);
    }
  }


  /**
   * Gọi AdministratorAgent và chuẩn hóa kết quả qua normalizeNode.
   * Returns [] nếu Agent trả về JSON không hợp lệ (không throw).
   *
   * Xử lý 2 dạng response:
   *  1. {modifications: [...]} → thực thi qua ToolRegistry (generate-layout tool)
   *  2. {sections: [...]}      → parse và normalize trực tiếp
   */
  private async callAndNormalize(
    prompt: string,
    isModification: boolean,
    dto: GenerateLayoutDto,
    forcedTemperature?: number,
  ): Promise<unknown[]> {
    try {
      // Gọi AdministratorAgent — nó tự quyết định dùng layout_architect hay copywriter
      const result = await administratorAgent.run(prompt, []);

      // Lấy nội dung text từ message cuối cùng của Agent
      const lastMsg = result.messages
        ? result.messages[result.messages.length - 1]
        : result;
      let text =
        typeof lastMsg.content === 'string'
          ? lastMsg.content
          : JSON.stringify(lastMsg.content);

      // Strip markdown fences nếu model lỡ bọc output trong ```json ... ```
      text = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

      this.logger.log(`Agent response (first 120 chars): ${text.substring(0, 120)}`);

      let parsedData: any;
      try {
        parsedData = JSON.parse(text);
      } catch {
        this.logger.warn('Agent returned invalid JSON: ' + text.substring(0, 120));
        return [];
      }

      // ── Branch 1: Agent trả về {modifications:[...]} → dùng generate-layout tool
      if (parsedData?.modifications && Array.isArray(parsedData.modifications)) {
        const tool = this.registry.get('generate-layout');
        if (tool) {
          const toolArgs = {
            modifications: parsedData.modifications,
            currentlayout: dto.currentLayout?.sections ?? [],
          };
          this.logger.log(`Executing "generate-layout" tool with ${parsedData.modifications.length} modification(s)`);
          const toolResultString = await tool.execute(toolArgs);
          const toolResult = JSON.parse(toolResultString);
          if (Array.isArray(toolResult) && toolResult.length > 0) {
            return toolResult
              .map((s) => normalizeNode(s, this.logger))
              .filter((s): s is RawNode => s !== null);
          }
        }
      }

      // ── Branch 2: Agent trả về {sections:[...]} → normalize trực tiếp
      if (!parsedData.sections || !Array.isArray(parsedData.sections)) {
        this.logger.warn('Agent response missing a "sections" array');
        return [];
      }

      return parsedData.sections
        .map((s: unknown) => normalizeNode(s, this.logger))
        .filter((s): s is RawNode => s !== null);
    } catch (err: any) {
      this.logger.error(`AdministratorAgent error: ${err?.message}`);
      return [];
    }
  }


  /** Builds a DESIGN SYSTEM section to inject into the AI prompt from page meta. */
  private buildDesignSystemSection(dto: GenerateLayoutDto): string {
    const meta = dto.pageMeta;
    if (!meta) return '';

    const lines: string[] = [
      '═══════════════════════════════════════════════════',
      'DESIGN SYSTEM — APPLY THESE SETTINGS TO YOUR OUTPUT',
      '═══════════════════════════════════════════════════',
      '',
      'The portfolio owner has configured a custom design system. You MUST respect these settings when choosing colors and fonts for blocks:',
      '',
    ];

    // Colors
    if (meta.colors?.light) {
      const l = meta.colors.light;
      lines.push('COLOR PALETTE (Light Mode):');
      if (l.primary) lines.push(`  - Primary color: ${l.primary}`);
      if (l.secondary) lines.push(`  - Secondary color: ${l.secondary}`);
      if (l.accents?.length)
        lines.push(`  - Accent colors: ${l.accents.join(', ')}`);
      lines.push('');
    }
    if (meta.colors?.dark) {
      const d = meta.colors.dark;
      lines.push('COLOR PALETTE (Dark Mode):');
      if (d.primary) lines.push(`  - Primary color: ${d.primary}`);
      if (d.secondary) lines.push(`  - Secondary color: ${d.secondary}`);
      if (d.accents?.length)
        lines.push(`  - Accent colors: ${d.accents.join(', ')}`);
      lines.push('');
    }

    // Fonts
    if (meta.fonts) {
      lines.push('TYPOGRAPHY:');
      if (meta.fonts.main)
        lines.push(`  - Main font family: ${meta.fonts.main}`);
      lines.push('');
    }

    // Layout
    if (meta.pageLayout) {
      lines.push('PAGE LAYOUT:');
      lines.push(`  - Layout type: ${meta.pageLayout.type}`);
      if (meta.pageLayout.type === 'custom' && meta.pageLayout.padding) {
        const p = meta.pageLayout.padding;
        lines.push(
          `  - Custom padding: top=${p.top}px, right=${p.right}px, bottom=${p.bottom}px, left=${p.left}px`,
        );
      } else if (meta.pageLayout.type === 'fluid') {
        lines.push(
          '  - Page content is constrained with horizontal side margins (similar to a container class)',
        );
      } else {
        lines.push('  - Page content spans the full frame width');
      }
      lines.push('');
    }

    lines.push(
      'RULES FOR DESIGN SYSTEM:',
      '1. Use the primary color for main CTAs, hero backgrounds, accent elements, and highlighted text.',
      '2. Use the secondary color for secondary actions, gradients, and supporting elements.',
      '3. Use accent colors for tags, badges, icons, and decorative elements.',
      '4. When setting textColor or backgroundColor on blocks, prefer hex values from the palette above over generic color names.',
      '5. Do NOT override user-specified colors — these are the brand guidelines.',
      '',
    );

    return lines.join('\n') + '\n';
  }

  /**
   * Builds a compact, token-efficient representation of the layout tree
   * containing ONLY id, type, and name (no props, no rendered content).
   *
   * Purpose: Give the AI just enough context to identify which node to target
   * by id — without blowing the token budget on props / image URLs / long text.
   * The full layout is injected server-side when the tool executes.
   */
  private buildCompactLayoutMap(nodes: unknown[], indent = 0): string {
    const pad = '  '.repeat(indent);
    return nodes
      .map((raw) => {
        const n = raw as {
          id?: string;
          type?: string;
          name?: string;
          props?: Record<string, unknown>;
          children?: unknown[];
        };
        const label = n.props?.text ?? n.props?.label ?? n.name ?? '';
        const preview = label ? ` "${String(label).slice(0, 40)}"` : '';
        const line = `${pad}- [${n.type ?? '?'}] id="${n.id ?? '?'}"${preview}`;
        if (n.children && n.children.length > 0) {
          return (
            line + '\n' + this.buildCompactLayoutMap(n.children, indent + 1)
          );
        }
        return line;
      })
      .join('\n');
  }

  /** Builds the full prompt (system context + optional modification block + user request). */
  private buildPrompt(dto: GenerateLayoutDto, isModification: boolean): string {
    let fullPrompt = `${COMPONENT_CONTEXT}\n\n`;

    // Inject design system if portfolio has custom settings
    const designSection = this.buildDesignSystemSection(dto);
    if (designSection) {
      fullPrompt += designSection + '\n';
    }

    if (dto.currentLayout) {
      fullPrompt += `
═══════════════════════════════════════════════════
MODIFICATION MODE — READ ALL RULES BEFORE ACTING
═══════════════════════════════════════════════════

CURRENT LAYOUT NODE MAP (id + type only — use the "id" value to target nodes):
${this.buildCompactLayoutMap((dto.currentLayout as { sections?: unknown[] })?.sections ?? [])}

NOTE: The server holds the full layout data. You only need the node "id" when using the tool.

YOUR TASK:
The user wants a SURGICAL modification. You have TWO options to respond:

OPTION A — Use the "generate-layout" TOOL (preferred for precise, targeted changes):
  Call the tool with a "modifications" array. Each modification targets one node by its "id" field.
  Available modification types:
  - "ADD_CHILD"  → append newNode inside the target node's children list
  - "ADD_BEFORE" → insert newNode immediately before the target node (same level)
  - "ADD_AFTER"  → insert newNode immediately after the target node (same level)
  - "UPDATE"     → replace the entire target node with newNode
  - "DELETE"     → remove the target node from the tree
  You do NOT need to reproduce the full layout — the server injects currentlayout automatically.
  Use this option when: adding/removing/updating specific blocks, especially when the layout is large.

OPTION B — Return the full updated layout as raw JSON { "sections": [...] }:
  Copy the CURRENT LAYOUT exactly, then apply your changes inline.
  Use this option when: the change is so widespread (e.g. complete redesign of a section) that
  targeted patching would require more than 5 individual modifications.

REGARDLESS OF WHICH OPTION YOU CHOOSE:
- Change ONLY what the user asked — keep everything else IDENTICAL (same props, same children, same order)
- Do NOT add new sections unless the user explicitly says "add a new section for..."
- Do NOT remove sections unless the user explicitly says "remove..."
- Do NOT rename, reorder, or restyle anything the user did not mention
- Still obey every rule in BLOCK SYSTEM above (valid types, exact child counts, no children on atoms)

EXAMPLES FOR OPTION A (tool call):

Example A1 — "Delete the hero section" (id: "block-ai-1234")
Tool call modifications: [
  { "type": "DELETE", "targetId": "block-ai-1234" }
]

Example A2 — "Add a badge saying 'React' after the heading in block-ai-5678"
Tool call modifications: [
  { "type": "ADD_AFTER", "targetId": "block-ai-5678",
    "newNode": { "type": "badge", "props": { "text": "React", "variant": "subtle", "color": "sky" } } }
]

Example A3 — "Rename heading to 'Hello World' AND delete the footer"
Tool call modifications: [
  { "type": "UPDATE", "targetId": "block-ai-heading-id",
    "newNode": { "type": "heading", "props": { "text": "Hello World", "level": "h1", "size": "5xl" } } },
  { "type": "DELETE", "targetId": "block-ai-footer-id" }
]

ANTI-PATTERNS (things you must NEVER do in modification mode):
❌ Inventing new nav links that weren't in the original
❌ Changing background color of containers the user didn't mention
❌ Restructuring columns/rows layout when user only asked to add a child element
❌ Replacing a heading+icon group with an unrelated layout pattern
❌ Adding a Hero, Footer, or Projects section when user only asked to modify the navbar

`;
    }

    fullPrompt += `[USER REQUEST]\n${dto.prompt}\n\nAnalyze the user's request carefully. ${isModification
      ? 'Apply the SURGICAL modification described above. Copy all unchanged sections exactly as they appear in CURRENT LAYOUT.'
      : 'Be highly creative and avoid generic templates unless specifically requested. Generate a complete, unique, and content-rich portfolio page layout.'
      } Output ONLY valid JSON: { "sections": [ ... ] }`;

    if (dto.currentLayout) {
      fullPrompt += `
Before finalizing your JSON, do a mental diff check:
- How many top-level sections does CURRENT LAYOUT have? → Your output must have the SAME count (unless user asked to add/remove).
- Which section did the user ask to modify? → Only that section's subtree should differ.
- Are all nav links from the original still present with the same href and label? → They must be.
- Does every columns/rows block still have a children count that exactly matches its columns/rows prop?
`;
    }

    return fullPrompt;
  }
}
