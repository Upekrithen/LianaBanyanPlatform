import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PioneerPerson } from "./types";

type PioneerCardProps = {
  person: PioneerPerson;
  onOpenProfile: (person: PioneerPerson) => void;
};

export function PioneerCard({ person, onOpenProfile }: PioneerCardProps) {
  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => onOpenProfile(person)} data-xray-id="pioneers-card">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              {person.displayName.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-base">{person.displayName}</CardTitle>
              <CardDescription>{person.tagline}</CardDescription>
            </div>
          </div>
          {person.badges.length > 0 ? (
            <Badge variant="outline" className="text-[10px]">
              {person.badges[0].label}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-xs text-muted-foreground">
        <p>Joined during {person.phaseLabel}</p>
        <p>{person.isPioneer ? "Pioneer story entry" : "Member story entry"}</p>
      </CardContent>
    </Card>
  );
}
