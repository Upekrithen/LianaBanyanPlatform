export function CreatorEconomicsExample() {
  return (
    <section className="space-y-4 rounded-xl border bg-card p-5">
      <h2 className="text-2xl font-semibold tracking-tight">How creator economics work</h2>
      <p className="text-sm text-muted-foreground">
        The platform model is structural: creators keep 83.3% and platform pricing follows Cost + 20%.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Example transaction</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">$500.00</p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Creator keeps (83.3%)</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">$416.67</p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Platform share</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">$83.33</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        The platform share covers cost and sustainability through the Cost + 20% doctrine.
      </p>
    </section>
  );
}
