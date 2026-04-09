import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank } from "lucide-react";

type FamilyFundCardProps = {
  amount: number;
  goal: number;
  contributors: string[];
};

function money(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function FamilyFundCard({ amount, goal, contributors }: FamilyFundCardProps) {
  const clampedGoal = goal > 0 ? goal : 1;
  const percent = Math.max(0, Math.min(100, Math.round((amount / clampedGoal) * 100)));

  return (
    <Card className="border-amber-300/60 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:border-amber-800/60 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-rose-950/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <PiggyBank className="h-4 w-4 text-amber-700 dark:text-amber-300" />
          Shared fund
        </CardTitle>
        <CardDescription>Warm savings jar for family goals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Current</p>
            <p className="text-3xl font-semibold">{money(amount)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Goal</p>
            <p className="text-lg font-medium">{money(goal)}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-amber-100 dark:bg-amber-950/80">
            <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${percent}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">{percent}% toward goal</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {contributors.length > 0 ? (
            contributors.map((name) => (
              <Badge key={name} variant="secondary" className="bg-white/80 text-xs dark:bg-black/20">
                {name}
              </Badge>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No contributors yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
