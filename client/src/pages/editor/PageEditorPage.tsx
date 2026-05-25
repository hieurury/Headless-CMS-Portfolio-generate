import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePageStore } from '../../store/pageStore';
import { usePortfolioStore } from '../../store/portfolioStore';
import { PageRenderer } from '../../core/renderer/PageRenderer';
import { SectionList } from './components/SectionList';
import { AddSectionPanel } from './components/AddSectionPanel';
import { PropEditor } from './components/PropEditor';
import { AiGeneratePanel } from './components/AiGeneratePanel';
import type { LayoutSection, PageLayout } from '../../core/types/layout.types';
import { componentRegistry } from '../../core/registry/ComponentRegistry';
import {
  Save, ArrowLeft, Eye, EyeOff, Sparkles, Layers,
  Loader2, Check, ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';

type LeftTab = 'ai' | 'sections';


export const PageEditorPage: React.FC = () => {
  const { portfolioId, pageId } = useParams<{ portfolioId: string; pageId: string }>();
  const navigate = useNavigate();

  const { current: page, fetchOne, update, isLoading } = usePageStore();
  const { current: portfolio, fetchOne: fetchPortfolio } = usePortfolioStore();

  // ── Local draft state ────────────────────────────────────────────────
  const [draftLayout, setDraftLayout] = useState<PageLayout>({ sections: [] });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [leftTab, setLeftTab] = useState<LeftTab>('ai');

  // ── Load page on mount ──────────────────────────────────────────────
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

  // ── Layout mutation helpers ─────────────────────────────────────────
  const updateLayout = useCallback((updater: (l: PageLayout) => PageLayout) => {
    setDraftLayout((prev) => updater(prev));
    setIsDirty(true);
  }, []);

  const handleAddSection = (type: string) => {
    updateLayout((layout) => ({
      ...layout,
      sections: [
        ...layout.sections,
        {
          id: `section-${type}-${Date.now()}`,
          type,
          props: {},
          children: [],
        },
      ],
    }));
    setSelectedIndex(draftLayout.sections.length); // select new
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    updateLayout((layout) => {
      const sections = [...layout.sections];
      [sections[index - 1], sections[index]] = [sections[index], sections[index - 1]];
      return { ...layout, sections };
    });
    setSelectedIndex(index - 1);
  };

  const handleMoveDown = (index: number) => {
    updateLayout((layout) => {
      if (index >= layout.sections.length - 1) return layout;
      const sections = [...layout.sections];
      [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
      return { ...layout, sections };
    });
    setSelectedIndex(index + 1);
  };

  const handleDelete = (index: number) => {
    updateLayout((layout) => ({
      ...layout,
      sections: layout.sections.filter((_, i) => i !== index),
    }));
    setSelectedIndex(null);
  };

  const handlePropsChange = (index: number, newProps: Record<string, unknown>) => {
    updateLayout((layout) => ({
      ...layout,
      sections: layout.sections.map((s, i) =>
        i === index ? { ...s, props: newProps } : s,
      ),
    }));
  };

  const handleAiLayout = (layout: PageLayout) => {
    setDraftLayout(layout);
    setIsDirty(true);
    setSelectedIndex(null);
    setLeftTab('sections');
  };

  // ── Save ────────────────────────────────────────────────────────────
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

  // ── Keyboard shortcut Ctrl+S ────────────────────────────────────────
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

  const selectedSection: LayoutSection | null =
    selectedIndex !== null ? draftLayout.sections[selectedIndex] ?? null : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#08080f]">
      {/* ─── Top Bar ─────────────────────────────────────────────────── */}
      <header className="h-14 border-b border-white/5 bg-[#0a0a0f]/95 backdrop-blur-md flex items-center px-4 gap-3 shrink-0 z-40 sticky top-0">
        {/* Back breadcrumb */}
        <button
          onClick={() => navigate(`/dashboard/portfolios/${portfolioId}`)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft size={15} />
        </button>
        <ChevronRight size={13} className="text-slate-700" />
        <span className="text-slate-500 text-sm truncate max-w-[120px]">{portfolio?.title}</span>
        <ChevronRight size={13} className="text-slate-700" />
        <span className="text-white text-sm font-medium truncate max-w-[120px]">{page?.title}</span>

        <div className="flex-1" />

        {/* Dirty indicator */}
        {isDirty && (
          <span className="text-xs text-amber-400 font-medium animate-pulse">
            Unsaved changes
          </span>
        )}

        {/* Preview toggle */}
        <button
          onClick={() => setShowPreview((p) => !p)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
          <span className="hidden sm:inline">{showPreview ? 'Hide' : 'Show'} Preview</span>
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className={clsx(
            'flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all',
            isDirty
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-lg hover:shadow-indigo-500/25'
              : 'bg-white/5 text-slate-500 cursor-not-allowed',
          )}
        >
          {isSaving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : savedFeedback ? (
            <Check size={14} />
          ) : (
            <Save size={14} />
          )}
          {isSaving ? 'Saving...' : savedFeedback ? 'Saved!' : 'Save'}
        </button>
      </header>

      {/* ─── Main Editor Area ─────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel ──────────────────────────────────────────────── */}
        <aside className="w-[360px] shrink-0 border-r border-white/5 bg-[#0a0a0f] flex flex-col overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-white/5 shrink-0">
            {([
              { key: 'ai' as LeftTab, label: 'AI Generate', icon: Sparkles },
              { key: 'sections' as LeftTab, label: 'Sections', icon: Layers },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setLeftTab(key)}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-all border-b-2',
                  leftTab === key
                    ? 'text-white border-indigo-500'
                    : 'text-slate-500 border-transparent hover:text-slate-300',
                )}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {leftTab === 'ai' && portfolioId && pageId && (
              <AiGeneratePanel
                portfolioId={portfolioId}
                pageId={pageId}
                onLayoutGenerated={handleAiLayout}
              />
            )}

            {leftTab === 'sections' && (
              <>
                <SectionList
                  sections={draftLayout.sections}
                  selectedIndex={selectedIndex}
                  onSelect={setSelectedIndex}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onDelete={handleDelete}
                  onAddClick={() => setShowAddPanel(true)}
                />

                {/* Prop editor for selected section */}
                {selectedSection && selectedIndex !== null && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <PropEditor
                      key={selectedSection.id}
                      props={selectedSection.props}
                      sectionType={selectedSection.type}
                      onChange={(newProps) =>
                        handlePropsChange(selectedIndex, newProps)
                      }
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Section count footer */}
          <div className="px-4 py-3 border-t border-white/5 text-xs text-slate-600 shrink-0">
            {draftLayout.sections.length} section{draftLayout.sections.length !== 1 ? 's' : ''} · {componentRegistry.getTypes().length} components registered
          </div>
        </aside>

        {/* ── Right: Live Preview ────────────────────────────────────── */}
        {showPreview && (
          <main className="flex-1 overflow-y-auto bg-[#0a0a0f] relative">
            {/* Preview label */}
            <div className="sticky top-0 z-10 flex items-center gap-2 px-4 py-2 bg-[#0a0a0f]/90 backdrop-blur-sm border-b border-white/5">
              <Eye size={13} className="text-slate-500" />
              <span className="text-xs text-slate-500">Live Preview</span>
              <span className="text-xs text-slate-700">·</span>
              <span className="text-xs text-slate-700 font-mono">{page?.slug}</span>
            </div>

            <PageRenderer layout={draftLayout} />

            {draftLayout.sections.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-8">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                  <Sparkles size={28} className="text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-300 mb-2">Empty canvas</h3>
                <p className="text-slate-500 text-sm max-w-xs">
                  Use <span className="text-violet-400 font-medium">AI Generate</span> to create a full layout from a prompt, or <span className="text-indigo-400 font-medium">Add sections</span> manually.
                </p>
              </div>
            )}
          </main>
        )}
      </div>

      {/* Add Section Modal */}
      {showAddPanel && (
        <AddSectionPanel
          onAdd={handleAddSection}
          onClose={() => setShowAddPanel(false)}
        />
      )}
    </div>
  );
};
