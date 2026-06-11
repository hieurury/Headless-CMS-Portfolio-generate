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
    const align = (section.props?.align as string) ?? 'stretch';

    // ── rowSpans: per-cell height weights ─────────────────────────────────
    const rawSpans = section.props?.rowSpans as number[] | undefined;
    const rowSpans: number[] = (
        Array.isArray(rawSpans) && rawSpans.length === rowCount && rawSpans.every(s => s > 0)
    ) ? rawSpans : Array(rowCount).fill(1);

    const totalSpan = rowSpans.reduce((a, b) => a + b, 0);

    // CSS grid template — use actual span weights
    const gridTemplate = rowSpans.map(() => 'auto').join(' ');

    if (!isEditing) {
        return (
            <div
                id={section.name || section.id}
                style={{
                    display: 'grid',
                    gridTemplateRows: gridTemplate,
                    gap: 0,
                    alignItems: ALIGN_MAP[align] ?? 'stretch',
                    width: '100%',
                    height: '100%',
                }}
            >
                {Array.from({ length: rowCount }, (_, i) => {
                    const raw = section.children?.[i] ?? null;
                    // Treat null or legacy _colpad entries as empty cells
                    const child = (raw && raw.type !== '_colpad' && raw.type !== '_column') ? raw : null;
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

    const cells = Array.from({ length: rowCount }, (_, i) => {
        const raw = section.children?.[i] ?? null;
        // Treat null or legacy _colpad entries as empty
        const child = (raw && raw.type !== '_colpad' && raw.type !== '_column') ? raw : null;
        return { index: i, span: rowSpans[i], child, isEmpty: !child };
    });

    const cumulativeSpans = rowSpans.reduce<number[]>((acc, s) => {
        acc.push((acc[acc.length - 1] ?? 0) + s);
        return acc;
    }, []);

    return <_RowsEditGrid
        section={section}
        depth={depth}
        rowCount={rowCount}
        align={align}
        rowSpans={rowSpans}
        totalSpan={totalSpan}
        gridTemplate={gridTemplate}
        cells={cells}
        cumulativeSpans={cumulativeSpans}
        ALIGN_MAP={ALIGN_MAP}
    />
}

export default RowsGridRenderer;
