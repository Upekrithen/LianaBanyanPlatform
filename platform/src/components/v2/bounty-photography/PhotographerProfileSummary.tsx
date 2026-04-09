import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PhotographerProfileSummaryProps = {
  completedAssignments: number;
  activeAssignments: number;
  localRadiusMiles: number;
};

export function PhotographerProfileSummary({
  completedAssignments,
  activeAssignments,
  localRadiusMiles,
}: PhotographerProfileSummaryProps) {
  return (
    <Card data-xray-id="bounty-photography-profile-summary">
      <CardHeader>
        <CardTitle>Photographer profile summary</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-muted/20 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Completed</p>
          <p className="text-xl font-semibold">{completedAssignments}</p>
        </div>
        <div className="rounded-lg border bg-muted/20 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Active</p>
          <p className="text-xl font-semibold">{activeAssignments}</p>
        </div>
        <div className="rounded-lg border bg-muted/20 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Local radius</p>
          <p className="text-xl font-semibold">{localRadiusMiles} mi</p>
        </div>
      </CardContent>
    </Card>
  );
}
