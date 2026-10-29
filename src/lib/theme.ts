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

function sanitizeTheme(input: unknown): ThemeConfig {
  if (!input || typeof input !== 'object') return DEFAULT_THEME;
  const t = input as Partial<ThemeConfig>;
  return {
    name: typeof t.name === 'string' && t.name ? t.name : DEFAULT_THEME.name,
    presetId: t.presetId && ['springbok', 'rainbow', 'kalahari', 'drakensberg', 'protea', 'custom'].includes(t.presetId) ? t.presetId : 'custom',
    primaryColor: typeof t.primaryColor === 'string' && t.primaryColor.startsWith('#') ? t.primaryColor : DEFAULT_THEME.primaryColor,
    primaryHoverColor: typeof t.primaryHoverColor === 'string' && t.primaryHoverColor.startsWith('#') ? t.primaryHoverColor : DEFAULT_THEME.primaryHoverColor,
    headerBgColor: typeof t.headerBgColor === 'string' && t.headerBgColor.startsWith('#') ? t.headerBgColor : DEFAULT_THEME.headerBgColor,
    footerBgColor: typeof t.footerBgColor === 'string' && t.footerBgColor.startsWith('#') ? t.footerBgColor : DEFAULT_THEME.footerBgColor,
    accentColor: typeof t.accentColor === 'string' && t.accentColor.startsWith('#') ? t.accentColor : DEFAULT_THEME.accentColor,
    accentHoverColor: typeof t.accentHoverColor === 'string' && t.accentHoverColor.startsWith('#') ? t.accentHoverColor : DEFAULT_THEME.accentHoverColor,
    accentTextColor: typeof t.accentTextColor === 'string' && t.accentTextColor.startsWith('#') ? t.accentTextColor : DEFAULT_THEME.accentTextColor,
    pageBgColor: typeof t.pageBgColor === 'string' && t.pageBgColor.startsWith('#') ? t.pageBgColor : DEFAULT_THEME.pageBgColor,
    pageTextColor: typeof t.pageTextColor === 'string' && t.pageTextColor.startsWith('#') ? t.pageTextColor : DEFAULT_THEME.pageTextColor,
    cardBgColor: typeof t.cardBgColor === 'string' && t.cardBgColor.startsWith('#') ? t.cardBgColor : DEFAULT_THEME.cardBgColor,
    cardBorderColor: typeof t.cardBorderColor === 'string' && t.cardBorderColor.startsWith('#') ? t.cardBorderColor : DEFAULT_THEME.cardBorderColor,
    cardRadius: t.cardRadius && ['sm', 'md', 'lg', 'xl', '2xl'].includes(t.cardRadius) ? t.cardRadius : DEFAULT_THEME.cardRadius,
    showFlagStrip: typeof t.showFlagStrip === 'boolean' ? t.showFlagStrip : DEFAULT_THEME.showFlagStrip,
    showZaBadge: typeof t.showZaBadge === 'boolean' ? t.showZaBadge : DEFAULT_THEME.showZaBadge,
    zaBadgeText: typeof t.zaBadgeText === 'string' ? t.zaBadgeText : DEFAULT_THEME.zaBadgeText,
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
    // Database might not be connected or table doesn't exist yet; proceed to file fallback.
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
