import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export type TribeCardData = {
  id: string;
  name: string;
  slug: string;
  category: string;
  charterExcerpt: string;
  memberCount: number;
  activityLevel: string;
  joinType: "Open" | "Invite-only";
  geoTag: string | null;
};

type TribeCardProps = {
  tribe: TribeCardData;
  isMember: boolean;
  onJoin: (tribe: TribeCardData) => void;
  onRequest: (tribe: TribeCardData) => void;
  onOpen: (tribe: TribeCardData) => void;
};

export function TribeCard({ tribe, isMember, onJoin, onRequest, onOpen }: TribeCardProps) {
  return (
    <Card className="h-full rounded-2xl border-orange-200/80 bg-gradient-to-b from-orange-50 to-amber-50 dark:border-orange-900/60 dark:from-orange-950/20 dark:to-amber-950/20">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{tribe.name}</CardTitle>
          <Badge variant="secondary">{tribe.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">{tribe.charterExcerpt}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline">{tribe.memberCount} members</Badge>
          <Badge variant="outline">{tribe.activityLevel}</Badge>
          <Badge className={tribe.joinType === "Open" ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"}>
            {tribe.joinType}
          </Badge>
          {tribe.geoTag ? <Badge variant="secondary">{tribe.geoTag}</Badge> : null}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        {isMember ? (
          <Button className="w-full" variant="outline" onClick={() => onOpen(tribe)}>
            Open tribe
          </Button>
        ) : tribe.joinType === "Open" ? (
          <Button className="w-full" onClick={() => onJoin(tribe)}>
            Join
          </Button>
        ) : (
          <Button className="w-full" onClick={() => onRequest(tribe)}>
            Request to join
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
