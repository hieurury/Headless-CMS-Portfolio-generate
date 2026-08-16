import {
  Injectable,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerateLayoutDto } from './dto/generate-layout.dto';
import { ToolRegistry } from './tool-registry.service';

// Agents
import { administratorAgent } from './agents/administrator/administrator.agent';
import { layoutArchitectAgent } from './agents/laygent/layout.agent';
import { contentCopywriterAgent } from './agents/copywriter/copywriter.agent';

// Shared block catalog (single source of truth)
import { BLOCK_DEFS, VALID_BLOCK_TYPES } from './blocks/block-defs';
import type { PropDef } from './blocks/block-defs';

// Copywriter schema for validation
import { CopywriterOutputSchema, CopywriterOutput } from './agents/copywriter/copywriter.schema';

// History service
import { AiHistoryService } from './ai-history.service';

// ─── Internal types ───────────────────────────────────────────────────────────

interface RawNode {
  id?: string;
  type?: string;
  name?: string;
  props?: Record<string, unknown>;
  children?: unknown[];
}

/** Route decision for fast mode */
type RouteKind = 'layout' | 'copy+layout' | 'modify';

/** Language tag detected from user prompt */
type Lang = 'vi' | 'en';

/** Structural diff between old and new top-level sections */
export interface LayoutDiff {
  /** IDs of sections that are new in the result */
  added: string[];
  /** IDs of sections that existed before and were kept/changed */
  modified: string[];
  /** Sections from the old layout that no longer exist */
  deleted: Array<{ id: string; type: string; label: string }>;
}

// ─── Normalizer helpers ───────────────────────────────────────────────────────

function genId(): string {
  return `block-ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Clamp a single prop value against its definition.
 * Returns undefined to signal "drop this prop" (no safe default exists).
 */
function clampPropValue(def: PropDef, value: unknown): unknown {
  if (def.kind === 'boolean') {
    if (typeof value === 'boolean') return value;
    return def.default;
  }
  if (def.options) {
    if (typeof value === 'string' && def.options.includes(value)) return value;
    return def.default ?? def.options[0];
  }
  // string / text / color / number / unconstrained
  if (value === undefined || value === null) return def.default;
  if (typeof value === 'string' || typeof value === 'number') return value;
  return def.default;
}

/**
 * Clean a node's props against its BlockDef — clamps known enum props,
 * leaves unknown extra keys untouched (harmless to renderer).
 */
function cleanProps(
  type: string,
  rawProps: Record<string, unknown>,
): Record<string, unknown> {
  const def = BLOCK_DEFS[type];
  const cleaned: Record<string, unknown> = { ...rawProps };
  if (!def) return cleaned;
  for (const [key, propDef] of Object.entries(def.props)) {
    if (key in cleaned) {
      const value = clampPropValue(propDef, cleaned[key]);
      if (value === undefined) {
        delete cleaned[key];
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

/** Minimal invisible spacer to pad out columns/rows that came back short */
function emptySpacer(): RawNode {
  return { id: genId(), type: 'container', name: '', props: {}, children: [] };
}

/**
 * Recursively normalize a raw AI node into a clean LayoutSection-compatible
 * object. Returns null if the block type is unrecognized.
 */
function normalizeNode(raw: unknown, logger: Logger): RawNode | null {
  const node = raw as RawNode;
  if (
    !node ||
    typeof node !== 'object' ||
    !node.type ||
    !VALID_BLOCK_TYPES.includes(node.type)
  ) {
    if (node?.type) logger.warn(`Filtered unknown block type: "${node.type}"`);
    return null;
  }

  const def = BLOCK_DEFS[node.type];
  const cleanedProps = cleanProps(node.type, node.props ?? {});

  let children: RawNode[] = Array.isArray(node.children)
    ? node.children
        .map((c) => normalizeNode(c, logger))
        .filter((c): c is RawNode => c !== null)
    : [];

  // Enforce child-count rules
  if (def.childRule === 'none') {
    children = [];
  } else if (def.childRule === 'single') {
    if (children.length > 1) {
      children = [
        {
          id: genId(),
          type: 'rows',
          name: '',
          props: { rows: String(children.length), gap: 'md' },
          children,
        },
      ];
    }
  } else if (def.childRule === 'columns') {
    const expected = Math.min(
      4,
      Math.max(2, parseInt(String(cleanedProps.columns ?? '2'), 10) || 2),
    );
    cleanedProps.columns = String(expected);
    if (children.length > expected) {
      logger.warn(`columns="${expected}" had ${children.length} children — trimming`);
      children = children.slice(0, expected);
    } else while (children.length < expected) children.push(emptySpacer());
  } else if (def.childRule === 'rows') {
    const expected = Math.min(
      4,
      Math.max(2, parseInt(String(cleanedProps.rows ?? '2'), 10) || 2),
    );
    cleanedProps.rows = String(expected);
    if (children.length > expected) {
      logger.warn(`rows="${expected}" had ${children.length} children — trimming`);
      children = children.slice(0, expected);
    } else while (children.length < expected) children.push(emptySpacer());
  }
  // 'any' (flex) — no enforcement needed

  return {
    id: node.id && typeof node.id === 'string' ? node.id : genId(),
    type: node.type,
    name: node.name ?? '',
    props: cleanedProps,
    children,
  };
}

// ─── Keywords for fast-mode classification ────────────────────────────────────

const COPY_KEYWORDS = [
  'viết lại', 'rewrite', 'bio', 'slogan', 'tagline', 'nội dung', 'content',
  'giới thiệu', 'mô tả', 'describe', 'description', 'introduction', 'headline',
  'copywriting', 'text only', 'chỉ nội dung', 'chỉ text',
];

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly registry: ToolRegistry,
    private readonly historyService: AiHistoryService,
  ) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured. Add it to your .env file.');
    }
    this.logger.log(
      `AI layout engine initialized — fast mode: direct agents | think mode: ${process.env.ADMIN_GEMINI_MODEL || process.env.GEMINI_MODEL || 'gemini-2.0-flash'} administrator`,
    );
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  async generateLayout(dto: GenerateLayoutDto): Promise<{
    layout: { sections: unknown[] };
    sectionsGenerated: number;
    markdownTree: string;
    mode: string;
    layoutDiff: LayoutDiff | null;
    summary: string;
  }> {
    const mode = dto.mode ?? 'fast';
    const lang = this.detectLang(dto.prompt);
    this.logger.log(`[${mode.toUpperCase()}] Generating layout for: "${dto.prompt}"`);

    try {
      let validSections = await this.routeRequest(dto, mode);

      // ── Self-repair retry (compact prompt, not full context) ────────────────
      if (validSections.length === 0) {
        this.logger.warn('First pass produced no valid blocks — retrying with compact repair prompt');
        validSections = await this.retryWithRepairPrompt(dto, mode);
      }

      if (validSections.length === 0) {
        throw new BadRequestException(
          lang === 'vi'
            ? 'AI chưa tạo được nội dung phù hợp. Bạn thử mô tả cụ thể hơn nhé.'
            : 'AI generated no valid blocks — please try a more specific prompt',
        );
      }

      this.logger.log(`Generated ${validSections.length} top-level blocks`);

      // Compute structural diff (only meaningful when editing existing layout)
      const oldSections = dto.currentLayout?.sections ?? [];
      const layoutDiff = oldSections.length > 0
        ? this.computeTopLevelDiff(oldSections, validSections)
        : null;

      // Record to session history
      this.historyService.record({
        portfolioId: dto.portfolioId,
        pageId: dto.pageId,
        prompt: dto.prompt,
        mode,
        sections: validSections,
        isModification: !!dto.currentLayout,
      });

      // Build markdown diff tree for the response so frontend can display it
      const markdownTree = this.historyService.renderDiffMarkdownTree(
        oldSections,
        validSections,
      );

      // Build friendly summary in user's language
      const summary = this.buildFriendlySummary(
        lang,
        validSections.length,
        layoutDiff,
        !!dto.currentLayout,
      );

      return {
        layout: { sections: validSections },
        sectionsGenerated: validSections.length,
        markdownTree,
        mode,
        layoutDiff,
        summary,
      };
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }

      this.logger.error('=== [AI ERROR DETAILS] ===');
      this.logger.error(`Status: ${error?.status || error?.statusCode}`);
      this.logger.error(`Message: ${error?.message}`);
      this.logger.error(
        `Response Data: ${JSON.stringify(error?.error || error?.response?.data || error?.response || {}, null, 2)}`,
      );
      this.logger.error(`Stack: ${error?.stack}`);
      this.logger.error('==========================');

      throw new BadRequestException(`AI generation failed: ${error?.message ?? 'Unknown error'}`);
    }
  }

  // ── Routing ─────────────────────────────────────────────────────────────────

  /**
   * Route the request to the appropriate agent(s) based on mode.
   * - fast: TypeScript keyword detection → direct agent call, 0 Admin LLM hops
   * - think: AdministratorAgent LLM decides which sub-agent(s) to call
   */
  private async routeRequest(dto: GenerateLayoutDto, mode: string): Promise<unknown[]> {
    if (mode === 'think') {
      return this.runThinkMode(dto);
    }
    return this.runFastMode(dto);
  }

  /** Fast mode: classify by keywords/context and call agent directly */
  private async runFastMode(dto: GenerateLayoutDto): Promise<unknown[]> {
    const kind = this.classifyRequest(dto);
    this.logger.log(`[FAST] Route: ${kind}`);

    if (kind === 'modify') {
      return this.callLayoutAgent(dto, true);
    }

    if (kind === 'copy+layout') {
      // Step 1: generate content with Copywriter
      const copyContent = await this.callCopywriter(dto);
      if (!copyContent) {
        this.logger.warn('[FAST] Copywriter failed — falling back to layout-only');
        return this.callLayoutAgent(dto, false);
      }
      // Step 2: pass enriched content to LayoutArchitect
      const enrichedDto: GenerateLayoutDto = {
        ...dto,
        prompt: this.buildEnrichedPrompt(dto.prompt, copyContent),
      };
      return this.callLayoutAgent(enrichedDto, false);
    }

    // Default: layout only
    return this.callLayoutAgent(dto, false);
  }

  /** Think mode: AdministratorAgent LLM routes to sub-agents */
  private async runThinkMode(dto: GenerateLayoutDto): Promise<unknown[]> {
    this.logger.log('[THINK] Calling AdministratorAgent');
    const prompt = this.buildLayoutPrompt(dto);
    return this.extractSectionsFromAdminResult(
      await administratorAgent.run(prompt, []),
      dto,
    );
  }

  /** Classify request type for fast-mode routing */
  private classifyRequest(dto: GenerateLayoutDto): RouteKind {
    if (dto.currentLayout) return 'modify';

    const lowerPrompt = dto.prompt.toLowerCase();
    const isCopyRequest = COPY_KEYWORDS.some((kw) => lowerPrompt.includes(kw));
    return isCopyRequest ? 'copy+layout' : 'layout';
  }

  // ── Agent calls ─────────────────────────────────────────────────────────────

  /** Call LayoutArchitectAgent with the appropriate prompt */
  private async callLayoutAgent(dto: GenerateLayoutDto, isModification: boolean): Promise<unknown[]> {
    const prompt = this.buildLayoutPrompt(dto);
    try {
      const result = await layoutArchitectAgent.run(prompt, []);
      return await this.normalizeSections(result, dto);
    } catch (err: any) {
      this.logger.error(`LayoutArchitectAgent error: ${err?.message}`);
      return [];
    }
  }

  /** Call ContentCopywriterAgent and validate output strictly */
  private async callCopywriter(dto: GenerateLayoutDto): Promise<CopywriterOutput | null> {
    try {
      const result = await contentCopywriterAgent.run(dto.prompt, []);
      // withStructuredOutput should have already validated, but double-check
      const parsed = CopywriterOutputSchema.safeParse(result);
      if (!parsed.success) {
        this.logger.warn(`Copywriter output failed schema validation: ${parsed.error.message}`);
        return null;
      }
      return parsed.data;
    } catch (err: any) {
      this.logger.error(`ContentCopywriterAgent error: ${err?.message}`);
      return null;
    }
  }

  // ── Prompt builders ─────────────────────────────────────────────────────────

  /**
   * Builds the full prompt for LayoutArchitectAgent.
   * Injects design system (if any) + modification context (if any) + user request.
   */
  private buildLayoutPrompt(dto: GenerateLayoutDto): string {
    const parts: string[] = [];

    // Inject session history context so AI knows what already exists
    const sessionCtx = this.historyService.getSessionContext(dto.portfolioId, dto.pageId);
    if (sessionCtx) {
      parts.push(
        `[SESSION HISTORY]\n${sessionCtx}\n` +
        `Use this context to avoid repeating the same structure or block types already applied in this session.`,
      );
    }

    // Inject design system if present
    const designSection = this.buildDesignSystemSection(dto);
    if (designSection) parts.push(designSection);

    // Inject modification context if present
    if (dto.currentLayout) {
      parts.push(this.buildModificationContext(dto));
    }

    // User request
    const isModification = !!dto.currentLayout;
    parts.push(
      `[USER REQUEST]\n${dto.prompt}\n\n` +
        (isModification
          ? 'Apply the SURGICAL modification described above. Copy all unchanged sections exactly as they appear in CURRENT LAYOUT.'
          : 'Be highly creative and avoid generic templates unless specifically requested. Generate a complete, unique, and content-rich portfolio page layout.') +
        ' Output ONLY valid JSON: { "sections": [ ... ] }',
    );

    if (dto.currentLayout) {
      parts.push(
        'Before finalizing your JSON, do a mental diff check:\n' +
          '- How many top-level sections does CURRENT LAYOUT have? → Your output must have the SAME count (unless user asked to add/remove).\n' +
          '- Which section did the user ask to modify? → Only that section\'s subtree should differ.\n' +
          '- Are all nav links from the original still present with the same href and label? → They must be.\n' +
          '- Does every columns/rows block still have a children count that exactly matches its columns/rows prop?',
      );
    }

    return parts.join('\n\n');
  }

  /** Builds the modification mode context block */
  private buildModificationContext(dto: GenerateLayoutDto): string {
    const map = this.buildCompactLayoutMap(
      (dto.currentLayout as { sections?: unknown[] })?.sections ?? [],
    );
    return (
      `═══════════════════════════════════════════════════\n` +
      `MODIFICATION MODE — READ ALL RULES BEFORE ACTING\n` +
      `═══════════════════════════════════════════════════\n\n` +
      `CURRENT LAYOUT NODE MAP (id + type only — use the "id" value to target nodes):\n` +
      `${map}\n\n` +
      `NOTE: The server holds the full layout data. You only need the node "id" when using the tool.\n\n` +
      `YOUR TASK:\n` +
      `The user wants a SURGICAL modification. You have TWO options to respond:\n\n` +
      `OPTION A — Use the "generate-layout" TOOL (preferred for precise, targeted changes):\n` +
      `  Call the tool with a "modifications" array. Each modification targets one node by its "id" field.\n` +
      `  Available modification types:\n` +
      `  - "ADD_CHILD"  → append newNode inside the target node's children list\n` +
      `  - "ADD_BEFORE" → insert newNode immediately before the target node (same level)\n` +
      `  - "ADD_AFTER"  → insert newNode immediately after the target node (same level)\n` +
      `  - "UPDATE"     → replace the entire target node with newNode\n` +
      `  - "DELETE"     → remove the target node from the tree\n` +
      `  You do NOT need to reproduce the full layout — the server injects currentlayout automatically.\n\n` +
      `OPTION B — Return the full updated layout as raw JSON { "sections": [...] }:\n` +
      `  Copy the CURRENT LAYOUT exactly, then apply your changes inline.\n` +
      `  Use this option when the change is so widespread that targeted patching requires more than 5 modifications.\n\n` +
      `REGARDLESS OF WHICH OPTION YOU CHOOSE:\n` +
      `- Change ONLY what the user asked — keep everything else IDENTICAL\n` +
      `- Do NOT add new sections unless the user explicitly says "add a new section for..."\n` +
      `- Do NOT remove sections unless the user explicitly says "remove..."\n` +
      `- Still obey every rule in BLOCK SYSTEM (valid types, exact child counts, no children on atoms)`
    );
  }

  /** Enriches the layout prompt with structured copywriter content */
  private buildEnrichedPrompt(originalPrompt: string, content: CopywriterOutput): string {
    const sections = content.sections
      .map((s) => {
        const lines = [`## ${s.section.toUpperCase()}`];
        for (const [k, v] of Object.entries(s)) {
          if (k === 'section') continue;
          if (Array.isArray(v)) {
            lines.push(`- ${k}: ${JSON.stringify(v)}`);
          } else {
            lines.push(`- ${k}: ${v}`);
          }
        }
        return lines.join('\n');
      })
      .join('\n\n');

    return (
      `${originalPrompt}\n\n` +
      `COPYWRITER CONTENT — Use these exact texts when placing heading, description, badge, and button blocks:\n\n` +
      `${sections}`
    );
  }

  // ── Compact retry prompt ────────────────────────────────────────────────────

  /**
   * Compact self-repair retry — sends only ~150 tokens instead of re-sending
   * the entire base prompt (~3000 tokens). Only includes the critical rules
   * and the original user request.
   */
  private async retryWithRepairPrompt(dto: GenerateLayoutDto, mode: string): Promise<unknown[]> {
    const validTypes = VALID_BLOCK_TYPES.join(', ');
    const repairPrompt =
      `[RETRY — Previous output was rejected: invalid block types or malformed JSON]\n\n` +
      `ONLY use these exact type values: ${validTypes}\n` +
      `Output strictly valid JSON: { "sections": [ ...blocks... ] }\n` +
      `Every node: { "type": "...", "props": {}, "children": [] } — atomic blocks must NOT have "children".\n\n` +
      `[ORIGINAL REQUEST]\n${dto.prompt}`;

    try {
      const result = await layoutArchitectAgent.run(repairPrompt, []);
      return await this.normalizeSections(result, dto);
    } catch (err: any) {
      this.logger.error(`Repair retry error: ${err?.message}`);
      return [];
    }
  }

  // ── Result normalization ────────────────────────────────────────────────────

  /** Normalize raw agent output (object or JSON string) into validated sections array */
  private async normalizeSections(result: unknown, dto: GenerateLayoutDto): Promise<unknown[]> {
    let parsedData: any;

    if (result && typeof result === 'object' && !Array.isArray(result)) {
      parsedData = result;
    } else if (typeof result === 'string') {
      const cleaned = (result as string)
        .replace(/^```json\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      try {
        parsedData = JSON.parse(cleaned);
      } catch {
        this.logger.warn('Agent returned invalid JSON: ' + cleaned.substring(0, 120));
        return [];
      }
    } else {
      this.logger.warn('Agent returned unrecognized format');
      return [];
    }

    // Branch 1: {modifications:[...]} → execute via generate-layout tool
    if (parsedData?.modifications && Array.isArray(parsedData.modifications)) {
      return await this.applyModificationsTool(parsedData.modifications, dto);
    }

    // Branch 2: {sections:[...]} → normalize directly
    if (!parsedData?.sections || !Array.isArray(parsedData.sections)) {
      this.logger.warn('Agent response missing a "sections" array');
      return [];
    }

    return parsedData.sections
      .map((s: unknown) => normalizeNode(s, this.logger))
      .filter((s): s is RawNode => s !== null);
  }

  /** Execute generate-layout tool modifications */
  private async applyModificationsTool(modifications: any[], dto: GenerateLayoutDto): Promise<unknown[]> {
    const tool = this.registry.get('generate-layout');
    if (!tool) {
      this.logger.warn('generate-layout tool not found in registry');
      return [];
    }
    this.logger.log(`[FAST] Executing "generate-layout" tool with ${modifications.length} modification(s)`);
    try {
      const toolArgs = {
        modifications,
        currentlayout: dto.currentLayout?.sections ?? [],
      };
      const resultStr = await tool.execute(toolArgs);
      const toolResult = JSON.parse(resultStr);
      if (Array.isArray(toolResult) && toolResult.length > 0) {
        return toolResult
          .map((s) => normalizeNode(s, this.logger))
          .filter((s): s is RawNode => s !== null);
      }
      return [];
    } catch (err: any) {
      this.logger.error(`[FAST] generate-layout tool execution error: ${err?.message}`);
      return [];
    }
  }

  /**
   * Extract sections from AdministratorAgent result (think mode).
   * Handles both {modifications:[...]} and {sections:[...]} formats.
   */
  private async extractSectionsFromAdminResult(result: any, dto: GenerateLayoutDto): Promise<unknown[]> {
    try {
      let text = '';
      if (typeof result === 'string') {
        text = result;
      } else if (result?.output && typeof result.output === 'string') {
        text = result.output;
      } else if (result?.messages && Array.isArray(result.messages)) {
        const lastMsg = result.messages[result.messages.length - 1];
        text =
          typeof lastMsg.content === 'string'
            ? lastMsg.content
            : JSON.stringify(lastMsg.content);
      } else if (result?.content) {
        text =
          typeof result.content === 'string'
            ? result.content
            : JSON.stringify(result.content);
      } else {
        text = JSON.stringify(result);
      }

      text = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      this.logger.log(`[THINK] Admin response (first 120 chars): ${text.substring(0, 120)}`);

      let parsedData: any;
      try {
        parsedData = JSON.parse(text);
      } catch {
        this.logger.warn('[THINK] Admin returned invalid JSON: ' + text.substring(0, 120));
        return [];
      }

      // Branch: modifications tool result
      if (parsedData?.modifications && Array.isArray(parsedData.modifications)) {
        const tool = this.registry.get('generate-layout');
        if (tool) {
          const toolArgs = {
            modifications: parsedData.modifications,
            currentlayout: dto.currentLayout?.sections ?? [],
          };
          this.logger.log(`[THINK] Executing "generate-layout" tool with ${parsedData.modifications.length} modification(s)`);
          const toolResultString = await tool.execute(toolArgs);
          const toolResult = JSON.parse(toolResultString);
          if (Array.isArray(toolResult) && toolResult.length > 0) {
            return toolResult
              .map((s) => normalizeNode(s, this.logger))
              .filter((s): s is RawNode => s !== null);
          }
        }
      }

      if (!parsedData?.sections || !Array.isArray(parsedData.sections)) {
        this.logger.warn('[THINK] Admin response missing a "sections" array');
        return [];
      }

      return parsedData.sections
        .map((s: unknown) => normalizeNode(s, this.logger))
        .filter((s): s is RawNode => s !== null);
    } catch (err: any) {
      this.logger.error(`[THINK] AdministratorAgent result extraction error: ${err?.message}`);
      return [];
    }
  }

  // ── Design system ───────────────────────────────────────────────────────────

  /** Builds a DESIGN SYSTEM section to inject into the AI prompt from page meta */
  private buildDesignSystemSection(dto: GenerateLayoutDto): string {
    const meta = dto.pageMeta;
    if (!meta) return '';

    const lines: string[] = [
      '═══════════════════════════════════════════════════',
      'DESIGN SYSTEM — APPLY THESE SETTINGS TO YOUR OUTPUT',
      '═══════════════════════════════════════════════════',
      '',
      'The portfolio owner has configured a custom design system. You MUST respect these settings:',
      '',
    ];

    if (meta.colors?.light) {
      const l = meta.colors.light;
      lines.push('COLOR PALETTE (Light Mode):');
      if (l.primary) lines.push(`  - Primary color: ${l.primary}`);
      if (l.secondary) lines.push(`  - Secondary color: ${l.secondary}`);
      if (l.accents?.length) lines.push(`  - Accent colors: ${l.accents.join(', ')}`);
      lines.push('');
    }
    if (meta.colors?.dark) {
      const d = meta.colors.dark;
      lines.push('COLOR PALETTE (Dark Mode):');
      if (d.primary) lines.push(`  - Primary color: ${d.primary}`);
      if (d.secondary) lines.push(`  - Secondary color: ${d.secondary}`);
      if (d.accents?.length) lines.push(`  - Accent colors: ${d.accents.join(', ')}`);
      lines.push('');
    }

    if (meta.fonts) {
      lines.push('TYPOGRAPHY:');
      if (meta.fonts.main) lines.push(`  - Main font family: ${meta.fonts.main}`);
      lines.push('');
    }

    if (meta.pageLayout) {
      lines.push('PAGE LAYOUT:');
      lines.push(`  - Layout type: ${meta.pageLayout.type}`);
      if (meta.pageLayout.type === 'custom' && meta.pageLayout.padding) {
        const p = meta.pageLayout.padding;
        lines.push(`  - Custom padding: top=${p.top}px, right=${p.right}px, bottom=${p.bottom}px, left=${p.left}px`);
      } else if (meta.pageLayout.type === 'fluid') {
        lines.push('  - Page content is constrained with horizontal side margins');
      } else {
        lines.push('  - Page content spans the full frame width');
      }
      lines.push('');
    }

    lines.push(
      'RULES FOR DESIGN SYSTEM:',
      '1. Use the primary color for main CTAs, hero backgrounds, accent elements, and highlighted text.',
      '2. Use the secondary color for secondary actions, gradients, and supporting elements.',
      '3. Use accent colors for tags, badges, icons, and decorative elements.',
      '4. When setting textColor or backgroundColor on blocks, prefer hex values from the palette above.',
      '5. Do NOT override user-specified colors — these are the brand guidelines.',
      '',
    );

    return lines.join('\n') + '\n';
  }

  // ── Layout map builder ──────────────────────────────────────────────────────

  /**
   * Builds a compact token-efficient representation of the layout tree
   * containing ONLY id, type, and name (no props, no rendered content).
   * Gives AI just enough to identify target nodes by id.
   */
  private buildCompactLayoutMap(nodes: unknown[], indent = 0): string {
    const pad = '  '.repeat(indent);
    return nodes
      .map((raw) => {
        const n = raw as {
          id?: string;
          type?: string;
          name?: string;
          props?: Record<string, unknown>;
          children?: unknown[];
        };
        const label = n.props?.text ?? n.props?.label ?? n.name ?? '';
        const preview = label ? ` "${String(label).slice(0, 40)}"` : '';
        const line = `${pad}- [${n.type ?? '?'}] id="${n.id ?? '?'}"${preview}`;
        if (n.children && n.children.length > 0) {
          return line + '\n' + this.buildCompactLayoutMap(n.children, indent + 1);
        }
        return line;
      })
      .join('\n');
  }

  // ── Language & diff helpers ──────────────────────────────────────────────────

  /**
   * Detect user language from prompt.
   * Checks for Vietnamese diacritical characters — if found, returns 'vi'.
   */
  private detectLang(prompt: string): Lang {
    // Vietnamese-specific diacritics not found in other latin scripts
    return /[àáâãèéêìíòóôõùúýăđơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỷỹỵ]/i.test(prompt)
      ? 'vi'
      : 'en';
  }

  /**
   * Compare top-level sections from old vs new layout by their IDs.
   * Returns which sections were added, kept/modified, or deleted.
   */
  private computeTopLevelDiff(
    oldSections: unknown[],
    newSections: unknown[],
  ): LayoutDiff {
    const toNode = (s: unknown) =>
      s as { id?: string; type?: string; name?: string; props?: Record<string, unknown> };

    const oldMap = new Map<string, ReturnType<typeof toNode>>();
    for (const s of oldSections) {
      const n = toNode(s);
      if (n.id) oldMap.set(n.id, n);
    }

    const newIds = new Set<string>();
    const added: string[] = [];
    const modified: string[] = [];

    for (const s of newSections) {
      const n = toNode(s);
      const id = n.id ?? '';
      newIds.add(id);
      if (oldMap.has(id)) {
        modified.push(id);
      } else {
        added.push(id);
      }
    }

    const deleted: LayoutDiff['deleted'] = [];
    for (const [id, n] of oldMap) {
      if (!newIds.has(id)) {
        const label = (n.props?.text ?? n.props?.label ?? n.name ?? '') as string;
        deleted.push({ id, type: n.type ?? '?', label: String(label).slice(0, 50) });
      }
    }

    return { added, modified, deleted };
  }

  /**
   * Build a human-friendly, non-technical summary of what the AI did.
   * No emojis, no technical jargon, language matches user's prompt.
   */
  private buildFriendlySummary(
    lang: Lang,
    sectionsCount: number,
    diff: LayoutDiff | null,
    isModification: boolean,
  ): string {
    if (lang === 'vi') {
      if (!isModification || !diff) {
        return `Trang của bạn vừa được tạo xong với ${sectionsCount} phần nội dung. Bạn có thể xem trước và tiếp tục chỉnh sửa bên dưới.`;
      }
      const parts: string[] = [];
      if (diff.added.length > 0) {
        parts.push(`thêm ${diff.added.length} phần mới`);
      }
      if (diff.modified.length > 0) {
        parts.push(`cập nhật ${diff.modified.length} phần hiện có`);
      }
      if (diff.deleted.length > 0) {
        parts.push(`xóa ${diff.deleted.length} phần`);
      }
      if (parts.length === 0) {
        return 'Trang đã được xử lý. Cấu trúc hiện tại không có thay đổi lớn.';
      }
      return `Đã ${parts.join(', ')} theo yêu cầu của bạn.`;
    } else {
      if (!isModification || !diff) {
        return `Your page has been created with ${sectionsCount} sections. You can preview and continue editing below.`;
      }
      const parts: string[] = [];
      if (diff.added.length > 0) parts.push(`added ${diff.added.length} new section${diff.added.length > 1 ? 's' : ''}`);
      if (diff.modified.length > 0) parts.push(`updated ${diff.modified.length} existing section${diff.modified.length > 1 ? 's' : ''}`);
      if (diff.deleted.length > 0) parts.push(`removed ${diff.deleted.length} section${diff.deleted.length > 1 ? 's' : ''}`);
      if (parts.length === 0) return 'Page processed. No major structural changes detected.';
      return `Done — ${parts.join(', ')} based on your request.`;
    }
  }
}
