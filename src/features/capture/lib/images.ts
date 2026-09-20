import { db } from '../../../lib/db';

const MAX_IMAGE_DIM = 1600;

export async function compressImage(
  file: File | Blob,
  mime: string,
): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_DIM / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { blob: file, width: bitmap.width, height: bitmap.height };
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const outMime = mime === 'image/png' ? 'image/png' : 'image/webp';
  const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, outMime, 0.85));
  return { blob: blob ?? file, width, height };
}

const urlCache = new Map<string, string>();

export function getCachedObjectUrl(imageId: string): string | undefined {
  return urlCache.get(imageId);
}

export function revokeObjectUrl(imageId: string) {
  const url = urlCache.get(imageId);
  if (url) {
    URL.revokeObjectURL(url);
    urlCache.delete(imageId);
  }
}

export async function objectUrlFor(imageId: string): Promise<string | undefined> {
  const cached = urlCache.get(imageId);
  if (cached) return cached;
  const row = await db.blobs.get(imageId);
  if (!row) return undefined;
  const url = URL.createObjectURL(row.blob);
  urlCache.set(imageId, url);
  return url;
}
