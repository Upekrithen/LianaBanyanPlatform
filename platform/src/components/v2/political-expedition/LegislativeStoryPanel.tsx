import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type LegislativeStoryPanelProps = {
  issueLabel: string;
  snippet: string;
};

export function LegislativeStoryPanel({ issueLabel, snippet }: LegislativeStoryPanelProps) {
  return (
    <Card data-xray-id="political-expedition-legislative-story-panel">
      <CardHeader>
        <CardTitle>Legislative Story Panel</CardTitle>
        <CardDescription>Current chapter in {issueLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{snippet}</p>
      </CardContent>
    </Card>
  );
}
