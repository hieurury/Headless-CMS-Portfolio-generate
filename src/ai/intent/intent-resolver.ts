import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { z } from 'zod';
import { blueprintRegistry } from '../blueprints';

// ─── Output Schema ────────────────────────────────────────────────────────────

const IntentResultSchema = z.object({
  requestType: z.enum(['create', 'modify', 'copy-only']).describe(
    'create: tạo layout mới | modify: chỉnh sửa layout hiện có | copy-only: chỉ viết nội dung text'
  ),
  userProfession: z.string().describe(
    'Nghề nghiệp/lĩnh vực của chủ nhân trang web. VD: "chef", "developer", "designer", "photographer", "musician", "consultant", "unknown"'
  ),
  targetSectionIds: z.array(z.string()).describe(
    'Danh sách section IDs cần tạo hoặc chỉnh sửa. Chỉ dùng IDs từ danh sách hợp lệ.'
  ),
  changeType: z.enum([
    'text-only',
    'style-adjust',
    'single-section',
    'multi-section',
    'full-redesign',
  ]).describe(
    'text-only: chỉ text content thay đổi | style-adjust: màu/size/props | single-section: cấu trúc 1 section | multi-section: nhiều sections | full-redesign: toàn bộ layout'
  ),
  modificationTarget: z.string().describe(
    'Mô tả ngắn gọn đích nhắm của sửa đổi. VD: "intro section heading text", "skills section layout", "add portfolio section". Empty string nếu requestType là create.'
  ),
  toneStyle: z.enum(['professional', 'creative', 'minimal', 'bold', 'warm', 'auto']).describe(
    'professional: nghiêm túc, corporate | creative: sáng tạo, nghệ thuật | minimal: đơn giản, clean | bold: mạnh mẽ, nổi bật | warm: thân thiện, gần gũi | auto: agent tự quyết định'
  ),
  language: z.enum(['vi', 'en', 'mixed']).describe(
    'Ngôn ngữ output content. vi: Tiếng Việt | en: English | mixed: tự động'
  ),
});

export type IntentResult = z.infer<typeof IntentResultSchema>;

// ─── System Prompt ─────────────────────────────────────────────────────────────

function buildIntentSystemPrompt(validSectionIds: string[]): string {
  return `You are an intent analyzer for a portfolio website builder.
Your job is to understand what the user wants — even if they use everyday language without technical terms.

VALID SECTION IDs (only use these in targetSectionIds):
${validSectionIds.join(', ')}

SECTION ALIASES REFERENCE (for mapping user words to section IDs):
- nav: menu, navigation, navbar, thanh điều hướng, header
- intro: giới thiệu, bản thân, hero, about me, landing, chân dung, về tôi, tôi là ai
- portfolio: dự án, công việc, work, projects, showcase, tác phẩm, thành phẩm, món ăn (for chef), case study
- skills: kỹ năng, thế mạnh, tech stack, tools, chuyên môn, tôi giỏi gì, expertise
- experience: kinh nghiệm, lịch sử làm việc, timeline, sự nghiệp, đã làm ở đâu
- services: dịch vụ, tôi làm được gì, what i offer, tôi nhận làm, hire me, bảng giá, pricing
- contact: liên hệ, kết nối, email, nhắn tin, thuê tôi, reach me
- testimonials: đánh giá, nhận xét, review, feedback, khách hàng nói gì, social proof
- faq: câu hỏi thường gặp, hỏi đáp, q&a, thắc mắc, frequently asked questions, mọi người hay hỏi
- gallery: bộ ảnh, album ảnh, triển lãm ảnh, ảnh chụp, photo gallery, lookbook, ảnh tác phẩm, visual showcase

RULES:
1. Always include "nav" in targetSectionIds when requestType is "create"
2. Always include "contact" in targetSectionIds when requestType is "create" (unless user explicitly doesn't want it)
3. If user says "đầu bếp/chef" → include services and portfolio (or gallery if they want to show food photos)
4. If user says "photographer/nhiếp ảnh" → include gallery (primary) and portfolio, NOT both
5. If user says a profession → infer typical sections for that profession
6. If requestType is "modify" and user mentions a specific part → only include that section in targetSectionIds
7. Detect language from user's prompt for the language field
8. toneStyle "warm" for service professions (chef, therapist, teacher), "creative" for artists/photographers, "professional" for corporate, "auto" when unclear
9. Use "gallery" (visual-only) when user wants to showcase photos/images as art; use "portfolio" when they want project context + descriptions
10. Add "faq" when user mentions they get many questions OR profession commonly needs FAQ (freelancer, consultant, service provider)

OUTPUT: Structured JSON matching the schema exactly.`;
}

// ─── IntentResolver ───────────────────────────────────────────────────────────

/**
 * IntentResolver — Phân tích prompt người dùng (kể cả ngôn ngữ thường ngày)
 * để xác định intent, sections cần tạo/sửa, tone style, và thông tin context.
 *
 * Dùng model nhỏ nhất (flash-lite) vì task đơn giản, cần nhanh.
 * Cache theo prompt hash để tránh duplicate LLM calls.
 */
export class IntentResolver {
  private readonly model: ChatGoogleGenerativeAI;
  private readonly cache = new Map<string, IntentResult>();
  private readonly CACHE_MAX = 200;

  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      model: process.env.INTENT_GEMINI_MODEL || 'gemini-2.0-flash-lite',
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0.1, // Low temperature — deterministic classification
    });
  }

  /**
   * Phân tích prompt và trả về IntentResult.
   * Cache theo key tạo từ prompt + hasCurrentLayout.
   */
  async resolve(prompt: string, currentLayout?: unknown): Promise<IntentResult> {
    const cacheKey = this.buildCacheKey(prompt, !!currentLayout);

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const result = await this.callLLM(prompt, !!currentLayout);
    this.setCache(cacheKey, result);
    return result;
  }

  private async callLLM(prompt: string, hasCurrentLayout: boolean): Promise<IntentResult> {
    try {
      const validIds = blueprintRegistry.getValidIds();
      const systemPrompt = buildIntentSystemPrompt(validIds);

      const structuredModel = this.model.withStructuredOutput(IntentResultSchema);

      const userMessage = hasCurrentLayout
        ? `[User has an existing layout they want to modify]\nUser prompt: "${prompt}"`
        : `[User wants to create a new portfolio page]\nUser prompt: "${prompt}"`;

      const result = await structuredModel.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ]);

      // Ensure nav and contact are always included for create
      if (result.requestType === 'create') {
        if (!result.targetSectionIds.includes('nav')) {
          result.targetSectionIds.unshift('nav');
        }
        if (!result.targetSectionIds.includes('contact')) {
          result.targetSectionIds.push('contact');
        }
      }

      // Filter to only valid section IDs
      result.targetSectionIds = result.targetSectionIds.filter((id) =>
        blueprintRegistry.getValidIds().includes(id)
      );

      return result;
    } catch {
      // Fallback: return safe defaults
      return this.buildFallbackIntent(prompt, hasCurrentLayout);
    }
  }

  /** Fallback khi LLM call thất bại — dùng keyword detection đơn giản */
  private buildFallbackIntent(prompt: string, hasCurrentLayout: boolean): IntentResult {
    const lower = prompt.toLowerCase();

    const requestType = hasCurrentLayout ? 'modify' : 'create';
    const isVietnamese = /[àáâãèéêìíòóôõùúýăđơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỷỹỵ]/i.test(prompt);

    // Simple section detection
    const sectionIds: string[] = ['nav', 'intro'];
    if (/project|portfolio|work|dự án|tác phẩm/.test(lower)) sectionIds.push('portfolio');
    if (/skill|tech|stack|kỹ năng/.test(lower)) sectionIds.push('skills');
    if (/experience|kinh nghiệm|timeline/.test(lower)) sectionIds.push('experience');
    if (/service|dịch vụ/.test(lower)) sectionIds.push('services');
    if (/testimonial|review|đánh giá|nhận xét/.test(lower)) sectionIds.push('testimonials');
    if (/faq|câu hỏi|hỏi đáp|q&a|thắc mắc/.test(lower)) sectionIds.push('faq');
    if (/gallery|bộ ảnh|album ảnh|photo gallery|ảnh chụp/.test(lower)) sectionIds.push('gallery');
    if (!sectionIds.includes('contact')) sectionIds.push('contact');

    return {
      requestType,
      userProfession: 'unknown',
      targetSectionIds: sectionIds,
      changeType: hasCurrentLayout ? 'single-section' : 'multi-section',
      modificationTarget: '',
      toneStyle: 'auto',
      language: isVietnamese ? 'vi' : 'en',
    };
  }

  private buildCacheKey(prompt: string, hasCurrentLayout: boolean): string {
    // Use first 120 chars, lowercased + trim, plus layout flag
    return `${prompt.substring(0, 120).toLowerCase().trim()}|${hasCurrentLayout}`;
  }

  private setCache(key: string, value: IntentResult): void {
    // Evict oldest entry if cache is full
    if (this.cache.size >= this.CACHE_MAX) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}

/** Singleton instance */
export const intentResolver = new IntentResolver();
