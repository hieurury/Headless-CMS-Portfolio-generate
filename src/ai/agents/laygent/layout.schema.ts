import { z } from 'zod';
import { VALID_BLOCK_TYPES } from '../../blocks/block-defs';

/**
 * Fixed-depth Zod schema cho Layout Architect Agent output.
 *
 * WHY fixed-depth thay vì z.lazy():
 * Gemini API KHÔNG hỗ trợ recursive JSON schemas. Dùng z.lazy() gây
 * API-level rejection ("Error fetching from https://generativelanguage...").
 *
 * Depth 6 covers tất cả layout thực tế:
 *   Level 0 (Root sections)
 *     → Level 1 (container, nav-bar-wrapper)
 *       → Level 2 (columns, rows, flex)
 *         → Level 3 (rows inside columns)
 *           → Level 4 (flex inside rows)
 *             → Level 5 (container wrapping atoms)
 *               → Level 6 (atomic: heading, button, badge...)
 *
 * WHY z.any() cho props:
 * Gemini API reject z.record() vì nó sinh 'propertyNames' JSON Schema keyword
 * mà Gemini không support. Props được validate và clamp bởi normalizeNode()
 * trong AiService thay vì ở đây.
 */

const commonProps = z.any();

// ── Type enum — đảm bảo AI chỉ dùng đúng 12 block types ─────────────────────
const blockTypeEnum = z.enum(
  VALID_BLOCK_TYPES as [string, ...string[]],
);

// ── Depth 6: Leaf nodes (atomic) ─────────────────────────────────────────────
const Depth6NodeSchema = z.object({
  type: blockTypeEnum.describe(
    'Block type. Atomic blocks (heading, description, button, link, icon, image, badge) cannot have children.',
  ),
  name: z.string().optional(),
  props: commonProps,
});

// ── Depth 5 ───────────────────────────────────────────────────────────────────
const Depth5NodeSchema = z.object({
  type: blockTypeEnum.describe('Block type at depth 5.'),
  name: z.string().optional(),
  props: commonProps,
  children: z.array(Depth6NodeSchema).optional(),
});

// ── Depth 4 ───────────────────────────────────────────────────────────────────
const Depth4NodeSchema = z.object({
  type: blockTypeEnum.describe('Block type at depth 4.'),
  name: z.string().optional(),
  props: commonProps,
  children: z.array(Depth5NodeSchema).optional(),
});

// ── Depth 3 ──────────────────────────────────────────────────────────────────
const Depth3NodeSchema = z.object({
  type: blockTypeEnum.describe('Block type at depth 3: flex, rows, columns, container, or any atomic block.'),
  name: z.string().optional(),
  props: commonProps,
  children: z.array(Depth4NodeSchema).optional(),
});

// ── Depth 2 ──────────────────────────────────────────────────────────────────
const Depth2NodeSchema = z.object({
  type: blockTypeEnum.describe('Block type at depth 2: columns, rows, flex, container, or any atomic block.'),
  name: z.string().optional(),
  props: commonProps,
  children: z.array(Depth3NodeSchema).optional(),
});

// ── Depth 1 ──────────────────────────────────────────────────────────────────
const Depth1NodeSchema = z.object({
  type: blockTypeEnum.describe(
    'Block type at depth 1: container, columns, rows, flex, nav-bar-wrapper, or any atomic block.',
  ),
  name: z.string().optional(),
  props: commonProps,
  children: z.array(Depth2NodeSchema).optional(),
});

// ── Root ──────────────────────────────────────────────────────────────────────
export const RootLayoutSchema = z.object({
  sections: z
    .array(Depth1NodeSchema)
    .describe(
      'Array of top-level page blocks. First item must always be nav-bar-wrapper.',
    ),
});

export type RootLayout = z.infer<typeof RootLayoutSchema>;
