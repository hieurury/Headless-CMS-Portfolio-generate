import { Inject, Injectable, OnModuleInit, Logger } from "@nestjs/common";
import type OpenAI from "openai";
import { ITool } from "./interfaces/types";
export const TOOL_LIST = Symbol("TOOL_LIST");
@Injectable()
export class ToolRegistry implements OnModuleInit {
    private readonly logger = new Logger(ToolRegistry.name);
    private readonly toolMap = new Map<string, ITool>();

    constructor(@Inject(TOOL_LIST) private readonly tools: ITool[]) { }

    onModuleInit() {
        for (const tool of this.tools) {
            if (this.toolMap.has(tool.name)) {
                throw new Error(`Tool "${tool.name}" đã được đăng ký trước đó.`);
            }
            this.toolMap.set(tool.name, tool);
        }
        this.logger.log(
            `Đã đăng ký ${this.toolMap.size} tool: ${[...this.toolMap.keys()].join(", ")}`
        );
    }

    get(name: string): ITool | undefined {
        return this.toolMap.get(name);
    }

    toOpenAiTools(): OpenAI.Chat.Completions.ChatCompletionTool[] {
        return [...this.toolMap.values()].map((tool) => ({
            type: "function",
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.inputSchema,
            },
        }));
    }
}
