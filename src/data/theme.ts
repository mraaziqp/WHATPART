export interface ThemeConfig {
  name: string;
  presetId: 'springbok' | 'rainbow' | 'kalahari' | 'drakensberg' | 'protea' | 'custom';
  
  // Primary (Header / Hero)
  primaryColor: string;
  primaryHoverColor: string;
  headerBgColor: string;
  footerBgColor: string;

  // Accent / Brand
  accentColor: string;
  accentHoverColor: string;
  accentTextColor: string;

  // Page Background & Cards
  pageBgColor: string;
  pageTextColor: string;
  cardBgColor: string;
  cardBorderColor: string;
  cardRadius: 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  // South African Accents
  showFlagStrip: boolean;
  showZaBadge: boolean;
  zaBadgeText: string;
}

export const RADIUS_MAP: Record<ThemeConfig['cardRadius'], string> = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
};

// ─── South African Presets ───────────────────────────────────────────────────

export const THEME_PRESETS: Record<string, ThemeConfig> = {
  springbok: {
    name: 'Mzansi Springbok (Green & Gold)',
    presetId: 'springbok',
    primaryColor: '#063826',
    primaryHoverColor: '#0b4d35',
    headerBgColor: '#063826',
    footerBgColor: '#021a11',
    accentColor: '#ffb81c',
    accentHoverColor: '#e5a100',
    accentTextColor: '#062417',
    pageBgColor: '#f4f7f4',
    pageTextColor: '#0f172a',
    cardBgColor: '#ffffff',
    cardBorderColor: '#e2e8f0',
    cardRadius: 'xl',
    showFlagStrip: true,
    showZaBadge: true,
    zaBadgeText: 'Proudly South African',
  },
  rainbow: {
    name: 'Rainbow Nation Heritage',
    presetId: 'rainbow',
    primaryColor: '#0a1c2a',
    primaryHoverColor: '#142c40',
    headerBgColor: '#0a1c2a',
    footerBgColor: '#050e17',
    accentColor: '#ffb81c',
    accentHoverColor: '#e5a100',
    accentTextColor: '#0a1c2a',
    pageBgColor: '#f8fafc',
    pageTextColor: '#0f172a',
    cardBgColor: '#ffffff',
    cardBorderColor: '#e2e8f0',
    cardRadius: 'lg',
    showFlagStrip: true,
    showZaBadge: true,
    zaBadgeText: '100% Mzansi',
  },
  kalahari: {
    name: 'Kalahari Sunset & Earth',
    presetId: 'kalahari',
    primaryColor: '#2b1810',
    primaryHoverColor: '#3d2419',
    headerBgColor: '#2b1810',
    footerBgColor: '#1a0e0a',
    accentColor: '#d97706',
    accentHoverColor: '#b45309',
    accentTextColor: '#ffffff',
    pageBgColor: '#fbf8f3',
    pageTextColor: '#1c1917',
    cardBgColor: '#ffffff',
    cardBorderColor: '#f0ebe1',
    cardRadius: 'xl',
    showFlagStrip: true,
    showZaBadge: true,
    zaBadgeText: 'Kalahari Earth',
  },
  drakensberg: {
    name: 'Drakensberg Highveld & Gold',
    presetId: 'drakensberg',
    primaryColor: '#0b2545',
    primaryHoverColor: '#13315c',
    headerBgColor: '#0b2545',
    footerBgColor: '#061528',
    accentColor: '#f59e0b',
    accentHoverColor: '#d97706',
    accentTextColor: '#061528',
    pageBgColor: '#f3f4f6',
    pageTextColor: '#0f172a',
    cardBgColor: '#ffffff',
    cardBorderColor: '#e2e8f0',
    cardRadius: 'xl',
    showFlagStrip: false,
    showZaBadge: true,
    zaBadgeText: 'WHATPART SA',
  },
  protea: {
    name: 'Cape Protea & Forest',
    presetId: 'protea',
    primaryColor: '#13382c',
    primaryHoverColor: '#1c4d3d',
    headerBgColor: '#13382c',
    footerBgColor: '#0b221a',
    accentColor: '#de3831',
    accentHoverColor: '#c0251e',
    accentTextColor: '#ffffff',
    pageBgColor: '#f6f8f6',
    pageTextColor: '#0f172a',
    cardBgColor: '#ffffff',
    cardBorderColor: '#e2e8f0',
    cardRadius: '2xl',
    showFlagStrip: true,
    showZaBadge: true,
    zaBadgeText: 'Cape Protea Edition',
  },
};

export const DEFAULT_THEME: ThemeConfig = THEME_PRESETS.springbok;

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 6, g: 56, b: 38 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return '#' + [clamp(r), clamp(g), clamp(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function mix(hex1: string, hex2: string, weight: number): string {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const w = Math.max(0, Math.min(1, weight));
  return rgbToHex(
    c1.r * (1 - w) + c2.r * w,
    c1.g * (1 - w) + c2.g * w,
    c1.b * (1 - w) + c2.b * w
  );
}

export function generateCssVariables(theme: ThemeConfig): string {
  const radius = RADIUS_MAP[theme.cardRadius] ?? '1rem';
  const primaryLight = mix(theme.primaryColor, '#ffffff', 0.2);
  const primaryDark = theme.footerBgColor || mix(theme.primaryColor, '#000000', 0.35);

  const brand50 = mix(theme.accentColor, '#ffffff', 0.94);
  const brand100 = mix(theme.accentColor, '#ffffff', 0.82);
  const brand400 = mix(theme.accentColor, '#ffffff', 0.18);
  const brand600 = theme.accentHoverColor || mix(theme.accentColor, '#000000', 0.15);
  const brand700 = mix(theme.accentColor, '#000000', 0.3);

  return `
    :root {
      --theme-navy-950: ${primaryDark};
      --theme-navy-900: ${theme.primaryColor};
      --theme-navy-800: ${theme.primaryHoverColor};
      --theme-navy-700: ${primaryLight};

      --theme-brand-50: ${brand50};
      --theme-brand-100: ${brand100};
      --theme-brand-400: ${brand400};
      --theme-brand-500: ${theme.accentColor};
      --theme-brand-600: ${brand600};
      --theme-brand-700: ${brand700};
      --theme-brand-text: ${theme.accentTextColor};

      --theme-page: ${theme.pageBgColor};
      --theme-page-text: ${theme.pageTextColor};
      --theme-card-bg: ${theme.cardBgColor};
      --theme-card-border: ${theme.cardBorderColor};
      --theme-radius: ${radius};

      --theme-sa-green: #007749;
      --theme-sa-gold: #ffb81c;
      --theme-sa-red: #de3831;
      --theme-sa-blue: #001489;
    }
  `.replace(/\s+/g, ' ').trim();
}
