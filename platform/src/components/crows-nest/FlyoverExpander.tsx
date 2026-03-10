/**
 * FlyoverExpander — Inline depth expansion panel
 * ================================================
 * Shows content for the selected depth level below the clicked card.
 * Depth tabs switch content without closing. Escape key closes.
 * Actions: Queue, To-Go, Try It, Show Me.
 */

import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Plus,
  Check,
  ExternalLink,
  Package,
  Eye,
  Search as SearchIcon,
  BookOpen,
  PlayCircle,
  Compass,
} from "lucide-react";
import { useCrowsNest } from "@/contexts/CrowsNestContext";
import { DEPTH_LEVELS } from "@/data/crowsNestDepths";
import type { DepthLevel } from "@/data/crowsNestDepths";
import { getCrowsNestItem } from "@/data/crowsNestItems";
import type { CrowsNestItem } from "@/data/crowsNestItems";
import { useNavigate } from "react-router-dom";

// ── Depth tab icons ──

const DEPTH_ICONS: Record<string, React.ElementType> = {
  Eye: Eye,
  Search: SearchIcon,
  BookOpen: BookOpen,
  PlayCircle: PlayCircle,
  Compass: Compass,
  Package: Package,
};

// ── Component ──

interface FlyoverExpanderProps {
  item: CrowsNestItem;
  currentDepth: DepthLevel;
}

export function FlyoverExpander({ item, currentDepth }: FlyoverExpanderProps) {
  const {
    expandItem,
    collapseItem,
    addToQueue,
    removeFromQueue,
    isInQueue,
    addToGoBag,
    hasVisitedDepth,
  } = useCrowsNest();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inQueue = isInQueue(item.id);

  // Focus container on mount for keyboard access
  useEffect(() => {
    containerRef.current?.focus();
  }, [item.id]);

  // Escape to close
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        collapseItem();
      }
    },
    [collapseItem]
  );

  // Get inline content for a depth level
  const getContent = (depth: DepthLevel): string | null => {
    switch (depth) {
      case "glimpse":
        return item.glimpse;
      case "peek":
        return item.peek;
      case "tell_me_more":
        return item.tellMeMore;
      default:
        return null;
    }
  };

  // Navigation actions
  const handleTryIt = useCallback(() => {
    if (item.sampleRoute) {
      navigate(item.sampleRoute);
    }
  }, [item.sampleRoute, navigate]);

  const handleShowMe = useCallback(() => {
    if (item.showMeRoute) {
      navigate(item.showMeRoute);
    }
  }, [item.showMeRoute, navigate]);

  const handlePackToGo = useCallback(() => {
    if (item.toGoItems && item.toGoItems.length > 0) {
      addToGoBag(item.toGoItems);
    }
  }, [item.toGoItems, addToGoBag]);

  const handleQueueToggle = useCallback(() => {
    if (inQueue) {
      removeFromQueue(item.id);
    } else {
      addToQueue(item.id, currentDepth);
    }
  }, [inQueue, item.id, currentDepth, addToQueue, removeFromQueue]);

  // Get related items
  const relatedItems = (item.relatedItemIds || [])
    .map((id) => getCrowsNestItem(id))
    .filter((r): r is CrowsNestItem => r !== undefined)
    .slice(0, 3);

  // Filter to inline depth levels for tabs
  const inlineLevels = DEPTH_LEVELS.filter((d) => d.inline);

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className="rounded-lg border bg-card p-4 shadow-sm animate-in slide-in-from-top-2 duration-200"
      role="region"
      aria-label={`Details for ${item.title}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-base">{item.title}</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={collapseItem}
          aria-label="Close details"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Depth tabs */}
      <Tabs
        value={currentDepth}
        onValueChange={(val) => expandItem(item.id, val as DepthLevel)}
        className="mb-4"
      >
        <TabsList className="h-8 w-full justify-start">
          {inlineLevels.map((depth) => {
            const visited = hasVisitedDepth(item.id, depth.level);
            const Icon = DEPTH_ICONS[depth.icon];
            return (
              <TabsTrigger
                key={depth.level}
                value={depth.level}
                className="text-xs h-7 gap-1 data-[state=active]:shadow-sm"
              >
                {Icon && <Icon className="h-3 w-3" />}
                {depth.label}
                {visited && depth.level !== currentDepth && (
                  <Check className="h-2.5 w-2.5 text-muted-foreground" />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Content panels */}
        {inlineLevels.map((depth) => {
          const content = getContent(depth.level);
          return (
            <TabsContent key={depth.level} value={depth.level} className="mt-3">
              {content ? (
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {content}
                </p>
              ) : depth.level === "to_go" ? (
                <div className="text-sm text-muted-foreground">
                  {item.toGoItems && item.toGoItems.length > 0 ? (
                    <ul className="space-y-2">
                      {item.toGoItems.map((togo, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Badge variant="outline" className="text-[10px] mt-0.5 flex-shrink-0">
                            {togo.type}
                          </Badge>
                          <span>
                            {togo.label}
                            {togo.estimatedMinutes && (
                              <span className="text-xs text-muted-foreground/60 ml-1">
                                (~{togo.estimatedMinutes} min)
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No take-home items for this topic yet.</p>
                  )}
                </div>
              ) : null}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Related items */}
      {relatedItems.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1.5">Related:</p>
          <div className="flex flex-wrap gap-1.5">
            {relatedItems.map((related) => (
              <Button
                key={related.id}
                variant="outline"
                size="sm"
                className="h-6 text-[11px] px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  expandItem(related.id, "peek");
                }}
              >
                {related.title}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t">
        <Button
          variant={inQueue ? "secondary" : "outline"}
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={handleQueueToggle}
          aria-label={inQueue ? "Remove from queue" : "Add to queue"}
        >
          {inQueue ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          {inQueue ? "Queued" : "Queue"}
        </Button>

        {item.toGoItems && item.toGoItems.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={handlePackToGo}
            aria-label="Pack to-go items"
          >
            <Package className="h-3 w-3" />
            Pack To-Go
          </Button>
        )}

        {item.sampleRoute && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1 ml-auto"
            onClick={handleTryIt}
            aria-label={`Try ${item.title}`}
          >
            <ExternalLink className="h-3 w-3" />
            Try It
          </Button>
        )}

        {item.showMeRoute && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={handleShowMe}
            aria-label={`Show me ${item.title}`}
          >
            <Compass className="h-3 w-3" />
            Show Me
          </Button>
        )}
      </div>
    </div>
  );
}
