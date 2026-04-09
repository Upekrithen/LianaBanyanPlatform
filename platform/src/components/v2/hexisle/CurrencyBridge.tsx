import { ArrowRightLeft } from "lucide-react";

export function CurrencyBridge() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Currency bridge</h2>
      <p className="text-sm text-muted-foreground">
        HexIsle game tokens and platform Marks map conceptually across participation context. This
        section is directional only and does not publish conversion rates.
      </p>
      <div className="grid gap-4 rounded-xl border bg-card p-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">In-game layer</p>
          <p className="mt-1 text-lg font-semibold">Tokens</p>
          <p className="mt-1 text-sm text-muted-foreground">Match tempo, tile actions, and session control.</p>
        </div>
        <div className="flex justify-center">
          <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Platform layer</p>
          <p className="mt-1 text-lg font-semibold">Marks</p>
          <p className="mt-1 text-sm text-muted-foreground">Track contribution context across cooperative workflows.</p>
        </div>
      </div>
    </section>
  );
}
