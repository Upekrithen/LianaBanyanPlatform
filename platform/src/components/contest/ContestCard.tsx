import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Trophy, ArrowRight } from "lucide-react";
import type { Contest } from "@/hooks/useContests";
import { getContestPhase } from "@/hooks/useContests";
import { ContestTimeline } from "./ContestTimeline";

const phaseColors: Record<string, string> = {
  upcoming: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  submissions: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  voting: "border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-400",
  judging: "border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-400",
  complete: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

export function ContestCard({ contest }: { contest: Contest }) {
  const phase = getContestPhase(contest);
  const subEnd = new Date(contest.submission_end);
  const voteEnd = new Date(contest.voting_end);

  return (
    <Link to={`/contests/${contest.slug}`} className="block group">
      <Card className="transition-all hover:shadow-lg hover:border-primary/30 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {contest.title}
            </CardTitle>
            <Badge variant="outline" className={phaseColors[phase]}>
              {phase === "submissions" ? "Open" : phase.charAt(0).toUpperCase() + phase.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              {contest.craft_type}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {phase === "submissions"
                ? `Closes ${subEnd.toLocaleDateString()}`
                : phase === "voting"
                  ? `Voting ends ${voteEnd.toLocaleDateString()}`
                  : `Starts ${new Date(contest.submission_start).toLocaleDateString()}`}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {contest.description}
          </p>
          <ContestTimeline contest={contest} />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground line-clamp-1">
              {contest.prize_description.substring(0, 80)}…
            </p>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
