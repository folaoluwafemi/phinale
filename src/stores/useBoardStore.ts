import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { db } from '../lib/db';
import { revokeObjectUrl } from '../features/capture/lib/images';
import type { Artifact, ArtifactType, Viewport } from '../features/artifacts/types';

export interface NewArtifactInput {
  type: ArtifactType;
  content: string;
  context?: string;
  source?: string;
  imageId?: string;
  meta?: Artifact['meta'];
  position: { x: number; y: number };
  color?: string;
}

interface BoardState {
  artifacts: Artifact[];
  viewport: Viewport;
  search: string;
  loaded: boolean;
  load: () => Promise<void>;
  add: (input: NewArtifactInput) => Promise<Artifact>;
  update: (id: string, patch: Partial<Artifact>) => Promise<void>;
  move: (id: string, position: { x: number; y: number }) => Promise<void>;
  remove: (id: string) => Promise<void>;
  duplicate: (id: string) => Promise<void>;
  setViewport: (v: Viewport) => Promise<void>;
  setSearch: (s: string) => void;
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;

function scheduleSave(artifacts: Artifact[]) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    db.artifacts.bulkPut(artifacts).catch(() => undefined);
  }, 300);
}

export const useBoardStore = create<BoardState>((set, get) => ({
  artifacts: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  search: '',
  loaded: false,

  load: async () => {
    const [artifacts, vp] = await Promise.all([
      db.artifacts.orderBy('updatedAt').toArray(),
      db.meta.get('viewport'),
    ]);
    set({
      artifacts,
      viewport: vp ? { x: vp.x, y: vp.y, zoom: vp.zoom } : { x: 0, y: 0, zoom: 1 },
      loaded: true,
    });
  },

  add: async (input) => {
    const now = Date.now();
    const artifact: Artifact = {
      id: nanoid(),
      createdAt: now,
      updatedAt: now,
      ...input,
    };
    const artifacts = [...get().artifacts, artifact];
    set({ artifacts });
    scheduleSave(artifacts);
    return artifact;
  },

  update: async (id, patch) => {
    const artifacts = get().artifacts.map((a) =>
      a.id === id ? { ...a, ...patch, updatedAt: Date.now() } : a,
    );
    set({ artifacts });
    scheduleSave(artifacts);
  },

  move: async (id, position) => {
    const artifacts = get().artifacts.map((a) =>
      a.id === id ? { ...a, position, updatedAt: Date.now() } : a,
    );
    set({ artifacts });
    scheduleSave(artifacts);
  },

  remove: async (id) => {
    const target = get().artifacts.find((a) => a.id === id);
    const artifacts = get().artifacts.filter((a) => a.id !== id);
    set({ artifacts });
    await db.artifacts.delete(id);
    if (target?.imageId) {
      await db.blobs.delete(target.imageId);
      revokeObjectUrl(target.imageId);
    }
    scheduleSave(artifacts);
  },

  duplicate: async (id) => {
    const src = get().artifacts.find((a) => a.id === id);
    if (!src) return;
    const now = Date.now();
    const copy: Artifact = {
      ...src,
      id: nanoid(),
      position: { x: src.position.x + 32, y: src.position.y + 32 },
      createdAt: now,
      updatedAt: now,
    };
    const artifacts = [...get().artifacts, copy];
    set({ artifacts });
    scheduleSave(artifacts);
  },

  setViewport: async (v) => {
    set({ viewport: v });
    await db.meta.put({ key: 'viewport', ...v }).catch(() => undefined);
  },

  setSearch: (s) => set({ search: s }),
}));
