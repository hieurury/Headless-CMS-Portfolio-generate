import { BaseAgent } from '../base.agent';
import { layoutSystemPrompt } from './system-prompt';
import { agentRegistry } from '../registry/agent.registry';

/**
 * LayoutArchitectAgent — Chuyên gia thiết kế cấu trúc layout Portfolio.
 *
 * Nhiệm vụ: Nhận yêu cầu bố cục (tạo mới hoặc sửa đổi cục bộ) và trả về
 * một cây JSON hợp lệ gồm 12 loại block UI theo đúng quy tắc childRule.
 *
 * Không viết nội dung văn bản (đó là việc của CopywriterAgent).
 * Chỉ tập trung vào cấu trúc: container, columns, rows, flex và các atomic block.
 */
export class LayoutArchitectAgent extends BaseAgent {
  readonly name = 'layout_architect';
  readonly role = 'Chuyên gia thiết kế Layout Portfolio';
  readonly description =
    'Tạo hoặc chỉnh sửa cấu trúc cây JSON gồm 12 khối block UI (nav-bar-wrapper, container, columns, rows, flex, heading, description, button, link, icon, image, badge). Dùng khi cần tạo layout mới hoàn toàn hoặc sửa cấu trúc block (thêm/xoá section, đổi layout columns sang rows, v.v.)';
  readonly model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
  readonly systemPrompt = layoutSystemPrompt;

  get tools(): any[] {
    return []; // Không cần tool ngoài — chỉ dùng LLM thuần
  }
}

/** Singleton instance */
export const layoutArchitectAgent = new LayoutArchitectAgent();

/** Tự đăng ký vào AgentRegistry khi module được load */
agentRegistry.register(layoutArchitectAgent);
