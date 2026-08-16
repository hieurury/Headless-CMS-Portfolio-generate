import React, { useState, useRef, useEffect } from 'react';
import {
  Loader2,
  AlertCircle,
  Zap,
  Brain,
  ChevronDown,
  ChevronRight,
  GitBranch,
} from 'lucide-react';
import { useUIStore } from '../../../store/uiStore';
import { usePortfolioStore } from '../../../store/portfolioStore';
import { t } from '../../../i18n';
import { aiService, type AiMode, type LayoutDiff } from '../../../services/ai.service';
import type { PageLayout } from '../../../core/types/layout.types';

// ─── Styled Foly Text Helper ──────────────────────────────────────────────────

const renderWithFoly = (text: string) => {
  const parts = text.split('Foly');
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className="font-serif italic font-bold tracking-wide text-[var(--color-text)]">
              Foly
            </span>
          )}
        </React.Fragment>
      ))}
    </>
  );
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  type: 'user' | 'ai-result' | 'ai-error';
  content: string;
  markdownTree?: string;
  layoutDiff?: LayoutDiff | null;
  sectionsCount?: number;
  isModification?: boolean;
  timestamp: Date;
}

interface AiGeneratePanelProps {
  portfolioId: string;
  pageId: string;
  currentLayout?: PageLayout;
  onLayoutGenerated: (layout: PageLayout) => void;
}

// ─── Block type friendly names ────────────────────────────────────────────────

function capitalizeType(type: string): string {
  if (!type) return '?';
  // Capitalize first letter, e.g. "container" -> "Container", "nav-bar" -> "Nav-bar"
  return type.charAt(0).toUpperCase() + type.slice(1);
}

// ─── Tree parser ──────────────────────────────────────────────────────────────

interface TreeNode {
  type: string;
  id: string;
  label?: string;
  status: DiffStatus;
  depth: number;
  children: TreeNode[];
}

function parseMarkdownTree(md: string): TreeNode[] {
  const lines = md.split('\n').filter((l) => l.trim().startsWith('-'));
  const roots: TreeNode[] = [];
  const stack: { node: TreeNode; depth: number }[] = [];

  for (const line of lines) {
    const depth = Math.floor((line.match(/^(\s*)/)?.[1].length ?? 0) / 2);
    const inner = line.replace(/^\s*-\s*/, '');
    const typeMatch = inner.match(/^\[([^\]]+)\]/);
    const idMatch = inner.match(/\(([^)]+)\)/);
    const statusMatch = inner.match(/\{([^}]+)\}/);
    const labelMatch = inner.match(/—\s*"([^"]+)"/);

    const statusMap: Record<string, DiffStatus> = {
      added: 'added',
      modified: 'modified',
      deleted: 'deleted',
    };
    const parsedStatus = statusMatch ? statusMap[statusMatch[1]] ?? 'none' : 'none';

    const node: TreeNode = {
      type: typeMatch?.[1] ?? '?',
      id: idMatch?.[1] ?? '',
      label: labelMatch?.[1],
      status: parsedStatus,
      depth,
      children: [],
    };

    while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }
    if (stack.length === 0) roots.push(node);
    else stack[stack.length - 1].node.children.push(node);
    stack.push({ node, depth });
  }
  return roots;
}

// ─── Diff status helpers ──────────────────────────────────────────────────────

type DiffStatus = 'added' | 'modified' | 'deleted' | 'none';

function resolveStatus(node: TreeNode, parentStatus: DiffStatus): DiffStatus {
  // If parent was added or deleted, children visually inherit it.
  // But since backend now does deep status, we can just prefer the node's own status unless parent forces it.
  if (parentStatus === 'deleted') return 'deleted';
  if (parentStatus === 'added') return 'added';
  return node.status;
}

const STATUS_BG: Record<DiffStatus, string> = {
  added:    'bg-emerald-500/15 border-l-emerald-500/50 text-emerald-100',
  modified: 'bg-amber-500/15 border-l-amber-500/50 text-amber-100',
  deleted:  'bg-red-500/15 border-l-red-500/50 text-red-100',
  none:     'border-l-transparent text-[var(--color-text)] hover:bg-white/[0.03]',
};

const STATUS_OPACITY: Record<DiffStatus, string> = {
  added:    'opacity-100',
  modified: 'opacity-100',
  deleted:  'opacity-60 line-through',
  none:     'opacity-90',
};

// ─── Single tree row ──────────────────────────────────────────────────────────

interface TreeNodeViewProps {
  node: TreeNode;
  parentStatus: DiffStatus;
  level?: number;
}

const TreeNodeView: React.FC<TreeNodeViewProps> = ({ node, parentStatus, level = 0 }) => {
  const status = resolveStatus(node, parentStatus);
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = node.children.length > 0;
  const indent = level * 14;
  const bgClass = STATUS_BG[status];
  const opacityClass = STATUS_OPACITY[status];

  return (
    <div style={{ marginLeft: indent }} className="mb-[1px]">
      <div
        className={`flex items-center gap-2 py-1 pl-1 pr-2 rounded-sm group
          border-l-2 transition-colors ${bgClass} ${opacityClass}
          ${hasChildren ? 'cursor-pointer' : ''}`}
        onClick={() => hasChildren && setExpanded((e) => !e)}
      >
        {/* Chevron / dot */}
        <span className="w-3 h-3 flex items-center justify-center shrink-0 opacity-70">
          {hasChildren ? (
            expanded
              ? <ChevronDown size={9} color="currentColor" />
              : <ChevronRight size={9} color="currentColor" />
          ) : (
            <span className="w-1 h-1 rounded-full bg-current ml-px" />
          )}
        </span>

        {/* Block name matches sidebar */}
        <span className="text-[11px] font-medium flex-1 truncate">
          {capitalizeType(node.type)}
          {node.label && (
            <span className="ml-2 font-normal opacity-70">
              — {node.label}
            </span>
          )}
          {hasChildren && !expanded && (
            <span className="ml-1.5 font-normal opacity-50">
              ({node.children.length})
            </span>
          )}
        </span>
      </div>

      {expanded && hasChildren && (
        <div className="ml-1.5 border-l border-[var(--color-border)]/40 mt-0.5 mb-1.5">
          {node.children.map((child, i) => (
            <TreeNodeView key={i} node={child} parentStatus={status} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Layout tree viewer ───────────────────────────────────────────────────────

interface LayoutTreeViewProps {
  markdownTree: string;
  layoutDiff: LayoutDiff | null | undefined;
  sectionsCount: number;
  isModification?: boolean;
}

const LayoutTreeView: React.FC<LayoutTreeViewProps> = ({
  markdownTree,
  layoutDiff,
  sectionsCount,
  isModification,
}) => {
  const [open, setOpen] = useState(true);
  const nodes = parseMarkdownTree(markdownTree);
  const deletedSections = layoutDiff?.deleted ?? [];

  const addedCount = layoutDiff?.added.length ?? 0;
  const modifiedCount = layoutDiff?.modified.length ?? 0;
  const deletedCount = deletedSections.length;

  // Build a compact header summary
  const diffParts: string[] = [];
  if (addedCount > 0)    diffParts.push(`${addedCount} thêm`);
  if (modifiedCount > 0) diffParts.push(`${modifiedCount} sửa`);
  if (deletedCount > 0)  diffParts.push(`${deletedCount} xóa`);
  const diffLabel = diffParts.length > 0 ? diffParts.join(' · ') : `${sectionsCount} phần`;

  return (
    <div className="mt-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-[var(--color-surface)] transition-colors"
      >
        <GitBranch size={11} className="text-[var(--color-text-muted)] shrink-0" />
        <span className="text-[11px] font-semibold text-[var(--color-text)] flex-1">
          {isModification ? 'Cấu trúc sau khi chỉnh sửa' : 'Cấu trúc trang vừa tạo'}
        </span>
        <span className="text-[10px] text-[var(--color-text-faint)] font-medium bg-[var(--color-surface)] px-2 py-0.5 rounded-full">
          {diffLabel}
        </span>
        {open
          ? <ChevronDown size={12} className="text-[var(--color-text-muted)] shrink-0 ml-1" />
          : <ChevronRight size={12} className="text-[var(--color-text-muted)] shrink-0 ml-1" />
        }
      </button>

      {open && (
        <div className="px-2 pb-3 pt-2 border-t border-[var(--color-border)] bg-[var(--color-surface-2)]">
          {/* Main tree */}
          {nodes.map((node, i) => (
            <TreeNodeView
              key={i}
              node={node}
              parentStatus="none"
              level={0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Mode Toggle ──────────────────────────────────────────────────────────────

interface ModeToggleProps {
  mode: AiMode;
  onChange: (mode: AiMode) => void;
  disabled?: boolean;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onChange, disabled }) => (
  <div className="flex items-center gap-1 p-0.5 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)]">
    <button
      onClick={() => onChange('fast')}
      disabled={disabled}
      title="Nhanh — phù hợp với hầu hết yêu cầu thông thường"
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[10px] font-semibold transition-all duration-150 ${
        mode === 'fast'
          ? 'bg-[var(--color-text)] text-[var(--color-bg)]'
          : 'text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)]'
      } disabled:opacity-40`}
    >
      <Zap size={9} />
      Nhanh
    </button>
    <button
      onClick={() => onChange('think')}
      disabled={disabled}
      title="Phân tích — dành cho yêu cầu phức tạp, AI sẽ suy nghĩ kỹ hơn trước khi tạo"
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[10px] font-semibold transition-all duration-150 ${
        mode === 'think'
          ? 'bg-[var(--color-text)] text-[var(--color-bg)]'
          : 'text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)]'
      } disabled:opacity-40`}
    >
      <Brain size={9} />
      Phân tích
    </button>
  </div>
);

// ─── Chat bubbles ─────────────────────────────────────────────────────────────

const UserBubble: React.FC<{ content: string }> = ({ content }) => (
  <div className="flex justify-end mb-3">
    <div className="max-w-[85%] px-3 py-2 rounded-sm text-xs leading-relaxed bg-[var(--color-text)] text-[var(--color-bg)]">
      {content}
    </div>
  </div>
);

const AiResultBubble: React.FC<{ message: ChatMessage }> = ({ message }) => (
  <div className="flex flex-col mb-4">
    {/* Header row */}
    <div className="flex items-center gap-2 mb-1.5 px-0.5">
      <img src="/foly.png" alt="Foly" className="w-4 h-4 rounded-[3px] object-cover shrink-0" />
      <span className="text-[10px] text-[var(--color-text-faint)]">
        {renderWithFoly('Foly')}
      </span>
      <span className="ml-auto text-[9px] text-[var(--color-text-faint)]">
        {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>

    {/* Summary text — friendly, no jargon */}
    <div className="rounded-sm border border-[var(--color-success-border)] bg-[var(--color-success-bg)] px-3 py-2.5">
      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
        {message.content}
      </p>
    </div>

    {/* Layout tree */}
    {message.markdownTree && (
      <LayoutTreeView
        markdownTree={message.markdownTree}
        layoutDiff={message.layoutDiff}
        sectionsCount={message.sectionsCount ?? 0}
        isModification={message.isModification}
      />
    )}
  </div>
);

const AiErrorBubble: React.FC<{ content: string; timestamp: Date }> = ({ content, timestamp }) => (
  <div className="flex flex-col mb-3">
    <div className="flex items-center gap-2 mb-1.5 px-0.5">
      <img src="/foly.png" alt="Foly" className="w-4 h-4 rounded-[3px] object-cover shrink-0" />
      <AlertCircle size={11} className="text-[var(--color-error)] shrink-0" />
      <span className="text-[10px] text-[var(--color-text-faint)]">
        {renderWithFoly('Foly')}
      </span>
      <span className="ml-auto text-[9px] text-[var(--color-text-faint)]">
        {timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
    <div className="rounded-sm border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-3 py-2.5">
      <p className="text-xs text-[var(--color-error)] leading-relaxed">{content}</p>
    </div>
  </div>
);

// ─── Main Panel ───────────────────────────────────────────────────────────────

export const AiGeneratePanel: React.FC<AiGeneratePanelProps> = ({
  portfolioId,
  pageId,
  currentLayout,
  onLayoutGenerated,
}) => {
  const { language } = useUIStore();
  const tr = t(language).editor.aiPanel;
  const { current: portfolio } = usePortfolioStore();

  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<AiMode>('fast');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || trimmed.length < 10) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      type: 'user',
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setIsLoading(true);

    try {
      const portfolioMeta = portfolio?.meta
        ? {
            pageLayout: portfolio.meta.pageLayout,
            colors: portfolio.meta.colors,
            fonts: portfolio.meta.fonts,
          }
        : undefined;

      const result = await aiService.generateLayout(
        trimmed,
        portfolioId,
        pageId,
        currentLayout,
        portfolioMeta,
        mode,
      );

      onLayoutGenerated(result.layout);

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        type: 'ai-result',
        // Use the server-generated friendly summary
        content: result.summary,
        markdownTree: result.markdownTree,
        layoutDiff: result.layoutDiff,
        sectionsCount: result.sectionsGenerated,
        isModification: !!currentLayout,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      const raw = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? tr.generateFailed;
      const errorText = Array.isArray(raw) ? raw[0] : raw;
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, type: 'ai-error', content: errorText, timestamp: new Date() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && prompt.trim().length >= 10 && !isLoading) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const charCount = prompt.trim().length;
  const isReady = charCount >= 10;

  return (
    <div className="flex flex-col h-full">

      {/* ── Chat history ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-1 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <img src="/foly.png" alt="Foly" className="w-10 h-10 rounded-sm object-cover mb-3 opacity-60" />
            <p className="text-sm font-serif italic font-bold tracking-wide text-[var(--color-text)] mb-1">Foly</p>
            <p className="text-xs text-[var(--color-text-faint)] leading-relaxed max-w-[200px]">
              {renderWithFoly('Mô tả trang bạn muốn tạo, Foly sẽ xây dựng hoặc chỉnh sửa cấu trúc ngay tại đây.')}
            </p>
          </div>
        )}

        {messages.map((msg) => {
          if (msg.type === 'user')      return <UserBubble key={msg.id} content={msg.content} />;
          if (msg.type === 'ai-result') return <AiResultBubble key={msg.id} message={msg} />;
          return <AiErrorBubble key={msg.id} content={msg.content} timestamp={msg.timestamp} />;
        })}

        {isLoading && (
          <div className="flex items-center gap-2 mb-3 px-0.5">
            <img src="/foly.gif" alt="Foly đang xử lý" className="w-6 h-6 rounded-sm object-cover shrink-0" />
            <span className="text-[10px] text-[var(--color-text-faint)]">
              {mode === 'think' ? renderWithFoly('Foly đang phân tích yêu cầu...') : renderWithFoly('Foly đang tạo trang...')}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input area ───────────────────────────────────────────────── */}
      <div className="shrink-0 px-3 pb-3 pt-2 border-t border-[var(--color-border)]">
        {/* Mode toggle + char count */}
        <div className="flex items-center justify-between mb-2">
          <ModeToggle mode={mode} onChange={setMode} disabled={isLoading} />
          <span className={`text-[9px] transition-colors ${isReady ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-faint)]'}`}>
            {isReady ? `${charCount}/2000` : `Con thieu ${Math.max(0, 10 - charCount)} ky tu`}
          </span>
        </div>

        {/* Prompt textarea */}
        <div
          className={`relative rounded-sm border transition-all duration-200 bg-[var(--color-surface-2)] ${
            isReady ? 'border-[var(--color-border-hover)] shadow-md shadow-black/20' : 'border-[var(--color-border)]'
          }`}
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tr.promptPlaceholder}
            rows={3}
            disabled={isLoading}
            className="w-full px-3 pt-3 pb-2 bg-transparent text-[var(--color-text)] text-xs placeholder-[var(--color-text-faint)] focus:outline-none resize-none leading-relaxed disabled:opacity-50"
          />
          <div className="flex items-center justify-between px-3 pb-2">
            <span className="text-[9px] text-[var(--color-text-faint)]">Ctrl+Enter de gui</span>
            <button
              onClick={handleGenerate}
              disabled={isLoading || !isReady}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[var(--color-text)] text-[var(--color-bg)] text-[11px] font-semibold
                hover:shadow-md hover:shadow-black/30 hover:scale-[1.03] transition-all duration-200
                disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading
                ? <><Loader2 size={11} className="animate-spin" /> {tr.generating}</>
                : <>{mode === 'think' ? <Brain size={11} /> : <Zap size={11} />} {tr.generateLayout}</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
