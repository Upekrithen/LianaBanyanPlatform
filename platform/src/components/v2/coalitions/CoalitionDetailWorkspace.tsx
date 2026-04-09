import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coalition } from "./types";

type CoalitionDetailWorkspaceProps = {
  coalition: Coalition | null;
};

export function CoalitionDetailWorkspace({ coalition }: CoalitionDetailWorkspaceProps) {
  return (
    <Card data-xray-id="coalition-detail-workspace">
      <CardHeader>
        <CardTitle>Coalition detail workspace</CardTitle>
      </CardHeader>
      <CardContent>
        {!coalition ? (
          <p className="text-sm text-muted-foreground">
            Select a coalition above to manage discounts, promotions, and purchasing.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-lg font-medium">{coalition.name}</p>
            <p className="text-sm text-muted-foreground">{coalition.summary}</p>
            <p className="text-xs text-muted-foreground">
              {coalition.memberCount} members · status {coalition.status}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
