/**
 * useOutreachLetters — React hook for Glass Door outreach letters
 * ================================================================
 * K412 / B099 — The Glass Door Phase 2
 * Innovation #2262 The Glass Door
 */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface OutreachLetter {
  letter_id: string;
  slug: string;
  recipient_name: string;
  recipient_category: string;
  recipient_tier: number;
  state: string;
  full_text: string;
  substantive_summary: string | null;
  what_we_are_asking: string;
  what_we_are_not_asking: string | null;
  why_this_recipient: string | null;
  source_innovation_refs: number[];
  wave_label: string | null;
  scheduled_dispatch: string | null;
  dispatched_at: string | null;
  voting_mode: "advisory" | "binding";
  voting_window_start: string | null;
  voting_window_end: string | null;
  vote_threshold_approval_pct: number;
  vote_threshold_veto_pct: number;
  created_at: string;
  updated_at: string;
}

export interface OutreachVote {
  vote_id: string;
  letter_id: string;
  member_id: string;
  vote_type: "approve" | "request_edit" | "delay" | "redirect" | "veto" | "abstain";
  six_degrees_flag: boolean;
  comment: string | null;
  proposed_edit: string | null;
  proposed_delay_days: number | null;
  proposed_redirect_recipient: string | null;
  voted_at: string;
}

export interface OutreachVerdict {
  total_votes: number;
  approve_count: number;
  veto_count: number;
  approval_pct: number;
  veto_pct: number;
  verdict: string;
  next_action: string;
}

export interface OutreachResponse {
  response_id: string;
  letter_id: string;
  response_received_at: string;
  response_summary: string;
  response_classifier: string | null;
}

export function useOutreachLetters(filterState?: string) {
  const [letters, setLetters] = useState<OutreachLetter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      let query = (supabase
        .from("outreach_letters" as never)
        .select("*") as any)
        .neq("state", "draft")
        .order("scheduled_dispatch", { ascending: true, nullsFirst: false });

      if (filterState) {
        query = query.eq("state", filterState);
      }

      const { data, error } = await query;
      if (!error) {
        setLetters((data || []) as OutreachLetter[]);
      }
      setLoading(false);
    };

    load();
  }, [filterState]);

  return { letters, loading };
}

export function useOutreachLetter(slug: string) {
  const [letter, setLetter] = useState<OutreachLetter | null>(null);
  const [votes, setVotes] = useState<OutreachVote[]>([]);
  const [verdict, setVerdict] = useState<OutreachVerdict | null>(null);
  const [responses, setResponses] = useState<OutreachResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      // Fetch letter
      const { data: letterData } = await (supabase
        .from("outreach_letters" as never)
        .select("*") as any)
        .eq("slug", slug)
        .single();

      if (!letterData) {
        setLoading(false);
        return;
      }

      setLetter(letterData as OutreachLetter);

      // Fetch votes
      const { data: voteData } = await (supabase
        .from("outreach_letter_votes" as never)
        .select("*") as any)
        .eq("letter_id", letterData.letter_id)
        .order("voted_at", { ascending: false });

      setVotes((voteData || []) as OutreachVote[]);

      // Compute verdict
      const { data: verdictData } = await (supabase as any).rpc(
        "compute_outreach_letter_verdict",
        { p_letter_id: letterData.letter_id },
      );
      if (verdictData?.[0]) {
        setVerdict(verdictData[0] as OutreachVerdict);
      }

      // Fetch responses
      const { data: respData } = await (supabase
        .from("outreach_letter_responses" as never)
        .select("*") as any)
        .eq("letter_id", letterData.letter_id)
        .order("response_received_at", { ascending: false });

      setResponses((respData || []) as OutreachResponse[]);
      setLoading(false);
    };

    load();
  }, [slug]);

  const castVote = async (
    voteType: string,
    opts?: { comment?: string; proposed_edit?: string; proposed_delay_days?: number; proposed_redirect_recipient?: string },
  ) => {
    if (!letter) return;
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) return;

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cast-outreach-letter-vote`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          letter_id: letter.letter_id,
          vote_type: voteType,
          ...opts,
        }),
      },
    );

    const data = await res.json();
    if (data.verdict) {
      setVerdict(data.verdict);
    }
    return data;
  };

  const flagSixDegrees = async (flagValue: boolean) => {
    if (!letter) return;
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) return;

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cast-outreach-letter-vote`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          letter_id: letter.letter_id,
          six_degrees_flag: flagValue,
        }),
      },
    );

    return res.json();
  };

  return { letter, votes, verdict, responses, loading, castVote, flagSixDegrees };
}
