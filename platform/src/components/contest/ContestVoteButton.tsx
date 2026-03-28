import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThumbsUp, Coins, Loader2, Check } from "lucide-react";
import { useVoteEntry } from "@/hooks/useContests";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  contestId: string;
  entryId: string;
  hasVoted: boolean;
  votingOpen: boolean;
}

export function ContestVoteButton({ contestId, entryId, hasVoted, votingOpen }: Props) {
  const { user } = useAuth();
  const vote = useVoteEntry();
  const [pledgeOpen, setPledgeOpen] = useState(false);
  const [pledgeAmount, setPledgeAmount] = useState("");

  if (!votingOpen) return null;

  const handleWant = async () => {
    if (!user) {
      toast.error("Sign in to vote");
      return;
    }
    try {
      await vote.mutateAsync({ contestId, entryId, voteType: "want" });
      toast.success("Vote recorded!");
    } catch (e: any) {
      toast.error(e.message || "Failed to vote");
    }
  };

  const handlePledge = async () => {
    const amount = parseInt(pledgeAmount, 10);
    if (!amount || amount < 1) {
      toast.error("Enter at least 1 credit");
      return;
    }
    try {
      await vote.mutateAsync({
        contestId,
        entryId,
        voteType: "pledge",
        creditsPledged: amount,
      });
      toast.success(`Pledged ${amount} credits!`);
      setPledgeOpen(false);
      setPledgeAmount("");
    } catch (e: any) {
      toast.error(e.message || "Failed to pledge");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={hasVoted ? "default" : "outline"}
        onClick={handleWant}
        disabled={vote.isPending || hasVoted}
        className="gap-1.5"
      >
        {vote.isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : hasVoted ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <ThumbsUp className="h-3.5 w-3.5" />
        )}
        {hasVoted ? "Voted" : "I Want This"}
      </Button>

      <Popover open={pledgeOpen} onOpenChange={setPledgeOpen}>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline" className="gap-1.5" disabled={!user}>
            <Coins className="h-3.5 w-3.5" />
            Pledge
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 space-y-3">
          <p className="text-xs text-muted-foreground">
            Pledge credits to back this design. If it wins and enters production, your pledge reserves your spot.
          </p>
          <Input
            type="number"
            min={1}
            placeholder="Credits"
            value={pledgeAmount}
            onChange={(e) => setPledgeAmount(e.target.value)}
          />
          <Button size="sm" className="w-full" onClick={handlePledge} disabled={vote.isPending}>
            {vote.isPending ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            ) : null}
            Confirm Pledge
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
