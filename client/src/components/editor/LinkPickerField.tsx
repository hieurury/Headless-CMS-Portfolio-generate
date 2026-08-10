import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, Globe, FileText, Hash, ChevronDown, Check, X, Loader2 } from 'lucide-react';
import { usePageStore } from '../../store/pageStore';
import type { Page } from '../../core/types/layout.types';
import { useUIStore } from '../../store/uiStore';
import { pageService } from '../../services/page.service';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function detectType(val: string): LinkType {
  if (!val) return 'url';
  if (val.startsWith('#')) return 'inner';
  if (val.startsWith('/') && !val.startsWith('//')) return 'page';
  return 'url';
}

function scanInnerAnchors(): InnerAnchor[] {
  const container =
    document.querySelector('.editor-preview-container') ||
    document.querySelector('[data-editor-canvas]') ||
    document.body;

  const elements = container.querySelectorAll('[id]');
  const anchors: InnerAnchor[] = [];
  const seen = new Set<string>();

  elements.forEach((el) => {
    const id = el.id;
    if (!id || seen.has(id)) return;
    if (id.startsWith('editor-') || id.startsWith('__') || id.startsWith('react-')) return;
    seen.add(id);
    const tag = el.tagName.toLowerCase();
    anchors.push({ id, label: `${tag}#${id}` });
  });

  return anchors;
}

const TABS: {
  key: LinkType;
  icon: React.FC<{ size?: number; className?: string }>;
  en: string;
  vi: string;
  descEn: string;
  descVi: string;
}[] = [
  {
    key: 'url',
    icon: Globe,
    en: 'URL',
    vi: 'URL',
    descEn: 'Link to an external website. Paste the full address (e.g. https://google.com)',
    descVi: 'Liên kết ra ngoài. Dán địa chỉ đầy đủ (vd: https://google.com)',
  },
  {
    key: 'page',
    icon: FileText,
    en: 'Page',
    vi: 'Trang',
    descEn: 'Navigate to another page in this portfolio',
    descVi: 'Điều hướng đến trang khác trong portfolio này',
  },
  {
    key: 'inner',
    icon: Hash,
    en: 'Inner',
    vi: 'Trong trang',
    descEn: 'Scroll to a section on the current page using its ID (e.g. #contact)',
    descVi: 'Cuộn đến phần tử trong trang dùng ID của nó (vd: #contact)',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const LinkPickerField: React.FC<LinkPickerFieldProps> = ({
  value,
  onChange,
  placeholder,
  portfolioId,
  pages: pagesProp,
}) => {
  const { language } = useUIStore();
  const isVi = language === 'vi';

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<LinkType>(() => detectType(value));
  const [inputVal, setInputVal] = useState(value ?? '');
  const [urlInput, setUrlInput] = useState('');
  const [innerManual, setInnerManual] = useState('');
  const [pages, setPages] = useState<Page[]>(pagesProp ?? []);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [innerAnchors, setInnerAnchors] = useState<InnerAnchor[]>([]);

  const popoverRef = useRef<HTMLDivElement>(null);
  const storePages = usePageStore((s) => s.pages);
  const currentLinkType = detectType(inputVal);

  // Sync when external value changes
  useEffect(() => {
    setInputVal(value ?? '');
    const type = detectType(value ?? '');
    if (type === 'url') setUrlInput(value ?? '');
    if (type === 'inner') setInnerManual((value ?? '').slice(1));
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [open]);

  const loadPages = useCallback(async () => {
    if (pagesProp && pagesProp.length > 0) { setPages(pagesProp); return; }
    if (storePages.length > 0) { setPages(storePages); return; }
    if (!portfolioId) return;
    setPagesLoading(true);
    try {
      const fetched = await pageService.getAll(portfolioId);
      setPages(fetched);
    } catch { /* silent */ }
    finally { setPagesLoading(false); }
  }, [pagesProp, portfolioId, storePages]);

  const handleOpen = () => {
    const type = detectType(inputVal);
    setActiveTab(type);
    if (type === 'url') setUrlInput(inputVal);
    if (type === 'inner') setInnerManual(inputVal.startsWith('#') ? inputVal.slice(1) : '');
    setOpen(true);
    if (type === 'page') loadPages();
    if (type === 'inner') setInnerAnchors(scanInnerAnchors());
  };

  const handleTabChange = (tab: LinkType) => {
    setActiveTab(tab);
    if (tab === 'page') loadPages();
    if (tab === 'inner') setInnerAnchors(scanInnerAnchors());
  };

  const commit = useCallback(
    (val: string) => {
      setInputVal(val);
      onChange(val);
    },
    [onChange],
  );

  // Type label for the button badge
  const typeBadge =
    currentLinkType === 'url'
      ? 'URL'
      : currentLinkType === 'page'
        ? isVi ? 'Trang' : 'Page'
        : isVi ? 'Trong' : 'Inner';

  return (
    <div className="relative w-full">
      {/* ── Input Row ─────────────────────────────────────────────────── */}
      <div className="flex items-center rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] overflow-hidden focus-within:border-[var(--color-text-muted)] transition-colors h-9">
        <div className="pl-3 pr-1.5 flex items-center shrink-0 text-[var(--color-text-faint)]">
          <Link size={13} />
        </div>

        <input
          type="text"
          value={inputVal}
          placeholder={
            placeholder ??
            (isVi ? '#id, /trang hoặc https://...' : '#id, /page or https://...')
          }
          onChange={(e) => {
            const v = e.target.value;
            setInputVal(v);
            onChange(v);
          }}
          className="flex-1 bg-transparent text-sm text-[var(--color-text)] focus:outline-none min-w-0 py-1"
        />

        {/* Options button */}
        <button
          type="button"
          onClick={handleOpen}
          title={isVi ? 'Chọn loại liên kết' : 'Pick link type'}
          className="h-full px-2.5 border-l border-[var(--color-border)] text-[var(--color-text-faint)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-3,var(--color-surface-2))] transition-colors flex items-center gap-1 shrink-0"
        >
          <span className="text-[10px] font-bold uppercase tracking-wide leading-none">
            {typeBadge}
          </span>
          <ChevronDown size={11} />
        </button>
      </div>

      {/* ── Popover ────────────────────────────────────────────────────── */}
      {open && (
        <div
          ref={popoverRef}
          className="absolute z-[300] top-full mt-1.5 left-0 w-[280px] rounded-lg shadow-2xl shadow-black/60 overflow-hidden animate-slide-up"
          style={{
            background: 'rgba(10,10,22,0.97)',
            border: '1px solid rgba(255,255,255,0.10)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/8">
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
              {isVi ? 'Loại liên kết' : 'Link Type'}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-0.5 rounded text-[var(--color-text-faint)] hover:text-[var(--color-text)] transition-all"
            >
              <X size={12} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/8">
            {TABS.map(({ key, icon: Icon, en, vi }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleTabChange(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold border-b-2 transition-all ${
                  activeTab === key
                    ? 'border-[var(--color-text)] text-[var(--color-text)]'
                    : 'border-transparent text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)]'
                }`}
              >
                <Icon size={12} />
                {isVi ? vi : en}
              </button>
            ))}
          </div>

          {/* Tab description */}
          {(() => {
            const tab = TABS.find((t) => t.key === activeTab)!;
            return (
              <p className="px-3 pt-2.5 pb-1 text-[11px] text-[var(--color-text-faint)] leading-relaxed">
                {isVi ? tab.descVi : tab.descEn}
              </p>
            );
          })()}

          {/* Tab Body */}
          <div className="px-3 pb-3 pt-2 max-h-[240px] overflow-y-auto space-y-1.5">
            {/* ── URL ─────────────────────────────────────────────── */}
            {activeTab === 'url' && (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  type="url"
                  value={urlInput}
                  placeholder="https://"
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { commit(urlInput); setOpen(false); }
                  }}
                  className="flex-1 px-3 py-2 rounded-md bg-[rgba(255,255,255,0.06)] border border-white/10 text-[var(--color-text)] text-sm placeholder-[var(--color-text-faint)] focus:outline-none focus:border-white/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => { commit(urlInput); setOpen(false); }}
                  className="px-3 py-2 rounded-md bg-[var(--color-text)] text-[var(--color-bg)] text-xs font-bold hover:opacity-85 transition-opacity shrink-0 flex items-center gap-1"
                >
                  <Check size={12} />
                  {isVi ? 'Dùng' : 'Use'}
                </button>
              </div>
            )}

            {/* ── Page ─────────────────────────────────────────────── */}
            {activeTab === 'page' && (
              <>
                {pagesLoading ? (
                  <div className="flex justify-center py-5">
                    <Loader2 size={18} className="animate-spin text-[var(--color-text-faint)]" />
                  </div>
                ) : pages.length === 0 ? (
                  <p className="text-center text-[11px] text-[var(--color-text-faint)] py-5">
                    {isVi ? 'Không tìm thấy trang nào' : 'No pages found'}
                  </p>
                ) : (
                  pages.map((pg) => {
                    const slug = pg.slug.startsWith('/') ? pg.slug : `/${pg.slug}`;
                    const isActive = inputVal === slug;
                    return (
                      <button
                        key={pg._id}
                        type="button"
                        onClick={() => { commit(slug); setOpen(false); }}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
                          isActive
                            ? 'bg-[var(--color-text)] text-[var(--color-bg)]'
                            : 'text-[var(--color-text)] hover:bg-white/6'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText size={13} className="shrink-0 opacity-70" />
                          <div className="text-left min-w-0">
                            <p className="font-semibold truncate">{pg.title}</p>
                            <p className={`text-[10px] font-mono truncate mt-0.5 ${isActive ? 'opacity-60' : 'text-[var(--color-text-faint)]'}`}>
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

            {/* ── Inner ────────────────────────────────────────────── */}
            {activeTab === 'inner' && (
              <>
                {/* Manual input */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[var(--color-text-faint)] font-mono text-sm shrink-0">#</span>
                  <input
                    autoFocus
                    type="text"
                    value={innerManual}
                    placeholder={isVi ? 'nhập id...' : 'type id...'}
                    onChange={(e) => setInnerManual(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && innerManual) {
                        commit(`#${innerManual}`);
                        setOpen(false);
                      }
                    }}
                    className="flex-1 px-2 py-1.5 rounded-md bg-[rgba(255,255,255,0.06)] border border-white/10 text-[var(--color-text)] text-sm focus:outline-none focus:border-white/20 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => { if (innerManual) { commit(`#${innerManual}`); setOpen(false); } }}
                    disabled={!innerManual}
                    className="px-2.5 py-1.5 rounded-md bg-[var(--color-text)] text-[var(--color-bg)] text-xs font-bold hover:opacity-85 transition-opacity disabled:opacity-30"
                  >
                    <Check size={12} />
                  </button>
                </div>

                {/* Detected anchors */}
                {innerAnchors.length > 0 && (
                  <>
                    <p className="text-[10px] text-[var(--color-text-faint)] uppercase tracking-wider font-bold pb-1 border-t border-white/6 pt-1.5">
                      {isVi ? 'Phần tử phát hiện được' : 'Detected elements'}
                    </p>
                    {innerAnchors.map((anchor) => {
                      const val = `#${anchor.id}`;
                      const isActive = inputVal === val;
                      return (
                        <button
                          key={anchor.id}
                          type="button"
                          onClick={() => { commit(val); setOpen(false); }}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm transition-all ${
                            isActive
                              ? 'bg-[var(--color-text)] text-[var(--color-bg)]'
                              : 'text-[var(--color-text)] hover:bg-white/6'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Hash size={12} className="shrink-0 opacity-60" />
                            <div className="text-left min-w-0">
                              <p className="font-mono font-bold">{val}</p>
                              <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'opacity-60' : 'text-[var(--color-text-faint)]'}`}>
                                {anchor.label}
                              </p>
                            </div>
                          </div>
                          {isActive && <Check size={13} className="shrink-0" />}
                        </button>
                      );
                    })}
                  </>
                )}

                {innerAnchors.length === 0 && (
                  <p className="text-[11px] text-[var(--color-text-faint)] text-center py-2">
                    {isVi
                      ? 'Không tìm thấy phần tử nào có ID trên canvas.'
                      : 'No elements with IDs detected on the canvas.'}
                  </p>
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
