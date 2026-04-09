import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const LADDER = [
  { label: "Founders' Circle", range: "Earliest cohort", recognition: "Highest recognition for highest uncertainty" },
  { label: "Trailblazer", range: "Early growth cohort", recognition: "Strong recognition for proven momentum-building" },
  { label: "Pathfinder", range: "Scaling cohort", recognition: "Recognition for extending reliable contribution paths" },
  { label: "Early Adopter+", range: "Current cohorts", recognition: "Recognition remains meaningful because story is still being written" },
];

export function RewardLadder() {
  return (
    <Card data-xray-id="pioneers-reward-ladder">
      <CardHeader>
        <CardTitle>Reward Ladder</CardTitle>
        <CardDescription>Early uncertainty justified higher recognition; later cohorts still shape the living story.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {LADDER.map((step, index) => (
          <div key={step.label} className="rounded-md border p-2.5">
            <p className="text-sm font-semibold">
              {index + 1}. {step.label}
            </p>
            <p className="text-xs text-muted-foreground">{step.range}</p>
            <p className="text-xs text-muted-foreground">{step.recognition}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
