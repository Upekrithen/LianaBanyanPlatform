/**
 * CHAIN VOTING PAGE
 * =================
 * Governance stacking bonus system. Consecutive participation builds a bonus
 * from 0% to 100%. Miss a vote → reset to 20% floor (rewards returning).
 * Combined with Pledged Mark Voting for commitment-weighted influence.
 * "As You Wish" confirmation for vote casting.
 */

import { useState } from "react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Link2, Vote, Clock, TrendingUp, Users, AlertTriangle,
  CheckCircle2, XCircle, ChevronRight, Zap, Shield,
  BarChart3, Coins, ThumbsUp, ThumbsDown,
} from "lucide-react";
import { toast } from "sonner";

import {
  type Proposal,
  type VoteDirection,
  CHAIN_BONUS_SCHEDULE,
  CHAIN_RESET_FLOOR,
  getChainBonus,
  calculateVoteWeight,
  CATEGORY_COLORS,
  SAMPLE_CHAIN_STATUS,
  SAMPLE_PROPOSALS,
  SAMPLE_VOTE_HISTORY,
  SAMPLE_GOVERNANCE_STATS,
} from "@/lib/chainVotingService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeUntil(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h remaining`;
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m remaining`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Chain Link Visualization ─────────────────────────────────────────────────

function ChainLinksVisual({ chainLength }: { chainLength: number }) {
  return (
    <div className="flex items-center gap-1 flex-wrap py-4">
      {CHAIN_BONUS_SCHEDULE.map((step) => {
        const isActive = chainLength >= step.vote;
        const isCurrent = chainLength === step.vote;
        return (
          <div key={step.vote} className="flex items-center">
            <div
              className={`
                relative flex flex-col items-center transition-all duration-300
                ${isCurrent ? "scale-110" : ""}
              `}
            >
              {/* Chain link shape */}
              <div
                className={`
                  w-10 h-14 rounded-full border-[3px] flex items-center justify-center
                  transition-all duration-500
                  ${isActive
                    ? "border-primary bg-primary/15 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                    : "border-border bg-muted"
                  }
                  ${isCurrent ? "ring-2 ring-amber-400/50 ring-offset-2 ring-offset-background" : ""}
                `}
              >
                <span className={`text-xs font-bold ${isActive ? "text-primary" : "text-muted-foreground/70"}`}>
                  {step.bonus}%
                </span>
              </div>
              <span className={`text-[10px] mt-1 ${isActive ? "text-muted-foreground" : "text-muted-foreground/70"}`}>
                #{step.vote}
              </span>
            </div>
            {/* Connecting bar between links */}
            {step.vote < 10 && (
              <div
                className={`w-3 h-1 rounded-full mx-0.5 ${
                  chainLength > step.vote ? "bg-amber-400/60" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Vote Dialog ──────────────────────────────────────────────────────────────

function VoteDialog({
  proposal,
  chainLength,
  open,
  onOpenChange,
}: {
  proposal: Proposal;
  chainLength: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [direction, setDirection] = useState<VoteDirection | null>(null);
  const [marksPledged, setMarksPledged] = useState("");
  const [confirming, setConfirming] = useState(false);

  const pledgeAmount = parseInt(marksPledged) || 0;
  const weight = calculateVoteWeight(chainLength + 1, pledgeAmount);

  const handleCast = () => {
    if (!direction) {
      toast.error("Choose For or Against before casting.");
      return;
    }
    setConfirming(false);
    onOpenChange(false);
    toast.success(`Vote cast: ${direction === "for" ? "For" : "Against"} "${proposal.title}" with ${weight.effectiveVotes.toFixed(1)} effective votes. As You Wish.`);
    setDirection(null);
    setMarksPledged("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Cast Your Vote</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {proposal.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Direction */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Your Position</Label>
            <div className="flex gap-3">
              <Button
                variant={direction === "for" ? "default" : "outline"}
                className={direction === "for" ? "bg-emerald-600 hover:bg-emerald-700" : "border-border text-muted-foreground"}
                onClick={() => setDirection("for")}
              >
                <ThumbsUp className="w-4 h-4 mr-2" /> For
              </Button>
              <Button
                variant={direction === "against" ? "default" : "outline"}
                className={direction === "against" ? "bg-red-600 hover:bg-red-700" : "border-border text-muted-foreground"}
                onClick={() => setDirection("against")}
              >
                <ThumbsDown className="w-4 h-4 mr-2" /> Against
              </Button>
            </div>
          </div>

          {/* Pledged Marks */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Pledge Marks (Optional)</Label>
            <p className="text-xs text-muted-foreground/70">
              Pledged Marks are escrowed until the proposal resolves. Released on success, absorbed on failure.
            </p>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={marksPledged}
              onChange={(e) => setMarksPledged(e.target.value)}
              className="bg-card border-border text-foreground"
            />
          </div>

          {/* Weight Preview */}
          <div className="p-3 bg-card rounded-lg border border-border">
            <div className="text-sm text-muted-foreground">Your Vote Weight</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-primary">
                {weight.effectiveVotes.toFixed(1)}
              </span>
              <span className="text-muted-foreground/70 text-sm">
                effective votes ({weight.bonusPercent}% chain bonus)
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          {!confirming ? (
            <Button
              onClick={() => setConfirming(true)}
              disabled={!direction}
              className="bg-primary hover:bg-primary/90 text-foreground"
            >
              Cast Vote
            </Button>
          ) : (
            <div className="flex items-center gap-3 w-full">
              <span className="text-sm text-muted-foreground italic">Confirm:</span>
              <Button onClick={handleCast} className="bg-emerald-600 hover:bg-emerald-700 text-foreground">
                As You Wish
              </Button>
              <Button variant="ghost" onClick={() => setConfirming(false)} className="text-muted-foreground">
                Cancel
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Proposal Card ────────────────────────────────────────────────────────────

function ProposalCard({
  proposal,
  chainLength,
}: {
  proposal: Proposal;
  chainLength: number;
}) {
  const [voteOpen, setVoteOpen] = useState(false);
  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  const forPercent = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 50;
  const nextBonus = getChainBonus(chainLength + 1);
  const weight = calculateVoteWeight(chainLength + 1, 0);

  return (
    <>
      <Card className="bg-card border-border hover:border-border transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base text-foreground leading-snug">{proposal.title}</CardTitle>
              <CardDescription className="text-muted-foreground mt-1 line-clamp-2">
                {proposal.description}
              </CardDescription>
            </div>
            <Badge className={`shrink-0 ${CATEGORY_COLORS[proposal.category]}`}>
              {proposal.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Deadline */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{timeUntil(proposal.deadline)}</span>
          </div>

          {/* Vote Tally */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-emerald-400">For: {proposal.votesFor}</span>
              <span className="text-red-400">Against: {proposal.votesAgainst}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${forPercent}%` }}
              />
              <div
                className="h-full bg-red-500 transition-all"
                style={{ width: `${100 - forPercent}%` }}
              />
            </div>
          </div>

          {/* Marks Pledged */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Coins className="w-4 h-4 text-primary" />
            <span>{proposal.totalMarksPledged.toLocaleString()} Marks pledged</span>
          </div>

          {/* Your Chain Bonus */}
          <div className="p-2 bg-primary/10 rounded border border-primary/20">
            <div className="text-xs text-primary">
              Your vote counts as <span className="font-bold">{weight.effectiveVotes.toFixed(1)} votes</span> ({nextBonus}% chain bonus)
            </div>
          </div>

          <Button
            onClick={() => setVoteOpen(true)}
            className="w-full bg-primary hover:bg-primary/90 text-foreground"
          >
            <Vote className="w-4 h-4 mr-2" /> Cast Vote
          </Button>
        </CardContent>
      </Card>

      <VoteDialog
        proposal={proposal}
        chainLength={chainLength}
        open={voteOpen}
        onOpenChange={setVoteOpen}
      />
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ChainVoting() {
  const chainStatus = SAMPLE_CHAIN_STATUS;
  const proposals = SAMPLE_PROPOSALS;
  const voteHistory = SAMPLE_VOTE_HISTORY;
  const stats = SAMPLE_GOVERNANCE_STATS;

  // Detect chain breaks in history: vote-007 (chain 4) → vote-003 (chain 4) means break between them
  const getChainIndicator = (record: typeof voteHistory[0], index: number) => {
    if (index === voteHistory.length - 1) return "start";
    const nextRecord = voteHistory[index + 1];
    // If current chainNumber is 1 or nextRecord chainNumber >= current, it's a break
    if (record.chainNumber === 1 && nextRecord.chainNumber > 1) return "break";
    if (record.chainNumber <= nextRecord.chainNumber && record.chainNumber === 1) return "break";
    return "linked";
  };

  return (
    <PortalPageLayout maxWidth="xl" xrayId="chain-voting">
        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Link2 className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Chain Voting</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Consistency is power. Every vote in the chain makes the next one stronger.
          </p>
        </div>

        {/* ── Your Chain Status ── */}
        <Card className="bg-card border-amber-500/30 mb-8">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-primary">
              <Zap className="w-5 h-5" />
              Your Chain Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <div className="text-3xl font-bold text-primary">{chainStatus.chainLength}</div>
                <div className="text-sm text-muted-foreground mt-1">Consecutive Votes</div>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <div className="text-3xl font-bold text-emerald-400">{chainStatus.currentBonusPercent}%</div>
                <div className="text-sm text-muted-foreground mt-1">Current Bonus</div>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-400">{chainStatus.longestChain}</div>
                <div className="text-sm text-muted-foreground mt-1">Personal Best</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Chain Bonus Progress</span>
                <span className="text-primary font-medium">{chainStatus.currentBonusPercent}% / 100%</span>
              </div>
              <Progress value={chainStatus.currentBonusPercent} className="h-3 bg-muted" />
            </div>

            {/* Chain Links Visualization */}
            <div>
              <div className="text-sm text-muted-foreground mb-1">Chain Bonus Schedule</div>
              <ChainLinksVisual chainLength={chainStatus.chainLength} />
            </div>

            {/* Reset Warning */}
            <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-primary">Miss a vote?</div>
                <div className="text-sm text-muted-foreground">
                  Your bonus resets to {CHAIN_RESET_FLOOR}% — not zero. We reward coming back.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Active Proposals + Governance Stats ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Proposals Grid */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Vote className="w-5 h-5 text-muted-foreground" />
              Active Proposals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {proposals.map((p) => (
                <ProposalCard key={p.id} proposal={p} chainLength={chainStatus.chainLength} />
              ))}
            </div>
          </div>

          {/* Governance Stats Sidebar */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
              Governance
            </h2>

            <Card className="bg-card border-border">
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Proposals</span>
                  <span className="font-bold text-foreground">{stats.activeProposals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Your Participation</span>
                  <span className="font-bold text-emerald-400">{stats.participationRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Longest Chain (Coop)</span>
                  <span className="font-bold text-primary">{stats.longestChainInCoop} votes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Chain Length</span>
                  <span className="font-bold text-blue-400">{stats.averageChainLength} votes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Marks Pledged</span>
                  <span className="font-bold text-purple-400">{stats.totalMarksPledgedAll.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Voting History ── */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              Your Voting History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Chain</TableHead>
                    <TableHead className="text-muted-foreground">Proposal</TableHead>
                    <TableHead className="text-muted-foreground">Vote</TableHead>
                    <TableHead className="text-muted-foreground text-right">Bonus</TableHead>
                    <TableHead className="text-muted-foreground text-right">Pledged</TableHead>
                    <TableHead className="text-muted-foreground">Outcome</TableHead>
                    <TableHead className="text-muted-foreground text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voteHistory.map((record, idx) => {
                    const indicator = getChainIndicator(record, idx);
                    return (
                      <TableRow key={record.id} className="border-border/50">
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {indicator === "break" ? (
                              <div className="w-5 h-5 rounded-full border-2 border-red-500/60 bg-red-500/10 flex items-center justify-center">
                                <XCircle className="w-3 h-3 text-red-400" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-primary/60 bg-primary/10 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-primary">{record.chainNumber}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                          {record.proposalTitle}
                        </TableCell>
                        <TableCell>
                          {record.direction === "for" ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">For</Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Against</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-primary font-medium">
                          +{record.bonusApplied}%
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {record.marksPledged > 0 ? `${record.marksPledged} M` : "—"}
                        </TableCell>
                        <TableCell>
                          {record.outcome === "passed" && (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Passed</Badge>
                          )}
                          {record.outcome === "failed" && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Failed</Badge>
                          )}
                          {record.outcome === "active" && (
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground/70 text-sm">
                          {formatDate(record.votedAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* ── How Chain Voting Works ── */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-muted-foreground" />
              How Chain Voting Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="the-chain" className="border-border">
                <AccordionTrigger className="text-foreground hover:text-foreground hover:no-underline">
                  <span className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-primary" />
                    The Chain
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Every time you vote on a proposal, your chain grows by one link. Each link increases
                  your voting bonus: Vote 1 starts at 0%, Vote 2 earns 10%, and it climbs steadily until
                  Vote 10 where you reach the maximum 100% bonus. At full chain, every vote you cast
                  counts double. The chain rewards those who show up consistently.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="the-reset" className="border-border">
                <AccordionTrigger className="text-foreground hover:text-foreground hover:no-underline">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-primary" />
                    The Reset
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Miss a vote and your bonus drops — but not to zero. The floor is {CHAIN_RESET_FLOOR}%.
                  This is not punitive. It is a welcome-back bonus. Life happens. The cooperative recognizes
                  that returning is itself an act of commitment. You rebuild from {CHAIN_RESET_FLOOR}%, not from nothing.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="pledged-marks" className="border-border">
                <AccordionTrigger className="text-foreground hover:text-foreground hover:no-underline">
                  <span className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-primary" />
                    Pledged Mark Voting
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  When you vote, you can optionally pledge your own Marks. Pledged Marks are escrowed — locked
                  into the proposal until it resolves. If the proposal passes, your Marks are released back to you.
                  If it fails, the Marks are absorbed by the cooperative. This is skin in the game. It means your
                  vote carries the weight of your personal commitment, not just your opinion.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="why-chain" className="border-border">
                <AccordionTrigger className="text-foreground hover:text-foreground hover:no-underline">
                  <span className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-primary" />
                    Why Chain?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Consistent participation means informed participation. A member who votes on every proposal
                  has context that a drive-by voter does not. They have read the discussions, understood the
                  tradeoffs, and earned the right to greater influence through demonstrated engagement.
                  Drive-by voting is cheap. Sustained civic participation is earned.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="combined-power" className="border-border">
                <AccordionTrigger className="text-foreground hover:text-foreground hover:no-underline">
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Combined Power
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Your total influence on any proposal combines two factors: your Chain Bonus multiplied by
                  your Pledged Marks. A member with a 10-vote chain (100% bonus) who pledges 10 Marks has
                  an effective vote weight of (1 + 10) x 2.0 = 22 votes. Compare that to a first-time voter
                  with no pledge: 1 x 1.0 = 1 vote. The system rewards both consistency and commitment.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
    </PortalPageLayout>
  );
}
