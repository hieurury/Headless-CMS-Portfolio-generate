import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiHistoryService } from './ai-history.service';
import { GenerateLayoutTool } from './tools/generate-layout.tool';
import { TOOL_LIST, ToolRegistry } from './tool-registry.service';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    AiHistoryService,
    GenerateLayoutTool,
    {
      provide: TOOL_LIST,
      useFactory: (generateLayout: GenerateLayoutTool) => {
        return [generateLayout];
      },
      inject: [GenerateLayoutTool],
    },
    ToolRegistry,
  ],
  exports: [AiService, AiHistoryService],
})
export class AiModule {}
