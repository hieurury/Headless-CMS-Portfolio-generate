import { Injectable, Logger } from '@nestjs/common';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawNode {
  id?: string;
  type?: string;
  name?: string;
  props?: Record<string, unknown>;
  children?: unknown[];
}

export interface AiHistoryEntry {
  id: string;
  timestamp: string;
  portfolioId: string;
  pageId?: string;
  prompt: string;
  mode: string;
  isModification: boolean;
  sectionsCount: number;
  markdownTree: string;
}

export interface RecordOptions {
  portfolioId: string;
  pageId?: string;
  prompt: string;
  mode: string;
  sections: unknown[];
  isModification: boolean;
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * AiHistoryService — Lưu lịch sử thay đổi layout trong phiên hiện tại (in-memory).
 *
 * Mục đích kép:
 *  1. Cho user xem lịch sử thay đổi cấu trúc trong phiên chỉnh sửa hiện tại.
 *  2. Cung cấp context cho agent về những gì đã có trong cấu trúc rồi.
 *
 * Lifetime: In-memory only. Cleared khi server restart (kết thúc phiên).
 * Không cần persist sang file/DB — user chủ động clear bằng cách thoát phiên.
 */
@Injectable()
export class AiHistoryService {
  private readonly logger = new Logger(AiHistoryService.name);

  /** Key: `${portfolioId}:${pageId ?? '__no_page__'}` → chronological entries */
  private readonly store = new Map<string, AiHistoryEntry[]>();

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Record a new history entry after a successful generation/modification.
   */
  record(options: RecordOptions): void {
    const key = this.makeKey(options.portfolioId, options.pageId);
    if (!this.store.has(key)) this.store.set(key, []);

    const entry: AiHistoryEntry = {
      id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      portfolioId: options.portfolioId,
      pageId: options.pageId,
      prompt: options.prompt,
      mode: options.mode,
      isModification: options.isModification,
      sectionsCount: options.sections.length,
      markdownTree: this.renderDiffMarkdownTree([], options.sections),
    };

    this.store.get(key)!.push(entry);
    this.logger.log(`History recorded [${key}] — entry #${this.store.get(key)!.length}`);
  }

  /**
   * Get all history entries for a portfolio (and optionally a specific page).
   * Returns entries in chronological order (oldest first).
   */
  getHistory(portfolioId: string, pageId?: string): AiHistoryEntry[] {
    const key = this.makeKey(portfolioId, pageId);
    return this.store.get(key) ?? [];
  }

  /**
   * Get a formatted markdown summary of all changes in a session.
   * This is the primary view exposed to the user.
   */
  getMarkdownSummary(portfolioId: string, pageId?: string): string {
    const entries = this.getHistory(portfolioId, pageId);
    if (entries.length === 0) {
      return '# AI Change History\n\n_No changes recorded in this session._\n';
    }

    const lines: string[] = [
      '# AI Change History',
      `> Portfolio: \`${portfolioId}\`${pageId ? ` | Page: \`${pageId}\`` : ''}`,
      `> Session entries: ${entries.length}`,
      '',
    ];

    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const action = e.isModification ? '✏️ Modification' : '✨ New Layout';
      lines.push(`## ${i + 1}. ${action} — ${this.formatTime(e.timestamp)}`);
      lines.push(`**Mode**: \`${e.mode}\` | **Blocks**: ${e.sectionsCount} top-level sections`);
      lines.push('');
      lines.push(`**Prompt**: _"${e.prompt}"_`);
      lines.push('');
      lines.push('### Layout Tree');
      lines.push('```');
      lines.push(e.markdownTree);
      lines.push('```');
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Clear history for a specific portfolio/page (e.g. on session end).
   */
  clear(portfolioId: string, pageId?: string): void {
    const key = this.makeKey(portfolioId, pageId);
    this.store.delete(key);
    this.logger.log(`History cleared [${key}]`);
  }

  /**
   * Get latest session context for agent injection.
   * Returns a compact summary of what blocks already exist.
   */
  getSessionContext(portfolioId: string, pageId?: string): string | null {
    const entries = this.getHistory(portfolioId, pageId);
    if (entries.length === 0) return null;

    const latest = entries[entries.length - 1];
    return (
      `[SESSION CONTEXT — ${entries.length} previous generation(s) in this session]\n` +
      `Last change: "${latest.prompt}" (${latest.isModification ? 'modification' : 'new layout'})\n` +
      `Current structure has ${latest.sectionsCount} top-level sections.\n`
    );
  }

  // ── Markdown tree renderer ──────────────────────────────────────────────────

  /**
   * Render a diffed layout sections array as a markdown tree.
   * Shows type, id, status, and key props (text/label/name) for each node.
   * Includes deleted nodes inline.
   */
  renderDiffMarkdownTree(oldSections: unknown[], newSections: unknown[], indent = 0): string {
    const pad = '  '.repeat(indent);
    const lines: string[] = [];
    const toNode = (s: unknown) => s as RawNode;

    const oldMap = new Map<string, RawNode>();
    for (const s of oldSections) {
      const n = toNode(s);
      if (n && n.id) oldMap.set(n.id, n);
    }

    const newIds = new Set<string>();

    for (const raw of newSections) {
      const n = toNode(raw);
      if (!n || typeof n !== 'object') continue;

      const type = n.type ?? '?';
      const idStr = n.id ? ` (${n.id})` : '';
      const label = this.extractLabel(n);
      const labelStr = label ? ` — "${label}"` : '';
      newIds.add(n.id ?? '');

      let status = '';
      const oldNode = oldMap.get(n.id ?? '');
      if (!oldNode) {
        status = ' {added}';
      } else {
        const isModified = JSON.stringify(oldNode) !== JSON.stringify(n);
        status = isModified ? ' {modified}' : ' {none}';
      }

      lines.push(`${pad}- [${type}]${idStr}${status}${labelStr}`);

      const oldChildren = oldNode?.children && Array.isArray(oldNode.children) ? oldNode.children : [];
      const newChildren = n.children && Array.isArray(n.children) ? n.children : [];

      if (oldChildren.length > 0 || newChildren.length > 0) {
        lines.push(this.renderDiffMarkdownTree(oldChildren, newChildren, indent + 1));
      }
    }

    // Add deleted nodes
    for (const raw of oldSections) {
      const n = toNode(raw);
      if (n && n.id && !newIds.has(n.id)) {
        const type = n.type ?? '?';
        const idStr = ` (${n.id})`;
        const label = this.extractLabel(n);
        const labelStr = label ? ` — "${label}"` : '';
        lines.push(`${pad}- [${type}]${idStr} {deleted}${labelStr}`);
      }
    }

    return lines.filter(Boolean).join('\n');
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private makeKey(portfolioId: string, pageId?: string): string {
    return `${portfolioId}:${pageId ?? '__no_page__'}`;
  }

  private extractLabel(node: RawNode): string {
    const p = node.props ?? {};
    const text = (p.text ?? p.label ?? p.name ?? node.name ?? '') as string;
    return text ? String(text).slice(0, 50) : '';
  }

  private formatTime(iso: string): string {
    return new Date(iso).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}
