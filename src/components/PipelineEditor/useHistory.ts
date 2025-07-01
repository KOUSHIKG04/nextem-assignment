import { useState, useCallback } from "react";
import { Node, Edge } from "reactflow";

export function useHistory(nodes: Node[], edges: Edge[], setNodes: (n: Node[]) => void, setEdges: (e: Edge[]) => void) {
    const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);

    const push = useCallback(() => {
        setHistory((h) => [...h, { nodes, edges }]);
    }, [nodes, edges]);

    const undo = useCallback(() => {
        setHistory((h) => {
            if (h.length === 0) return h;
            const prev = h[h.length - 1];
            setNodes(prev.nodes);
            setEdges(prev.edges);
            return h.slice(0, -1);
        });
    }, [setNodes, setEdges]);

    const canUndo = history.length > 0;

    return { push, undo, canUndo };
} 