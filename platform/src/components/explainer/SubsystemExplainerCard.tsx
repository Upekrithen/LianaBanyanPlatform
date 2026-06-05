/**
 * SubsystemExplainerCard -- Depth-switchable card for a single subsystem.
 * Composes DepthSwitcher + CharacterTurnRenderer.
 *
 * Can render in three modes:
 *   - "card"   : standalone card (for How-It-All-Works grid)
 *   - "overlay": compact panel (for XRay overlay)
 *   - "tour"   : simplified tour-stop view (for Wildfire runs)
 */

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DepthSwitcher } from "./DepthSwitcher";
import { CharacterTurnRenderer } from "./CharacterTurnRenderer";
import type { SubsystemExplainer, DepthLayer } from "@/data/explainerCorpus";
import { getDepthContent } from "@/data/explainerCorpus";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface SubsystemExplainerCardProps {
  explainer: SubsystemExplainer;
  initialDepth?: DepthLayer;
  mode?: "card" | "overlay" | "tour";
  className?: string;
  /** If true, show cross-reference links at the bottom */
  showCrossRefs?: boolean;
}

export function SubsystemExplainerCard({
  explainer,
  initialDepth = "skipping-stones",
  mode = "card",
  className,
  showCrossRefs = true,
}: SubsystemExplainerCardProps) {
  const [depth, setDepth] = useState<DepthLayer>(initialDepth);
  const content = getDepthContent(explainer, depth);
  const isOverlay = mode === "overlay";

  return (
    <Card
      className={cn(
        "flex flex-col",
        isOverlay ? "border-0 shadow-none bg-transparent p-0" : "shadow-sm",
        className
      )}
      data-xray-id={`subsystem-explainer-${explainer.id}`}
    >
      {/* Card header */}
      {!isOverlay && (
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-muted-foreground">
                  #{explainer.subsystemNumber.toString().padStart(2, "0")}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    explainer.province === "northern"
                      ? "border-blue-200 text-blue-700 bg-blue-50"
                      : "border-amber-200 text-amber-700 bg-amber-50"
                  )}
                >
                  {explainer.province === "northern" ? "Denken" : "LRH"}
                </Badge>
              </div>
              <h3 className="font-semibold text-base leading-tight">{explainer.subsystem}</h3>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {explainer.tags?.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className={cn("flex flex-col gap-4", isOverlay && "px-0 pt-0")}>
        {/* Depth switcher */}
        <DepthSwitcher
          current={depth}
          onChange={setDepth}
          compact={isOverlay || mode === "tour"}
        />

        {/* Depth content */}
        <div className="flex flex-col gap-3">
          {!isOverlay && (
            <h4 className="font-medium text-sm leading-snug text-foreground">
              {content.headline}
            </h4>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed">{content.body}</p>
        </div>

        {/* Narrator turn */}
        <CharacterTurnRenderer
          turn={content.narrator}
          hostMascotId={explainer.host}
          depth={depth}
        />

        {/* Cross-references */}
        {showCrossRefs && explainer.crossRefs && explainer.crossRefs.length > 0 && (
          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              Connected systems
            </p>
            <div className="flex flex-wrap gap-2">
              {explainer.crossRefs.map((ref) => (
                <a
                  key={ref.ref}
                  href={ref.ref}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  {ref.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
