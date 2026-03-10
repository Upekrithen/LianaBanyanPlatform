/**
 * FlyoverQueue — Watchlist panel for queued items
 * =================================================
 * Shows saved items with preferred depth labels.
 * Click item name to expand in the grid.
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Trash2, ListOrdered } from "lucide-react";
import { useCrowsNest } from "@/contexts/CrowsNestContext";
import { getCrowsNestItem } from "@/data/crowsNestItems";
import { getDepthDef } from "@/data/crowsNestDepths";

export function FlyoverQueue() {
  const { queue, removeFromQueue, clearQueue, expandItem } = useCrowsNest();

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <ListOrdered className="h-8 w-8 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">Your queue is empty.</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Click the + button on any card to add it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">
          Your Queue ({queue.length} {queue.length === 1 ? "item" : "items"})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-destructive hover:text-destructive"
          onClick={clearQueue}
          aria-label="Clear entire queue"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Clear
        </Button>
      </div>

      <ul className="space-y-1.5" role="list" aria-label="Queued items">
        {queue.map((entry, index) => {
          const item = getCrowsNestItem(entry.itemId);
          if (!item) return null;
          const depthDef = entry.preferredDepth
            ? getDepthDef(entry.preferredDepth)
            : null;

          return (
            <li
              key={entry.itemId}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 group"
            >
              <span className="text-xs text-muted-foreground/50 w-5 text-right flex-shrink-0">
                {index + 1}.
              </span>
              <button
                className="flex-1 text-left text-sm font-medium truncate hover:underline focus:underline focus:outline-none"
                onClick={() => expandItem(item.id, entry.preferredDepth || "peek")}
                aria-label={`Explore ${item.title}`}
              >
                {item.title}
              </button>
              {depthDef && (
                <Badge variant="outline" className="text-[10px] flex-shrink-0">
                  {depthDef.verb}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
                onClick={() => removeFromQueue(entry.itemId)}
                aria-label={`Remove ${item.title} from queue`}
              >
                <X className="h-3 w-3" />
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
