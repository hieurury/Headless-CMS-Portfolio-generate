import {
  Injectable,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
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
You are a world-class portfolio website layout designer and UI architect. 
Generate DIVERSE, CREATIVE, and VISUALLY RICH portfolio layouts using ONLY the 11 provided building blocks. 
You MUST combine Layout Containers and Atomic Blocks to build complex, beautiful sections. Do NOT output flat lists of atomic blocks.
Output ONLY valid JSON — no markdown, no text, no code blocks.

═══════════════════════════════════════════════════
BLOCK SYSTEM — ONLY these 11 blocks exist. DO NOT invent blocks.
═══════════════════════════════════════════════════

── NAVIGATION ───────────────────────────────────────────────────────────────
[nav-bar-wrapper] — Sticky navigation bar. Always the FIRST block on any page.
{ "type": "nav-bar-wrapper", "props": { "sticky": true, "transparent": true, "background": "dark", "padding": "lg", "maxWidth": "xl" }, "children": [...] }

── LAYOUT CONTAINERS (MUST BE USED TO STRUCTURE CONTENT) ─────────────────────────
[container] — Generic box container or full-width section wrapper. isContainer = true.
{ "type": "container", "props": { "style": "none", "padding": "xl", "borderRadius": "none", "alignX": "center", "alignY": "middle" }, "children": [/* exactly 1 child, usually rows or columns */] }
  style: "none" | "card" | "glass" | "outlined" | "filled"
  padding: "none" | "sm" | "md" | "lg" | "xl"
  alignX: "left" | "center" | "right"

[columns] — Side-by-side grid. isContainer=true. Children are placed directly into each column cell.
{ "type": "columns", "props": {"columns": "2", "gap": "md", "align": "stretch"}, "children": [ /* block 1 */, /* block 2 */ ] }
  columns: "2" | "3" | "4"
  align: "start" | "center" | "end" | "stretch"

[rows] — Vertical stack. isContainer=true. Children are placed directly into each row cell.
{ "type": "rows", "props": {"rows": "3", "gap": "lg", "align": "center"}, "children": [ /* block 1 */, /* block 2 */, /* block 3 */ ] }
  rows: "2" | "3" | "4"

── ATOMIC BLOCKS (NO CHILDREN ALLOWED) ──────────────────────────────────────────────
[heading] — Title text
{ "type": "heading", "props": {"text": "Hello", "level": "h2", "size": "4xl", "alignX": "center", "gradient": true} }

[description] — Paragraph / body text
{ "type": "description", "props": {"text": "...", "size": "base", "alignX": "left"} }

[button] — Call-to-action
{ "type": "button", "props": {"label": "Click", "variant": "primary", "href": "#", "icon": "🚀"} }
  variant: "primary" | "secondary" | "ghost" | "danger" | "success" | "warning" | "outline"

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

1. MODERN HERO (Split Layout):
   container(style="none", padding="xl") ->
     columns(columns="2", align="center") -> [
       rows(rows="3", gap="md") -> [ badge, heading(level="h1"), description ],
       image
     ]

2. CREATIVE HERO (Centered):
   container(style="none", padding="xl", alignX="center") ->
     rows(rows="4", gap="md", align="center") -> [ badge, heading, description, button ]

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
CRITICAL RULES FOR HIGH-QUALITY OUTPUT
═══════════════════════════════════════════════════
1. NEVER USE BLOCKS THAT ARE NOT IN THE 11 TYPES LISTED ABOVE. (e.g. do not use "split", "card", "text", "row", "section-wrapper").
2. ALWAYS use "container" as the top-level section wrapper for any distinct section (except nav-bar-wrapper).
3. "container" has exactly 1 child. If you need multiple items inside, put a "rows" or "columns" block inside it.
4. "columns" children MUST exactly match the "columns" count prop.
5. "rows" children MUST exactly match the "rows" count prop.
6. Create REALISTIC content. Invent project names, job roles, detailed descriptions.
7. JSON MUST BE STRICT. No trailing commas.
8. Return an object: { "sections": [ ... blocks ... ] }
`;

const VALID_TYPES = [
  'nav-bar-wrapper', 'columns', 'rows', 'container',
  'heading', 'description', 'link', 'button', 'icon', 'image', 'badge',
];

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not configured. Add it to your .env file.',
      );
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.logger.log('✅ Gemini AI initialized');
  }

  async generateLayout(dto: GenerateLayoutDto): Promise<{
    layout: { sections: unknown[] };
    sectionsGenerated: number;
  }> {
    try {
      this.logger.log(`[Gemini] Generating layout for: "${dto.prompt}"`);

      const modelName =
        this.configService.get<string>('gemini.model') ?? 'gemini-2.0-flash';

      const model = this.genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.9,
          maxOutputTokens: 8192,
        },
      });

      const fullPrompt = `${COMPONENT_CONTEXT}\n\nUser request: ${dto.prompt}\n\nAnalyze the user's request carefully. Choose the best LAYOUT PERSONA for their role. Generate a complete, unique, and content-rich portfolio page layout JSON using ONLY the block system above. Make the content specific, realistic, and compelling:`;

      const result = await model.generateContent(fullPrompt);
      const text = result.response.text();

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

      this.logger.log(`[Gemini] ✅ Generated ${validSections.length} top-level blocks`);

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
      this.logger.error(`[Gemini] Error: ${message}`);
      throw new BadRequestException(`AI generation failed: ${message}`);
    }
  }
}
