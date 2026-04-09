import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HousingPriorityTier } from "./types";

type PriorityLadderVisualizationProps = {
  tier: HousingPriorityTier;
};

export function PriorityLadderVisualization({ tier }: PriorityLadderVisualizationProps) {
  const current = Math.max(0, Math.min(100, tier.priorityScore));
  const nextTarget = Math.max(current + tier.pointsToNextTier, current + 1);
  const pctToNext = (current / nextTarget) * 100;

  return (
    <Card data-xray-id="housing-priority-ladder">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Priority Ladder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{tier.tierLabel}</Badge>
          <p className="text-xs text-muted-foreground">
            Next rung: <span className="font-medium text-foreground">{tier.nextTierLabel}</span>
          </p>
        </div>
        <Progress value={Math.min(100, Math.max(0, pctToNext))} className="h-2.5" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Priority score: {tier.priorityScore.toFixed(1)}</span>
          <span>{tier.pointsToNextTier.toFixed(1)} points to next rung</span>
        </div>
      </CardContent>
    </Card>
  );
}
