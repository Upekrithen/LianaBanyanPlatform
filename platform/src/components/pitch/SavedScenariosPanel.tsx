import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Clock, Shield, FolderOpen } from "lucide-react";
import type { SavedScenario } from "@/hooks/useSavedScenarios";

interface SavedScenariosPanelProps {
  scenarios: SavedScenario[];
  onDelete: (id: string) => void;
  onLoad?: (scenario: SavedScenario) => void;
}

const TIER_LABELS: Record<string, string> = {
  c20: "C+20",
  c40: "C+40",
  c60: "C+60",
  c90: "C+90",
};

export function SavedScenariosPanel({
  scenarios,
  onDelete,
  onLoad,
}: SavedScenariosPanelProps) {
  if (scenarios.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          Saved Scenarios ({scenarios.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {scenarios.map((s) => {
          const isPermanent = s.expires_at === null;
          const isExpired =
            s.expires_at != null && new Date(s.expires_at) < new Date();
          const hoursLeft =
            s.expires_at != null
              ? Math.max(
                  0,
                  Math.round(
                    (new Date(s.expires_at).getTime() - Date.now()) / 3_600_000,
                  ),
                )
              : null;

          if (isExpired) return null;

          return (
            <div
              key={s.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <button
                className="flex-1 text-left"
                onClick={() => onLoad?.(s)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {s.scenario_name}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {TIER_LABELS[s.discount_tier] ?? s.discount_tier}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span>
                    ${Number(s.monthly_revenue ?? 0).toLocaleString()}/mo
                  </span>
                  <span>{s.weekly_orders} orders/wk</span>
                  {isPermanent ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] gap-1 text-emerald-600"
                    >
                      <Shield className="w-2.5 h-2.5" />
                      Permanent
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[10px] gap-1 text-amber-600"
                    >
                      <Clock className="w-2.5 h-2.5" />
                      {hoursLeft}h left
                    </Badge>
                  )}
                </div>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => onDelete(s.id)}
              >
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default SavedScenariosPanel;
