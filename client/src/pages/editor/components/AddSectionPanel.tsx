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
  /** Called when a full template tree should be injected */
  onAddTemplate: (tree: LayoutSection) => void;
  onClose: () => void;
  /** If true, show hint that block will be added inside a container */
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

  // Template filtering
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[var(--color-surface)] backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-xl glass rounded-md shadow-2xl animate-slide-up overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] shrink-0">
          <div>
            <h3 className="text-base font-bold text-[var(--color-text)]">
              {addingToContainer ? tr.addBlockToContainer : tr.addToPage}
            </h3>
            {addingToContainer && (
              <p className="text-xs text-[var(--color-text)] font-semibold mt-0.5">
                {tr.containerHint}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] hover:brightness-110 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-[var(--color-border)] shrink-0">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                activeTab === 'templates'
                  ? tr.searchTemplates
                  : activeTab === 'blocks'
                    ? tr.searchBlocks
                    : tr.searchLayout
              }
              autoFocus
              className="w-full pl-9 pr-4 py-2 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] text-sm
                placeholder-slate-600 focus:outline-none focus:border-[var(--color-border)] transition-colors"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--color-border)] shrink-0 px-5">
          {[
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
          ].map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={clsx(
                'flex items-center gap-1.5 py-3 pr-4 text-sm font-medium transition-all border-b-2',
                activeTab === key
                  ? 'text-[var(--color-text)] border-[var(--color-text)]'
                  : 'text-[var(--color-text-faint)] border-transparent hover:text-[var(--color-text)]',
              )}
            >
              <Icon size={13} /> {label}
              <span className="ml-1 text-xs text-[var(--color-text-faint)] font-mono">
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* ─── Templates Tab ───────────────────────────────────────── */}
          {activeTab === 'templates' && (
            <>
              {/* Category filter chips */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={clsx(
                    'px-3 py-1 rounded-full text-xs font-medium transition-all',
                    selectedCategory === 'all'
                      ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                      : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:brightness-110',
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
                        'px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1',
                        selectedCategory === cat
                          ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                          : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:brightness-110',
                      )}
                    >
                      {meta?.icon} {meta?.label}
                    </button>
                  );
                })}
              </div>

              {filteredTemplates.length === 0 ? (
                <EmptyState query={search} />
              ) : (
                <div className="grid grid-cols-2 gap-3">
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
              <p className="text-xs text-[var(--color-text-faint)] text-center">
                {tr.templatesHint}
              </p>
            </>
          )}

          {/* ─── Blocks Tab ─────────────────────────────────────────── */}
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
              <p className="text-xs text-[var(--color-text-faint)] mt-4 text-center">
                {tr.blocksHint}
              </p>
            </>
          )}

          {/* ─── Layout Tab ────────────────────────────────────────── */}
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
              <p className="text-xs text-[var(--color-text-faint)] mt-4 text-center">
                {tr.containersHint}
              </p>
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
      className="flex flex-col gap-3 p-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-[var(--color-border)] hover:brightness-110 text-left transition-all group"
    >
      {/* Lucide icon preview */}
      <div className="w-12 h-12 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] font-semibold group-hover:border-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors">
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
      className={clsx(
        'flex items-start gap-3 p-3 rounded-md text-left transition-all group',
        isContainer
          ? 'border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] hover:border-solid hover:border-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]'
          : 'border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]',
      )}
    >
      <div
        className={clsx(
          'w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-colors',
          isContainer
            ? 'bg-[var(--color-text)]/10 text-[var(--color-text)] font-semibold group-hover:bg-[var(--color-text)]/20'
            : 'bg-[var(--color-text)]/10 text-[var(--color-text)] font-semibold group-hover:bg-[var(--color-text)]/20',
        )}
      >
        {entry.icon ?? <Settings size={16} />}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-[var(--color-text)] truncate">
            {displayName}
          </p>
          {isContainer && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-text)]/10 text-[var(--color-text)] font-semibold font-mono uppercase tracking-wide shrink-0">
              {tr.containerLabel}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[11px] text-[var(--color-text-faint)] mt-0.5 leading-snug line-clamp-2">
            {description}
          </p>
        )}
        <p className="text-[10px] text-[var(--color-text-faint)] font-mono mt-1">
          {entry.type}
        </p>
      </div>
    </button>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ query: string }> = ({ query }) => {
  const { language } = useUIStore();
  const tr = t(language).editor.addSectionPanel;

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Search size={24} className="text-[var(--color-text-faint)] mb-3" />
      <p className="text-sm text-[var(--color-text-faint)]">
        {tr.noResults.replace('{query}', query)}
      </p>
      <p className="text-xs text-[var(--color-text-faint)] mt-1">
        {tr.tryDifferentKeyword}
      </p>
    </div>
  );
};
