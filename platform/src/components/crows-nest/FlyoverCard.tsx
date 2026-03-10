/**
 * FlyoverCard — Individual item card in the Crow's Nest
 * ======================================================
 * Always shows the GLIMPSE depth (10-second read).
 * Click to expand to PEEK. Depth dots track visited levels.
 * Queue button adds to watchlist.
 */

import React, { memo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Check } from "lucide-react";
import { useCrowsNest } from "@/contexts/CrowsNestContext";
import { DEPTH_LEVELS } from "@/data/crowsNestDepths";
import type { CrowsNestItem, CrowsNestSection } from "@/data/crowsNestItems";
import { ICON_MAP } from "./iconMap";

// ── Section colors ──

const SECTION_COLORS: Record<CrowsNestSection, string> = {
  getting_started: "border-l-emerald-500",
  sweet_sixteen: "border-l-amber-500",
  platform_mechanics: "border-l-indigo-500",
  build_tools: "border-l-rose-500",
  world: "border-l-sky-500",
};

const SECTION_DOT_COLORS: Record<CrowsNestSection, string> = {
  getting_started: "bg-emerald-500",
  sweet_sixteen: "bg-amber-500",
  platform_mechanics: "bg-indigo-500",
  build_tools: "bg-rose-500",
  world: "bg-sky-500",
};

// ── Component ──

interface FlyoverCardProps {
  item: CrowsNestItem;
  isExpanded: boolean;
}

export const FlyoverCard = memo(function FlyoverCard({ item, isExpanded }: FlyoverCardProps) {
  const { expandItem, collapseItem, addToQueue, removeFromQueue, isInQueue, getVisitedDepths } =
    useCrowsNest();

  const inQueue = isInQueue(item.id);
  const visitedDepths = getVisitedDepths(item.id);
  const IconComponent = ICON_MAP[item.icon];

  const handleCardClick = useCallback(() => {
    if (isExpanded) {
      collapseItem();
    } else {
      expandItem(item.id, "peek");
    }
  }, [isExpanded, item.id, expandItem, collapseItem]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleCardClick();
      } else if (e.key === "q" || e.key === "Q") {
        e.preventDefault();
        if (inQueue) {
          removeFromQueue(item.id);
        } else {
          addToQueue(item.id, "peek");
        }
      }
    },
    [handleCardClick, inQueue, item.id, addToQueue, removeFromQueue]
  );

  const handleQueueClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (inQueue) {
        removeFromQueue(item.id);
      } else {
        addToQueue(item.id, "peek");
      }
    },
    [inQueue, item.id, addToQueue, removeFromQueue]
  );

  return (
    <Card
      className={`border-l-4 ${SECTION_COLORS[item.sectionId]} cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        isExpanded ? "ring-2 ring-primary/30" : ""
      }`}
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      aria-expanded={isExpanded}
      aria-label={`${item.title}. ${item.glimpse}`}
    >
      <CardContent className="p-4">
        {/* Header: Icon + Title */}
        <div className="flex items-start gap-3 mb-2">
          <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
            {IconComponent ? <IconComponent className="h-5 w-5" /> : null}
          </div>
          <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
        </div>

        {/* Glimpse text */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          {item.glimpse}
        </p>

        {/* Actions row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                expandItem(item.id, "peek");
              }}
              aria-label={`Peek at ${item.title}`}
            >
              Peek
            </Button>
            <Button
              variant={inQueue ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleQueueClick}
              aria-label={inQueue ? `Remove ${item.title} from queue` : `Add ${item.title} to queue`}
            >
              {inQueue ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            </Button>
          </div>

          {/* Depth dots */}
          <div className="flex items-center gap-1" aria-label="Depth progress">
            {DEPTH_LEVELS.map((depth) => {
              const visited = visitedDepths.includes(depth.level);
              return (
                <span
                  key={depth.level}
                  className={`inline-block h-1.5 w-1.5 rounded-full transition-colors ${
                    visited
                      ? SECTION_DOT_COLORS[item.sectionId]
                      : "bg-muted-foreground/20"
                  }`}
                  title={`${depth.label}${visited ? " (visited)" : ""}`}
                />
              );
            })}
          </div>
        </div>

        {/* Required tier badge */}
        {item.requiredTier && item.requiredTier !== "ghost" && (
          <Badge variant="outline" className="mt-2 text-[10px]">
            {item.requiredTier === "member" ? "Members" : "Paid Members"}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
});
