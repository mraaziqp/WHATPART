'use server';

import { requireAdmin } from '@/lib/guards';
import { saveThemeConfig, resetThemeConfig } from '@/lib/theme';
import type { ThemeConfig } from '@/data/theme';

export type AppearanceActionResult = {
  ok?: string;
  error?: string;
};

export async function saveAppearanceAction(theme: ThemeConfig): Promise<AppearanceActionResult> {
  try {
    await requireAdmin();
    const result = await saveThemeConfig(theme);
    if (!result.ok) {
      return { error: result.error ?? 'Failed to save appearance settings.' };
    }
    return { ok: 'Storefront appearance updated successfully! Changes are live across the site.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { error: message };
  }
}

export async function resetAppearanceAction(): Promise<AppearanceActionResult> {
  try {
    await requireAdmin();
    const result = await resetThemeConfig();
    if (!result.ok) {
      return { error: result.error ?? 'Failed to reset appearance settings.' };
    }
    return { ok: 'Appearance reset to South African Springbok Green & Gold default.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { error: message };
  }
}
