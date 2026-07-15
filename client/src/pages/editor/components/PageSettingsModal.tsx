import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { X, Check, Loader2, RotateCcw, ChevronDown, Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { t } from '../../../i18n';
import { useUIStore } from '../../../store/uiStore';
import { usePageStore } from '../../../store/pageStore';
import type {
  PageLayoutSettings,
  PortfolioColors,
  PortfolioFonts,
  ColorScheme,
} from '../../../core/types/layout.types';
import {
  AVAILABLE_FONTS,
  DEFAULT_PORTFOLIO_SETTINGS,
} from '../../../core/types/layout.types';

// ─── Google Fonts — preloaded via single CDN link ────────────────────────────
// We load all available fonts upfront in one request instead of lazy loading
// individual font families at runtime. This ensures instant rendering when
// the user picks a font from the selector.

const FONT_FAMILIES_QUERY = AVAILABLE_FONTS
  .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
  .join('&');

const FONT_CDN_URL = `https://fonts.googleapis.com/css2?${FONT_FAMILIES_QUERY}&display=swap`;

let fontLinkInjected = false;
function ensureFontsLoaded() {
  if (fontLinkInjected) return;
  fontLinkInjected = true;
  if (document.getElementById('cms-google-fonts')) return;
  const link = document.createElement('link');
  link.id = 'cms-google-fonts';
  link.rel = 'stylesheet';
  link.href = FONT_CDN_URL;
  document.head.appendChild(link);
}

// ─── Types ───────────────────────────────────────────────────────────────────

type SettingsMenu = 'general' | 'format';
type ColorModeTab = 'light' | 'dark';

interface PageSettingsState {
  pageLayout: PageLayoutSettings;
  colors: PortfolioColors;
  fonts: PortfolioFonts;
}

interface PageSettingsModalProps {
  portfolioId: string;
  pageId: string;
  isOpen: boolean;
  onClose: () => void;
}

// ─── Layout Preview ──────────────────────────────────────────────────────────

const LayoutPreview: React.FC<{
  type: 'normal' | 'fluid';
  selected: boolean;
  onClick: () => void;
  label: string;
  desc: string;
}> = ({ type, selected, onClick, label, desc }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'relative flex-1 flex flex-col items-center gap-3 p-4 rounded-md border-2 transition-all cursor-pointer group',
        selected
          ? 'border-[var(--color-text)] bg-[var(--color-surface-2)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)]',
      )}
    >
      {selected && (
        <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-[var(--color-text)] flex items-center justify-center shadow-sm">
          <Check size={11} className="text-[var(--color-bg)]" />
        </div>
      )}

      {/* Miniature page preview */}
      <div className="w-full h-24 rounded-md bg-[var(--color-surface-3)] border border-[var(--color-border)] overflow-hidden relative flex items-center justify-center">
        {type === 'normal' && (
          <div className="w-full h-full p-4 flex flex-col gap-2.5 justify-center">
            <div className="h-1.5 rounded-full bg-[var(--color-text-muted)]/50 w-3/4" />
            <div className="h-1.5 rounded-full bg-[var(--color-text-muted)]/50 w-1/2" />
            <div className="h-1.5 rounded-full bg-[var(--color-text-muted)]/50 w-full" />
            <div className="h-1.5 rounded-full bg-[var(--color-text-muted)]/50 w-1/3" />
          </div>
        )}
        {type === 'fluid' && (
          <div className="w-[55%] h-full border-x border-dashed border-[var(--color-border-strong)] flex flex-col gap-2.5 justify-center p-3 relative bg-[var(--color-surface-2)]">
            <div className="h-1.5 rounded-full bg-[var(--color-text-muted)]/50 w-full" />
            <div className="h-1.5 rounded-full bg-[var(--color-text-muted)]/50 w-3/4" />
            <div className="h-1.5 rounded-full bg-[var(--color-text-muted)]/50 w-5/6" />
            <div className="h-1.5 rounded-full bg-[var(--color-text-muted)]/50 w-1/2" />
          </div>
        )}
      </div>

      <div className="text-center">
        <p className={clsx('text-sm font-semibold', selected ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]')}>
          {label}
        </p>
        <p className="text-xs text-[var(--color-text-faint)] mt-0.5">{desc}</p>
      </div>
    </button>
  );
};

// ─── Color Picker ────────────────────────────────────────────────────────────

const ColorPicker: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[var(--color-text-muted)]">{label}</label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          className="w-9 h-9 rounded-md border-2 border-[var(--color-border)] shadow-sm cursor-pointer flex-shrink-0 transition-transform hover:scale-105"
          style={{ backgroundColor: value }}
          title={value}
        />
        <input ref={inputRef} type="color" value={value} onChange={(e) => onChange(e.target.value)} className="sr-only" />
        <input
          type="text"
          value={value}
          onChange={(e) => { const v = e.target.value; if (/^#([0-9a-fA-F]{0,6})$/.test(v)) onChange(v); }}
          className="flex-1 px-2.5 py-1.5 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-text)] font-mono focus:outline-none focus:border-[var(--color-border-strong)]"
          placeholder="#000000"
          maxLength={7}
        />
      </div>
    </div>
  );
};

// ─── Font Selector ───────────────────────────────────────────────────────────

const FontSelector: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-[var(--color-text-muted)]">{label}</label>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((p) => !p)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text)] hover:border-[var(--color-border-strong)] transition-colors"
        >
          <span style={{ fontFamily: `'${value}', sans-serif` }}>{value}</span>
          <ChevronDown size={13} className={clsx('text-[var(--color-text-muted)] transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <div className="absolute z-50 left-0 right-0 top-full mt-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl overflow-hidden max-h-52 overflow-y-auto">
            {AVAILABLE_FONTS.map((font) => (
              <button
                key={font}
                onClick={() => { onChange(font); setOpen(false); }}
                className={clsx(
                  'w-full text-left px-3 py-2.5 text-sm flex items-center justify-between transition-colors',
                  value === font
                    ? 'bg-[var(--color-surface-2)] text-[var(--color-text)]'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]',
                )}
                style={{ fontFamily: `'${font}', sans-serif` }}
              >
                {font}
                {value === font && <Check size={12} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Modal ──────────────────────────────────────────────────────────────

export const PageSettingsModal: React.FC<PageSettingsModalProps> = ({
  portfolioId,
  pageId,
  isOpen,
  onClose,
}) => {
  const { language } = useUIStore();
  const tr = t(language).editor.pageSettings;
  const { current: page, update: updatePage } = usePageStore();

  const [activeMenu, setActiveMenu] = useState<SettingsMenu>('general');
  const [colorModeTab, setColorModeTab] = useState<ColorModeTab>('light');
  const [showCustomLayout, setShowCustomLayout] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // ── Preload all Google Fonts when modal opens for the first time ──
  useEffect(() => {
    if (isOpen) ensureFontsLoaded();
  }, [isOpen]);

  // ── Local settings state ──
  const [settings, setSettings] = useState<PageSettingsState>(() => ({
    pageLayout: page?.meta?.pageLayout ?? DEFAULT_PORTFOLIO_SETTINGS.pageLayout,
    colors:     page?.meta?.colors     ?? DEFAULT_PORTFOLIO_SETTINGS.colors,
    fonts:      { main: page?.meta?.fonts?.main ?? DEFAULT_PORTFOLIO_SETTINGS.fonts.main },
  }));

  // Sync from page when it loads / changes
  useEffect(() => {
    if (page?.meta) {
      setSettings({
        pageLayout: page.meta.pageLayout ?? DEFAULT_PORTFOLIO_SETTINGS.pageLayout,
        colors:     page.meta.colors     ?? DEFAULT_PORTFOLIO_SETTINGS.colors,
        fonts:      { main: page.meta.fonts?.main ?? DEFAULT_PORTFOLIO_SETTINGS.fonts.main },
      });
      setShowCustomLayout(page.meta.pageLayout?.type === 'custom');
    }
  }, [page]);

  // ── Helpers ──
  const updateLayout = useCallback((patch: Partial<PageLayoutSettings>) => {
    setSettings((s) => ({ ...s, pageLayout: { ...s.pageLayout, ...patch } }));
  }, []);

  const updateColorScheme = useCallback((mode: ColorModeTab, patch: Partial<ColorScheme>) => {
    setSettings((s) => ({
      ...s,
      colors: { ...s.colors, [mode]: { ...s.colors[mode], ...patch } },
    }));
  }, []);

  const updateFont = useCallback((field: keyof PortfolioFonts, value: string) => {
    setSettings((s) => ({ ...s, fonts: { ...s.fonts, [field]: value } }));
  }, []);

  const addAccent = useCallback((mode: ColorModeTab) => {
    setSettings((s) => {
      const current = s.colors[mode].accents ?? [];
      if (current.length >= 5) return s;
      return { ...s, colors: { ...s.colors, [mode]: { ...s.colors[mode], accents: [...current, '#a78bfa'] } } };
    });
  }, []);

  const removeAccent = useCallback((mode: ColorModeTab, idx: number) => {
    setSettings((s) => {
      const next = [...(s.colors[mode].accents ?? [])];
      next.splice(idx, 1);
      return { ...s, colors: { ...s.colors, [mode]: { ...s.colors[mode], accents: next } } };
    });
  }, []);

  const updateAccent = useCallback((mode: ColorModeTab, idx: number, value: string) => {
    setSettings((s) => {
      const next = [...(s.colors[mode].accents ?? [])];
      next[idx] = value;
      return { ...s, colors: { ...s.colors, [mode]: { ...s.colors[mode], accents: next } } };
    });
  }, []);

  const handleResetGeneral = useCallback(() => {
    setSettings((s) => ({ ...s, pageLayout: DEFAULT_PORTFOLIO_SETTINGS.pageLayout }));
    setShowCustomLayout(false);
  }, []);

  const handleResetFormat = useCallback(() => {
    setSettings((s) => ({
      ...s,
      colors: DEFAULT_PORTFOLIO_SETTINGS.colors,
      fonts: DEFAULT_PORTFOLIO_SETTINGS.fonts,
    }));
  }, []);

  const hasChanges = useMemo(() => {
    const current = {
      pageLayout: page?.meta?.pageLayout ?? DEFAULT_PORTFOLIO_SETTINGS.pageLayout,
      colors:     page?.meta?.colors     ?? DEFAULT_PORTFOLIO_SETTINGS.colors,
      fonts:      page?.meta?.fonts      ?? DEFAULT_PORTFOLIO_SETTINGS.fonts,
    };
    return JSON.stringify(current) !== JSON.stringify(settings);
  }, [page?.meta, settings]);

  const handleSave = useCallback(async () => {
    if (!portfolioId || !pageId) return;
    setIsSaving(true);
    try {
      // Save design settings into page.meta (per-page configuration)
      await updatePage(portfolioId, pageId, {
        meta: {
          ...page?.meta,
          pageLayout: settings.pageLayout,
          colors:     settings.colors,
          fonts:      settings.fonts,
        },
      } as any);
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2000);
    } catch (err) {
      console.error('Failed to save page settings:', err);
    } finally {
      setIsSaving(false);
    }
  }, [portfolioId, pageId, page?.meta, settings, updatePage]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentColorScheme = settings.colors[colorModeTab];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative z-10 flex rounded-lg overflow-hidden shadow-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
        style={{ width: 820, height: 600, maxWidth: '95vw', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Left Menu (3/10) ─────────────────────────────── */}
        <aside className="flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-2)] shrink-0"
          style={{ width: 210 }}>
          <div className="px-4 py-4 border-b border-[var(--color-border)]">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">{tr.title}</h2>
            {page?.title && (
              <p className="text-xs text-[var(--color-text-faint)] mt-0.5 truncate">{page.title}</p>
            )}
          </div>

          <nav className="flex flex-col gap-1 p-2 flex-1">
            {(
              [
                { key: 'general', label: tr.menuGeneral },
                { key: 'format',  label: tr.menuFormat  },
              ] as { key: SettingsMenu; label: string }[]
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveMenu(key)}
                className={clsx(
                  'w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-all',
                  activeMenu === key
                    ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]',
                )}
              >
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Right Content (7/10) ─────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">
                {activeMenu === 'general' ? tr.generalTitle : tr.formatTitle}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                {activeMenu === 'general' ? tr.generalDesc : tr.formatDesc}
              </p>
            </div>
            <button onClick={onClose}
              className="p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* ══ GENERAL TAB ════════════════════════════════ */}
            {activeMenu === 'general' && (
              <div className="space-y-6">
                {/* Normal / Fluid cards */}
                <div className="flex gap-3">
                  <LayoutPreview
                    type="normal"
                    selected={settings.pageLayout.type === 'normal'}
                    onClick={() => { updateLayout({ type: 'normal' }); setShowCustomLayout(false); }}
                    label={tr.layoutNormal}
                    desc={tr.layoutNormalDesc}
                  />
                  <LayoutPreview
                    type="fluid"
                    selected={settings.pageLayout.type === 'fluid'}
                    onClick={() => { updateLayout({ type: 'fluid' }); setShowCustomLayout(false); }}
                    label={tr.layoutFluid}
                    desc={tr.layoutFluidDesc}
                  />
                </div>

                {/* Custom toggle button */}
                <button
                  onClick={() => {
                    const next = !showCustomLayout;
                    setShowCustomLayout(next);
                    if (next) updateLayout({ type: 'custom' });
                    else updateLayout({ type: 'normal' });
                  }}
                  className={clsx(
                    'w-full flex items-center justify-between px-4 py-3 rounded-md border-2 transition-all text-sm font-medium',
                    showCustomLayout
                      ? 'border-[var(--color-text)] bg-[var(--color-surface-2)] text-[var(--color-text)]'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>{tr.layoutCustom}</span>
                    <span className="text-xs font-normal text-[var(--color-text-faint)]">— {tr.layoutCustomDesc}</span>
                  </div>
                  {showCustomLayout && <Check size={16} className="text-[var(--color-text)]" />}
                </button>

                {/* Custom padding + live preview via Grid */}
                {showCustomLayout && (
                  <div className="grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] gap-4 items-center justify-items-center bg-[var(--color-surface-2)] p-6 rounded-md border border-[var(--color-border)] mt-4 animate-in fade-in duration-200">
                    
                    {/* Top */}
                    <div className="col-start-2 row-start-1 flex flex-col items-center gap-1">
                      <label className="text-xs font-medium text-[var(--color-text-muted)]">{tr.paddingTop} (px)</label>
                      <input
                        type="number" min={0} max={300}
                        value={settings.pageLayout.padding.top}
                        onChange={(e) => updateLayout({ padding: { ...settings.pageLayout.padding, top: e.target.value } })}
                        className="w-20 px-2 py-1.5 text-center text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-border-strong)] focus:outline-none [appearance:textfield]"
                      />
                    </div>

                    {/* Left */}
                    <div className="col-start-1 row-start-2 flex flex-col items-center gap-1">
                      <label className="text-xs font-medium text-[var(--color-text-muted)]">{tr.paddingLeft} (px)</label>
                      <input
                        type="number" min={0} max={300}
                        value={settings.pageLayout.padding.left}
                        onChange={(e) => updateLayout({ padding: { ...settings.pageLayout.padding, left: e.target.value } })}
                        className="w-20 px-2 py-1.5 text-center text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-border-strong)] focus:outline-none [appearance:textfield]"
                      />
                    </div>

                    {/* Center Preview */}
                    <div className="col-start-2 row-start-2 w-56 h-36 bg-[var(--color-surface-3)] border-2 border-dashed border-[var(--color-border)] rounded-md relative overflow-hidden">
                      <div 
                        className="absolute bg-[var(--color-text)]/10 border border-[var(--color-border-strong)]/20 rounded transition-all flex flex-col items-center justify-center gap-2 overflow-hidden"
                        style={{
                          top: `${Math.min(Number(settings.pageLayout.padding.top) / 8, 45)}%`,
                          bottom: `${Math.min(Number(settings.pageLayout.padding.bottom) / 8, 45)}%`,
                          left: `${Math.min(Number(settings.pageLayout.padding.left) / 8, 45)}%`,
                          right: `${Math.min(Number(settings.pageLayout.padding.right) / 8, 45)}%`,
                        }}
                      >
                        <div className="w-1/2 h-1.5 bg-[var(--color-text-muted)]/40 rounded-full" />
                        <div className="w-3/4 h-1.5 bg-[var(--color-text-muted)]/40 rounded-full" />
                        <div className="w-2/3 h-1.5 bg-[var(--color-text-muted)]/40 rounded-full" />
                      </div>
                    </div>

                    {/* Right */}
                    <div className="col-start-3 row-start-2 flex flex-col items-center gap-1">
                      <label className="text-xs font-medium text-[var(--color-text-muted)]">{tr.paddingRight} (px)</label>
                      <input
                        type="number" min={0} max={300}
                        value={settings.pageLayout.padding.right}
                        onChange={(e) => updateLayout({ padding: { ...settings.pageLayout.padding, right: e.target.value } })}
                        className="w-20 px-2 py-1.5 text-center text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-border-strong)] focus:outline-none [appearance:textfield]"
                      />
                    </div>

                    {/* Bottom */}
                    <div className="col-start-2 row-start-3 flex flex-col items-center gap-1">
                      <input
                        type="number" min={0} max={300}
                        value={settings.pageLayout.padding.bottom}
                        onChange={(e) => updateLayout({ padding: { ...settings.pageLayout.padding, bottom: e.target.value } })}
                        className="w-20 px-2 py-1.5 text-center text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-border-strong)] focus:outline-none [appearance:textfield]"
                      />
                      <label className="text-xs font-medium text-[var(--color-text-muted)]">{tr.paddingBottom} (px)</label>
                    </div>

                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex justify-start">
                  <button
                    onClick={handleResetGeneral}
                    className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    <RotateCcw size={12} />
                    {tr.reset}
                  </button>
                </div>
              </div>
            )}

            {/* ══ FORMAT TAB ══════════════════════════════════ */}
            {activeMenu === 'format' && (
              <div className="space-y-8">

                {/* Colors */}
                <section>
                  <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-4">
                    {tr.colorsTitle}
                  </h4>

                  {/* Light / Dark tabs */}
                  <div className="flex gap-1 p-1 rounded-md bg-[var(--color-surface-2)] mb-5 w-fit">
                    {(['light', 'dark'] as ColorModeTab[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setColorModeTab(mode)}
                        className={clsx(
                          'px-4 py-1.5 rounded text-xs font-medium transition-all',
                          colorModeTab === mode
                            ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm'
                            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
                        )}
                      >
                        {mode === 'light' ? tr.colorsLightMode : tr.colorsDarkMode}
                      </button>
                    ))}
                  </div>

                  {/* Primary + Secondary */}
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <ColorPicker label={tr.colorPrimary}   value={currentColorScheme.primary}   onChange={(v) => updateColorScheme(colorModeTab, { primary:   v })} />
                    <ColorPicker label={tr.colorSecondary} value={currentColorScheme.secondary} onChange={(v) => updateColorScheme(colorModeTab, { secondary: v })} />
                  </div>

                  {/* Accent colors */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[var(--color-text-muted)]">{tr.colorAccents}</label>
                    <div className="flex flex-wrap gap-2 items-center">
                      {(currentColorScheme.accents ?? []).map((accent, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 group">
                          <div className="relative">
                            <input
                              type="color"
                              value={accent}
                              onChange={(e) => updateAccent(colorModeTab, idx, e.target.value)}
                              className="sr-only"
                              id={`accent-${colorModeTab}-${idx}`}
                            />
                            <label
                              htmlFor={`accent-${colorModeTab}-${idx}`}
                              className="w-8 h-8 rounded-md border-2 border-[var(--color-border)] cursor-pointer block shadow-sm hover:scale-105 transition-transform"
                              style={{ backgroundColor: accent }}
                              title={accent}
                            />
                          </div>
                          <button
                            onClick={() => removeAccent(colorModeTab, idx)}
                            className="w-5 h-5 rounded bg-[var(--color-surface-3)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                      {(currentColorScheme.accents?.length ?? 0) < 5 ? (
                        <button
                          onClick={() => addAccent(colorModeTab)}
                          className="w-8 h-8 rounded-md border-2 border-dashed border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)] flex items-center justify-center transition-colors"
                          title={tr.addAccent}
                        >
                          <Plus size={13} />
                        </button>
                      ) : (
                        <span className="text-xs text-[var(--color-text-faint)]">{tr.maxAccents}</span>
                      )}
                    </div>
                  </div>
                </section>

                {/* Fonts */}
                <section>
                  <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-4">
                    {tr.fontsTitle}
                  </h4>
                  <div className="space-y-5">
                    <FontSelector
                      label={tr.fontsTitle}
                      value={settings.fonts.main}
                      onChange={(v) => updateFont('main', v)}
                    />
                  </div>
                </section>

                <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex justify-start">
                  <button
                    onClick={handleResetFormat}
                    className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    <RotateCcw size={12} />
                    {tr.reset}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface-2)]">
            <button onClick={onClose}
              className="px-4 py-2 rounded-md text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-3)] transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className={clsx(
                'flex items-center gap-2 px-5 py-2 rounded-md text-sm font-semibold transition-all',
                savedFeedback
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : isSaving
                    ? 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)] cursor-wait'
                    : !hasChanges
                      ? 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)] opacity-50 cursor-not-allowed'
                      : 'bg-[var(--color-text)]/10 text-[var(--color-text)] hover:bg-[var(--color-text)]/15',
              )}
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : savedFeedback ? <Check size={14} /> : null}
              {isSaving ? tr.saving : savedFeedback ? tr.saved : tr.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
