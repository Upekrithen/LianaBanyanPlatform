import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RunRewards } from "./types";

type RewardsConfigProps = {
  rewards: RunRewards;
  onChange: (next: RunRewards) => void;
};

export function RewardsConfig({ rewards, onChange }: RewardsConfigProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rewards config</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Marks</label>
          <Input
            type="number"
            min={0}
            value={rewards.marks}
            onChange={(event) => onChange({ ...rewards, marks: Number(event.target.value || 0) })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Joules</label>
          <Input
            type="number"
            min={0}
            value={rewards.joules}
            onChange={(event) => onChange({ ...rewards, joules: Number(event.target.value || 0) })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Badge label</label>
          <Input
            value={rewards.badge}
            onChange={(event) => onChange({ ...rewards, badge: event.target.value })}
            placeholder="Beacon Run Completer"
          />
        </div>
      </CardContent>
    </Card>
  );
}
