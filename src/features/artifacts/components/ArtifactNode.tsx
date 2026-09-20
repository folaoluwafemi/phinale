import { useEffect, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useBoardStore } from '../../../stores/useBoardStore';
import { objectUrlFor } from '../../capture/lib/images';
import type { Artifact } from '../types';

const TYPE_ACCENT: Record<Artifact['type'], string> = {
  link: '#1863dc',
  text: '#1a3a3a',
  note: '#ff4d8b',
  image: '#e8b94a',
};

export default function ArtifactNode({ data, selected }: NodeProps) {
  const artifact = data.artifact as Artifact;
  const update = useBoardStore((s) => s.update);
  const remove = useBoardStore((s) => s.remove);
  const duplicate = useBoardStore((s) => s.duplicate);
  const [editing, setEditing] = useState(false);
  const [context, setContext] = useState(artifact.context ?? '');
  const [imgUrl, setImgUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    setContext(artifact.context ?? '');
  }, [artifact.context]);

  useEffect(() => {
    if (artifact.type !== 'image' || !artifact.imageId) return;
    let alive = true;
    objectUrlFor(artifact.imageId).then((url) => {
      if (alive) setImgUrl(url);
    });
    return () => {
      alive = false;
    };
  }, [artifact.type, artifact.imageId]);

  const accent = artifact.color ?? TYPE_ACCENT[artifact.type];

  const commitContext = () => {
    setEditing(false);
    if (context !== (artifact.context ?? '')) update(artifact.id, { context });
  };

  return (
    <div
      className={`clay-card w-72 overflow-hidden ${selected ? 'clay-selected' : ''}`}
      style={{ borderTop: `6px solid ${accent}` }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div className="flex items-center gap-2 px-3 pt-2.5">
        <span
          className="font-display inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white"
          style={{ background: accent }}
        >
          {artifact.type}
        </span>
        {artifact.type === 'link' && artifact.meta?.domain && (
          <span className="truncate font-body text-xs text-muted">{artifact.meta.domain}</span>
        )}
        <div className="ml-auto flex gap-1">
          <button
            title="Duplicate"
            className="rounded-md px-1.5 py-0.5 font-body text-xs text-muted hover:bg-surface-strong hover:text-ink"
            onClick={() => duplicate(artifact.id)}
          >
            ⧉
          </button>
          <button
            title="Delete"
            className="rounded-md px-1.5 py-0.5 font-body text-xs text-muted hover:bg-red-100 hover:text-red-700"
            onClick={() => remove(artifact.id)}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="px-3 py-2">
        {artifact.type === 'link' && (
          <a
            href={artifact.content}
            target="_blank"
            rel="noreferrer"
            className="font-display block truncate text-[15px] font-semibold text-actionblue hover:underline"
          >
            {artifact.meta?.title || artifact.content}
          </a>
        )}
        {artifact.type === 'link' && (
          <p className="mt-0.5 truncate font-body text-xs text-muted">{artifact.content}</p>
        )}
        {(artifact.type === 'text' || artifact.type === 'note') && (
          <p className="whitespace-pre-wrap break-words font-body text-sm leading-relaxed text-body">
            {artifact.content || 'Empty note'}
          </p>
        )}
        {artifact.type === 'image' && (
          <div className="overflow-hidden rounded-xl border border-hairline bg-surface-soft">
            {imgUrl ? (
              <img src={imgUrl} alt="pasted screenshot" loading="lazy" className="max-h-56 w-full object-cover" />
            ) : (
              <div className="flex h-32 items-center justify-center font-body text-xs text-muted">
                Loading image…
              </div>
            )}
          </div>
        )}

        {editing ? (
          <textarea
            autoFocus
            value={context}
            onChange={(e) => setContext(e.target.value)}
            onBlur={commitContext}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setContext(artifact.context ?? '');
                setEditing(false);
              }
              e.stopPropagation();
            }}
            placeholder="Why does this matter? Add context…"
            className="mt-2 min-h-16 w-full rounded-xl border-2 border-ink bg-white p-2 font-body text-[13px] outline-none"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="mt-2 block w-full rounded-xl bg-surface-soft px-2 py-1.5 text-left font-body text-[13px] text-body hover:bg-surface-strong"
          >
            {artifact.context ? (
              <span className="whitespace-pre-wrap break-words">{artifact.context}</span>
            ) : (
              <span className="italic text-muted">+ Add context…</span>
            )}
          </button>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}
