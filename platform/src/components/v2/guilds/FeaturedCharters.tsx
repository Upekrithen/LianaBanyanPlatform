import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GuildCardData } from "./GuildCard";

type FeaturedChartersProps = {
  guilds: GuildCardData[];
};

export function FeaturedCharters({ guilds }: FeaturedChartersProps) {
  if (guilds.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Featured charters</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 md:grid-cols-2">
        {guilds.slice(0, 4).map((guild) => (
          <article key={guild.id} className="rounded-lg border p-3">
            <p className="text-sm font-medium">{guild.name}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{guild.charterFocus}</p>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
