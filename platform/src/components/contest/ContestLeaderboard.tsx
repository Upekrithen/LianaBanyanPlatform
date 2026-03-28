import { Medal, ThumbsUp, Coins } from "lucide-react";
import type { ContestEntry } from "@/hooks/useContests";

const rankColors = [
  "text-amber-500",
  "text-slate-400",
  "text-orange-600",
];

export function ContestLeaderboard({ entries }: { entries: ContestEntry[] }) {
  const sorted = [...entries].sort(
    (a, b) => b.vote_count - a.vote_count || b.pledge_total - a.pledge_total
  );
  const top = sorted.slice(0, 10);

  if (!top.length) return null;

  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Medal className="h-4 w-4" />
        Leaderboard
      </h3>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pl-3 pr-2 text-left w-8">#</th>
              <th className="py-2 px-2 text-left">Design</th>
              <th className="py-2 px-2 text-right">Votes</th>
              <th className="py-2 px-2 pr-3 text-right">Pledged</th>
            </tr>
          </thead>
          <tbody>
            {top.map((entry, i) => (
              <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className={`py-2 pl-3 pr-2 font-bold ${rankColors[i] ?? "text-muted-foreground"}`}>
                  {i + 1}
                </td>
                <td className="py-2 px-2 font-medium truncate max-w-[200px]">
                  {entry.project?.title ?? "Untitled"}
                </td>
                <td className="py-2 px-2 text-right tabular-nums">
                  <span className="inline-flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {entry.vote_count}
                  </span>
                </td>
                <td className="py-2 px-2 pr-3 text-right tabular-nums">
                  <span className="inline-flex items-center gap-1">
                    <Coins className="h-3 w-3" />
                    {entry.pledge_total}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
