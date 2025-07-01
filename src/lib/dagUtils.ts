/**
 * Validates a Directed Acyclic Graph (DAG) for cycles, connectivity, and self-loops.
 * @param nodes - Array of nodes in the graph.
 * @param edges - Array of edges in the graph.
 * @returns An object with validity, a detailed message, and a list of invalid edge IDs.
 */

import { Node, Edge } from 'reactflow';

export function validateDAG(nodes: Node[], edges: Edge[]): { valid: boolean; message: string; invalidEdgeIds: string[] } {
    if (nodes.length < 2) {
        return { valid: false, message: 'INVALID: Add at least 2 nodes', invalidEdgeIds: [] };
    }

    // Build adjacency list
    const adj: Record<string, string[]> = {};
    nodes.forEach((n) => (adj[n.id] = []));
    const invalidEdgeIds: string[] = [];
    let hasSelfLoop = false;
    for (const edge of edges) {
        // Self-loop
        if (edge.source === edge.target) {
            invalidEdgeIds.push(edge.id);
            hasSelfLoop = true;
        }
        // Outgoing->Outgoing or Incoming->Incoming (simulate by only allowing source->target)
        if (!adj[edge.source]) adj[edge.source] = [];
        adj[edge.source].push(edge.target);
    }

    // All nodes must be connected to at least one edge
    const connected = new Set<string>();
    edges.forEach((e) => {
        connected.add(e.source);
        connected.add(e.target);
    });

    if (nodes.some((n) => !connected.has(n.id))) {
        // Mark all edges as invalid if any node is unconnected
        invalidEdgeIds.push(...edges.map(e => e.id));
        return { valid: false, message: 'INVALID: All nodes must be connected to at least one edge', invalidEdgeIds };
    }

    // Cycle detection (DFS)
    const visited = new Set<string>();
    const recStack = new Set<string>();
    let cycleNodes: string[] = [];
    function hasCycle(v: string, path: string[]): boolean {
        if (!visited.has(v)) {
            visited.add(v);
            recStack.add(v);
            path.push(v);
            for (const neighbor of adj[v] || []) {
                if (!visited.has(neighbor) && hasCycle(neighbor, path)) return true;
                else if (recStack.has(neighbor)) {
                    // Found a cycle, collect the cycle path
                    const cycleStart = path.indexOf(neighbor);
                    cycleNodes = path.slice(cycleStart);
                    return true;
                }
            }
        }
        recStack.delete(v);
        path.pop();
        return false;
    }

    for (const node of nodes) {
        if (hasCycle(node.id, [])) {
            // Mark all edges in the cycle as invalid
            for (let i = 0; i < cycleNodes.length; i++) {
                const from = cycleNodes[i];
                const to = cycleNodes[(i + 1) % cycleNodes.length];
                const edge = edges.find(e => e.source === from && e.target === to);
                if (edge) invalidEdgeIds.push(edge.id);
            }
            return { valid: false, message: 'INVALID: The graph contains a cycle', invalidEdgeIds };
        }
    }

    if (hasSelfLoop) {
        return { valid: false, message: 'INVALID: The graph contains a self-loop', invalidEdgeIds };
    }

    return { valid: true, message: 'VALID: The graph is a valid DAG', invalidEdgeIds };
} 
