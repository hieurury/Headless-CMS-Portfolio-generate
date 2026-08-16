import { BaseAgent, ChatMessage } from '../base.agent';
import { copywriterSystemPrompt } from './system-prompt';
import { agentRegistry } from '../registry/agent.registry';
import { CopywriterOutputSchema } from './copywriter.schema';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

/**
 * ContentCopywriterAgent — Chuyên gia sáng tạo nội dung Portfolio.
 *
 * Nhiệm vụ: Nhận thông tin về nghề nghiệp/chuyên môn của user và
 * trả về nội dung văn bản chất lượng cao cho từng section portfolio.
 *
 * Output được validate bởi CopywriterOutputSchema (Zod) — Gemini sẽ
 * tự động retry nếu output không khớp schema. Mọi JSON sai format
 * sẽ bị reject hoàn toàn trước khi đến AiService.
 */
export class ContentCopywriterAgent extends BaseAgent {
  readonly name = 'copywriter';
  readonly role = 'Chuyên gia sáng tạo nội dung Portfolio';
  readonly description =
    'Viết nội dung văn bản chất lượng cao cho từng phần của portfolio: tiêu đề hấp dẫn, bio chuyên nghiệp, mô tả dự án, danh sách kỹ năng, CTA. Dùng khi user muốn cải thiện nội dung text, viết lại phần giới thiệu, hoặc tạo nội dung theo ngành nghề cụ thể.';
  readonly model =
    process.env.COPYWRITER_GEMINI_MODEL ||
    process.env.SUB_GEMINI_MODEL ||
    'gemini-2.0-flash';
  readonly systemPrompt = copywriterSystemPrompt;

  get tools(): any[] {
    return [];
  }

  /**
   * Override run() để dùng withStructuredOutput với CopywriterOutputSchema.
   * Đảm bảo AI luôn trả về đúng format — reject hoàn toàn JSON sai cấu trúc.
   */
  override async run(prompt: string, history: ChatMessage[] = []): Promise<any> {
    const model = this.getModelInstance().withStructuredOutput(
      CopywriterOutputSchema,
    );

    const messages = [
      new SystemMessage(this.systemPrompt),
      ...history.map((m) =>
        m.role === 'user'
          ? new HumanMessage(m.content)
          : new SystemMessage(m.content),
      ),
      new HumanMessage(prompt),
    ];

    const result = await model.invoke(messages);
    return result; // Already validated against CopywriterOutputSchema
  }
}

/** Singleton instance */
export const contentCopywriterAgent = new ContentCopywriterAgent();

/** Tự đăng ký vào AgentRegistry khi module được load */
agentRegistry.register(contentCopywriterAgent);
