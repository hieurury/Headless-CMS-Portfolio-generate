import {
  Injectable,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GenerateLayoutDto } from './dto/generate-layout.dto';

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

const COMMON_COLOR_PROPS: Record<string, PropDef> = {
  textColor: { kind: 'color' },
  backgroundColor: { kind: 'color' },
};

const ALIGN_X_LCR: PropDef = { kind: 'string', options: ['left', 'center', 'right'] };
const ALIGN_Y_TMB: PropDef = { kind: 'string', options: ['top', 'middle', 'bottom'] };

const BLOCK_DEFS: Record<string, BlockDef> = {
  'nav-bar-wrapper': {
    isAtom: false,
    childRule: 'single',
    props: {
      ...COMMON_COLOR_PROPS,
      sticky: { kind: 'boolean', default: true },
      transparent: { kind: 'boolean', default: false },
      background: { kind: 'string', options: ['dark', 'glass', 'light', 'none'], default: 'dark' },
      padding: { kind: 'string', options: ['sm', 'md', 'lg', 'xl'], default: 'lg' },
      maxWidth: { kind: 'string', options: ['lg', 'xl', '2xl', 'full'], default: 'xl' },
      alignX: ALIGN_X_LCR,
      alignY: ALIGN_Y_TMB,
    },
  },
  columns: {
    isAtom: false,
    childRule: 'columns',
    props: {
      ...COMMON_COLOR_PROPS,
      columns: { kind: 'string', options: ['2', '3', '4'], default: '2' },
      gap: { kind: 'string', options: ['none', 'sm', 'md', 'lg', 'xl'], default: 'md' },
      alignX: { kind: 'string', options: ['start', 'center', 'end', 'stretch'], default: 'stretch' },
      alignY: { kind: 'string', options: ['start', 'center', 'end', 'stretch'], default: 'stretch' },
      // colSpans is a number array (e.g. [1,2]) — frontend silently falls back
      // to equal widths if length doesn't match `columns`, so no strict enum here.
      colSpans: { kind: 'string' },
    },
  },
  rows: {
    isAtom: false,
    childRule: 'rows',
    props: {
      ...COMMON_COLOR_PROPS,
      rows: { kind: 'string', options: ['2', '3', '4'], default: '2' },
      gap: { kind: 'string', options: ['none', 'sm', 'md', 'lg', 'xl'], default: 'md' },
      alignX: { kind: 'string', options: ['start', 'center', 'end', 'stretch'], default: 'stretch' },
      alignY: { kind: 'string', options: ['start', 'center', 'end', 'stretch'], default: 'stretch' },
      rowSpans: { kind: 'string' },
    },
  },
  flex: {
    isAtom: false,
    childRule: 'any',
    props: {
      ...COMMON_COLOR_PROPS,
      direction: { kind: 'string', options: ['row', 'column', 'row-reverse', 'column-reverse'], default: 'row' },
      gap: { kind: 'string', options: ['none', 'sm', 'md', 'lg', 'xl'], default: 'md' },
      justify: { kind: 'string', options: ['start', 'center', 'end', 'between', 'around', 'evenly'], default: 'start' },
      align: { kind: 'string', options: ['start', 'center', 'end', 'stretch', 'baseline'], default: 'center' },
      wrap: { kind: 'string', options: ['nowrap', 'wrap', 'wrap-reverse'], default: 'wrap' },
    },
  },
  container: {
    isAtom: false,
    childRule: 'single',
    props: {
      ...COMMON_COLOR_PROPS,
      style: { kind: 'string', options: ['none', 'card', 'glass', 'outlined', 'filled'], default: 'none' },
      padding: { kind: 'string', options: ['none', 'sm', 'md', 'lg', 'xl'], default: 'none' },
      borderRadius: { kind: 'string', options: ['none', 'sm', 'md', 'lg', 'xl', '2xl'], default: 'none' },
      alignX: ALIGN_X_LCR,
      alignY: ALIGN_Y_TMB,
    },
  },
  heading: {
    isAtom: true,
    childRule: 'none',
    props: {
      ...COMMON_COLOR_PROPS,
      text: { kind: 'string', default: 'Heading' },
      level: { kind: 'string', options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], default: 'h2' },
      size: { kind: 'string', options: ['sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'], default: 'xl' },
      textAlign: { kind: 'string', options: ['left', 'center', 'right'], default: 'left' },
      alignX: ALIGN_X_LCR,
      alignY: ALIGN_Y_TMB,
      gradient: { kind: 'boolean', default: false },
      marginTop: { kind: 'string', options: ['none', 'sm', 'md', 'lg', 'xl', '2xl'], default: 'none' },
      marginBottom: { kind: 'string', options: ['none', 'sm', 'md', 'lg', 'xl', '2xl'], default: 'md' },
      paddingTop: { kind: 'string', options: ['none', 'sm', 'md', 'lg', 'xl', '2xl'], default: 'none' },
      paddingBottom: { kind: 'string', options: ['none', 'sm', 'md', 'lg', 'xl', '2xl'], default: 'none' },
    },
  },
  description: {
    isAtom: true,
    childRule: 'none',
    props: {
      ...COMMON_COLOR_PROPS,
      text: { kind: 'text', default: 'Description text.' },
      size: { kind: 'string', options: ['xs', 'sm', 'base', 'lg', 'xl'], default: 'base' },
      textAlign: { kind: 'string', options: ['left', 'center', 'right'], default: 'left' },
      alignX: ALIGN_X_LCR,
      alignY: ALIGN_Y_TMB,
    },
  },
  link: {
    isAtom: true,
    childRule: 'none',
    props: {
      ...COMMON_COLOR_PROPS,
      label: { kind: 'string', default: 'Link' },
      href: { kind: 'string', default: '#' },
      variant: { kind: 'string', options: ['inline', 'nav', 'underline', 'pill'], default: 'nav' },
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
      ...COMMON_COLOR_PROPS,
      label: { kind: 'string', default: 'Click Me' },
      href: { kind: 'string', default: '#' },
      variant: {
        kind: 'string',
        options: ['primary', 'secondary', 'ghost', 'danger', 'success', 'warning', 'outline'],
        default: 'primary',
      },
      size: { kind: 'string', options: ['xs', 'sm', 'md', 'lg', 'xl'], default: 'md' },
      shape: { kind: 'string', options: ['default', 'pill', 'square', 'icon-only'], default: 'default' },
      alignX: ALIGN_X_LCR,
      alignY: ALIGN_Y_TMB,
      icon: { kind: 'string', default: '' },
      iconPosition: { kind: 'string', options: ['left', 'right'], default: 'right' },
      fullWidth: { kind: 'boolean', default: false },
      external: { kind: 'boolean', default: false },
    },
  },
  icon: {
    isAtom: true,
    childRule: 'none',
    props: {
      ...COMMON_COLOR_PROPS,
      name: { kind: 'string', default: 'Sparkles' },
      size: { kind: 'string', options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'], default: 'md' },
      shape: { kind: 'string', options: ['none', 'circle', 'square', 'rounded'], default: 'rounded' },
      accent: {
        kind: 'string',
        options: ['indigo', 'violet', 'emerald', 'amber', 'rose', 'sky', 'slate'],
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
      ...COMMON_COLOR_PROPS,
      url: {
        kind: 'string',
        default: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
      },
      alt: { kind: 'string', default: 'Image' },
      aspectRatio: { kind: 'string', options: ['auto', '16/9', '4/3', '1/1', '3/4'], default: 'auto' },
      objectFit: { kind: 'string', options: ['cover', 'contain', 'fill'], default: 'cover' },
      borderRadius: { kind: 'string', options: ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'], default: 'md' },
      alignX: ALIGN_X_LCR,
      alignY: ALIGN_Y_TMB,
    },
  },
  badge: {
    isAtom: true,
    childRule: 'none',
    props: {
      ...COMMON_COLOR_PROPS,
      text: { kind: 'string', default: 'New' },
      variant: { kind: 'string', options: ['solid', 'outline', 'subtle'], default: 'subtle' },
      color: {
        kind: 'string',
        options: ['indigo', 'rose', 'emerald', 'amber', 'sky', 'slate', 'violet'],
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
You are a world-class portfolio website layout designer, creative director, and UI architect. Your job is to generate EXTREMELY DIVERSE, NOVEL, and CREATIVE portfolio layouts using ONLY the 12 provided building blocks below.
Think like a human designer composing unique, dynamic UI structures. Vary your use of columns, rows, cards, glassmorphism, background colors, alignments, and sizes drastically based on the user's prompt. Avoid generic, repetitive "hero + 3 cards" templates unless that genuinely fits the request.
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
BLOCK SYSTEM — ONLY these 12 blocks exist. DO NOT invent new types or new prop names.
═══════════════════════════════════════════════════

── NAVIGATION ─────────────────────────────────────────────────────────────
[nav-bar-wrapper] — Sticky navigation bar. Always the FIRST top-level block on any page. Exactly ONE child (usually a "columns" with columns="2": left cell = logo/heading, right cell = nested columns/flex with links + a button).
Props: sticky(bool), transparent(bool), background(dark|glass|light|none), padding(sm|md|lg|xl), maxWidth(lg|xl|2xl|full), alignX(left|center|right), alignY(top|middle|bottom), textColor(css color), backgroundColor(css color)
{ "type": "nav-bar-wrapper", "props": { "sticky": true, "background": "glass", "padding": "lg", "maxWidth": "xl" }, "children": [ /* exactly 1 child */ ] }

── LAYOUT CONTAINERS (use these to structure every section) ───────────────
[container] — Box wrapper that positions exactly ONE child inside itself (great for hero sections, card backgrounds, centering content). isContainer.
Props: style(none|card|glass|outlined|filled), padding(none|sm|md|lg|xl), borderRadius(none|sm|md|lg|xl|2xl), alignX(left|center|right), alignY(top|middle|bottom), textColor, backgroundColor
{ "type": "container", "props": { "style": "glass", "padding": "xl", "borderRadius": "2xl", "alignX": "center", "alignY": "middle", "backgroundColor": "#0a0a0f" }, "children": [ /* exactly 1 child, usually rows or columns */ ] }

[columns] — Splits content into N EQUAL-WIDTH side-by-side cells (CSS grid). The number of children MUST exactly equal "columns". Each child is itself one block (often a container/rows wrapping more content).
Props: columns("2"|"3"|"4"), colSpans(optional number array, e.g. [1,2] = second cell twice as wide — length must equal columns or it's ignored), gap(none|sm|md|lg|xl), alignX(start|center|end|stretch), alignY(start|center|end|stretch)
{ "type": "columns", "props": { "columns": "3", "gap": "lg", "alignX": "stretch", "alignY": "stretch" }, "children": [ block1, block2, block3 ] }

[rows] — Splits content into N stacked rows. Each row sizes to its own content (not equal height). Children count MUST exactly equal "rows".
Props: rows("2"|"3"|"4"), rowSpans(optional), gap(none|sm|md|lg|xl), alignX(start|center|end|stretch), alignY(start|center|end|stretch)
{ "type": "rows", "props": { "rows": "3", "gap": "sm" }, "children": [ block1, block2, block3 ] }

[flex] — Children flow naturally and auto-size to their own content (NOT forced into equal cells). Use for button groups, tag/badge rows, icon rows, inline link groups. Accepts ANY number of children (no exact-count rule).
Props: direction(row|column|row-reverse|column-reverse), gap(none|sm|md|lg|xl), justify(start|center|end|between|around|evenly), align(start|center|end|stretch|baseline), wrap(nowrap|wrap|wrap-reverse)
{ "type": "flex", "props": { "direction": "row", "gap": "sm", "justify": "start", "align": "center", "wrap": "wrap" }, "children": [ badge1, badge2, badge3 ] }

── ATOMIC BLOCKS (terminal nodes — NEVER give these a "children" key) ─────
[heading] — text, level(h1-h6), size(sm|base|lg|xl|2xl|3xl|4xl|5xl), textAlign(left|center|right), gradient(bool), marginTop/marginBottom/paddingTop/paddingBottom(none|sm|md|lg|xl|2xl)
{ "type": "heading", "props": { "text": "I Build Digital Experiences", "level": "h1", "size": "5xl", "textAlign": "left", "gradient": true, "marginBottom": "md" } }

[description] — text, size(xs|sm|base|lg|xl), textAlign(left|center|right)
{ "type": "description", "props": { "text": "Full-stack developer crafting fast, accessible web apps.", "size": "lg", "textAlign": "left" } }

[link] — label, href, variant(inline|nav|underline|pill), size(sm|base|lg), showIcon(bool), external(bool)
{ "type": "link", "props": { "label": "About", "href": "#about", "variant": "nav" } }

[button] — label, href, variant(primary|secondary|ghost|danger|success|warning|outline), size(xs|sm|md|lg|xl), shape(default|pill|square|icon-only), icon(emoji string), iconPosition(left|right), fullWidth(bool), external(bool)
{ "type": "button", "props": { "label": "Hire Me", "href": "#contact", "variant": "primary", "size": "md", "shape": "pill" } }

[icon] — name(Lucide icon name, e.g. Code2, Rocket, Star, Mail, Github, Linkedin, Palette, Zap, Sparkles, Layers), size(xs|sm|md|lg|xl|2xl), shape(none|circle|square|rounded), accent(indigo|violet|emerald|amber|rose|sky|slate)
{ "type": "icon", "props": { "name": "Rocket", "size": "lg", "shape": "rounded", "accent": "violet" } }

[image] — url(real working Unsplash URL, e.g. https://images.unsplash.com/photo-XXXX?q=80&w=800&auto=format&fit=crop), alt, aspectRatio(auto|16/9|4/3|1/1|3/4), objectFit(cover|contain|fill), borderRadius(none|sm|md|lg|xl|2xl|full)
{ "type": "image", "props": { "url": "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=800&auto=format&fit=crop", "alt": "Portrait photo", "aspectRatio": "1/1", "objectFit": "cover", "borderRadius": "full" } }

[badge] — text, variant(solid|outline|subtle), color(indigo|rose|emerald|amber|sky|slate|violet), size(sm|md|lg), shape(rounded|pill)
{ "type": "badge", "props": { "text": "React", "variant": "subtle", "color": "sky", "size": "sm", "shape": "pill" } }

Both "textColor" and "backgroundColor" (CSS color/hex/gradient string) are accepted on EVERY block above for fine custom styling.

═══════════════════════════════════════════════════
STRUCTURAL RULES (verify ALL before outputting)
═══════════════════════════════════════════════════
1. The FIRST top-level section is always exactly one "nav-bar-wrapper".
2. Every "container" and "nav-bar-wrapper" has EXACTLY ONE child. If you need multiple things inside, wrap them in a "rows", "columns", or "flex" first.
3. Every "columns" block's children array length MUST exactly equal its "columns" prop. Every "rows" block's children array length MUST exactly equal its "rows" prop. Count before finalizing.
4. Atomic blocks (heading, description, link, button, icon, image, badge) are terminal — NEVER give them a "children" property, not even an empty array.
5. Use real, working Unsplash photo URLs for every "image" block (different photos per image — do not reuse the same URL twice in one layout).
6. Build deep, realistic content — section headings, multiple paragraphs/cards/projects with believable copy relevant to the user's prompt, not single-word placeholders.
7. Vary structure between sections: don't repeat the exact same columns/rows pattern for every section — mix container+rows, columns+container, flex groups, asymmetric colSpans, etc.

═══════════════════════════════════════════════════
WORKED EXAMPLE — a complete, well-structured "Hero" section
═══════════════════════════════════════════════════
{
  "type": "container",
  "name": "hero",
  "props": { "style": "none", "padding": "xl", "alignX": "center", "alignY": "middle", "backgroundColor": "#0a0a0f" },
  "children": [
    {
      "type": "columns",
      "props": { "columns": "2", "gap": "xl", "alignX": "stretch", "alignY": "center" },
      "children": [
        {
          "type": "rows",
          "props": { "rows": "4", "gap": "md" },
          "children": [
            { "type": "badge", "props": { "text": "Available for work", "variant": "subtle", "color": "emerald", "size": "sm" } },
            { "type": "heading", "props": { "text": "Hi, I'm John — React Developer", "level": "h1", "size": "5xl", "gradient": true } },
            { "type": "description", "props": { "text": "I build performant, accessible web applications with React and Node.js.", "size": "lg" } },
            { "type": "flex", "props": { "direction": "row", "gap": "sm", "justify": "start", "align": "center" }, "children": [
              { "type": "button", "props": { "label": "View Projects", "href": "#projects", "variant": "primary" } },
              { "type": "button", "props": { "label": "Contact Me", "href": "#contact", "variant": "outline" } }
            ] }
          ]
        },
        { "type": "image", "props": { "url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop", "alt": "John's portrait", "aspectRatio": "1/1", "objectFit": "cover", "borderRadius": "2xl" } }
      ]
    }
  ]
}
→ Notice: container has exactly 1 child (columns). columns="2" has exactly 2 children. rows="4" has exactly 4 children. All atomic blocks have no "children" key.
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
function cleanProps(type: string, rawProps: Record<string, unknown>): Record<string, unknown> {
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
  return { type: 'container', name: '', props: {}, children: [] };
}

/**
 * Recursively normalize a raw AI node into a clean LayoutSection-compatible
 * object. Returns null if the block type itself is unrecognized.
 */
function normalizeNode(raw: unknown, logger: Logger): RawNode | null {
  const node = raw as RawNode;
  if (!node || typeof node !== 'object' || !node.type || !VALID_TYPES.includes(node.type)) {
    if (node?.type) logger.warn(`Filtered unknown block type: "${node.type}"`);
    return null;
  }

  const def = BLOCK_DEFS[node.type];
  const cleanedProps = cleanProps(node.type, node.props ?? {});

  // Normalize children recursively first.
  let children: RawNode[] = Array.isArray(node.children)
    ? (node.children
      .map((c) => normalizeNode(c, logger))
      .filter((c): c is RawNode => c !== null))
    : [];

  // Enforce child-count rules per block type so the rendered grid never breaks.
  if (def.childRule === 'none') {
    children = [];
  } else if (def.childRule === 'single') {
    if (children.length > 1) {
      // Don't silently drop content — wrap the extras into a single "rows" block.
      children = [
        {
          type: 'rows',
          name: '',
          props: { rows: String(children.length), gap: 'md' },
          children,
        },
      ];
    }
  } else if (def.childRule === 'columns') {
    const expected = Math.min(4, Math.max(2, parseInt(String(cleanedProps.columns ?? '2'), 10) || 2));
    cleanedProps.columns = String(expected);
    if (children.length > expected) {
      logger.warn(`columns="${expected}" had ${children.length} children — trimming extras`);
      children = children.slice(0, expected);
    } else if (children.length < expected) {
      logger.warn(`columns="${expected}" had only ${children.length} children — padding with spacers`);
      while (children.length < expected) children.push(emptySpacer());
    }
  } else if (def.childRule === 'rows') {
    const expected = Math.min(4, Math.max(2, parseInt(String(cleanedProps.rows ?? '2'), 10) || 2));
    cleanedProps.rows = String(expected);
    if (children.length > expected) {
      logger.warn(`rows="${expected}" had ${children.length} children — trimming extras`);
      children = children.slice(0, expected);
    } else if (children.length < expected) {
      logger.warn(`rows="${expected}" had only ${children.length} children — padding with spacers`);
      while (children.length < expected) children.push(emptySpacer());
    }
  }
  // 'any' (flex) — no enforcement needed.

  return {
    id: genId(),
    type: node.type,
    name: node.name ?? '',
    props: cleanedProps,
    children,
  };
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openai: OpenAI;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    const token = this.configService.get<string>('githubModels.token');
    if (!token) {
      throw new Error(
        'AI_TOKEN is not configured. Add it to your .env file.',
      );
    }
    this.openai = new OpenAI({
      baseURL: 'https://models.inference.ai.azure.com',
      apiKey: token,
    });
    this.modelName = this.configService.get<string>('githubModels.model') ?? 'gpt-4o-mini';
    this.logger.log(`AI layout engine initialized (model: ${this.modelName})`);
  }

  async generateLayout(dto: GenerateLayoutDto): Promise<{
    layout: { sections: unknown[] };
    sectionsGenerated: number;
  }> {
    const isModification = !!dto.currentLayout;
    const basePrompt = this.buildPrompt(dto, isModification);

    try {
      this.logger.log(`Generating layout for: "${dto.prompt}"`);

      let validSections = await this.callAndNormalize(basePrompt, isModification);

      // ── Self-repair retry ──────────────────────────────────────────
      // If the first pass produced nothing usable (bad JSON, all-unknown
      // types, etc.), give the model exactly one more chance with a
      // sharper, shorter corrective instruction instead of failing outright.
      if (validSections.length === 0) {
        this.logger.warn('First generation pass produced no valid blocks — retrying once');
        const retryPrompt = `${basePrompt}\n\nYOUR PREVIOUS OUTPUT WAS REJECTED because it used invalid block types or malformed JSON. Re-read the BLOCK SYSTEM list above carefully. Use ONLY the 12 listed "type" values, follow the exact child-count rules, and output strictly valid JSON: { "sections": [ ... ] }`;
        validSections = await this.callAndNormalize(retryPrompt, isModification, 0.2);
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
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }
      const message = (error as Error).message ?? 'Unknown AI error';
      this.logger.error(`AI generation failed: ${message}`);
      throw new BadRequestException(`AI generation failed: ${message}`);
    }
  }

  /** Calls the model once and runs the parsed result through normalization. Returns [] on any failure (never throws). */
  private async callAndNormalize(
    prompt: string,
    isModification: boolean,
    forcedTemperature?: number,
  ): Promise<unknown[]> {
    const temperature = forcedTemperature ?? (isModification ? 0.3 : 0.9);

    const result = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: this.modelName,
      temperature,
      max_tokens: 8192,
      response_format: { type: 'json_object' },
    });
    const text = result.choices[0]?.message?.content || '{}';

    let parsed: { sections: unknown[] };
    try {
      parsed = JSON.parse(text) as { sections: unknown[] };
    } catch {
      this.logger.warn('Model returned invalid JSON');
      return [];
    }

    if (!parsed.sections || !Array.isArray(parsed.sections)) {
      this.logger.warn('Model response missing a "sections" array');
      return [];
    }

    return parsed.sections
      .map((s) => normalizeNode(s, this.logger))
      .filter((s): s is RawNode => s !== null);
  }

  /** Builds the full prompt (system context + optional modification block + user request). */
  private buildPrompt(dto: GenerateLayoutDto, isModification: boolean): string {
    let fullPrompt = `${COMPONENT_CONTEXT}\n\n`;

    if (dto.currentLayout) {
      fullPrompt += `
═══════════════════════════════════════════════════
MODIFICATION MODE — READ ALL RULES BEFORE ACTING
═══════════════════════════════════════════════════

CURRENT LAYOUT (the exact JSON tree currently rendered on screen):
${JSON.stringify(dto.currentLayout, null, 2)}

YOUR TASK:
The user wants a SURGICAL modification. Think of this like a code diff:
- Identify WHICH block(s) need to change based on the user's request
- Change ONLY those block(s) — keep everything else IDENTICAL (same props, same children, same order)
- Do NOT add new sections unless the user explicitly says "add a new section for..."
- Do NOT remove sections unless the user explicitly says "remove..."
- Do NOT rename, reorder, or restyle anything the user did not mention
- Still obey every rule in BLOCK SYSTEM above (valid types, exact child counts, no children on atoms)

MODIFICATION WORKFLOW (follow in order):
Step 1 — LOCATE: Find the exact block(s) in CURRENT LAYOUT that match the user's request.
Step 2 — PLAN: Decide in one sentence what you will change and what you will keep.
Step 3 — BUILD: Output the full updated "sections" array. Unchanged sections must be COPIED EXACTLY (same props, same children, same structure).

MODIFICATION EXAMPLES:

Example A — "Add a logo icon to the left of the navbar brand name"
Before (left column of navbar):
  { "type": "heading", "props": { "text": "MyPortfolio" } }
After (left column of navbar):
  { "type": "flex", "props": { "direction": "row", "gap": "sm", "align": "center" }, "children": [
    { "type": "icon", "props": { "name": "Code2", "size": "md", "accent": "violet" } },
    { "type": "heading", "props": { "text": "MyPortfolio", "size": "xl" } }
  ]}
→ ONLY the left column inner structure changes. Nav links, all other sections = unchanged.

Example B — "Change the hero heading text to 'I Build Digital Experiences'"
Before: { "type": "heading", "props": { "text": "Hello World", "level": "h1" } }
After:  { "type": "heading", "props": { "text": "I Build Digital Experiences", "level": "h1" } }
→ ONLY that one heading's text changes. Props like size, gradient, alignX stay identical.

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