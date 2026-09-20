import Dexie, { type Table } from 'dexie';
import type { Artifact } from '../features/artifacts/types';

export interface BlobRow {
  id: string;
  blob: Blob;
  thumb?: Blob;
  mime: string;
  width?: number;
  height?: number;
}

export interface ViewportRow {
  key: string;
  x: number;
  y: number;
  zoom: number;
}

class PhinaleDB extends Dexie {
  artifacts!: Table<Artifact, string>;
  blobs!: Table<BlobRow, string>;
  meta!: Table<ViewportRow, string>;

  constructor() {
    super('phinale');
    this.version(1).stores({
      artifacts: 'id, updatedAt',
      blobs: 'id',
      meta: 'key',
    });
  }
}

export const db = new PhinaleDB();
