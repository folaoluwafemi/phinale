import { db } from '../../../lib/db';
import type { ExportPayload } from '../../artifacts/types';

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

export async function exportToJson(): Promise<void> {
  const artifacts = await db.artifacts.toArray();
  const payload: ExportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    artifacts: await Promise.all(
      artifacts.map(async (a) => {
        if (a.type === 'image' && a.imageId) {
          const row = await db.blobs.get(a.imageId);
          if (row) {
            return { ...a, imageDataUrl: await blobToDataUrl(row.blob) };
          }
        }
        return { ...a };
      }),
    ),
  };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const aEl = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  aEl.href = url;
  aEl.download = `phinale-export-${date}.json`;
  document.body.appendChild(aEl);
  aEl.click();
  aEl.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export async function importFromJsonFile(file: File): Promise<void> {
  const text = await file.text();
  const payload = JSON.parse(text) as ExportPayload;
  if (!payload.artifacts || !Array.isArray(payload.artifacts)) {
    throw new Error('Invalid Phinale export');
  }
  const { useBoardStore } = await import('../../../stores/useBoardStore');
  const { nanoid } = await import('nanoid');
  for (const item of payload.artifacts) {
    const { imageDataUrl, ...rest } = item;
    if (rest.type === 'image' && imageDataUrl) {
      const blob = await (await fetch(imageDataUrl)).blob();
      const imageId = nanoid();
      await db.blobs.add({ id: imageId, blob, mime: blob.type });
      await useBoardStore.getState().add({ ...rest, imageId, position: rest.position });
    } else {
      await useBoardStore.getState().add({ ...rest, position: rest.position });
    }
  }
}
