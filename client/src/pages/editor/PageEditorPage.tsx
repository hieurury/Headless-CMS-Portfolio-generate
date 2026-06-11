import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePageStore } from '../../store/pageStore';
import { usePortfolioStore } from '../../store/portfolioStore';
import { PageRenderer } from '../../core/renderer/PageRenderer';
import { EditorProvider } from '../../core/context/EditorContext';
import { FloatingControlPanel } from '../../components/editor/FloatingControlPanel';
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
  PanelLeft, PanelRight, Settings, Eye, PenLine,
} from 'lucide-react';
import clsx from 'clsx';
import { arrayMove } from '@dnd-kit/sortable';
import {
  moveSection,
  reorderChildren,
  removeSection,
  findSectionById,
  addChildToSection,
  replaceSection,
  updateSectionProps,
  updateSectionName,
  findParent,
  insertIntoColumnsCell,
} from '../../core/utils/layoutUtils';
import { makeEmptySlot } from '../../core/renderer/SectionRenderer';

type LeftTab = 'ai' | 'sections';

const HEADER_H = 56;

/** Build the auto-generated default children for container types */
function buildDefaultChildren(_type: string, _props: Record<string, unknown>): LayoutSection[] {
  // Columns: no default children — cells are rendered as empty drop zones directly
  // Split: _column slots are still needed (two halves)
  const entry = componentRegistry.getEntry(_type);
  if (entry?.defaultChildren) {
    return entry.defaultChildren();
  }
  return [];
}

/**
 * Immutably patch a specific section's fields (e.g. children) at any depth.
 * Used to trim Columns children when removing a column.
 */
function patchSection(
  section: LayoutSection,
  targetId: string,
  patch: Partial<LayoutSection>,
): LayoutSection {
  if (!section) return section;
  if (section.id === targetId) return { ...section, ...patch };
  if (!section.children?.length) return section;
  return { ...section, children: section.children.map((c) => patchSection(c, targetId, patch)) };
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

  // ── Preview / Edit mode ────────────────────────────────────────────
  const [previewMode, setPreviewMode] = useState(false);

  // ── Panel state ────────────────────────────────────────────────────
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addChildParentId, setAddChildParentId] = useState<string | null>(null);
  // When non-null, the AddPanel is in "fill slot" mode:
  // the chosen block REPLACES the _empty slot with this id
  const [fillSlotId, setFillSlotId] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<LeftTab>('ai');

  const rightScrollRef = useRef<HTMLDivElement>(null);

  // -- Load ------------------------------------------------------------------
  useEffect(() => {
    if (portfolioId && pageId) {
      fetchOne(portfolioId, pageId);
      fetchPortfolio(portfolioId);
    }
  }, [portfolioId, pageId, fetchOne, fetchPortfolio]);

  // -- Sync draft when page loads ---------------------------------------------
  useEffect(() => {
    if (page) {
      setDraftLayout(page.layout ?? { sections: [] });
      setIsDirty(false);
    }
  }, [page]);

  // -- Immutable layout updater -----------------------------------------------
  const updateLayout = useCallback((updater: (prev: PageLayout) => PageLayout) => {
    setDraftLayout((prev) => updater(prev));
    setIsDirty(true);
  }, []);

  // ── Listen for cms:addEmptySlot — "+" button on container control ──
  // For non-columns containers: adds an _empty placeholder child.
  useEffect(() => {
    const handler = (e: Event) => {
      const { parentId } = (e as CustomEvent<{ parentId: string }>).detail;
      updateLayout((layout) => {
        const slot = makeEmptySlot();
        return {
          ...layout,
          sections: addChildToSection(layout.sections, parentId, slot),
        };
      });
    };
    window.addEventListener('cms:addEmptySlot', handler);
    return () => window.removeEventListener('cms:addEmptySlot', handler);
  }, [updateLayout]);
  // ── Listen for cms:addRowCell
  useEffect(() => {
    const handler = (e: Event) => {
      const { rowsId } = (e as CustomEvent<{ rowsId: string }>).detail;
      updateLayout((layout) => {
        const rowBlock = findSectionById(layout.sections, rowsId);
        if (!rowBlock) return layout;
        const current = Number(rowBlock.props['rows'] ?? 1);
        return {
          ...layout,
          sections: updateSectionProps(layout.sections, rowsId, {
            ...rowBlock.props,
            rows: String(current + 1),
          })
        }
      })
    }
    window.addEventListener('cms:addRowCell', handler);
    return () => window.removeEventListener('cms:addRowCell', handler);
  }, [updateLayout]);
  // ── Listen for cms:removeLastRow
  useEffect(() => {
    const handler = (e: Event) => {
      const { rowsId } = (e as CustomEvent<{ rowsId: string }>).detail;
      updateLayout((layout) => {
        const rowBlock = findSectionById(layout.sections, rowsId);
        if (!rowBlock) return layout;
        const current = Number(rowBlock.props['rows'] ?? 1);
        if (current <= 1) return layout;
        return {
          ...layout,
          sections: updateSectionProps(layout.sections, rowsId, {
            ...rowBlock.props,
            rows: String(current - 1),
          })
        }
      })
    }
    window.addEventListener('cms:removeLastRow', handler);
    return () => window.removeEventListener('cms:removeLastRow', handler);
  }, [updateLayout]);
  // ── Listen for cms:addColCell — "+" on Columns control bar ────────────
  // Increments columns count (adds 1 more empty cell).
  // No child block is added — the new cell is an empty drop zone.
  useEffect(() => {
    const handler = (e: Event) => {
      const { columnsId } = (e as CustomEvent<{ columnsId: string }>).detail;
      updateLayout((layout) => {
        const colBlock = findSectionById(layout.sections, columnsId);
        if (!colBlock) return layout;
        const current = Number(colBlock.props['columns'] ?? 2);
        return {
          ...layout,
          sections: updateSectionProps(layout.sections, columnsId, {
            ...colBlock.props,
            columns: String(current + 1),
          }),
        };
      });
    };
    window.addEventListener('cms:addColCell', handler);
    return () => window.removeEventListener('cms:addColCell', handler);
  }, [updateLayout]);

  // ── Listen for cms:removeLastCol — "−" on Columns control bar ─────────
  // Decrements columns count AND removes the last child if it exists.
  useEffect(() => {
    const handler = (e: Event) => {
      const { columnsId } = (e as CustomEvent<{ columnsId: string }>).detail;
      updateLayout((layout) => {
        const colBlock = findSectionById(layout.sections, columnsId);
        if (!colBlock) return layout;
        const current = Number(colBlock.props['columns'] ?? 2);
        if (current <= 1) return layout; // can't go below 1
        const newCount = current - 1;
        // Remove the last child if it exists at the last index
        const children = colBlock.children ?? [];
        const newChildren = children.length > newCount
          ? children.slice(0, newCount)
          : children;
        // Apply both prop change + children update
        return {
          ...layout,
          sections: updateSectionProps(
            layout.sections.map((s) => patchSection(s, columnsId, { children: newChildren })),
            columnsId,
            { ...colBlock.props, columns: String(newCount) },
          ),
        };
      });
    };
    window.addEventListener('cms:removeLastCol', handler);
    return () => window.removeEventListener('cms:removeLastCol', handler);
  }, [updateLayout]);

  // ── Listen for cms:mergeColCells — merge two adjacent empty columns ───
  // Updates colSpans: combines leftSpan + rightSpan into leftIndex entry,
  // removes rightIndex entry. Decrements column count by 1.
  useEffect(() => {
    const handler = (e: Event) => {
      const { columnsId, leftIndex, newSpan, colSpans: currentSpans } =
        (e as CustomEvent<{ columnsId: string; leftIndex: number; newSpan: number; colSpans: number[] }>).detail;
      updateLayout((layout) => {
        const colBlock = findSectionById(layout.sections, columnsId);
        if (!colBlock) return layout;
        const current = Number(colBlock.props['columns'] ?? 2);
        if (current <= 1) return layout;

        // Build new colSpans: replace [leftIndex] with newSpan, remove [leftIndex+1]
        const newSpans = [...currentSpans];
        newSpans[leftIndex] = newSpan;
        newSpans.splice(leftIndex + 1, 1);

        // Remove any child at leftIndex+1 from children (both are empty, so normally nothing to remove)
        const children = [...(colBlock.children ?? [])];
        if (children[leftIndex + 1] !== undefined) {
          children.splice(leftIndex + 1, 1);
        }

        return {
          ...layout,
          sections: updateSectionProps(
            layout.sections.map((s) => patchSection(s, columnsId, { children })),
            columnsId,
            { ...colBlock.props, columns: String(current - 1), colSpans: newSpans },
          ),
        };
      });
    };
    window.addEventListener('cms:mergeColCells', handler);
    return () => window.removeEventListener('cms:mergeColCells', handler);
  }, [updateLayout]);
  useEffect(() => {
    const rowHandler = (e: Event) => {
      const { rowId, aboveIndex, newSpan, rowSpans: currentSpans } =
        (e as CustomEvent<{ rowId: string; aboveIndex: number; newSpan: number; rowSpans: number[] }>).detail;
      updateLayout((layout) => {
        const rowBlock = findSectionById(layout.sections, rowId);

        if (!rowBlock) return layout;
        const current = Number(rowBlock.props['rows'] ?? 2);

        if (current <= 1) return layout; // can't go below 1
        const newSpans = [...currentSpans]
        newSpans[aboveIndex] = newSpan
        newSpans.splice(aboveIndex + 1, 1)
        // Remove the last child if it exists at the last index
        const children = [...(rowBlock.children ?? [])];
        if (children[aboveIndex + 1] !== undefined) {
          children.splice(aboveIndex + 1, 1);
        }
        // Apply both prop change + children update
        return {
          ...layout,
          sections: updateSectionProps(
            layout.sections.map((s) => patchSection(s, rowId, { children })),
            rowId,
            { ...rowBlock.props, rows: String(current - 1), rowSpans: newSpans },
          ),
        };
      });
    }
    window.addEventListener('cms:mergeRowCells', rowHandler);
    return () => window.removeEventListener('cms:mergeRowCells', rowHandler);
  }, [updateLayout]);
  // ── Listen for cms:splitColCell — split a merged cell back into two ───
  // Splits cell at cellIndex (which has span S) into two cells of span
  // Math.ceil(S/2) and Math.floor(S/2). Increments column count by 1.
  useEffect(() => {
    const handler = (e: Event) => {
      const { columnsId, cellIndex } =
        (e as CustomEvent<{ columnsId: string; cellIndex: number }>).detail;
      updateLayout((layout) => {
        const colBlock = findSectionById(layout.sections, columnsId);
        if (!colBlock) return layout;
        const current = Number(colBlock.props['columns'] ?? 2);
        const rawSpans = colBlock.props['colSpans'] as number[] | undefined;
        const colSpans = Array.isArray(rawSpans) && rawSpans.length === current
          ? [...rawSpans]
          : Array(current).fill(1);

        const cellSpan = colSpans[cellIndex] ?? 1;
        if (cellSpan <= 1) return layout; // already minimum, nothing to split

        // Split: left half = ceil(S/2), right half = floor(S/2)
        const leftSpan = Math.ceil(cellSpan / 2);
        const rightSpan = Math.floor(cellSpan / 2);
        const newSpans = [...colSpans];
        newSpans.splice(cellIndex, 1, leftSpan, rightSpan);

        // Children: insert an empty slot at cellIndex+1
        // (the cell at cellIndex keeps its current child or empty state)
        const children = [...(colBlock.children ?? [])];
        // No child needed at the new right slot — it will render as empty drop zone

        return {
          ...layout,
          sections: updateSectionProps(
            layout.sections.map((s) => patchSection(s, columnsId, { children })),
            columnsId,
            { ...colBlock.props, columns: String(current + 1), colSpans: newSpans },
          ),
        };
      });
    };
    window.addEventListener('cms:splitColCell', handler);
    return () => window.removeEventListener('cms:splitColCell', handler);
  }, [updateLayout]);

  // ── Listen for cms:reorderColCells — drag reorder inside Columns ──────
  // Receives the reordered children AND colSpans arrays from dnd-kit.
  useEffect(() => {
    const handler = (e: Event) => {
      const { columnsId, children, colSpans } =
        (e as CustomEvent<{ columnsId: string; children: LayoutSection[]; colSpans: number[] }>).detail;
      updateLayout((layout) => {
        const colBlock = findSectionById(layout.sections, columnsId);
        if (!colBlock) return layout;
        return {
          ...layout,
          sections: updateSectionProps(
            layout.sections.map((s) => patchSection(s, columnsId, { children })),
            columnsId,
            { ...colBlock.props, colSpans },
          ),
        };
      });
    };
    window.addEventListener('cms:reorderColCells', handler);
    return () => window.removeEventListener('cms:reorderColCells', handler);
  }, [updateLayout]);

  // ── Listen for cms:fillColCell — click on empty column cell ──────────
  // Opens AddPanel; the chosen block is inserted at the specified cell index.
  const [fillColCell, setFillColCell] = useState<{ columnsId: string; cellIndex: number } | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ columnsId: string; cellIndex: number }>).detail;
      setFillColCell(detail);
      setFillSlotId(null);
      setAddChildParentId(null);
      setShowAddPanel(true);
    };
    window.addEventListener('cms:fillColCell', handler);
    return () => window.removeEventListener('cms:fillColCell', handler);
  }, []);

  // ── Listen for cms:fillEmptySlot — click on an empty slot ─────────
  // Opens AddPanel; the chosen block REPLACES the _empty slot.
  useEffect(() => {
    const handler = (e: Event) => {
      const { slotId } = (e as CustomEvent<{ slotId: string }>).detail;
      setFillSlotId(slotId);
      setAddChildParentId(null);
      setShowAddPanel(true);
    };
    window.addEventListener('cms:fillEmptySlot', handler);
    return () => window.removeEventListener('cms:fillEmptySlot', handler);
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
    if (fillColCell) {
      // Insert the block at the specified cell index inside a Columns block
      updateLayout((layout) => ({
        ...layout,
        sections: insertIntoColumnsCell(layout.sections, fillColCell.columnsId, newSection, fillColCell.cellIndex),
      }));
      setSelectedId(newSection.id);
      setFillColCell(null);
    } else if (fillSlotId) {
      // Replace the _empty placeholder with the real block
      updateLayout((layout) => ({
        ...layout,
        sections: replaceSection(layout.sections, fillSlotId, newSection),
      }));
      setSelectedId(newSection.id);
      setFillSlotId(null);
    } else if (addChildParentId) {
      // Append as a child of a container
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
  }, [fillColCell, fillSlotId, addChildParentId, updateLayout, draftLayout.sections]);

  // ── Add template (inject full tree) ───────────────────────────────
  const handleAddTemplate = useCallback((tree: LayoutSection) => {
    if (fillColCell) {
      updateLayout((layout) => ({
        ...layout,
        sections: insertIntoColumnsCell(layout.sections, fillColCell.columnsId, tree, fillColCell.cellIndex),
      }));
      setSelectedId(tree.id);
      setFillColCell(null);
    } else if (fillSlotId) {
      // Replace _empty placeholder with the template root
      updateLayout((layout) => ({
        ...layout,
        sections: replaceSection(layout.sections, fillSlotId, tree),
      }));
      setSelectedId(tree.id);
      setFillSlotId(null);
    } else if (addChildParentId) {
      updateLayout((layout) => ({
        ...layout,
        sections: addChildToSection(layout.sections, addChildParentId, tree),
      }));
      setSelectedId(tree.id);
    } else {
      updateLayout((layout) => ({
        ...layout,
        sections: [...layout.sections, tree],
      }));
      setSelectedId(tree.id);
      setLeftTab('sections');
    }
    setAddChildParentId(null);
    setSelectedFieldKey(null);
    setShowRightPanel(true);
    setTimeout(() => rightScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  }, [fillSlotId, addChildParentId, updateLayout]);

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

  // ── Move a section into a container (or to top level if containerId is null) ──
  const handleMoveToContainer = useCallback((sectionId: string, toContainerId: string | null, toIndex?: number) => {
    updateLayout((layout) => {
      // Special case: dropping into a Columns block cell — use insertIntoColumnsCell
      // so cell indices stay aligned (sparse cells are padded, not shifted)
      if (toContainerId && toIndex !== undefined) {
        const targetBlock = findSectionById(layout.sections, toContainerId);
        if (targetBlock?.type === 'columns') {
          // First remove the block from its current location
          const [withoutBlock, movedBlock] = removeSection(layout.sections, sectionId);
          if (!movedBlock) return layout;
          return {
            ...layout,
            sections: insertIntoColumnsCell(withoutBlock, toContainerId, movedBlock, toIndex),
          };
        }
      }
      return {
        ...layout,
        sections: moveSection(layout.sections, sectionId, toContainerId, toIndex),
      };
    });
  }, [updateLayout]);


  // ── Reorder children within a container ───────────────────────────
  const handleReorderChildren = useCallback((parentId: string, oldIndex: number, newIndex: number) => {
    updateLayout((layout) => ({
      ...layout,
      sections: reorderChildren(layout.sections, parentId, oldIndex, newIndex),
    }));
  }, [updateLayout]);

  // ── Replace an _empty slot with a dragged block ───────────────────────────
  // Called by PageRenderer when a block is dropped onto an _empty slot.
  //
  // Cross-container move:
  //   1. Find the block and note its parent.
  //   2. Swap: put a new _empty slot where the block was.
  //   3. Put the block where the _empty slot was.
  //
  // Same-container move (block and slot are siblings):
  //   Just replace the slot with the block — no new empty slot needed.
  const handleReplaceEmptySlot = useCallback((sectionId: string, slotId: string) => {
    updateLayout((layout) => {
      const movedBlock = findSectionById(layout.sections, sectionId);
      if (!movedBlock) return layout;

      const sourceParent = findParent(layout.sections, sectionId);
      const targetParent = findParent(layout.sections, slotId);

      const sourceParentId = sourceParent?.parent?.id ?? null;
      const targetParentId = targetParent?.parent?.id ?? null;

      const isCrossContainer = sourceParentId !== targetParentId;

      if (isCrossContainer) {
        // Step 1: replace block at old position with a new _empty slot
        const newSlot = makeEmptySlot();
        const withSlotAtSource = replaceSection(layout.sections, sectionId, newSlot);
        // Step 2: replace target empty slot with the block
        const final = replaceSection(withSlotAtSource, slotId, movedBlock);
        return { ...layout, sections: final };
      } else {
        // Same container: simply remove slot and put block there
        const [withoutBlock] = removeSection(layout.sections, sectionId);
        const final = replaceSection(withoutBlock, slotId, movedBlock);
        return { ...layout, sections: final };
      }
    });
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
        previewMode,
        selectedSectionId: selectedId,
        selectedFieldKey,
        sections: draftLayout.sections,
        onSectionSelect: handleSectionSelect,
        onFieldSelect: handleFieldSelect,
        onTogglePreviewMode: () => setPreviewMode((p) => !p),
        onSectionReorder: handleTopLevelReorder,
        onAddChild: (parentId, childType) => {
          setAddChildParentId(parentId);
          setShowAddPanel(true);
          void childType; // opened via AddPanel
        },
        onRemoveSection: handleRemoveSection,
        onMoveToContainer: handleMoveToContainer,
        onReorderChildren: handleReorderChildren,
        onReplaceEmptySlot: handleReplaceEmptySlot,
        onPropsChange: handlePropsChange,
        onNameChange: handleNameChange,
      }}
    >
      {/* ── Floating control panel (global, fixed-position) ──────── */}
      {!previewMode && <FloatingControlPanel />}

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

          {/* ── Preview / Edit Mode Toggle ─────────────────────────────── */}
          <div className="flex items-center rounded-lg border border-white/10 overflow-hidden bg-white/3">
            <button
              onClick={() => setPreviewMode(false)}
              title="Edit mode — click elements to edit inline"
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-all',
                !previewMode
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white',
              )}
            >
              <PenLine size={13} />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={() => setPreviewMode(true)}
              title="Preview mode — links and interactions work normally"
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-all',
                previewMode
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white',
              )}
            >
              <Eye size={13} />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>
          <button
            onClick={() => { setAddChildParentId(null); setShowAddPanel(true); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium transition-all"
          >
            <Plus size={11} /> Add
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
          {showLeftPanel && !previewMode && (
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
                    onReorderChildren={handleReorderChildren}
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
              <span className="text-xs text-slate-600">{previewMode ? '👁 Preview' : '✏ Editor'}</span>
              <span className="text-xs text-slate-700 font-mono">{page?.slug}</span>
            </div>

            <div className={`flex-1 overflow-y-auto overscroll-contain editor-preview-container${draftLayout.sections.length > 0 ? ' editor-canvas-top-pad' : ''}`}>
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
          {showRightPanel && !previewMode && (
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
                      Click any block in the preview to edit
                    </p>
                    <p className="text-xs text-indigo-400/50 mt-3 text-center leading-relaxed">
                      ✏ Click text or images<br />directly in the preview
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
            onAddTemplate={handleAddTemplate}
            onClose={() => { setShowAddPanel(false); setAddChildParentId(null); setFillSlotId(null); setFillColCell(null); }}
            addingToContainer={addChildParentId !== null || fillSlotId !== null || fillColCell !== null}
          />
        )}
      </div>
    </EditorProvider>
  );
};
