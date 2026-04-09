import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NarrativeVerb, NARRATIVE_VERBS, NarrativeCheckpoint as Checkpoint, BeaconOption } from "./types";

type NarrativeCheckpointProps = {
  checkpoint: Checkpoint;
  beaconOptions: BeaconOption[];
  onChange: (patch: Partial<Checkpoint>) => void;
  onMove: (direction: "up" | "down") => void;
  onRemove: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

export function NarrativeCheckpoint({
  checkpoint,
  beaconOptions,
  onChange,
  onMove,
  onRemove,
  canMoveUp,
  canMoveDown,
}: NarrativeCheckpointProps) {
  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="grid gap-2 md:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Verb label</label>
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm capitalize"
            value={checkpoint.verb}
            onChange={(event) => onChange({ verb: event.target.value as NarrativeVerb })}
          >
            {NARRATIVE_VERBS.map((verb) => (
              <option key={verb} value={verb}>
                {verb}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Checkpoint title</label>
          <Input
            value={checkpoint.title}
            onChange={(event) => onChange({ title: event.target.value })}
            placeholder="Give this checkpoint a short title"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Attach existing beacon (optional)</label>
        <select
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          value={checkpoint.beaconId ?? ""}
          onChange={(event) => onChange({ beaconId: event.target.value || null })}
        >
          <option value="">No beacon attached yet</option>
          {beaconOptions.map((beacon) => (
            <option key={beacon.id} value={beacon.id}>
              {beacon.name} · {beacon.location_path}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Checkpoint notes</label>
        <Textarea
          value={checkpoint.notes}
          onChange={(event) => onChange({ notes: event.target.value })}
          placeholder="What should participants notice, discuss, or create at this checkpoint?"
          rows={3}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => onMove("up")} disabled={!canMoveUp}>
          Move up
        </Button>
        <Button variant="outline" size="sm" onClick={() => onMove("down")} disabled={!canMoveDown}>
          Move down
        </Button>
        <Button variant="ghost" size="sm" onClick={onRemove}>
          Remove
        </Button>
      </div>
    </div>
  );
}
