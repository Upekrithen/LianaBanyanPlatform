/**
 * useOutreachLetters — React hook for Glass Door outreach letters
 * ================================================================
 * K412 / B099 — The Glass Door Phase 2
 * Innovation #2262 The Glass Door
 *
 * BP077 Scope 11 — Credit-staking hooks added (useLetterStakes).
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LEDGER_SECTIONS, createLedgerEntryId } from "@/lib/discourse/ledgerSections";

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
  // BP077 Scope 11 — credit-staking columns (added by migration 20260608000001)
  credit_stake_total: number;
  credit_funder_count: number;
  went_public_via_credits_at: string | null;
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

// ── BP077 Scope 11: Credit-Staking ─────────────────────────────────────────

export interface LetterStake {
  id: string;
  letter_id: string;
  member_id: string;
  amount: number;
  contribution_type: "initial" | "additional";
  member_total_after: number;
  ledger_entry_id: string;
  created_at: string;
}

export interface LetterStakeResult {
  success: boolean;
  member_total_after: number;
  letter_total: number;
  funder_count: number;
  went_public: boolean;
}

/**
 * useLetterStakes — fetch credit-stake state for an outreach letter.
 *
 * Exposes:
 *   stakeTotal     — letter's credit_stake_total
 *   funderCount    — letter's credit_funder_count
 *   memberTotal    — this member's cumulative stake for the letter
 *   wentPublicAt   — went_public_via_credits_at (null until threshold met)
 *   stakeCredits   — atomic stake action → calls process_letter_stake_atomic RPC
 */
export function useLetterStakes(letterId: string) {
  const [stakeTotal, setStakeTotal] = useState<number>(0);
  const [funderCount, setFunderCount] = useState<number>(0);
  const [memberTotal, setMemberTotal] = useState<number>(0);
  const [wentPublicAt, setWentPublicAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!letterId) return;
    setLoading(true);

    // Fetch letter-level staking totals
    const { data: letterData } = await (supabase
      .from("outreach_letters" as never)
      .select("credit_stake_total, credit_funder_count, went_public_via_credits_at") as any)
      .eq("letter_id", letterId)
      .single();

    if (letterData) {
      setStakeTotal(letterData.credit_stake_total ?? 0);
      setFunderCount(letterData.credit_funder_count ?? 0);
      setWentPublicAt(letterData.went_public_via_credits_at ?? null);
    }

    // Fetch this member's own stake total
    const session = await supabase.auth.getSession();
    const memberId = session.data.session?.user?.id;

    if (memberId) {
      const { data: memberStakes } = await (supabase
        .from("outreach_letter_stakes" as never)
        .select("amount") as any)
        .eq("letter_id", letterId)
        .eq("member_id", memberId);

      if (memberStakes) {
        const total = (memberStakes as { amount: number }[]).reduce(
          (sum, s) => sum + Number(s.amount),
          0,
        );
        setMemberTotal(total);
      }
    }

    setLoading(false);
  }, [letterId]);

  useEffect(() => {
    load();
  }, [load]);

  const stakeCredits = async (amount: number): Promise<LetterStakeResult> => {
    const session = await supabase.auth.getSession();
    const memberId = session.data.session?.user?.id;
    if (!memberId) throw new Error("Not authenticated");

    const ledgerEntryId = createLedgerEntryId(LEDGER_SECTIONS.PEDESTAL_FUNDING);

    const { data, error } = await (supabase as any).rpc("process_letter_stake_atomic", {
      p_letter_id: letterId,
      p_member_id: memberId,
      p_amount: amount,
      p_ledger_entry_id: ledgerEntryId,
    });

    if (error) throw new Error(error.message ?? "Stake RPC failed");

    const result = data as LetterStakeResult;

    // Optimistically update local state from RPC result
    setStakeTotal(result.letter_total);
    setFunderCount(result.funder_count);
    setMemberTotal(result.member_total_after);
    if (result.went_public) {
      setWentPublicAt(new Date().toISOString());
    }

    return result;
  };

  return { stakeTotal, funderCount, memberTotal, wentPublicAt, loading, stakeCredits };
}
