import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, PenLine, Vote, Trophy, Gavel } from "lucide-react";
import type { Contest } from "@/hooks/useContests";
import { getContestPhase } from "@/hooks/useContests";

const phases = [
  { key: "upcoming", label: "Upcoming", icon: Clock },
  { key: "submissions", label: "Submissions", icon: PenLine },
  { key: "voting", label: "Voting", icon: Vote },
  { key: "judging", label: "Judging", icon: Gavel },
  { key: "complete", label: "Complete", icon: Trophy },
] as const;

export function ContestTimeline({ contest }: { contest: Contest }) {
  const current = getContestPhase(contest);
  const currentIdx = phases.findIndex((p) => p.key === current);

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {phases.map((phase, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const Icon = phase.icon;

        return (
          <div key={phase.key} className="flex items-center">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                done && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
                active && "bg-primary/15 text-primary ring-1 ring-primary/30",
                !done && !active && "bg-muted/50 text-muted-foreground"
              )}
            >
              {done ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Icon className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">{phase.label}</span>
            </div>
            {i < phases.length - 1 && (
              <div
                className={cn(
                  "mx-1 h-0.5 w-4 rounded-full",
                  i < currentIdx ? "bg-emerald-500/40" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
