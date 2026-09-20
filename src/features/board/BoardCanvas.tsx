import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type Node,
} from '@xyflow/react';
import { useBoardStore } from '../../stores/useBoardStore';
import { attachPasteHandler, saveImageFile } from '../capture/lib/paste';
import ArtifactNode from '../artifacts/components/ArtifactNode';
import TopBar from './components/TopBar';
import EmptyState from './components/EmptyState';
import CanvasHint from './components/CanvasHint';
import ZoomControls from './components/ZoomControls';

const nodeTypes = { artifact: ArtifactNode };

function CanvasInner() {
  const artifacts = useBoardStore((s) => s.artifacts);
  const viewport = useBoardStore((s) => s.viewport);
  const search = useBoardStore((s) => s.search);
  const loaded = useBoardStore((s) => s.loaded);
  const load = useBoardStore((s) => s.load);
  const move = useBoardStore((s) => s.move);
  const setViewport = useBoardStore((s) => s.setViewport);
  const { screenToFlowPosition, setViewport: setRfViewport, zoomIn, zoomOut, fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, , onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (loaded) setRfViewport(viewport);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return artifacts;
    return artifacts.filter((a) =>
      [a.content, a.context ?? '', a.source ?? '', a.meta?.title ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [artifacts, search]);

  useEffect(() => {
    setNodes(
      filtered.map((a) => ({
        id: a.id,
        type: 'artifact',
        position: a.position,
        data: { artifact: a },
        selected: false,
      })),
    );
  }, [filtered, setNodes]);

  const centerRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const update = () => {
      centerRef.current = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [screenToFlowPosition]);

  useEffect(() => {
    return attachPasteHandler(() => centerRef.current);
  }, []);

  const onNodeDragStop = useCallback(
    (_: unknown, node: Node) => {
      move(node.id, node.position);
    },
    [move],
  );

  const onMoveEnd = useCallback(
    (_: unknown, vp: { x: number; y: number; zoom: number }) => {
      setViewport(vp);
    },
    [setViewport],
  );

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
      if (!files.length) return;
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      for (const f of files) {
        await saveImageFile(f, pos);
      }
    },
    [screenToFlowPosition],
  );

  const isEmpty = loaded && artifacts.length === 0;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <TopBar getCenter={() => centerRef.current} />
      <div className="ph-canvas-wrap relative min-h-0 flex-1" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          onMoveEnd={onMoveEnd}
          nodeTypes={nodeTypes}
          defaultViewport={viewport}
          minZoom={0.2}
          maxZoom={2.5}
          fitView={false}
          proOptions={{ hideAttribution: true }}
          colorMode="light"
          style={{ background: 'var(--ph-canvas)' }}
        >
          <Background variant={BackgroundVariant.Dots} gap={28} size={1.5} color="#d8d2c2" />
        </ReactFlow>
        {isEmpty && <EmptyState />}
        {!isEmpty && <CanvasHint />}
        <ZoomControls
          onZoomIn={() => zoomIn({ duration: 200 })}
          onZoomOut={() => zoomOut({ duration: 200 })}
          onFit={() => fitView({ duration: 300, padding: 0.3 })}
        />
      </div>
    </div>
  );
}

export default function BoardCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
