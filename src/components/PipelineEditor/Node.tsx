import React from "react";
import { NodeProps, Handle, Position, Connection } from "reactflow";

const isValidIncoming = (connection: Connection) =>
  connection.targetHandle === "in" && connection.sourceHandle === "out";
const isValidOutgoing = (connection: Connection) =>
  connection.sourceHandle === "out" && connection.targetHandle === "in";

const CustomNode: React.FC<NodeProps> = ({ data, selected }) => {
  const accent = data.accent || "#18181b";
  const isOutput = data.accent === "#ec4899" || data.label === "OUTPUT";
  const borderColor = selected
    ? "#2563eb"
    : data.type === "input"
      ? "#22d3ee"
      : isOutput
        ? "#ec4899"
        : accent;

  return (
    <div
      className={`min-w-[120px] min-h-[38px] flex items-center justify-center rounded-lg font-mono text-[1.08rem] font-medium uppercase tracking-wider transition-colors transition-border duration-150 relative px-5 py-2.5 shadow-none border-[1.5px] bg-white`}
      style={{
        borderColor,
        color: accent,
        fontFamily: '"Fira Mono", "Menlo", "Monaco", "Consolas", monospace',
        fontWeight: 500,
      }}
    >
      <Handle
        id="in"
        type="target"
        position={Position.Left}
        isValidConnection={isValidIncoming}
      />
      <div className="text-[1.08rem] font-inherit font-medium uppercase tracking-wider">
        {data.label}
        {data.type && (
          <span
            className="ml-2 rounded px-1.5 py-0.5 text-xs"
            style={{
              background: borderColor,
              color: "#fff",
              borderRadius: 4,
              padding: "2px 6px",
              fontSize: 10,
            }}
          >
            {data.type.toUpperCase()}
          </span>
        )}
      </div>
      <Handle
        id="out"
        type="source"
        position={Position.Right}
        isValidConnection={isValidOutgoing}
      />
    </div>
  );
};

export default CustomNode;
