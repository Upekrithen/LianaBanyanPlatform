/**
 * FlyoverToGo — Take-home action items with checkboxes
 * =====================================================
 * Packaged homework. Time estimates. Completion tracking.
 * "Copy List" exports to clipboard.
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Copy, Trash2, ExternalLink } from "lucide-react";
import { useCrowsNest } from "@/contexts/CrowsNestContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function FlyoverToGo() {
  const { toGoBag, toggleToGoComplete, clearCompletedToGo, clearToGoBag, copyToGoList } =
    useCrowsNest();
  const navigate = useNavigate();

  const completedCount = toGoBag.filter((item) => item.completed).length;
  const totalMinutes = toGoBag
    .filter((item) => !item.completed)
    .reduce((sum, item) => sum + (item.estimatedMinutes || 0), 0);

  const handleCopy = () => {
    copyToGoList();
    toast.success("To-Go list copied to clipboard");
  };

  if (toGoBag.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Package className="h-8 w-8 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">Your To-Go bag is empty.</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Click "Pack To-Go" on any item to add homework here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium">
            To-Go Bag ({toGoBag.length} {toGoBag.length === 1 ? "item" : "items"})
          </h3>
          {totalMinutes > 0 && (
            <p className="text-xs text-muted-foreground">
              ~{totalMinutes} min remaining
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={handleCopy}
            aria-label="Copy to-go list to clipboard"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
          {completedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive hover:text-destructive"
              onClick={clearCompletedToGo}
              aria-label="Clear completed items"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear Done
            </Button>
          )}
        </div>
      </div>

      {/* Items */}
      <ul className="space-y-2" role="list" aria-label="To-Go items">
        {toGoBag.map((item, index) => (
          <li
            key={`${item.label}-${index}`}
            className={`flex items-start gap-2.5 p-2 rounded-md ${
              item.completed ? "opacity-50" : ""
            }`}
          >
            <Checkbox
              checked={item.completed}
              onCheckedChange={() => toggleToGoComplete(index)}
              className="mt-0.5"
              aria-label={`Mark "${item.label}" as ${item.completed ? "incomplete" : "complete"}`}
            />
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm leading-tight ${
                  item.completed ? "line-through text-muted-foreground" : ""
                }`}
              >
                {item.label}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px]">
                  {item.type}
                </Badge>
                {item.estimatedMinutes && (
                  <span className="text-[10px] text-muted-foreground">
                    ~{item.estimatedMinutes} min
                  </span>
                )}
              </div>
            </div>
            {(item.route || item.externalUrl) && !item.completed && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 flex-shrink-0"
                onClick={() => {
                  if (item.route) {
                    navigate(item.route);
                  } else if (item.externalUrl) {
                    window.open(item.externalUrl, "_blank", "noopener,noreferrer");
                  }
                }}
                aria-label={`Open ${item.label}`}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
