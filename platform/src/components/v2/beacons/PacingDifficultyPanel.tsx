import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DifficultyTier } from "./types";

type PacingDifficultyPanelProps = {
  beatCount: number;
  difficulty: DifficultyTier;
  estimatedDuration: number;
  onBeatCountChange: (value: number) => void;
  onDifficultyChange: (value: DifficultyTier) => void;
  onEstimatedDurationChange: (value: number) => void;
};

export function PacingDifficultyPanel({
  beatCount,
  difficulty,
  estimatedDuration,
  onBeatCountChange,
  onDifficultyChange,
  onEstimatedDurationChange,
}: PacingDifficultyPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pacing and difficulty</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Beat count</label>
          <input
            type="number"
            min={1}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={beatCount}
            onChange={(event) => onBeatCountChange(Number(event.target.value || 1))}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Difficulty tier</label>
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={difficulty}
            onChange={(event) => onDifficultyChange(event.target.value as DifficultyTier)}
          >
            <option value="gentle">Gentle</option>
            <option value="steady">Steady</option>
            <option value="bold">Bold</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Estimated duration (minutes)</label>
          <input
            type="number"
            min={5}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={estimatedDuration}
            onChange={(event) => onEstimatedDurationChange(Number(event.target.value || 5))}
          />
        </div>
      </CardContent>
    </Card>
  );
}
