import React, { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';

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
        <p className="text-xs text-slate-500 uppercase tracking-wider">
          Props — <span className="font-mono text-indigo-400">{sectionType}</span>
        </p>
        <p className="text-xs text-slate-600">Ctrl+S to apply</p>
      </div>

      <div className="relative">
        <textarea
          value={json}
          onChange={(e) => { setJson(e.target.value); setError(null); }}
          onKeyDown={handleKeyDown}
          rows={14}
          spellCheck={false}
          className="w-full px-3 py-3 rounded-xl bg-[#0a0a0f] border border-white/10 text-slate-300 font-mono text-xs leading-relaxed focus:outline-none focus:border-indigo-500/50 resize-none transition-colors"
          style={{ fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace" }}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-red-400 font-mono break-all">{error}</p>
        </div>
      )}

      <button
        onClick={handleApply}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/20"
      >
        {saved ? (
          <><Check size={15} /> Applied!</>
        ) : (
          'Apply Props'
        )}
      </button>
    </div>
  );
};
