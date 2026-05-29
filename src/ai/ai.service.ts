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
You are a world-class portfolio website layout designer. Generate DIVERSE, CREATIVE, and VISUALLY RICH portfolio layouts using a block composition system. Output ONLY valid JSON — no markdown, no text, no code blocks.

═══════════════════════════════════════════════════
BLOCK SYSTEM — all available blocks
═══════════════════════════════════════════════════

── NAVIGATION ───────────────────────────────────────────────────────────────

[navbar] — Sticky navigation bar. Always the FIRST block on any page.
{
  "type": "navbar",
  "props": {
    "logo": "Alex.dev",
    "links": [{"label": "About", "href": "#about"}, {"label": "Work", "href": "#work"}, {"label": "Contact", "href": "#contact"}],
    "ctaLabel": "Hire Me",
    "ctaHref": "#contact",
    "sticky": true,
    "transparent": true
  }
}

── LAYOUT CONTAINERS ────────────────────────────────────────────────────────

[section-wrapper] — Full-width section container. isContainer = true. Wrap any blocks inside.
{
  "type": "section-wrapper",
  "name": "hero",
  "props": {
    "label": "Hello World",
    "title": "My Portfolio",
    "subtitle": "Full-stack developer based in Vietnam",
    "align": "center",
    "padding": "xl",
    "background": "gradient",
    "maxWidth": "xl",
    "showDivider": false
  },
  "children": [/* blocks */]
}
  background: "default" | "alternate" | "dark" | "gradient" | "none"
  padding: "sm" | "md" | "lg" | "xl"
  align: "left" | "center" | "right"
  maxWidth: "sm" | "md" | "lg" | "xl" | "full"

[columns] — Side-by-side grid. isContainer=true. Children MUST be _column blocks.
{
  "type": "columns",
  "props": {"columns": "3", "gap": "md", "align": "start"},
  "children": [
    {"type": "_column", "props": {}, "children": [/* blocks */]},
    {"type": "_column", "props": {}, "children": [/* blocks */]},
    {"type": "_column", "props": {}, "children": [/* blocks */]}
  ]
}
  columns: "2" | "3" | "4"
  gap: "none" | "sm" | "md" | "lg" | "xl"

[split] — Two-column split with ratio control. isContainer=true. Children MUST be exactly 2 _column blocks.
{
  "type": "split",
  "props": {"leftWidth": "50", "verticalAlign": "center", "gap": "xl", "reverse": false},
  "children": [
    {"type": "_column", "props": {"align": "start"}, "children": [/* left blocks */]},
    {"type": "_column", "props": {"align": "center"}, "children": [/* right blocks */]}
  ]
}
  leftWidth: "33" | "40" | "50" | "60" | "67"

[row] — Vertical stack of blocks. isContainer=true.
{
  "type": "row",
  "props": {"gap": "lg", "align": "center", "padding": "none"},
  "children": [/* blocks */]
}
  gap: "none" | "sm" | "md" | "lg" | "xl"
  align: "start" | "center" | "end" | "stretch"

[card] — Styled card container. isContainer=true.
{
  "type": "card",
  "props": {"variant": "glass", "padding": "md", "radius": "xl", "showHeader": true, "title": "Card Title", "subtitle": "Subtitle"},
  "children": [/* blocks */]
}
  variant: "default" | "glass" | "outlined" | "elevated" | "gradient"

[container] — Generic box container. isContainer=true.
{
  "type": "container",
  "props": {"padding": "md", "style": "glass", "maxWidth": "lg"},
  "children": [/* blocks */]
}

── ATOMIC BLOCKS (no children) ──────────────────────────────────────────────

[heading] — Title text
{
  "type": "heading",
  "props": {"text": "Hi, I'm Alex", "level": "h1", "size": "5xl", "align": "center", "gradient": true}
}
  level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  size: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl"

[text] — Paragraph / body text
{
  "type": "text",
  "props": {"content": "I build scalable web apps with React & Node.js.", "size": "lg", "align": "center", "muted": true}
}

[button] — Call-to-action button
{
  "type": "button",
  "props": {"label": "View My Work", "href": "#work", "variant": "primary", "size": "lg", "align": "center"}
}
  variant: "primary" | "secondary" | "ghost" | "danger"

[badge] — Small colored label
{
  "type": "badge",
  "props": {"label": "✨ Available for work", "variant": "indigo", "align": "center"}
}
  variant: "indigo" | "violet" | "emerald" | "amber" | "rose" | "sky" | "slate"

[image] — Image block
{
  "type": "image",
  "props": {"src": "", "alt": "Profile photo", "width": "100%", "borderRadius": "2xl", "align": "center"}
}

[stat] — Key metric counter
{
  "type": "stat",
  "props": {"value": "5+", "label": "Years Experience", "icon": "🏆", "variant": "card", "accent": "indigo", "align": "center"}
}
  variant: "default" | "card" | "bordered" | "minimal"
  accent: "indigo" | "violet" | "emerald" | "amber" | "rose" | "sky"

[feature-card] — Icon + title + description
{
  "type": "feature-card",
  "props": {"icon": "⚡", "title": "Performance", "description": "I build fast, accessible, production-ready apps.", "variant": "glass", "accent": "violet"}
}
  variant: "default" | "glass" | "outlined" | "gradient" | "minimal"

[timeline-item] — Experience/education entry
{
  "type": "timeline-item",
  "props": {
    "role": "Senior Developer",
    "company": "TechCorp",
    "startDate": "Jan 2022",
    "endDate": "Present",
    "location": "Remote",
    "description": "Led development of a B2B SaaS platform.",
    "highlights": [{"value": "40% performance improvement"}, {"value": "Mentored 4 junior devs"}],
    "variant": "card",
    "accent": "indigo",
    "showDot": true
  }
}

[divider] — Horizontal line
{
  "type": "divider",
  "props": {"style": "gradient", "spacing": "md"}
}
  style: "solid" | "dashed" | "dotted" | "gradient"

[spacer] — Vertical spacing
{
  "type": "spacer",
  "props": {"height": "md"}
}
  height: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"

═══════════════════════════════════════════════════
COMPOSITION PATTERNS — how to build sections
═══════════════════════════════════════════════════

HERO SECTION (centered):
  section-wrapper(background: "gradient", padding: "xl") →
    badge + heading(h1, 5xl, gradient) + text(lg, muted) + row → [button(primary), button(secondary)]

HERO SECTION (split):
  section-wrapper(background: "default", padding: "xl") →
    split(leftWidth: "50") → [
      _column → [badge + heading(h1) + text + button],
      _column → [image]
    ]

ABOUT SECTION:
  section-wrapper(name: "about", title: "About Me", background: "alternate") →
    split(leftWidth: "40") → [
      _column → [image(borderRadius: "2xl")],
      _column → [heading(h3) + text + text + button]
    ]

SKILLS SECTION:
  section-wrapper(name: "skills", title: "Skills") →
    columns(3) → [
      _column → [feature-card(icon, title, description, variant: "glass")],
      _column → [feature-card(...)],
      _column → [feature-card(...)]
    ]

STATS BANNER:
  section-wrapper(background: "alternate", padding: "md") →
    columns(4) → [
      _column → [stat(value, label, icon)],
      _column → [stat(...)],
      _column → [stat(...)],
      _column → [stat(...)]
    ]

PROJECTS SECTION:
  section-wrapper(name: "work", title: "My Projects", background: "alternate") →
    columns(2 or 3) → [
      _column → [card(glass, showHeader: true, title, subtitle) → [image + text + button]],
      _column → [card(...) → [image + text + button]],
      ...
    ]

EXPERIENCE SECTION:
  section-wrapper(name: "experience", title: "Work Experience") →
    row(gap: "lg") → [
      timeline-item(role, company, dates, description, highlights, variant: "card"),
      timeline-item(...),
      ...
    ]

EDUCATION SECTION:
  section-wrapper(name: "education", title: "Education") →
    row(gap: "md") → [
      timeline-item(role: degree+field, company: institution, startDate, endDate, description),
      ...
    ]

CONTACT SECTION:
  section-wrapper(name: "contact", title: "Let's Work Together", background: "gradient", padding: "xl") →
    text(centered, lg) + row(align: "center") → [button(primary, mailto:), button(secondary, LinkedIn)]

FOOTER:
  section-wrapper(name: "footer", background: "dark", padding: "sm") →
    row(align: "center") → [text(copyright, center, muted), divider, row → [button(ghost, Privacy), button(ghost, Terms)]]

═══════════════════════════════════════════════════
LAYOUT PERSONAS — pick based on user's role
═══════════════════════════════════════════════════

DEVELOPER/ENGINEER:
  navbar → hero(centered, gradient) → about(split) → skills(feature-cards) → stats(4-col) → experience(timeline) → work(project cards) → contact → footer

DESIGNER/CREATIVE:
  navbar → hero(split, bold heading) → work(large cards 2-col) → skills(feature-cards, minimal) → about(centered) → contact

CONSULTANT/PROFESSIONAL:
  navbar → hero(centered, dark) → stats(4-col) → skills(feature-cards) → experience(timeline) → about → contact

MINIMALIST:
  navbar → hero(centered, minimal) → about(split) → work(2-col cards) → contact

═══════════════════════════════════════════════════
ANCHOR IDs — use "name" field for smooth scroll
═══════════════════════════════════════════════════

Set the "name" field on section-wrapper and navbar to enable anchor navigation:
  navbar links use "#" + section name
  section-wrappers: name: "about" | "work" | "skills" | "experience" | "contact" | "footer" | etc.
  
Navbar links MUST point to section names you actually include.

═══════════════════════════════════════════════════
CONTENT RULES
═══════════════════════════════════════════════════

1. Use real-sounding names, companies, project names (never "Lorem ipsum")
2. highlights array MUST always be [{value: "..."}, ...] format — NEVER plain strings
3. Give each section a clear purpose and real content
4. Use different background values across sections for visual rhythm
5. Projects: 2-3 cards with real tech stacks in subtitle
6. Experience: 2-3 timeline-items with concrete achievements

═══════════════════════════════════════════════════
OUTPUT FORMAT — strict JSON only
═══════════════════════════════════════════════════

{
  "sections": [
    {
      "id": "section-1",
      "type": "<block type>",
      "name": "<anchor id or empty>",
      "props": { ... },
      "children": []
    }
  ]
}

For containers (section-wrapper, row, columns, _column, card, container, split):
  "children" contains nested blocks with the same structure.
For atomic blocks: "children" must be [].
NEVER output markdown, explanation, or code blocks. ONLY the raw JSON object.
`;

const VALID_TYPES = [
  // Navigation
  'navbar',
  // Layout containers
  'section-wrapper', 'split', 'columns', '_column', 'row', 'card', 'container',
  // Content atomic blocks
  'heading', 'text', 'button', 'badge', 'image',
  'stat', 'feature-card', 'timeline-item',
  'divider', 'spacer',
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
          id: s.id ?? `block-ai-${Date.now()}-${index}`,
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
