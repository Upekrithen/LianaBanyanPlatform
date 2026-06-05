/**
 * useMarksBalance -- Wave 11 / S9
 * =================================
 * Real-time Marks balance subscription via Supabase Realtime.
 * Subscribes to shadow_marks_ledger INSERT events for the current user.
 * Balance = SUM(amount) from ledger rows (signed; credits positive, debits negative).
 *
 * SECURITIES-CLEAN: Marks = cooperative participation credits.
 * NOT equity, shares, or guaranteed financial return.
 * Rate HELD FOR FOUNDER pending 15-language ratification.
 *
 * BP073-W11 / S9
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MarksBalanceState {
  balance: number;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

/**
 * Real-time Marks balance hook.
 * Computes balance as SUM(amount) from shadow_marks_ledger for the user.
 * Reacts to Realtime INSERT events so the UI stays live without polling.
 */
export function useMarksBalance(userId: string | undefined): MarksBalanceState {
  const [state, setState] = useState<MarksBalanceState>({
    balance: 0,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchBalance = useCallback(async () => {
    if (!userId) {
      setState({ balance: 0, loading: false, error: null, lastUpdated: null });
      return;
    }

    const { data, error } = await supabase
      .from("shadow_marks_ledger" as never)
      .select("amount")
      .eq("user_id" as never, userId) as any;

    if (error) {
      setState((s) => ({ ...s, loading: false, error: error.message }));
      return;
    }

    const balance = (data ?? []).reduce(
      (sum: number, row: { amount: number }) => sum + Number(row.amount),
      0,
    );

    setState({
      balance,
      loading: false,
      error: null,
      lastUpdated: new Date().toISOString(),
    });
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    fetchBalance();

    // Real-time subscription: re-compute balance on INSERT
    const channel = supabase
      .channel(`marks-balance-${userId}`)
      .on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "shadow_marks_ledger",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // New ledger row -- refresh balance
          fetchBalance();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchBalance]);

  return state;
}

/**
 * Fetch paginated Marks history for a member.
 * Returns ledger rows sorted newest-first.
 * Securities-clean: no fiat values, participation units only.
 *
 * S12: Marks history with pagination.
 */
export interface MarksHistoryRow {
  id: string;
  amount: number;
  reason: string;
  ref_id: string | null;
  note: string;
  created_at: string;
}

export async function fetchMarksHistory(opts: {
  userId: string;
  limit?: number;
  offset?: number;
}): Promise<{ rows: MarksHistoryRow[]; total: number; error: string | null }> {
  const limit = opts.limit ?? 20;
  const offset = opts.offset ?? 0;

  const { data, error, count } = await supabase
    .from("shadow_marks_ledger" as never)
    .select("*", { count: "exact" })
    .eq("user_id" as never, opts.userId)
    .order("created_at" as never, { ascending: false })
    .range(offset, offset + limit - 1) as any;

  if (error) return { rows: [], total: 0, error: error.message };

  return {
    rows: (data ?? []) as MarksHistoryRow[],
    total: count ?? 0,
    error: null,
  };
}

/**
 * S26: Export Marks statement as CSV string.
 * Securities-clean: labels clearly state "participation units."
 */
export function exportMarksStatementCSV(
  rows: MarksHistoryRow[],
  memberHandle?: string,
): string {
  const disclaimer =
    "# Marks Statement -- Cooperative participation units. NOT equity or financial return.\n" +
    "# Cost+20% architecture. 83.3% creator share. $5/year membership. Rate HELD FOR FOUNDER.\n";

  const header = "date,type,units,reason,note,ref_id\n";

  const lines = rows.map((r) => {
    const units = r.amount >= 0 ? `+${r.amount}` : String(r.amount);
    const type = r.amount >= 0 ? "CREDIT" : "DEBIT";
    const note = `"${(r.note || "").replace(/"/g, '""')}"`;
    const refId = r.ref_id ?? "";
    return `${r.created_at},${type},${units},${r.reason},${note},${refId}`;
  });

  return (
    disclaimer +
    `# Member: ${memberHandle ?? "unknown"}\n` +
    `# Generated: ${new Date().toISOString()}\n\n` +
    header +
    lines.join("\n")
  );
}
