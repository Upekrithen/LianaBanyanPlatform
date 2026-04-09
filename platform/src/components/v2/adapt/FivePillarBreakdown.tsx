import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PillarRow } from "./PillarRow";
import { AdaptPillar } from "./types";

type FivePillarBreakdownProps = {
  pillars: AdaptPillar[];
};

export function FivePillarBreakdown({ pillars }: FivePillarBreakdownProps) {
  return (
    <Card data-xray-id="adapt-five-pillar-breakdown">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Five-pillar breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pillars.map((pillar) => (
          <PillarRow key={pillar.key} pillar={pillar} />
        ))}
      </CardContent>
    </Card>
  );
}
