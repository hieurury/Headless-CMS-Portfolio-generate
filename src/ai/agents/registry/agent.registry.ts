import { BaseAgent, AgentSnapshot } from '../base.agent';

/**
 * AgentRegistry — Map quản lý tất cả sub-agents trong hệ thống Portfolio AI.
 *
 * Cách đăng ký: Mỗi agent tự đăng ký vào registry khi module được load.
 * Administrator sẽ dùng registry này để biết ai có thể làm gì.
 */
export class AgentRegistry {
  private readonly agents = new Map<string, BaseAgent>();

  register(agent: BaseAgent): void {
    this.agents.set(agent.name, agent);
  }

  get(name: string): BaseAgent | undefined {
    return this.agents.get(name);
  }

  has(name: string): boolean {
    return this.agents.has(name);
  }

  /** Trả về tất cả sub-agents dưới dạng snapshot (không lộ systemPrompt) */
  listSnapshots(): AgentSnapshot[] {
    return Array.from(this.agents.values()).map((a) => a.snapshot());
  }
}

/** Singleton registry — dùng chung toàn app */
export const agentRegistry = new AgentRegistry();
