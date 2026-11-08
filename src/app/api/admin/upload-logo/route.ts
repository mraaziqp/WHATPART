import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { requireAdmin } from '@/lib/guards';
import { UPLOAD_DIR, MAX_UPLOAD_BYTES } from '@/lib/uploads';

const ALLOWED_EXTS = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const form = await req.formData();
    const file = form.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'Logo file must be smaller than 8MB' }, { status: 400 });
    }

    const originalName = file.name || 'logo.png';
    let ext = path.extname(originalName).toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      ext = '.png';
    }

    const brandingDir = path.join(UPLOAD_DIR, 'branding');
    await mkdir(brandingDir, { recursive: true });

    const filename = `logo-${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
    const targetPath = path.join(brandingDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(targetPath, buffer);

    const publicUrl = `/uploads/branding/${filename}`;
    return NextResponse.json({ ok: true, url: publicUrl });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Not authorized';
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}
