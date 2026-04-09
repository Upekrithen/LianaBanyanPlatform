import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GuildCardData } from "./GuildCard";

type HarperGuildHighlightProps = {
  guild: GuildCardData | null;
};

export function HarperGuildHighlight({ guild }: HarperGuildHighlightProps) {
  if (!guild) return null;

  return (
    <Card className="border-indigo-300 bg-indigo-50/70 dark:border-indigo-900 dark:bg-indigo-950/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          Harper Guild
          <Badge className="bg-indigo-700 text-white">Governance-critical</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{guild.charterFocus}</p>
        <p className="text-xs text-muted-foreground">
          Oversight and charter integrity across guild participation pathways.
        </p>
      </CardContent>
    </Card>
  );
}
