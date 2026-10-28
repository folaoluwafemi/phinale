export default function CanvasHint() {
  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
      <div className="clay-chip whitespace-nowrap bg-white/90 px-4 py-1.5 font-body text-xs text-body backdrop-blur">
        Double-click canvas or press T to write • Paste to capture • Drag to pan
      </div>
    </div>
  );
}
