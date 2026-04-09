import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriberStory } from "./types";

type RecentSubscriberStoriesProps = {
  stories: SubscriberStory[];
};

export function RecentSubscriberStories({ stories }: RecentSubscriberStoriesProps) {
  return (
    <Card data-xray-id="subscription-channel-stories">
      <CardHeader>
        <CardTitle>Recent subscriber stories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No opt-in stories yet.</p>
        ) : (
          stories.map((story) => (
            <div key={story.id} className="rounded-lg border p-3">
              <p className="text-sm">"{story.quote}"</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {story.name} · {story.role}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
