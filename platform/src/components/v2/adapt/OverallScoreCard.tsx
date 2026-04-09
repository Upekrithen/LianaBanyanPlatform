import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type OverallScoreCardProps = {
  score: number;
  percentileTop: number;
};

function ringStyle(score: number): { background: string } {
  const clamped = Math.max(0, Math.min(100, score));
  return {
    background: `conic-gradient(from 180deg, hsl(45 92% 55%) 0%, hsl(142 72% 42%) ${clamped}%, hsl(45 25% 90%) ${clamped}%, hsl(45 25% 90%) 100%)`,
  };
}

export function OverallScoreCard({ score, percentileTop }: OverallScoreCardProps) {
  return (
    <Card data-xray-id="adapt-overall-score-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Overall standing</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <div className="relative grid h-40 w-40 place-items-center rounded-full p-3" style={ringStyle(score)}>
          <div className="grid h-full w-full place-items-center rounded-full bg-background">
            <p className="text-4xl font-semibold">{Math.round(score)}</p>
            <p className="text-xs text-muted-foreground">composite</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">Warm trendline, steady movement.</p>
          <p className="text-muted-foreground">
            You are in the top <strong>{percentileTop}%</strong> of current measured standing.
          </p>
          <p className="text-muted-foreground">
            Your score reflects participation patterns across all five pillars and updates as contributions land.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
