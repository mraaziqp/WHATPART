'use client';

import { useState, useTransition, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Check,
  RotateCcw,
  Sparkles,
  Palette,
  ShoppingCart,
  Search,
  ExternalLink,
  Upload,
  Download,
  Smartphone,
  Tablet,
  Monitor,
  Car,
  Megaphone,
  Phone,
  Sliders,
  Save,
} from 'lucide-react';
import {
  THEME_PRESETS,
  DEFAULT_THEME,
  RADIUS_MAP,
  type ThemeConfig,
} from '@/data/theme';
import { saveAppearanceAction, resetAppearanceAction } from './actions';
import { Logo } from '@/components/Logo';

const BACKGROUND_SWATCHES = [
  { name: 'Fresh SA Mist', hex: '#f4f7f4' },
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Warm Safari Sand', hex: '#faf7f2' },
  { name: 'Kalahari Light', hex: '#fbf8f3' },
  { name: 'Highveld Slate', hex: '#f1f5f9' },
  { name: 'Midnight Dark', hex: '#0f1013' },
];

type ActiveTab = 'branding' | 'palette' | 'announcement' | 'hero' | 'looks' | 'contact';
type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export function AppearanceForm({ initialTheme }: { initialTheme: ThemeConfig }) {
  const [theme, setTheme] = useState<ThemeConfig>(initialTheme);
  const [savedTheme, setSavedTheme] = useState<ThemeConfig>(initialTheme);
  const [activeTab, setActiveTab] = useState<ActiveTab>('branding');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(theme) !== JSON.stringify(savedTheme);
  }, [theme, savedTheme]);

  const applyPreset = (key: string) => {
    const preset = THEME_PRESETS[key];
    if (preset) {
      setTheme({ ...preset });
      setMessage({
        type: 'ok',
        text: `Loaded preset: "${preset.name}". Preview updated live below. Click "Save & Publish Changes" to go live.`,
      });
    }
  };

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await saveAppearanceAction(theme);
      if (res.ok) {
        setSavedTheme({ ...theme });
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
        setSavedTheme({ ...DEFAULT_THEME });
        setMessage({ type: 'ok', text: res.ok });
      } else if (res.error) {
        setMessage({ type: 'error', text: res.error });
      }
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/upload-logo', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setTheme((prev) => ({
        ...prev,
        logoVariant: 'custom',
        customLogoUrl: data.url,
        presetId: 'custom',
      }));
      setMessage({
        type: 'ok',
        text: 'Custom logo uploaded successfully! Preview updated live. Click "Save & Publish Changes" to apply.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(theme, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `whatpart-theme-${theme.presetId || 'custom'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (typeof parsed !== 'object' || !parsed.primaryColor) {
          throw new Error('Invalid theme JSON structure');
        }
        setTheme({
          ...DEFAULT_THEME,
          ...parsed,
          presetId: 'custom',
        });
        setMessage({ type: 'ok', text: 'Theme imported successfully from JSON! Click "Save & Publish" to go live.' });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Invalid JSON file';
        setMessage({ type: 'error', text: msg });
      }
    };
    reader.readAsText(file);
    if (importFileRef.current) importFileRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* ─── Top Control Bar ────────────────────────────────────────────── */}
      <div className="card flex flex-wrap items-center justify-between gap-4 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-xl font-bold text-brand-600">
            🇿🇦
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">Live Appearance & Looks Studio</h1>
              {hasUnsavedChanges ? (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 animate-pulse">
                  ● Unsaved Changes
                </span>
              ) : (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  ✓ Live & Published
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Customize official logos, colors, background, announcement banner, and South African accents in real time.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportJson}
            className="btn-outline text-xs text-slate-600 py-1.5 px-3"
            title="Download theme as JSON"
          >
            <Download className="size-3.5" /> Export JSON
          </button>
          <button
            type="button"
            onClick={() => importFileRef.current?.click()}
            className="btn-outline text-xs text-slate-600 py-1.5 px-3"
            title="Import theme from JSON"
          >
            <Upload className="size-3.5" /> Import JSON
          </button>
          <input
            ref={importFileRef}
            type="file"
            accept=".json"
            onChange={handleImportJson}
            className="hidden"
          />

          <Link
            href="/"
            target="_blank"
            className="btn-outline text-xs text-slate-700 py-1.5 px-3 flex items-center gap-1.5"
          >
            <ExternalLink className="size-3.5" /> View Storefront
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="btn-primary py-1.5 px-4 text-xs font-bold shadow flex items-center gap-1.5"
          >
            <Save className="size-3.5" /> {isPending ? 'Publishing...' : 'Save & Publish Changes'}
          </button>
        </div>
      </div>

      {/* Alert Banner */}
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

      {/* ─── Studio Tabs & Live Device Simulator ─────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Customization Controls (7 cols) */}
        <div className="space-y-5 lg:col-span-7">
          {/* Tabs Navigation */}
          <div className="flex overflow-x-auto border-b border-slate-200 bg-white rounded-t-xl px-2 pt-2 gap-1 [scrollbar-width:none]">
            <button
              type="button"
              onClick={() => setActiveTab('branding')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition ${
                activeTab === 'branding'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Car className="size-4" /> Logo & Brand
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('palette')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition ${
                activeTab === 'palette'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="size-4" /> Colors & Presets
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('announcement')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition ${
                activeTab === 'announcement'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Megaphone className="size-4" /> Top Banner
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hero')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition ${
                activeTab === 'hero'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="size-4" /> Hero Section
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('looks')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition ${
                activeTab === 'looks'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="size-4" /> Shape & Badges
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('contact')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition ${
                activeTab === 'contact'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Phone className="size-4" /> Store & Contact
            </button>
          </div>

          {/* ─── TAB 1: LOGO & BRAND IDENTITY ──────────────────────────── */}
          {activeTab === 'branding' && (
            <div className="card p-5 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Official Logo Selection</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Choose from the high-resolution sports car logo variants or upload a custom logo.
                    </p>
                  </div>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    High-Res Vector Cut
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {/* Option 1: White Transparent */}
                  <button
                    type="button"
                    onClick={() => setTheme({ ...theme, logoVariant: 'white', presetId: 'custom' })}
                    className={`rounded-xl border p-3.5 text-left transition ${
                      theme.logoVariant === 'white'
                        ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">White Accent</span>
                      {theme.logoVariant === 'white' && <Check className="size-4 text-brand-600" />}
                    </div>
                    <div className="mt-2.5 flex h-14 items-center justify-center rounded-lg bg-emerald-950 p-2">
                      <img src="/logo-white.png" alt="White Logo" className="max-h-10 object-contain" />
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500">
                      Best for dark headers (Springbok green, Atlantic navy, midnight).
                    </p>
                  </button>

                  {/* Option 2: Gold Transparent */}
                  <button
                    type="button"
                    onClick={() => setTheme({ ...theme, logoVariant: 'gold', presetId: 'custom' })}
                    className={`rounded-xl border p-3.5 text-left transition ${
                      theme.logoVariant === 'gold'
                        ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Mzansi Gold</span>
                      {theme.logoVariant === 'gold' && <Check className="size-4 text-brand-600" />}
                    </div>
                    <div className="mt-2.5 flex h-14 items-center justify-center rounded-lg bg-slate-900 p-2">
                      <img src="/logo-gold.png" alt="Gold Logo" className="max-h-10 object-contain" />
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500">
                      Radiant South African gold accent for high-end luxury styling.
                    </p>
                  </button>

                  {/* Option 3: Dark Transparent */}
                  <button
                    type="button"
                    onClick={() => setTheme({ ...theme, logoVariant: 'dark', presetId: 'custom' })}
                    className={`rounded-xl border p-3.5 text-left transition ${
                      theme.logoVariant === 'dark'
                        ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Dark Navy</span>
                      {theme.logoVariant === 'dark' && <Check className="size-4 text-brand-600" />}
                    </div>
                    <div className="mt-2.5 flex h-14 items-center justify-center rounded-lg bg-slate-100 p-2 border border-slate-200">
                      <img src="/logo-dark.png" alt="Dark Logo" className="max-h-10 object-contain" />
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500">
                      Best for light or white headers and printable invoices.
                    </p>
                  </button>
                </div>
              </div>

              {/* Custom Logo Upload Box */}
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Upload Alternative Custom Logo</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      PNG, WebP, SVG, or JPG (up to 8MB). Automatically deployed to cloud storage.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 bg-white"
                    >
                      <Upload className="size-3.5" /> {isUploading ? 'Uploading...' : 'Choose File'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {theme.customLogoUrl && (
                  <div className="mt-3 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2">
                    <img
                      src={theme.customLogoUrl}
                      alt="Uploaded Logo"
                      className="h-9 w-20 object-contain bg-slate-900 rounded p-1"
                    />
                    <div className="flex-1 truncate text-xs font-mono text-slate-600">
                      {theme.customLogoUrl}
                    </div>
                    <button
                      type="button"
                      onClick={() => setTheme({ ...theme, customLogoUrl: '', logoVariant: 'white' })}
                      className="text-xs text-red-600 hover:underline px-2"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Sizing & Tagline Controls */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-200">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="label">Logo Height</label>
                    <span className="font-mono text-xs font-bold text-slate-700">{theme.logoHeight}px</span>
                  </div>
                  <input
                    type="range"
                    min="32"
                    max="68"
                    step="2"
                    value={theme.logoHeight}
                    onChange={(e) =>
                      setTheme({ ...theme, logoHeight: parseInt(e.target.value, 10), presetId: 'custom' })
                    }
                    className="w-full cursor-pointer accent-brand-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>32px (Compact)</span>
                    <span>44px (Default)</span>
                    <span>68px (Prominent)</span>
                  </div>
                </div>

                <div>
                  <label className="label">Logo Tagline Display</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!theme.logoCompact}
                      onChange={(e) =>
                        setTheme({ ...theme, logoCompact: !e.target.checked, presetId: 'custom' })
                      }
                      className="size-4 rounded border-slate-300 text-brand-500 focus:ring-brand-400"
                    />
                    <span className="text-xs text-slate-800 font-medium">
                      Show &ldquo;Quality Auto Parts, to keep you in motion&rdquo;
                    </span>
                  </label>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Uncheck for a minimalist compact header without the tagline.
                  </p>
                </div>
              </div>

              {/* Site Name and Tagline Text */}
              <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-slate-200">
                <div>
                  <label className="label">Store Title / Brand Name</label>
                  <input
                    type="text"
                    value={theme.siteTitle}
                    onChange={(e) => setTheme({ ...theme, siteTitle: e.target.value, presetId: 'custom' })}
                    className="input text-xs"
                    placeholder="WHATPART"
                  />
                </div>
                <div>
                  <label className="label">Brand Tagline</label>
                  <input
                    type="text"
                    value={theme.siteTagline}
                    onChange={(e) => setTheme({ ...theme, siteTagline: e.target.value, presetId: 'custom' })}
                    className="input text-xs"
                    placeholder="Quality Auto Parts, to keep you in motion"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 2: PRESETS & COLOR PALETTE ────────────────────────── */}
          {activeTab === 'palette' && (
            <div className="card p-5 space-y-6">
              {/* Presets Grid */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Curated South African Presets</h3>
                  <span className="text-[11px] text-slate-500">1-Click Live Setup</span>
                </div>

                <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(THEME_PRESETS).map(([key, preset]) => {
                    const isSelected = theme.presetId === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => applyPreset(key)}
                        className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs truncate">{preset.name}</span>
                          {isSelected && <Check className="size-3.5 text-brand-600 shrink-0" />}
                        </div>

                        <div className="mt-2.5 flex items-center gap-1.5">
                          <span
                            className="size-4 rounded-full border border-black/10 shadow-inner"
                            style={{ backgroundColor: preset.primaryColor }}
                            title={`Primary: ${preset.primaryColor}`}
                          />
                          <span
                            className="size-4 rounded-full border border-black/10 shadow-inner"
                            style={{ backgroundColor: preset.accentColor }}
                            title={`Accent: ${preset.accentColor}`}
                          />
                          <span
                            className="size-4 rounded-full border border-black/10 shadow-inner"
                            style={{ backgroundColor: preset.pageBgColor }}
                            title={`Background: ${preset.pageBgColor}`}
                          />
                          <span
                            className="size-4 rounded-full border border-black/10 shadow-inner"
                            style={{ backgroundColor: preset.footerBgColor }}
                            title={`Footer: ${preset.footerBgColor}`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Granular Color Controls */}
              <div className="border-t border-slate-200 pt-5 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Custom Color Studio</h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Header Background Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.headerBgColor}
                        onChange={(e) =>
                          setTheme({
                            ...theme,
                            headerBgColor: e.target.value,
                            primaryColor: e.target.value,
                            presetId: 'custom',
                          })
                        }
                        className="size-9 cursor-pointer rounded border border-slate-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={theme.headerBgColor}
                        onChange={(e) =>
                          setTheme({
                            ...theme,
                            headerBgColor: e.target.value,
                            primaryColor: e.target.value,
                            presetId: 'custom',
                          })
                        }
                        className="input font-mono text-xs uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Brand Accent (Buttons & Cart)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.accentColor}
                        onChange={(e) =>
                          setTheme({ ...theme, accentColor: e.target.value, presetId: 'custom' })
                        }
                        className="size-9 cursor-pointer rounded border border-slate-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={theme.accentColor}
                        onChange={(e) =>
                          setTheme({ ...theme, accentColor: e.target.value, presetId: 'custom' })
                        }
                        className="input font-mono text-xs uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Accent Button Hover Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.accentHoverColor}
                        onChange={(e) =>
                          setTheme({ ...theme, accentHoverColor: e.target.value, presetId: 'custom' })
                        }
                        className="size-9 cursor-pointer rounded border border-slate-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={theme.accentHoverColor}
                        onChange={(e) =>
                          setTheme({ ...theme, accentHoverColor: e.target.value, presetId: 'custom' })
                        }
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
                        onChange={(e) =>
                          setTheme({ ...theme, footerBgColor: e.target.value, presetId: 'custom' })
                        }
                        className="size-9 cursor-pointer rounded border border-slate-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={theme.footerBgColor}
                        onChange={(e) =>
                          setTheme({ ...theme, footerBgColor: e.target.value, presetId: 'custom' })
                        }
                        className="input font-mono text-xs uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Page Background */}
                <div className="pt-2">
                  <label className="label">Storefront Page Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.pageBgColor}
                      onChange={(e) =>
                        setTheme({ ...theme, pageBgColor: e.target.value, presetId: 'custom' })
                      }
                      className="size-9 cursor-pointer rounded border border-slate-300 p-0.5"
                    />
                    <input
                      type="text"
                      value={theme.pageBgColor}
                      onChange={(e) =>
                        setTheme({ ...theme, pageBgColor: e.target.value, presetId: 'custom' })
                      }
                      className="input font-mono text-xs uppercase"
                    />
                  </div>

                  {/* Swatches */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {BACKGROUND_SWATCHES.map((swatch) => (
                      <button
                        key={swatch.hex}
                        type="button"
                        onClick={() =>
                          setTheme({
                            ...theme,
                            pageBgColor: swatch.hex,
                            pageTextColor: swatch.hex === '#0f1013' ? '#f4f4f5' : '#0f172a',
                            presetId: 'custom',
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-medium hover:border-slate-400"
                      >
                        <span
                          className="size-2.5 rounded-full border border-black/20"
                          style={{ backgroundColor: swatch.hex }}
                        />
                        {swatch.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Text Color Switch */}
                <div className="pt-2">
                  <label className="label">Text Color on Primary Accent Buttons</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="accentTextColor"
                        checked={theme.accentTextColor !== '#ffffff'}
                        onChange={() =>
                          setTheme({ ...theme, accentTextColor: '#062417', presetId: 'custom' })
                        }
                      />
                      <span className="text-xs font-medium">Dark Tone (#062417 - Recommended for Gold)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="accentTextColor"
                        checked={theme.accentTextColor === '#ffffff'}
                        onChange={() =>
                          setTheme({ ...theme, accentTextColor: '#ffffff', presetId: 'custom' })
                        }
                      />
                      <span className="text-xs font-medium">Pure White (#ffffff)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 3: TOP ANNOUNCEMENT BAR ───────────────────────────── */}
          {activeTab === 'announcement' && (
            <div className="card p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Top Announcement Bar</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Display shipping specials, provincial notices, or promotions above the header.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={theme.showAnnouncementBar}
                    onChange={(e) =>
                      setTheme({ ...theme, showAnnouncementBar: e.target.checked, presetId: 'custom' })
                    }
                    className="size-4 rounded border-slate-300 text-brand-500 focus:ring-brand-400"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    {theme.showAnnouncementBar ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

              {theme.showAnnouncementBar && (
                <div className="space-y-4 pt-2 border-t border-slate-200">
                  <div>
                    <label className="label">Announcement Text / Message</label>
                    <input
                      type="text"
                      value={theme.announcementText}
                      onChange={(e) =>
                        setTheme({ ...theme, announcementText: e.target.value, presetId: 'custom' })
                      }
                      className="input text-xs"
                      placeholder="🚚 Free Nationwide Delivery on Orders over R1,500 | 🇿🇦 100% Guaranteed Fitment"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="label">Bar Background Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={theme.announcementBg}
                          onChange={(e) =>
                            setTheme({ ...theme, announcementBg: e.target.value, presetId: 'custom' })
                          }
                          className="size-9 cursor-pointer rounded border border-slate-300 p-0.5"
                        />
                        <input
                          type="text"
                          value={theme.announcementBg}
                          onChange={(e) =>
                            setTheme({ ...theme, announcementBg: e.target.value, presetId: 'custom' })
                          }
                          className="input font-mono text-xs uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">Bar Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={theme.announcementTextColor}
                          onChange={(e) =>
                            setTheme({ ...theme, announcementTextColor: e.target.value, presetId: 'custom' })
                          }
                          className="size-9 cursor-pointer rounded border border-slate-300 p-0.5"
                        />
                        <input
                          type="text"
                          value={theme.announcementTextColor}
                          onChange={(e) =>
                            setTheme({ ...theme, announcementTextColor: e.target.value, presetId: 'custom' })
                          }
                          className="input font-mono text-xs uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label">Clickable Link Destination (Optional)</label>
                    <input
                      type="text"
                      value={theme.announcementLink}
                      onChange={(e) =>
                        setTheme({ ...theme, announcementLink: e.target.value, presetId: 'custom' })
                      }
                      className="input text-xs"
                      placeholder="/shipping or /deals"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 4: HERO & HOMEPAGE ─────────────────────────────────── */}
          {activeTab === 'hero' && (
            <div className="card p-5 space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Homepage Hero Customizer</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update primary headlines, badge copy, and background styling for visiting car owners.
                </p>
              </div>

              <div>
                <label className="label">Hero Headline</label>
                <input
                  type="text"
                  value={theme.heroHeadline}
                  onChange={(e) => setTheme({ ...theme, heroHeadline: e.target.value, presetId: 'custom' })}
                  className="input text-xs"
                  placeholder="The right part for your car. Delivered."
                />
              </div>

              <div>
                <label className="label">Hero Sub-headline / Mission</label>
                <textarea
                  rows={2}
                  value={theme.heroSubheadline}
                  onChange={(e) => setTheme({ ...theme, heroSubheadline: e.target.value, presetId: 'custom' })}
                  className="input text-xs resize-none"
                  placeholder="Tell us what you drive and we’ll only show parts that fit, from sellers across South Africa."
                />
              </div>

              <div>
                <label className="label">Hero Badge Text</label>
                <input
                  type="text"
                  value={theme.heroBadgeText}
                  onChange={(e) => setTheme({ ...theme, heroBadgeText: e.target.value, presetId: 'custom' })}
                  className="input text-xs"
                  placeholder="🇿🇦 South Africa's Trusted Auto Parts Marketplace"
                />
              </div>
            </div>
          )}

          {/* ─── TAB 5: SURFACES, SHAPE & BADGES ───────────────────────── */}
          {activeTab === 'looks' && (
            <div className="card p-5 space-y-5">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Surfaces, Shape & South African Accents</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Adjust card geometry, shadow depth, national flag ribbon, and header badge.
                </p>
              </div>

              {/* Corner Radius */}
              <div>
                <label className="label">Card & Surface Corner Radius</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {(['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setTheme({ ...theme, cardRadius: r, presetId: 'custom' })}
                      className={`rounded-lg border px-2 py-2 text-center text-xs font-semibold transition ${
                        theme.cardRadius === r
                          ? 'border-brand-500 bg-brand-50 text-slate-900 ring-2 ring-brand-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {r.toUpperCase()}
                      <span className="block text-[10px] font-normal text-slate-400">{RADIUS_MAP[r]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shadows */}
              <div>
                <label className="label">Card Shadow Depth</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['none', 'sm', 'md', 'lg'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTheme({ ...theme, cardShadow: s, presetId: 'custom' })}
                      className={`rounded-lg border px-3 py-2 text-center text-xs font-semibold transition ${
                        theme.cardShadow === s
                          ? 'border-brand-500 bg-brand-50 text-slate-900 ring-2 ring-brand-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {s === 'none' ? 'Flat' : s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* SA Flag Strip */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={theme.showFlagStrip}
                    onChange={(e) => setTheme({ ...theme, showFlagStrip: e.target.checked, presetId: 'custom' })}
                    className="size-4 rounded border-slate-300 text-brand-500 focus:ring-brand-400"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Display South African 6-Color Flag Ribbon
                  </span>
                </label>

                {theme.showFlagStrip && (
                  <div className="ml-6 flex items-center gap-3 text-xs text-slate-600">
                    <span className="font-medium">Position:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="flagPos"
                        checked={theme.flagStripPosition === 'top'}
                        onChange={() => setTheme({ ...theme, flagStripPosition: 'top', presetId: 'custom' })}
                      />
                      <span>Top of Header</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="flagPos"
                        checked={theme.flagStripPosition === 'bottom'}
                        onChange={() => setTheme({ ...theme, flagStripPosition: 'bottom', presetId: 'custom' })}
                      />
                      <span>Bottom of Header</span>
                    </label>
                  </div>
                )}
              </div>

              {/* ZA Header Badge */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={theme.showZaBadge}
                    onChange={(e) => setTheme({ ...theme, showZaBadge: e.target.checked, presetId: 'custom' })}
                    className="size-4 rounded border-slate-300 text-brand-500 focus:ring-brand-400"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Display Header 🇿🇦 National Badge
                  </span>
                </label>

                {theme.showZaBadge && (
                  <div>
                    <label className="label">Custom Badge Text</label>
                    <input
                      type="text"
                      value={theme.zaBadgeText}
                      onChange={(e) => setTheme({ ...theme, zaBadgeText: e.target.value, presetId: 'custom' })}
                      className="input text-xs"
                      placeholder="Proudly South African"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── TAB 6: STORE & CONTACT INFO ───────────────────────────── */}
          {activeTab === 'contact' && (
            <div className="card p-5 space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Storefront Contact & Legal Information</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Shown across the storefront footer, invoice headers, and customer communications.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Support Phone Number</label>
                  <input
                    type="text"
                    value={theme.supportPhone}
                    onChange={(e) => setTheme({ ...theme, supportPhone: e.target.value, presetId: 'custom' })}
                    className="input text-xs"
                    placeholder="+27 11 837 2000"
                  />
                </div>

                <div>
                  <label className="label">Support WhatsApp Number</label>
                  <input
                    type="text"
                    value={theme.supportWhatsapp}
                    onChange={(e) => setTheme({ ...theme, supportWhatsapp: e.target.value, presetId: 'custom' })}
                    className="input text-xs"
                    placeholder="+27 82 555 0199"
                  />
                </div>
              </div>

              <div>
                <label className="label">Customer Support Email</label>
                <input
                  type="email"
                  value={theme.supportEmail}
                  onChange={(e) => setTheme({ ...theme, supportEmail: e.target.value, presetId: 'custom' })}
                  className="input text-xs"
                  placeholder="support@whatpart.africa"
                />
              </div>

              <div>
                <label className="label">Free Delivery Threshold Notice</label>
                <input
                  type="text"
                  value={theme.deliveryNotice}
                  onChange={(e) => setTheme({ ...theme, deliveryNotice: e.target.value, presetId: 'custom' })}
                  className="input text-xs"
                  placeholder="Free delivery on orders over R1,500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Device Simulator (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="card sticky top-20 overflow-hidden border-2 border-slate-300 shadow-xl">
            {/* Simulator Header & Viewport Controls */}
            <div className="border-b border-slate-200 bg-slate-900 px-4 py-2.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-red-500 inline-block" />
                <span className="size-2.5 rounded-full bg-amber-500 inline-block" />
                <span className="size-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="ml-2 font-mono text-xs font-bold text-slate-300">Live Device Simulator</span>
              </div>

              <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setDeviceMode('desktop')}
                  className={`p-1 rounded ${deviceMode === 'desktop' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
                  title="Desktop View"
                >
                  <Monitor className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceMode('tablet')}
                  className={`p-1 rounded ${deviceMode === 'tablet' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
                  title="Tablet View (768px)"
                >
                  <Tablet className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceMode('mobile')}
                  className={`p-1 rounded ${deviceMode === 'mobile' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
                  title="Mobile View (375px)"
                >
                  <Smartphone className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Scrollable Simulator Canvas */}
            <div
              className="max-h-[750px] overflow-y-auto p-3 transition-colors duration-200"
              style={{
                backgroundColor: theme.pageBgColor,
                color: theme.pageTextColor,
              }}
            >
              <div
                className={`mx-auto transition-all duration-300 ${
                  deviceMode === 'mobile'
                    ? 'max-w-[340px]'
                    : deviceMode === 'tablet'
                    ? 'max-w-[500px]'
                    : 'w-full'
                }`}
              >
                {/* 1. Announcement Bar */}
                {theme.showAnnouncementBar && (
                  <div
                    className="px-3 py-1 text-center text-[11px] font-semibold tracking-tight rounded-t-lg transition-colors"
                    style={{
                      backgroundColor: theme.announcementBg || '#021a11',
                      color: theme.announcementTextColor || '#ffb81c',
                    }}
                  >
                    {theme.announcementText}
                  </div>
                )}

                {/* 2. Flag Ribbon */}
                {theme.showFlagStrip && (
                  <div
                    className="h-1 w-full"
                    style={{
                      background:
                        'linear-gradient(90deg, #007749 0%, #007749 22%, #ffb81c 22%, #ffb81c 38%, #000000 38%, #000000 48%, #ffffff 48%, #ffffff 52%, #de3831 52%, #de3831 75%, #001489 75%, #001489 100%)',
                    }}
                  />
                )}

                {/* 3. Header Bar */}
                <div
                  className="px-3 py-2 text-white transition-colors duration-200 shadow-md"
                  style={{ backgroundColor: theme.headerBgColor }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Logo
                        variant={theme.logoVariant}
                        height={Math.min(theme.logoHeight, deviceMode === 'mobile' ? 36 : 46)}
                        compact={theme.logoCompact}
                        customUrl={theme.customLogoUrl}
                      />
                      {theme.showZaBadge && deviceMode !== 'mobile' && (
                        <span className="rounded-full border border-white/20 bg-black/25 px-2 py-0.5 text-[10px] font-semibold text-white">
                          🇿🇦 {theme.zaBadgeText || 'Proudly South African'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div
                        className="flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold shadow-sm"
                        style={{ backgroundColor: theme.accentColor, color: theme.accentTextColor }}
                      >
                        <ShoppingCart className="size-3" />
                        <span>Cart (2)</span>
                      </div>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="mt-2 flex items-center rounded-md bg-white px-2.5 py-1.5 text-xs text-slate-800 shadow-inner">
                    <Search className="size-3.5 text-slate-400 mr-2" />
                    <span className="text-slate-400 truncate">Search brake pads, filters, Hilux...</span>
                  </div>
                </div>

                {/* 4. Sub-nav */}
                <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700">
                  <span className="text-red-600 font-bold">⚡ Daily Deals</span>
                  <span>Brakes</span>
                  <span>Filters</span>
                  <span className="ml-auto text-emerald-700 font-semibold truncate text-[10px]">
                    🚚 {theme.deliveryNotice || 'Free SA Delivery over R1,500'}
                  </span>
                </div>

                {/* 5. Hero Banner */}
                <div
                  className="p-4 text-white transition-colors duration-200"
                  style={{
                    background:
                      theme.heroBgStyle === 'dark'
                        ? '#09090b'
                        : `linear-gradient(135deg, ${theme.headerBgColor} 0%, ${theme.primaryHoverColor} 100%)`,
                  }}
                >
                  {theme.heroBadgeText && (
                    <span className="inline-block rounded-full bg-black/30 border border-white/15 px-2 py-0.5 text-[10px] font-semibold text-brand-400 mb-1.5">
                      {theme.heroBadgeText}
                    </span>
                  )}
                  <h4 className="text-base font-black leading-tight sm:text-lg">
                    {theme.heroHeadline}
                  </h4>
                  <p className="mt-1 text-xs text-white/80 line-clamp-2">
                    {theme.heroSubheadline}
                  </p>
                </div>

                {/* 6. Vehicle Fitment Picker Card */}
                <div
                  className="mt-3 p-3 border shadow-sm transition-all"
                  style={{
                    backgroundColor: theme.cardBgColor,
                    borderColor: theme.cardBorderColor,
                    borderRadius: RADIUS_MAP[theme.cardRadius] ?? '1rem',
                  }}
                >
                  <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Car className="size-3.5 text-brand-500" /> Select Your Vehicle
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className="rounded border border-slate-200 bg-slate-50 p-1.5 text-slate-600">
                      Year: 2021
                    </div>
                    <div className="rounded border border-slate-200 bg-slate-50 p-1.5 text-slate-600">
                      Toyota Hilux
                    </div>
                  </div>
                </div>

                {/* 7. Product Card Sample */}
                <div
                  className="mt-3 p-3 border shadow-sm transition-all"
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
                      ✓ Fits Hilux 2.8 GD-6
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700">In Stock • JHB</span>
                  </div>

                  <p className="mt-2 font-bold text-xs text-slate-900">
                    Ferodo Premier Front Brake Pad Set (D704)
                  </p>
                  <p className="text-[10px] text-slate-500">OE Spec Ceramic • 2-Year Warranty</p>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                    <div>
                      <p className="text-[9px] text-slate-400">Best Seller Price</p>
                      <p className="text-base font-black text-slate-900">R 895.00</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm transition hover:opacity-90 active:scale-95"
                      style={{ backgroundColor: theme.accentColor, color: theme.accentTextColor }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>

                {/* 8. Footer Preview */}
                <div
                  className="mt-4 p-3 rounded-b-lg text-white/80 text-[10px] space-y-1 transition-colors"
                  style={{ backgroundColor: theme.footerBgColor }}
                >
                  <Logo
                    variant={theme.logoVariant === 'dark' ? 'dark' : 'white'}
                    height={32}
                    compact={theme.logoCompact}
                    customUrl={theme.customLogoUrl}
                  />
                  <p className="text-white/60 text-[9px]">{theme.siteTagline}</p>
                  <p className="text-white/70 pt-1">
                    📞 {theme.supportPhone || '+27 11 837 2000'} • ✉️ {theme.supportEmail || 'support@whatpart.africa'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Actions Bar ─────────────────────────────────────────── */}
      <div className="card sticky bottom-4 z-30 flex flex-wrap items-center justify-between gap-4 border-2 border-slate-300 bg-white/95 p-4 backdrop-blur shadow-2xl">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-bold text-slate-900">Theme:</span> {theme.name}
          {theme.presetId === 'custom' && (
            <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
              Customized
            </span>
          )}
          {hasUnsavedChanges && (
            <span className="font-semibold text-amber-600 ml-2">● You have unsaved changes</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={isPending}
            className="btn-outline flex items-center gap-1.5 text-xs text-slate-600 py-2 px-3"
          >
            <RotateCcw className="size-3.5" /> Reset to Springbok Default
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="btn-primary flex items-center gap-2 px-6 py-2 text-xs font-bold shadow-md"
          >
            <Save className="size-4" />
            {isPending ? 'Publishing Changes...' : 'Save & Publish Live'}
          </button>
        </div>
      </div>
    </div>
  );
}
