import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type EscalationLadderProps = {
  activeRoundTables: number;
};

export function EscalationLadder({ activeRoundTables }: EscalationLadderProps) {
  const steps = [
    "Case queue intake",
    "Four-judge analysis",
    "Convergence check",
    "Areopagus escalation",
    "Final ruling and audit",
  ];

  return (
    <Card id="escalation-ladder">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Escalation ladder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-2 rounded-md border p-2">
            <Badge variant="secondary">{index + 1}</Badge>
            <p className="text-sm">{step}</p>
            {step.includes("Areopagus") ? (
              <Badge className="ml-auto bg-amber-700 text-white">{activeRoundTables} active round table(s)</Badge>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
