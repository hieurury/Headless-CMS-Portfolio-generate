import 'dotenv/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type AgentSnapshot = {
  name: string;
  role: string;
  description: string;
  tools: string[];
};

/**
 * Abstract base class cho tất cả Sub-Agents trong hệ thống Portfolio AI.
 *
 * Mỗi agent con cần implement:
 * - `name`         — tên định danh (dùng trong AgentRegistry)
 * - `role`         — vai trò ngắn gọn
 * - `description`  — mô tả công việc (Administrator dùng để quyết định giao task)
 * - `systemPrompt` — toàn bộ hướng dẫn hành vi của agent
 * - `model`        — model ID Gemini VD: 'gemini-flash-latest'
 */
export abstract class BaseAgent {
  abstract readonly name: string;
  abstract readonly role: string;
  abstract readonly description: string;
  abstract readonly systemPrompt: string;
  abstract readonly model: string;

  /** Danh sách tools LangChain mà agent này sử dụng */
  abstract get tools(): any[];

  /** Khởi tạo ChatGoogleGenerativeAI model instance */
  getModelInstance(): ChatGoogleGenerativeAI {
    return new ChatGoogleGenerativeAI({
      model: this.model || process.env.SUB_GEMINI_MODEL || process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0.7,
    });
  }

  /**
   * Trả về snapshot ngắn gọn — Administrator dùng để chọn agent phù hợp
   * mà không cần đọc full systemPrompt.
   */
  snapshot(): AgentSnapshot {
    return {
      name: this.name,
      role: this.role,
      description: this.description,
      tools: this.tools.map((t: any) => t.name ?? 'unknown').filter((n) => n !== 'unknown'),
    };
  }

  /**
   * Chạy agent với prompt và lịch sử hội thoại (blocking).
   * @param prompt  Tin nhắn / nhiệm vụ hiện tại
   * @param history Lịch sử hội thoại đã được trim
   */
  /**
   * Chạy agent với prompt và lịch sử hội thoại (blocking).
   * Sub-class có thể override để dùng withStructuredOutput hoặc logic khác.
   */
  async run(prompt: string, history: ChatMessage[] = []): Promise<any> {
    // Sub-classes với tools hoặc structured output nên override phương thức này.
    // BaseAgent không có tools mặc định nên không cần createAgent wrapper.
    throw new Error(`Agent "${this.name}" chưa implement run() method.`);
  }
}
