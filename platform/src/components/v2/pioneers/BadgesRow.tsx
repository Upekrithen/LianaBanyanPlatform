import { Award, Compass, Crown, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BADGE_DEFS = [
  { id: "founder", icon: Crown, label: "Founders' Circle", meaning: "Recognizes highest early uncertainty contribution." },
  { id: "path", icon: Compass, label: "Pathfinder", meaning: "Recognizes reliable bridge-building between cohorts." },
  { id: "governance", icon: Shield, label: "Governance Steward", meaning: "Recognizes steady participation in decision chapters." },
  { id: "craft", icon: Award, label: "Craft Builder", meaning: "Recognizes practical contribution shipped into member value." },
];

export function BadgesRow() {
  return (
    <Card data-xray-id="pioneers-badges-row">
      <CardHeader>
        <CardTitle>Badges</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {BADGE_DEFS.map((badge) => (
          <div key={badge.id} className="flex items-start gap-2 rounded-md border p-2.5">
            <badge.icon className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">{badge.label}</p>
              <p className="text-xs text-muted-foreground">{badge.meaning}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
