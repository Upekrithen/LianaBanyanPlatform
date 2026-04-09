import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export type ElectionProposal = {
  id: string;
  title: string;
  category: string;
  status: "open" | "under_review" | "closed";
  deadlineAt: string | null;
  turnoutCount: number;
  turnoutPct: number;
  description: string;
};

type ProposalCardProps = {
  proposal: ElectionProposal;
  onReview: (proposalId: string) => void;
};

function countdown(deadlineAt: string | null) {
  if (!deadlineAt) return "No deadline set";
  const target = new Date(deadlineAt).getTime();
  if (Number.isNaN(target)) return "No deadline set";
  const now = Date.now();
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (diff === 0) return "Deadline reached";
  if (days > 0) return `${days}d ${hours}h remaining`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins}m remaining`;
}

export function ProposalCard({ proposal, onReview }: ProposalCardProps) {
  return (
    <Card className="h-full border-slate-300 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-base">{proposal.title}</CardTitle>
          <Badge variant="secondary">{proposal.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap gap-2">
          <Badge
            className={
              proposal.status === "open"
                ? "bg-emerald-700 text-white"
                : proposal.status === "under_review"
                ? "bg-amber-700 text-white"
                : "bg-slate-700 text-white"
            }
          >
            {proposal.status === "under_review" ? "Under Review" : proposal.status[0].toUpperCase() + proposal.status.slice(1)}
          </Badge>
          <Badge variant="outline" className="text-slate-600 dark:text-slate-300">
            {countdown(proposal.deadlineAt)}
          </Badge>
          <Badge variant="outline">
            Turnout {proposal.turnoutCount} ({proposal.turnoutPct.toFixed(0)}%)
          </Badge>
        </div>
        <p className="line-clamp-2 text-muted-foreground">{proposal.description}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => onReview(proposal.id)}>
          Review Proposal
        </Button>
      </CardFooter>
    </Card>
  );
}
