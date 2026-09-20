interface Props {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
}

export default function ZoomControls({ onZoomIn, onZoomOut, onFit }: Props) {
  const btn =
    'flex h-9 w-9 items-center justify-center bg-white font-body text-base font-bold text-ink transition-colors hover:bg-surface-card first:rounded-l-full last:rounded-r-full';
  return (
    <div className="absolute bottom-4 right-4 z-10 flex overflow-hidden rounded-full border-2 border-ink bg-white shadow-clay-soft">
      <button className={btn} onClick={onZoomOut} title="Zoom out">
        −
      </button>
      <button
        className={`${btn} border-x-2 border-ink px-2 font-display text-[11px] uppercase tracking-wide`}
        onClick={onFit}
        title="Fit view"
      >
        Fit
      </button>
      <button className={btn} onClick={onZoomIn} title="Zoom in">
        +
      </button>
    </div>
  );
}
