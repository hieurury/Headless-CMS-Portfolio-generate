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
 * The 9 built-in component types with their schemas.
 * Injected into the Gemini system prompt so the AI knows
 * exactly which types and props are valid.
 */
const COMPONENT_CONTEXT = `
You are a world-class portfolio website layout designer. Generate DIVERSE, CREATIVE, and VISUALLY RICH portfolio layouts. Output ONLY valid JSON — no markdown, no text, no code blocks.

═══════════════════════════════════════════════════
COMPONENT CATALOGUE — learn every option exactly
═══════════════════════════════════════════════════

── SECTION TEMPLATES (pre-styled full sections) ──────────────────────────

[navbar]
{
  "type": "navbar",
  "props": {
    "logo": "Alex.dev",
    "links": [{"label": "About", "href": "#about"}, {"label": "Projects", "href": "#projects"}, {"label": "Contact", "href": "#contact"}],
    "ctaLabel": "Hire Me",
    "ctaHref": "#contact",
    "sticky": true
  }
}

[hero] — layout: "fullscreen" | "split" | "minimal" | "centered-card"
        colorScheme: "indigo" | "violet" | "emerald" | "rose" | "amber" | "cyan" | "slate"
{
  "type": "hero",
  "props": {
    "layout": "split",
    "colorScheme": "emerald",
    "heading": "Building Products That Matter",
    "subheading": "Full-stack engineer specializing in React & Node.js. I turn complex problems into elegant, scalable solutions.",
    "badge": "Open to work · Remote",
    "ctaLabel": "View My Work",
    "ctaHref": "#projects",
    "secondaryCtaLabel": "Download CV",
    "secondaryCtaHref": "#contact",
    "alignment": "left"
  }
}

[about] — layout: "image-side" | "centered" | "stats" | "minimal"
          colorScheme: same 7 options
{
  "type": "about",
  "props": {
    "layout": "stats",
    "colorScheme": "violet",
    "title": "Who I Am",
    "bio": "I'm a passionate full-stack developer with 6 years building production web apps. I love solving complex technical challenges and collaborating with cross-functional teams to deliver outstanding user experiences.",
    "highlights": [
      {"value": "6+ years professional experience"},
      {"value": "Led teams of 5+ developers"},
      {"value": "20+ shipped products"},
      {"value": "Open source enthusiast"}
    ],
    "imagePosition": "right"
  }
}

[skills] — layout: "progress" | "grid" | "tags" | "compact"
           colorScheme: same 7 options
{
  "type": "skills",
  "props": {
    "layout": "tags",
    "colorScheme": "cyan",
    "title": "My Tech Stack",
    "subtitle": "Technologies I use every day",
    "categories": [
      {
        "name": "Frontend",
        "skills": [{"name": "React", "level": 92}, {"name": "TypeScript", "level": 88}, {"name": "Next.js", "level": 85}, {"name": "Tailwind CSS", "level": 90}]
      },
      {
        "name": "Backend",
        "skills": [{"name": "Node.js", "level": 87}, {"name": "NestJS", "level": 82}, {"name": "PostgreSQL", "level": 78}, {"name": "Redis", "level": 70}]
      },
      {
        "name": "DevOps",
        "skills": [{"name": "Docker", "level": 75}, {"name": "AWS", "level": 68}, {"name": "GitHub Actions", "level": 80}]
      }
    ]
  }
}

[projects]
{
  "type": "projects",
  "props": {
    "title": "Featured Work",
    "subtitle": "Projects I'm proud of",
    "columns": "3",
    "projects": [
      {
        "name": "SaaS Analytics Platform",
        "description": "Real-time dashboard for tracking user behavior. Built with React, D3.js, and WebSockets for live updates.",
        "tags": [{"value": "React"}, {"value": "D3.js"}, {"value": "Node.js"}, {"value": "WebSocket"}],
        "demoUrl": "https://demo.example.com",
        "githubUrl": "https://github.com/example",
        "featured": true
      },
      {
        "name": "E-Commerce Mobile App",
        "description": "Full-featured shopping app with AR product preview, built with React Native and Stripe payments.",
        "tags": [{"value": "React Native"}, {"value": "Stripe"}, {"value": "Firebase"}],
        "featured": false
      }
    ]
  }
}

[experience]
{
  "type": "experience",
  "props": {
    "title": "Work Experience",
    "jobs": [
      {
        "company": "TechCorp Inc.",
        "role": "Senior Frontend Engineer",
        "startDate": "Jan 2022",
        "endDate": "Present",
        "location": "San Francisco, CA (Remote)",
        "description": "Lead frontend development for a B2B SaaS platform with 50k+ users.",
        "highlights": [
          {"value": "Reduced page load time by 60% through code splitting and lazy loading"},
          {"value": "Led migration from Vue 2 to React, mentored 4 junior developers"},
          {"value": "Shipped 12 major features in 18 months with zero critical bugs"}
        ]
      }
    ]
  }
}

[education]
{
  "type": "education",
  "props": {
    "title": "Education",
    "entries": [
      {
        "institution": "MIT",
        "degree": "B.S.",
        "field": "Computer Science",
        "startYear": "2014",
        "endYear": "2018",
        "gpa": "3.9",
        "description": "Focus on algorithms, distributed systems, and human-computer interaction."
      }
    ]
  }
}

[contact]
{
  "type": "contact",
  "props": {
    "title": "Let's Work Together",
    "subtitle": "I'm currently available for freelance projects and full-time roles.",
    "email": "alex@example.com",
    "showForm": true,
    "socials": [
      {"platform": "github", "url": "https://github.com/alex", "label": "GitHub"},
      {"platform": "linkedin", "url": "https://linkedin.com/in/alex", "label": "LinkedIn"},
      {"platform": "twitter", "url": "https://twitter.com/alex", "label": "Twitter"}
    ]
  }
}

[footer]
{
  "type": "footer",
  "props": {
    "copyright": "© 2025 Alex Johnson. All rights reserved.",
    "links": [{"label": "Privacy", "href": "/privacy"}, {"label": "Resume", "href": "/resume.pdf"}],
    "showSocials": true
  }
}

── COMPOSABLE BLOCKS (mix freely, nest inside containers) ────────────────

[section-wrapper] — isContainer. Wrap any blocks inside.
{
  "type": "section-wrapper",
  "props": {
    "label": "Services",
    "title": "What I Do",
    "subtitle": "Areas where I deliver exceptional results",
    "align": "center",
    "padding": "lg",
    "background": "alternate",
    "maxWidth": "xl",
    "showDivider": true
  },
  "children": [/* any blocks here */]
}
  background options: "default" | "alternate" | "dark" | "gradient" | "none"
  padding options: "sm" | "md" | "lg" | "xl"
  maxWidth options: "sm" | "md" | "lg" | "xl" | "full"

[stat] — Counter/metric block
{
  "type": "stat",
  "props": {
    "value": "6+",
    "label": "Years Experience",
    "icon": "🏆",
    "variant": "card",
    "accent": "emerald",
    "align": "center"
  }
}
  variant options: "default" | "card" | "bordered" | "minimal"
  accent options: "indigo" | "violet" | "emerald" | "amber" | "rose" | "sky"

[feature-card] — Icon + title + description
{
  "type": "feature-card",
  "props": {
    "icon": "⚡",
    "title": "Performance First",
    "description": "I obsess over Core Web Vitals. Every project ships with 90+ Lighthouse scores.",
    "variant": "gradient",
    "iconPosition": "top",
    "accent": "amber"
  }
}
  variant options: "default" | "glass" | "outlined" | "gradient" | "minimal"

[timeline-item] — Single experience/timeline entry
{
  "type": "timeline-item",
  "props": {
    "role": "Lead Developer",
    "company": "StartupXYZ",
    "startDate": "2021",
    "endDate": "2023",
    "location": "Remote",
    "description": "Led product development from MVP to Series A.",
    "highlights": [{"value": "Grew user base from 0 to 50k in 18 months"}, {"value": "Built and managed a team of 6 engineers"}],
    "variant": "card",
    "accent": "violet",
    "showDot": true
  }
}

── ATOMIC BLOCKS (basic building blocks) ─────────────────────────────────
  heading, text, button, badge, image, divider, spacer, container, columns (with _column children), card, row

═══════════════════════════════════════════════════
COMBINATION RULES — how to build creative layouts
═══════════════════════════════════════════════════

RULE 1 — Use section-wrapper to build custom sections:
  section-wrapper → columns → [feature-card, feature-card, feature-card]
  = A beautiful "What I Do" / services section

RULE 2 — Use section-wrapper + row → timeline-item for custom timelines:
  section-wrapper (background: "alternate") → row → [timeline-item × N]
  = A custom experience timeline (more flexible than the built-in "experience")

RULE 3 — Use section-wrapper + columns → stat for key metrics:
  section-wrapper → columns (4 cols) → [stat × 4]
  = A stats/numbers banner between sections

RULE 4 — Mix section templates + composable sections:
  Use [hero] + [about] as section templates for the main intro,
  then use [section-wrapper + feature-cards] for services,
  then [section-wrapper + timeline-items] for experience,
  then [projects] for the portfolio grid,
  then [contact] for the footer.

RULE 5 — Color variety: assign DIFFERENT colorSchemes to different sections for visual rhythm:
  hero: colorScheme "emerald", about: colorScheme "violet", skills: colorScheme "amber"
  = Sections feel distinct and vibrant, not monochrome.

═══════════════════════════════════════════════════
LAYOUT STYLES — match the user's persona
═══════════════════════════════════════════════════

STYLE A — Developer/Engineer (Standard):
  navbar → hero(fullscreen, indigo) → about(image-side, violet) → skills(progress/grid) → projects → experience → contact → footer

STYLE B — Designer/Creative (Projects First):
  navbar → hero(split, rose) → projects → section-wrapper[feature-cards] → about(centered, amber) → contact → footer

STYLE C — Consultant/Professional (Corporate):
  navbar → hero(minimal, slate) → about(stats, cyan) → section-wrapper[stats×4] → experience → skills(compact) → contact → footer

STYLE D — Minimalist/Writer:
  navbar → hero(centered-card, emerald) → about(minimal) → projects → contact → footer

STYLE E — Technical/Open-Source:
  navbar → hero(split, cyan) → skills(tags) → section-wrapper[feature-cards] → projects → section-wrapper[timeline-items] → contact → footer

STYLE F — Academic/Researcher:
  navbar → hero(minimal, violet) → about(centered) → education → experience → projects → contact → footer

═══════════════════════════════════════════════════
ANCHOR IDs — REQUIRED for smooth scroll navigation
═══════════════════════════════════════════════════

Every section MUST have a "name" field matching its content:
  navbar → name: "nav"
  hero → name: "home"
  about → name: "about"
  skills → name: "skills"
  projects → name: "projects"
  experience → name: "experience"
  education → name: "education"
  contact → name: "contact"
  footer → name: "footer"
  section-wrapper → name: use a descriptive slug, e.g. "services", "stats-banner", "custom-timeline"

Navbar links MUST use "#" + the section name of sections you include.

═══════════════════════════════════════════════════
CONTENT RULES — make it specific and realistic
═══════════════════════════════════════════════════

1. Use real-sounding names, companies, project names
2. highlights/tags MUST always be [{value: "..."}, ...] format — NEVER plain strings
3. Give hero a specific badge, compelling heading, and two CTAs
4. Skills: use 3-4 categories with 4-6 skills each, realistic levels (85-95 = senior, 65-80 = mid)
5. Projects: 3-5 items with descriptions mentioning real technologies
6. Use different colorSchemes for hero, about, and skills to create visual variety

═══════════════════════════════════════════════════
OUTPUT FORMAT — strict JSON only
═══════════════════════════════════════════════════

{
  "sections": [
    {
      "id": "section-1",
      "type": "<component type>",
      "name": "<anchor id>",
      "props": { ... },
      "children": []
    }
  ]
}

For containers (section-wrapper, row, columns, _column, card, container):
  "children" contains nested section objects with the same structure.
For non-containers: "children" must be [].
NEVER output markdown, explanation, or code blocks. ONLY the JSON object.
`;

const VALID_TYPES = [
  // Section templates
  'navbar', 'hero', 'about', 'skills', 'projects',
  'experience', 'education', 'contact', 'footer',
  // Composable blocks
  'section-wrapper', 'split', 'stat', 'feature-card', 'timeline-item',
  // Atomic blocks
  'heading', 'text', 'button', 'badge', 'image',
  'divider', 'spacer', 'container', 'columns', '_column', 'card', 'row',
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

      const fullPrompt = `${COMPONENT_CONTEXT}\n\nUser request: ${dto.prompt}\n\nAnalyze the user's request carefully. Choose the best LAYOUT STYLE for their role/persona. Generate a complete, unique, and content-rich portfolio page layout JSON. Make the content specific and relevant to their field:`;

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

      // Validate and filter sections — only allow registered types
      const validSections = (
        parsed.sections as Array<{
          id?: string;
          type?: string;
          name?: string;
          props?: Record<string, unknown>;
          children?: unknown[];
        }>
      )
        .filter((s) => {
          if (!s.type || !VALID_TYPES.includes(s.type)) {
            this.logger.warn(`Filtered unknown section type: "${s.type}"`);
            return false;
          }
          return true;
        })
        .map((s, i) => ({
          id: s.id ?? `section-ai-${i + 1}`,
          type: s.type,
          name: s.name ?? s.type ?? '',
          props: s.props ?? {},
          children: s.children ?? [],
        }));

      if (validSections.length === 0) {
        throw new BadRequestException(
          'AI generated no valid sections — please try a more specific prompt',
        );
      }

      this.logger.log(`[Gemini] ✅ Generated ${validSections.length} sections`);

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
