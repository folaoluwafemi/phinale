export default function EmptyState() {
  const cards = [
    {
      t: 'Link',
      c: 'Paste a URL — it becomes a card with its domain and favicon.',
      accent: '#1863dc',
      kbd: 'Ctrl + V',
    },
    {
      t: 'Text',
      c: 'Paste any snippet or quote you want to keep, then add context.',
      accent: '#1a3a3a',
      kbd: 'Ctrl + V',
    },
    {
      t: 'Screenshot',
      c: 'Capture with Win + Shift + S, then paste right here. Stored locally.',
      accent: '#e8b94a',
      kbd: 'Win + Shift + S',
    },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
      <div className="pointer-events-auto w-full max-w-2xl">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            Your canvas is empty
          </h1>
          <p className="mx-auto mt-2 max-w-md font-body text-sm leading-relaxed text-body">
            Open a new tab, paste whatever you found, add a line of context. It stays here —
            local only, no cloud.
          </p>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {cards.map((g) => (
            <div key={g.t} className="clay-card bg-white/80 p-4" style={{ borderTop: `6px solid ${g.accent}` }}>
              <div className="font-display text-sm font-bold uppercase tracking-wide">{g.t}</div>
              <p className="mt-1.5 min-h-12 font-body text-[13px] leading-relaxed text-body">{g.c}</p>
              <div className="mt-2 inline-block rounded-md border border-hairline bg-surface-soft px-2 py-0.5 font-body text-[11px] font-semibold text-muted">
                {g.kbd}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
