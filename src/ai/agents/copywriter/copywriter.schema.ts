import { z } from 'zod';

/**
 * Zod schema cho Copywriter Agent output.
 *
 * Đây là single source of truth cho format JSON mà ContentCopywriterAgent
 * phải trả về. Dùng withStructuredOutput(CopywriterOutputSchema) để Gemini
 * tự động validate và reject JSON sai format.
 *
 * Schema này cũng được AiService dùng để validate kết quả trước khi
 * truyền sang LayoutArchitectAgent.
 */

const ProjectSchema = z.object({
  title: z.string().describe('Project title (3-8 words)'),
  description: z
    .string()
    .describe('What problem it solves and what tech was used (1-2 sentences)'),
  tags: z.array(z.string()).describe('Tech stack tags (2-5 items)'),
});

const SectionContentSchema = z.discriminatedUnion('section', [
  z.object({
    section: z.literal('hero'),
    heading: z.string().describe('Short, powerful headline (max 8 words)'),
    tagline: z.string().describe('One-line value proposition'),
    description: z
      .string()
      .describe('Brief intro paragraph (max 2-3 sentences)'),
  }),
  z.object({
    section: z.literal('about'),
    heading: z.string().describe('Section heading (max 6 words)'),
    bio: z
      .string()
      .describe(
        'Professional bio paragraph, specific and non-generic (max 3 sentences)',
      ),
  }),
  z.object({
    section: z.literal('skills'),
    heading: z.string().describe('Section heading'),
    skills: z
      .array(z.string())
      .min(4)
      .max(12)
      .describe('List of 4-12 relevant skills'),
  }),
  z.object({
    section: z.literal('projects'),
    heading: z.string().describe('Section heading'),
    projects: z
      .array(ProjectSchema)
      .min(1)
      .max(6)
      .describe('1-6 portfolio projects'),
  }),
  z.object({
    section: z.literal('contact'),
    heading: z.string().describe('Section heading'),
    cta: z.string().describe('Call-to-action text for contact button'),
  }),
  z.object({
    section: z.literal('experience'),
    heading: z.string().describe('Section heading'),
    items: z
      .array(
        z.object({
          role: z.string(),
          company: z.string(),
          period: z.string(),
          description: z.string().describe('Key achievements (1-2 sentences)'),
        }),
      )
      .min(1)
      .max(4),
  }),
  // Generic fallback for other section types
  z.object({
    section: z.string(),
    heading: z.string().optional(),
    content: z.string().optional(),
  }),
]);

export const CopywriterOutputSchema = z.object({
  sections: z
    .array(SectionContentSchema)
    .min(1)
    .describe(
      'Array of section content objects. Each object covers one portfolio section.',
    ),
});

export type CopywriterOutput = z.infer<typeof CopywriterOutputSchema>;
export type SectionContent = z.infer<typeof SectionContentSchema>;
