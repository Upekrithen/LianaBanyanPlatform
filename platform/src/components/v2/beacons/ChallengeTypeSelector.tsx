import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ChallengeType, NarrativeCheckpoint } from "./types";

type ChallengeTypeSelectorProps = {
  checkpoints: NarrativeCheckpoint[];
  onChangeType: (checkpointId: string, type: ChallengeType) => void;
};

const CHALLENGE_TYPES: { type: ChallengeType; label: string; whenToUse: string }[] = [
  { type: "trivia", label: "Trivia", whenToUse: "When you want a quick knowledge check before moving ahead." },
  { type: "artifact_find", label: "Artifact find", whenToUse: "When exploration is the learning moment and participants should notice details." },
  { type: "dialogue_choice", label: "Dialogue choice", whenToUse: "When the checkpoint is about debate, perspective, or a decision branch." },
  { type: "creation_task", label: "Creation task", whenToUse: "When participants should make something to prove understanding." },
  { type: "travel", label: "Travel", whenToUse: "When physical movement or location transition is the main beat." },
];

export function ChallengeTypeSelector({ checkpoints, onChangeType }: ChallengeTypeSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Challenge type selector</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <TooltipProvider>
          {checkpoints.map((checkpoint) => (
            <div key={checkpoint.id} className="space-y-2 rounded-lg border p-3">
              <p className="font-medium capitalize">{checkpoint.verb}: {checkpoint.title || "Untitled checkpoint"}</p>
              <div className="flex flex-wrap gap-2">
                {CHALLENGE_TYPES.map((item) => (
                  <Tooltip key={item.type}>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant={checkpoint.challengeType === item.type ? "default" : "outline"}
                        size="sm"
                        onClick={() => onChangeType(checkpoint.id, item.type)}
                      >
                        {item.label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        <span className="font-semibold">When to use this:</span> {item.whenToUse}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}
        </TooltipProvider>
        {checkpoints.length === 0 ? (
          <p className="text-sm text-muted-foreground">Add checkpoints first to set challenge types.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
