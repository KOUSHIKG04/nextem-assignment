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
import { StatusBar } from "./StatusBar";
import { Toolbar } from "./Toolbar";
import { useHistory } from "./useHistory";
import { useDagValidation } from "./useDagValidation";

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const fitViewOptions: FitViewOptions = { padding: 0.2 };

const PipelineEditor: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [jsonOpen, setJsonOpen] = useState(false);
  const { fitView } = useReactFlow();

  // Undo/History logic
  const { push, undo, canUndo } = useHistory(nodes, edges, setNodes, setEdges);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);

  const handleAddNode = useCallback(() => {
    const label = prompt("Enter node name:");
    if (!label) return;
    push();
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
  }, [setNodes, push]);

  const dagValidation = useDagValidation(nodes, edges);
  const { message } = dagValidation;

  // const isValid = status.toLowerCase().startsWith("valid");
  const invalidEdgeIds = dagValidation.invalidEdgeIds || [];

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      if (params.source === params.target) return; // Disallow self-loops
      if (params.sourceHandle !== "out" || params.targetHandle !== "in") return; // Only allow outgoing (right) to incoming (left)
      push();
      setEdges((eds) =>
        addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds)
      );
    },
    [setEdges, push]
  );

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      push();
      setNodes((nds) => nds.filter((n) => !deleted.find((d) => d.id === n.id)));
      setEdges((eds) =>
        eds.filter(
          (e) => !deleted.find((d) => d.id === e.source || d.id === e.target)
        )
      );
    },
    [setNodes, setEdges, push]
  );

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      push();
      setEdges((eds) => eds.filter((e) => !deleted.find((d) => d.id === e.id)));
    },
    [setEdges, push]
  );

  // Auto Layout
  const handleAutoLayout = useCallback(() => {
    push();
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
  }, [nodes, edges, setNodes, push]);

  // Zoom to fit after layout
  useEffect(() => {
    fitView({ padding: 0.2 });
  }, [nodes, fitView]);

  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  return (
    <div className="flex flex-col h-screen w-full font-sans">
      <Toolbar
        onAddNode={handleAddNode}
        onAutoLayout={handleAutoLayout}
        onUndo={handleUndo}
        onToggleJson={() => setJsonOpen((o) => !o)}
        canUndo={canUndo}
      />
      <div className="flex justify-center items-center">
        <StatusBar status={message} />
      </div>
      <div className="flex-1 min-h-0 bg-white rounded-none m-2 shadow-none border border-gray-200 overflow-hidden relative">
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
        >
          <Controls />
          <Background />
        </ReactFlow>
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
