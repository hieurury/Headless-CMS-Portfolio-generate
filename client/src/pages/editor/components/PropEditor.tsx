import React, { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { useUIStore } from '../../../store/uiStore';
import { t } from '../../../i18n';

interface PropEditorProps {
  props: Record<string, unknown>;
  sectionType: string;
  onChange: (newProps: Record<string, unknown>) => void;
}

export const PropEditor: React.FC<PropEditorProps> = ({
  props,
  sectionType,
  onChange,
}) => {
  const { language } = useUIStore();
  const tr = t(language).editor.propEditor;
  const [json, setJson] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setJson(JSON.stringify(props, null, 2));
    setError(null);
  }, [props, sectionType]);

  const handleApply = () => {
    try {
      const parsed = JSON.parse(json) as Record<string, unknown>;
      onChange(parsed);
      setError(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e) {
      setError((e as SyntaxError).message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+S or Cmd+S to apply
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleApply();
    }
    // Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newVal = json.slice(0, start) + '  ' + json.slice(end);
      setJson(newVal);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2;
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--color-text-faint)] uppercase tracking-wider">
          {tr.propsLabel}{' '}
          <span className="font-mono text-[var(--color-text)] font-semibold">
            {sectionType}
          </span>
        </p>
        <p className="text-xs text-[var(--color-text-faint)]">{tr.ctrlApply}</p>
      </div>

      <div className="relative">
        <textarea
          value={json}
          onChange={(e) => {
            setJson(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          rows={14}
          spellCheck={false}
          className="w-full px-3 py-3 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs leading-relaxed focus:outline-none focus:border-[var(--color-border)] resize-none transition-colors"
          style={{
            fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
          }}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-sm bg-red-500/10 border border-red-500/20">
          <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-red-400 font-mono break-all">{error}</p>
        </div>
      )}

      <button
        onClick={handleApply}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm bg-[var(--color-accent)] text-[var(--color-bg)] hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-black/10"
      >
        {saved ? (
          <>
            <Check size={15} /> {tr.applied}
          </>
        ) : (
          tr.applyProps
        )}
      </button>
    </div>
  );
};
