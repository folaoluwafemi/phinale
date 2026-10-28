import { useEffect, useRef, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useBoardStore } from '../../../stores/useBoardStore';
import { objectUrlFor } from '../../capture/lib/images';
import { renderRich } from '../lib/format';
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
  const [editingContext, setEditingContext] = useState(false);
  const [context, setContext] = useState(artifact.context ?? '');
  const [imgUrl, setImgUrl] = useState<string | undefined>(undefined);

  const isTextCard = artifact.type === 'text' || artifact.type === 'note';
  const [editingBody, setEditingBody] = useState(
    isTextCard && !artifact.content,
  );
  const [body, setBody] = useState(artifact.content);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContext(artifact.context ?? '');
  }, [artifact.context]);

  useEffect(() => {
    if (!editingBody) setBody(artifact.content);
  }, [artifact.content, editingBody]);

  useEffect(() => {
    if (editingBody) {
      bodyRef.current?.focus();
      const el = bodyRef.current;
      if (el) el.setSelectionRange(el.value.length, el.value.length);
    }
  }, [editingBody]);

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
    setEditingContext(false);
    if (context !== (artifact.context ?? '')) update(artifact.id, { context });
  };

  const commitBody = () => {
    setEditingBody(false);
    if (body !== artifact.content) update(artifact.id, { content: body });
  };

  return (
    <div
      className={`clay-card w-80 overflow-hidden ${selected ? 'clay-selected' : ''}`}
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

        {isTextCard &&
          (editingBody ? (
            <div>
              <textarea
                ref={bodyRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onBlur={commitBody}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setBody(artifact.content);
                    setEditingBody(false);
                  }
                  e.stopPropagation();
                }}
                placeholder="Type what's on your mind…"
                rows={Math.min(12, Math.max(3, body.split('\n').length + 1))}
                className="w-full resize-none overflow-hidden rounded-xl border-2 border-ink bg-white p-2.5 font-body text-sm leading-relaxed outline-none"
              />
              <div className="mt-1 font-body text-[11px] text-muted">
                *bold* _italic_ ~strike~ `code` • - list • # heading
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditingBody(true)}
              className="block w-full rounded-xl px-1 py-1 text-left font-body text-sm leading-relaxed text-body hover:bg-black/[0.04]"
            >
              {artifact.content ? (
                <span className="whitespace-pre-wrap break-words">{renderRich(artifact.content)}</span>
              ) : (
                <span className="italic text-muted">Click to type what&apos;s on your mind…</span>
              )}
            </button>
          ))}

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

        {(!isTextCard || artifact.content) &&
          (editingContext ? (
            <textarea
              autoFocus
              value={context}
              onChange={(e) => setContext(e.target.value)}
              onBlur={commitContext}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setContext(artifact.context ?? '');
                  setEditingContext(false);
                }
                e.stopPropagation();
              }}
              placeholder="Why does this matter? Add context…"
              className="mt-2 min-h-16 w-full rounded-xl border-2 border-ink bg-white p-2 font-body text-[13px] outline-none"
            />
          ) : (
            <button
              onClick={() => setEditingContext(true)}
              className="mt-2 block w-full rounded-xl bg-surface-soft px-2 py-1.5 text-left font-body text-[13px] text-body hover:bg-surface-strong"
            >
              {artifact.context ? (
                <span className="whitespace-pre-wrap break-words">{artifact.context}</span>
              ) : (
                <span className="italic text-muted">+ Add context…</span>
              )}
            </button>
          ))}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}
