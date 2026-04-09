import { GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SequenceNode } from "./types";

type MapNodeProps = {
  node: SequenceNode;
  index: number;
  total: number;
  canUseArrowControls: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onDragStart: (id: string) => void;
  onDrop: (id: string) => void;
};

export function MapNode({
  node,
  index,
  total,
  canUseArrowControls,
  onMoveUp,
  onMoveDown,
  onRemove,
  onDragStart,
  onDrop,
}: MapNodeProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(node.id)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => onDrop(node.id)}
      className="rounded-lg border bg-card p-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{index + 1}. {node.title}</p>
          <p className="truncate text-xs text-muted-foreground">{node.category} · {node.slug}</p>
        </div>
        <div className="flex items-center gap-1">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <Button variant="ghost" size="sm" onClick={onRemove}>
            Remove
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="outline">{node.questionType.replace("_", " ")}</Badge>
        {canUseArrowControls ? (
          <>
            <Button variant="outline" size="sm" onClick={onMoveUp} disabled={index === 0}>
              Move up
            </Button>
            <Button variant="outline" size="sm" onClick={onMoveDown} disabled={index === total - 1}>
              Move down
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
