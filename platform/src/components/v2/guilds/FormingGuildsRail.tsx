import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GuildCardData } from "./GuildCard";

type FormingGuildsRailProps = {
  guilds: GuildCardData[];
};

export function FormingGuildsRail({ guilds }: FormingGuildsRailProps) {
  const forming = guilds.filter((guild) => guild.standing === "forming");
  if (forming.length === 0) return null;

  return (
    <section className="space-y-3" id="forming-guilds-rail">
      <h2 className="text-lg font-semibold">Forming guilds</h2>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {forming.map((guild) => (
          <Card key={guild.id} className="min-w-[240px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{guild.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground line-clamp-1">{guild.charterFocus}</p>
              <Badge className="bg-amber-700 text-white">Forming</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
