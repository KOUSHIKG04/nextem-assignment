import { useMemo } from "react";
import { validateDAG } from "../../lib/dagUtils";
import { Node, Edge } from "reactflow";

export function useDagValidation(nodes: Node[], edges: Edge[]) {
    return useMemo(() => validateDAG(nodes, edges), [nodes, edges]);
} 