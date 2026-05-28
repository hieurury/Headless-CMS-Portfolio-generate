import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePageStore } from '../../store/pageStore';
import { usePortfolioStore } from '../../store/portfolioStore';
import { PageRenderer } from '../../core/renderer/PageRenderer';
import { EditorProvider } from '../../core/context/EditorContext';
import { LayersPanel } from './components/LayersPanel';
import { AddSectionPanel } from './components/AddSectionPanel';
import { SmartPropEditor } from './components/SmartPropEditor';
import { AiGeneratePanel } from './components/AiGeneratePanel';
import { EmptyCanvasPrompt } from './components/EmptyCanvasPrompt';
import type { LayoutSection, PageLayout } from '../../core/types/layout.types';
import { componentRegistry } from '../../core/registry/ComponentRegistry';
import {
  Save, ArrowLeft, Sparkles, Layers,
  Loader2, Check, ChevronRight, Plus, X,
  PanelLeft, PanelRight, Settings,
} from 'lucide-react';
import clsx from 'clsx';
import { arrayMove } from '@dnd-kit/sortable';
import {
  moveSection,
  reorderChildren,
  removeSection,
  findSectionById,
  addChildToSection,
  updateSectionProps,
  updateSectionName,
  findParent,
} from '../../core/utils/layoutUtils';

type LeftTab = 'ai' | 'sections';

const HEADER_H = 56;

/** Build the auto-generated default children for container types (e.g., Columns → N _column slots) */
function buildDefaultChildren(type: string, props: Record<string, unknown>): LayoutSection[] {
  const entry = componentRegistry.getEntry(type);
  if (entry?.defaultChildren) {
    return entry.defaultChildren();
  }
  // Auto-generate column slots for 'columns' type
  if (type === 'columns') {
    const count = (props['columns'] as number) ?? 2;
    return Array.from({ length: count }, (_, i) => ({
      id: `_col-${Date.now()}-${i}`,
      type: '_column',
      name: '',
      props: {},
      children: [],
    }));
  }
  return [];
}

export const PageEditorPage: React.FC = () => {
  const { portfolioId, pageId } = useParams<{ portfolioId: string; pageId: string }>();
  const navigate = useNavigate();

  const { current: page, fetchOne, update, isLoading } = usePageStore();
  const { current: portfolio, fetchOne: fetchPortfolio } = usePortfolioStore();

  // ── Draft ──────────────────────────────────────────────────────────
  const [draftLayout, setDraftLayout] = useState<PageLayout>({ sections: [] });
  // Selected section id (works at any depth)
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // ── Panel state ────────────────────────────────────────────────────
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addChildParentId, setAddChildParentId] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<LeftTab>('ai');

  const rightScrollRef = useRef<HTMLDivElement>(null);

  // ── Load ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (portfolioId && pageId) {
      fetchOne(portfolioId, pageId);
      fetchPortfolio(portfolioId);
    }
  }, [portfolioId, pageId, fetchOne, fetchPortfolio]);

  useEffect(() => {
    if (page) {
      setDraftLayout(page.layout ?? { sections: [] });
      setIsDirty(false);
    }
  }, [page]);

  // ── Listen for cms:addChild events from ContainerDropZone ──────────
  useEffect(() => {
    const handler = (e: Event) => {
      const { parentId } = (e as CustomEvent<{ parentId: string }>).detail;
      setAddChildParentId(parentId);
      setShowAddPanel(true);
    };
    window.addEventListener('cms:addChild', handler);
    return () => window.removeEventListener('cms:addChild', handler);
  }, []);

  // ── Immutable layout updater ───────────────────────────────────────
  const updateLayout = useCallback((updater: (prev: PageLayout) => PageLayout) => {
    setDraftLayout((prev) => updater(prev));
    setIsDirty(true);
  }, []);

  // ── Add section / block ────────────────────────────────────────────
  const handleAddSection = useCallback((type: string) => {
    const defaults = componentRegistry.getDefaultProps(type);
    const children = buildDefaultChildren(type, defaults);
    const newSection: LayoutSection = {
      id: `section-${type}-${Date.now()}`,
      type,
      name: '',
      props: defaults,
      children,
    };

    if (addChildParentId) {
      // Add as a child of a container
      updateLayout((layout) => ({
        ...layout,
        sections: addChildToSection(layout.sections, addChildParentId, newSection),
      }));
      setSelectedId(newSection.id);
    } else {
      // Add to top level
      updateLayout((layout) => ({
        ...layout,
        sections: [...layout.sections, newSection],
      }));
      setSelectedId(newSection.id);
      setLeftTab('sections');
    }

    setAddChildParentId(null);
    setSelectedFieldKey(null);
    setShowRightPanel(true);
    setTimeout(() => rightScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  }, [addChildParentId, updateLayout]);

  // ── Top-level reorder ──────────────────────────────────────────────
  const handleTopLevelReorder = useCallback((oldIndex: number, newIndex: number) => {
    updateLayout((layout) => ({
      ...layout,
      sections: arrayMove(layout.sections, oldIndex, newIndex),
    }));
  }, [updateLayout]);

  // ── Remove any section (by id, any depth) ─────────────────────────
  const handleRemoveSection = useCallback((sectionId: string) => {
    updateLayout((layout) => {
      const [newSections] = removeSection(layout.sections, sectionId);
      return { ...layout, sections: newSections };
    });
    setSelectedId((prev) => prev === sectionId ? null : prev);
  }, [updateLayout]);

  // ── Move a section into a container ───────────────────────────────
  const handleMoveToContainer = useCallback((sectionId: string, toContainerId: string, toIndex?: number) => {
    updateLayout((layout) => ({
      ...layout,
      sections: moveSection(layout.sections, sectionId, toContainerId, toIndex),
    }));
  }, [updateLayout]);

  // ── Reorder children within a container ───────────────────────────
  const handleReorderChildren = useCallback((parentId: string, oldIndex: number, newIndex: number) => {
    updateLayout((layout) => ({
      ...layout,
      sections: reorderChildren(layout.sections, parentId, oldIndex, newIndex),
    }));
  }, [updateLayout]);

  // ── Props change (by section id, any depth) ───────────────────────
  const handlePropsChange = useCallback((sectionId: string, newProps: Record<string, unknown>) => {
    updateLayout((layout) => ({
      ...layout,
      sections: updateSectionProps(layout.sections, sectionId, newProps),
    }));
  }, [updateLayout]);

  // ── Name change (by section id, any depth) ────────────────────────
  const handleNameChange = useCallback((sectionId: string, name: string) => {
    updateLayout((layout) => ({
      ...layout,
      sections: updateSectionName(layout.sections, sectionId, name),
    }));
  }, [updateLayout]);

  // ── AI layout replace ─────────────────────────────────────────────
  const handleAiLayout = (layout: PageLayout) => {
    setDraftLayout(layout);
    setIsDirty(true);
    setSelectedId(null);
    setSelectedFieldKey(null);
    setLeftTab('sections');
  };

  // ── Selection from preview ─────────────────────────────────────────
  const handleSectionSelect = useCallback((id: string) => {
    setSelectedId(id);
    setSelectedFieldKey(null);
    setShowRightPanel(true);
    setTimeout(() => rightScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 80);
  }, []);

  const handleFieldSelect = useCallback((sectionId: string, fieldKey: string) => {
    setSelectedId(sectionId);
    setSelectedFieldKey(fieldKey);
    setShowRightPanel(true);
  }, []);

  // ── Save ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!portfolioId || !pageId || !isDirty) return;
    setIsSaving(true);
    try {
      await update(portfolioId, pageId, { layout: draftLayout } as Parameters<typeof update>[2]);
      setIsDirty(false);
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        void handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  if (isLoading && !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  // Derive selected section from id (works at any nesting depth)
  const selectedSection = selectedId ? findSectionById(draftLayout.sections, selectedId) : null;

  return (
    <EditorProvider
      value={{
        isEditorMode: true,
        selectedSectionId: selectedId,
        selectedFieldKey,
        sections: draftLayout.sections,
        onSectionSelect: handleSectionSelect,
        onFieldSelect: handleFieldSelect,
        onSectionReorder: handleTopLevelReorder,
        onAddChild: (parentId, childType) => {
          setAddChildParentId(parentId);
          setShowAddPanel(true);
          void childType; // opened via AddPanel
        },
        onRemoveSection: handleRemoveSection,
        onMoveToContainer: handleMoveToContainer,
        onReorderChildren: handleReorderChildren,
        onPropsChange: handlePropsChange,
        onNameChange: handleNameChange,
      }}
    >
      <div className="flex flex-col bg-[#08080f]" style={{ height: '100dvh', overflow: 'hidden' }}>
        {/* ── Header ─────────────────────────────────────────────── */}
        <header
          className="shrink-0 border-b border-white/5 bg-[#0a0a0f]/95 backdrop-blur-md flex items-center px-3 gap-2 z-40"
          style={{ height: HEADER_H }}
        >
          <button
            onClick={() => navigate(`/dashboard/portfolios/${portfolioId}`)}
            className="p-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <ChevronRight size={12} className="text-slate-700" />
          <span className="text-slate-500 text-sm truncate max-w-[100px]">{portfolio?.title}</span>
          <ChevronRight size={12} className="text-slate-700" />
          <span className="text-white text-sm font-medium truncate max-w-[120px]">{page?.title}</span>

          <div className="flex-1" />

          {isDirty && (
            <span className="text-xs text-amber-400 font-medium animate-pulse hidden sm:block">Unsaved</span>
          )}

          <button
            onClick={() => setShowLeftPanel((p) => !p)}
            title="Toggle left panel"
            className={clsx(
              'p-1.5 rounded-lg transition-all',
              showLeftPanel ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-white hover:bg-white/5',
            )}
          >
            <PanelLeft size={15} />
          </button>

          <button
            onClick={() => { setAddChildParentId(null); setShowAddPanel(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Plus size={14} />
            <span className="hidden md:inline">Add</span>
          </button>

          <button
            onClick={() => setShowRightPanel((p) => !p)}
            title="Toggle right panel"
            className={clsx(
              'p-1.5 rounded-lg transition-all',
              showRightPanel ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-white hover:bg-white/5',
            )}
          >
            <PanelRight size={15} />
          </button>

          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all',
              isDirty
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-lg hover:shadow-indigo-500/25'
                : 'bg-white/5 text-slate-500 cursor-not-allowed',
            )}
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : savedFeedback ? <Check size={14} /> : <Save size={14} />}
            <span className="hidden sm:inline">{isSaving ? 'Saving...' : savedFeedback ? 'Saved!' : 'Save'}</span>
          </button>
        </header>

        {/* ── 3-column body ───────────────────────────────────────── */}
        <div className="flex flex-1 min-h-0" style={{ height: `calc(100dvh - ${HEADER_H}px)` }}>

          {/* LEFT: AI + Layers */}
          {showLeftPanel && (
            <aside
              className="shrink-0 border-r border-white/5 bg-[#0a0a0f] flex flex-col"
              style={{ width: 240 }}
            >
              <div className="flex border-b border-white/5 shrink-0">
                {([
                  { key: 'ai' as LeftTab, label: 'AI', icon: Sparkles },
                  { key: 'sections' as LeftTab, label: 'Layers', icon: Layers },
                ] as const).map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setLeftTab(key)}
                    className={clsx(
                      'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all border-b-2',
                      leftTab === key ? 'text-white border-indigo-500' : 'text-slate-500 border-transparent hover:text-slate-300',
                    )}
                  >
                    <Icon size={13} /> {label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-2">
                {leftTab === 'ai' && portfolioId && pageId && (
                  <AiGeneratePanel
                    portfolioId={portfolioId}
                    pageId={pageId}
                    onLayoutGenerated={handleAiLayout}
                  />
                )}
                {leftTab === 'sections' && (
                  <LayersPanel
                    sections={draftLayout.sections}
                    selectedId={selectedId}
                    onSelect={(id) => {
                      setSelectedId(id);
                      setSelectedFieldKey(null);
                      setShowRightPanel(true);
                    }}
                    onDelete={handleRemoveSection}
                    onAddClick={() => { setAddChildParentId(null); setShowAddPanel(true); }}
                    onAddChild={(parentId) => {
                      setAddChildParentId(parentId);
                      setShowAddPanel(true);
                    }}
                    onReorder={handleTopLevelReorder}
                  />
                )}
              </div>

              <div className="px-3 py-2 border-t border-white/5 text-xs text-slate-700 shrink-0 flex justify-between">
                <span>{draftLayout.sections.length} top-level</span>
                <span>{componentRegistry.getTypes().length} types</span>
              </div>
            </aside>
          )}

          {/* CENTER: Preview */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#08080f]">
            <div className="shrink-0 flex items-center gap-2 px-4 py-2 bg-[#0a0a0f]/90 backdrop-blur-sm border-b border-white/5">
              <span className="text-xs text-slate-600">Preview</span>
              <span className="text-xs text-slate-700 font-mono">{page?.slug}</span>
              <span className="ml-auto text-[10px] text-indigo-400/60 hidden md:block">
                Click to select · Drag ⠿ to reorder · Drag into containers
              </span>
            </div>

            <div className={`flex-1 overflow-y-auto overscroll-contain${draftLayout.sections.length > 0 ? ' editor-canvas-top-pad' : ''}`}>
              {draftLayout.sections.length === 0 ? (
                <EmptyCanvasPrompt
                  onLayoutGenerated={(layout) => { handleAiLayout(layout); }}
                  onAddBlocks={() => setShowAddPanel(true)}
                  portfolioId={portfolioId!}
                  pageId={pageId!}
                />
              ) : (
                <PageRenderer layout={draftLayout} />
              )}
            </div>
          </main>

          {/* RIGHT: Props Editor */}
          {showRightPanel && (
            <aside
              className="shrink-0 border-l border-white/5 bg-[#0a0a0f] flex flex-col"
              style={{ width: 300 }}
            >
              <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-white/5">
                {selectedSection ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <Settings size={13} className="text-indigo-400 shrink-0" />
                    <span className="text-xs font-semibold text-white truncate">
                      {componentRegistry.getEntry(selectedSection.type)?.displayName ?? selectedSection.type}
                    </span>
                    {/* Is this a child block? */}
                    {selectedId && findParent(draftLayout.sections, selectedId)?.parent && (
                      <span className="text-[10px] text-slate-600 font-mono">child</span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-slate-600">No selection</span>
                )}
                <button
                  onClick={() => { setSelectedId(null); setSelectedFieldKey(null); }}
                  className="p-1 rounded text-slate-600 hover:text-white hover:bg-white/5 transition-all shrink-0"
                >
                  <X size={13} />
                </button>
              </div>

              <div ref={rightScrollRef} className="flex-1 overflow-y-auto overscroll-contain p-4">
                {selectedSection ? (
                  <SmartPropEditor
                    key={selectedSection.id}
                    sectionId={selectedSection.id}
                    sectionName={selectedSection.name}
                    sectionType={selectedSection.type}
                    props={selectedSection.props}
                    focusFieldKey={selectedFieldKey}
                    onChange={(newProps) => handlePropsChange(selectedSection.id, newProps)}
                    onNameChange={(name) => handleNameChange(selectedSection.id, name)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-16">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                      <Settings size={20} className="text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">No block selected</p>
                    <p className="text-xs text-slate-700 mt-1">
                      Click any section or block in the preview
                    </p>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>

        {/* Add Panel Modal */}
        {showAddPanel && (
          <AddSectionPanel
            onAdd={handleAddSection}
            onClose={() => { setShowAddPanel(false); setAddChildParentId(null); }}
            addingToContainer={addChildParentId !== null}
          />
        )}
      </div>
    </EditorProvider>
  );
};
