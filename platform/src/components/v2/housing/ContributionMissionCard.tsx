import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HousingMission } from "./types";

type ContributionMissionCardProps = {
  mission: HousingMission;
  onTakeMission: (mission: HousingMission) => Promise<void> | void;
};

export function ContributionMissionCard({ mission, onTakeMission }: ContributionMissionCardProps) {
  return (
    <Card data-xray-id="housing-contribution-mission-card">
      <CardHeader>
        <CardTitle className="text-base">{mission.name}</CardTitle>
        <CardDescription>{mission.whyItMatters}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
          <p>Time: <span className="font-medium text-foreground">{mission.timeEstimate}</span></p>
          <p>Impact: <span className="font-medium text-foreground">{mission.impactLabel}</span></p>
        </div>
        <Button variant="outline" onClick={() => onTakeMission(mission)}>
          Take mission
        </Button>
      </CardContent>
    </Card>
  );
}
