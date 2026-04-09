import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STEPS = [
  {
    title: "Claim Tiles",
    body: "Secure terrain positions and establish your opening presence on the island map.",
  },
  {
    title: "Build Structures",
    body: "Place tactical structures that change movement, defense, and production options.",
  },
  {
    title: "Shift the Balance",
    body: "Coordinate decisions over multiple turns to control momentum across regions.",
  },
];

export function CoreLoopStrip() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Core loop</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <Card key={step.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span>{step.title}</span>
                {index < STEPS.length - 1 ? <ArrowRight className="h-4 w-4 text-muted-foreground" /> : null}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{step.body}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
