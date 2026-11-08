import 'server-only';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';
import { revalidatePath } from 'next/cache';
import { DEFAULT_THEME, type ThemeConfig } from '@/data/theme';
import { db } from './db';
import { UPLOAD_DIR } from './uploads';

const CONFIG_FILE = path.join(process.cwd(), 'src', 'data', 'theme.json');
const PERSISTENT_CONFIG_FILE = path.join(UPLOAD_DIR, 'theme-config.json');

// In-memory cache for fast read within process lifecycle
let memoryThemeCache: ThemeConfig | null = null;

export function sanitizeTheme(input: unknown): ThemeConfig {
  if (!input || typeof input !== 'object') return DEFAULT_THEME;
  const t = input as Partial<ThemeConfig>;

  return {
    name: typeof t.name === 'string' && t.name ? t.name : DEFAULT_THEME.name,
    presetId:
      t.presetId &&
      ['springbok', 'rainbow', 'kalahari', 'drakensberg', 'protea', 'midnight', 'durban', 'soweto', 'custom'].includes(t.presetId)
        ? t.presetId
        : 'custom',

    // Branding & Logo
    logoVariant:
      t.logoVariant && ['white', 'dark', 'gold', 'custom'].includes(t.logoVariant)
        ? t.logoVariant
        : DEFAULT_THEME.logoVariant,
    customLogoUrl: typeof t.customLogoUrl === 'string' ? t.customLogoUrl : '',
    logoHeight:
      typeof t.logoHeight === 'number' && t.logoHeight >= 28 && t.logoHeight <= 80
        ? Math.round(t.logoHeight)
        : DEFAULT_THEME.logoHeight,
    logoCompact: typeof t.logoCompact === 'boolean' ? t.logoCompact : DEFAULT_THEME.logoCompact,
    siteTitle: typeof t.siteTitle === 'string' && t.siteTitle.trim() ? t.siteTitle.trim() : DEFAULT_THEME.siteTitle,
    siteTagline: typeof t.siteTagline === 'string' ? t.siteTagline.trim() : DEFAULT_THEME.siteTagline,

    // Announcement Bar
    showAnnouncementBar:
      typeof t.showAnnouncementBar === 'boolean' ? t.showAnnouncementBar : DEFAULT_THEME.showAnnouncementBar,
    announcementText:
      typeof t.announcementText === 'string' && t.announcementText.trim()
        ? t.announcementText.trim()
        : DEFAULT_THEME.announcementText,
    announcementBg:
      typeof t.announcementBg === 'string' && t.announcementBg.startsWith('#')
        ? t.announcementBg
        : DEFAULT_THEME.announcementBg,
    announcementTextColor:
      typeof t.announcementTextColor === 'string' && t.announcementTextColor.startsWith('#')
        ? t.announcementTextColor
        : DEFAULT_THEME.announcementTextColor,
    announcementLink: typeof t.announcementLink === 'string' ? t.announcementLink.trim() : DEFAULT_THEME.announcementLink,

    // Primary Colors
    primaryColor:
      typeof t.primaryColor === 'string' && t.primaryColor.startsWith('#')
        ? t.primaryColor
        : DEFAULT_THEME.primaryColor,
    primaryHoverColor:
      typeof t.primaryHoverColor === 'string' && t.primaryHoverColor.startsWith('#')
        ? t.primaryHoverColor
        : DEFAULT_THEME.primaryHoverColor,
    headerBgColor:
      typeof t.headerBgColor === 'string' && t.headerBgColor.startsWith('#')
        ? t.headerBgColor
        : DEFAULT_THEME.headerBgColor,
    footerBgColor:
      typeof t.footerBgColor === 'string' && t.footerBgColor.startsWith('#')
        ? t.footerBgColor
        : DEFAULT_THEME.footerBgColor,

    // Accent Colors
    accentColor:
      typeof t.accentColor === 'string' && t.accentColor.startsWith('#')
        ? t.accentColor
        : DEFAULT_THEME.accentColor,
    accentHoverColor:
      typeof t.accentHoverColor === 'string' && t.accentHoverColor.startsWith('#')
        ? t.accentHoverColor
        : DEFAULT_THEME.accentHoverColor,
    accentTextColor:
      typeof t.accentTextColor === 'string' && t.accentTextColor.startsWith('#')
        ? t.accentTextColor
        : DEFAULT_THEME.accentTextColor,

    // Page & Surfaces
    pageBgColor:
      typeof t.pageBgColor === 'string' && t.pageBgColor.startsWith('#')
        ? t.pageBgColor
        : DEFAULT_THEME.pageBgColor,
    pageTextColor:
      typeof t.pageTextColor === 'string' && t.pageTextColor.startsWith('#')
        ? t.pageTextColor
        : DEFAULT_THEME.pageTextColor,
    cardBgColor:
      typeof t.cardBgColor === 'string' && t.cardBgColor.startsWith('#')
        ? t.cardBgColor
        : DEFAULT_THEME.cardBgColor,
    cardBorderColor:
      typeof t.cardBorderColor === 'string' && t.cardBorderColor.startsWith('#')
        ? t.cardBorderColor
        : DEFAULT_THEME.cardBorderColor,
    cardRadius:
      t.cardRadius && ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'].includes(t.cardRadius)
        ? t.cardRadius
        : DEFAULT_THEME.cardRadius,
    cardShadow:
      t.cardShadow && ['none', 'sm', 'md', 'lg'].includes(t.cardShadow)
        ? t.cardShadow
        : DEFAULT_THEME.cardShadow,

    // Hero Section
    heroHeadline:
      typeof t.heroHeadline === 'string' && t.heroHeadline.trim()
        ? t.heroHeadline.trim()
        : DEFAULT_THEME.heroHeadline,
    heroSubheadline:
      typeof t.heroSubheadline === 'string' && t.heroSubheadline.trim()
        ? t.heroSubheadline.trim()
        : DEFAULT_THEME.heroSubheadline,
    heroBadgeText:
      typeof t.heroBadgeText === 'string' ? t.heroBadgeText.trim() : DEFAULT_THEME.heroBadgeText,
    heroBgStyle:
      t.heroBgStyle && ['gradient', 'solid', 'dark'].includes(t.heroBgStyle)
        ? t.heroBgStyle
        : DEFAULT_THEME.heroBgStyle,

    // South African Accents
    showFlagStrip: typeof t.showFlagStrip === 'boolean' ? t.showFlagStrip : DEFAULT_THEME.showFlagStrip,
    flagStripPosition:
      t.flagStripPosition && ['top', 'bottom', 'both'].includes(t.flagStripPosition)
        ? t.flagStripPosition
        : DEFAULT_THEME.flagStripPosition,
    showZaBadge: typeof t.showZaBadge === 'boolean' ? t.showZaBadge : DEFAULT_THEME.showZaBadge,
    zaBadgeText: typeof t.zaBadgeText === 'string' ? t.zaBadgeText.trim() : DEFAULT_THEME.zaBadgeText,

    // Contact & Footer Details
    supportPhone: typeof t.supportPhone === 'string' ? t.supportPhone.trim() : DEFAULT_THEME.supportPhone,
    supportWhatsapp: typeof t.supportWhatsapp === 'string' ? t.supportWhatsapp.trim() : DEFAULT_THEME.supportWhatsapp,
    supportEmail: typeof t.supportEmail === 'string' ? t.supportEmail.trim() : DEFAULT_THEME.supportEmail,
    deliveryNotice: typeof t.deliveryNotice === 'string' ? t.deliveryNotice.trim() : DEFAULT_THEME.deliveryNotice,
  };
}

export const getThemeConfig = cache(async (): Promise<ThemeConfig> => {
  if (memoryThemeCache) return memoryThemeCache;

  // 1. Try reading from Database if available
  try {
    const rows = (await db.$queryRawUnsafe(
      `SELECT value FROM site_setting WHERE key = 'theme' LIMIT 1`
    )) as Array<{ value: string }>;
    if (rows && rows.length > 0 && rows[0]?.value) {
      const parsed = JSON.parse(rows[0].value);
      memoryThemeCache = sanitizeTheme(parsed);
      return memoryThemeCache;
    }
  } catch {
    // DB not reachable or table doesn't exist yet; proceed to file fallback.
  }

  // 2. Try persistent file in uploads dir (survives VPS redeploys)
  try {
    const raw = await readFile(PERSISTENT_CONFIG_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    memoryThemeCache = sanitizeTheme(parsed);
    return memoryThemeCache;
  } catch {
    // Proceed to bundled file
  }

  // 3. Try bundled config file
  try {
    const raw = await readFile(CONFIG_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    memoryThemeCache = sanitizeTheme(parsed);
    return memoryThemeCache;
  } catch {
    // Fall back to built-in default
    memoryThemeCache = DEFAULT_THEME;
    return memoryThemeCache;
  }
});

export async function saveThemeConfig(theme: ThemeConfig): Promise<{ ok: boolean; error?: string }> {
  const sanitized = sanitizeTheme(theme);
  const jsonStr = JSON.stringify(sanitized, null, 2);

  // 1. Save to in-memory cache
  memoryThemeCache = sanitized;

  // 2. Save to bundled file (for dev / git persistence)
  try {
    await writeFile(CONFIG_FILE, jsonStr, 'utf-8');
  } catch (err) {
    console.warn('[theme] Failed to write bundled config file:', err);
  }

  // 3. Save to persistent uploads directory (survives container redeployment)
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(PERSISTENT_CONFIG_FILE, jsonStr, 'utf-8');
  } catch (err) {
    console.warn('[theme] Failed to write persistent config file:', err);
  }

  // 4. Try saving to Database
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS site_setting (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.$executeRawUnsafe(
      `
      INSERT INTO site_setting (key, value, "updatedAt")
      VALUES ('theme', $1, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, "updatedAt" = NOW()
    `,
      jsonStr
    );
  } catch (err) {
    console.warn('[theme] DB persistence skipped (database not reachable):', err);
  }

  // Revalidate entire website layout and admin appearance
  revalidatePath('/', 'layout');
  revalidatePath('/admin/appearance');

  return { ok: true };
}

export async function resetThemeConfig(): Promise<{ ok: boolean; error?: string }> {
  return saveThemeConfig(DEFAULT_THEME);
}
