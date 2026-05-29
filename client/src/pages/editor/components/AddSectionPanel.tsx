import React, { useState, useMemo } from 'react';
import { X, Search, Box, LayoutDashboard, Settings, Wand2 } from 'lucide-react';
import { componentRegistry } from '../../../core/registry/ComponentRegistry';
import { templateLibrary, TEMPLATE_CATEGORIES, type TemplateEntry } from '../../../core/registry/templateLibrary';
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
  const [activeTab, setActiveTab] = useState<'blocks' | 'layout' | 'templates'>('templates');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allEntries = componentRegistry.getAll().filter((e) => !e.isInternal);
  const atomEntries = allEntries.filter((e) => e.isAtom);
  const containerEntries = allEntries.filter((e) => e.isContainer && !e.isInternal);

  const filterEntries = (entries: RegistryEntry[]) => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter(
      (e) =>
        e.displayName.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q),
    );
  };

  const filteredAtoms = useMemo(() => filterEntries(atomEntries), [atomEntries, search]);
  const filteredContainers = useMemo(() => filterEntries(containerEntries), [containerEntries, search]);

  // Template filtering
  const filteredTemplates = useMemo(() => {
    let list = templateLibrary;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-xl glass rounded-2xl shadow-2xl animate-slide-up overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
          <div>
            <h3 className="text-base font-bold text-white">
              {addingToContainer ? 'Add Block to Container' : 'Add to Page'}
            </h3>
            {addingToContainer && (
              <p className="text-xs text-indigo-400 mt-0.5">Block will be placed inside the container</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-white/5 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === 'templates' ? 'Search templates...' : 'Search blocks...'}
              autoFocus
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 text-sm
                placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 shrink-0 px-5">
          {([
            { key: 'templates' as const, label: 'Templates', icon: Wand2, count: filteredTemplates.length },
            { key: 'blocks' as const, label: 'Blocks', icon: Box, count: filteredAtoms.length },
            { key: 'layout' as const, label: 'Layout', icon: LayoutDashboard, count: filteredContainers.length },
          ]).map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={clsx(
                'flex items-center gap-1.5 py-3 pr-4 text-sm font-medium transition-all border-b-2',
                activeTab === key
                  ? 'text-white border-indigo-500'
                  : 'text-slate-500 border-transparent hover:text-slate-300',
              )}
            >
              <Icon size={13} /> {label}
              <span className="ml-1 text-xs text-slate-600 font-mono">{count}</span>
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
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10',
                  )}
                >
                  All
                </button>
                {allCategories.map((cat) => {
                  const meta = TEMPLATE_CATEGORIES[cat];
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={clsx(
                        'px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1',
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10',
                      )}
                    >
                      {meta.emoji} {meta.label}
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
              <p className="text-xs text-slate-600 text-center">
                Templates are pre-built layout trees — every element inside is directly editable
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
                  {filteredAtoms.map((entry) => (
                    <ComponentCard
                      key={entry.type}
                      entry={entry}
                      onAdd={() => { onAdd(entry.type); onClose(); }}
                    />
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-600 mt-4 text-center">
                Atomic blocks — combine them inside Layout containers for complex designs
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
                  {filteredContainers.map((entry) => (
                    <ComponentCard
                      key={entry.type}
                      entry={entry}
                      isContainer
                      onAdd={() => { onAdd(entry.type); onClose(); }}
                    />
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-600 mt-4 text-center">
                Containers — hold and arrange blocks. Nest freely: Card inside Columns, Rows of Buttons...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Template Card ────────────────────────────────────────────────────────────

const TemplateCard: React.FC<{ template: TemplateEntry; onAdd: () => void }> = ({ template, onAdd }) => {
  const meta = TEMPLATE_CATEGORIES[template.category];
  return (
    <button
      onClick={onAdd}
      className="flex flex-col gap-3 p-4 rounded-xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 hover:border-indigo-500/40 hover:from-indigo-500/10 hover:to-violet-500/10 text-left transition-all group"
    >
      {/* Emoji preview */}
      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl group-hover:bg-indigo-500/20 transition-colors">
        {template.emoji}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <p className="text-sm font-semibold text-white truncate">{template.name}</p>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 font-mono shrink-0">
            {meta?.emoji} {meta?.label}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{template.description}</p>
      </div>
    </button>
  );
};

// ─── Component Card ───────────────────────────────────────────────────────────

const ComponentCard: React.FC<{ entry: RegistryEntry; onAdd: () => void; isContainer?: boolean }> = ({ entry, onAdd, isContainer }) => (
  <button
    onClick={onAdd}
    className={clsx(
      'flex items-start gap-3 p-3 rounded-xl border text-left transition-all group',
      isContainer
        ? 'border-violet-500/20 bg-violet-500/5 hover:border-violet-500/40 hover:bg-violet-500/10'
        : 'border-white/5 bg-white/2 hover:border-indigo-500/30 hover:bg-indigo-500/8',
    )}
  >
    <div className={clsx(
      'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors',
      isContainer
        ? 'bg-violet-500/15 text-violet-400 group-hover:bg-violet-500/25'
        : 'bg-indigo-500/15 text-indigo-400 group-hover:bg-indigo-500/25',
    )}>
      {entry.icon ?? <Settings size={16} />}
    </div>
    <div className="min-w-0">
      <div className="flex items-center gap-1.5">
        <p className="text-sm font-medium text-slate-200 truncate">{entry.displayName}</p>
        {isContainer && (
          <span className="text-[9px] px-1 py-0.5 rounded bg-violet-500/20 text-violet-400 font-mono uppercase tracking-wide shrink-0">
            container
          </span>
        )}
      </div>
      {entry.description && (
        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">{entry.description}</p>
      )}
      <p className="text-[10px] text-slate-700 font-mono mt-1">{entry.type}</p>
    </div>
  </button>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ query: string }> = ({ query }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <Search size={24} className="text-slate-700 mb-3" />
    <p className="text-sm text-slate-500">No results for "{query}"</p>
    <p className="text-xs text-slate-700 mt-1">Try a different keyword</p>
  </div>
);
