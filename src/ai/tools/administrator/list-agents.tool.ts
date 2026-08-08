import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { agentRegistry } from '../../agents/registry/agent.registry';

/**
 * list_agents — Tool cho phép Administrator xem toàn bộ sub-agents
 * và năng lực của từng người trước khi quyết định giao việc.
 */
export const listAgentsTool = tool(
  async () => {
    const snapshots = agentRegistry.listSnapshots();

    if (snapshots.length === 0) {
      return JSON.stringify({ message: 'Không có sub-agent nào được đăng ký.' });
    }

    return JSON.stringify({ agents: snapshots }, null, 2);
  },
  {
    name: 'list_agents',
    description:
      'Xem danh sách tất cả sub-agents trong hệ thống cùng vai trò, mô tả và tools của mỗi agent. Dùng trước khi gọi call_agent.',
    schema: z.object({}),
  },
);
