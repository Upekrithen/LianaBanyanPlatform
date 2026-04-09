import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KitTier } from "./types";

type PioneerNodeProgressBarProps = {
  kit: KitTier;
};

const PROGRESS: Record<KitTier, { percent: number; payoff: string }> = {
  gravity: {
    percent: 35,
    payoff: "Gravity kit + 5 successful batches = first readiness checkpoint on the Pioneer Node path.",
  },
  thermoplastic: {
    percent: 60,
    payoff: "Thermoplastic kit + 4 successful batches = intermediate Pioneer Node readiness checkpoint.",
  },
  complete: {
    percent: 80,
    payoff: "Complete kit + 3 successful batches = first Pioneer Node qualification checkpoint.",
  },
};

export function PioneerNodeProgressBar({ kit }: PioneerNodeProgressBarProps) {
  const state = PROGRESS[kit];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pioneer Node progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${state.percent}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">{state.percent}% current alignment on the Node path.</p>
        <p className="text-sm">{state.payoff}</p>
      </CardContent>
    </Card>
  );
}
