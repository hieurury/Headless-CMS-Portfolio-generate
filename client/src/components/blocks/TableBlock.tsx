import React from 'react';
import { useEditorContext } from '../../core/context/EditorContext';
import { Plus, Trash2 } from 'lucide-react';

// ─── Shared position maps ─────────────────────────────────────────────────────
type AlignX = 'left' | 'center' | 'right';
type AlignY = 'top'  | 'middle' | 'bottom';

const JUSTIFY_MAP: Record<AlignX, string> = {
  left:   'flex-start',
  center: 'center',
  right:  'flex-end',
};
const ALIGN_ITEMS_MAP: Record<AlignY, string> = {
  top:    'flex-start',
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

export const TableBlock: React.FC<TableBlockProps> = ({
  tableData = {
    headers: ['Column 1', 'Column 2', 'Column 3'],
    rows: [
      ['Row 1, Cell 1', 'Row 1, Cell 2', 'Row 1, Cell 3'],
      ['Row 2, Cell 1', 'Row 2, Cell 2', 'Row 2, Cell 3'],
    ],
  },
  alignX    = 'left',
  alignY    = 'middle',
  textColor,
  backgroundColor,
  headerBackgroundColor,
  borderColor,
  striped   = true,
  bordered  = true,
  sectionId,
}) => {
  const { isEditorMode, onPropsChange } = useEditorContext();

  const headers = tableData.headers || [];
  const rows = tableData.rows || [];

  const updateTableData = (newData: { headers: string[]; rows: string[][] }) => {
    if (sectionId && onPropsChange) {
      onPropsChange(sectionId, { tableData: newData });
    }
  };

  const addCol = () => {
    updateTableData({
      headers: [...headers, `Col ${headers.length + 1}`],
      rows: rows.map(r => [...r, ''])
    });
  };

  const addRow = () => {
    updateTableData({
      headers,
      rows: [...rows, new Array(headers.length).fill('')]
    });
  };

  const removeCol = (cIdx: number) => {
    updateTableData({
      headers: headers.filter((_, i) => i !== cIdx),
      rows: rows.map(r => r.filter((_, i) => i !== cIdx))
    });
  };

  const removeRow = (rIdx: number) => {
    updateTableData({
      headers,
      rows: rows.filter((_, i) => i !== rIdx)
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

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    color: textColor,
    backgroundColor: backgroundColor,
  };

  const defaultBorderColor = 'var(--color-border)';
  const borderStyle = bordered ? `1px solid ${borderColor || defaultBorderColor}` : 'none';
  const inputCls = "!bg-transparent !border-none !w-full !px-2 !py-1 focus:!outline-none focus:!ring-1 focus:!ring-[var(--color-accent)] focus:!bg-black/5 dark:focus:!bg-white/10 rounded transition-colors";

  return (
    <div
      id={sectionId}
      style={{
        width:          '100%',
        height:         '100%',
        display:        'flex',
        justifyContent: JUSTIFY_MAP[alignX]     ?? 'flex-start',
        alignItems:     ALIGN_ITEMS_MAP[alignY] ?? 'center',
        overflowX:      'auto',
      }}
    >
      <div className="py-2 w-full max-w-full overflow-x-auto">
        <div className="inline-flex flex-col relative min-w-full">
          <table style={tableStyle} className="text-sm text-left rtl:text-right w-full">
            <thead 
              className="text-xs uppercase" 
              style={{ 
                backgroundColor: headerBackgroundColor || 'rgba(0, 0, 0, 0.05)',
                borderBottom: borderStyle 
              }}
            >
              <tr>
                {headers.map((header, colIndex) => (
                  <th 
                    key={colIndex} 
                    className="px-4 py-2 font-semibold relative group"
                    style={{ border: borderStyle, borderTop: 'none', borderBottom: 'none' }}
                  >
                    {isEditorMode ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={header}
                          onChange={(e) => updateHeader(colIndex, e.target.value)}
                          className={inputCls}
                        />
                        {headers.length > 1 && (
                          <button
                            onClick={() => removeCol(colIndex)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-500/10 rounded absolute right-1 top-1/2 -translate-y-1/2"
                            title="Xóa cột"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="px-2 py-1">{header}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className={`relative group/row ${striped && rowIndex % 2 !== 0 ? 'bg-black/5 dark:bg-white/5' : ''}`}
                  style={{ borderBottom: borderStyle }}
                >
                  {row.map((cell, colIndex) => (
                    <td 
                      key={colIndex} 
                      className="px-4 py-2"
                      style={{ border: borderStyle, borderTop: 'none', borderBottom: 'none' }}
                    >
                      {isEditorMode ? (
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                          className={inputCls}
                        />
                      ) : (
                        <span className="px-2 py-1 block">{cell}</span>
                      )}
                    </td>
                  ))}
                  
                  {isEditorMode && rows.length > 1 && (
                    <td className="w-0 p-0 border-none relative">
                      <button
                        onClick={() => removeRow(rowIndex)}
                        className="opacity-0 group-hover/row:opacity-100 p-1 text-red-500 hover:bg-red-500/10 rounded absolute left-1 top-1/2 -translate-y-1/2"
                        title="Xóa dòng"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          
          {isEditorMode && (
            <>
              {/* Add Column Button */}
              <div className="absolute right-0 top-0 bottom-0 translate-x-full pl-2 flex items-center">
                <button
                  onClick={addCol}
                  className="h-8 px-2 flex items-center justify-center bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded hover:bg-[var(--color-accent)] hover:text-white transition-colors text-[var(--color-text-faint)]"
                  title="Thêm cột"
                >
                  <Plus size={14} />
                </button>
              </div>
              
              {/* Add Row Button */}
              <div className="mt-2 flex">
                <button
                  onClick={addRow}
                  className="h-8 px-4 flex items-center justify-center gap-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded hover:bg-[var(--color-accent)] hover:text-white transition-colors text-[var(--color-text-faint)] text-xs font-semibold"
                >
                  <Plus size={14} /> Thêm hàng
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
