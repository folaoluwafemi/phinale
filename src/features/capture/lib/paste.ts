import { nanoid } from 'nanoid';
import { db } from '../../../lib/db';
import { useBoardStore } from '../../../stores/useBoardStore';
import { compressImage } from './images';

const URL_RE = /^(https?:\/\/[^\s]+|www\.[^\s]+\.[^\s]+)$/i;

export function isEditableTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  const tag = t.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    t.isContentEditable ||
    !!t.closest('input, textarea, [contenteditable="true"]')
  );
}

function domainOf(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function looksLikeUrl(text: string): boolean {
  return URL_RE.test(text.trim());
}

export async function saveImageFile(
  file: File | Blob,
  at: { x: number; y: number },
  source?: string,
): Promise<void> {
  const mime = file.type || 'image/png';
  const { blob, width, height } = await compressImage(file, mime);
  const imageId = nanoid();
  await db.blobs.add({ id: imageId, blob, mime: blob.type || mime, width, height });
  await useBoardStore.getState().add({
    type: 'image',
    content: '',
    imageId,
    source,
    meta: { width, height, mime: blob.type || mime, size: blob.size },
    position: at,
  });
}

export async function saveText(text: string, at: { x: number; y: number }): Promise<void> {
  const trimmed = text.trim().slice(0, 5000);
  if (!trimmed) return;
  if (looksLikeUrl(trimmed)) {
    const url = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const domain = domainOf(url);
    await useBoardStore.getState().add({
      type: 'link',
      content: url,
      meta: {
        title: domain,
        domain,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      },
      position: at,
    });
  } else {
    await useBoardStore.getState().add({ type: 'text', content: trimmed, position: at });
  }
}

export function attachPasteHandler(getCenter: () => { x: number; y: number }): () => void {
  let counter = 0;
  const onPaste = async (e: ClipboardEvent) => {
    if (isEditableTarget(e.target)) return;
    const cd = e.clipboardData;
    if (!cd) return;
    const center = getCenter();
    const at = { x: center.x + (counter % 5) * 24, y: center.y + (counter % 5) * 24 };
    counter += 1;

    const images: File[] = [];
    if (cd.items) {
      for (const item of Array.from(cd.items)) {
        if (item.type.startsWith('image/')) {
          const f = item.getAsFile();
          if (f) images.push(f);
        }
      }
    } else if (cd.files?.length) {
      for (const f of Array.from(cd.files)) {
        if (f.type.startsWith('image/')) images.push(f);
      }
    }
    if (images.length > 0) {
      e.preventDefault();
      for (const img of images) {
        await saveImageFile(img, at);
      }
      return;
    }

    const text = cd.getData('text/plain');
    if (text?.trim()) {
      e.preventDefault();
      await saveText(text, at);
    }
  };
  window.addEventListener('paste', onPaste);
  return () => window.removeEventListener('paste', onPaste);
}
