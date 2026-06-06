import React, { useState, useCallback } from 'react';
import {
  Plus, Trash2, ChevronDown, ChevronUp, GripVertical,
  Image as ImageIcon, Link, Code2, Eye, EyeOff,
} from 'lucide-react';
import { componentRegistry } from '../../../core/registry/ComponentRegistry';
import type { FieldSchema } from '../../../core/types/registry.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function get(obj: Record<string, unknown>, key: string): unknown {
  return obj[key];
}

function set(obj: Record<string, unknown>, key: string, value: unknown): Record<string, unknown> {
  return { ...obj, [key]: value };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Label: React.FC<{ children: React.ReactNode; description?: string }> = ({ children, description }) => (
  <div className="mb-1.5">
    <label className="text-xs font-medium text-slate-300">{children}</label>
    {description && <p className="text-xs text-slate-600 mt-0.5">{description}</p>}
  </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 text-sm
      placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors ${props.className ?? ''}`}
  />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className={`w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 text-sm
      placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors resize-none leading-relaxed ${props.className ?? ''}`}
  />
);

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none
      ${checked ? 'bg-indigo-600' : 'bg-white/10'}`}
  >
    <span
      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform
        ${checked ? 'translate-x-4.5' : 'translate-x-0.5'}`}
    />
  </button>
);

// ─── FieldRenderer ─────────────────────────────────────────────────────────────

interface FieldRendererProps {
  fieldKey: string;
  schema: FieldSchema;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
  depth?: number;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({
  fieldKey,
  schema,
  value,
  onChange,
  depth = 0,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [showRaw, setShowRaw] = useState(false);

  const handleChange = useCallback(
    (v: unknown) => onChange(fieldKey, v),
    [fieldKey, onChange],
  );

  // STRING
  if (schema.type === 'string') {
    return (
      <div>
        <Label description={schema.description}>{schema.label}</Label>
        <Input
          type="text"
          value={(value as string) ?? ''}
          placeholder={schema.placeholder}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>
    );
  }

  // TEXTAREA
  if (schema.type === 'textarea') {
    return (
      <div>
        <Label description={schema.description}>{schema.label}</Label>
        <Textarea
          value={(value as string) ?? ''}
          placeholder={schema.placeholder}
          rows={schema.rows ?? 3}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>
    );
  }

  // NUMBER
  if (schema.type === 'number') {
    return (
      <div>
        <Label description={schema.description}>{schema.label}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={(value as number) ?? 0}
            min={schema.min}
            max={schema.max}
            onChange={(e) => handleChange(Number(e.target.value))}
            className="flex-1"
          />
          {schema.min !== undefined && schema.max !== undefined && (
            <input
              type="range"
              min={schema.min}
              max={schema.max}
              value={(value as number) ?? schema.min}
              onChange={(e) => handleChange(Number(e.target.value))}
              className="flex-1 accent-indigo-500"
            />
          )}
        </div>
      </div>
    );
  }

  // BOOLEAN
  if (schema.type === 'boolean') {
    return (
      <div className="flex items-center justify-between">
        <Label description={schema.description}>{schema.label}</Label>
        <Toggle checked={Boolean(value)} onChange={handleChange} />
      </div>
    );
  }

  // SELECT
  if (schema.type === 'select') {
    return (
      <div>
        <Label description={schema.description}>{schema.label}</Label>
        <select
          value={(value as string) ?? (schema.options?.[0] ?? '')}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 text-sm
            focus:outline-none focus:border-indigo-500/60 transition-colors"
        >
          {schema.options?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  // COLOR
  if (schema.type === 'color') {
    return (
      <div>
        <Label description={schema.description}>{schema.label}</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={(value as string) || '#6366f1'}
            onChange={(e) => handleChange(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
          />
          <Input
            type="text"
            value={(value as string) ?? ''}
            placeholder="#6366f1 or rgba(99,102,241,0.5)"
            onChange={(e) => handleChange(e.target.value)}
            className="flex-1"
          />
          {Boolean(value) && (
            <button
              onClick={() => handleChange('')}
              className="text-slate-600 hover:text-red-400 text-xs"
              title="Clear color"
            >✕</button>
          )}
        </div>
      </div>
    );
  }

  // IMAGE
  if (schema.type === 'image') {
    const imgSrc = (value as string) ?? '';
    return (
      <div>
        <Label description={schema.description}>
          <span className="flex items-center gap-1.5"><ImageIcon size={12} />{schema.label}</span>
        </Label>
        <Input
          type="text"
          value={imgSrc}
          placeholder="https://example.com/image.png"
          onChange={(e) => handleChange(e.target.value)}
        />
        {imgSrc && (
          <div className="mt-2 rounded-lg overflow-hidden border border-white/10 bg-white/5">
            <img
              src={imgSrc}
              alt="preview"
              className="w-full h-20 object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
      </div>
    );
  }

  // LINK
  if (schema.type === 'link') {
    return (
      <div>
        <Label description={schema.description}>
          <span className="flex items-center gap-1.5"><Link size={12} />{schema.label}</span>
        </Label>
        <Input
          type="text"
          value={(value as string) ?? ''}
          placeholder={schema.placeholder ?? '#section-name, /page, or https://...'}
          onChange={(e) => handleChange(e.target.value)}
        />
        <p className="text-xs text-slate-600 mt-1">
          Use <code className="text-indigo-400">#name</code> to scroll to a section, <code className="text-indigo-400">/page</code> for navigation, or full URL
        </p>
      </div>
    );
  }

  // ARRAY
  if (schema.type === 'array') {
    const items = (value as Record<string, unknown>[]) ?? [];
    const itemSchema = schema.itemSchema ?? {};
    const isSimpleString = Object.keys(itemSchema).length === 1 && Object.values(itemSchema)[0]?.type === 'string';
    const simpleKey = isSimpleString ? Object.keys(itemSchema)[0] : null;

    const addItem = () => {
      const newItem: Record<string, unknown> = {};
      if (simpleKey) {
        newItem[simpleKey] = '';
      } else {
        Object.entries(itemSchema).forEach(([k, s]) => {
          newItem[k] = s.type === 'boolean' ? false : s.type === 'number' ? 0 : s.type === 'array' ? [] : '';
        });
      }
      handleChange([...items, newItem]);
    };

    const updateItem = (idx: number, itemKey: string, val: unknown) => {
      const next = items.map((item, i) =>
        i === idx ? { ...item, [itemKey]: val } : item,
      );
      handleChange(next);
    };

    const removeItem = (idx: number) => {
      handleChange(items.filter((_, i) => i !== idx));
    };

    const moveItem = (idx: number, dir: -1 | 1) => {
      const next = [...items];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return;
      [next[idx], next[target]] = [next[target], next[idx]];
      handleChange(next);
    };

    return (
      <div className={`${depth > 0 ? 'pl-3 border-l border-white/5' : ''}`}>
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="flex items-center gap-2 w-full text-left mb-2"
        >
          <Label>{schema.label}</Label>
          <span className="ml-auto text-slate-600">
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </span>
          <span className="text-xs text-slate-600 font-mono">{items.length}</span>
        </button>

        {expanded && (
          <div className="space-y-3">
            {items.map((item, idx) => {
              // Simple string array (e.g. highlights = [{value: '...'}])
              if (simpleKey) {
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <GripVertical size={14} className="text-slate-700 shrink-0" />
                    <Input
                      type="text"
                      value={(item[simpleKey] as string) ?? ''}
                      placeholder={itemSchema[simpleKey]?.placeholder}
                      onChange={(e) => updateItem(idx, simpleKey, e.target.value)}
                    />
                    <button
                      onClick={() => moveItem(idx, -1)}
                      disabled={idx === 0}
                      className="text-slate-600 hover:text-white disabled:opacity-30 p-1"
                    ><ChevronUp size={13} /></button>
                    <button
                      onClick={() => moveItem(idx, 1)}
                      disabled={idx === items.length - 1}
                      className="text-slate-600 hover:text-white disabled:opacity-30 p-1"
                    ><ChevronDown size={13} /></button>
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-slate-600 hover:text-red-400 p-1"
                    ><Trash2 size={13} /></button>
                  </div>
                );
              }

              // Complex object array
              return (
                <ArrayItemCard
                  key={idx}
                  idx={idx}
                  total={items.length}
                  item={item}
                  itemSchema={itemSchema}
                  itemLabel={schema.itemLabel ?? 'Item'}
                  depth={depth + 1}
                  onUpdate={(key, val) => updateItem(idx, key, val)}
                  onRemove={() => removeItem(idx)}
                  onMoveUp={() => moveItem(idx, -1)}
                  onMoveDown={() => moveItem(idx, 1)}
                />
              );
            })}

            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-dashed border-white/10
                text-slate-500 hover:text-white hover:border-indigo-500/30 hover:bg-indigo-500/5 text-xs transition-all"
            >
              <Plus size={13} /> Add {schema.itemLabel ?? 'Item'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Fallback JSON
  return (
    <div>
      <Label>{schema.label}</Label>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-600">Raw JSON</span>
        <button onClick={() => setShowRaw((p) => !p)} className="text-xs text-slate-600 hover:text-indigo-400">
          {showRaw ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
      </div>
      {showRaw && (
        <Textarea
          value={JSON.stringify(value, null, 2)}
          rows={4}
          onChange={(e) => {
            try { handleChange(JSON.parse(e.target.value)); } catch { /* ignore */ }
          }}
          className="font-mono text-xs"
        />
      )}
    </div>
  );
};

// ─── ArrayItemCard ─────────────────────────────────────────────────────────────

interface ArrayItemCardProps {
  idx: number;
  total: number;
  item: Record<string, unknown>;
  itemSchema: Record<string, FieldSchema>;
  itemLabel: string;
  depth: number;
  onUpdate: (key: string, value: unknown) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const ArrayItemCard: React.FC<ArrayItemCardProps> = ({
  idx,
  total,
  item,
  itemSchema,
  itemLabel,
  depth,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // First string field as preview label
  const previewKey = Object.entries(itemSchema).find(([, s]) => s.type === 'string')?.[0];
  const previewValue = previewKey ? ((item[previewKey] as string) || `${itemLabel} ${idx + 1}`) : `${itemLabel} ${idx + 1}`;

  return (
    <div className="border border-white/8 rounded-xl overflow-hidden bg-white/2">
      {/* Card header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white/3">
        <GripVertical size={14} className="text-slate-700 shrink-0" />
        <button
          type="button"
          onClick={() => setCollapsed((p) => !p)}
          className="flex-1 text-left text-xs font-medium text-slate-400 hover:text-white truncate"
        >
          {collapsed ? '▶' : '▼'} {previewValue}
        </button>
        <button onClick={onMoveUp} disabled={idx === 0} className="p-1 text-slate-600 hover:text-white disabled:opacity-30">
          <ChevronUp size={12} />
        </button>
        <button onClick={onMoveDown} disabled={idx === total - 1} className="p-1 text-slate-600 hover:text-white disabled:opacity-30">
          <ChevronDown size={12} />
        </button>
        <button onClick={onRemove} className="p-1 text-slate-600 hover:text-red-400">
          <Trash2 size={12} />
        </button>
      </div>

      {/* Card body */}
      {!collapsed && (
        <div className="p-3 space-y-3">
          {Object.entries(itemSchema).map(([key, fieldSchema]) => (
            <FieldRenderer
              key={key}
              fieldKey={key}
              schema={fieldSchema}
              value={item[key]}
              onChange={(k, v) => onUpdate(k, v)}
              depth={depth}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── SmartPropEditor ───────────────────────────────────────────────────────────

interface SmartPropEditorProps {
  sectionId: string;
  sectionName: string | undefined;
  sectionType: string;
  props: Record<string, unknown>;
  focusFieldKey?: string | null; // from preview click on data-cms-field element
  onChange: (newProps: Record<string, unknown>) => void;
  onNameChange: (name: string) => void;
}

export const SmartPropEditor: React.FC<SmartPropEditorProps> = ({
  sectionName,
  sectionType,
  props,
  focusFieldKey,
  onChange,
  onNameChange,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form');
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const fieldRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const entry = componentRegistry.getEntry(sectionType);
  const schema = entry?.schema;

  // Auto-scroll to focused field when clicked from preview
  React.useEffect(() => {
    if (!focusFieldKey) return;
    setActiveTab('form');
    setTimeout(() => {
      const el = fieldRefs.current[focusFieldKey];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.transition = 'box-shadow 0.3s';
        el.style.boxShadow = '0 0 0 2px rgba(99,102,241,0.6)';
        setTimeout(() => { el.style.boxShadow = ''; }, 1500);
      }
    }, 80);
  }, [focusFieldKey]);

  const handleFieldChange = useCallback(
    (key: string, value: unknown) => {
      onChange(set(props, key, value));
    },
    [props, onChange],
  );

  const openJsonTab = () => {
    setJsonText(JSON.stringify(props, null, 2));
    setJsonError(null);
    setActiveTab('json');
  };

  const applyJson = () => {
    try {
      const parsed = JSON.parse(jsonText) as Record<string, unknown>;
      onChange(parsed);
      setJsonError(null);
      setActiveTab('form');
    } catch (e) {
      setJsonError((e as SyntaxError).message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{entry?.icon ?? '⚙️'}</span>
          <div>
            <p className="text-sm font-semibold text-white">{entry?.displayName ?? sectionType}</p>
            {entry?.description && (
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{entry.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section Name (Anchor) */}
      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 space-y-1.5">
        <label className="text-xs font-medium text-indigo-400 flex items-center gap-1.5">
          <span>#</span> Section Anchor Name
        </label>
        <input
          type="text"
          value={sectionName ?? ''}
          placeholder="e.g. about, hero, projects"
          onChange={(e) => onNameChange(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
          className="w-full px-3 py-2 rounded-lg bg-black/20 border border-indigo-500/20 text-slate-200 text-sm
            placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors font-mono"
        />
        <p className="text-xs text-slate-600">
          Navbar links can use <code className="text-indigo-400">#{sectionName || 'name'}</code> to scroll to this section
        </p>
      </div>

      {/* Form / JSON tabs */}
      {schema && (
        <div className="flex border-b border-white/5 -mx-0 gap-3">
          {(['form', 'json'] as const).map((tab) => (
            <button
              key={tab}
              onClick={tab === 'json' ? openJsonTab : () => setActiveTab('form')}
              className={`text-xs pb-2 font-medium transition-all border-b-2 capitalize ${activeTab === tab
                ? 'text-white border-indigo-500'
                : 'text-slate-500 border-transparent hover:text-slate-300'
                }`}
            >
              {tab === 'form' ? '⚙ Form' : '{ } JSON'}
            </button>
          ))}
        </div>
      )}

      {/* Form Fields */}
      {activeTab === 'form' && schema && (
        <div className="space-y-4">
          {Object.entries(schema).map(([key, fieldSchema]) => (
            <div
              key={key}
              ref={(el) => { fieldRefs.current[key] = el; }}
              className="rounded-lg transition-all"
            >
              <FieldRenderer
                fieldKey={key}
                schema={fieldSchema}
                value={get(props, key)}
                onChange={handleFieldChange}
              />
            </div>
          ))}
        </div>
      )}

      {/* Fallback: no schema — always show JSON */}
      {activeTab === 'form' && !schema && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <p className="text-xs text-amber-400 mb-2">
            This component doesn't have a form schema yet. Edit props as JSON:
          </p>
          <textarea
            value={JSON.stringify(props, null, 2)}
            rows={10}
            spellCheck={false}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value) as Record<string, unknown>);
              } catch { /* ignore mid-edit */ }
            }}
            className="w-full px-3 py-3 rounded-lg bg-black/30 border border-white/10 text-slate-300 font-mono text-xs
              leading-relaxed focus:outline-none focus:border-indigo-500/50 resize-none"
          />
        </div>
      )}

      {/* JSON Tab */}
      {activeTab === 'json' && (
        <div className="space-y-3">
          <textarea
            value={jsonText}
            rows={12}
            spellCheck={false}
            onChange={(e) => { setJsonText(e.target.value); setJsonError(null); }}
            className="w-full px-3 py-3 rounded-lg bg-black/30 border border-white/10 text-slate-300 font-mono text-xs
              leading-relaxed focus:outline-none focus:border-indigo-500/50 resize-none"
            style={{ fontFamily: "'Fira Code', 'Cascadia Code', monospace" }}
          />
          {jsonError && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 font-mono">
              {jsonError}
            </p>
          )}
          <button
            onClick={applyJson}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold
              transition-all hover:shadow-lg hover:shadow-indigo-500/25"
          >
            Apply JSON
          </button>
        </div>
      )}
    </div>
  );
};
