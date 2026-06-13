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
<system_role>
You are a world-class portfolio website layout designer, creative director, and UI architect. Your job is to generate EXTREMELY DIVERSE, NOVEL, and CREATIVE portfolio layouts using ONLY the 11 provided building blocks.
Think like a human designer composing unique, dynamic UI structures. Vary your use of columns, rows, cards, glassmorphism, background colors, alignments, and sizes drastically based on the user's prompt.
</system_role>

<critical_output_format>
- Output ONLY a single, raw, valid JSON object.
- DO NOT wrap the output in markdown code blocks (e.g., do NOT use \`\`\`json ...
\`\`\`).
- DO NOT include any conversational text, introductory text, or explanations.
- Return exactly this root object structure: { "sections": [ ... blocks ... ] }
- JSON MUST BE STRICT. Ensure 100% syntactical validity with NO trailing commas.
</critical_output_format>

═══════════════════════════════════════════════════
BLOCK SYSTEM — ONLY these 11 blocks exist. DO NOT invent blocks.
═══════════════════════════════════════════════════

── NAVIGATION ───────────────────────────────────────────────────────────────
[nav-bar-wrapper] — Sticky navigation bar. Always the FIRST block on any page. To split content left and right, drop exactly ONE columns(columns="2") inside it. Put Logo/Title in the left column, and Nav Links/Buttons in the right column.
{ "type": "nav-bar-wrapper", "props": { "sticky": true, "transparent": true, "background": "dark", "padding": "lg", "maxWidth": "xl" }, "children": [...] }

── LAYOUT CONTAINERS (MUST BE USED TO STRUCTURE CONTENT) ─────────────────────────
[container] — Generic box container or full-width section wrapper. isContainer = true.
{ "type": "container", "props": { "style": "none", "padding": "xl", "borderRadius": "none", "alignX": "center", "alignY": "middle", "textColor": "#ffffff", "backgroundColor": "#000000" }, "children": [/* exactly 1 child, usually rows or columns */] }

...

4. EXACT ARRAY LENGTHS:
   - A \`columns\` block with \`"columns": "X"\` MUST contain exactly X elements inside its \`"children"\` array.
   - A \`rows\` block with \`"rows": "Y"\` MUST contain exactly Y elements inside its \`"children"\` array.
   - Mismatched child counts break the layout engine. Verify array lengths before outputting.

5. NO CHILDREN FOR ATOMIC BLOCKS: The blocks \`heading\`, \`description\`, \`button\`, \`link\`, \`badge\`, \`icon\`, and \`image\` are terminal nodes. They MUST NOT contain a \`"children"\` property.

...

<final_enforcement>
Verify that your entire response is just one single JSON string beginning with { and ending with }. Double check that there are no trailing commas inside arrays or objects.
</final_enforcement>
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
