import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GuildCardData } from "./GuildCard";

type GuildDetailPanelProps = {
  guild: GuildCardData;
};

export function GuildDetailPanel({ guild }: GuildDetailPanelProps) {
  return (
    <Card className="mt-3 border-slate-300 bg-slate-50/30 dark:border-slate-800 dark:bg-slate-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{guild.name} details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>{guild.charterFocus}</p>
        <p>Threshold: {guild.thresholdMarks} Marks. Stake requirement: {guild.stakeMarks} Marks.</p>
        <p>Representation: {guild.representativeCount} elected representatives.</p>
        <p>Standing: {guild.standing}.</p>
      </CardContent>
    </Card>
  );
}
