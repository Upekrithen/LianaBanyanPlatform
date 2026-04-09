import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import {
  HowVotingWorksExplainer,
  MarksStakingPanel,
  MemberProposalSubmissionForm,
  OpenProposalsList,
  ProposalDetailWorkspace,
  type ElectionProposal,
  TurnoutLedger,
  VotingWorkspace,
} from "@/components/v2/backer-election";
import { useTourTarget } from "@/hooks/useTourTarget";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AsYouWishConfirmation } from "@/components/v2/dispatch/AsYouWishConfirmation";

type ChainProposal = {
  id: string;
  title: string;
  category: string;
  status: string;
  deadline: string;
  description: string;
};

type ChainVote = {
  proposal_id: string;
  member_id: string;
  marks_pledged: number;
};

function normalizeProposal(row: ChainProposal, turnoutCount: number, turnoutPct: number): ElectionProposal {
  const normalized = row.status?.toLowerCase() ?? "open";
  const status: ElectionProposal["status"] =
    normalized.includes("review") ? "under_review" : normalized.includes("closed") ? "closed" : "open";

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    status,
    deadlineAt: row.deadline,
    turnoutCount,
    turnoutPct,
    description: row.description,
  };
}

export default function BackerElectionV2Page() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const tourTarget = useTourTarget("backer-election");

  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [stakeMarks, setStakeMarks] = useState(25);
  const [stakeConfirmOpen, setStakeConfirmOpen] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const proposalsQuery = useQuery({
    queryKey: ["backer-election-v2-proposals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chain_voting_proposals")
        .select("id,title,category,status,deadline,description")
        .order("deadline", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ChainProposal[];
    },
  });

  const votesQuery = useQuery({
    queryKey: ["backer-election-v2-votes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chain_voting_votes")
        .select("proposal_id,member_id,marks_pledged");
      if (error) throw error;
      return (data ?? []) as ChainVote[];
    },
  });

  const marksQuery = useQuery({
    queryKey: ["backer-election-v2-marks", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shadow_marks_ledger" as any)
        .select("amount")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []) as Array<{ amount: number }>;
    },
  });

  const stakeMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      if (!user?.id) throw new Error("Sign in required.");
      const safeStake = Math.max(0, Math.round(stakeMarks));
      if (safeStake <= 0) throw new Error("Enter a stake amount.");
      const attempt = await supabase.from("marks_stakes" as any).insert({
        user_id: user.id,
        proposal_id: proposalId,
        stake_amount: safeStake,
        status: "locked",
      });
      if (attempt.error) throw attempt.error;
    },
    onSuccess: () => {
      toast.success("Stake locked. As You Wish.");
      queryClient.invalidateQueries({ queryKey: ["backer-election-v2-votes"] });
      queryClient.invalidateQueries({ queryKey: ["backer-election-v2-proposals"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not lock stake."),
  });

  const voteMutation = useMutation({
    mutationFn: async (direction: "support" | "hold" | "oppose") => {
      if (!user?.id) throw new Error("Sign in required.");
      if (!selectedProposalId) throw new Error("Select a proposal first.");
      const { error } = await supabase.from("chain_voting_votes").insert({
        proposal_id: selectedProposalId,
        member_id: user.id,
        direction,
        marks_pledged: Math.max(0, Math.round(stakeMarks)),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vote cast. As You Wish.");
      queryClient.invalidateQueries({ queryKey: ["backer-election-v2-votes"] });
      queryClient.invalidateQueries({ queryKey: ["backer-election-v2-proposals"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not cast vote."),
  });

  const submitProposalMutation = useMutation({
    mutationFn: async (payload: { title: string; category: string; description: string }) => {
      if (!user?.id) throw new Error("Sign in required.");
      const deadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase.from("chain_voting_proposals").insert({
        title: payload.title,
        category: payload.category,
        description: payload.description,
        status: "open",
        deadline,
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Member measure submitted.");
      queryClient.invalidateQueries({ queryKey: ["backer-election-v2-proposals"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not submit member measure."),
  });

  const turnoutByProposal = useMemo(() => {
    const map = new Map<string, number>();
    for (const vote of votesQuery.data ?? []) {
      map.set(vote.proposal_id, (map.get(vote.proposal_id) ?? 0) + 1);
    }
    return map;
  }, [votesQuery.data]);

  const totalVoters = useMemo(() => {
    const ids = new Set((votesQuery.data ?? []).map((row) => row.member_id));
    return Math.max(ids.size, 1);
  }, [votesQuery.data]);

  const proposals = useMemo(
    () =>
      (proposalsQuery.data ?? []).map((row) =>
        normalizeProposal(
          row,
          turnoutByProposal.get(row.id) ?? 0,
          ((turnoutByProposal.get(row.id) ?? 0) / totalVoters) * 100,
        ),
      ),
    [proposalsQuery.data, turnoutByProposal, totalVoters],
  );

  const openProposals = useMemo(() => proposals.filter((proposal) => proposal.status !== "closed"), [proposals]);
  const selectedProposal = useMemo(
    () => proposals.find((proposal) => proposal.id === selectedProposalId) ?? openProposals[0] ?? null,
    [openProposals, proposals, selectedProposalId],
  );

  const nearestDeadline = useMemo(() => {
    const values = openProposals
      .map((proposal) => proposal.deadlineAt)
      .filter((deadline): deadline is string => Boolean(deadline))
      .map((deadline) => new Date(deadline).getTime())
      .filter((value) => Number.isFinite(value) && value > Date.now())
      .sort((a, b) => a - b);
    if (!values.length) return "No deadline set";
    return new Date(values[0]).toLocaleDateString();
  }, [openProposals]);

  const availableMarks = useMemo(
    () => (marksQuery.data ?? []).reduce((sum, row) => sum + Number(row.amount || 0), 0),
    [marksQuery.data],
  );

  return (
    <AppShell
      xrayBase="backer-election"
      pageTitle="Backer Election"
      breadcrumbs="Member workspace / Governance"
      hero={
        <Hero
          variant="app"
          eyebrow="Cooperative Governance"
          headline="Vote on what the platform builds next"
          body="Backer Elections turn member judgment into platform direction. Members review proposals, stake Marks for voting weight, and participate in a governance ritual that feels civic, accountable, and legible rather than financialized."
          primaryCTA={{ label: "Review Active Proposals", href: "#open-proposals-list" }}
          secondaryCTA={{ label: "How Marks-Weighted Voting Works", href: "#how-voting-works" }}
          proofStrip={["Live elections", "turnout visibility", "proposal deadlines", "member-submitted measures"]}
        />
      }
    >
      <div className="space-y-6 pb-24">
        <div {...tourTarget} />

        <Card>
          <CardContent className="flex flex-wrap items-center gap-2 py-4 text-xs text-muted-foreground">
            <Badge variant="outline">Live elections: {openProposals.length}</Badge>
            <Badge variant="outline">Nearest deadline: {nearestDeadline}</Badge>
            <Badge variant="outline">Turnout visibility: live</Badge>
            <Badge variant="outline">Civic governance ritual</Badge>
          </CardContent>
        </Card>

        <OpenProposalsList
          proposals={openProposals}
          onReview={(proposalId) => {
            setSelectedProposalId(proposalId);
            setMobileDetailOpen(true);
          }}
        />

        <div className="hidden md:block">
          <ProposalDetailWorkspace proposal={selectedProposal} />
        </div>

        <MarksStakingPanel
          availableMarks={availableMarks}
          stakeMarks={stakeMarks}
          onStakeMarksChange={setStakeMarks}
          onContinue={() => setStakeConfirmOpen(true)}
        />

        <VotingWorkspace
          disabled={!selectedProposal}
          onSubmit={async (choice) => {
            await voteMutation.mutateAsync(choice);
          }}
        />

        <TurnoutLedger proposals={openProposals} />

        <HowVotingWorksExplainer />

        <MemberProposalSubmissionForm
          disabled={submitProposalMutation.isPending}
          onSubmit={async (payload) => {
            await submitProposalMutation.mutateAsync(payload);
          }}
        />

        <StickyMobileCTA primary={{ label: "Review Active Proposals", href: "#open-proposals-list" }} />
      </div>

      <Sheet open={mobileDetailOpen} onOpenChange={setMobileDetailOpen}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto md:hidden">
          <SheetHeader>
            <SheetTitle>Proposal details</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <ProposalDetailWorkspace proposal={selectedProposal} />
          </div>
        </SheetContent>
      </Sheet>

      <AsYouWishConfirmation
        open={stakeConfirmOpen}
        onOpenChange={setStakeConfirmOpen}
        onConfirm={async () => {
          if (!selectedProposal) throw new Error("Select a proposal first.");
          await stakeMutation.mutateAsync(selectedProposal.id);
        }}
      />
    </AppShell>
  );
}
