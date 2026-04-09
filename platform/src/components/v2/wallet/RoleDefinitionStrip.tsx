export function RoleDefinitionStrip() {
  return (
    <section className="rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-semibold text-[hsl(var(--currency-credits))]">Credits</span>: transact
          and settle day-to-day value.
        </p>
        <p>
          <span className="font-semibold text-[hsl(var(--currency-marks))]">Marks</span>: participate,
          contribute, and carry governance weight.
        </p>
        <p>
          <span className="font-semibold text-[hsl(var(--currency-joules))]">Joules</span>: persist
          surplus contributions for specialized use.
        </p>
      </div>
    </section>
  );
}
