import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useEdgesState,
  useNodesState,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  MarkerType,
  FitViewOptions,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import CustomNode from "./Node";
import CustomEdge from "./Edge";
import { Button } from "../ui/button";
import { StatusBar } from "./StatusBar";
import { ContextMenu } from "./ContextMenu";
import { useDagValidation } from "./useDagValidation";
import { Toolbar } from "./Toolbar";

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const fitViewOptions: FitViewOptions = { padding: 0.2 };

const PipelineEditor: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId?: string;
  } | null>(null);
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>(
    []
  );
  const { fitView } = useReactFlow();

  // Helper to push current state to history
  const pushToHistory = useCallback(() => {
    setHistory((h) => [...h, { nodes, edges }]);
  }, [nodes, edges]);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);

  const handleAddNode = useCallback(() => {
    const label = prompt("Enter node name:");
    if (!label) return;
    pushToHistory();
    const id = `${Date.now()}`;
    setNodes((nds) => [
      ...nds,
      {
        id,
        data: { label },
        position: { x: Math.random() * 250, y: Math.random() * 250 },
        type: "default",
      },
    ]);
  }, [setNodes, pushToHistory]);

  const dagValidation = useDagValidation(nodes, edges);
  const { message } = dagValidation;

  // const isValid = status.toLowerCase().startsWith("valid");
  const invalidEdgeIds = dagValidation.invalidEdgeIds || [];

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      if (params.source === params.target) return; // Disallow self-loops
      if (params.sourceHandle !== "out" || params.targetHandle !== "in") return; // Only allow outgoing (right) to incoming (left)
      pushToHistory();
      setEdges((eds) =>
        addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds)
      );
    },
    [setEdges, pushToHistory]
  );

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      pushToHistory();
      setNodes((nds) => nds.filter((n) => !deleted.find((d) => d.id === n.id)));
      setEdges((eds) =>
        eds.filter(
          (e) => !deleted.find((d) => d.id === e.source || d.id === e.target)
        )
      );
    },
    [setNodes, setEdges, pushToHistory]
  );

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      pushToHistory();
      setEdges((eds) => eds.filter((e) => !deleted.find((d) => d.id === e.id)));
    },
    [setEdges, pushToHistory]
  );

  // Auto Layout
  const handleAutoLayout = useCallback(() => {
    pushToHistory();
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: "LR" });
    nodes.forEach((node) => g.setNode(node.id, { width: 172, height: 36 }));
    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    dagre.layout(g);
    const newNodes = nodes.map((node) => {
      const pos = g.node(node.id);
      return {
        ...node,
        position: { x: pos.x, y: pos.y },
      };
    });
    setNodes(newNodes);
  }, [nodes, edges, setNodes, pushToHistory]);

  // Zoom to fit after layout
  useEffect(() => {
    fitView({ padding: 0.2 });
  }, [nodes, fitView]);

  const handleContextMenu = useCallback(
    (event: React.MouseEvent, nodeId?: string) => {
      event.preventDefault();
      setContextMenu({ x: event.clientX, y: event.clientY, nodeId });
    },
    []
  );

  const handleCloseContextMenu = () => setContextMenu(null);

  const handleUndo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setNodes(prev.nodes);
      setEdges(prev.edges);
      return h.slice(0, -1);
    });
  }, [setNodes, setEdges]);

  const handleDelete = useCallback(() => {
    if (contextMenu?.nodeId) {
      onNodesDelete([
        {
          id: contextMenu.nodeId,
          data: {},
          position: { x: 0, y: 0 },
          type: "custom",
        } as Node,
      ]);
    }
    setContextMenu(null);
  }, [contextMenu, onNodesDelete]);

  return (
    <div className="flex flex-col h-screen w-full font-sans">
      <div className="flex items-center gap-4 py-3 px-6 bg-white border-b border-gray-200 sticky top-0 z-10">
        <Toolbar
          onAddNode={handleAddNode}
          onAutoLayout={handleAutoLayout}
          onUndo={handleUndo}
          onToggleJson={() => setJsonOpen((o) => !o)}
        />
        <div className="flex gap-2 ml-auto">
          <Button onClick={() => setJsonOpen((o) => !o)}>JSON Preview</Button>
        </div>
      </div>
      <div className="flex justify-center items-center">
        <StatusBar status={message} />
      </div>
      <div
        className="flex-1 min-h-0 bg-white rounded-none m-2 shadow-none border border-gray-200 overflow-hidden relative"
        onContextMenu={(e) => handleContextMenu(e)}
      >
        <ReactFlow
          nodes={nodes.map((n) => ({ ...n, type: "custom" }))}
          edges={edges.map((e) => ({
            ...e,
            type: "custom",
            isInvalid: invalidEdgeIds.includes(e.id),
          }))}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          fitView
          fitViewOptions={fitViewOptions}
          onNodeContextMenu={(event, node) => handleContextMenu(event, node.id)}
        >
          <Controls />
          <Background />
        </ReactFlow>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onDelete={handleDelete}
            onClose={handleCloseContextMenu}
          />
        )}
      </div>
      {jsonOpen && (
        <pre className="fixed right-6 bottom-6 bg-slate-100 text-slate-900 p-4 rounded-lg max-w-md max-h-80 overflow-auto text-sm z-30 border border-gray-200 shadow-md">
          {JSON.stringify({ nodes, edges }, null, 2)}
        </pre>
      )}
    </div>
  );
};

const WrappedPipelineEditor = () => (
  <ReactFlowProvider>
    <PipelineEditor />
  </ReactFlowProvider>
);

export default WrappedPipelineEditor;
