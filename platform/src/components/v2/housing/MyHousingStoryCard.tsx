import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HousingStoryCardData } from "./types";

type MyHousingStoryCardProps = {
  story: HousingStoryCardData;
};

export function MyHousingStoryCard({ story }: MyHousingStoryCardProps) {
  return (
    <Card className="md:static md:z-auto sticky top-[4.5rem] z-10" data-xray-id="housing-story-card">
      <CardHeader>
        <CardTitle>My Housing Story</CardTitle>
        <CardDescription>
          You are currently in <strong>{story.tier.tierLabel}</strong>. Next move to rise in priority: {story.nextMove}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {story.lastActions.length === 0 ? (
          <p className="text-muted-foreground">No recent housing actions yet.</p>
        ) : (
          story.lastActions.map((action) => (
            <div key={action.id} className="rounded-md border bg-muted/30 px-3 py-2">
              <p className="font-medium">{action.label}</p>
              <p className="text-xs text-muted-foreground">{new Date(action.happenedAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
