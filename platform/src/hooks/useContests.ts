import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Contest {
  id: string;
  title: string;
  slug: string;
  description: string;
  rules: string;
  craft_type: string;
  portal: string;
  submission_start: string;
  submission_end: string;
  voting_start: string;
  voting_end: string;
  prize_description: string;
  winner_production: boolean;
  status: string;
  winner_project_id: string | null;
  runner_up_ids: string[];
  created_at: string;
}

export interface ContestEntry {
  id: string;
  contest_id: string;
  project_id: string;
  user_id: string;
  entry_statement: string | null;
  vote_count: number;
  pledge_total: number;
  submitted_at: string;
  project?: {
    id: string;
    title: string;
    slug: string;
    description: string;
    images: string[];
    creator_id: string;
    status: string;
  };
}

export interface ContestVote {
  id: string;
  contest_id: string;
  entry_id: string;
  user_id: string;
  vote_type: string;
  credits_pledged: number;
  created_at: string;
}

export function useContests(portal?: string) {
  return useQuery({
    queryKey: ["contests", portal],
    queryFn: async () => {
      let q = supabase
        .from("platform_contests" as any)
        .select("*")
        .order("submission_start", { ascending: true });

      if (portal && portal !== "all") {
        q = q.eq("portal", portal);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Contest[];
    },
  });
}

export function useContest(slug: string | undefined) {
  return useQuery({
    queryKey: ["contest", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("platform_contests" as any)
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Contest;
    },
    enabled: !!slug,
  });
}

export function useContestEntries(contestId: string | undefined) {
  return useQuery({
    queryKey: ["contest-entries", contestId],
    queryFn: async () => {
      if (!contestId) return [];
      const { data, error } = await supabase
        .from("contest_entries" as any)
        .select("*, project:turnkey_projects(id, title, slug, description, images, creator_id, status)")
        .eq("contest_id", contestId)
        .order("vote_count", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ContestEntry[];
    },
    enabled: !!contestId,
  });
}

export function useUserContestVotes(contestId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["contest-user-votes", contestId, user?.id],
    queryFn: async () => {
      if (!contestId || !user) return [];
      const { data, error } = await supabase
        .from("contest_votes" as any)
        .select("*")
        .eq("contest_id", contestId)
        .eq("user_id", user.id);
      if (error) throw error;
      return (data ?? []) as ContestVote[];
    },
    enabled: !!contestId && !!user,
  });
}

export function useVoteEntry() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      contestId,
      entryId,
      voteType = "want",
      creditsPledged = 0,
    }: {
      contestId: string;
      entryId: string;
      voteType?: "want" | "pledge";
      creditsPledged?: number;
    }) => {
      if (!user) throw new Error("Must be logged in to vote");

      const { data, error } = await supabase
        .from("contest_votes" as any)
        .upsert(
          {
            contest_id: contestId,
            entry_id: entryId,
            user_id: user.id,
            vote_type: voteType,
            credits_pledged: creditsPledged,
          },
          { onConflict: "contest_id,entry_id,user_id" }
        )
        .select()
        .single();

      if (error) throw error;

      // Increment vote_count on the entry
      await supabase.rpc("increment_contest_vote" as any, {
        _entry_id: entryId,
        _pledge_amount: creditsPledged,
      });

      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["contest-entries", vars.contestId] });
      queryClient.invalidateQueries({ queryKey: ["contest-user-votes", vars.contestId] });
    },
  });
}

export function useSubmitEntry() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      contestId,
      projectId,
      entryStatement,
    }: {
      contestId: string;
      projectId: string;
      entryStatement?: string;
    }) => {
      if (!user) throw new Error("Must be logged in to enter a contest");

      const { data, error } = await supabase
        .from("contest_entries" as any)
        .insert({
          contest_id: contestId,
          project_id: projectId,
          user_id: user.id,
          entry_statement: entryStatement || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ContestEntry;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["contest-entries", vars.contestId] });
    },
  });
}

export function getContestPhase(contest: Contest): "upcoming" | "submissions" | "voting" | "judging" | "complete" {
  const now = new Date();
  const subStart = new Date(contest.submission_start);
  const subEnd = new Date(contest.submission_end);
  const voteStart = new Date(contest.voting_start);
  const voteEnd = new Date(contest.voting_end);

  if (contest.status === "complete") return "complete";
  if (now < subStart) return "upcoming";
  if (now >= subStart && now < subEnd) return "submissions";
  if (now >= voteStart && now < voteEnd) return "voting";
  return "judging";
}
