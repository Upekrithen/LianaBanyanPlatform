import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PioneerPerson } from "./types";

type MemberStoriesCarouselProps = {
  stories: PioneerPerson[];
};

export function MemberStoriesCarousel({ stories }: MemberStoriesCarouselProps) {
  const [index, setIndex] = useState(0);

  const current = useMemo(() => {
    if (stories.length === 0) return null;
    return stories[index % stories.length];
  }, [stories, index]);

  return (
    <Card data-xray-id="pioneers-member-stories-carousel">
      <CardHeader>
        <CardTitle>Member Stories</CardTitle>
        <CardDescription>Mixed Pioneer and non-Pioneer stories from the same living narrative.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {current ? (
          <>
            <div className="rounded-md border bg-muted/20 p-3">
              <p className="text-sm font-semibold">{current.displayName}</p>
              <p className="text-xs text-muted-foreground">{current.isPioneer ? "Pioneer" : "Member"} - {current.tagline}</p>
              <p className="mt-2 text-sm text-muted-foreground">{current.story}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIndex((prev) => (prev - 1 + stories.length) % stories.length)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIndex((prev) => (prev + 1) % stories.length)}>
                Next
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Stories will appear once members opt in.</p>
        )}
      </CardContent>
    </Card>
  );
}
