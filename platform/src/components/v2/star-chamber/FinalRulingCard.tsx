import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActiveCaseDetails } from "./ActiveCaseWorkspace";

type FinalRulingCardProps = {
  item: ActiveCaseDetails | null;
};

export function FinalRulingCard({ item }: FinalRulingCardProps) {
  if (!item) return null;

  return (
    <Card id="final-ruling-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Final ruling</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{item.finalAction ?? item.recommendedAction ?? "Ruling in progress."}</p>
        {item.founderOverride ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
            <div className="mb-1 flex items-center gap-2">
              <Badge className="bg-amber-700 text-white">Exceptional annotation</Badge>
              <span className="text-xs text-muted-foreground">
                {item.resolvedAt ? new Date(item.resolvedAt).toLocaleString() : "Timestamp pending"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{item.founderOverrideReason ?? "Override annotation provided."}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
