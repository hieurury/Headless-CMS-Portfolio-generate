import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { agentRegistry } from '../../agents/registry/agent.registry';

/**
 * call_agent — Tool để Administrator giao nhiệm vụ cho một Sub-Agent cụ thể.
 *
 * Workflow:
 * 1. Administrator nhận yêu cầu user
 * 2. Administrator quyết định agent nào phù hợp (từ list_agents snapshot)
 * 3. Administrator gọi call_agent với agentName + task
 * 4. Sub-Agent chạy và trả về kết quả JSON
 * 5. Administrator nhận kết quả và kết thúc
 */
export const callAgentTool = tool(
  async ({ agentName, task, context }) => {
    if (!agentRegistry.has(agentName)) {
      return JSON.stringify({
        error: `Agent "${agentName}" không tồn tại trong registry. Dùng list_agents để xem danh sách.`,
      });
    }

    const agent = agentRegistry.get(agentName)!;

    // Ghép context vào task nếu có
    const fullPrompt = context
      ? `${task}\n\n[Ngữ cảnh bổ sung: ${context}]`
      : task;

    try {
      const result = await agent.run(fullPrompt, []);

      // Lấy nội dung text từ message cuối cùng
      const lastMsg = result.messages
        ? result.messages[result.messages.length - 1]
        : result;

      const textContent =
        typeof lastMsg.content === 'string'
          ? lastMsg.content
          : JSON.stringify(lastMsg.content);

      return textContent;
    } catch (err: any) {
      return JSON.stringify({ error: `Agent "${agentName}" gặp lỗi: ${err?.message}` });
    }
  },
  {
    name: 'call_agent',
    description:
      'Giao nhiệm vụ cho một sub-agent chuyên biệt và nhận kết quả. Dùng list_agents trước để biết agent nào phù hợp.',
    schema: z.object({
      agentName: z
        .string()
        .describe('Tên định danh của agent (VD: "layout_architect", "copywriter")'),
      task: z
        .string()
        .describe('Nhiệm vụ cụ thể cần giao cho agent. Giữ ĐÚNG ý của user, không chế lại.'),
      context: z
        .string()
        .optional()
        .describe('Ngữ cảnh bổ sung từ Administrator (VD: kết quả agent khác, tông màu cụ thể...)'),
    }),
  },
);
