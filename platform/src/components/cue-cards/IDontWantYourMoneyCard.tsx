/**
 * Cue card: I don't want your $. I want your — Success —
 * Anti-fundraising statement. SEC-safe.
 * data-xray-id: idont-want-your-money-card
 */

import { Card, CardContent } from "@/components/ui/card";

export function IDontWantYourMoneyCard() {
  return (
    <Card
      className="border-2 border-foreground/20 bg-background text-center py-8 px-6"
      data-xray-id="idont-want-your-money-card"
    >
      <CardContent className="p-0 space-y-2">
        <p className="text-xl md:text-2xl font-bold tracking-tight">
          I don&apos;t want your $.
        </p>
        <p className="text-lg md:text-xl font-medium text-muted-foreground">
          I want your
        </p>
        <p className="text-2xl md:text-3xl font-bold text-primary">
          — Success —
        </p>
      </CardContent>
    </Card>
  );
}
