/**
 * AMBASSADOR BADGE — Profile/Crew badge: Ambassador #N (Session 5 V1).
 * Founding (first 100): gold. data-xray-id: ambassador-badge
 */

import { cn } from "@/lib/utils";

export interface AmbassadorBadgeProps {
  ambassadorNumber: number;
  founding?: boolean;
  className?: string;
}

export function AmbassadorBadge({ ambassadorNumber, founding, className }: AmbassadorBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        founding
          ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
          : "bg-muted text-muted-foreground border-border",
        className
      )}
      data-xray-id="ambassador-badge"
    >
      🏛️ Ambassador #{ambassadorNumber}
    </span>
  );
}
