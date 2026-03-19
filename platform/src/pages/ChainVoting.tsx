/**
 * CHAIN VOTING PAGE
 * =================
 * Governance stacking bonus system. Consecutive participation builds a bonus
 * from 0% to 100%. Miss a vote → reset to 20% floor (rewards returning).
 * Combined with Pledged Mark Voting for commitment-weighted influence.
 * "As You Wish" confirmation for vote casting.
 */

import { useState } from "react";
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
                    ? "border-amber-400 bg-amber-500/15 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                    : "border-slate-700 bg-slate-800/50"
                  }
                  ${isCurrent ? "ring-2 ring-amber-400/50 ring-offset-2 ring-offset-slate-950" : ""}
                `}
              >
                <span className={`text-xs font-bold ${isActive ? "text-amber-400" : "text-slate-600"}`}>
                  {step.bonus}%
                </span>
              </div>
              <span className={`text-[10px] mt-1 ${isActive ? "text-slate-300" : "text-slate-600"}`}>
                #{step.vote}
              </span>
            </div>
            {/* Connecting bar between links */}
            {step.vote < 10 && (
              <div
                className={`w-3 h-1 rounded-full mx-0.5 ${
                  chainLength > step.vote ? "bg-amber-400/60" : "bg-slate-700"
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
      <DialogContent className="sm:max-w-lg bg-slate-950 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">Cast Your Vote</DialogTitle>
          <DialogDescription className="text-slate-400">
            {proposal.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Direction */}
          <div className="space-y-2">
            <Label className="text-slate-300">Your Position</Label>
            <div className="flex gap-3">
              <Button
                variant={direction === "for" ? "default" : "outline"}
                className={direction === "for" ? "bg-emerald-600 hover:bg-emerald-700" : "border-slate-700 text-slate-400"}
                onClick={() => setDirection("for")}
              >
                <ThumbsUp className="w-4 h-4 mr-2" /> For
              </Button>
              <Button
                variant={direction === "against" ? "default" : "outline"}
                className={direction === "against" ? "bg-red-600 hover:bg-red-700" : "border-slate-700 text-slate-400"}
                onClick={() => setDirection("against")}
              >
                <ThumbsDown className="w-4 h-4 mr-2" /> Against
              </Button>
            </div>
          </div>

          {/* Pledged Marks */}
          <div className="space-y-2">
            <Label className="text-slate-300">Pledge Marks (Optional)</Label>
            <p className="text-xs text-slate-500">
              Pledged Marks are escrowed until the proposal resolves. Released on success, absorbed on failure.
            </p>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={marksPledged}
              onChange={(e) => setMarksPledged(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          {/* Weight Preview */}
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <div className="text-sm text-slate-400">Your Vote Weight</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-amber-400">
                {weight.effectiveVotes.toFixed(1)}
              </span>
              <span className="text-slate-500 text-sm">
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
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Cast Vote
            </Button>
          ) : (
            <div className="flex items-center gap-3 w-full">
              <span className="text-sm text-slate-400 italic">Confirm:</span>
              <Button onClick={handleCast} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                As You Wish
              </Button>
              <Button variant="ghost" onClick={() => setConfirming(false)} className="text-slate-400">
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
      <Card className="bg-slate-900/60 border-slate-800 hover:border-slate-700 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base text-white leading-snug">{proposal.title}</CardTitle>
              <CardDescription className="text-slate-400 mt-1 line-clamp-2">
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
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock className="w-4 h-4" />
            <span>{timeUntil(proposal.deadline)}</span>
          </div>

          {/* Vote Tally */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-emerald-400">For: {proposal.votesFor}</span>
              <span className="text-red-400">Against: {proposal.votesAgainst}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden flex">
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
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{proposal.totalMarksPledged.toLocaleString()} Marks pledged</span>
          </div>

          {/* Your Chain Bonus */}
          <div className="p-2 bg-amber-500/10 rounded border border-amber-500/20">
            <div className="text-xs text-amber-400">
              Your vote counts as <span className="font-bold">{weight.effectiveVotes.toFixed(1)} votes</span> ({nextBonus}% chain bonus)
            </div>
          </div>

          <Button
            onClick={() => setVoteOpen(true)}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Link2 className="w-6 h-6 text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold">Chain Voting</h1>
          </div>
          <p className="text-slate-400 text-lg">
            Consistency is power. Every vote in the chain makes the next one stronger.
          </p>
        </div>

        {/* ── Your Chain Status ── */}
        <Card className="bg-slate-900/80 border-amber-500/30 mb-8">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-amber-400">
              <Zap className="w-5 h-5" />
              Your Chain Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-800/60 rounded-lg text-center">
                <div className="text-3xl font-bold text-amber-400">{chainStatus.chainLength}</div>
                <div className="text-sm text-slate-400 mt-1">Consecutive Votes</div>
              </div>
              <div className="p-4 bg-slate-800/60 rounded-lg text-center">
                <div className="text-3xl font-bold text-emerald-400">{chainStatus.currentBonusPercent}%</div>
                <div className="text-sm text-slate-400 mt-1">Current Bonus</div>
              </div>
              <div className="p-4 bg-slate-800/60 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-400">{chainStatus.longestChain}</div>
                <div className="text-sm text-slate-400 mt-1">Personal Best</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Chain Bonus Progress</span>
                <span className="text-amber-400 font-medium">{chainStatus.currentBonusPercent}% / 100%</span>
              </div>
              <Progress value={chainStatus.currentBonusPercent} className="h-3 bg-slate-800" />
            </div>

            {/* Chain Links Visualization */}
            <div>
              <div className="text-sm text-slate-400 mb-1">Chain Bonus Schedule</div>
              <ChainLinksVisual chainLength={chainStatus.chainLength} />
            </div>

            {/* Reset Warning */}
            <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-amber-400">Miss a vote?</div>
                <div className="text-sm text-slate-400">
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
              <Vote className="w-5 h-5 text-slate-400" />
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
              <BarChart3 className="w-5 h-5 text-slate-400" />
              Governance
            </h2>

            <Card className="bg-slate-900/60 border-slate-800">
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Active Proposals</span>
                  <span className="font-bold text-white">{stats.activeProposals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Your Participation</span>
                  <span className="font-bold text-emerald-400">{stats.participationRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Longest Chain (Coop)</span>
                  <span className="font-bold text-amber-400">{stats.longestChainInCoop} votes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Avg Chain Length</span>
                  <span className="font-bold text-blue-400">{stats.averageChainLength} votes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Total Marks Pledged</span>
                  <span className="font-bold text-purple-400">{stats.totalMarksPledgedAll.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Voting History ── */}
        <Card className="bg-slate-900/60 border-slate-800 mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-slate-400" />
              Your Voting History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Chain</TableHead>
                    <TableHead className="text-slate-400">Proposal</TableHead>
                    <TableHead className="text-slate-400">Vote</TableHead>
                    <TableHead className="text-slate-400 text-right">Bonus</TableHead>
                    <TableHead className="text-slate-400 text-right">Pledged</TableHead>
                    <TableHead className="text-slate-400">Outcome</TableHead>
                    <TableHead className="text-slate-400 text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voteHistory.map((record, idx) => {
                    const indicator = getChainIndicator(record, idx);
                    return (
                      <TableRow key={record.id} className="border-slate-800/50">
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {indicator === "break" ? (
                              <div className="w-5 h-5 rounded-full border-2 border-red-500/60 bg-red-500/10 flex items-center justify-center">
                                <XCircle className="w-3 h-3 text-red-400" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-amber-400/60 bg-amber-500/10 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-amber-400">{record.chainNumber}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300 max-w-[200px] truncate">
                          {record.proposalTitle}
                        </TableCell>
                        <TableCell>
                          {record.direction === "for" ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">For</Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Against</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-amber-400 font-medium">
                          +{record.bonusApplied}%
                        </TableCell>
                        <TableCell className="text-right text-slate-300">
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
                        <TableCell className="text-right text-slate-500 text-sm">
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
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-400" />
              How Chain Voting Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="the-chain" className="border-slate-800">
                <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                  <span className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-amber-400" />
                    The Chain
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-slate-400">
                  Every time you vote on a proposal, your chain grows by one link. Each link increases
                  your voting bonus: Vote 1 starts at 0%, Vote 2 earns 10%, and it climbs steadily until
                  Vote 10 where you reach the maximum 100% bonus. At full chain, every vote you cast
                  counts double. The chain rewards those who show up consistently.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="the-reset" className="border-slate-800">
                <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    The Reset
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-slate-400">
                  Miss a vote and your bonus drops — but not to zero. The floor is {CHAIN_RESET_FLOOR}%.
                  This is not punitive. It is a welcome-back bonus. Life happens. The cooperative recognizes
                  that returning is itself an act of commitment. You rebuild from {CHAIN_RESET_FLOOR}%, not from nothing.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="pledged-marks" className="border-slate-800">
                <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                  <span className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-400" />
                    Pledged Mark Voting
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-slate-400">
                  When you vote, you can optionally pledge your own Marks. Pledged Marks are escrowed — locked
                  into the proposal until it resolves. If the proposal passes, your Marks are released back to you.
                  If it fails, the Marks are absorbed by the cooperative. This is skin in the game. It means your
                  vote carries the weight of your personal commitment, not just your opinion.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="why-chain" className="border-slate-800">
                <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                  <span className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                    Why Chain?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-slate-400">
                  Consistent participation means informed participation. A member who votes on every proposal
                  has context that a drive-by voter does not. They have read the discussions, understood the
                  tradeoffs, and earned the right to greater influence through demonstrated engagement.
                  Drive-by voting is cheap. Sustained civic participation is earned.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="combined-power" className="border-slate-800">
                <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Combined Power
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-slate-400">
                  Your total influence on any proposal combines two factors: your Chain Bonus multiplied by
                  your Pledged Marks. A member with a 10-vote chain (100% bonus) who pledges 10 Marks has
                  an effective vote weight of (1 + 10) x 2.0 = 22 votes. Compare that to a first-time voter
                  with no pledge: 1 x 1.0 = 1 vote. The system rewards both consistency and commitment.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
