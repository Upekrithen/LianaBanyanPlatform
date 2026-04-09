import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HowVotingWorksExplainer() {
  return (
    <Card id="how-voting-works">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">How Marks-weighted voting works</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>Members review proposals and stake Marks to signal conviction before casting a ballot.</p>
        <p>Vote weight is visible, legible, and tied to accountable participation rather than financial language.</p>
        <p>Turnout remains visible so each measure reflects community participation in real time.</p>
      </CardContent>
    </Card>
  );
}
