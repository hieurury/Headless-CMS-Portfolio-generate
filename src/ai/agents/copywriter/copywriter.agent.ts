import { BaseAgent } from '../base.agent';
import { copywriterSystemPrompt } from './system-prompt';
import { agentRegistry } from '../registry/agent.registry';

/**
 * ContentCopywriterAgent — Chuyên gia sáng tạo nội dung Portfolio.
 *
 * Nhiệm vụ: Nhận thông tin về nghề nghiệp/chuyên môn của user và
 * trả về nội dung văn bản chất lượng cao cho từng section portfolio
 * (Hero tagline, Bio, Skills list, Project descriptions, CTA, v.v.)
 *
 * Không tạo cấu trúc JSON layout — đó là việc của LayoutArchitectAgent.
 */
export class ContentCopywriterAgent extends BaseAgent {
  readonly name = 'copywriter';
  readonly role = 'Chuyên gia sáng tạo nội dung Portfolio';
  readonly description =
    'Viết nội dung văn bản chất lượng cao cho từng phần của portfolio: tiêu đề hấp dẫn, bio chuyên nghiệp, mô tả dự án, danh sách kỹ năng, CTA. Dùng khi user muốn cải thiện nội dung text, viết lại phần giới thiệu, hoặc tạo nội dung theo ngành nghề cụ thể.';
  readonly model = 'gemini-3.5-flash';
  readonly systemPrompt = copywriterSystemPrompt;

  get tools(): any[] {
    return [];
  }
}

/** Singleton instance */
export const contentCopywriterAgent = new ContentCopywriterAgent();

/** Tự đăng ký vào AgentRegistry khi module được load */
agentRegistry.register(contentCopywriterAgent);
