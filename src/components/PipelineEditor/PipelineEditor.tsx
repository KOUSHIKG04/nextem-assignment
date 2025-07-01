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
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { validateDAG } from "../../lib/dagUtils";
import CustomNode from "./Node";
import CustomEdge from "./Edge";
import { Button } from "../ui/button";
import { Plus, Trash2, Link2, Undo2, Layout } from "lucide-react";

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const fitViewOptions: FitViewOptions = { padding: 0.2 };

const PipelineEditor: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [status, setStatus] = useState("Invalid: Add at least 2 nodes");
  const [jsonOpen, setJsonOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId?: string;
  } | null>(null);
  const reactFlowRef = React.useRef<any>(null);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);

  const handleAddNode = useCallback(() => {
    const label = prompt("Enter node name:");
    if (!label) return;
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
  }, [setNodes]);

  useEffect(() => {
    const result = validateDAG(nodes, edges);
    setStatus(result.message);
  }, [nodes, edges]);

  const invalidEdgeIds = useMemo(() => {
    const result = validateDAG(nodes, edges);
    return result.invalidEdgeIds || [];
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      if (params.source === params.target) return; // Disallow self-loops

      if (params.sourceHandle !== "out" || params.targetHandle !== "in") return; // Only allow outgoing (right) to incoming (left)
      setEdges((eds) =>
        addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds)
      );
    },
    [setEdges]
  );

  // Delete node/edge
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      setNodes((nds) => nds.filter((n) => !deleted.find((d) => d.id === n.id)));
      setEdges((eds) =>
        eds.filter(
          (e) => !deleted.find((d) => d.id === e.source || d.id === e.target)
        )
      );
    },
    [setNodes, setEdges]
  );

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      setEdges((eds) => eds.filter((e) => !deleted.find((d) => d.id === e.id)));
    },
    [setEdges]
  );

  // Auto Layout implementation
  const handleAutoLayout = useCallback(() => {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: "LR" });
    nodes.forEach((node) => g.setNode(node.id, { width: 172, height: 36 }));
    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    dagre.layout(g);
    setNodes((nds) =>
      nds.map((node) => {
        const pos = g.node(node.id);
        return {
          ...node,
          position: { x: pos.x, y: pos.y },
        };
      })
    );

    setTimeout(() => {
      if (reactFlowRef.current) {
        reactFlowRef.current.fitView({ padding: 0.2 });
      }
    }, 100);
  }, [nodes, edges, setNodes]);

  const handleContextMenu = useCallback(
    (event: React.MouseEvent, nodeId?: string) => {
      event.preventDefault();
      setContextMenu({ x: event.clientX, y: event.clientY, nodeId });
    },
    []
  );

  const handleCloseContextMenu = () => setContextMenu(null);

  const handleUndo = useCallback(() => {
    alert("Undo not implemented");
  }, []);

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

  const handleConnect = useCallback(() => {
    alert("Connect not implemented");
    setContextMenu(null);
  }, []);

  return (
    <div className="flex flex-col h-screen w-full font-sans">
      <div className="flex items-center gap-4 py-3 px-6 bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex gap-2">
          <Button onClick={handleAddNode}>
            <Plus /> Add Node
          </Button>
          <Button onClick={handleAutoLayout}>
            <Layout /> Auto Layout
          </Button>
          <Button onClick={handleUndo}>
            <Undo2 /> Undo
          </Button>
        </div>
        <div className="flex gap-2 ml-auto">
          <Button onClick={() => setJsonOpen((o) => !o)}>JSON Preview</Button>
        </div>
      </div>
      <div className="flex justify-center items-center">
        <div className="text-center mt-2 text-slate-900 bg-slate-100 px-4 py-3 rounded-lg text-base font-medium sticky top-14 z-20 max-w-md w-full border border-gray-200">
          {status}
        </div>
      </div>
      <div
        className="flex-1 min-h-0 bg-white rounded-none m-2 shadow-none border border-gray-200 overflow-hidden relative"
        onContextMenu={(e) => handleContextMenu(e)}
      >
        <ReactFlow
          ref={reactFlowRef}
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
          <div
            className="fixed z-50 bg-white border border-gray-300 rounded shadow-lg"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onMouseLeave={handleCloseContextMenu}
          >
            <div
              className="p-2 cursor-pointer flex items-center gap-2 hover:bg-gray-100"
              onClick={handleDelete}
            >
              <Trash2 size={16} /> Delete
            </div>
            <div
              className="p-2 cursor-pointer flex items-center gap-2 hover:bg-gray-100"
              onClick={handleConnect}
            >
              <Link2 size={16} /> Connect
            </div>
          </div>
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
