import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdaptPillar } from "./types";

type SevenDayTrendSparklinesProps = {
  pillars: AdaptPillar[];
};

function sparklinePath(values: number[]) {
  if (values.length === 0) return "";
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 100);
  const range = Math.max(1, max - min);
  return values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export function SevenDayTrendSparklines({ pillars }: SevenDayTrendSparklinesProps) {
  return (
    <Card data-xray-id="adapt-seven-day-trends">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Seven-day trends</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pillars.map((pillar) => (
          <div key={pillar.key} className="space-y-1 rounded-md border p-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{pillar.label}</span>
              <span className="text-muted-foreground">Room to grow</span>
            </div>
            <svg viewBox="0 0 100 100" className="h-10 w-full">
              <path d={sparklinePath(pillar.trend)} fill="none" stroke="hsl(38 92% 52%)" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
