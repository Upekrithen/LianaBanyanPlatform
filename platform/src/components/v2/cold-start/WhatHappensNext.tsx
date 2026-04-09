import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STEPS = [
  {
    title: "Commit",
    detail: "Choose one starting path based on your first transaction.",
  },
  {
    title: "Setup",
    detail: "Complete guided setup tasks tailored to that path.",
  },
  {
    title: "First transaction",
    detail: "Publish, offer, or fulfill your first live cooperative movement.",
  },
];

export function WhatHappensNext() {
  return (
    <section>
      <h2 className="text-lg font-semibold tracking-tight">What happens after you choose</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <Card key={step.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {index + 1}. {step.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{step.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

