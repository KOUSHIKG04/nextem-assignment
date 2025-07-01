import React from "react";
import { EdgeProps, getBezierPath } from "reactflow";

const CustomEdge: React.FC<EdgeProps & { isInvalid?: boolean }> = (props) => {
  const [path] = getBezierPath(props);
  const isInvalid = (props as any).isInvalid;
  return (
    <g>
      <path
        d={path}
        stroke={isInvalid ? "#ef4444" : "#1976d2"}
        strokeWidth={2}
        fill="none"
        markerEnd="url(#arrowhead)"
      />
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="7"
        refX="10"
        refY="3.5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <polygon
          points="0 0, 10 3.5, 0 7"
          fill={isInvalid ? "#ef4444" : "#1976d2"}
        />
      </marker>
    </g>
  );
};

export default CustomEdge;
