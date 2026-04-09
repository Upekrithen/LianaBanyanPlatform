import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NarrativeCheckpoint as Checkpoint, NarrativeVerb, BeaconOption } from "./types";
import { NarrativeCheckpoint } from "./NarrativeCheckpoint";

type MapDesignerProps = {
  checkpoints: Checkpoint[];
  beaconOptions: BeaconOption[];
  onAddCheckpoint: (verb: NarrativeVerb) => void;
  onUpdateCheckpoint: (id: string, patch: Partial<Checkpoint>) => void;
  onMoveCheckpoint: (id: string, direction: "up" | "down") => void;
  onRemoveCheckpoint: (id: string) => void;
};

export function MapDesigner({
  checkpoints,
  beaconOptions,
  onAddCheckpoint,
  onUpdateCheckpoint,
  onMoveCheckpoint,
  onRemoveCheckpoint,
}: MapDesignerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Map designer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Build your run as narrative checkpoints. Labels always use verbs, never coordinate IDs.
        </p>

        <div className="grid gap-2 md:grid-cols-4">
          {(["discover", "debate", "decide", "meet", "make", "move", "reflect", "reroute"] as NarrativeVerb[]).map((verb) => (
            <Button key={verb} variant="outline" className="capitalize" onClick={() => onAddCheckpoint(verb)}>
              Add {verb}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          {checkpoints.map((checkpoint, index) => (
            <NarrativeCheckpoint
              key={checkpoint.id}
              checkpoint={checkpoint}
              beaconOptions={beaconOptions}
              onChange={(patch) => onUpdateCheckpoint(checkpoint.id, patch)}
              onMove={(direction) => onMoveCheckpoint(checkpoint.id, direction)}
              onRemove={() => onRemoveCheckpoint(checkpoint.id)}
              canMoveUp={index > 0}
              canMoveDown={index < checkpoints.length - 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
