import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DesignContest {
  id: string;
  group_type: "guild" | "tribe";
  group_id: string;
  contest_type: string;
  title: string;
  description: string | null;
  prize_credits: number;
  status: "open" | "voting" | "decided" | "cancelled";
  submissions_close_at: string | null;
  voting_close_at: string | null;
  winner_submission_id: string | null;
  created_by: string;
  created_at: string;
}

export interface DesignSubmission {
  id: string;
  contest_id: string;
  user_id: string;
  title: string;
  description: string | null;
  asset_url: string;
  preview_url: string | null;
  vote_count: number;
  created_at: string;
}

export function useDesignContestsForGroup(
  groupType: "guild" | "tribe",
  groupId: string | undefined,
) {
  return useQuery({
    queryKey: ["design-contests", groupType, groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const { data, error } = await supabase
        .from("design_contests" as any)
        .select("*")
        .eq("group_type", groupType)
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DesignContest[];
    },
    enabled: !!groupId,
  });
}

export function useDesignContest(contestId: string | undefined) {
  return useQuery({
    queryKey: ["design-contest", contestId],
    queryFn: async () => {
      if (!contestId) return null;
      const { data, error } = await supabase
        .from("design_contests" as any)
        .select("*")
        .eq("id", contestId)
        .single();
      if (error) throw error;
      return data as DesignContest;
    },
    enabled: !!contestId,
  });
}

export function useDesignSubmissions(contestId: string | undefined) {
  return useQuery({
    queryKey: ["design-submissions", contestId],
    queryFn: async () => {
      if (!contestId) return [];
      const { data, error } = await supabase
        .from("design_contest_submissions" as any)
        .select("*")
        .eq("contest_id", contestId)
        .order("vote_count", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DesignSubmission[];
    },
    enabled: !!contestId,
  });
}

export function useCreateDesignContest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      group_type: "guild" | "tribe";
      group_id: string;
      contest_type: string;
      title: string;
      description?: string;
      prize_credits?: number;
      submissions_close_at?: string;
      voting_close_at?: string;
    }) => {
      if (!user) throw new Error("Must be logged in");
      const { data, error } = await supabase
        .from("design_contests" as any)
        .insert({ ...input, created_by: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as DesignContest;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["design-contests", vars.group_type, vars.group_id],
      });
    },
  });
}

export function useSubmitDesign() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      contest_id: string;
      title: string;
      description?: string;
      asset_url: string;
      preview_url?: string;
    }) => {
      if (!user) throw new Error("Must be logged in");
      const { data, error } = await supabase
        .from("design_contest_submissions" as any)
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as DesignSubmission;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["design-submissions", vars.contest_id],
      });
    },
  });
}

export function useVoteDesign() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (submissionId: string) => {
      if (!user) throw new Error("Must be logged in");
      const { data, error } = await supabase
        .from("design_contest_votes" as any)
        .insert({ submission_id: submissionId, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["design-submissions"] });
    },
  });
}
