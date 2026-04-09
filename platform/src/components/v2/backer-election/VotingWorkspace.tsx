import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AsYouWishConfirmation } from "@/components/v2/dispatch/AsYouWishConfirmation";

type VoteChoice = "support" | "hold" | "oppose";

type VotingWorkspaceProps = {
  disabled?: boolean;
  onSubmit: (choice: VoteChoice) => Promise<void> | void;
};

export function VotingWorkspace({ disabled = false, onSubmit }: VotingWorkspaceProps) {
  const [choice, setChoice] = useState<VoteChoice>("support");
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Card id="voting-workspace">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Voting workspace</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={choice} onValueChange={(value) => setChoice(value as VoteChoice)}>
          <div className="flex items-center gap-2">
            <RadioGroupItem id="vote-support" value="support" />
            <Label htmlFor="vote-support">Support</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem id="vote-hold" value="hold" />
            <Label htmlFor="vote-hold">Hold for revision</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem id="vote-oppose" value="oppose" />
            <Label htmlFor="vote-oppose">Oppose</Label>
          </div>
        </RadioGroup>
        <Button onClick={() => setConfirmOpen(true)} disabled={disabled}>
          Cast vote
        </Button>
      </CardContent>
      <AsYouWishConfirmation
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={async () => {
          await onSubmit(choice);
        }}
      />
    </Card>
  );
}
