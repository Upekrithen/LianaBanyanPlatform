import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useSpendProposals,
  useCreateProposal,
  useVoteOnProposal,
  useExecuteProposal,
  useMyVote,
  type SpendProposal,
} from "@/hooks/useTreasuryGovernance";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Gavel, Plus, ThumbsUp, ThumbsDown, Clock, CheckCircle2,
  XCircle, Zap, AlertTriangle, Coins,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  proposed: { label: "Proposed", color: "bg-blue-100 text-blue-700", icon: <Clock className="h-3 w-3" /> },
  voting: { label: "Voting", color: "bg-amber-100 text-amber-700", icon: <Gavel className="h-3 w-3" /> },
  approved: { label: "Approved", color: "bg-green-100 text-green-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: <XCircle className="h-3 w-3" /> },
  executed: { label: "Executed", color: "bg-purple-100 text-purple-700", icon: <Zap className="h-3 w-3" /> },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-500", icon: <Clock className="h-3 w-3" /> },
};

interface TreasuryGovernanceProps {
  groupType: "guild" | "tribe";
  groupId: string;
  memberCount: number;
  isLeader: boolean;
  isMember: boolean;
}

export function TreasuryGovernance({
  groupType,
  groupId,
  memberCount,
  isLeader,
  isMember,
}: TreasuryGovernanceProps) {
  const { data: proposals, isLoading } = useSpendProposals(groupType, groupId);
  const treasuryActivated = memberCount >= 25;

  if (!treasuryActivated) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-amber-500" />
          <h3 className="font-semibold mb-1">Treasury Governance Locked</h3>
          <p className="text-sm text-muted-foreground">
            Reach 25 members to activate treasury spending proposals.
            Currently at {memberCount} member{memberCount !== 1 ? "s" : ""}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Gavel className="h-5 w-5" /> Spending Proposals
        </h3>
        {isMember && <CreateProposalDialog groupType={groupType} groupId={groupId} />}
      </div>

      {isLoading && (
        <p className="text-center text-muted-foreground py-8">Loading proposals...</p>
      )}

      {!isLoading && (!proposals || proposals.length === 0) && (
        <Card>
          <CardContent className="py-8 text-center">
            <Coins className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">No spending proposals yet.</p>
            {isMember && (
              <p className="text-xs text-muted-foreground mt-1">
                Create the first proposal to put treasury funds to work.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {proposals && proposals.length > 0 && (
        <div className="space-y-3">
          {proposals.map((p) => (
            <ProposalCard
              key={p.id}
              proposal={p}
              groupType={groupType}
              groupId={groupId}
              isLeader={isLeader}
              isMember={isMember}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CreateProposalDialog({
  groupType,
  groupId,
}: {
  groupType: "guild" | "tribe";
  groupId: string;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const createProposal = useCreateProposal();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) {
      toast({ title: "Invalid input", description: "Title and positive amount required.", variant: "destructive" });
      return;
    }
    try {
      await createProposal.mutateAsync({
        groupType,
        groupId,
        title: title.trim(),
        description: description.trim() || undefined,
        amount: numAmount,
        recipient: recipient.trim() || undefined,
      });
      toast({ title: "Proposal created", description: "72-hour voting window is open." });
      setTitle("");
      setDescription("");
      setAmount("");
      setRecipient("");
      setOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Proposal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Spending Proposal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="prop-title">Title</Label>
            <Input
              id="prop-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What should the treasury fund?"
              required
            />
          </div>
          <div>
            <Label htmlFor="prop-desc">Description</Label>
            <Textarea
              id="prop-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain why this spend benefits the group..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="prop-amount">Amount (credits)</Label>
              <Input
                id="prop-amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                required
              />
            </div>
            <div>
              <Label htmlFor="prop-recipient">Recipient</Label>
              <Input
                id="prop-recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Who receives funds?"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Voting window: 72 hours. Majority of votes wins.
          </p>
          <Button type="submit" className="w-full" disabled={createProposal.isPending}>
            {createProposal.isPending ? "Creating..." : "Submit Proposal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProposalCard({
  proposal,
  groupType,
  groupId,
  isLeader,
  isMember,
}: {
  proposal: SpendProposal;
  groupType: "guild" | "tribe";
  groupId: string;
  isLeader: boolean;
  isMember: boolean;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const voteOnProposal = useVoteOnProposal();
  const executeProposal = useExecuteProposal();
  const { data: myVote } = useMyVote(proposal.id);

  const statusCfg = STATUS_CONFIG[proposal.status] || STATUS_CONFIG.proposed;
  const isActive = proposal.status === "voting" || proposal.status === "proposed";
  const totalVotes = proposal.votes_for + proposal.votes_against;
  const forPct = totalVotes > 0 ? Math.round((proposal.votes_for / totalVotes) * 100) : 0;
  const hasVoted = !!myVote;
  const canExecute = isLeader && proposal.votes_for > proposal.votes_against &&
    (proposal.status === "voting" || proposal.status === "approved");

  const deadlineStr = proposal.vote_deadline
    ? new Date(proposal.vote_deadline).toLocaleString()
    : null;

  const isExpired = proposal.vote_deadline && new Date(proposal.vote_deadline) < new Date();
  const timeLeft = proposal.vote_deadline
    ? getTimeLeft(new Date(proposal.vote_deadline))
    : null;

  async function handleVote(vote: boolean) {
    try {
      await voteOnProposal.mutateAsync({ proposalId: proposal.id, vote, groupType, groupId });
      toast({ title: vote ? "Voted For" : "Voted Against" });
    } catch (err: any) {
      toast({ title: "Vote failed", description: err.message, variant: "destructive" });
    }
  }

  async function handleExecute() {
    try {
      await executeProposal.mutateAsync({ proposalId: proposal.id, groupType, groupId });
      toast({ title: "Proposal executed", description: `${proposal.amount} credits spent.` });
    } catch (err: any) {
      toast({ title: "Execution failed", description: err.message, variant: "destructive" });
    }
  }

  return (
    <Card className={!isActive ? "opacity-75" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold">{proposal.title}</CardTitle>
          <Badge className={`flex-shrink-0 text-xs gap-1 ${statusCfg.color}`}>
            {statusCfg.icon} {statusCfg.label}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2 text-xs">
          <Coins className="h-3 w-3" /> {proposal.amount} credits
          {proposal.recipient && <span>&middot; To: {proposal.recipient}</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {proposal.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{proposal.description}</p>
        )}

        {/* Vote bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="text-green-600">{proposal.votes_for} for</span>
            <span className="text-red-600">{proposal.votes_against} against</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden flex">
            {totalVotes > 0 && (
              <>
                <div
                  className="bg-green-500 h-full transition-all"
                  style={{ width: `${forPct}%` }}
                />
                <div
                  className="bg-red-400 h-full transition-all"
                  style={{ width: `${100 - forPct}%` }}
                />
              </>
            )}
          </div>
        </div>

        {/* Deadline */}
        {isActive && timeLeft && !isExpired && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> {timeLeft} remaining
          </p>
        )}
        {isExpired && isActive && (
          <p className="text-xs text-amber-600 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Voting period ended
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {isActive && isMember && !hasVoted && !isExpired && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 border-green-200 hover:bg-green-50"
                onClick={() => handleVote(true)}
                disabled={voteOnProposal.isPending}
              >
                <ThumbsUp className="h-3 w-3 mr-1" /> For
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => handleVote(false)}
                disabled={voteOnProposal.isPending}
              >
                <ThumbsDown className="h-3 w-3 mr-1" /> Against
              </Button>
            </>
          )}
          {hasVoted && (
            <Badge variant="secondary" className="text-xs">
              You voted {myVote?.vote ? "For" : "Against"}
            </Badge>
          )}
          {canExecute && (
            <Button
              size="sm"
              onClick={handleExecute}
              disabled={executeProposal.isPending}
            >
              <Zap className="h-3 w-3 mr-1" /> Execute
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getTimeLeft(deadline: Date): string {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  if (diff <= 0) return "Expired";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h ${mins}m`;
}
