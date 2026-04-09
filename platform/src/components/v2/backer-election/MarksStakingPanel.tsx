import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type MarksStakingPanelProps = {
  availableMarks: number;
  stakeMarks: number;
  onStakeMarksChange: (value: number) => void;
  onContinue: () => void;
};

export function MarksStakingPanel({
  availableMarks,
  stakeMarks,
  onStakeMarksChange,
  onContinue,
}: MarksStakingPanelProps) {
  const clampedStake = Math.max(0, Math.min(availableMarks, stakeMarks));
  const voteWeight = clampedStake <= 0 ? 0 : Number((1 + clampedStake / 100).toFixed(2));

  return (
    <Card id="marks-staking-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Marks staking panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">Available Marks: {availableMarks.toLocaleString()}</p>
        <div className="space-y-1.5">
          <Label htmlFor="stake-marks">Stake amount</Label>
          <Input
            id="stake-marks"
            type="number"
            min={0}
            max={availableMarks}
            value={stakeMarks}
            onChange={(event) => onStakeMarksChange(Number(event.target.value || 0))}
          />
        </div>
        <p className="text-sm">Resulting vote weight: <strong>{voteWeight}x</strong></p>
        <Button onClick={onContinue} disabled={clampedStake <= 0}>
          Continue to ballot
        </Button>
      </CardContent>
    </Card>
  );
}
