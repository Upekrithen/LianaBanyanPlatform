import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coalition } from "./types";

type CoalitionCardProps = {
  coalition: Coalition;
  active: boolean;
  onOpen: () => void;
};

export function CoalitionCard({ coalition, active, onOpen }: CoalitionCardProps) {
  return (
    <div className={`rounded-lg border p-4 ${active ? "border-primary bg-primary/5" : ""}`} data-xray-id="coalition-card">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">{coalition.name}</p>
          <p className="text-sm text-muted-foreground">{coalition.summary}</p>
        </div>
        <Badge variant="outline" className="capitalize">
          {coalition.status}
        </Badge>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">{coalition.memberCount} storefront members</p>
      <Button type="button" size="sm" onClick={onOpen}>
        Open workspace
      </Button>
    </div>
  );
}
