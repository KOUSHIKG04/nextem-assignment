import { Button } from "../ui/button";
import { Plus, Undo2, Layout } from "lucide-react";

type ToolbarProps = {
  onAddNode: () => void;
  onAutoLayout: () => void;
  onUndo: () => void;
  onToggleJson: () => void;
  canUndo?: boolean;
};

export function Toolbar({
  onAddNode,
  onAutoLayout,
  onUndo,
  onToggleJson,
  canUndo,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-4 py-3 px-6 bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex gap-2">
        <Button onClick={onAddNode}>
          <Plus /> Add Node
        </Button>
        <Button onClick={onAutoLayout}>
          <Layout /> Auto Layout
        </Button>
        <Button onClick={onUndo} disabled={canUndo === false}>
          <Undo2 /> Undo
        </Button>
      </div>
      <div className="flex gap-2 ml-auto">
        <Button onClick={onToggleJson}>JSON Preview</Button>
      </div>
    </div>
  );
}
