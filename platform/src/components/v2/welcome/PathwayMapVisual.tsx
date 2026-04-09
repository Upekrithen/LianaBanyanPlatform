const PATHWAYS = [
  { name: "Food", slug: "food", description: "Feed neighbors through practical local systems." },
  { name: "Manufacturing", slug: "manufacturing", description: "Build and ship useful goods cooperatively." },
  { name: "Service", slug: "service", description: "Offer practical help and skilled labor." },
  { name: "Local Business", slug: "local-business", description: "Launch and grow main-street operations." },
  { name: "Guild", slug: "guild", description: "Coordinate with craft and trade peers." },
  { name: "Tribe", slug: "tribe", description: "Form mission-aligned teams and circles." },
];

export function PathwayMapVisual() {
  return (
    <section className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Visual pathway map</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick one starting direction. You can branch later.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {PATHWAYS.map((pathway) => (
          <a
            key={pathway.name}
            href={`/cold-start/${pathway.slug}`}
            className="group rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40"
          >
            <p className="text-base font-semibold">{pathway.name}</p>
            <p className="mt-2 text-sm text-muted-foreground">{pathway.description}</p>
            <p className="mt-3 text-sm font-medium text-primary group-hover:underline">
              Explore this path
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
