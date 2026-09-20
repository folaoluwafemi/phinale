import { useEffect } from 'react';
import BoardCanvas from '../features/board/BoardCanvas';
import { useBoardStore } from '../stores/useBoardStore';

export default function CanvasRoute() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (e.key === '/' && !typing) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('header input')?.focus();
      }
      if ((e.key === 'n' || e.key === 'N') && !typing) {
        e.preventDefault();
        useBoardStore.getState().add({ type: 'note', content: '', position: { x: 0, y: 0 } });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="h-full font-body">
      <BoardCanvas />
    </div>
  );
}
