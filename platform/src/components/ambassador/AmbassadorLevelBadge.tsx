/**
 * AMBASSADOR LEVEL BADGE — Five-level Lighthouse Ladder (V2).
 * Level 1: Torch Bearer → 5: Harbormaster. data-xray-id: ambassador-level-badge
 */

import { cn } from "@/lib/utils";

const LEVEL_CONFIG: Record<number, { label: string; icon: string; className: string }> = {
  1: { label: "Torch Bearer", icon: "🔥", className: "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30" },
  2: { label: "Lamplighter", icon: "🪔", className: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  3: { label: "Beacon Keeper", icon: "🔦", className: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30" },
  4: { label: "Lighthouse Warden", icon: "🏮", className: "bg-amber-600/25 text-amber-700 dark:text-amber-300 border-amber-600/40" },
  5: { label: "Harbormaster", icon: "⚓", className: "bg-slate-400/20 text-slate-600 dark:text-slate-300 border-slate-400/40" },
};

export interface AmbassadorLevelBadgeProps {
  level?: number;
  levelTitle?: string | null;
  className?: string;
}

export function AmbassadorLevelBadge({
  level = 1,
  levelTitle,
  className,
}: AmbassadorLevelBadgeProps) {
  const config = LEVEL_CONFIG[Math.min(Math.max(level, 1), 5)] ?? LEVEL_CONFIG[1];
  const label = levelTitle ?? config.label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
      data-xray-id="ambassador-level-badge"
    >
      {config.icon} {label}
    </span>
  );
}
