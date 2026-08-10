import 'dotenv/config';
import { createAgent } from 'langchain';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { administratorSystemPrompt } from './system-prompt';
import { callAgentTool } from '../../tools/administrator/call-agent.tool';
import { listAgentsTool } from '../../tools/administrator/list-agents.tool';

// Đảm bảo các sub-agents được đăng ký vào registry trước khi Administrator khởi động
import '../../agents/laygent/layout.agent';
import '../../agents/copywriter/copywriter.agent';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

/**
 * AdministratorAgent — Bộ não điều phối hệ thống Portfolio AI.
 *
 * KHÔNG phải BaseAgent — là entity riêng biệt với vai trò đặc biệt.
 * Trang bị 2 tools: list_agents (xem danh sách) và call_agent (giao việc).
 * Singleton — dùng chung toàn app qua `administratorAgent` export.
 */
export class AdministratorAgent {
  readonly name = 'administrator';
  readonly model = process.env.ADMIN_GEMINI_MODEL || process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

  private getModelInstance(): ChatGoogleGenerativeAI {
    return new ChatGoogleGenerativeAI({
      model: process.env.ADMIN_GEMINI_MODEL || process.env.GEMINI_MODEL || this.model,
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0.3,
      json: true
    });
  }

  getTools() {
    return [listAgentsTool, callAgentTool];
  }

  /**
   * Chạy Administrator với prompt và lịch sử hội thoại (blocking).
   * Trả về object chứa `messages` array từ LangChain.
   */
  async run(prompt: string, history: ChatMessage[] = []): Promise<any> {
    const agentInstance = createAgent({
      model: this.getModelInstance(),
      tools: this.getTools(),
      systemPrompt: administratorSystemPrompt,
    });

    return agentInstance.invoke({
      messages: [
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: prompt },
      ],
    });
  }

  /**
   * Stream Administrator — yield raw LangChain events.
   * Service layer intercept 'on_tool_end' của call_agent để lấy kết quả.
   */
  async *streamRun(prompt: string, history: ChatMessage[] = []): AsyncGenerator<any> {
    const agentInstance = createAgent({
      model: this.getModelInstance(),
      tools: this.getTools(),
      systemPrompt: administratorSystemPrompt,
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

/** Singleton instance — dùng chung toàn app */
export const administratorAgent = new AdministratorAgent();
