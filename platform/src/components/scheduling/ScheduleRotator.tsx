import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import type { SchedulingEntry } from "@/components/scheduling/types";

type ScheduleRotatorProps = {
  entries: SchedulingEntry[];
  title?: string;
};

export function ScheduleRotator({ entries, title = "Now Airing / Up Next" }: ScheduleRotatorProps) {
  const { nowAiring, upNext } = useMemo(() => {
    const sorted = [...entries].sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
    const now = Date.now();
    const nowAiringEntry =
      sorted.find((entry) => Math.abs(entry.scheduledAt.getTime() - now) <= 45 * 60 * 1000) ?? null;
    const upNextEntry = sorted.find((entry) => entry.scheduledAt.getTime() > now) ?? null;
    return { nowAiring: nowAiringEntry, upNext: upNextEntry };
  }, [entries]);

  return (
    <div className="rounded-md border p-3 space-y-2">
      <h4 className="text-sm font-semibold">{title}</h4>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary">Now Airing</Badge>
          <span className="text-xs text-muted-foreground">
            {nowAiring ? nowAiring.scheduledAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "--"}
          </span>
        </div>
        <p className="text-sm">{nowAiring?.contentTitle ?? "No active slot right now."}</p>
      </div>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline">Up Next</Badge>
          <span className="text-xs text-muted-foreground">
            {upNext ? upNext.scheduledAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "--"}
          </span>
        </div>
        <p className="text-sm">{upNext?.contentTitle ?? "No upcoming slot."}</p>
      </div>
    </div>
  );
}
