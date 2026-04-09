import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SequenceNode } from "./types";

type FullPreviewModeProps = {
  mapTitle: string;
  nodes: SequenceNode[];
};

export function FullPreviewMode({ mapTitle, nodes }: FullPreviewModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = nodes[currentIndex];
  const progressLabel = useMemo(() => {
    if (nodes.length === 0) return "0 / 0";
    return `${currentIndex + 1} / ${nodes.length}`;
  }, [currentIndex, nodes.length]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Full preview mode</h2>
        <p className="text-sm text-muted-foreground">
          Walk through the full learner experience before publishing.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">{mapTitle || "Untitled map preview"}</CardTitle>
            <Badge variant="outline">{progressLabel}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {current ? (
            <>
              <div className="space-y-1">
                <p className="font-medium">{current.title}</p>
                <p className="text-sm text-muted-foreground">{current.category} · {current.slug}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium">Quiz prompt</p>
                <p className="mt-1 text-sm text-muted-foreground">{current.prompt || "No prompt written yet."}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Question type: {current.questionType.replace("_", " ")}
                </p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
                  disabled={currentIndex === 0}
                >
                  Previous node
                </Button>
                <Button
                  onClick={() => setCurrentIndex((idx) => Math.min(nodes.length - 1, idx + 1))}
                  disabled={currentIndex >= nodes.length - 1}
                >
                  Next node
                </Button>
              </div>
            </>
          ) : (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Add nodes to run an end-to-end learner walkthrough.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
