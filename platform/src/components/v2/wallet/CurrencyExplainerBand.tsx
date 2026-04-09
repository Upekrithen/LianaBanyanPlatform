import { Card, CardContent } from "@/components/ui/card";

export function CurrencyExplainerBand() {
  return (
    <Card className="border bg-muted/25">
      <CardContent className="space-y-3 p-5">
        <h2 className="text-lg font-semibold tracking-tight">How these currencies differ</h2>
        <p className="text-sm text-muted-foreground">
          Credits, Marks, and Joules are platform utilities with distinct jobs rather than one blended
          balance.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border bg-card p-3">
            <p className="text-sm font-semibold text-[hsl(var(--currency-credits))]">Credits</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Day-to-day transaction currency. 1 Credit tracks $1 equivalent value for cooperative
              purchases and exchanges.
            </p>
          </div>
          <div className="rounded-md border bg-card p-3">
            <p className="text-sm font-semibold text-[hsl(var(--currency-marks))]">Marks</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Participation and governance-weight currency. Backed and pledged movement stays visible to
              support accountability.
            </p>
          </div>
          <div className="rounded-md border bg-card p-3">
            <p className="text-sm font-semibold text-[hsl(var(--currency-joules))]">Joules</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Specialized surplus currency that persists contribution energy across production-oriented
              flows.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
