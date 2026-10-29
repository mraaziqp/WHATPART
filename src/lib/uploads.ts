import 'server-only';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads');
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/**
 * Decode, resize and re-encode an uploaded image as WebP. Re-encoding drops EXIF (including
 * GPS location) and anything that isn't a real image is rejected by sharp.
 */
export async function saveProductImage(file: File): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('Images must be under 8 MB');
  const input = Buffer.from(await file.arrayBuffer());
  let output: Buffer;
  try {
    output = await sharp(input, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    throw new Error('That file is not a supported image (JPG, PNG, WebP or HEIC)');
  }
  const month = new Date().toISOString().slice(0, 7);
  const dir = path.join(UPLOAD_DIR, 'products', month);
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.webp`;
  await writeFile(path.join(dir, name), output);
  return `/uploads/products/${month}/${name}`;
}
