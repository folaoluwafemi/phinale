import { useBoardStore } from '../../../stores/useBoardStore';
import { exportToJson, importFromJsonFile } from '../../io/lib/export';
import { useRef } from 'react';

export default function TopBar({ getCenter }: { getCenter: () => { x: number; y: number } }) {
  const add = useBoardStore((s) => s.add);
  const search = useBoardStore((s) => s.search);
  const setSearch = useBoardStore((s) => s.setSearch);
  const count = useBoardStore((s) => s.artifacts.length);
  const fileRef = useRef<HTMLInputElement>(null);

  const quickAdd = () => {
    const c = getCenter();
    add({ type: 'note', content: '', context: 'New idea…', position: { x: c.x, y: c.y } });
  };

  return (
    <header className="z-20 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b-2 border-ink bg-surface-soft px-4 py-2.5">
      <div className="flex items-center font-display text-lg font-bold tracking-tight">
        Phinale
        <span className="ml-2 rounded-full bg-ink px-2 py-0.5 font-body text-[11px] font-semibold tabular-nums text-white">
          {count}
        </span>
      </div>
      <div className="order-3 w-full sm:order-2 sm:mx-auto sm:w-auto sm:max-w-md sm:flex-1">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ideas…  ( / )"
          className="w-full rounded-full border-2 border-ink bg-white px-4 py-1.5 font-body text-sm outline-none placeholder:text-muted focus:shadow-clay-soft"
        />
      </div>
      <div className="order-2 ml-auto flex items-center gap-2 sm:order-3 sm:ml-0">
        <button
          onClick={quickAdd}
          className="clay-chip bg-ink px-4 py-1.5 font-body text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          + Add
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          title="Import JSON"
          className="clay-chip bg-white px-4 py-1.5 font-body text-sm font-semibold transition-colors hover:bg-surface-card"
        >
          Import
        </button>
        <button
          onClick={exportToJson}
          className="clay-chip bg-accent px-4 py-1.5 font-body text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Export JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) await importFromJsonFile(f);
            e.target.value = '';
          }}
        />
      </div>
    </header>
  );
}
