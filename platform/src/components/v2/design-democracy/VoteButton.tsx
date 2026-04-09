import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type VoteButtonProps = {
  maxCredits: number;
  onVote: (credits: number) => Promise<void> | void;
};

export function VoteButton({ maxCredits, onVote }: VoteButtonProps) {
  const [open, setOpen] = useState(false);
  const [credits, setCredits] = useState(1);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Vote with Credits
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cast Credits-weighted vote</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="vote-credits">Credits to apply</Label>
            <Input
              id="vote-credits"
              type="number"
              min={1}
              max={Math.max(1, Math.floor(maxCredits))}
              value={credits}
              onChange={(event) => setCredits(Math.max(1, Number(event.target.value || 1)))}
            />
            <p className="text-xs text-muted-foreground">Available Credits for voting: {Math.floor(maxCredits)}</p>
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                await onVote(Math.max(1, Math.min(Math.floor(maxCredits), Math.floor(credits))));
                setOpen(false);
              }}
              disabled={maxCredits < 1}
            >
              Confirm vote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
