import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Link, Image as ImageIcon, ChevronDown, ExternalLink } from 'lucide-react';
import type { FieldSchema } from '../../../core/types/registry.types';

interface InlineFieldEditorProps {
  /** The field schema to determine what editor widget to show */
  schema: FieldSchema;
  // fieldKey is kept for external consumers but not used internally
  fieldKey?: string;
  value: unknown;
  /** Bounding rect of the clicked element (used for positioning) */
  targetRect: DOMRect;
  /** Parent container ref for boundary detection */
  containerRef: React.RefObject<HTMLElement>;
  onChange: (value: unknown) => void;
  onClose: () => void;
  /** Open the full prop panel and focus this field */
  onOpenInPanel: () => void;
}

const INPUT_CLS =
  'w-full px-3 py-2 rounded-lg bg-[#0d0d1a] border border-white/10 text-slate-200 text-sm ' +
  'placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors';

const TEXTAREA_CLS =
  'w-full px-3 py-2 rounded-lg bg-[#0d0d1a] border border-white/10 text-slate-200 text-sm ' +
  'placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors resize-none leading-relaxed';

export const InlineFieldEditor: React.FC<InlineFieldEditorProps> = ({
  schema,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fieldKey: _fieldKey,
  value,
  targetRect,
  containerRef,
  onChange,
  onClose,
  onOpenInPanel,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [localValue, setLocalValue] = useState<unknown>(value);
  const [imgError, setImgError] = useState(false);

  // Position the panel near the clicked element
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!panelRef.current || !containerRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const panel = panelRef.current;
    const panelH = panel.offsetHeight || 200;
    const panelW = panel.offsetWidth || 320;

    // Try placing below the element first
    let top = targetRect.bottom - container.top + 8;
    let left = targetRect.left - container.left;

    // If it goes off the bottom, place above
    if (top + panelH > container.height - 16) {
      top = targetRect.top - container.top - panelH - 8;
    }
    // Clamp horizontally
    left = Math.max(8, Math.min(left, container.width - panelW - 8));

    setPosition({ top, left });
  }, [targetRect, containerRef]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay to avoid the same click that opened the editor
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler);
    };
  }, [onClose]);

  // Keyboard: Escape to close, Enter to confirm (except textarea)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { commitAndClose(); }
      if (e.key === 'Enter' && schema.type !== 'textarea') { commitAndClose(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });

  const commitAndClose = useCallback(() => {
    onChange(localValue);
    onClose();
  }, [localValue, onChange, onClose]);

  const handleChange = (v: unknown) => {
    setLocalValue(v);
    // Live update for boolean/select
    if (schema.type === 'boolean' || schema.type === 'select') {
      onChange(v);
    }
  };

  // ----- Render the appropriate widget -----

  const renderWidget = () => {
    // Complex types → delegate to panel
    if (schema.type === 'array') {
      return (
        <div className="space-y-2">
          <p className="text-xs text-slate-400">
            Trường danh sách — cần chỉnh sửa trong panel đầy đủ.
          </p>
          <button
            onClick={onOpenInPanel}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xs font-medium hover:bg-indigo-600/30 transition-all"
          >
            <ExternalLink size={12} /> Mở trong Properties Panel
          </button>
        </div>
      );
    }

    if (schema.type === 'string') {
      return (
        <input
          autoFocus
          type="text"
          value={(localValue as string) ?? ''}
          placeholder={schema.placeholder}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={commitAndClose}
          className={INPUT_CLS}
        />
      );
    }

    if (schema.type === 'textarea') {
      return (
        <textarea
          autoFocus
          value={(localValue as string) ?? ''}
          placeholder={schema.placeholder}
          rows={schema.rows ?? 3}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={commitAndClose}
          className={TEXTAREA_CLS}
        />
      );
    }

    if (schema.type === 'link') {
      return (
        <div className="space-y-1.5">
          <div className="relative">
            <Link size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              autoFocus
              type="text"
              value={(localValue as string) ?? ''}
              placeholder={schema.placeholder ?? '#section, /page, or https://...'}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={commitAndClose}
              className={INPUT_CLS + ' pl-8'}
            />
          </div>
          <p className="text-[11px] text-slate-600">
            Dùng <code className="text-indigo-400">#name</code> để scroll, <code className="text-indigo-400">/page</code> để điều hướng
          </p>
        </div>
      );
    }

    if (schema.type === 'image') {
      const src = (localValue as string) ?? '';
      return (
        <div className="space-y-2">
          <div className="relative">
            <ImageIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              autoFocus
              type="text"
              value={src}
              placeholder="https://example.com/image.png"
              onChange={(e) => { handleChange(e.target.value); setImgError(false); }}
              onBlur={commitAndClose}
              className={INPUT_CLS + ' pl-8'}
            />
          </div>
          {src && !imgError && (
            <div className="rounded-lg overflow-hidden border border-white/10 bg-white/5 h-24">
              <img
                src={src}
                alt="preview"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            </div>
          )}
          {imgError && (
            <p className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
              Không tải được ảnh từ URL này
            </p>
          )}
        </div>
      );
    }

    if (schema.type === 'boolean') {
      const checked = Boolean(localValue);
      return (
        <button
          type="button"
          onClick={() => handleChange(!checked)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-indigo-600' : 'bg-white/10'}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
          />
          <span className="ml-14 text-sm text-slate-300 whitespace-nowrap">
            {checked ? 'Bật' : 'Tắt'}
          </span>
        </button>
      );
    }

    if (schema.type === 'select') {
      return (
        <div className="relative">
          <select
            autoFocus
            value={(localValue as string) ?? schema.options?.[0] ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={commitAndClose}
            className={INPUT_CLS + ' appearance-none pr-8'}
          >
            {schema.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
      );
    }

    if (schema.type === 'number') {
      return (
        <div className="space-y-2">
          <input
            autoFocus
            type="number"
            value={(localValue as number) ?? 0}
            min={schema.min}
            max={schema.max}
            onChange={(e) => handleChange(Number(e.target.value))}
            onBlur={commitAndClose}
            className={INPUT_CLS}
          />
          {schema.min !== undefined && schema.max !== undefined && (
            <input
              type="range"
              min={schema.min}
              max={schema.max}
              value={(localValue as number) ?? schema.min}
              onChange={(e) => handleChange(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      ref={panelRef}
      className="absolute z-[200] w-72 rounded-2xl shadow-2xl shadow-black/60 animate-slide-up"
      style={{
        top: position.top,
        left: position.left,
        background: 'rgba(10, 10, 20, 0.96)',
        border: '1px solid rgba(99,102,241,0.3)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <span className="text-xs font-semibold text-indigo-400 truncate max-w-[180px]">
          ✏️ {schema.label}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenInPanel}
            title="Mở trong Properties Panel"
            className="p-1 rounded text-slate-600 hover:text-indigo-400 hover:bg-white/5 transition-all"
          >
            <ExternalLink size={11} />
          </button>
          <button
            onClick={commitAndClose}
            className="p-1 rounded text-slate-600 hover:text-white hover:bg-white/5 transition-all"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        {renderWidget()}
      </div>

      {/* Footer: confirm button for string/textarea/link/image/number */}
      {!['boolean', 'select', 'array'].includes(schema.type) && (
        <div className="px-3 pb-3">
          <button
            onClick={commitAndClose}
            className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
          >
            Xác nhận
          </button>
        </div>
      )}
    </div>
  );
};

export default InlineFieldEditor;
