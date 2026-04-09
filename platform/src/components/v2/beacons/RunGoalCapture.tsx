import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type RunGoalCaptureProps = {
  runGoal: string;
  oneSentenceStory: string;
  onRunGoalChange: (value: string) => void;
  onStoryChange: (value: string) => void;
  fullScreenMobile?: boolean;
};

export function RunGoalCapture({
  runGoal,
  oneSentenceStory,
  onRunGoalChange,
  onStoryChange,
  fullScreenMobile = false,
}: RunGoalCaptureProps) {
  return (
    <Card className={fullScreenMobile ? "min-h-[72vh]" : undefined}>
      <CardHeader>
        <CardTitle>Step 1: What is this run for?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Run goal</label>
          <Input
            value={runGoal}
            onChange={(event) => onRunGoalChange(event.target.value)}
            placeholder="Example: Help new members understand the Beacon system in one walk."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">One-sentence story</label>
          <Textarea
            value={oneSentenceStory}
            onChange={(event) => onStoryChange(event.target.value)}
            placeholder="Example: We discover a signal, debate options, decide our route, and meet the final beacon with a shared takeaway."
            rows={4}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Story-first: once goal and story are written, the rest of the builder unlocks.
        </p>
      </CardContent>
    </Card>
  );
}
