import { BaseAgent } from '../base.agent';
import infomation from './infomation';

/**
 * SpiritAgent — Placeholder agent (chưa sử dụng trong Portfolio CMS).
 * Được giữ lại để không phá vỡ cấu trúc thư mục hiện có.
 * TODO: Có thể tái mục đích thành "Theme Stylist Agent" trong tương lai.
 */
export class SpiritAgent extends BaseAgent {
  readonly name = 'spirit';
  readonly role = 'Placeholder Agent';
  readonly description = 'Agent chưa được kích hoạt trong hệ thống Portfolio CMS.';
  readonly model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
  readonly systemPrompt = typeof infomation === 'string' ? infomation : '';

  get tools(): any[] {
    return [];
  }
}
