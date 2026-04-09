import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coalition } from "./types";
import { CoalitionCard } from "./CoalitionCard";

type MyCoalitionsOverviewProps = {
  coalitions: Coalition[];
  activeCoalitionId: string | null;
  onSelectCoalition: (coalitionId: string) => void;
};

export function MyCoalitionsOverview({
  coalitions,
  activeCoalitionId,
  onSelectCoalition,
}: MyCoalitionsOverviewProps) {
  return (
    <Card data-xray-id="coalitions-overview">
      <CardHeader>
        <CardTitle>My coalitions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {coalitions.length === 0 ? (
          <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
            No coalitions yet. Start by inviting storefront partners.
          </div>
        ) : (
          coalitions.map((coalition) => (
            <CoalitionCard
              key={coalition.id}
              coalition={coalition}
              active={activeCoalitionId === coalition.id}
              onOpen={() => onSelectCoalition(coalition.id)}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
