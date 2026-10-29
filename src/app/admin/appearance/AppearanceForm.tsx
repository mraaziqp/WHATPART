'use client';

import { useState, useTransition } from 'react';
import {
  Check,
  RotateCcw,
  Sparkles,
  Palette,
  Layout,
  Layers,
  Flag,
  ShoppingCart,
  Search,
  ExternalLink,
} from 'lucide-react';
import {
  THEME_PRESETS,
  DEFAULT_THEME,
  RADIUS_MAP,
  type ThemeConfig,
} from '@/data/theme';
import { saveAppearanceAction, resetAppearanceAction } from './actions';

const BACKGROUND_SWATCHES = [
  { name: 'Fresh SA Mist', hex: '#f4f7f4' },
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Warm Safari Sand', hex: '#faf7f2' },
  { name: 'Kalahari Light', hex: '#fbf8f3' },
  { name: 'Highveld Slate', hex: '#f1f5f9' },
  { name: 'Drakensberg Dark', hex: '#0f172a' },
];

export function AppearanceForm({ initialTheme }: { initialTheme: ThemeConfig }) {
  const [theme, setTheme] = useState<ThemeConfig>(initialTheme);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const applyPreset = (key: string) => {
    const preset = THEME_PRESETS[key];
    if (preset) {
      setTheme({ ...preset });
      setMessage({ type: 'ok', text: `Loaded preset: "${preset.name}". Click "Save Appearance" to publish live.` });
    }
  };

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await saveAppearanceAction(theme);
      if (res.ok) {
        setMessage({ type: 'ok', text: res.ok });
      } else if (res.error) {
        setMessage({ type: 'error', text: res.error });
      }
    });
  };

  const handleReset = () => {
    if (!confirm('Reset storefront styling to default South African Springbok Green & Gold?')) return;
    setMessage(null);
    startTransition(async () => {
      const res = await resetAppearanceAction();
      if (res.ok) {
        setTheme({ ...DEFAULT_THEME });
        setMessage({ type: 'ok', text: res.ok });
      } else if (res.error) {
        setMessage({ type: 'error', text: res.error });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Alert */}
      {message && (
        <div
          className={`rounded-xl p-4 text-sm font-medium transition ${
            message.type === 'ok'
              ? 'border border-emerald-300 bg-emerald-50 text-emerald-900'
              : 'border border-red-300 bg-red-50 text-red-900'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ─── 1. South African Presets ───────────────────────────────────────── */}
      <div className="card p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-amber-500" />
          <h2 className="text-lg font-bold text-slate-900">South African Theme Presets</h2>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Click any curated South African theme to instantly configure colors, background, and styling.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(THEME_PRESETS).map(([key, preset]) => {
            const isSelected = theme.presetId === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                className={`flex flex-col items-start rounded-xl border p-4 text-left transition ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{preset.name}</span>
                  {isSelected && <Check className="size-4 text-brand-600" />}
                </div>

                {/* Color swatches */}
                <div className="mt-3 flex items-center gap-1.5">
                  <span
                    className="size-5 rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: preset.primaryColor }}
                    title={`Primary: ${preset.primaryColor}`}
                  />
                  <span
                    className="size-5 rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: preset.accentColor }}
                    title={`Accent: ${preset.accentColor}`}
                  />
                  <span
                    className="size-5 rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: preset.pageBgColor }}
                    title={`Background: ${preset.pageBgColor}`}
                  />
                  <span
                    className="size-5 rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: preset.footerBgColor }}
                    title={`Footer: ${preset.footerBgColor}`}
                  />
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  {key === 'springbok' && 'Deep Springbok Green with radiant African Sun Gold.'}
                  {key === 'rainbow' && 'Atlantic Navy, Gold, and iconic Rainbow Flag accents.'}
                  {key === 'kalahari' && 'Warm Terracotta, Acacia Ochre, and desert sand.'}
                  {key === 'drakensberg' && 'Highveld Midnight Slate Navy & Golden Sunrise.'}
                  {key === 'protea' && 'Cape Table Mountain Forest with Protea Crimson Coral.'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 2. Live Interactive Storefront Preview ──────────────────────────── */}
      <div className="card overflow-hidden border-2 border-slate-300">
        <div className="border-b border-slate-200 bg-slate-100 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layout className="size-4 text-slate-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Live Storefront Preview
            </h3>
          </div>
          <span className="rounded bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            Updates in real-time
          </span>
        </div>

        {/* Outer Background Wrapper */}
        <div
          className="p-6 transition-colors duration-300"
          style={{ backgroundColor: theme.pageBgColor, color: theme.pageTextColor }}
        >
          {/* Header Preview */}
          <div className="overflow-hidden rounded-xl shadow-lg border border-black/10">
            {theme.showFlagStrip && (
              <div
                className="h-1.5 w-full"
                style={{
                  background:
                    'linear-gradient(90deg, #007749 0%, #007749 22%, #ffb81c 22%, #ffb81c 38%, #000000 38%, #000000 48%, #ffffff 48%, #ffffff 52%, #de3831 52%, #de3831 75%, #001489 75%, #001489 100%)',
                }}
              />
            )}
            <div
              className="px-4 py-3 text-white transition-colors"
              style={{ backgroundColor: theme.headerBgColor }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 font-black text-lg tracking-tight">
                    <span
                      className="flex size-7 items-center justify-center rounded-lg shadow-sm"
                      style={{ backgroundColor: theme.accentColor, color: theme.accentTextColor }}
                    >
                      ⚙
                    </span>
                    <span>
                      WHAT<span style={{ color: theme.accentColor }}>PART</span>
                    </span>
                  </div>
                  {theme.showZaBadge && (
                    <span className="ml-2 rounded-full border border-white/20 bg-black/25 px-2 py-0.5 text-[10px] font-semibold text-white">
                      🇿🇦 {theme.zaBadgeText || 'Proudly South African'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-md bg-white/10 px-3 py-1.5 text-xs text-white/80">
                    <Search className="size-3.5" />
                    <span>Search brake pads, filters, Hilux...</span>
                  </div>
                  <div
                    className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold"
                    style={{ backgroundColor: theme.accentColor, color: theme.accentTextColor }}
                  >
                    <ShoppingCart className="size-3.5" />
                    <span>Cart (2)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-nav */}
            <div className="flex items-center gap-4 border-b border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700">
              <span className="text-red-600 font-bold">⚡ Daily Deals</span>
              <span>Brakes & Fitment</span>
              <span>Engine Parts</span>
              <span>Suspension</span>
              <span className="ml-auto text-emerald-700 font-normal">
                🚚 Free SA Delivery over R1,500
              </span>
            </div>
          </div>

          {/* Sample Product & Controls Row */}
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {/* Sample Card */}
            <div
              className="border p-4 shadow-sm transition-all"
              style={{
                backgroundColor: theme.cardBgColor,
                borderColor: theme.cardBorderColor,
                borderRadius: RADIUS_MAP[theme.cardRadius] ?? '1rem',
              }}
            >
              <div className="flex items-start justify-between">
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ backgroundColor: theme.accentColor, color: theme.accentTextColor }}
                >
                  Fits Toyota Hilux 2.8 GD-6
                </span>
                <span className="text-[11px] font-semibold text-emerald-700">In Stock • JHB</span>
              </div>

              <h4 className="mt-3 font-bold text-sm text-slate-900">
                Ferodo Premier Front Brake Pad Set (D704)
              </h4>
              <p className="mt-1 text-xs text-slate-500">OE Spec Ceramic • 2-Year Warranty</p>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <div>
                  <p className="text-[10px] text-slate-400">Best Seller Price</p>
                  <p className="text-lg font-black text-slate-900">R 895.00</p>
                </div>
                <button
                  type="button"
                  className="rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm transition hover:opacity-90"
                  style={{ backgroundColor: theme.accentColor, color: theme.accentTextColor }}
                >
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Buttons preview box */}
            <div
              className="border p-4 shadow-sm"
              style={{
                backgroundColor: theme.cardBgColor,
                borderColor: theme.cardBorderColor,
                borderRadius: RADIUS_MAP[theme.cardRadius] ?? '1rem',
              }}
            >
              <p className="text-xs font-bold text-slate-800">Buttons & Actions Style</p>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button"
                  className="w-full rounded-lg px-4 py-2 text-xs font-bold shadow-sm transition hover:opacity-90"
                  style={{ backgroundColor: theme.accentColor, color: theme.accentTextColor }}
                >
                  Primary Action Button ({theme.accentColor})
                </button>
                <button
                  type="button"
                  className="w-full rounded-lg px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Dark Action Button ({theme.primaryColor})
                </button>
                <button
                  type="button"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
                >
                  Outline Button
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. Detailed Customization Controls ─────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Color Palette Controls */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Palette className="size-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900">Header & Primary Colors</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Header Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.headerBgColor}
                  onChange={(e) =>
                    setTheme({ ...theme, headerBgColor: e.target.value, primaryColor: e.target.value, presetId: 'custom' })
                  }
                  className="size-10 cursor-pointer rounded border border-slate-300 p-0.5"
                />
                <input
                  type="text"
                  value={theme.headerBgColor}
                  onChange={(e) =>
                    setTheme({ ...theme, headerBgColor: e.target.value, primaryColor: e.target.value, presetId: 'custom' })
                  }
                  className="input font-mono text-xs uppercase"
                />
              </div>
            </div>

            <div>
              <label className="label">Primary Hover / Secondary Dark</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.primaryHoverColor}
                  onChange={(e) => setTheme({ ...theme, primaryHoverColor: e.target.value, presetId: 'custom' })}
                  className="size-10 cursor-pointer rounded border border-slate-300 p-0.5"
                />
                <input
                  type="text"
                  value={theme.primaryHoverColor}
                  onChange={(e) => setTheme({ ...theme, primaryHoverColor: e.target.value, presetId: 'custom' })}
                  className="input font-mono text-xs uppercase"
                />
              </div>
            </div>

            <div>
              <label className="label">Footer Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.footerBgColor}
                  onChange={(e) => setTheme({ ...theme, footerBgColor: e.target.value, presetId: 'custom' })}
                  className="size-10 cursor-pointer rounded border border-slate-300 p-0.5"
                />
                <input
                  type="text"
                  value={theme.footerBgColor}
                  onChange={(e) => setTheme({ ...theme, footerBgColor: e.target.value, presetId: 'custom' })}
                  className="input font-mono text-xs uppercase"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-amber-500" />
              <h3 className="font-bold text-slate-900">Brand & Accent Colors</h3>
            </div>

            <div>
              <label className="label">Brand Accent Color (Buttons & Highlights)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.accentColor}
                  onChange={(e) => setTheme({ ...theme, accentColor: e.target.value, presetId: 'custom' })}
                  className="size-10 cursor-pointer rounded border border-slate-300 p-0.5"
                />
                <input
                  type="text"
                  value={theme.accentColor}
                  onChange={(e) => setTheme({ ...theme, accentColor: e.target.value, presetId: 'custom' })}
                  className="input font-mono text-xs uppercase"
                />
              </div>
            </div>

            <div>
              <label className="label">Accent Hover Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.accentHoverColor}
                  onChange={(e) => setTheme({ ...theme, accentHoverColor: e.target.value, presetId: 'custom' })}
                  className="size-10 cursor-pointer rounded border border-slate-300 p-0.5"
                />
                <input
                  type="text"
                  value={theme.accentHoverColor}
                  onChange={(e) => setTheme({ ...theme, accentHoverColor: e.target.value, presetId: 'custom' })}
                  className="input font-mono text-xs uppercase"
                />
              </div>
            </div>

            <div>
              <label className="label">Text Color on Accent Buttons</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accentTextColor"
                    checked={theme.accentTextColor !== '#ffffff'}
                    onChange={() => setTheme({ ...theme, accentTextColor: '#062417', presetId: 'custom' })}
                  />
                  <span className="text-sm font-medium">Dark Text (Recommended for Gold/Yellow)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accentTextColor"
                    checked={theme.accentTextColor === '#ffffff'}
                    onChange={() => setTheme({ ...theme, accentTextColor: '#ffffff', presetId: 'custom' })}
                  />
                  <span className="text-sm font-medium">White Text</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Background & Looks Controls */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900">Page Background & Surfaces</h3>
          </div>

          <div>
            <label className="label">Storefront Page Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.pageBgColor}
                onChange={(e) => setTheme({ ...theme, pageBgColor: e.target.value, presetId: 'custom' })}
                className="size-10 cursor-pointer rounded border border-slate-300 p-0.5"
              />
              <input
                type="text"
                value={theme.pageBgColor}
                onChange={(e) => setTheme({ ...theme, pageBgColor: e.target.value, presetId: 'custom' })}
                className="input font-mono text-xs uppercase"
              />
            </div>

            {/* Quick Background Swatches */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {BACKGROUND_SWATCHES.map((swatch) => (
                <button
                  key={swatch.hex}
                  type="button"
                  onClick={() => setTheme({ ...theme, pageBgColor: swatch.hex, presetId: 'custom' })}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium hover:border-slate-400"
                >
                  <span
                    className="size-3 rounded-full border border-black/20"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  {swatch.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Card Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.cardBgColor}
                  onChange={(e) => setTheme({ ...theme, cardBgColor: e.target.value, presetId: 'custom' })}
                  className="size-9 cursor-pointer rounded border border-slate-300 p-0.5"
                />
                <input
                  type="text"
                  value={theme.cardBgColor}
                  onChange={(e) => setTheme({ ...theme, cardBgColor: e.target.value, presetId: 'custom' })}
                  className="input font-mono text-xs uppercase"
                />
              </div>
            </div>

            <div>
              <label className="label">Card Border Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.cardBorderColor}
                  onChange={(e) => setTheme({ ...theme, cardBorderColor: e.target.value, presetId: 'custom' })}
                  className="size-9 cursor-pointer rounded border border-slate-300 p-0.5"
                />
                <input
                  type="text"
                  value={theme.cardBorderColor}
                  onChange={(e) => setTheme({ ...theme, cardBorderColor: e.target.value, presetId: 'custom' })}
                  className="input font-mono text-xs uppercase"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="label">Card Corner Radius (Looks & Shape)</label>
            <div className="grid grid-cols-5 gap-2">
              {(['sm', 'md', 'lg', 'xl', '2xl'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTheme({ ...theme, cardRadius: r, presetId: 'custom' })}
                  className={`rounded-lg border px-3 py-2 text-center text-xs font-semibold transition ${
                    theme.cardRadius === r
                      ? 'border-brand-500 bg-brand-50 text-slate-900 ring-2 ring-brand-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {r.toUpperCase()}
                  <span className="block text-[10px] font-normal text-slate-500">{RADIUS_MAP[r]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5 space-y-4">
            <div className="flex items-center gap-2">
              <Flag className="size-5 text-red-600" />
              <h3 className="font-bold text-slate-900">South African Accents & Badges</h3>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={theme.showFlagStrip}
                onChange={(e) => setTheme({ ...theme, showFlagStrip: e.target.checked, presetId: 'custom' })}
                className="size-4 rounded border-slate-300 text-brand-500 focus:ring-brand-400"
              />
              <span className="text-sm font-medium text-slate-800">
                Display South African Flag 6-Color Accent Line on Header
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={theme.showZaBadge}
                onChange={(e) => setTheme({ ...theme, showZaBadge: e.target.checked, presetId: 'custom' })}
                className="size-4 rounded border-slate-300 text-brand-500 focus:ring-brand-400"
              />
              <span className="text-sm font-medium text-slate-800">
                Display South African Badge in Header
              </span>
            </label>

            {theme.showZaBadge && (
              <div>
                <label className="label">Custom Badge Text</label>
                <input
                  type="text"
                  value={theme.zaBadgeText}
                  onChange={(e) => setTheme({ ...theme, zaBadgeText: e.target.value, presetId: 'custom' })}
                  placeholder="e.g. Proudly South African"
                  className="input"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Bottom Actions Bar ─────────────────────────────────────────────── */}
      <div className="card sticky bottom-4 z-30 flex flex-wrap items-center justify-between gap-4 border-2 border-slate-300 bg-white/95 p-4 backdrop-blur shadow-xl">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">Theme:</span> {theme.name}
          {theme.presetId === 'custom' && <span className="text-xs text-amber-600 font-medium">(Customized)</span>}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={isPending}
            className="btn-outline flex items-center gap-1.5 text-xs text-slate-600"
          >
            <RotateCcw className="size-3.5" />
            Reset to Default
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm font-bold shadow-md"
          >
            {isPending ? 'Publishing Changes...' : 'Save Appearance'}
          </button>
        </div>
      </div>
    </div>
  );
}
