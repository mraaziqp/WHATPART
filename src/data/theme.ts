export interface ThemeConfig {
  name: string;
  presetId: 'springbok' | 'rainbow' | 'kalahari' | 'drakensberg' | 'protea' | 'midnight' | 'durban' | 'soweto' | 'custom';

  // ─── Branding & Logo ───
  logoVariant: 'white' | 'dark' | 'gold' | 'custom';
  customLogoUrl: string;
  logoHeight: number;
  logoCompact: boolean;
  siteTitle: string;
  siteTagline: string;

  // ─── Top Announcement Bar ───
  showAnnouncementBar: boolean;
  announcementText: string;
  announcementBg: string;
  announcementTextColor: string;
  announcementLink: string;

  // ─── Primary (Header / Hero) ───
  primaryColor: string;
  primaryHoverColor: string;
  headerBgColor: string;
  footerBgColor: string;

  // ─── Accent / Brand ───
  accentColor: string;
  accentHoverColor: string;
  accentTextColor: string;

  // ─── Page Background & Cards ───
  pageBgColor: string;
  pageTextColor: string;
  cardBgColor: string;
  cardBorderColor: string;
  cardRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  cardShadow: 'none' | 'sm' | 'md' | 'lg';

  // ─── Hero Section ───
  heroHeadline: string;
  heroSubheadline: string;
  heroBadgeText: string;
  heroBgStyle: 'gradient' | 'solid' | 'dark';

  // ─── South African Accents ───
  showFlagStrip: boolean;
  flagStripPosition: 'top' | 'bottom' | 'both';
  showZaBadge: boolean;
  zaBadgeText: string;

  // ─── Storefront & Contact Details ───
  supportPhone: string;
  supportWhatsapp: string;
  supportEmail: string;
  deliveryNotice: string;
}

export const RADIUS_MAP: Record<ThemeConfig['cardRadius'], string> = {
  none: '0px',
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
};

export const SHADOW_MAP: Record<ThemeConfig['cardShadow'], string> = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
};

// ─── South African Presets ───────────────────────────────────────────────────

export const THEME_PRESETS: Record<string, ThemeConfig> = {
  springbok: {
    name: 'Mzansi Springbok (Green & Gold)',
    presetId: 'springbok',
    logoVariant: 'white',
    customLogoUrl: '',
    logoHeight: 44,
    logoCompact: false,
    siteTitle: 'WHATPART',
    siteTagline: 'Quality Auto Parts, to keep you in motion',
    showAnnouncementBar: true,
    announcementText: '🚚 Free Nationwide Delivery on Orders over R1,500 | 🇿🇦 100% Guaranteed Fitment',
    announcementBg: '#021a11',
    announcementTextColor: '#ffb81c',
    announcementLink: '/shipping',
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
    cardShadow: 'sm',
    heroHeadline: 'The right part for your car. Delivered.',
    heroSubheadline: 'Tell us what you drive and we’ll only show parts that fit, from sellers across South Africa.',
    heroBadgeText: "🇿🇦 South Africa's Trusted Auto Parts Marketplace",
    heroBgStyle: 'gradient',
    showFlagStrip: true,
    flagStripPosition: 'top',
    showZaBadge: true,
    zaBadgeText: 'Proudly South African',
    supportPhone: '+27 11 837 2000',
    supportWhatsapp: '+27 82 555 0199',
    supportEmail: 'support@whatpart.africa',
    deliveryNotice: 'Free delivery on orders over R1,500',
  },
  rainbow: {
    name: 'Rainbow Nation Heritage',
    presetId: 'rainbow',
    logoVariant: 'white',
    customLogoUrl: '',
    logoHeight: 44,
    logoCompact: false,
    siteTitle: 'WHATPART',
    siteTagline: 'Quality Auto Parts, to keep you in motion',
    showAnnouncementBar: true,
    announcementText: '🇿🇦 Serving Drivers Across All 9 Provinces of South Africa | Fast Dispatch',
    announcementBg: '#007749',
    announcementTextColor: '#ffffff',
    announcementLink: '/about',
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
    cardShadow: 'sm',
    heroHeadline: 'The right part for your car. Delivered.',
    heroSubheadline: 'Compare quotes from trusted motor spares shops and scrapyards nationwide.',
    heroBadgeText: '🇿🇦 100% Rainbow Nation Auto Spares',
    heroBgStyle: 'gradient',
    showFlagStrip: true,
    flagStripPosition: 'top',
    showZaBadge: true,
    zaBadgeText: '100% Mzansi',
    supportPhone: '+27 11 837 2000',
    supportWhatsapp: '+27 82 555 0199',
    supportEmail: 'support@whatpart.africa',
    deliveryNotice: 'Free delivery on orders over R1,500',
  },
  kalahari: {
    name: 'Kalahari Sunset & Earth',
    presetId: 'kalahari',
    logoVariant: 'gold',
    customLogoUrl: '',
    logoHeight: 44,
    logoCompact: false,
    siteTitle: 'WHATPART',
    siteTagline: 'Quality Auto Parts, to keep you in motion',
    showAnnouncementBar: true,
    announcementText: '☀️ High Heat & Rugged Terrain Tested Spares | Bakkie & 4x4 Specialists',
    announcementBg: '#1a0e0a',
    announcementTextColor: '#fbbf24',
    announcementLink: '/c/suspension',
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
    cardShadow: 'md',
    heroHeadline: 'Built for South African Roads.',
    heroSubheadline: 'Heavy-duty suspension, brake pads, filters, and cooling systems that withstand any trail.',
    heroBadgeText: '🏜️ Kalahari Tested Parts',
    heroBgStyle: 'gradient',
    showFlagStrip: true,
    flagStripPosition: 'top',
    showZaBadge: true,
    zaBadgeText: 'Kalahari Earth Edition',
    supportPhone: '+27 11 837 2000',
    supportWhatsapp: '+27 82 555 0199',
    supportEmail: 'support@whatpart.africa',
    deliveryNotice: 'Free delivery on orders over R1,500',
  },
  drakensberg: {
    name: 'Drakensberg Highveld & Gold',
    presetId: 'drakensberg',
    logoVariant: 'white',
    customLogoUrl: '',
    logoHeight: 44,
    logoCompact: false,
    siteTitle: 'WHATPART',
    siteTagline: 'Quality Auto Parts, to keep you in motion',
    showAnnouncementBar: true,
    announcementText: '🚚 Express Courier to Johannesburg, Pretoria, Durban & Cape Town',
    announcementBg: '#061528',
    announcementTextColor: '#f59e0b',
    announcementLink: '/track',
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
    cardShadow: 'sm',
    heroHeadline: 'The right part for your car. Delivered.',
    heroSubheadline: 'Save your vehicle once. Every part is verified for exact fitment before you buy.',
    heroBadgeText: '🏔️ Highveld Precision Parts',
    heroBgStyle: 'gradient',
    showFlagStrip: false,
    flagStripPosition: 'top',
    showZaBadge: true,
    zaBadgeText: 'WHATPART SA',
    supportPhone: '+27 11 837 2000',
    supportWhatsapp: '+27 82 555 0199',
    supportEmail: 'support@whatpart.africa',
    deliveryNotice: 'Free delivery on orders over R1,500',
  },
  protea: {
    name: 'Cape Protea & Forest',
    presetId: 'protea',
    logoVariant: 'white',
    customLogoUrl: '',
    logoHeight: 44,
    logoCompact: false,
    siteTitle: 'WHATPART',
    siteTagline: 'Quality Auto Parts, to keep you in motion',
    showAnnouncementBar: true,
    announcementText: '🇿🇦 Celebrating South African Engineering & Quality Auto Components',
    announcementBg: '#0b221a',
    announcementTextColor: '#ffffff',
    announcementLink: '/deals',
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
    cardShadow: 'sm',
    heroHeadline: 'The right part for your car. Delivered.',
    heroSubheadline: 'Tested and certified replacement parts from vetted automotive suppliers.',
    heroBadgeText: '🌺 Cape Protea Edition',
    heroBgStyle: 'gradient',
    showFlagStrip: true,
    flagStripPosition: 'top',
    showZaBadge: true,
    zaBadgeText: 'Cape Protea Edition',
    supportPhone: '+27 11 837 2000',
    supportWhatsapp: '+27 82 555 0199',
    supportEmail: 'support@whatpart.africa',
    deliveryNotice: 'Free delivery on orders over R1,500',
  },
  midnight: {
    name: 'Midnight Speed & Performance',
    presetId: 'midnight',
    logoVariant: 'gold',
    customLogoUrl: '',
    logoHeight: 46,
    logoCompact: false,
    siteTitle: 'WHATPART',
    siteTagline: 'Quality Auto Parts, to keep you in motion',
    showAnnouncementBar: true,
    announcementText: '⚡ High Performance Ignition, Brakes & Turbochargers in Stock',
    announcementBg: '#000000',
    announcementTextColor: '#ffb81c',
    announcementLink: '/deals',
    primaryColor: '#09090b',
    primaryHoverColor: '#18181b',
    headerBgColor: '#09090b',
    footerBgColor: '#000000',
    accentColor: '#ffb81c',
    accentHoverColor: '#f59e0b',
    accentTextColor: '#09090b',
    pageBgColor: '#0f1013',
    pageTextColor: '#f4f4f5',
    cardBgColor: '#18191e',
    cardBorderColor: '#27272a',
    cardRadius: 'lg',
    cardShadow: 'lg',
    heroHeadline: 'Precision Engineered for Motion.',
    heroSubheadline: 'Performance and OEM replacement parts for BMW, VW, Toyota, Ford, Audi and more.',
    heroBadgeText: '🏎️ Performance Edition',
    heroBgStyle: 'dark',
    showFlagStrip: true,
    flagStripPosition: 'top',
    showZaBadge: true,
    zaBadgeText: 'Performance Edition',
    supportPhone: '+27 11 837 2000',
    supportWhatsapp: '+27 82 555 0199',
    supportEmail: 'support@whatpart.africa',
    deliveryNotice: 'Free delivery on orders over R1,500',
  },
  durban: {
    name: 'Durban Ocean & Golden Mile',
    presetId: 'durban',
    logoVariant: 'gold',
    customLogoUrl: '',
    logoHeight: 44,
    logoCompact: false,
    siteTitle: 'WHATPART',
    siteTagline: 'Quality Auto Parts, to keep you in motion',
    showAnnouncementBar: true,
    announcementText: '🌊 Coastal Rust-Resistant & Heavy-Duty Replacement Parts | Fast KZN Courier',
    announcementBg: '#002127',
    announcementTextColor: '#facc15',
    announcementLink: '/shipping',
    primaryColor: '#004b57',
    primaryHoverColor: '#003740',
    headerBgColor: '#004b57',
    footerBgColor: '#002127',
    accentColor: '#eab308',
    accentHoverColor: '#ca8a04',
    accentTextColor: '#002127',
    pageBgColor: '#f0fdfa',
    pageTextColor: '#0f172a',
    cardBgColor: '#ffffff',
    cardBorderColor: '#ccfbf1',
    cardRadius: 'xl',
    cardShadow: 'sm',
    heroHeadline: 'The right part for your car. Delivered.',
    heroSubheadline: 'Reliable parts, salt-spray tested suspension, and fast coastal delivery from Richards Bay to Margate.',
    heroBadgeText: '🌊 Durban Coastal Edition',
    heroBgStyle: 'gradient',
    showFlagStrip: true,
    flagStripPosition: 'top',
    showZaBadge: true,
    zaBadgeText: 'Durban Coastal Edition',
    supportPhone: '+27 11 837 2000',
    supportWhatsapp: '+27 82 555 0199',
    supportEmail: 'support@whatpart.africa',
    deliveryNotice: 'Free delivery on orders over R1,500',
  },
  soweto: {
    name: 'Soweto Gold & Charcoal Vibe',
    presetId: 'soweto',
    logoVariant: 'gold',
    customLogoUrl: '',
    logoHeight: 46,
    logoCompact: false,
    siteTitle: 'WHATPART',
    siteTagline: 'Quality Auto Parts, to keep you in motion',
    showAnnouncementBar: true,
    announcementText: '🇿🇦 Keeping South Africa Moving • Genuine & Quality Aftermarket Spares',
    announcementBg: '#09090b',
    announcementTextColor: '#facc15',
    announcementLink: '/about',
    primaryColor: '#18181b',
    primaryHoverColor: '#27272a',
    headerBgColor: '#18181b',
    footerBgColor: '#09090b',
    accentColor: '#facc15',
    accentHoverColor: '#eab308',
    accentTextColor: '#18181b',
    pageBgColor: '#fafaf9',
    pageTextColor: '#1c1917',
    cardBgColor: '#ffffff',
    cardBorderColor: '#e7e5e4',
    cardRadius: 'xl',
    cardShadow: 'md',
    heroHeadline: 'The right part for your car. Delivered.',
    heroSubheadline: 'Brake pads, clutches, filters, and shocks. Get quotes from spares yards in Gauteng and beyond.',
    heroBadgeText: '⚡ Soweto Gold Edition',
    heroBgStyle: 'gradient',
    showFlagStrip: true,
    flagStripPosition: 'top',
    showZaBadge: true,
    zaBadgeText: 'Soweto Gold Edition',
    supportPhone: '+27 11 837 2000',
    supportWhatsapp: '+27 82 555 0199',
    supportEmail: 'support@whatpart.africa',
    deliveryNotice: 'Free delivery on orders over R1,500',
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
  const shadow = SHADOW_MAP[theme.cardShadow] ?? '0 1px 2px 0 rgb(0 0 0 / 0.05)';
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
      --theme-shadow: ${shadow};

      --theme-announcement-bg: ${theme.announcementBg || '#021a11'};
      --theme-announcement-text: ${theme.announcementTextColor || '#ffb81c'};
      --theme-logo-height: ${theme.logoHeight || 44}px;

      --theme-sa-green: #007749;
      --theme-sa-gold: #ffb81c;
      --theme-sa-red: #de3831;
      --theme-sa-blue: #001489;
    }
  `.replace(/\s+/g, ' ').trim();
}
