import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Globe, FileText, Hash, ChevronDown, Check, Loader2 } from 'lucide-react';
import { usePageStore } from '../../store/pageStore';
import type { Page, LayoutSection } from '../../core/types/layout.types';
import { useUIStore } from '../../store/uiStore';
import { pageService } from '../../services/page.service';
import { useEditorContext } from '../../core/context/EditorContext';

type LinkType = 'url' | 'page' | 'inner';

interface InnerAnchor {
  id: string;
  label: string;
}

export interface LinkPickerFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  portfolioId?: string;
  pages?: Page[];
}

function detectType(val: string): LinkType {
  if (!val) return 'url';
  if (val.startsWith('#')) return 'inner';
  if (val.startsWith('/') && !val.startsWith('//')) return 'page';
  return 'url';
}

function getAnchorsFromSections(sections: LayoutSection[]): InnerAnchor[] {
  const anchors: InnerAnchor[] = [];
  function traverse(list: LayoutSection[]) {
    for (const sec of list) {
      if (sec.name) {
        anchors.push({ id: sec.name, label: sec.type });
      }
      if (sec.children && sec.children.length > 0) {
        traverse(sec.children);
      }
    }
  }
  traverse(sections);
  return anchors;
}

const TYPE_CONFIG = {
  url: { icon: Globe, en: 'URL', vi: 'URL' },
  page: { icon: FileText, en: 'Page', vi: 'Trang' },
  inner: { icon: Hash, en: 'Inner', vi: 'Trong' },
};

export const LinkPickerField: React.FC<LinkPickerFieldProps> = ({
  value,
  onChange,
  placeholder,
  portfolioId,
  pages: pagesProp,
}) => {
  const { language } = useUIStore();
  const isVi = language === 'vi';
  
  const [typeOpen, setTypeOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<LinkType>(() => detectType(value));
  const [inputVal, setInputVal] = useState(value ?? '');
  
  const [pages, setPages] = useState<Page[]>(pagesProp ?? []);
  const [pagesLoading, setPagesLoading] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const storePages = usePageStore((s) => s.pages);
  const editorCtx = useEditorContext();
  const sections = editorCtx?.sections || [];

  const innerAnchors = getAnchorsFromSections(sections);

  useEffect(() => {
    setInputVal(value ?? '');
    setActiveTab(detectType(value ?? ''));
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setTypeOpen(false);
        setListOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadPages = useCallback(async (): Promise<Page[]> => {
    if (pagesProp && pagesProp.length > 0) { setPages(pagesProp); return pagesProp; }
    if (storePages.length > 0) { setPages(storePages); return storePages; }
    if (!portfolioId) return [];
    setPagesLoading(true);
    try {
      const fetched = await pageService.getAll(portfolioId);
      setPages(fetched);
      return fetched;
    } catch { return []; }
    finally { setPagesLoading(false); }
  }, [pagesProp, portfolioId, storePages]);

  const handleTypeSelect = async (type: LinkType) => {
    setActiveTab(type);
    setTypeOpen(false);
    
    let loadedPages = pages;
    if (type === 'page') {
      loadedPages = await loadPages();
    }
    
    // Auto open list when switching type if it's page or inner
    if (type === 'page' || type === 'inner') {
      setListOpen(true);
    } else {
      setListOpen(false);
    }

    // Auto-select first item if current value is invalid for the new type
    if (type === 'inner') {
      if (innerAnchors.length > 0) {
        const isCurrentValid = innerAnchors.some((a) => `#${a.id}` === inputVal);
        if (!isCurrentValid) commit(`#${innerAnchors[0].id}`);
      } else {
        commit('');
      }
    } else if (type === 'page') {
      if (loadedPages.length > 0) {
        const isCurrentValid = loadedPages.some((p) => {
          const slug = p.slug.startsWith('/') ? p.slug : `/${p.slug}`;
          return slug === inputVal;
        });
        if (!isCurrentValid) {
          const firstSlug = loadedPages[0].slug.startsWith('/') ? loadedPages[0].slug : `/${loadedPages[0].slug}`;
          commit(firstSlug);
        }
      } else {
        commit('');
      }
    } else if (type === 'url') {
      if (inputVal.startsWith('/') || inputVal.startsWith('#')) {
        commit('');
      }
    }
  };
  
  const commit = useCallback((val: string) => {
    setInputVal(val);
    onChange(val);
  }, [onChange]);

  const displayValue = useMemo(() => {
    if (!inputVal) return '';
    if (activeTab === 'page' && inputVal.startsWith('/')) return inputVal.substring(1);
    if (activeTab === 'inner' && inputVal.startsWith('#')) return inputVal.substring(1);
    return inputVal;
  }, [inputVal, activeTab]);

  const activeConfig = TYPE_CONFIG[activeTab];
  const ActiveIcon = activeConfig.icon;

  const getPlaceholder = () => {
    if (activeTab === 'page') return isVi ? 'Chọn trang...' : 'Select page...';
    if (activeTab === 'inner') return isVi ? 'Chọn neo...' : 'Select anchor...';
    return isVi ? 'Nhập URL...' : 'Enter URL...';
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex items-center rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] overflow-hidden focus-within:border-[var(--color-border-hover)] transition-colors h-9">
        
        {/* Link Icon */}
        <div className="pl-3 pr-1.5 flex items-center shrink-0 text-[var(--color-text-faint)]">
          <Globe size={13} className={activeTab === 'url' ? 'block' : 'hidden'} />
          <FileText size={13} className={activeTab === 'page' ? 'block' : 'hidden'} />
          <Hash size={13} className={activeTab === 'inner' ? 'block' : 'hidden'} />
        </div>

        {/* Text Input Wrapper */}
        <div 
          className="flex-1 relative flex items-center min-w-0"
          onClick={() => {
            if (activeTab === 'page' || activeTab === 'inner') {
              setListOpen(true);
              setTypeOpen(false);
              if (activeTab === 'page') loadPages();
            }
          }}
        >
          <input
            type="text"
            value={displayValue}
            readOnly={activeTab === 'page' || activeTab === 'inner'}
            placeholder={getPlaceholder()}
            onChange={(e) => {
              if (activeTab !== 'url') return;
              const v = e.target.value;
              setInputVal(v);
              onChange(v);
            }}
            onKeyDown={(e) => {
               if (e.key === 'Enter') {
                 setListOpen(false);
               }
            }}
            className={`w-full bg-transparent px-1.5 text-sm text-[var(--color-text)] focus:outline-none min-w-0 ${activeTab !== 'url' ? 'cursor-pointer pointer-events-none' : ''}`}
          />
        </div>

        {/* Type Selector Button */}
        <button
          type="button"
          onClick={() => {
            setTypeOpen(!typeOpen);
            setListOpen(false);
          }}
          className="h-full px-2.5 border-l border-[var(--color-border)] text-[var(--color-text-faint)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-3)] transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span className="text-[11px] font-medium tracking-wide">
            {isVi ? activeConfig.vi : activeConfig.en}
          </span>
          <ChevronDown size={11} className="opacity-50" />
        </button>
      </div>

      {/* Popover 1: Type Picker */}
      {typeOpen && (
        <div className="absolute z-[300] top-full mt-1 right-0 w-[140px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-xl overflow-hidden py-1 animate-slide-down">
          {(Object.keys(TYPE_CONFIG) as LinkType[]).map((key) => {
            const cfg = TYPE_CONFIG[key as LinkType];
            const Icon = cfg.icon;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleTypeSelect(key as LinkType)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                  isActive
                    ? 'bg-[var(--color-text)] text-[var(--color-bg)]'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                }`}
              >
                <Icon size={13} className={isActive ? '' : 'opacity-70'} />
                <span className="font-medium">{isVi ? cfg.vi : cfg.en}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Popover 2: List Picker */}
      {listOpen && (activeTab === 'page' || activeTab === 'inner') && (
        <div className="absolute z-[300] top-full mt-1 right-0 w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-xl overflow-hidden animate-slide-down flex flex-col max-h-[220px]">
          <div className="overflow-y-auto p-1.5 space-y-0.5">
            
            {activeTab === 'page' && (
              <>
                {pagesLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 size={16} className="animate-spin text-[var(--color-text-faint)]" />
                  </div>
                ) : pages.length === 0 ? (
                  <p className="text-center text-[11px] text-[var(--color-text-faint)] py-4">
                    {isVi ? 'Trống' : 'Empty'}
                  </p>
                ) : (
                  pages.map((pg) => {
                    const slug = pg.slug.startsWith('/') ? pg.slug : `/${pg.slug}`;
                    const isActive = inputVal === slug;
                    return (
                      <button
                        key={pg._id}
                        type="button"
                        onClick={() => { commit(slug); setListOpen(false); }}
                        className={`w-full flex items-center justify-between gap-3 px-2 py-2 rounded-md text-sm transition-all ${
                          isActive
                            ? 'bg-[var(--color-text)] text-[var(--color-bg)]'
                            : 'text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText size={13} className="shrink-0 opacity-70" />
                          <div className="text-left min-w-0">
                            <p className="font-semibold truncate">{pg.title}</p>
                            <p className={`text-[10px] font-mono truncate mt-0.5 ${isActive ? 'opacity-70' : 'text-[var(--color-text-faint)]'}`}>
                              {slug}
                            </p>
                          </div>
                        </div>
                        {isActive && <Check size={13} className="shrink-0" />}
                      </button>
                    );
                  })
                )}
              </>
            )}

            {activeTab === 'inner' && (
              <>
                {innerAnchors.length === 0 ? (
                  <p className="text-center text-[11px] text-[var(--color-text-faint)] py-4">
                    {isVi ? 'Không có phần tử nào được gắn tên (neo).' : 'No named anchors found.'}
                  </p>
                ) : (
                  innerAnchors.map((anchor) => {
                    const val = `#${anchor.id}`;
                    const isActive = inputVal === val;
                    return (
                      <button
                        key={anchor.id}
                        type="button"
                        onClick={() => { commit(val); setListOpen(false); }}
                        className={`w-full flex items-center justify-between gap-3 px-2 py-2 rounded-md text-sm transition-all ${
                          isActive
                            ? 'bg-[var(--color-text)] text-[var(--color-bg)]'
                            : 'text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Hash size={13} className="shrink-0 opacity-70" />
                          <div className="text-left min-w-0">
                            <p className="font-mono font-bold">{val}</p>
                            <p className={`text-[10px] uppercase tracking-wider mt-0.5 ${isActive ? 'opacity-70' : 'text-[var(--color-text-faint)]'}`}>
                              {anchor.label}
                            </p>
                          </div>
                        </div>
                        {isActive && <Check size={13} className="shrink-0" />}
                      </button>
                    );
                  })
                )}
              </>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkPickerField;
