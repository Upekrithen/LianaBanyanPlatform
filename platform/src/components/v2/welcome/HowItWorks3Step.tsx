const STEPS = [
  {
    title: "Choose one path",
    description: "Start with the pathway that matches what you want to build right now.",
  },
  {
    title: "Contribute in context",
    description: "Use tools, projects, and coordination spaces that fit your selected path.",
  },
  {
    title: "Grow with the network",
    description: "Expand into adjacent paths as your participation and confidence grow.",
  },
];

export function HowItWorks3Step() {
  return (
    <section className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight">How the platform works</h2>
      </div>
      <ol className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.title} className="rounded-xl border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Step {index + 1}</p>
            <p className="mt-2 text-base font-semibold">{step.title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
