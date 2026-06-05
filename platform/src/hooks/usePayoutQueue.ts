/**
 * usePayoutQueue -- Wave 11 / S10
 * =================================
 * Admin hook for the marks_allocation_queue.
 * Fetches pending items for Founder/staff approval.
 * Calls process_payout_queue_item RPC for approve/reject actions.
 *
 * GATE: MARKS_AUTO_PAYOUT_ENABLED controls whether new items are auto-approved
 * or queued for manual review. This hook is for the manual review path.
 *
 * SECURITIES-CLEAN: Marks = participation credits. NOT financial instruments.
 * BP073-W11 / S10
 */

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PayoutQueueItem {
  id: string;
  member_id: string;
  reason: string;
  marks_units: number;
  triggered_by: string | null;
  phase: "manual" | "automatic";
  status: "pending_approval" | "approved" | "rejected" | "processed";
  note: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface PayoutQueueResult {
  items: PayoutQueueItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/** Fetch all pending payout queue items for admin review. */
export function usePendingPayoutQueue(): PayoutQueueResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["payout-queue-pending"],
    queryFn: async (): Promise<PayoutQueueItem[]> => {
      const { data, error } = await supabase
        .from("marks_allocation_queue" as never)
        .select("*")
        .eq("status" as never, "pending_approval")
        .order("created_at" as never, { ascending: true })
        .limit(100) as any;

      if (error) throw new Error(error.message);
      return (data ?? []) as PayoutQueueItem[];
    },
    staleTime: 30_000,
  });

  return {
    items: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

/** Approve or reject a payout queue item. Calls the server-side RPC. */
export function usePayoutQueueAction() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (opts: {
      queueId: string;
      action: "approve" | "reject";
      staffId: string;
    }): Promise<{ ok: boolean; action: string; error?: string }> => {
      const { data, error } = await (supabase.rpc as any)(
        "process_payout_queue_item",
        {
          p_queue_id: opts.queueId,
          p_action: opts.action,
          p_staff_id: opts.staffId,
        },
      );

      if (error) return { ok: false, action: opts.action, error: error.message };
      return { ok: data?.ok ?? false, action: data?.action ?? opts.action };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payout-queue-pending"] });
      qc.invalidateQueries({ queryKey: ["marks-balance"] });
    },
  });
}

/** Fetch payout gate status from the payout_gate_status view. */
export function usePayoutGateStatus() {
  return useQuery({
    queryKey: ["payout-gate-status-live"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payout_gate_status" as never)
        .select("*")
        .maybeSingle() as any;

      if (error) throw new Error(error.message);
      return data as {
        auto_payout_enabled: boolean;
        join_marks_units: number;
        renewal_marks_units: number;
        checked_at: string;
      } | null;
    },
    staleTime: 60_000,
  });
}
