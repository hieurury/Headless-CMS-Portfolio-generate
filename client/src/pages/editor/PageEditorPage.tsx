import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePageStore } from '../../store/pageStore';
import { usePortfolioStore } from '../../store/portfolioStore';
import { useUIStore } from '../../store/uiStore';
import { t } from '../../i18n';
import { EditorProvider } from '../../core/context/EditorContext';
import type { PendingUpload } from '../../core/context/EditorContext';
import api from '../../services/api';
import { FloatingControlPanel } from '../../components/editor/FloatingControlPanel';
import { PageRenderer } from '../../core/renderer/PageRenderer';
import { LayersPanel } from './components/LayersPanel';
import { AddSectionPanel } from './components/AddSectionPanel';
import { SmartPropEditor } from './components/SmartPropEditor';
import { AiGeneratePanel } from './components/AiGeneratePanel';
import { SeoSettingsPanel } from './components/SeoSettingsPanel';
import { EmptyCanvasPrompt } from './components/EmptyCanvasPrompt';
import { BlockContextMenu } from './components/BlockContextMenu';
import type { ContextMenuState } from './components/BlockContextMenu';
import type { LayoutSection, PageLayout } from '../../core/types/layout.types';
import { componentRegistry } from '../../core/registry/ComponentRegistry';
import {
  Save,
  ArrowLeft,
  Sparkles,
  Layers,
  Loader2,
  Check,
  ChevronRight,
  Plus,
  X,
  PanelLeft,
  PanelRight,
  Settings,
  Eye,
  PenLine,
  Globe,
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
  insertIntoRowsCell,
  insertIntoFlexCell,
  cloneSection,
  insertSectionAfter,
} from '../../core/utils/layoutUtils';
import { makeEmptySlot } from '../../core/renderer/SectionRenderer';

type LeftTab = 'sections' | 'settings';

const HEADER_H = 56;

/** Build the auto-generated default children for container types */
function buildDefaultChildren(
  _type: string,
  _props: Record<string, unknown>,
): LayoutSection[] {
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
  return {
    ...section,
    children: section.children.map((c) => patchSection(c, targetId, patch)),
  };
}

export const PageEditorPage: React.FC = () => {
  const { portfolioId, pageId } = useParams<{
    portfolioId: string;
    pageId: string;
  }>();
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

  // Global pending uploads
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);

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
  const [leftTab, setLeftTab] = useState<LeftTab>('sections');

  // ── AI Panel state ─────────────────────────────────────────
  const [showAiPanel, setShowAiPanel] = useState(false);
  // aiPanelBasis: % of total body width the AI pane occupies
  // default 30% (7/3 ratio), min 20% (8/2), max 50% (5/5)
  const [aiPanelBasis, setAiPanelBasis] = useState(30);
  const aiDragRef = useRef<{ startX: number; startBasis: number; bodyWidth: number } | null>(null);
  const bodyRowRef = useRef<HTMLDivElement | null>(null);

  // ── Context Menu state ──────────────────────────────────────────────
  const [contextMenuState, setContextMenuState] = useState<ContextMenuState | null>(null);

  const { language, toggleLanguage } = useUIStore();
  const tr = t(language).editor;

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
      const layout = page.layout ?? { sections: [] };
      setDraftLayout(layout);
      setIsDirty(false);
      if (layout.sections.length === 0) {
        setShowLeftPanel(false);
        setShowRightPanel(false);
      } else {
        setShowLeftPanel(true);
        setShowRightPanel(true);
      }
    }
  }, [page]);

  // -- Immutable layout updater -----------------------------------------------
  const updateLayout = useCallback(
    (updater: (prev: PageLayout) => PageLayout) => {
      setDraftLayout((prev) => updater(prev));
      setIsDirty(true);
    },
    [],
  );

  // -- Scroll Preview to Selected Block ---------------------------------------
  useEffect(() => {
    if (selectedId && !previewMode) {
      const t = setTimeout(() => {
        const el = document.getElementById(selectedId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
      return () => clearTimeout(t);
    }
  }, [selectedId, previewMode]);

  // ── Listen for cms:openContextMenu ────────────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ContextMenuState>).detail;
      console.log('[PageEditorPage] Received cms:openContextMenu', detail);
      setContextMenuState(detail);
      // Ensure we select the section so properties update in real-time correctly
      if (detail.sectionId !== selectedId) {
        setSelectedId(detail.sectionId);
      }
    };
    window.addEventListener('cms:openContextMenu', handler);
    return () => window.removeEventListener('cms:openContextMenu', handler);
  }, [selectedId]);

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
  // ── Listen for cms:removeLastRow
  useEffect(() => {
    const handler = (e: Event) => {
      const { rowsId } = (e as CustomEvent<{ rowsId: string }>).detail;
      updateLayout((layout) => {
        const rowBlock = findSectionById(layout.sections, rowsId);
        if (!rowBlock) return layout;
        const current = Number(rowBlock.props['rows'] ?? 2);
        if (current <= 1) return layout;
        const newCount = current - 1;
        // Also remove the last child so it doesn’t reappear on next add
        const children = rowBlock.children ?? [];
        const newChildren =
          children.length > newCount ? children.slice(0, newCount) : children;
        return {
          ...layout,
          sections: updateSectionProps(
            layout.sections.map((s) =>
              patchSection(s, rowsId, { children: newChildren }),
            ),
            rowsId,
            { ...rowBlock.props, rows: String(newCount) },
          ),
        };
      });
    };
    window.addEventListener('cms:removeLastRow', handler);
    return () => window.removeEventListener('cms:removeLastRow', handler);
  }, [updateLayout]);

  // ── Listen for cms:addRowCell — "+" on Rows control bar ──────────────
  // Increments rows count by 1. No child added — new row is an empty drop zone.
  // IMPORTANT: also append 1 to rowSpans so its length stays in sync with `rows`.
  // Without this, RowsGridRenderer detects length mismatch and resets ALL spans to 1,
  // causing merged cells to lose their span value.
  useEffect(() => {
    const handler = (e: Event) => {
      const { rowsId } = (e as CustomEvent<{ rowsId: string }>).detail;
      updateLayout((layout) => {
        const rowBlock = findSectionById(layout.sections, rowsId);
        if (!rowBlock) return layout;
        const current = Number(rowBlock.props['rows'] ?? 1);
        const rawSpans = rowBlock.props['rowSpans'] as number[] | undefined;
        // Preserve existing spans; append 1 for the new empty row
        const existingSpans: number[] =
          Array.isArray(rawSpans) && rawSpans.length === current
            ? rawSpans
            : Array(current).fill(1);
        const newRowSpans = [...existingSpans, 1];
        return {
          ...layout,
          sections: updateSectionProps(layout.sections, rowsId, {
            ...rowBlock.props,
            rows: String(current + 1),
            rowSpans: newRowSpans,
          }),
        };
      });
    };
    window.addEventListener('cms:addRowCell', handler);
    return () => window.removeEventListener('cms:addRowCell', handler);
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
        const newChildren =
          children.length > newCount ? children.slice(0, newCount) : children;
        // Apply both prop change + children update
        return {
          ...layout,
          sections: updateSectionProps(
            layout.sections.map((s) =>
              patchSection(s, columnsId, { children: newChildren }),
            ),
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
      const {
        columnsId,
        leftIndex,
        newSpan,
        colSpans: currentSpans,
      } = (
        e as CustomEvent<{
          columnsId: string;
          leftIndex: number;
          newSpan: number;
          colSpans: number[];
        }>
      ).detail;
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
            layout.sections.map((s) =>
              patchSection(s, columnsId, { children }),
            ),
            columnsId,
            {
              ...colBlock.props,
              columns: String(current - 1),
              colSpans: newSpans,
            },
          ),
        };
      });
    };
    window.addEventListener('cms:mergeColCells', handler);
    return () => window.removeEventListener('cms:mergeColCells', handler);
  }, [updateLayout]);
  useEffect(() => {
    const rowHandler = (e: Event) => {
      const {
        rowId,
        aboveIndex,
        newSpan,
        rowSpans: currentSpans,
      } = (
        e as CustomEvent<{
          rowId: string;
          aboveIndex: number;
          newSpan: number;
          rowSpans: number[];
        }>
      ).detail;
      updateLayout((layout) => {
        const rowBlock = findSectionById(layout.sections, rowId);

        if (!rowBlock) return layout;
        const current = Number(rowBlock.props['rows'] ?? 2);

        if (current <= 1) return layout; // can't go below 1
        const newSpans = [...currentSpans];
        newSpans[aboveIndex] = newSpan;
        newSpans.splice(aboveIndex + 1, 1);
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
            {
              ...rowBlock.props,
              rows: String(current - 1),
              rowSpans: newSpans,
            },
          ),
        };
      });
    };
    window.addEventListener('cms:mergeRowCells', rowHandler);
    return () => window.removeEventListener('cms:mergeRowCells', rowHandler);
  }, [updateLayout]);
  // ── Listen for cms:splitColCell — split a merged cell back into two ───
  // Splits cell at cellIndex (which has span S) into two cells of span
  // Math.ceil(S/2) and Math.floor(S/2). Increments column count by 1.
  useEffect(() => {
    const handler = (e: Event) => {
      const { columnsId, cellIndex } = (
        e as CustomEvent<{ columnsId: string; cellIndex: number }>
      ).detail;
      updateLayout((layout) => {
        const colBlock = findSectionById(layout.sections, columnsId);
        if (!colBlock) return layout;
        const current = Number(colBlock.props['columns'] ?? 2);
        const rawSpans = colBlock.props['colSpans'] as number[] | undefined;
        const colSpans =
          Array.isArray(rawSpans) && rawSpans.length === current
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
            layout.sections.map((s) =>
              patchSection(s, columnsId, { children }),
            ),
            columnsId,
            {
              ...colBlock.props,
              columns: String(current + 1),
              colSpans: newSpans,
            },
          ),
        };
      });
    };
    window.addEventListener('cms:splitColCell', handler);
    return () => window.removeEventListener('cms:splitColCell', handler);
  }, [updateLayout]);

  // ── Listen for cms:splitRowCell — split a merged cell back into two ───
  useEffect(() => {
    const handler = (e: Event) => {
      const { rowId, cellIndex } = (
        e as CustomEvent<{ rowId: string; cellIndex: number }>
      ).detail;
      updateLayout((layout) => {
        const rowBlock = findSectionById(layout.sections, rowId);
        if (!rowBlock) return layout;
        const current = Number(rowBlock.props['rows'] ?? 2);
        const rawSpans = rowBlock.props['rowSpans'] as number[] | undefined;
        const rowSpans =
          Array.isArray(rawSpans) && rawSpans.length === current
            ? [...rawSpans]
            : Array(current).fill(1);

        const cellSpan = rowSpans[cellIndex] ?? 1;
        if (cellSpan <= 1) return layout;

        const leftSpan = Math.ceil(cellSpan / 2);
        const rightSpan = Math.floor(cellSpan / 2);
        const newSpans = [...rowSpans];
        newSpans.splice(cellIndex, 1, leftSpan, rightSpan);

        const children = [...(rowBlock.children ?? [])];

        return {
          ...layout,
          sections: updateSectionProps(
            layout.sections.map((s) => patchSection(s, rowId, { children })),
            rowId,
            {
              ...rowBlock.props,
              rows: String(current + 1),
              rowSpans: newSpans,
            },
          ),
        };
      });
    };
    window.addEventListener('cms:splitRowCell', handler);
    return () => window.removeEventListener('cms:splitRowCell', handler);
  }, [updateLayout]);

  // ── Listen for cms:reorderRowCells — drag reorder inside Rows ──────
  useEffect(() => {
    const handler = (e: Event) => {
      const { rowId, children, rowSpans } = (
        e as CustomEvent<{
          rowId: string;
          children: LayoutSection[];
          rowSpans: number[];
        }>
      ).detail;
      updateLayout((layout) => {
        const rowBlock = findSectionById(layout.sections, rowId);
        if (!rowBlock) return layout;
        return {
          ...layout,
          sections: updateSectionProps(
            layout.sections.map((s) => patchSection(s, rowId, { children })),
            rowId,
            { ...rowBlock.props, rowSpans },
          ),
        };
      });
    };
    window.addEventListener('cms:reorderRowCells', handler);
    return () => window.removeEventListener('cms:reorderRowCells', handler);
  }, [updateLayout]);

  // ── Listen for cms:reorderColCells — drag reorder inside Columns ──────
  // Receives the reordered children AND colSpans arrays from dnd-kit.
  useEffect(() => {
    const handler = (e: Event) => {
      const { columnsId, children, colSpans } = (
        e as CustomEvent<{
          columnsId: string;
          children: LayoutSection[];
          colSpans: number[];
        }>
      ).detail;
      updateLayout((layout) => {
        const colBlock = findSectionById(layout.sections, columnsId);
        if (!colBlock) return layout;
        return {
          ...layout,
          sections: updateSectionProps(
            layout.sections.map((s) =>
              patchSection(s, columnsId, { children }),
            ),
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
  const [fillColCell, setFillColCell] = useState<{
    columnsId: string;
    cellIndex: number;
  } | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (
        e as CustomEvent<{ columnsId: string; cellIndex: number }>
      ).detail;
      setFillColCell(detail);
      setFillSlotId(null);
      setAddChildParentId(null);
      setShowAddPanel(true);
    };
    window.addEventListener('cms:fillColCell', handler);
    return () => window.removeEventListener('cms:fillColCell', handler);
  }, []);

  const [fillRowCell, setFillRowCell] = useState<{
    rowId: string;
    cellIndex: number;
  } | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ rowId: string; cellIndex: number }>)
        .detail;
      setFillRowCell(detail);
      setFillColCell(null);
      setFillSlotId(null);
      setAddChildParentId(null);
      setShowAddPanel(true);
    };
    window.addEventListener('cms:fillRowCell', handler);
    return () => window.removeEventListener('cms:fillRowCell', handler);
  }, []);

  // ── Listen for cms:fillFlexCell — click on empty flex cell ───────────
  const [fillFlexCell, setFillFlexCell] = useState<{
    flexId: string;
    cellIndex: number;
  } | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ flexId: string; cellIndex: number }>)
        .detail;
      setFillFlexCell(detail);
      setFillColCell(null);
      setFillRowCell(null);
      setFillSlotId(null);
      setAddChildParentId(null);
      setShowAddPanel(true);
    };
    window.addEventListener('cms:fillFlexCell', handler);
    return () => window.removeEventListener('cms:fillFlexCell', handler);
  }, []);

  // ── Listen for cms:reorderFlexCells — drag reorder inside Flex ──────
  useEffect(() => {
    const handler = (e: Event) => {
      const { flexId, children } = (
        e as CustomEvent<{ flexId: string; children: LayoutSection[] }>
      ).detail;
      updateLayout((layout) => {
        const flexBlock = findSectionById(layout.sections, flexId);
        if (!flexBlock) return layout;
        return {
          ...layout,
          sections: layout.sections.map((s) =>
            patchSection(s, flexId, { children }),
          ),
        };
      });
    };
    window.addEventListener('cms:reorderFlexCells', handler);
    return () => window.removeEventListener('cms:reorderFlexCells', handler);
  }, [updateLayout]);

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
  const handleAddSection = useCallback(
    (type: string) => {
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
          sections: insertIntoColumnsCell(
            layout.sections,
            fillColCell.columnsId,
            newSection,
            fillColCell.cellIndex,
          ),
        }));
        setSelectedId(newSection.id);
        setFillColCell(null);
      } else if (fillRowCell) {
        updateLayout((layout) => ({
          ...layout,
          sections: insertIntoRowsCell(
            layout.sections,
            fillRowCell.rowId,
            newSection,
            fillRowCell.cellIndex,
          ),
        }));
        setSelectedId(newSection.id);
        setFillRowCell(null);
      } else if (fillFlexCell) {
        updateLayout((layout) => ({
          ...layout,
          sections: insertIntoFlexCell(
            layout.sections,
            fillFlexCell.flexId,
            newSection,
            fillFlexCell.cellIndex,
          ),
        }));
        setSelectedId(newSection.id);
        setFillFlexCell(null);
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
          sections: addChildToSection(
            layout.sections,
            addChildParentId,
            newSection,
          ),
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
      setTimeout(
        () => rightScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }),
        100,
      );
    },
    [
      fillColCell,
      fillRowCell,
      fillFlexCell,
      fillSlotId,
      addChildParentId,
      updateLayout,
      draftLayout.sections,
    ],
  );

  // ── Add template (inject full tree) ───────────────────────────────
  const handleAddTemplate = useCallback(
    (tree: LayoutSection) => {
      if (fillColCell) {
        updateLayout((layout) => ({
          ...layout,
          sections: insertIntoColumnsCell(
            layout.sections,
            fillColCell.columnsId,
            tree,
            fillColCell.cellIndex,
          ),
        }));
        setSelectedId(tree.id);
        setFillColCell(null);
      } else if (fillRowCell) {
        updateLayout((layout) => ({
          ...layout,
          sections: insertIntoRowsCell(
            layout.sections,
            fillRowCell.rowId,
            tree,
            fillRowCell.cellIndex,
          ),
        }));
        setSelectedId(tree.id);
        setFillRowCell(null);
      } else if (fillFlexCell) {
        updateLayout((layout) => ({
          ...layout,
          sections: insertIntoFlexCell(
            layout.sections,
            fillFlexCell.flexId,
            tree,
            fillFlexCell.cellIndex,
          ),
        }));
        setSelectedId(tree.id);
        setFillFlexCell(null);
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
      setTimeout(
        () => rightScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }),
        100,
      );
    },
    [fillSlotId, fillFlexCell, addChildParentId, updateLayout],
  );

  // ── Top-level reorder ──────────────────────────────────────────────
  const handleTopLevelReorder = useCallback(
    (oldIndex: number, newIndex: number) => {
      updateLayout((layout) => ({
        ...layout,
        sections: arrayMove(layout.sections, oldIndex, newIndex),
      }));
    },
    [updateLayout],
  );

  // ── Remove any section (by id, any depth) ─────────────────────────
  const handleRemoveSection = useCallback(
    (sectionId: string) => {
      updateLayout((layout) => {
        const [newSections] = removeSection(layout.sections, sectionId);
        return { ...layout, sections: newSections };
      });
      setSelectedId((prev) => (prev === sectionId ? null : prev));
    },
    [updateLayout],
  );

  // ── Paste a section ───────────────────────────────────────────────────
  const handlePasteSection = useCallback(
    (targetId: string, sectionToPaste: LayoutSection) => {
      const newSection = cloneSection(sectionToPaste);
      updateLayout((layout) => {
        const newSections = insertSectionAfter(layout.sections, targetId, newSection);
        return { ...layout, sections: newSections };
      });
      setSelectedId(newSection.id);
    },
    [updateLayout],
  );

  // ── Move a section into a container (or to top level if containerId is null) ──
  const handleMoveToContainer = useCallback(
    (sectionId: string, toContainerId: string | null, toIndex?: number) => {
      updateLayout((layout) => {
        // Special case: dropping into a Columns block cell — use insertIntoColumnsCell
        // so cell indices stay aligned (sparse cells are padded, not shifted)
        if (toContainerId && toIndex !== undefined) {
          const targetBlock = findSectionById(layout.sections, toContainerId);
          if (targetBlock?.type === 'columns') {
            // First remove the block from its current location
            const [withoutBlock, movedBlock] = removeSection(
              layout.sections,
              sectionId,
            );
            if (!movedBlock) return layout;
            return {
              ...layout,
              sections: insertIntoColumnsCell(
                withoutBlock,
                toContainerId,
                movedBlock,
                toIndex,
              ),
            };
          } else if (targetBlock?.type === 'rows') {
            const [withoutBlock, movedBlock] = removeSection(
              layout.sections,
              sectionId,
            );
            if (!movedBlock) return layout;
            return {
              ...layout,
              sections: insertIntoRowsCell(
                withoutBlock,
                toContainerId,
                movedBlock,
                toIndex,
              ),
            };
          }
        }
        return {
          ...layout,
          sections: moveSection(
            layout.sections,
            sectionId,
            toContainerId,
            toIndex,
          ),
        };
      });
    },
    [updateLayout],
  );

  // ── Reorder children within a container ───────────────────────────
  const handleReorderChildren = useCallback(
    (parentId: string, oldIndex: number, newIndex: number) => {
      updateLayout((layout) => ({
        ...layout,
        sections: reorderChildren(
          layout.sections,
          parentId,
          oldIndex,
          newIndex,
        ),
      }));
    },
    [updateLayout],
  );

  // ── Replace an _empty slot with a dragged block ───────────────────────────
  // Called by PageRenderer (or LayersPanel) when a block is dropped onto an _empty slot.
  // We simply remove the block from its old location and put it where the slot was.
  const handleReplaceEmptySlot = useCallback(
    (sectionId: string, slotId: string) => {
      updateLayout((layout) => {
        const [withoutBlock, movedBlockOut] = removeSection(
          layout.sections,
          sectionId,
        );
        if (!movedBlockOut) return layout;

        const final = replaceSection(withoutBlock, slotId, movedBlockOut);
        return { ...layout, sections: final };
      });
    },
    [updateLayout],
  );

  // ── Props change (by section id, any depth) ───────────────────────
  const handlePropsChange = useCallback(
    (sectionId: string, newProps: Record<string, unknown>) => {
      updateLayout((layout) => ({
        ...layout,
        sections: updateSectionProps(layout.sections, sectionId, newProps),
      }));
    },
    [updateLayout],
  );

  // ── Name change (by section id, any depth) ────────────────────────
  const handleNameChange = useCallback(
    (sectionId: string, name: string) => {
      updateLayout((layout) => ({
        ...layout,
        sections: updateSectionName(layout.sections, sectionId, name),
      }));
    },
    [updateLayout],
  );

  // ── AI layout replace ─────────────────────────────────────────────
  const handleAiLayout = (layout: PageLayout) => {
    setDraftLayout(layout);
    setIsDirty(true);
    setSelectedId(null);
    setSelectedFieldKey(null);
    setLeftTab('sections');
    setShowLeftPanel(true);
    setShowRightPanel(true);
  };

  // ── Selection from preview ─────────────────────────────────────────
  const handleSectionSelect = useCallback((id: string) => {
    setSelectedId(id);
    setSelectedFieldKey(null);
    setShowRightPanel(true);
    setTimeout(
      () => rightScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }),
      80,
    );
  }, []);

  const handleFieldSelect = useCallback(
    (sectionId: string, fieldKey: string) => {
      setSelectedId(sectionId);
      setSelectedFieldKey(fieldKey);
      setShowRightPanel(true);
    },
    [],
  );

  // ── Save ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!portfolioId || !pageId || (!isDirty && pendingUploads.length === 0)) return;
    setIsSaving(true);
    try {
      let finalLayout = { ...draftLayout };

      // Upload any pending files first
      if (pendingUploads.length > 0) {
        for (const upload of pendingUploads) {
          const formData = new FormData();
          formData.append('file', upload.file);

          try {
            const { data } = await api.post<{ url: string; publicId: string }>(
              '/upload/image',
              formData,
              { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            // Update layout with the new URL
            const fieldKey = upload.fieldKey || 'url';
            finalLayout = {
              ...finalLayout,
              sections: updateSectionProps(finalLayout.sections, upload.sectionId, { [fieldKey]: data.url })
            };
          } catch (err) {
            console.error('Failed to upload image for section', upload.sectionId, err);
          }
        }
      }

      await update(portfolioId, pageId, { layout: finalLayout } as Parameters<typeof update>[2]);
      setPendingUploads([]);
      setDraftLayout(finalLayout);
      setIsDirty(false);
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2000);
    } catch (err) {
      console.error(err);
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
        <Loader2
          size={36}
          className="animate-spin text-[var(--color-text)] font-semibold"
        />
      </div>
    );
  }

  // Derive selected section from id (works at any nesting depth)
  const selectedSection = selectedId
    ? findSectionById(draftLayout.sections, selectedId)
    : null;

  return (
    <>
      {/* ── Outer grid: Editor | divider | AI Panel ─────────────────── */}
      <div
        ref={bodyRowRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          display: 'grid',
          gridTemplateColumns: showAiPanel
            ? `${100 - aiPanelBasis}fr 6px ${aiPanelBasis}fr`
            : '1fr 0px 0px',
          transition: 'grid-template-columns 0.25s ease',
          overflow: 'hidden',
          background: 'var(--color-bg)',
        }}
      >
        {/* ══════════════════════════════════════════════════════════ */}
        {/* COLUMN 1 — Full Editor                                    */}
        {/* ══════════════════════════════════════════════════════════ */}
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
              void childType;
            },
            onRemoveSection: handleRemoveSection,
            onMoveToContainer: handleMoveToContainer,
            onReorderChildren: handleReorderChildren,
            onReplaceEmptySlot: handleReplaceEmptySlot,
            onPropsChange: handlePropsChange,
            onNameChange: handleNameChange,
            pendingUploads,
            setPendingUpload: (sectionId, file, objectUrl, fieldKey) => {
              setPendingUploads(prev => {
                const existing = prev.filter(p => !(p.sectionId === sectionId && p.fieldKey === fieldKey));
                return [...existing, { sectionId, file, objectUrl, fieldKey }];
              });
              setIsDirty(true);
            },
            removePendingUpload: (sectionId, fieldKey) => {
              setPendingUploads(prev => prev.filter(p => !(p.sectionId === sectionId && p.fieldKey === fieldKey)));
            }
          }}
        >
          {/* Floating control panel */}
          {!previewMode && <FloatingControlPanel />}

          {/* Editor column wrapper */}
          <div
            className="flex flex-col bg-[var(--color-bg)]"
            style={{ height: '100dvh', overflow: 'hidden', minWidth: 0 }}
          >
            {/* ── Editor Header ──────────────────────────────────────── */}
            <header
              className="shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)] backdrop-blur-md flex items-center px-3 gap-2 z-40"
              style={{ height: HEADER_H }}
            >
              <button
                onClick={() => navigate(`/dashboard/portfolios/${portfolioId}`)}
                className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
              <ChevronRight size={12} className="text-slate-700" />
              <span className="text-[var(--color-text-faint)] text-sm truncate max-w-[100px]">
                {portfolio?.title}
              </span>
              <ChevronRight size={12} className="text-slate-700" />
              <span className="text-[var(--color-text)] text-sm font-medium truncate max-w-[120px]">
                {page?.title}
              </span>

              <div className="flex-1" />

              {/* AI Toggle */}
              <button
                onClick={() => setShowAiPanel((p) => !p)}
                title="AI Assistant"
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  showAiPanel
                    ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/40'
                    : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/80',
                )}
              >
                <Sparkles size={13} />
                <span className="hidden sm:inline">AI</span>
              </button>

              {/* Language Toggle */}
              <button
                id="editor-lang-toggle"
                onClick={toggleLanguage}
                title={
                  language === 'en'
                    ? tr.topbar.switchToVietnamese
                    : tr.topbar.switchToEnglish
                }
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/90 text-xs font-medium transition-all"
              >
                <Globe size={13} />
                <span className="hidden sm:inline">{language.toUpperCase()}</span>
              </button>

              {/* Add Block */}
              <button
                onClick={() => {
                  setAddChildParentId(null);
                  setShowAddPanel(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[var(--color-text)]/10 text-[var(--color-text)] hover:bg-[var(--color-text)]/20 text-xs font-medium transition-all"
              >
                <Plus size={11} /> {tr.topbar.add}
              </button>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!isDirty || isSaving}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                  isSaving
                    ? 'bg-emerald-500/10 text-emerald-400 cursor-wait'
                    : savedFeedback
                      ? 'bg-[var(--color-surface-2)] text-[var(--color-text-faint)] cursor-default opacity-50'
                      : isDirty
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 animate-pulse'
                        : 'bg-[var(--color-surface-2)] text-[var(--color-text-faint)] cursor-not-allowed opacity-40',
                )}
              >
                {isSaving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : savedFeedback ? (
                  <Check size={14} />
                ) : (
                  <Save size={14} />
                )}
                <span className="hidden sm:inline">
                  {isSaving
                    ? tr.topbar.saving
                    : savedFeedback
                      ? tr.topbar.saved
                      : isDirty
                        ? tr.topbar.unsaved
                        : tr.topbar.save}
                </span>
              </button>
            </header>

            {/* ── Editor Body: Left + Canvas + Right ─────────────────── */}
            <div
              className="flex flex-1 min-h-0 overflow-hidden relative"
              style={{ height: `calc(100dvh - ${HEADER_H}px)` }}
            >
              {/* Left panel toggle button */}
              <button
                onClick={() => setShowLeftPanel((p) => !p)}
                title={tr.topbar.toggleLeftPanel}
                className="absolute left-0 top-1/2 z-50 p-1 bg-[var(--color-surface)] border-y border-r border-[var(--color-border)] rounded-r-md shadow-sm text-[var(--color-text-faint)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-all flex items-center justify-center"
                style={{
                  transform: `translateY(-50%) translateX(${showLeftPanel ? '240px' : '0'})`,
                  width: 24,
                  height: 48,
                }}
              >
                <PanelLeft size={15} />
              </button>

              {/* Right panel toggle button */}
              <button
                onClick={() => setShowRightPanel((p) => !p)}
                title={tr.topbar.toggleRightPanel}
                className="absolute right-0 top-1/2 z-50 p-1 bg-[var(--color-surface)] border-y border-l border-[var(--color-border)] rounded-l-md shadow-sm text-[var(--color-text-faint)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-all flex items-center justify-center"
                style={{
                  transform: `translateY(-50%) translateX(${showRightPanel ? '-300px' : '0'})`,
                  width: 24,
                  height: 48,
                }}
              >
                <PanelRight size={15} />
              </button>

              {/* LEFT: Layers / SEO */}
              {showLeftPanel && (
                <aside
                  className="shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col"
                  style={{ width: 240 }}
                >
                  <div className="flex border-b border-[var(--color-border)] shrink-0" style={{ height: HEADER_H }}>
                    {(
                      [
                        { key: 'sections' as LeftTab, label: tr.tabs.layers, icon: Layers },
                        { key: 'settings' as LeftTab, label: tr.tabs.settings, icon: Globe },
                      ] as const
                    ).map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setLeftTab(key)}
                        className={clsx(
                          'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all border-b-2',
                          leftTab === key
                            ? 'text-[var(--color-text)] border-[var(--color-text)]'
                            : 'text-[var(--color-text-faint)] border-transparent hover:text-[var(--color-text)]',
                        )}
                      >
                        <Icon size={13} /> {label}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-2">
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
                        onAddClick={() => {
                          setAddChildParentId(null);
                          setShowAddPanel(true);
                        }}
                        onAddChild={(parentId) => {
                          setAddChildParentId(parentId);
                          setShowAddPanel(true);
                        }}
                        onReorder={handleTopLevelReorder}
                        onReorderChildren={handleReorderChildren}
                        onMoveToContainer={handleMoveToContainer}
                        onReplaceEmptySlot={handleReplaceEmptySlot}
                      />
                    )}
                    {leftTab === 'settings' && <SeoSettingsPanel />}
                  </div>

                  <div className="px-3 py-2 border-t border-[var(--color-border)] text-xs text-slate-700 shrink-0 flex justify-between">
                    <span>{draftLayout.sections.length} top-level</span>
                    <span>{componentRegistry.getTypes().length} types</span>
                  </div>
                </aside>
              )}

              {/* CENTER: Preview Canvas */}
              <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[var(--color-bg)]">
                <div
                  className="shrink-0 flex items-center gap-2 px-4 bg-[var(--color-surface)]/90 backdrop-blur-sm border-b border-[var(--color-border)]"
                  style={{ height: HEADER_H }}
                >
                  <div className="flex items-center rounded-md border border-[var(--color-border)] overflow-hidden bg-white/3">
                    <button
                      onClick={() => setPreviewMode(false)}
                      title={tr.topbar.editModeTitle}
                      className={clsx(
                        'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-all',
                        !previewMode
                          ? 'bg-[var(--color-surface-2)] text-[var(--color-text)]'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
                      )}
                    >
                      <PenLine size={13} />
                      <span className="hidden sm:inline">{tr.topbar.edit}</span>
                    </button>
                    <button
                      onClick={() => setPreviewMode(true)}
                      title={tr.topbar.previewModeTitle}
                      className={clsx(
                        'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-all',
                        previewMode
                          ? 'bg-[var(--color-surface-2)] text-[var(--color-text)]'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
                      )}
                    >
                      <Eye size={13} />
                      <span className="hidden sm:inline">{tr.topbar.preview}</span>
                    </button>
                  </div>
                  <span className="text-xs text-slate-700 font-mono">
                    {page?.slug}
                  </span>
                </div>

                <div
                  className={`flex-1 overflow-y-auto overscroll-contain editor-preview-container${draftLayout.sections.length > 0 ? ' editor-canvas-top-pad' : ''}`}
                >
                  {draftLayout.sections.length === 0 ? (
                    <EmptyCanvasPrompt
                      onLayoutGenerated={(layout) => {
                        handleAiLayout(layout);
                      }}
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
                  className="shrink-0 border-l border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col"
                  style={{ width: 300 }}
                >
                  <div
                    className="shrink-0 flex items-center justify-between px-4 border-b border-[var(--color-border)]"
                    style={{ height: HEADER_H }}
                  >
                    {selectedSection ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <Settings size={13} className="text-[var(--color-text)] font-semibold shrink-0" />
                        <span className="text-xs font-semibold text-[var(--color-text)] truncate">
                          {componentRegistry.getEntry(selectedSection.type)?.displayName ?? selectedSection.type}
                        </span>
                        {selectedId &&
                          findParent(draftLayout.sections, selectedId)?.parent && (
                            <span className="text-[10px] text-[var(--color-text-faint)] font-mono">
                              {tr.selectionPanel.child}
                            </span>
                          )}
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--color-text-faint)]">
                        {tr.selectionPanel.noSelection}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setSelectedId(null);
                        setSelectedFieldKey(null);
                      }}
                      className="p-1 rounded text-[var(--color-text-faint)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-all shrink-0"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  <div
                    ref={rightScrollRef}
                    className="flex-1 overflow-y-auto overscroll-contain p-4"
                  >
                    {selectedSection ? (
                      <SmartPropEditor
                        key={selectedSection.id}
                        sectionId={selectedSection.id}
                        sectionName={selectedSection.name}
                        sectionType={selectedSection.type}
                        props={selectedSection.props}
                        focusFieldKey={selectedFieldKey}
                        onChange={(newProps) =>
                          handlePropsChange(selectedSection.id, newProps)
                        }
                        onNameChange={(name) =>
                          handleNameChange(selectedSection.id, name)
                        }
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center py-16">
                        <div className="w-12 h-12 rounded-md bg-[var(--color-surface-2)] flex items-center justify-center mb-3">
                          <Settings size={20} className="text-[var(--color-text-faint)]" />
                        </div>
                        <p className="text-sm text-[var(--color-text-faint)] font-medium">
                          {tr.selectionPanel.noSelection}
                        </p>
                        <p className="text-xs text-slate-700 mt-1">
                          {tr.selectionPanel.clickToEdit}
                        </p>
                        <p className="text-xs text-[var(--color-text)] font-semibold/50 mt-3 text-center leading-relaxed">
                          {tr.selectionPanel.clickTextImages}
                        </p>
                      </div>
                    )}
                  </div>
                </aside>
              )}
            </div>{/* end editor body */}

            {/* Add Panel Modal */}
            {showAddPanel && (
              <AddSectionPanel
                onAdd={handleAddSection}
                onAddTemplate={handleAddTemplate}
                onClose={() => {
                  setShowAddPanel(false);
                  setAddChildParentId(null);
                  setFillSlotId(null);
                  setFillColCell(null);
                  setFillRowCell(null);
                  setFillFlexCell(null);
                }}
                addingToContainer={
                  addChildParentId !== null ||
                  fillSlotId !== null ||
                  fillColCell !== null ||
                  fillRowCell !== null ||
                  fillFlexCell !== null
                }
              />
            )}

            {/* Context Menu */}
            <BlockContextMenu
              state={contextMenuState}
              onClose={() => setContextMenuState(null)}
              onRemove={handleRemoveSection}
              onPaste={handlePasteSection}
            />
          </div>{/* end editor column */}
        </EditorProvider>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* DIVIDER — drag handle between Editor and AI Panel         */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg)',
            cursor: showAiPanel ? 'col-resize' : 'default',
            opacity: showAiPanel ? 1 : 0,
            pointerEvents: showAiPanel ? 'auto' : 'none',
            transition: 'opacity 0.25s ease',
            position: 'relative',
            zIndex: 10,
          }}
          onMouseDown={(e) => {
            if (!showAiPanel) return;
            e.preventDefault();
            const bodyEl = bodyRowRef.current;
            if (!bodyEl) return;
            const bodyWidth = bodyEl.getBoundingClientRect().width;
            aiDragRef.current = {
              startX: e.clientX,
              startBasis: aiPanelBasis,
              bodyWidth,
            };
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            const onMove = (ev: MouseEvent) => {
              if (!aiDragRef.current) return;
              const delta = aiDragRef.current.startX - ev.clientX;
              const deltaPct = (delta / aiDragRef.current.bodyWidth) * 100;
              // min 20% (8/2) — default 30% (7/3) — max 50% (5/5)
              const newBasis = Math.max(20, Math.min(50, aiDragRef.current.startBasis + deltaPct));
              setAiPanelBasis(newBasis);
            };
            const onUp = () => {
              aiDragRef.current = null;
              document.body.style.cursor = '';
              document.body.style.userSelect = '';
              window.removeEventListener('mousemove', onMove);
              window.removeEventListener('mouseup', onUp);
            };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
          }}
        >
          <div
            className="w-[3px] h-12 rounded-full"
            style={{ background: 'var(--color-border)', transition: 'background 0.15s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(139,92,246,0.6)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--color-border)'; }}
          />
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* COLUMN 2 — AI Panel (fully independent)                   */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div
          className="flex flex-col"
          style={{
            height: '100dvh',
            minWidth: 0,
            overflow: 'hidden',
            background: 'var(--color-surface)',
            opacity: showAiPanel ? 1 : 0,
            pointerEvents: showAiPanel ? 'auto' : 'none',
            transition: 'opacity 0.2s ease',
          }}
        >
          {/* AI Panel Header — same height as Editor header */}
          <div
            className="shrink-0 flex items-center gap-3 px-4 border-b border-[var(--color-border)]"
            style={{ height: HEADER_H, background: 'var(--color-surface)' }}
          >
            <div className="w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center shrink-0">
              <Sparkles size={13} className="text-violet-400" />
            </div>
            <span className="text-sm font-semibold text-[var(--color-text)] flex-1 truncate">
              AI Assistant
            </span>
            <button
              onClick={() => setShowAiPanel(false)}
              title="Đóng AI panel"
              className="p-1.5 rounded-md text-[var(--color-text-faint)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-all shrink-0"
            >
              <X size={14} />
            </button>
          </div>

          {/* AI Panel Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4">
            {portfolioId && pageId && (
              <AiGeneratePanel
                portfolioId={portfolioId}
                pageId={pageId}
                currentLayout={draftLayout}
                onLayoutGenerated={handleAiLayout}
              />
            )}
          </div>
        </div>

      </div>{/* end outer grid */}
    </>
  );
};