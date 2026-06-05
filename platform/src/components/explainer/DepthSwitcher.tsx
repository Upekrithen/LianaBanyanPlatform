/**
 * DepthSwitcher -- Tabbed depth selector for subsystem explainers.
 * Skipping Stones / Wading In / Deep Dive
 */

import { DEPTH_LABELS, DEPTH_DESCRIPTIONS } from "@/data/explainerCorpus";
import type { DepthLayer } from "@/data/explainerCorpus";
import { cn } from "@/lib/utils";
import { Waves, Fish, Anchor } from "lucide-react";

const DEPTH_ICONS: Record<DepthLayer, React.ComponentType<{ className?: string }>> = {
  "skipping-stones": Waves,
  "wading-in": Fish,
  "deep-dive": Anchor,
};

interface DepthSwitcherProps {
  current: DepthLayer;
  onChange: (layer: DepthLayer) => void;
  className?: string;
  compact?: boolean;
}

const LAYERS: DepthLayer[] = ["skipping-stones", "wading-in", "deep-dive"];

export function DepthSwitcher({ current, onChange, className, compact = false }: DepthSwitcherProps) {
  return (
    <div
      className={cn(
        "flex rounded-lg overflow-hidden border border-border bg-muted/50",
        compact ? "text-xs" : "text-sm",
        className
      )}
      role="tablist"
      aria-label="Explanation depth"
    >
      {LAYERS.map((layer) => {
        const Icon = DEPTH_ICONS[layer];
        const isActive = layer === current;
        return (
          <button
            key={layer}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(layer)}
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 py-2 px-1 transition-all font-medium",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60"
            )}
          >
            <Icon className={cn("shrink-0", compact ? "h-3 w-3" : "h-4 w-4")} />
            <span>{DEPTH_LABELS[layer]}</span>
            {!compact && (
              <span className="text-[10px] text-muted-foreground font-normal leading-tight text-center">
                {DEPTH_DESCRIPTIONS[layer]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
