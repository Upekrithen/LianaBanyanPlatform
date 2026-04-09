import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export type GuildCardData = {
  id: string;
  slug: string;
  name: string;
  discipline: string;
  charterFocus: string;
  thresholdMarks: number;
  stakeMarks: number;
  memberCount: number;
  representativeCount: number;
  standing: "active" | "forming";
  rulesDocument: string | null;
};

type GuildCardProps = {
  guild: GuildCardData;
  onViewCharter: (guild: GuildCardData) => void;
  onCompare: (guild: GuildCardData) => void;
  onJoin: (guild: GuildCardData) => void;
};

export function GuildCard({ guild, onViewCharter, onCompare, onJoin }: GuildCardProps) {
  return (
    <Card className="h-full rounded-lg border-slate-300 bg-slate-50/40 shadow-sm dark:border-slate-800 dark:bg-slate-950/20">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{guild.name}</CardTitle>
          <Badge variant="outline">{guild.discipline}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="line-clamp-2 text-muted-foreground">{guild.charterFocus}</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Badge variant="secondary">Threshold: {guild.thresholdMarks} Marks</Badge>
          <Badge variant="secondary">Stake: {guild.stakeMarks} Marks</Badge>
          <Badge variant="outline">Members: {guild.memberCount}</Badge>
          <Badge variant="outline">Reps: {guild.representativeCount}</Badge>
          <Badge className={guild.standing === "active" ? "bg-emerald-700 text-white" : "bg-amber-700 text-white"}>
            {guild.standing}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-3 gap-2">
        <Button size="sm" variant="outline" onClick={() => onViewCharter(guild)}>
          View charter
        </Button>
        <Button size="sm" variant="outline" onClick={() => onCompare(guild)}>
          Compare
        </Button>
        <Button size="sm" onClick={() => onJoin(guild)}>
          Join
        </Button>
      </CardFooter>
    </Card>
  );
}
