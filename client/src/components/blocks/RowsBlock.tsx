import type React from "react";

const GAP_MAP: Record<string, string> = {
    none: '0px',
    sm: '12px',
    md: '24px',
    lg: '40px',
    xl: '64px',
};

const ALIGN_MAP: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
};

export interface RowsBlockProps {
    rows?: number | string;
    rowSpans?: number[];
    gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    align?: 'start' | 'center' | 'end' | 'stretch';
    children?: React.ReactNode;
    sectionId?: string;
    [key: string]: unknown;
}

export const RowsBlock: React.FC<RowsBlockProps> = ({
    rows,
    rowSpans,
    gap,
    align,
    children,
    sectionId
}: RowsBlockProps) => {
    const rowCount = Number(rows) || 2;
    const spans = Array.isArray(rowSpans) && rowSpans.length === rowCount
        ? rowSpans
        : null;
    const gridTemplate = spans
        ? spans.map(s => `${s}fr`).join(' ')
        : `repeat(${rowCount}, minmax(0, 1fr))`;
    return (
        <div
            id={sectionId}
            style={{
                display: 'grid',
                gridTemplateRows: gridTemplate,
                gap: GAP_MAP[gap as string] ?? '12px',
                alignItems: ALIGN_MAP[align as string] ?? 'stretch',
                width: '100%',
            }}
        >
            {children}
        </div>
    );
}