import React from 'react';
import { Plus, X } from 'lucide-react';
import { componentRegistry } from '../../../core/registry/ComponentRegistry';
import type { RegistryEntry } from '../../../core/types/registry.types';
import clsx from 'clsx';

const CATEGORY_LABELS: Record<string, string> = {
  navigation: '🧭 Navigation',
  layout: '📐 Layout',
  content: '📝 Content',
  form: '📬 Forms',
  media: '🖼 Media',
};

interface AddSectionPanelProps {
  onAdd: (type: string) => void;
  onClose: () => void;
}

export const AddSectionPanel: React.FC<AddSectionPanelProps> = ({
  onAdd,
  onClose,
}) => {
  const entries = componentRegistry.getAll();
  const byCategory = entries.reduce<Record<string, RegistryEntry[]>>(
    (acc, entry) => {
      if (!acc[entry.category]) acc[entry.category] = [];
      acc[entry.category].push(entry);
      return acc;
    },
    {},
  );

  const categoryOrder = ['navigation', 'layout', 'content', 'form', 'media'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg glass rounded-2xl shadow-2xl animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-bold text-white">Add Section</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
          {categoryOrder
            .filter((cat) => byCategory[cat]?.length)
            .map((cat) => (
              <div key={cat}>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 px-1">
                  {CATEGORY_LABELS[cat] ?? cat}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {byCategory[cat].map((entry) => (
                    <button
                      key={entry.type}
                      onClick={() => {
                        onAdd(entry.type);
                        onClose();
                      }}
                      className={clsx(
                        'flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/2',
                        'hover:border-indigo-500/30 hover:bg-indigo-500/10 transition-all text-left group',
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                        <Plus size={16} className="text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{entry.displayName}</p>
                        <p className="text-xs text-slate-500 font-mono">{entry.type}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
