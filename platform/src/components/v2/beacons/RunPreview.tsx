import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NarrativeCheckpoint } from "./types";

type RunPreviewProps = {
  runTitle: string;
  oneSentenceStory: string;
  checkpoints: NarrativeCheckpoint[];
};

export function RunPreview({ runTitle, oneSentenceStory, checkpoints }: RunPreviewProps) {
  const [index, setIndex] = useState(0);
  const current = checkpoints[index];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Run preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="font-semibold">{runTitle || "Untitled Beacon Run"}</p>
          <p className="text-sm text-muted-foreground">{oneSentenceStory || "Add a one-sentence story to frame this run."}</p>
        </div>

        {current ? (
          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Participant checkpoint {index + 1} of {checkpoints.length}
            </p>
            <p className="text-lg font-medium capitalize">{current.verb}</p>
            <p className="font-medium">{current.title || "Untitled checkpoint"}</p>
            <p className="text-sm text-muted-foreground">{current.notes || "No notes written for this checkpoint yet."}</p>
            <p className="text-xs text-muted-foreground">Challenge: {current.challengeType.replace("_", " ")}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0}>
                Previous
              </Button>
              <Button onClick={() => setIndex((value) => Math.min(checkpoints.length - 1, value + 1))} disabled={index >= checkpoints.length - 1}>
                Next
              </Button>
            </div>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Add checkpoints to preview this run from a participant perspective.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
