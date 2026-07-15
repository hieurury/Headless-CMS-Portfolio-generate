import React, { useState, useCallback } from 'react';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Image as ImageIcon,
  Link,
  Eye,
  EyeOff,
  Search,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { componentRegistry } from '../../../core/registry/ComponentRegistry';
import type { FieldSchema } from '../../../core/types/registry.types';
import { ImageUploadField } from '../../../components/editor/ImageUploadField';
import { localizeSchema } from '../../../core/utils/schemaTranslator';
import { useUIStore } from '../../../store/uiStore';
import { t } from '../../../i18n';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function get(obj: Record<string, unknown>, key: string): unknown {
  return obj[key];
}

function set(
  obj: Record<string, unknown>,
  key: string,
  value: unknown,
): Record<string, unknown> {
  return { ...obj, [key]: value };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Label: React.FC<{ children: React.ReactNode; description?: string }> = ({
  children,
  description,
}) => (
  <div className="mb-1.5">
    <label className="text-xs font-medium text-[var(--color-text)]">
      {children}
    </label>
    {description && (
      <p className="text-xs text-[var(--color-text-faint)] mt-0.5">
        {description}
      </p>
    )}
  </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props,
) => (
  <input
    {...props}
    className={`w-full px-3 py-2 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] text-sm
      placeholder-slate-600 focus:outline-none focus:border-[var(--color-border)] transition-colors ${props.className ?? ''}`}
  />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (
  props,
) => (
  <textarea
    {...props}
    className={`w-full px-3 py-2 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] text-sm
      placeholder-slate-600 focus:outline-none focus:border-[var(--color-border)] transition-colors resize-none leading-relaxed ${props.className ?? ''}`}
  />
);

const Toggle: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
}> = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none
      ${checked ? 'bg-[var(--color-text)]' : 'bg-[var(--color-surface-2)] hover:brightness-110'}`}
  >
    <span
      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform
        ${checked ? 'translate-x-4.5' : 'translate-x-0.5'}`}
    />
  </button>
);

const SpacingInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  const [localY, setLocalY] = useState('');
  const [localX, setLocalX] = useState('');

  const formatVal = useCallback((val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return '0';
    if (trimmed === '0') return '0';
    // If it's a pure number (including decimals/negatives), append px
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
    return trimmed;
  }, []);

  React.useEffect(() => {
    const stringVal = value || '';
    const currentDerived =
      !localY && !localX ? '' : `${formatVal(localY)} ${formatVal(localX)}`;
    if (stringVal !== currentDerived) {
      const parts = stringVal.trim().split(/\s+/);
      if (parts.length === 1 && parts[0] !== '') {
        setLocalY(parts[0]);
        setLocalX(parts[0]);
      } else if (parts.length >= 2) {
        setLocalY(parts[0]);
        setLocalX(parts[1]);
      } else {
        setLocalY('');
        setLocalX('');
      }
    }
  }, [value, localY, localX, formatVal]);

  const handleYChange = (newY: string) => {
    setLocalY(newY);
    if (!newY && !localX) onChange('');
    else onChange(`${formatVal(newY)} ${formatVal(localX)}`);
  };

  const handleXChange = (newX: string) => {
    setLocalX(newX);
    if (!localY && !newX) onChange('');
    else onChange(`${formatVal(localY)} ${formatVal(newX)}`);
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={localX}
          placeholder="X"
          onChange={(e) => handleXChange(e.target.value)}
        />
        <Input
          type="text"
          value={localY}
          placeholder="Y"
          onChange={(e) => handleYChange(e.target.value)}
        />
      </div>
    </div>
  );
};
// ─── IconPicker ───────────────────────────────────────────────────────────────

const IconPicker: React.FC<{
  value: string;
  onChange: (val: string) => void;
  hasPosition?: boolean;
  positionValue?: string;
  onPositionChange?: (val: string) => void;
}> = ({ value, onChange, hasPosition, positionValue, onPositionChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const iconNames = Object.keys(LucideIcons).filter(
    (name) => name !== 'createLucideIcon' && name !== 'default',
  );

  const filteredIcons = iconNames.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase()),
  );

  // Try to find the selected icon to render as preview
  const SelectedIcon = value
    ? (LucideIcons as any)[
        iconNames.find((k) => k.toLowerCase() === value.toLowerCase()) ||
          'Sparkles'
      ]
    : null;

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 w-full">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-12 h-9 flex items-center justify-center shrink-0 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] text-sm
            hover:border-[var(--color-border-hover)] transition-colors"
        >
          {SelectedIcon ? (
            <SelectedIcon size={16} />
          ) : (
            <div className="w-4 h-4 bg-white/10 rounded-full" />
          )}
        </button>

        {hasPosition && onPositionChange && (
          <select
            value={positionValue || 'left'}
            onChange={(e) => onPositionChange(e.target.value)}
            className="flex-1 px-3 py-2 h-9 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] text-sm
              focus:outline-none focus:border-[var(--color-border)] transition-colors"
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        )}
      </div>

      {open && (
        <div className="absolute z-50 bottom-full mb-1 left-0 w-[260px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-xl overflow-hidden flex flex-col">
          <div className="p-2 border-b border-[var(--color-border)] flex items-center gap-2 bg-[var(--color-surface-2)]">
            <Search
              size={14}
              className="text-[var(--color-text-faint)] shrink-0"
            />
            <input
              type="text"
              autoFocus
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-0 text-[var(--color-text)] text-xs focus:outline-none placeholder-[var(--color-text-faint)]"
            />
          </div>
          <div className="p-2 max-h-[160px] overflow-y-auto">
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-5 gap-1">
                {filteredIcons.slice(0, 50).map((name) => {
                  const Icon = (LucideIcons as any)[name];
                  const isActive = value.toLowerCase() === name.toLowerCase();
                  return (
                    <button
                      key={name}
                      onClick={() => {
                        onChange(name);
                        setOpen(false);
                      }}
                      title={name}
                      className={`flex items-center justify-center p-2 rounded-md transition-colors ${
                        isActive
                          ? 'bg-[var(--color-text)] text-[var(--color-bg)]'
                          : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      <Icon size={16} />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-[var(--color-text-faint)]">
                No icons found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close (simple overlay) */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  );
};

// ─── FieldRenderer ─────────────────────────────────────────────────────────────

export interface FieldRendererProps {
  fieldKey: string;
  schema: FieldSchema;
  value: unknown;
  allProps?: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  depth?: number;
  sectionId?: string;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  fieldKey,
  schema,
  value,
  allProps,
  onChange,
  depth = 0,
  sectionId,
}) => {
  const { language } = useUIStore();
  const tr = t(language).editor.smartPropEditor;
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
              className="flex-1 accent-[var(--color-accent)]"
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

  // SPACING
  if (schema.type === 'spacing') {
    return (
      <SpacingInput
        value={(value as string) ?? ''}
        onChange={handleChange}
        label={schema.label}
      />
    );
  }

  // SELECT
  if (schema.type === 'select') {
    return (
      <div>
        <Label description={schema.description}>{schema.label}</Label>
        <select
          value={(value as string) ?? schema.options?.[0] ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] text-sm
            focus:outline-none focus:border-[var(--color-border)] transition-colors"
        >
          {schema.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // ICON
  if (schema.type === 'icon') {
    return (
      <div>
        <Label description={schema.description}>{schema.label}</Label>
        <IconPicker
          value={(value as string) ?? ''}
          onChange={handleChange}
          hasPosition={schema.hasPosition}
          positionValue={(allProps?.iconPosition as string) ?? 'right'}
          onPositionChange={
            schema.hasPosition
              ? (val) => onChange('iconPosition', val)
              : undefined
          }
        />
      </div>
    );
  }

  // COLOR
  if (schema.type === 'color') {
    return (
      <div>
        <Label description={schema.description}>{schema.label}</Label>
        <div className="flex items-center rounded-md bg-black/20 border border-[var(--color-border)] overflow-hidden focus-within:border-[var(--color-text-muted)] transition-colors">
          <div className="relative w-9 h-9 shrink-0 border-r border-[var(--color-border)] bg-white/5">
            <input
              type="color"
              value={(value as string) || '#000000'}
              onChange={(e) => handleChange(e.target.value)}
              className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-10"
            />
            <div
              className="absolute inset-0 m-2 rounded-sm shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] border border-white/10"
              style={{ backgroundColor: (value as string) || '#000000' }}
            />
          </div>
          <input
            type="text"
            value={(value as string) ?? ''}
            placeholder={tr.colorPlaceholder}
            onChange={(e) => {
              let val = e.target.value.trim();
              if (val && !val.startsWith('#')) {
                val = '#' + val;
              }
              handleChange(val);
            }}
            className="flex-1 bg-transparent border-0 px-3 py-2 text-[var(--color-text)] text-sm placeholder-slate-600 focus:outline-none focus:ring-0"
          />
          {Boolean(value) && (
            <button
              onClick={() => handleChange('')}
              className="px-3 text-[var(--color-text-faint)] hover:text-red-400 text-xs transition-colors"
              title={tr.clearColor}
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }

  // IMAGE — drag-and-drop upload widget
  if (schema.type === 'image') {
    return (
      <div>
        <Label description={schema.description}>
          <span className="flex items-center gap-1.5">
            <ImageIcon size={12} />
            {schema.label}
          </span>
        </Label>
        <ImageUploadField
          value={(value as string) ?? ''}
          onChange={handleChange}
          sectionId={sectionId}
          fieldKey={fieldKey}
        />
      </div>
    );
  }

  // LINK
  if (schema.type === 'link') {
    return (
      <div>
        <Label description={schema.description}>
          <span className="flex items-center gap-1.5">
            <Link size={12} />
            {schema.label}
          </span>
        </Label>
        <Input
          type="text"
          value={(value as string) ?? ''}
          placeholder={schema.placeholder ?? tr.linkPlaceholder}
          onChange={(e) => handleChange(e.target.value)}
        />
        <p className="text-xs text-[var(--color-text-faint)] mt-1">
          {tr.linkHint}
        </p>
      </div>
    );
  }

  // ARRAY
  if (schema.type === 'array') {
    const items = (value as Record<string, unknown>[]) ?? [];
    const itemSchema = schema.itemSchema ?? {};
    const isSimpleString =
      Object.keys(itemSchema).length === 1 &&
      Object.values(itemSchema)[0]?.type === 'string';
    const simpleKey = isSimpleString ? Object.keys(itemSchema)[0] : null;

    const addItem = () => {
      const newItem: Record<string, unknown> = {};
      if (simpleKey) {
        newItem[simpleKey] = '';
      } else {
        Object.entries(itemSchema).forEach(([k, s]) => {
          newItem[k] =
            s.type === 'boolean'
              ? false
              : s.type === 'number'
                ? 0
                : s.type === 'array'
                  ? []
                  : '';
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
      <div
        className={`${depth > 0 ? 'pl-3 border-l border-[var(--color-border)]' : ''}`}
      >
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="flex items-center gap-2 w-full text-left mb-2"
        >
          <Label>{schema.label}</Label>
          <span className="ml-auto text-[var(--color-text-faint)]">
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </span>
          <span className="text-xs text-[var(--color-text-faint)] font-mono">
            {items.length}
          </span>
        </button>

        {expanded && (
          <div className="space-y-3">
            {items.map((item, idx) => {
              // Simple string array (e.g. highlights = [{value: '...'}])
              if (simpleKey) {
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <GripVertical
                      size={14}
                      className="text-slate-700 shrink-0"
                    />
                    <Input
                      type="text"
                      value={(item[simpleKey] as string) ?? ''}
                      placeholder={itemSchema[simpleKey]?.placeholder}
                      onChange={(e) =>
                        updateItem(idx, simpleKey, e.target.value)
                      }
                    />
                    <button
                      onClick={() => moveItem(idx, -1)}
                      disabled={idx === 0}
                      className="text-[var(--color-text-faint)] hover:text-[var(--color-text)] disabled:opacity-30 p-1"
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      onClick={() => moveItem(idx, 1)}
                      disabled={idx === items.length - 1}
                      className="text-[var(--color-text-faint)] hover:text-[var(--color-text)] disabled:opacity-30 p-1"
                    >
                      <ChevronDown size={13} />
                    </button>
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-[var(--color-text-faint)] hover:text-red-400 p-1"
                    >
                      <Trash2 size={13} />
                    </button>
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
                  sectionId={sectionId}
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
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md border border-dashed border-[var(--color-border)]
                text-[var(--color-text-faint)] hover:text-[var(--color-text)] hover:border-[var(--color-border)] hover:bg-[var(--color-text)]/5 text-xs transition-all"
            >
              <Plus size={13} />{' '}
              {tr.addItem.replace('{item}', schema.itemLabel ?? 'Item')}
            </button>
          </div>
        )}
      </div>
    );
  }

  // TABLE
  if (schema.type === 'table') {
    return (
      <div className="space-y-2">
        <Label>{schema.label}</Label>
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
          <p className="text-xs text-blue-400 font-medium">{tr.tableHint}</p>
        </div>
      </div>
    );
  }

  // Fallback JSON
  return (
    <div>
      <Label>{schema.label}</Label>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[var(--color-text-faint)]">
          {tr.rawJson}
        </span>
        <button
          onClick={() => setShowRaw((p) => !p)}
          className="text-xs text-[var(--color-text-faint)] hover:text-[var(--color-text)] font-semibold"
        >
          {showRaw ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
      </div>
      {showRaw && (
        <Textarea
          value={JSON.stringify(value, null, 2)}
          rows={4}
          onChange={(e) => {
            try {
              handleChange(JSON.parse(e.target.value));
            } catch {
              /* ignore */
            }
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
  sectionId?: string;
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
  sectionId,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // First string field as preview label
  const previewKey = Object.entries(itemSchema).find(
    ([, s]) => s.type === 'string',
  )?.[0];
  const previewValue = previewKey
    ? (item[previewKey] as string) || `${itemLabel} ${idx + 1}`
    : `${itemLabel} ${idx + 1}`;

  return (
    <div className="border border-white/8 rounded-md overflow-hidden bg-white/2">
      {/* Card header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white/3">
        <GripVertical size={14} className="text-slate-700 shrink-0" />
        <button
          type="button"
          onClick={() => setCollapsed((p) => !p)}
          className="flex-1 text-left text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] truncate"
        >
          {collapsed ? '▶' : '▼'} {previewValue}
        </button>
        <button
          onClick={onMoveUp}
          disabled={idx === 0}
          className="p-1 text-[var(--color-text-faint)] hover:text-[var(--color-text)] disabled:opacity-30"
        >
          <ChevronUp size={12} />
        </button>
        <button
          onClick={onMoveDown}
          disabled={idx === total - 1}
          className="p-1 text-[var(--color-text-faint)] hover:text-[var(--color-text)] disabled:opacity-30"
        >
          <ChevronDown size={12} />
        </button>
        <button
          onClick={onRemove}
          className="p-1 text-[var(--color-text-faint)] hover:text-red-400"
        >
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
              allProps={item}
              onChange={(k, v) => onUpdate(k, v)}
              depth={depth}
              sectionId={sectionId}
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
  sectionId,
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

  // const entry = componentRegistry.getEntry(sectionType);
  // const schema = entry?.schema;
  const { language } = useUIStore();
  const tr = t(language).editor.smartPropEditor;
  const translationDict = t(language);

  const entry = componentRegistry.getEntry(sectionType);
  const baseSchema = entry?.schema;

  // 🔄 Localize schema labels based on current language
  const schema = baseSchema
    ? localizeSchema(baseSchema, sectionType, translationDict)
    : undefined;

  // Auto-scroll to focused field when clicked from preview
  React.useEffect(() => {
    if (!focusFieldKey) return;
    setActiveTab('form');
    setTimeout(() => {
      const el = fieldRefs.current[focusFieldKey];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.transition = 'box-shadow 0.3s';
        el.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.25)';
        setTimeout(() => {
          el.style.boxShadow = '';
        }, 1500);
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
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {entry?.displayName ?? sectionType}
            </p>
            {entry?.description && (
              <p className="text-xs text-[var(--color-text-faint)] mt-0.5 leading-snug">
                {entry.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section Name (Anchor) */}
      <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 space-y-1.5">
        {/* <label className="text-xs font-medium text-[var(--color-text)] font-semibold flex items-center gap-1.5">
          <span>#</span> Section Anchor Name
        </label> */}
        <label className="text-xs font-medium text-[var(--color-text)] font-semibold flex items-center gap-1.5">
          <span>#</span>{' '}
          {translationDict.components?.common?.anchorName ||
            'Section Anchor Name'}
        </label>
        <input
          type="text"
          value={sectionName ?? ''}
          placeholder="e.g. about, hero, projects"
          onChange={(e) =>
            onNameChange(e.target.value.toLowerCase().replace(/\s+/g, '-'))
          }
          className="w-full px-3 py-2 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-sm
            placeholder-slate-600 focus:outline-none focus:border-[var(--color-border)] transition-colors font-mono"
        />
        {/* <p className="text-xs text-[var(--color-text-faint)]">
          Navbar links can use{' '}
          <code className="text-[var(--color-text)] font-semibold">
            #{sectionName || 'name'}
          </code>{' '}
          to scroll to this section
        </p> */}
        <p className="text-xs text-[var(--color-text-faint)]">
          {language === 'en'
            ? `Navbar links can use #${sectionName || 'name'} to scroll to this section`
            : `Liên kết thanh điều hướng có thể sử dụng #${sectionName || 'name'} để cuộn đến phần này`}
        </p>
      </div>

      {/* Form / JSON tabs */}
      {schema && (
        <div className="flex border-b border-[var(--color-border)] -mx-0 gap-3">
          {(['form', 'json'] as const).map((tab) => (
            <button
              key={tab}
              onClick={
                tab === 'json' ? openJsonTab : () => setActiveTab('form')
              }
              className={`text-xs pb-2 font-medium transition-all border-b-2 capitalize ${
                activeTab === tab
                  ? 'text-[var(--color-text)] border-[var(--color-border-hover)]'
                  : 'text-[var(--color-text-faint)] border-transparent hover:text-[var(--color-text)]'
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
              ref={(el) => {
                fieldRefs.current[key] = el;
              }}
              className="rounded-md transition-all"
            >
              <FieldRenderer
                fieldKey={key}
                schema={fieldSchema}
                value={get(props, key)}
                onChange={handleFieldChange}
                sectionId={sectionId}
              />
            </div>
          ))}
        </div>
      )}

      {/* Fallback: no schema — always show JSON */}
      {activeTab === 'form' && !schema && (
        <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-3">
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
              } catch {
                /* ignore mid-edit */
              }
            }}
            className="w-full px-3 py-3 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs
              leading-relaxed focus:outline-none focus:border-[var(--color-border)] resize-none"
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
            onChange={(e) => {
              setJsonText(e.target.value);
              setJsonError(null);
            }}
            className="w-full px-3 py-3 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs
              leading-relaxed focus:outline-none focus:border-[var(--color-border)] resize-none"
            style={{ fontFamily: "'Fira Code', 'Cascadia Code', monospace" }}
          />
          {jsonError && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2 font-mono">
              {jsonError}
            </p>
          )}
          <button
            onClick={applyJson}
            className="w-full py-2.5 rounded-md bg-[var(--color-text)]/10 text-[var(--color-text)] hover:bg-[var(--color-text)]/20 text-sm font-semibold
              transition-all hover:shadow-lg hover:shadow-black/10"
          >
            Apply JSON
          </button>
        </div>
      )}
    </div>
  );
};
