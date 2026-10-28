import type { ReactNode } from 'react';

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const pattern = /(\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~|`[^`\n]+`)/g;
  const parts = text.split(pattern);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <strong key={key} className="font-bold">
          {part.slice(1, -1)}
        </strong>
      );
    }
    if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('~') && part.endsWith('~') && part.length > 2) {
      return (
        <s key={key} className="opacity-70">
          {part.slice(1, -1)}
        </s>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={key}
          className="rounded bg-black/10 px-1 py-px font-mono text-[12px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={key}>{part}</span>;
  });
}

export function renderRich(text: string): ReactNode[] {
  const lines = text.split('\n');
  return lines.map((line, li) => {
    const key = `line-${li}`;
    const trimmed = line.trimStart();

    if (/^#{1,3}\s/.test(trimmed)) {
      const level = trimmed.match(/^#{1,3}/)?.[0].length ?? 1;
      const body = trimmed.replace(/^#{1,3}\s/, '');
      const cls =
        level === 1
          ? 'font-display text-lg font-bold tracking-tight'
          : level === 2
            ? 'font-display text-[15px] font-bold'
            : 'font-display text-sm font-bold';
      return (
        <div key={key} className={cls}>
          {renderInline(body, key)}
        </div>
      );
    }

    if (/^-\s+/.test(trimmed)) {
      return (
        <div key={key} className="flex gap-1.5">
          <span className="select-none opacity-60">•</span>
          <span className="flex-1">{renderInline(trimmed.replace(/^-\s+/, ''), key)}</span>
        </div>
      );
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const m = trimmed.match(/^(\d+)\.\s+(.*)$/);
      return (
        <div key={key} className="flex gap-1.5">
          <span className="select-none tabular-nums opacity-60">{m?.[1]}.</span>
          <span className="flex-1">{renderInline(m?.[2] ?? '', key)}</span>
        </div>
      );
    }

    if (/^>\s+/.test(trimmed)) {
      return (
        <div
          key={key}
          className="border-l-[3px] border-ink/30 pl-2 italic opacity-80"
        >
          {renderInline(trimmed.replace(/^>\s+/, ''), key)}
        </div>
      );
    }

    if (line === '') {
      return <div key={key} className="h-3" />;
    }

    return <div key={key}>{renderInline(line, key)}</div>;
  });
}
