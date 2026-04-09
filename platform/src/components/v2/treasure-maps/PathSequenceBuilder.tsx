import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SequenceNode } from "./types";
import { MapNode } from "./MapNode";

type PathSequenceBuilderProps = {
  nodes: SequenceNode[];
  onMoveNode: (fromId: string, toId: string) => void;
  onMoveByArrow: (id: string, direction: "up" | "down") => void;
  onRemoveNode: (id: string) => void;
};

export function PathSequenceBuilder({
  nodes,
  onMoveNode,
  onMoveByArrow,
  onRemoveNode,
}: PathSequenceBuilderProps) {
  const dragSourceId = useRef<string | null>(null);
  const [touchFocusedId, setTouchFocusedId] = useState<string | null>(null);
  const longPressTimer = useRef<number | null>(null);

  const startLongPress = (nodeId: string) => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
    }
    longPressTimer.current = window.setTimeout(() => {
      setTouchFocusedId(nodeId);
    }, 350);
  };

  const endLongPress = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Path sequence builder</h2>
        <p className="text-sm text-muted-foreground">
          Arrange content nodes in learning order. Desktop supports drag; mobile supports long-press plus arrow controls.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          {nodes.map((node, index) => (
            <div
              key={node.id}
              onTouchStart={() => startLongPress(node.id)}
              onTouchEnd={endLongPress}
              onTouchCancel={endLongPress}
            >
              <MapNode
                node={node}
                index={index}
                total={nodes.length}
                canUseArrowControls={touchFocusedId === node.id || nodes.length <= 3}
                onMoveUp={() => onMoveByArrow(node.id, "up")}
                onMoveDown={() => onMoveByArrow(node.id, "down")}
                onRemove={() => onRemoveNode(node.id)}
                onDragStart={(id) => {
                  dragSourceId.current = id;
                }}
                onDrop={(targetId) => {
                  if (!dragSourceId.current || dragSourceId.current === targetId) return;
                  onMoveNode(dragSourceId.current, targetId);
                  dragSourceId.current = null;
                }}
              />
            </div>
          ))}
          {nodes.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Add at least one Cephas item to start the sequence.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
