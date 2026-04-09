import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GuildCardData } from "./GuildCard";

type GuildCompareToolProps = {
  selected: GuildCardData[];
  onRemove: (guildId: string) => void;
};

export function GuildCompareTool({ selected, onRemove }: GuildCompareToolProps) {
  if (selected.length === 0) return null;

  return (
    <Card id="guild-compare-tool">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Guild compare tool</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1">
          {selected.map((guild) => (
            <article key={guild.id} className="min-w-[260px] snap-start rounded-lg border p-3">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold">{guild.name}</h3>
                <Button size="sm" variant="ghost" onClick={() => onRemove(guild.id)}>
                  Remove
                </Button>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>Discipline: {guild.discipline}</li>
                <li>Charter: {guild.charterFocus}</li>
                <li>Threshold: {guild.thresholdMarks} Marks</li>
                <li>Stake: {guild.stakeMarks} Marks</li>
                <li>Reps: {guild.representativeCount}</li>
                <li>Standing: {guild.standing}</li>
              </ul>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
