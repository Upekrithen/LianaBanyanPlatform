import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MODES = [
  {
    title: "Solo Expeditions",
    body: "Run independent campaigns to test tile control strategies and progression pacing.",
  },
  {
    title: "Co-op Encampments",
    body: "Coordinate structures and routes with allies while preserving flexible role boundaries.",
  },
  {
    title: "League Seasons",
    body: "Competitive cycles with map-state consequences. Strategic rhythm is inspired by Polytopia (polytopia.io).",
  },
];

export function ModesGrid() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Modes</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {MODES.map((mode) => (
          <Card key={mode.title}>
            <CardHeader>
              <CardTitle className="text-lg">{mode.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{mode.body}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
