import { Injectable } from '@nestjs/common';
import { LayoutSection } from 'src/pages/schemas/page.schema';
import { ITool, ToolJsonSchema } from '../interfaces/types';
import {
  AI_ACTION,
  LayoutModification,
  applyModifications,
} from '../utils/searchSection';

// Re-export AI_ACTION so ai.service.ts can still import it from here if needed
export { AI_ACTION } from '../utils/searchSection';

/**
 * Input shape that the AI must pass when calling this tool.
 */
export interface GenerateLayoutToolInput {
  /**
   * The full current layout sections array (injected by AiService before
   * calling execute — AI does NOT need to pass this; it will be populated
   * server-side from dto.currentLayout.sections).
   */
  currentlayout?: LayoutSection[];

  /**
   * Ordered list of modifications to apply.
   * The AI must produce one entry per change it wants to make.
   */
  modifications: LayoutModification[];
}

@Injectable()
export class GenerateLayoutTool implements ITool<
  GenerateLayoutToolInput,
  string
> {
  readonly name = 'generate-layout';
  readonly description =
    'Apply a list of ADD/UPDATE/DELETE modifications to the current page layout. ' +
    'Use this when the user wants to add, edit, or remove one or more sections/blocks. ' +
    'Each modification targets one node by its id.';

  readonly inputSchema: ToolJsonSchema = {
    type: 'object',
    properties: {
      modifications: {
        type: 'array',
        description:
          'Ordered list of layout modifications to apply. ' +
          'Applied in sequence — each step acts on the result of the previous one.',
        items: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: [
                AI_ACTION.ADD_CHILD,
                AI_ACTION.ADD_BEFORE,
                AI_ACTION.ADD_AFTER,
                AI_ACTION.UPDATE,
                AI_ACTION.DELETE,
              ],
              description:
                'ADD_CHILD: append newNode inside target node children. ' +
                'ADD_BEFORE: insert newNode before the target node (same level). ' +
                'ADD_AFTER: insert newNode after the target node (same level). ' +
                'UPDATE: replace the entire target node with newNode. ' +
                'DELETE: remove the target node from the tree.',
            },
            targetId: {
              type: 'string',
              description: 'The "id" field of the node to target.',
            },
            newNode: {
              type: 'object',
              description:
                'Required for ADD_CHILD, ADD_BEFORE, ADD_AFTER, UPDATE. ' +
                'Must be a valid layout block following the BLOCK SYSTEM rules (type, props, children).',
            },
          },
          required: ['type', 'targetId'],
        },
        minItems: 1,
      },
    },
    required: ['modifications'],
  };

  execute(input: GenerateLayoutToolInput): Promise<string> {
    const currentSections = input.currentlayout ?? [];
    const modifications = input.modifications ?? [];

    const updatedSections = applyModifications(currentSections, modifications);
    return Promise.resolve(JSON.stringify(updatedSections));
  }
}
