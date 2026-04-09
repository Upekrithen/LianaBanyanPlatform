import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DesignEntry } from "./types";
import { VoteButton } from "./VoteButton";

type DesignCardProps = {
  entry: DesignEntry;
  maxCredits: number;
  onVote: (participantId: string, credits: number) => Promise<void> | void;
  onViewDesigner: (entry: DesignEntry) => void;
};

const LABEL_STYLE: Record<DesignEntry["label"], string> = {
  Leading: "bg-emerald-100 text-emerald-800",
  "Strong contender": "bg-amber-100 text-amber-800",
  "Needs votes": "bg-slate-100 text-slate-800",
};

export function DesignCard({ entry, maxCredits, onVote, onViewDesigner }: DesignCardProps) {
  return (
    <Card data-xray-id="design-democracy-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{entry.designerName}</CardTitle>
          <Badge className={LABEL_STYLE[entry.label]} variant="secondary">
            {entry.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">Community vote weight: {entry.votes.toFixed(1)} Credits</p>
        <div className="flex flex-wrap items-center gap-2">
          <VoteButton maxCredits={maxCredits} onVote={(credits) => onVote(entry.id, credits)} />
          <button className="text-sm underline underline-offset-2" onClick={() => onViewDesigner(entry)}>
            View designer details
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
