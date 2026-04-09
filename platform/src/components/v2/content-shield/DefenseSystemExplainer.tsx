import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LAYERS = [
  {
    title: "Automated review",
    text: "Initial signals catch obvious spam and known harmful patterns for faster triage.",
  },
  {
    title: "Community flags",
    text: "Member reports add context and help prioritize what needs human review next.",
  },
  {
    title: "Steward judgment",
    text: "Stewards review context, intent, and impact before applying case decisions.",
  },
  {
    title: "Founder override",
    text: "Critical edge cases can be escalated for final review when extra care is needed.",
  },
];

export function DefenseSystemExplainer() {
  return (
    <Card data-xray-id="content-shield-defense-explainer">
      <CardHeader>
        <CardTitle>How the defense system works</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {LAYERS.map((layer, index) => (
          <div key={layer.title} className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Layer {index + 1}</p>
            <p className="font-medium">{layer.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{layer.text}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
