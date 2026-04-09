import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PercentileContextPanelProps = {
  percentileTop: number;
};

export function PercentileContextPanel({ percentileTop }: PercentileContextPanelProps) {
  return (
    <Card data-xray-id="adapt-percentile-context">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Percentile context</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>
          You are in the <strong className="text-foreground">top {percentileTop}%</strong> of current measured members.
        </p>
        <p>This framing shows present standing while keeping momentum focused on next-step contribution quality.</p>
      </CardContent>
    </Card>
  );
}
