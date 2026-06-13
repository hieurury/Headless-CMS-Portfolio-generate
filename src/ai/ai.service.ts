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
 * Block-only component catalogue for AI layout generation.
 *
 * All old monolithic Section types (hero, about, skills, projects,
 * experience, education, contact, footer) have been removed.
 *
 * Layouts are now built by composing Layout containers + Atomic blocks.
 * The AI generates a tree of section-wrappers containing blocks.
 */
const COMPONENT_CONTEXT = `
You are a world-class portfolio website layout designer, creative director, and UI architect. 
Generate EXTREMELY DIVERSE, NOVEL, and CREATIVE portfolio layouts using ONLY the 11 provided building blocks.
CRITICAL: DO NOT REPEAT BOILERPLATE LAYOUTS. Think like a human designer composing unique, dynamic UI structures. Vary your use of columns, rows, cards, glassmorphism, background colors, alignments, and sizes drastically based on the user's prompt. 
You MUST combine Layout Containers and Atomic Blocks to build complex, beautiful sections. Do NOT output flat lists of atomic blocks.
Output ONLY valid JSON — no markdown, no text, no code blocks.

═══════════════════════════════════════════════════
BLOCK SYSTEM — ONLY these 11 blocks exist. DO NOT invent blocks.
═══════════════════════════════════════════════════

── NAVIGATION ───────────────────────────────────────────────────────────────
[nav-bar-wrapper] — Sticky navigation bar. Always the FIRST block on any page. To split content left and right, drop exactly ONE columns(columns="2") inside it. Put Logo/Title in the left column, and Nav Links/Buttons in the right column.
{ "type": "nav-bar-wrapper", "props": { "sticky": true, "transparent": true, "background": "dark", "padding": "lg", "maxWidth": "xl" }, "children": [...] }

── LAYOUT CONTAINERS (MUST BE USED TO STRUCTURE CONTENT) ─────────────────────────
[container] — Generic box container or full-width section wrapper. isContainer = true.
{ "type": "container", "props": { "style": "none", "padding": "xl", "borderRadius": "none", "alignX": "center", "alignY": "middle", "textColor": "#ffffff", "backgroundColor": "#000000" }, "children": [/* exactly 1 child, usually rows or columns */] }
  style: "none" | "card" | "glass" | "outlined" | "filled"
  padding: "none" | "sm" | "md" | "lg" | "xl"
  borderRadius: "none" | "sm" | "md" | "lg" | "xl" | "2xl"
  alignX: "left" | "center" | "right"
  alignY: "top" | "middle" | "bottom"
  backgroundColor: string (hex or CSS color)
  textColor: string (hex or CSS color)

[columns] — HORIZONTAL side-by-side grid (Left-to-Right). isContainer=true. Children are placed directly into each column cell. Use this when you want items next to each other horizontally.
{ "type": "columns", "props": {"columns": "2", "gap": "md", "alignX": "stretch", "alignY": "stretch"}, "children": [ /* block 1 */, /* block 2 */ ] }
  columns: "2" | "3" | "4"
  alignX: "start" | "center" | "end" | "stretch"
  alignY: "start" | "center" | "end" | "stretch"
  gap: "none" | "sm" | "md" | "lg" | "xl"

[rows] — VERTICAL stack (Top-to-Bottom). isContainer=true. Children are placed directly into each row cell. Use this when you want items stacked vertically.
{ "type": "rows", "props": {"rows": "3", "gap": "lg", "alignX": "stretch", "alignY": "stretch"}, "children": [ /* block 1 */, /* block 2 */, /* block 3 */ ] }
  rows: "2" | "3" | "4"
  alignX: "start" | "center" | "end" | "stretch"
  alignY: "start" | "center" | "end" | "stretch"
  gap: "none" | "sm" | "md" | "lg" | "xl"

── ATOMIC BLOCKS (NO CHILDREN ALLOWED) ──────────────────────────────────────────────
[heading] — Title text
{ "type": "heading", "props": {"text": "Hello", "level": "h2", "size": "4xl", "textAlign": "center", "alignX": "center", "alignY": "middle", "gradient": true, "color": "#ffffff"} }
  size: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl"
  textAlign: "left" | "center" | "right"
  alignX: "left" | "center" | "right"
  alignY: "top" | "middle" | "bottom"
  color: string (hex or CSS color)
  backgroundColor: string (hex or CSS color)

[description] — Paragraph / body text
{ "type": "description", "props": {"text": "...", "size": "base", "textAlign": "left", "alignX": "left", "alignY": "middle", "color": "#aaaaaa"} }
  size: "sm" | "base" | "lg" | "xl"
  textAlign: "left" | "center" | "right"
  alignX: "left" | "center" | "right"
  alignY: "top" | "middle" | "bottom"
  color: string (hex or CSS color)
  backgroundColor: string (hex or CSS color)

[button] — Call-to-action
{ "type": "button", "props": {"label": "Click", "variant": "primary", "href": "#", "icon": "🚀", "alignX": "center", "alignY": "middle"} }
  variant: "primary" | "secondary" | "ghost" | "danger" | "success" | "warning" | "outline"
  alignX: "left" | "center" | "right"
  alignY: "top" | "middle" | "bottom"

[link] — Inline hyperlink
{ "type": "link", "props": {"label": "About", "variant": "nav", "href": "#about"} }

[badge] — Small colored label
{ "type": "badge", "props": {"text": "New", "variant": "subtle", "color": "indigo", "shape": "pill"} }

[icon] — A Lucide icon
{ "type": "icon", "props": {"name": "Sparkles", "size": "lg", "shape": "circle", "accent": "violet"} }
  name: Any valid Lucide icon name (e.g. Star, Zap, Code2)

[image] — Image block
{ "type": "image", "props": {"url": "https://...", "alt": "image", "borderRadius": "xl", "objectFit": "cover"} }

═══════════════════════════════════════════════════
COMPOSITION PATTERNS — HOW TO BUILD COMPLETE, RICH SECTIONS
═══════════════════════════════════════════════════

0. HEADER / NAVBAR (Left: Logo+Title, Right: Links):
   nav-bar-wrapper(background="dark", padding="lg", alignX="center") -> 
     columns(columns="2", alignY="center") -> [
       columns(columns="2", gap="sm", alignY="center") -> [ icon(name="Code2"), heading(text="MyBrand") ],
       columns(columns="3", gap="sm", alignY="center", alignX="end") -> [ link, link, button ]
     ]

1. MODERN HERO (Split Layout):
   container(style="none", padding="xl", alignX="center") ->
     columns(columns="2", alignY="center") -> [
       rows(rows="3", gap="md") -> [ badge, heading(level="h1"), description ],
       image
     ]

2. CREATIVE HERO (Centered):
   container(style="none", padding="xl", alignX="center") ->
     rows(rows="4", gap="md", alignX="center", alignY="center") -> [ badge, heading, description, button ]

3. BENTO GRID / PROJECTS (using Columns & Cards):
   container(style="none", padding="lg") ->
     rows(rows="2", gap="lg") -> [
       heading(text="Featured Work"),
       columns(columns="3", gap="md") -> [
         container(style="card", padding="md") -> rows(rows="3") -> [ image, heading, description ],
         container(style="card", padding="md") -> rows(rows="3") -> [ image, heading, description ],
         container(style="card", padding="md") -> rows(rows="3") -> [ image, heading, description ]
       ]
     ]

4. SKILLS / FEATURES (Custom Feature Cards):
   container(style="none", padding="xl") ->
     rows(rows="2", gap="xl") -> [
       heading,
       columns(columns="3", gap="lg") -> [
         container(style="glass", padding="lg") -> rows(rows="3") -> [ icon, heading, description ],
         container(style="glass", padding="lg") -> rows(rows="3") -> [ icon, heading, description ],
         container(style="glass", padding="lg") -> rows(rows="3") -> [ icon, heading, description ]
       ]
     ]

5. EXPERIENCE TIMELINE:
   container(style="none", padding="xl") ->
     rows(rows="2", gap="lg") -> [
       heading,
       columns(columns="2", gap="md") -> [
         container(style="outlined", padding="md") -> rows(rows="2") -> [ heading, description ],
         container(style="outlined", padding="md") -> rows(rows="2") -> [ heading, description ]
       ]
     ]

═══════════════════════════════════════════════════
STRUCTURAL CONSTRAINTS — MEMORIZE THESE
═══════════════════════════════════════════════════

NAV-BAR-WRAPPER internal structure:
  nav-bar-wrapper → exactly ONE columns(columns="2") child
  Left column  → logo area:  columns(columns="2", gap="sm", align="center") → [icon, heading]
  Right column → links area: columns(columns="3", gap="sm") or columns(columns="4") → [link, link, ..., button]
  NEVER put nav links and logo in the same column.
  NEVER use rows as the direct child of nav-bar-wrapper.

CONTAINER children:
  container MUST have exactly 1 direct child.
  Need 2+ things inside? → wrap them in rows or columns first.

COLUMNS children count (STRICT):
  columns(columns="2") → EXACTLY 2 children — no more, no less
  columns(columns="3") → EXACTLY 3 children
  columns(columns="4") → EXACTLY 4 children

ROWS children count (STRICT):
  rows(rows="2") → EXACTLY 2 children
  rows(rows="3") → EXACTLY 3 children
  rows(rows="4") → EXACTLY 4 children

ATOMIC BLOCKS have NO children:
  heading, description, button, link, badge, icon, image
  → Never add a "children" array to these types.

═══════════════════════════════════════════════════
CRITICAL RULES FOR HIGH-QUALITY OUTPUT
═══════════════════════════════════════════════════
1. NEVER USE BLOCKS THAT ARE NOT IN THE 11 TYPES LISTED ABOVE. (e.g. do not use "split", "card", "text", "row", "section-wrapper").
2. ALWAYS use "container" as the top-level section wrapper for any distinct section (except nav-bar-wrapper).
3. "container" has exactly 1 child. If you need multiple items inside, put a "rows" or "columns" block inside it.
4. ONLY modify properties that are EXPLICITLY documented in the schemas above. DO NOT invent CSS properties (e.g., do not use 'fontSize', 'margin' directly). Use 'size', 'padding', 'color', 'backgroundColor', 'textColor' as shown in the schemas.
5. NEVER output empty containers. Always put content inside them.
6. JSON MUST BE STRICT. No trailing commas.
7. Return an object: { "sections": [ ... blocks ... ] }

═══════════════════════════════════════════════════
STRUCTURAL CONSTRAINTS — MEMORIZE THESE
═══════════════════════════════════════════════════

NAV-BAR-WRAPPER children rule:
  nav-bar-wrapper MUST contain exactly ONE columns(columns="2") child.
  Left column: logo area → columns(columns="2", gap="sm") → [icon, heading]
  Right column: links area → columns(columns="3" or "4", gap="sm") → [link, link, ..., button]
  NEVER put links and logo in the same column.
  NEVER use rows inside nav-bar-wrapper as direct child.

CONTAINER children rule:
  container MUST have exactly 1 direct child.
  If you need 2+ things inside a container, wrap them in a rows or columns block first.

COLUMNS children count rule:
  columns(columns="2") → EXACTLY 2 children
  columns(columns="3") → EXACTLY 3 children
  columns(columns="4") → EXACTLY 4 children
  Mismatched count = broken layout. Count carefully.

ROWS children count rule:
  rows(rows="2") → EXACTLY 2 children
  rows(rows="3") → EXACTLY 3 children
  rows(rows="4") → EXACTLY 4 children

ATOMIC BLOCKS (heading, description, button, link, badge, icon, image):
  These NEVER have children. Do not add a "children" field to them.
`;

const VALID_TYPES = [
  'nav-bar-wrapper', 'columns', 'rows', 'container',
  'heading', 'description', 'link', 'button', 'icon', 'image', 'badge',
];

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const token = this.configService.get<string>('githubModels.token');
    if (!token) {
      throw new Error(
        'AI_TOKEN is not configured. Add it to your .env file.',
      );
    }
    this.openai = new OpenAI({
      baseURL: 'https://models.inference.ai.azure.com',
      apiKey: token
    });
    this.logger.log('✅ GitHub Models AI initialized');
  }

  async generateLayout(dto: GenerateLayoutDto): Promise<{
    layout: { sections: unknown[] };
    sectionsGenerated: number;
  }> {
    try {
      this.logger.log(`[GitHub Models] Generating layout for: "${dto.prompt}"`);

      const modelName =
        this.configService.get<string>('githubModels.model') ?? 'gpt-4o-mini';

      // Use lower temperature for modifications to reduce hallucination
      const isModification = !!dto.currentLayout;
      const temperature = isModification ? 0.3 : 0.9;

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

MODIFICATION WORKFLOW (follow in order):
Step 1 — LOCATE: Find the exact block(s) in CURRENT LAYOUT that match the user's request.
Step 2 — PLAN: Describe in one sentence what you will change and what you will keep.
Step 3 — BUILD: Output the full updated "sections" array. Unchanged sections must be COPIED EXACTLY (same props, same children, same structure).

MODIFICATION EXAMPLES:

Example A — "Add a logo icon to the left of the navbar brand name"
Before (left column of navbar):
  { "type": "heading", "props": { "text": "MyPortfolio" } }
After (left column of navbar):
  { "type": "columns", "props": { "columns": "2", "gap": "sm", "align": "center" }, "children": [
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
❌ Replacing a heading+icon columns pattern with a rows pattern
❌ Adding a Hero, Footer, or Projects section when user only asked to modify navbar

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
`;
      }



      const result = await this.openai.chat.completions.create({
        messages: [{ role: 'user', content: fullPrompt }],
        model: modelName,
        temperature: temperature,
        max_tokens: 8192,
        response_format: { type: 'json_object' },
      });
      const text = result.choices[0]?.message?.content || '{}';

      let parsed: { sections: unknown[] };
      try {
        parsed = JSON.parse(text) as { sections: unknown[] };
      } catch {
        throw new BadRequestException(
          'AI returned invalid JSON — please try a different prompt',
        );
      }

      if (!parsed.sections || !Array.isArray(parsed.sections)) {
        throw new BadRequestException('AI response missing sections array');
      }

      // Deep recursive filter + normalize — only allow registered block types
      const normalizeSection = (
        s: {
          id?: string;
          type?: string;
          name?: string;
          props?: Record<string, unknown>;
          children?: unknown[];
        },
        index: number,
      ): unknown => {
        if (!s.type || !VALID_TYPES.includes(s.type)) {
          this.logger.warn(`Filtered unknown block type: "${s.type}"`);
          return null;
        }
        return {
          id: `block-ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: s.type,
          name: s.name ?? '',
          props: s.props ?? {},
          children: Array.isArray(s.children)
            ? (s.children as typeof s[])
              .map((c, i) => normalizeSection(c, i))
              .filter(Boolean)
            : [],
        };
      };

      const validSections = (
        parsed.sections as Array<{
          id?: string;
          type?: string;
          name?: string;
          props?: Record<string, unknown>;
          children?: unknown[];
        }>
      )
        .map((s, i) => normalizeSection(s, i))
        .filter(Boolean);

      if (validSections.length === 0) {
        throw new BadRequestException(
          'AI generated no valid blocks — please try a more specific prompt',
        );
      }

      this.logger.log(`[GitHub Models] ✅ Generated ${validSections.length} top-level blocks`);

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
      this.logger.error(`[GitHub Models] Error: ${message}`);
      throw new BadRequestException(`AI generation failed: ${message}`);
    }
  }
}
