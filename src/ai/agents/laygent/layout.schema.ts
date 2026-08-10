import { z } from 'zod';

/**
 * Fixed-depth Zod schema for the Layout Architect Agent's output.
 *
 * WHY fixed-depth instead of z.lazy():
 * The Gemini API does NOT support recursive JSON schemas. Using z.lazy() causes
 * an API-level rejection ("Error fetching from https://generativelanguage...").
 * A fixed depth of 4 levels covers all real-world UI layout nesting:
 *   Level 0 (Root sections)
 *     → Level 1 (e.g. container, nav-bar-wrapper)
 *       → Level 2 (e.g. columns, rows, flex)
 *         → Level 3 (e.g. rows inside columns)
 *           → Level 4 (e.g. atomic blocks: heading, button, badge...)
 */

// z.any() is intentional: Gemini API rejects z.record() because it generates
// the 'propertyNames' JSON Schema keyword, which Gemini does not support.
const commonProps = z.any();

// ── Depth 4: Leaf nodes (atomic blocks — heading, button, etc.) ──────────────
const LeafNodeSchema = z.object({
  type: z.string().describe('Block type: heading, description, button, link, icon, image, or badge'),
  name: z.string().optional(),
  props: commonProps,
});

// ── Depth 3: Can contain leaf nodes ─────────────────────────────────────────
const Depth3NodeSchema = z.object({
  type: z.string().describe('Block type: flex, rows, columns, container, or any atomic block'),
  name: z.string().optional(),
  props: commonProps,
  children: z.array(LeafNodeSchema).optional(),
});

// ── Depth 2: Can contain depth-3 nodes ─────────────────────────────────────
const Depth2NodeSchema = z.object({
  type: z.string().describe('Block type: columns, rows, flex, container, or any atomic block'),
  name: z.string().optional(),
  props: commonProps,
  children: z.array(Depth3NodeSchema).optional(),
});

// ── Depth 1: Can contain depth-2 nodes ─────────────────────────────────────
const Depth1NodeSchema = z.object({
  type: z.string().describe('Block type: container, columns, rows, flex, nav-bar-wrapper, or any atomic block'),
  name: z.string().optional(),
  props: commonProps,
  children: z.array(Depth2NodeSchema).optional(),
});

// ── Root: Array of top-level sections (depth-1 nodes) ──────────────────────
export const RootLayoutSchema = z.object({
  sections: z
    .array(Depth1NodeSchema)
    .describe('Array of top-level page blocks. First item must always be nav-bar-wrapper.'),
});
