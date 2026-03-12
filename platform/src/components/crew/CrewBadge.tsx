/**
 * CREW BADGE — "Founding Crew" badge (anchor-themed, small).
 * data-xray-id: founding-crew-badge
 */

import { cn } from "@/lib/utils";

export interface CrewBadgeProps {
  className?: string;
}

export function CrewBadge({ className }: CrewBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30",
        className
      )}
      data-xray-id="founding-crew-badge"
    >
      ⚓ Founding Crew
    </span>
  );
}
