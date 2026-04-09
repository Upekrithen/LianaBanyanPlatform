import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FourStagePipelineTrackerProps = {
  voted: number;
  prototyped: number;
  produced: number;
  shipped: number;
};

export function FourStagePipelineTracker({ voted, prototyped, produced, shipped }: FourStagePipelineTrackerProps) {
  const stages = [
    { key: "voted", label: "Voted", value: voted },
    { key: "prototyped", label: "Prototyped", value: prototyped },
    { key: "produced", label: "Produced", value: produced },
    { key: "shipped", label: "Shipped", value: shipped },
  ];

  return (
    <Card data-xray-id="design-democracy-pipeline">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">4-stage pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {stages.map((stage) => (
            <div key={stage.key} className="min-w-[150px] rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{stage.label}</p>
              <p className="text-2xl font-semibold">{stage.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
