import React, { useState, useRef, useEffect } from 'react';
import { useEditorContext } from '../../core/context/EditorContext';
import { Plus, X } from 'lucide-react';

// ─── Shared position maps ─────────────────────────────────────────────────────
type AlignX = 'left' | 'center' | 'right';
type AlignY = 'top' | 'middle' | 'bottom';

const JUSTIFY_MAP: Record<AlignX, string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};
const ALIGN_ITEMS_MAP: Record<AlignY, string> = {
  top: 'flex-start',
  middle: 'center',
  bottom: 'flex-end',
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface TableBlockProps {
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  alignX?: AlignX;
  alignY?: AlignY;
  textColor?: string;
  backgroundColor?: string;
  headerBackgroundColor?: string;
  borderColor?: string;
  striped?: boolean;
  bordered?: boolean;
  sectionId?: string;
  [key: string]: unknown;
}

const GHOST_THRESHOLD = 52; // px from table edge that triggers ghost
const HIDE_DELAY      = 260; // ms delay before hiding ghost

// ─── Keyframe injection (once) ───────────────────────────────────────────────
const KEYFRAME_ID = 'table-block-ghost-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(KEYFRAME_ID)) {
  const style = document.createElement('style');
  style.id = KEYFRAME_ID;
  style.textContent = `
    @keyframes tbGhostFadeIn {
      from { opacity: 0; transform: scaleY(0.7); }
      to   { opacity: 1; transform: scaleY(1); }
    }
    @keyframes tbGhostColFadeIn {
      from { opacity: 0; transform: scaleX(0.7); }
      to   { opacity: 1; transform: scaleX(1); }
    }
  `;
  document.head.appendChild(style);
}

export const TableBlock: React.FC<TableBlockProps> = ({
  tableData = {
    headers: ['Column 1', 'Column 2', 'Column 3'],
    rows: [
      ['Row 1, Cell 1', 'Row 1, Cell 2', 'Row 1, Cell 3'],
      ['Row 2, Cell 1', 'Row 2, Cell 2', 'Row 2, Cell 3'],
    ],
  },
  alignX = 'left',
  alignY = 'middle',
  textColor,
  backgroundColor,
  headerBackgroundColor,
  borderColor,
  striped = true,
  bordered = true,
  sectionId,
}) => {
  const { isEditorMode, onPropsChange } = useEditorContext();

  // ─── Hover states (editor-only) ────────────────────────────────────────────
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [showColGhost, setShowColGhost] = useState(false);
  const [showRowGhost, setShowRowGhost] = useState(false);

  // Debounce timers
  const hideColTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideRowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tableRef = useRef<HTMLTableElement>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (hideColTimer.current) clearTimeout(hideColTimer.current);
      if (hideRowTimer.current) clearTimeout(hideRowTimer.current);
    };
  }, []);

  const headers = tableData.headers || [];
  const rows = tableData.rows || [];

  // ─── Debounced ghost setters ───────────────────────────────────────────────
  const scheduleShowCol = (show: boolean) => {
    if (show) {
      if (hideColTimer.current) { clearTimeout(hideColTimer.current); hideColTimer.current = null; }
      setShowColGhost(true);
    } else {
      if (!hideColTimer.current) {
        hideColTimer.current = setTimeout(() => {
          setShowColGhost(false);
          hideColTimer.current = null;
        }, HIDE_DELAY);
      }
    }
  };

  const scheduleShowRow = (show: boolean) => {
    if (show) {
      if (hideRowTimer.current) { clearTimeout(hideRowTimer.current); hideRowTimer.current = null; }
      setShowRowGhost(true);
    } else {
      if (!hideRowTimer.current) {
        hideRowTimer.current = setTimeout(() => {
          setShowRowGhost(false);
          hideRowTimer.current = null;
        }, HIDE_DELAY);
      }
    }
  };

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const updateTableData = (newData: { headers: string[]; rows: string[][] }) => {
    if (sectionId && onPropsChange) {
      onPropsChange(sectionId, { tableData: newData });
    }
  };

  const addCol = () => {
    updateTableData({
      headers: [...headers, `Col ${headers.length + 1}`],
      rows: rows.map((r) => [...r, '']),
    });
    setShowColGhost(false);
    if (hideColTimer.current) { clearTimeout(hideColTimer.current); hideColTimer.current = null; }
  };

  const addRow = () => {
    updateTableData({
      headers,
      rows: [...rows, new Array(headers.length).fill('')],
    });
    setShowRowGhost(false);
    if (hideRowTimer.current) { clearTimeout(hideRowTimer.current); hideRowTimer.current = null; }
  };

  const removeCol = (cIdx: number) => {
    updateTableData({
      headers: headers.filter((_, i) => i !== cIdx),
      rows: rows.map((r) => r.filter((_, i) => i !== cIdx)),
    });
  };

  const removeRow = (rIdx: number) => {
    updateTableData({
      headers,
      rows: rows.filter((_, i) => i !== rIdx),
    });
  };

  const updateHeader = (cIdx: number, val: string) => {
    const nextH = [...headers];
    nextH[cIdx] = val;
    updateTableData({ headers: nextH, rows });
  };

  const updateCell = (rIdx: number, cIdx: number, val: string) => {
    const nextR = [...rows];
    nextR[rIdx] = [...nextR[rIdx]];
    nextR[rIdx][cIdx] = val;
    updateTableData({ headers, rows: nextR });
  };

  // ─── Mouse move → detect ghost zones (debounced) ──────────────────────────
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditorMode || !tableRef.current) return;
    const rect = tableRef.current.getBoundingClientRect();

    const fromRight  = rect.right  - e.clientX;
    const fromBottom = rect.bottom - e.clientY;
    const insideH    = e.clientX >= rect.left - 8 && e.clientX <= rect.right  + GHOST_THRESHOLD;
    const insideV    = e.clientY >= rect.top  - 8 && e.clientY <= rect.bottom + GHOST_THRESHOLD;

    scheduleShowCol(fromRight  > -GHOST_THRESHOLD && fromRight  <= GHOST_THRESHOLD && insideV);
    scheduleShowRow(fromBottom > -GHOST_THRESHOLD && fromBottom <= GHOST_THRESHOLD && insideH);
  };

  const handleMouseLeave = () => {
    if (!isEditorMode) return;
    scheduleShowCol(false);
    scheduleShowRow(false);
    setHoveredCol(null);
    setHoveredRow(null);
  };

  // ─── Styles ────────────────────────────────────────────────────────────────
  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    color: textColor,
    backgroundColor: backgroundColor,
  };

  const defaultBorderColor = 'var(--color-border)';
  const borderStyle = bordered ? `1px solid ${borderColor || defaultBorderColor}` : 'none';

  // Invisible input — only caret visible when focused
  const inputCls =
    'bg-transparent border-0 outline-none ring-0 shadow-none w-full px-2 py-1 focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none caret-[var(--color-accent)]';

  // Ghost shared
  const ghostBorderColor = 'rgba(200,200,210,0.5)';

  // Ghost column cell style (slim, white gradient)
  const ghostColCellStyle: React.CSSProperties = {
    width: 56,
    padding: '4px 6px',
    borderLeft: `1px dashed ${ghostBorderColor}`,
    background: 'linear-gradient(to right, rgba(255,255,255,0.04), rgba(255,255,255,0.10))',
    cursor: 'pointer',
    animation: 'tbGhostColFadeIn 0.18s ease-out',
    transformOrigin: 'left center',
    verticalAlign: 'middle',
    textAlign: 'center',
  };

  // Ghost row cell style (slim, white gradient)
  const ghostRowCellStyle: React.CSSProperties = {
    height: 30,
    padding: 0,
    borderTop: `1px dashed ${ghostBorderColor}`,
    background: 'linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
    cursor: 'pointer',
    animation: 'tbGhostFadeIn 0.18s ease-out',
    transformOrigin: 'center top',
    verticalAlign: 'middle',
    textAlign: 'center',
  };

  return (
    <div
      id={sectionId}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: JUSTIFY_MAP[alignX] ?? 'flex-start',
        alignItems: ALIGN_ITEMS_MAP[alignY] ?? 'center',
        overflowX: 'auto',
      }}
    >
      <div className="w-full max-w-full overflow-x-auto">
        {/* Wrapper captures mouse events for ghost detection */}
        <div
          className="inline-flex flex-col min-w-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <table
            ref={tableRef}
            style={tableStyle}
            className="text-sm text-left rtl:text-right w-full"
          >
            <thead
              className="text-xs uppercase"
              style={{
                backgroundColor: headerBackgroundColor || 'rgba(0, 0, 0, 0.05)',
                borderBottom: borderStyle,
              }}
            >
              {/* ── Header row ──────────────────────────────────────────── */}
              <tr>
                {/* Delete-row gutter — empty cell in header */}
                {isEditorMode && <td style={{ width: 24, padding: 0, border: 'none' }} />}

                {headers.map((header, colIndex) => (
                  <th
                    key={colIndex}
                    className="px-4 py-2 font-semibold"
                    style={{
                      border: borderStyle,
                      borderTop: 'none',
                      borderBottom: 'none',
                      position: 'relative',
                      backgroundColor:
                        isEditorMode && hoveredCol === colIndex
                          ? 'rgba(239,68,68,0.07)'
                          : undefined,
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={() => isEditorMode && setHoveredCol(colIndex)}
                    onMouseLeave={() => isEditorMode && setHoveredCol(null)}
                  >
                    {/* Delete-col button — absolute overlay at top-center of th */}
                    {isEditorMode && headers.length > 1 && (
                      <button
                        onClick={() => removeCol(colIndex)}
                        title="Xóa cột"
                        style={{
                          position: 'absolute',
                          top: 2,
                          right: 4,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 16,
                          height: 16,
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          opacity: hoveredCol === colIndex ? 1 : 0,
                          transition: 'opacity 0.15s',
                          color: '#ef4444',
                          padding: 0,
                        }}
                      >
                        <X size={11} />
                      </button>
                    )}

                    {isEditorMode ? (
                      <input
                        type="text"
                        value={header}
                        onChange={(e) => updateHeader(colIndex, e.target.value)}
                        className={inputCls}
                        style={{ minWidth: 60 }}
                      />
                    ) : (
                      <span className="px-2 py-1">{header}</span>
                    )}
                  </th>
                ))}

                {/* ── Ghost column header cell ─────────────────────────── */}
                {isEditorMode && showColGhost && (
                  <th
                    style={{ ...ghostColCellStyle, display: 'table-cell' }}
                    onClick={addCol}
                    title="Thêm cột"
                  >
                    <Plus size={13} style={{ margin: '0 auto', opacity: 0.5, display: 'block' }} />
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={striped && rowIndex % 2 !== 0 ? 'bg-black/5 dark:bg-white/5' : ''}
                  style={{
                    borderBottom: borderStyle,
                    backgroundColor:
                      isEditorMode && hoveredRow === rowIndex
                        ? 'rgba(239,68,68,0.05)'
                        : undefined,
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={() => isEditorMode && setHoveredRow(rowIndex)}
                  onMouseLeave={() => isEditorMode && setHoveredRow(null)}
                >
                  {/* ── Delete-row gutter ────────────────────────────── */}
                  {isEditorMode && (
                    <td style={{ width: 24, padding: 0, border: 'none', textAlign: 'center' }}>
                      {rows.length > 1 && (
                        <button
                          onClick={() => removeRow(rowIndex)}
                          title="Xóa hàng"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 18,
                            height: 18,
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            opacity: hoveredRow === rowIndex ? 1 : 0,
                            transition: 'opacity 0.15s',
                            color: '#ef4444',
                          }}
                        >
                          <X size={11} />
                        </button>
                      )}
                    </td>
                  )}

                  {row.map((cell, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-4 py-2"
                      style={{
                        border: borderStyle,
                        borderTop: 'none',
                        borderBottom: 'none',
                        backgroundColor:
                          isEditorMode && hoveredCol === colIndex
                            ? 'rgba(239,68,68,0.04)'
                            : undefined,
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={() => isEditorMode && setHoveredCol(colIndex)}
                      onMouseLeave={() => isEditorMode && setHoveredCol(null)}
                    >
                      {isEditorMode ? (
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                          className={inputCls}
                          style={{ minWidth: 60 }}
                        />
                      ) : (
                        <span className="px-2 py-1 block">{cell}</span>
                      )}
                    </td>
                  ))}

                  {/* Ghost column body cell */}
                  {isEditorMode && showColGhost && (
                    <td style={ghostColCellStyle} onClick={addCol} title="Thêm cột" />
                  )}
                </tr>
              ))}

              {/* ── Ghost row ──────────────────────────────────────────── */}
              {isEditorMode && showRowGhost && (
                <tr
                  style={{ cursor: 'pointer' }}
                  onClick={addRow}
                  title="Thêm hàng"
                >
                  {/* Gutter spacer */}
                  <td style={{ width: 24, padding: 0, border: 'none' }} />

                  {headers.map((_, colIndex) => (
                    <td
                      key={colIndex}
                      style={ghostRowCellStyle}
                    >
                      {/* Show centered + only in the middle column */}
                      {colIndex === Math.floor(headers.length / 2) && (
                        <Plus
                          size={13}
                          style={{ margin: '0 auto', opacity: 0.45, display: 'block' }}
                        />
                      )}
                    </td>
                  ))}

                  {/* Corner when both ghosts active */}
                  {showColGhost && (
                    <td style={{ ...ghostRowCellStyle, width: 56, borderLeft: `1px dashed ${ghostBorderColor}` }} />
                  )}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
