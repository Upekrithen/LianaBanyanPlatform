import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DifficultyTier, RewardConfig } from "./types";

type DifficultyRewardConfigProps = {
  difficulty: DifficultyTier;
  rewards: RewardConfig;
  onDifficultyChange: (difficulty: DifficultyTier) => void;
  onRewardsChange: (next: RewardConfig) => void;
};

export function DifficultyRewardConfig({
  difficulty,
  rewards,
  onDifficultyChange,
  onRewardsChange,
}: DifficultyRewardConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Difficulty and rewards</h2>
        <p className="text-sm text-muted-foreground">
          Configure challenge level and completion rewards for this map.
        </p>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty tier</label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={difficulty}
              onChange={(event) => onDifficultyChange(event.target.value as DifficultyTier)}
            >
              <option value="starter">Starter</option>
              <option value="guided">Guided</option>
              <option value="challenging">Challenging</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Cephas badge label</label>
            <Input
              value={rewards.badge}
              onChange={(event) => onRewardsChange({ ...rewards, badge: event.target.value })}
              placeholder="Example: Cephas Path Completer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Marks reward</label>
            <Input
              type="number"
              min={0}
              value={rewards.marks}
              onChange={(event) => onRewardsChange({ ...rewards, marks: Number(event.target.value || 0) })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Joules reward (optional)</label>
            <Input
              type="number"
              min={0}
              value={rewards.joules}
              onChange={(event) => onRewardsChange({ ...rewards, joules: Number(event.target.value || 0) })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
