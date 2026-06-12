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
    alignX?: 'start' | 'center' | 'end' | 'stretch';
    alignY?: 'start' | 'center' | 'end' | 'stretch';
    children?: React.ReactNode;
    sectionId?: string;
    [key: string]: unknown;
}

export const RowsBlock: React.FC<RowsBlockProps> = ({
    rows,
    rowSpans,
    gap,
    alignX = 'stretch',
    alignY = 'stretch',
    children,
    sectionId
}: RowsBlockProps) => {
    const rowCount = Number(rows) || 2;
    const spans = Array.isArray(rowSpans) && rowSpans.length === rowCount
        ? rowSpans
        : null;
    // Use 'auto' so each row is only as tall as its own content.
    // Avoid 'fr' which equalises all rows to the tallest one (e.g. an image).
    const gridTemplate = spans
        ? spans.map(() => 'auto').join(' ')
        : `repeat(${rowCount}, auto)`;
    return (
        <div
            id={sectionId}
            style={{
                display: 'grid',
                gridTemplateRows: gridTemplate,
                gap: GAP_MAP[gap as string] ?? '12px',
                justifyItems: ALIGN_MAP[alignX as string] ?? 'stretch',
                alignItems: ALIGN_MAP[alignY as string] ?? 'stretch',
                width: '100%',
            }}
        >
            {children}
        </div>
    );
}