import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guards';
import { getThemeConfig, saveThemeConfig, resetThemeConfig } from '@/lib/theme';
import type { ThemeConfig } from '@/data/theme';

export async function GET() {
  try {
    const theme = await getThemeConfig();
    return NextResponse.json(theme);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch theme';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();

    if (body.action === 'reset') {
      const res = await resetThemeConfig();
      if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
      const current = await getThemeConfig();
      return NextResponse.json({ ok: true, theme: current });
    }

    const res = await saveThemeConfig(body as ThemeConfig);
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
    const current = await getThemeConfig();
    return NextResponse.json({ ok: true, theme: current });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Not authorized or invalid payload';
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}
