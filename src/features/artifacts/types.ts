export type ArtifactType = 'link' | 'text' | 'note' | 'image';

export interface Artifact {
  id: string;
  type: ArtifactType;
  content: string;
  context?: string;
  source?: string;
  imageId?: string;
  meta?: {
    title?: string;
    favicon?: string;
    domain?: string;
    width?: number;
    height?: number;
    mime?: string;
    size?: number;
  };
  position: { x: number; y: number };
  color?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface ExportPayload {
  version: 1;
  exportedAt: string;
  artifacts: Array<Artifact & { imageDataUrl?: string }>;
}
