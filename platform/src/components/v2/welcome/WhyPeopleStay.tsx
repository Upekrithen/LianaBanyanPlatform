const QUOTES = [
  {
    quote:
      "I came to look around. I stayed because I could choose one path and actually start.",
    by: "Marketplace member",
  },
  {
    quote:
      "The orientation was clear: pick a lane, do real work, and grow from there.",
    by: "Production pathway participant",
  },
  {
    quote:
      "It feels like entering a workshop, not a maze. I knew what to do next.",
    by: "Local coordinator",
  },
];

export function WhyPeopleStay() {
  return (
    <section className="rounded-2xl border bg-muted/30 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Why people stay</h2>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        {QUOTES.map((item) => (
          <figure key={item.by} className="rounded-xl border bg-card p-4">
            <blockquote className="text-sm leading-relaxed text-foreground/90">
              “{item.quote}”
            </blockquote>
            <figcaption className="mt-3 text-xs text-muted-foreground">{item.by}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
