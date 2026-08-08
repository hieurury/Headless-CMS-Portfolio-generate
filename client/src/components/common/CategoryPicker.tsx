import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Search, Check } from 'lucide-react';
import {
  PORTFOLIO_CATEGORIES,
  CATEGORY_LABELS,
} from '../../core/types/layout.types';
import { useUIStore } from '../../store/uiStore';
import { t } from '../../i18n';

interface CategoryPickerProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
  min?: number;
  max?: number;
  className?: string;
}

/**
 * Remove Vietnamese accents and convert to lowercase for easy search matching
 */
function normalizeString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  selectedCategories,
  onChange,
  min = 1,
  max = 3,
  className = '',
}) => {
  const { language } = useUIStore();
  const lang = t(language).dashboard;

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when popover opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToggle = (key: string) => {
    const isSelected = selectedCategories.includes(key);
    if (isSelected) {
      // Don't allow removing if at minimum
      if (selectedCategories.length <= min) return;
      onChange(selectedCategories.filter((c) => c !== key));
    } else {
      // Don't allow adding if at maximum
      if (selectedCategories.length >= max) return;
      onChange([...selectedCategories, key]);
    }
  };

  const handleRemove = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedCategories.length <= min) return;
    onChange(selectedCategories.filter((c) => c !== key));
  };

  // Filter categories based on search term
  const normalizedSearch = normalizeString(searchTerm);
  const filteredCategories = PORTFOLIO_CATEGORIES.filter((key) => {
    if (!normalizedSearch) return true;
    const viName = CATEGORY_LABELS[key]?.vi || '';
    const enName = CATEGORY_LABELS[key]?.en || '';
    return (
      normalizeString(viName).includes(normalizedSearch) ||
      normalizeString(enName).includes(normalizedSearch) ||
      normalizeString(key).includes(normalizedSearch)
    );
  });

  const isMaxReached = selectedCategories.length >= max;

  return (
    <div className={`relative ${className}`}>
      {/* ─── Header Labels ─── */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-mono text-[var(--color-text-muted)]">
          {lang.categoryLabel}
        </label>
        <span className="text-[10px] text-[var(--color-text-faint)] font-mono">
          {selectedCategories.length}/{max} — {lang.categoryMax}
        </span>
      </div>
      <p className="text-[10px] text-[var(--color-text-faint)] mb-2.5">
        {lang.categoryHint}
      </p>

      {/* ─── Selected Badges + Add Button ─── */}
      <div className="flex flex-wrap items-center gap-2 p-2 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] min-h-[44px]">
        {selectedCategories.map((key) => {
          const label =
            CATEGORY_LABELS[key]?.[language as 'vi' | 'en'] || key;
          const canRemove = selectedCategories.length > min;

          return (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] font-medium shadow-sm transition-colors"
            >
              <span>{label}</span>
              {canRemove && (
                <button
                  type="button"
                  onClick={(e) => handleRemove(key, e)}
                  className="p-0.5 rounded-full hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                  title="Remove category"
                >
                  <X size={12} />
                </button>
              )}
            </span>
          );
        })}

        {/* ─── Add Category Button (shown if not maxed) ─── */}
        {!isMaxReached && (
          <div className="relative">
            <button
              ref={buttonRef}
              type="button"
              onClick={() => {
                setIsOpen(!isOpen);
                setSearchTerm('');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-dashed border-[var(--color-border)] hover:border-[var(--color-text)] text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-transparent hover:bg-[var(--color-surface)] transition-all"
            >
              <Plus size={13} />
              <span>{lang.addCategory}</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── Popover Dropdown (Upward) ─── */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute left-0 right-0 bottom-full mb-2 z-50 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-2xl overflow-hidden animate-slide-up"
          style={{ maxHeight: '300px' }}
        >
          {/* Search Input Box */}
          <div className="p-2 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
            <div className="relative flex items-center">
              <Search
                size={14}
                className="absolute left-2.5 text-[var(--color-text-muted)] pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={lang.searchCategory}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-colors font-sans"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-0.5"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Categories List */}
          <div className="p-1 max-h-48 overflow-y-auto divide-y divide-[var(--color-border)]/40">
            {filteredCategories.length === 0 ? (
              <div className="py-6 px-3 text-center text-xs text-[var(--color-text-muted)]">
                {lang.noCategoriesFound}
              </div>
            ) : (
              filteredCategories.map((key) => {
                const label =
                  CATEGORY_LABELS[key]?.[language as 'vi' | 'en'] || key;
                const altLabel =
                  CATEGORY_LABELS[key]?.[
                    language === 'vi' ? 'en' : 'vi'
                  ] || '';
                const isSelected = selectedCategories.includes(key);
                const isItemDisabled = isMaxReached && !isSelected;

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={isItemDisabled}
                    onClick={() => handleToggle(key)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left rounded transition-colors text-xs ${
                      isSelected
                        ? 'bg-[var(--color-surface-2)] text-[var(--color-text)] font-semibold'
                        : isItemDisabled
                        ? 'opacity-40 cursor-not-allowed text-[var(--color-text-muted)]'
                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span>{label}</span>
                      {altLabel && (
                        <span className="text-[10px] text-[var(--color-text-faint)] font-normal">
                          {altLabel}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="shrink-0 text-[var(--color-text)]">
                        <Check size={14} />
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer status */}
          <div className="px-3 py-1.5 bg-[var(--color-surface-2)] border-t border-[var(--color-border)] flex items-center justify-between text-[10px] text-[var(--color-text-muted)] font-mono">
            <span>
              {selectedCategories.length}/{max} {lang.categoryLabel.toLowerCase()}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[var(--color-text)] hover:underline"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
