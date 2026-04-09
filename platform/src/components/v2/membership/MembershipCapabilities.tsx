import { CheckCircle2 } from "lucide-react";

const CAPABILITIES = [
  "Sell on the marketplace with founder-aligned platform terms.",
  "Launch projects and collaboration calls with practical production tools.",
  "Participate in cooperative workflows across commerce, creation, and operations.",
  "Build contribution history through real participation instead of demographic profiling.",
  "Access member workspaces that coordinate delivery, quality, and accountability.",
  "Move from observer to participant with one consistent membership promise.",
];

export function MembershipCapabilities() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">What membership unlocks</h2>
      <ul className="space-y-3">
        {CAPABILITIES.map((item) => (
          <li key={item} className="flex items-start gap-3 rounded-lg border bg-card p-4">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-sm text-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
