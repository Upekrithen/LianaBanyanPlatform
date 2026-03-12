/**
 * CREW PROGRESS BAR — "X of 12 Crew members joined — Y spots left"
 * Used on invite page and dashboard.
 */

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface CrewProgressBarProps {
  currentCount: number;
  minMembers?: number;
  maxMembers?: number;
  className?: string;
  /** Optional: show as compact (e.g. inline) */
  compact?: boolean;
}

export function CrewProgressBar({
  currentCount,
  minMembers = 8,
  maxMembers = 12,
  className,
  compact = false,
}: CrewProgressBarProps) {
  const spotsLeft = Math.max(0, maxMembers - currentCount);
  const percent = Math.min((currentCount / maxMembers) * 100, 100);
  const isLive = currentCount >= minMembers;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)} data-xray-id="crew-progress-compact">
        <Progress value={percent} className="h-2 flex-1 max-w-[120px]" />
        <span className="text-sm text-muted-foreground tabular-nums">
          {currentCount}/{maxMembers}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)} data-xray-id="crew-progress-bar">
      <p className="text-sm font-medium">
        {currentCount} of {maxMembers} Crew members joined — {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
      </p>
      <Progress value={percent} className="h-3" />
      {isLive && (
        <p className="text-xs text-green-500 font-medium">Crew is live — members can back each other.</p>
      )}
    </div>
  );
}
