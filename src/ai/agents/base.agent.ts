import 'dotenv/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { createAgent } from 'langchain';

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
  async run(prompt: string, history: ChatMessage[] = []): Promise<any> {
    const agentInstance = createAgent({
      model: this.getModelInstance(),
      tools: this.tools,
      systemPrompt: this.systemPrompt,
    });

    return agentInstance.invoke({
      messages: [
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: prompt },
      ],
    });
  }

  /**
   * Stream agent theo từng token — yield raw LangChain streamEvents.
   * Events quan trọng:
   * - 'on_chat_model_stream' : chunk token từ LLM
   * - 'on_tool_start'        : tool bắt đầu (kèm input)
   * - 'on_tool_end'          : tool hoàn thành (kèm output)
   */
  async *streamRun(prompt: string, history: ChatMessage[] = []): AsyncGenerator<any> {
    const agentInstance = createAgent({
      model: this.getModelInstance(),
      tools: this.tools,
      systemPrompt: this.systemPrompt,
    });

    const input = {
      messages: [
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: prompt },
      ],
    };

    for await (const event of (agentInstance as any).streamEvents(input, { version: 'v2' })) {
      yield event;
    }
  }
}
