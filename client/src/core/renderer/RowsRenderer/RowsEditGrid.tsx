import React from 'react';
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useCallback } from "react";
import { SortableContext, arrayMove as dndArrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Merge } from 'lucide-react';

import type { LayoutSection } from "../../types/layout.types";
import RowCellDropZone from "./RowCellDropZone";
import RowCellSortable from './RowCellSortable';

const _RowsEditGrid: React.FC<{
    section: LayoutSection;
    depth: number;
    rowCount: number;
    alignX: string;
    alignY: string;
    rowSpans: number[];
    totalSpan: number;
    gridTemplate: string;
    cells: { index: number; span: number; child: LayoutSection | null; isEmpty: boolean }[];
    cumulativeSpans: number[];
    ALIGN_MAP: Record<string, string>;
}> = ({
    section,
    depth,
    rowCount,
    alignX,
    alignY,
    rowSpans,
    totalSpan,
    gridTemplate,
    cells,
    cumulativeSpans,
    ALIGN_MAP,
}) => {

        const handleDragEnd = useCallback(
            (event: import('@dnd-kit/core').DragEndEvent) => {
                const { active, over } = event;
                if (!over || active.id === over.id) return;
                const oldIdx = cells.findIndex((c) => c.child?.id === active.id);
                const newIdx = cells.findIndex((c) => c.child?.id === over.id);
                if (oldIdx === -1 || newIdx === -1) return;
                const currentChildren = section.children ?? [];
                const reordered = dndArrayMove(currentChildren, oldIdx, newIdx);
                const reorderedSpans = dndArrayMove(rowSpans, oldIdx, newIdx);
                window.dispatchEvent(
                    new CustomEvent('cms:reorderRowCells', {
                        detail: { rowId: section.id, children: reordered, rowSpans: reorderedSpans },
                    }),
                );
            },
            [cells, section, rowSpans],
        );

        const reorderSensors = useSensors(
            useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        );

        const handleMerge = useCallback(
            (aboveIndex: number) => {
                window.dispatchEvent(
                    new CustomEvent('cms:mergeRowCells', {
                        detail: {
                            rowId: section.id,
                            aboveIndex,
                            newSpan: rowSpans[aboveIndex] + rowSpans[aboveIndex + 1],
                            rowSpans,
                        },
                    }),
                );
            },
            [section.id, rowSpans],
        );

        const filledIds = cells.filter((c) => c.child !== null).map((c) => c.child!.id);

        return (
            <DndContext
                sensors={reorderSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={filledIds} strategy={verticalListSortingStrategy}>
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <div
                            id={section.name || section.id}
                            style={{
                                display: 'grid',
                                gridTemplateRows: gridTemplate,
                                gap: 0,
                                justifyItems: ALIGN_MAP[alignX] ?? 'stretch',
                                alignItems: ALIGN_MAP[alignY] ?? 'stretch',
                                width: '100%',
                                height: '100%',
                            }}
                        >
                            {cells.map(({ index: i, child, isEmpty, span }) => {
                                if (isEmpty) {
                                    return (
                                        <RowCellDropZone
                                            key={`cell-empty-${i}`}
                                            rowId={section.id}
                                            cellIndex={i}
                                            span={span}
                                        />
                                    );
                                }
                                return (
                                    <RowCellSortable key={child!.id} child={child!} depth={depth} span={span} />
                                );
                            })}
                        </div>

                        {/* ── Merge buttons between adjacent EMPTY cells ────────────── */}
                        {rowCount >= 2 &&
                            cells.slice(0, -1).map(({ index: i, isEmpty: topEmpty }) => {
                                const bottomEmpty = cells[i + 1]?.isEmpty;
                                if (!topEmpty || !bottomEmpty) return null;
                                const pct = (cumulativeSpans[i] / totalSpan) * 100;
                                return (
                                    <button
                                        key={`merge-${i}`}
                                        data-editor-chrome
                                        onClick={(e) => { e.stopPropagation(); handleMerge(i); }}
                                        title={`Merge rows (${rowSpans[i]}fr + ${rowSpans[i + 1]}fr = ${rowSpans[i] + rowSpans[i + 1]}fr)`}
                                        style={{
                                            position: 'absolute',
                                            left: '50%',
                                            top: `${pct}%`,
                                            transform: 'translate(-50%, -50%)',
                                            zIndex: 30,
                                        }}
                                        className="
                                        w-6 h-6 rounded-full
                                            bg-[var(--color-surface)] border border-[var(--color-border-hover)]
                                            flex items-center justify-center
                                            text-[var(--color-text-muted)] hover:text-[var(--color-text)]
                                            hover:bg-[var(--color-surface-2)] hover:border-[var(--color-border-strong)]
                                            hover:shadow-lg hover:shadow-black/20
                                            transition-all duration-150 cursor-pointer
                                        "
                                    >
                                        <Merge size={11} />
                                    </button>
                                );
                            })
                        }
                    </div>
                </SortableContext>
            </DndContext>
        );
    };

// ─── RowCellSortable ──────────────────────────────────────────────────────────

export default _RowsEditGrid;