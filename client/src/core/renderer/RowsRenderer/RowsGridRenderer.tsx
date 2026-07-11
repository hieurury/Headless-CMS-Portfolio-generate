import { useEditorContext } from "../../context/EditorContext";
import type { LayoutSection } from "../../types/layout.types";
import { SectionRenderer } from "../SectionRenderer";
import _RowsEditGrid from "./RowsEditGrid";

const RowsGridRenderer: React.FC<{
    section: LayoutSection;
    depth: number;
}> = ({ section, depth }) => {
    const { isEditorMode, previewMode } = useEditorContext();
    const rowCount = Number(section.props?.rows ?? 2);
    const ALIGN_MAP: Record<string, string> = {
        start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch',
    };
    const isEditing = isEditorMode && !previewMode;
    const alignX = (section.props?.alignX as string) ?? 'stretch';
    const alignY = (section.props?.alignY as string) ?? 'stretch';

    // ── rowSpans: per-cell height weights ─────────────────────────────────
    const rawSpans = section.props?.rowSpans as number[] | undefined;
    const rowSpans: number[] = (
        Array.isArray(rawSpans) && rawSpans.length === rowCount && rawSpans.every(s => s > 0)
    ) ? rawSpans : Array(rowCount).fill(1);

    const totalSpan = rowSpans.reduce((a, b) => a + b, 0);

    // CSS grid template — use actual span weights
    // Use 'auto' per-row so rows only take the height of their own content.
    const gridTemplate = rowSpans.map(() => 'auto').join(' ');

    if (!isEditing) {
        // Real children only — skip _empty and legacy _colpad/_column nodes
        const realChildren = (section.children ?? []).filter(
            (c) => c && c.type !== '_colpad' && c.type !== '_column' && c.type !== '_empty'
        );
        return (
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
                {Array.from({ length: rowCount }, (_, i) => {
                    const child = realChildren[i] ?? null;
                    if (!child) return <div key={`cell-empty-${i}`} />;
                    return (
                        <div key={child.id} style={{ width: '100%', height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                            <SectionRenderer section={child} isChild depth={depth + 1} />
                        </div>
                    );
                })}
            </div>
        );
    }

    const allChildren = section.children ?? [];
    const cells = Array.from({ length: rowCount }, (_, i) => {
        const raw = allChildren[i] ?? null;
        // _empty node = empty cell with data; null/_colpad/_column = legacy empty
        const isEmpty = !raw || raw.type === '_colpad' || raw.type === '_column' || raw.type === '_empty';
        const emptyNode = (raw && raw.type === '_empty') ? raw : null;
        return { index: i, span: rowSpans[i], child: isEmpty ? null : raw, emptyNode, isEmpty };
    });

    const cumulativeSpans = rowSpans.reduce<number[]>((acc, s) => {
        acc.push((acc[acc.length - 1] ?? 0) + s);
        return acc;
    }, []);

    return <_RowsEditGrid
        section={section}
        depth={depth}
        rowCount={rowCount}
        alignX={alignX}
        alignY={alignY}
        rowSpans={rowSpans}
        totalSpan={totalSpan}
        gridTemplate={gridTemplate}
        cells={cells}
        cumulativeSpans={cumulativeSpans}
        ALIGN_MAP={ALIGN_MAP}
    />
}

export default RowsGridRenderer;
