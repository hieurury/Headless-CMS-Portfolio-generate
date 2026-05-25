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
You are a portfolio website layout generator. You must output ONLY a valid JSON layout object.

Available component types and their props:

1. "navbar" — Navigation bar
   Props: logo (string), links (array of {label, href}), ctaLabel (string), ctaHref (string), sticky (boolean)

2. "hero" — Full-width hero section
   Props: heading (string), subheading (string), ctaLabel (string), ctaHref (string), secondaryCtaLabel (string), secondaryCtaHref (string), alignment ("left"|"center"|"right")

3. "about" — About/bio section
   Props: title (string), bio (string), profileImage (string URL), highlights (string[]), imagePosition ("left"|"right")

4. "skills" — Skills grid
   Props: title (string), subtitle (string), categories (array of {name: string, skills: array of {name: string, level: 0-100}})

5. "projects" — Project cards grid
   Props: title (string), subtitle (string), columns (2|3|4), projects (array of {name, description, tags: string[], demoUrl, githubUrl, featured: boolean})

6. "experience" — Work experience timeline
   Props: title (string), jobs (array of {company, role, startDate, endDate, description, highlights: string[], location})

7. "education" — Education section
   Props: title (string), entries (array of {institution, degree, field, startYear, endYear, gpa, description})

8. "contact" — Contact section
   Props: title (string), subtitle (string), email (string), showForm (boolean), socials (array of {platform: "github"|"linkedin"|"twitter"|"instagram"|"website", url, label})

9. "footer" — Page footer
   Props: copyright (string), links (array of {label, href}), showSocials (boolean)

RULES:
- Every section MUST have: id (unique string like "section-1"), type (one of the 9 types above), props (object), children (empty array [])
- Only use the 9 types listed above. Do NOT invent new types.
- Return ONLY valid JSON. No markdown, no explanation, no code blocks.
- The root object must be: { "sections": [...] }
`;

const VALID_TYPES = [
  'navbar', 'hero', 'about', 'skills', 'projects',
  'experience', 'education', 'contact', 'footer',
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
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      });

      const fullPrompt = `${COMPONENT_CONTEXT}\n\nUser request: ${dto.prompt}\n\nGenerate a complete portfolio page layout JSON:`;

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
