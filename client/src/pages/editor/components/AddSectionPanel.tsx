import React, { useState, useMemo, useCallback } from 'react';
import { X, Search, Box, LayoutDashboard, Settings, Wand2 } from 'lucide-react';
import { useUIStore } from '../../../store/uiStore';
import { t } from '../../../i18n';
import { componentRegistry } from '../../../core/registry/ComponentRegistry';
import {
  templateLibrary,
  TEMPLATE_CATEGORIES,
  type TemplateEntry,
} from '../../../core/registry/templateLibrary';
import type { RegistryEntry } from '../../../core/types/registry.types';
import type { LayoutSection } from '../../../core/types/layout.types';
import clsx from 'clsx';

interface AddSectionPanelProps {
  onAdd: (type: string) => void;
  onAddTemplate: (tree: LayoutSection) => void;
  onClose: () => void;
  addingToContainer?: boolean;
}

export const AddSectionPanel: React.FC<AddSectionPanelProps> = ({
  onAdd,
  onAddTemplate,
  onClose,
  addingToContainer = false,
}) => {
  const [activeTab, setActiveTab] = useState<'blocks' | 'layout' | 'templates'>(
    'templates',
  );
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { language } = useUIStore();
  const tr = t(language).editor.addSectionPanel;

  const allEntries = componentRegistry.getAll().filter((e) => !e.isInternal);
  const atomEntries = allEntries.filter((e) => e.isAtom);
  const containerEntries = allEntries.filter(
    (e) => e.isContainer && !e.isInternal,
  );

  const filterEntries = useCallback(
    (entries: RegistryEntry[], qRaw: string) => {
      const q = qRaw?.trim();
      if (!q) return entries;
      const qq = q.toLowerCase();
      return entries.filter(
        (e) =>
          e.displayName.toLowerCase().includes(qq) ||
          e.type.toLowerCase().includes(qq) ||
          e.description?.toLowerCase().includes(qq),
      );
    },
    [],
  );

  const filteredAtoms = useMemo(
    () => filterEntries(atomEntries, search),
    [atomEntries, search, filterEntries],
  );
  const filteredContainers = useMemo(
    () => filterEntries(containerEntries, search),
    [containerEntries, search, filterEntries],
  );

  const filteredTemplates = useMemo(() => {
    let list = templateLibrary;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      );
    }
    if (selectedCategory !== 'all') {
      list = list.filter((t) => t.category === selectedCategory);
    }
    return list;
  }, [search, selectedCategory]);

  const allCategories = useMemo(
    () => Array.from(new Set(templateLibrary.map((t) => t.category))),
    [],
  );

  const tabs = [
    {
      key: 'templates' as const,
      label: tr.templates,
      icon: Wand2,
      count: filteredTemplates.length,
    },
    {
      key: 'blocks' as const,
      label: tr.blocks,
      icon: Box,
      count: filteredAtoms.length,
    },
    {
      key: 'layout' as const,
      label: tr.layout,
      icon: LayoutDashboard,
      count: filteredContainers.length,
    },
  ];

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Split-Pane Layout Modal */}
      <div
        className="relative w-full max-w-[1000px] h-[75vh] min-h-[500px] flex bg-[var(--color-bg)] border border-[var(--color-border)] shadow-2xl rounded-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Left Sidebar ────────────────────────────────────────── */}
        <div className="w-[260px] shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col">
          {/* Header & Search */}
          <div className="p-4 border-b border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--color-text)]">
                {addingToContainer ? tr.addBlockToContainer : tr.addToPage}
              </h3>
              <button
                onClick={onClose}
                className="text-[var(--color-text-faint)] hover:text-[var(--color-text)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tr.searchTemplates || 'Tìm kiếm...'}
                autoFocus
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm rounded-sm pl-9 pr-3 py-2 focus:outline-none focus:border-[var(--color-text-muted)] transition-colors placeholder-[var(--color-text-muted)]"
              />
            </div>
          </div>

          {/* Main Tabs (Vertical) */}
          <div className="p-3 border-b border-[var(--color-border)] flex flex-col gap-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  if (tab.key !== 'templates') setSelectedCategory('all');
                }}
                className={clsx(
                  'flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-sm transition-colors text-left group',
                  activeTab === tab.key
                    ? 'bg-[var(--color-text)] text-[var(--color-bg)]'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]',
                )}
              >
                <tab.icon
                  size={16}
                  className={
                    activeTab === tab.key
                      ? 'text-[var(--color-bg)]'
                      : 'text-[var(--color-text-faint)] group-hover:text-[var(--color-text)]'
                  }
                />
                <span className="flex-1">{tab.label}</span>
                <span
                  className={clsx(
                    'text-[10px] px-1.5 py-0.5 rounded-sm font-mono',
                    activeTab === tab.key
                      ? 'bg-[var(--color-bg)]/20 text-[var(--color-bg)]'
                      : 'bg-[var(--color-border)] text-[var(--color-text-faint)] group-hover:bg-[var(--color-border-hover)] group-hover:text-[var(--color-text)]',
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Category Filters (Only for templates) */}
          <div className="flex-1 p-3 overflow-y-auto">
            {activeTab === 'templates' && (
              <>
                <p className="text-[10px] font-bold text-[var(--color-text-faint)] uppercase tracking-widest mb-2 px-3">
                  Danh mục
                </p>
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={clsx(
                      'px-3 py-2 text-xs font-medium rounded-sm transition-colors text-left',
                      selectedCategory === 'all'
                        ? 'bg-[var(--color-surface-2)] text-[var(--color-text)]'
                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]',
                    )}
                  >
                    {tr.all}
                  </button>
                  {allCategories.map((cat) => {
                    const meta = TEMPLATE_CATEGORIES.find((c) => c.id === cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={clsx(
                          'flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-sm transition-colors text-left group',
                          selectedCategory === cat
                            ? 'bg-[var(--color-surface-2)] text-[var(--color-text)]'
                            : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]',
                        )}
                      >
                        <span
                          className={clsx(
                            'opacity-50',
                            selectedCategory === cat
                              ? 'text-[var(--color-text)]'
                              : 'group-hover:text-[var(--color-text)]',
                          )}
                        >
                          {meta?.icon}
                        </span>
                        <span>{meta?.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ─── Right Pane (Content Grid) ─────────────────────────── */}
        <div className="flex-1 bg-[var(--color-bg)] overflow-y-auto p-6">
          {activeTab === 'templates' && (
            <>
              {filteredTemplates.length === 0 ? (
                <EmptyState query={search} />
              ) : (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onAdd={() => {
                        onAddTemplate(template.build());
                        onClose();
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'blocks' && (
            <>
              {filteredAtoms.length === 0 ? (
                <EmptyState query={search} />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {filteredAtoms.map((entry: RegistryEntry) => (
                    <ComponentCard
                      key={entry.type}
                      entry={entry}
                      onAdd={() => {
                        onAdd(entry.type);
                        onClose();
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'layout' && (
            <>
              {filteredContainers.length === 0 ? (
                <EmptyState query={search} />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {filteredContainers.map((entry: RegistryEntry) => (
                    <ComponentCard
                      key={entry.type}
                      entry={entry}
                      isContainer
                      onAdd={() => {
                        onAdd(entry.type);
                        onClose();
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Template Card ────────────────────────────────────────────────────────────

const TemplateCard: React.FC<{
  template: TemplateEntry;
  onAdd: () => void;
}> = ({ template, onAdd }) => {
  const { language } = useUIStore();
  const tr = t(language).editor.addSectionPanel;
  const meta = TEMPLATE_CATEGORIES.find((c) => c.id === template.category);
  const templateMap = tr.templateEntries as
    | Record<string, { name: string; description: string }>
    | undefined;
  const displayName = templateMap?.[template.id]?.name ?? template.name;
  const description =
    templateMap?.[template.id]?.description ?? template.description;
  return (
    <button
      onClick={onAdd}
      className="flex flex-col p-4 rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-text-muted)] text-left transition-colors group h-full"
    >
      <div className="w-10 h-10 rounded-sm bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] font-semibold mb-4 group-hover:text-[var(--color-text)] transition-colors">
        {template.icon}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <p className="text-sm font-semibold text-[var(--color-text)] truncate">
            {displayName}
          </p>
          <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-text)]/10 text-[var(--color-text)] font-semibold font-mono shrink-0">
            {meta?.icon} {meta?.label}
          </span>
        </div>
        <p className="text-[11px] text-[var(--color-text-faint)] leading-snug line-clamp-2">
          {description}
        </p>
      </div>
    </button>
  );
};

// ─── Component Card ───────────────────────────────────────────────────────────

const ComponentCard: React.FC<{
  entry: RegistryEntry;
  onAdd: () => void;
  isContainer?: boolean;
}> = ({ entry, onAdd, isContainer }) => {
  const { language } = useUIStore();
  const tr = t(language).editor.addSectionPanel;

  const componentMap = tr.componentEntries as
    | Record<string, { name: string; description: string }>
    | undefined;
  const entryTr = componentMap?.[entry.type];
  const displayName = entryTr?.name ?? entry.displayName;
  const description = entryTr?.description ?? entry.description;

  return (
    <button
      onClick={onAdd}
      className="flex flex-col p-4 rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-text-muted)] text-left transition-colors group h-full"
    >
      <div className="w-10 h-10 rounded-sm bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center shrink-0 text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors mb-3">
        {entry.icon ?? <Settings size={18} />}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-[var(--color-text)] truncate">
            {displayName}
          </p>
          {isContainer && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-[var(--color-text)]/10 text-[var(--color-text)] font-semibold font-mono uppercase tracking-wide shrink-0 border border-[var(--color-border)]">
              {tr.containerLabel}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[11px] text-[var(--color-text-faint)] mt-0.5 leading-snug line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </button>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ query: string }> = ({ query }) => {
  const { language } = useUIStore();
  const tr = t(language).editor.addSectionPanel;

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-12 h-12 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mb-4">
        <Search size={20} className="text-[var(--color-text-muted)]" />
      </div>
      <p className="text-sm font-medium text-[var(--color-text)]">
        {tr.noResults.replace('{query}', query)}
      </p>
      <p className="text-xs text-[var(--color-text-faint)] mt-2">
        {tr.tryDifferentKeyword}
      </p>
    </div>
  );
};
