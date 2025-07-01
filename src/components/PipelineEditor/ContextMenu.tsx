import React from "react";
import { Trash2 } from "lucide-react";

type ContextMenuProps = {
    x: number;
    y: number;
    onDelete: () => void;
    onClose: () => void;
};

export function ContextMenu({ x, y, onDelete, onClose }: ContextMenuProps) {
    return (
        <div
            className="fixed z-50 bg-white border border-gray-300 rounded shadow-lg"
            style={{ top: y, left: x }}
            onMouseLeave={onClose}
        >
            <div
                className="p-2 cursor-pointer flex items-center gap-2 hover:bg-gray-100"
                onClick={onDelete}
            >
                <Trash2 size={16} /> Delete
            </div>
        </div>
    );
} 