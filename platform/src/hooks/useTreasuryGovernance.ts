import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SpendProposal {
  id: string;
  group_type: "guild" | "tribe";
  group_id: string;
  proposed_by: string;
  title: string;
  description: string | null;
  amount: number;
  recipient: string | null;
  status: "proposed" | "voting" | "approved" | "rejected" | "executed" | "expired";
  votes_for: number;
  votes_against: number;
  vote_deadline: string | null;
  executed_at: string | null;
  created_at: string;
}

export interface TreasuryVote {
  id: string;
  proposal_id: string;
  voter_id: string;
  vote: boolean;
  created_at: string;
}

export function useSpendProposals(groupType: "guild" | "tribe", groupId: string | undefined) {
  return useQuery({
    queryKey: ["spend-proposals", groupType, groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const { data, error } = await supabase
        .from("treasury_spend_proposals" as any)
        .select("*")
        .eq("group_type", groupType)
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SpendProposal[];
    },
    enabled: !!groupId,
  });
}

export function useProposalVotes(proposalId: string | undefined) {
  return useQuery({
    queryKey: ["proposal-votes", proposalId],
    queryFn: async () => {
      if (!proposalId) return [];
      const { data, error } = await supabase
        .from("treasury_votes" as any)
        .select("*")
        .eq("proposal_id", proposalId);
      if (error) throw error;
      return (data ?? []) as TreasuryVote[];
    },
    enabled: !!proposalId,
  });
}

export function useMyVote(proposalId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-vote", proposalId, user?.id],
    queryFn: async () => {
      if (!proposalId || !user) return null;
      const { data, error } = await supabase
        .from("treasury_votes" as any)
        .select("*")
        .eq("proposal_id", proposalId)
        .eq("voter_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as TreasuryVote | null;
    },
    enabled: !!proposalId && !!user,
  });
}

const VOTE_WINDOW_HOURS = 72;

export function useCreateProposal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      groupType,
      groupId,
      title,
      description,
      amount,
      recipient,
    }: {
      groupType: "guild" | "tribe";
      groupId: string;
      title: string;
      description?: string;
      amount: number;
      recipient?: string;
    }) => {
      if (!user) throw new Error("Must be logged in");
      if (amount <= 0) throw new Error("Amount must be positive");

      const deadline = new Date();
      deadline.setHours(deadline.getHours() + VOTE_WINDOW_HOURS);

      const { data, error } = await supabase
        .from("treasury_spend_proposals" as any)
        .insert({
          group_type: groupType,
          group_id: groupId,
          proposed_by: user.id,
          title,
          description: description || null,
          amount,
          recipient: recipient || null,
          status: "voting",
          vote_deadline: deadline.toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data as SpendProposal;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["spend-proposals", vars.groupType, vars.groupId] });
    },
  });
}

export function useVoteOnProposal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      proposalId,
      vote,
      groupType,
      groupId,
    }: {
      proposalId: string;
      vote: boolean;
      groupType: "guild" | "tribe";
      groupId: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("treasury_votes" as any)
        .insert({
          proposal_id: proposalId,
          voter_id: user.id,
          vote,
        })
        .select()
        .single();
      if (error) throw error;

      const voteCol = vote ? "votes_for" : "votes_against";
      await supabase
        .from("treasury_spend_proposals" as any)
        .update({ [voteCol]: supabase.rpc ? undefined : undefined })
        .eq("id", proposalId);

      const { data: allVotes } = await supabase
        .from("treasury_votes" as any)
        .select("vote")
        .eq("proposal_id", proposalId);

      const forCount = (allVotes ?? []).filter((v: any) => v.vote === true).length;
      const againstCount = (allVotes ?? []).filter((v: any) => v.vote === false).length;

      await supabase
        .from("treasury_spend_proposals" as any)
        .update({ votes_for: forCount, votes_against: againstCount })
        .eq("id", proposalId);

      return data as TreasuryVote;
    },
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["spend-proposals", vars.groupType, vars.groupId] });
      queryClient.invalidateQueries({ queryKey: ["proposal-votes", vars.proposalId] });
      queryClient.invalidateQueries({ queryKey: ["my-vote", vars.proposalId] });
    },
  });
}

export function useExecuteProposal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      proposalId,
      groupType,
      groupId,
    }: {
      proposalId: string;
      groupType: "guild" | "tribe";
      groupId: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { data: proposal, error: fetchErr } = await supabase
        .from("treasury_spend_proposals" as any)
        .select("*")
        .eq("id", proposalId)
        .single();
      if (fetchErr) throw fetchErr;
      if (!proposal) throw new Error("Proposal not found");

      const p = proposal as SpendProposal;
      if (p.votes_for <= p.votes_against) {
        throw new Error("Proposal has not been approved by majority");
      }

      const { error: updateErr } = await supabase
        .from("treasury_spend_proposals" as any)
        .update({
          status: "executed",
          executed_at: new Date().toISOString(),
        })
        .eq("id", proposalId);
      if (updateErr) throw updateErr;

      await supabase
        .from("group_treasury_transactions" as any)
        .insert({
          group_type: groupType,
          group_id: groupId,
          user_id: user.id,
          transaction_type: "purchase",
          amount: p.amount,
          direction: "out",
          description: `Proposal: ${p.title}`,
          vote_id: proposalId,
        });

      return { proposalId, amount: p.amount };
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["spend-proposals", vars.groupType, vars.groupId] });
      queryClient.invalidateQueries({ queryKey: ["treasury", vars.groupType, vars.groupId] });
    },
  });
}
