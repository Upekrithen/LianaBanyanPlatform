/**
 * Coverage Minutes DB Service — bridges the pure computation functions in
 * coverageMinutes.ts to the `coverage_minutes` table in Supabase.
 *
 * Schema (from 20260319000019):
 *   id, user_id, minutes_earned, minutes_spent, earned_events, spent_events,
 *   last_earned_at, last_spent_at
 */

import { supabase } from "@/integrations/supabase/client";
import type { CoverageMinuteAccount } from "./coverageMinutes";
import { createAccount } from "./coverageMinutes";

interface DBRow {
  id: string;
  user_id: string;
  minutes_earned: number;
  minutes_spent: number;
  last_earned_at: string | null;
  last_spent_at: string | null;
}

export async function fetchCoverageAccount(userId: string): Promise<CoverageMinuteAccount> {
  const { data, error } = await supabase
    .from("coverage_minutes" as never)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return createAccount(userId);
  }

  const row = data as unknown as DBRow;
  const earned = Number(row.minutes_earned) || 0;
  const spent = Number(row.minutes_spent) || 0;
  return {
    id: row.id,
    memberId: row.user_id,
    earnedMinutes: earned,
    spentMinutes: spent,
    donatedOutMinutes: 0,
    receivedDonationMinutes: 0,
    currentBalance: earned - spent,
    maxSessionBroadcast: 180,
    accumulationLevel: 1,
    createdAt: "",
    updatedAt: row.last_spent_at || row.last_earned_at || "",
  };
}

export async function ensureCoverageAccount(userId: string): Promise<void> {
  const { data } = await supabase
    .from("coverage_minutes" as never)
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    await supabase.from("coverage_minutes" as never).insert({
      user_id: userId,
      minutes_earned: 0,
      minutes_spent: 0,
    });
  }
}

export async function spendCoverageMinutes(
  userId: string,
  amount: number,
  _transactionType: string,
  description: string,
  _sourceId?: string,
  _sourceType?: string,
): Promise<boolean> {
  const account = await fetchCoverageAccount(userId);
  if (account.currentBalance < amount) return false;

  const newSpent = account.spentMinutes + amount;
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("coverage_minutes" as never)
    .update({
      minutes_spent: newSpent,
      last_spent_at: now,
      spent_events: supabase.rpc ? undefined : undefined,
    })
    .eq("user_id", userId);

  if (error) {
    console.error("Coverage minutes spend error:", error);
    return false;
  }
  return true;
}

export async function earnCoverageMinutes(
  userId: string,
  amount: number,
  _transactionType: string,
  _description: string,
): Promise<void> {
  await ensureCoverageAccount(userId);

  const account = await fetchCoverageAccount(userId);
  const newEarned = account.earnedMinutes + amount;
  const now = new Date().toISOString();

  await supabase
    .from("coverage_minutes" as never)
    .update({
      minutes_earned: newEarned,
      last_earned_at: now,
    })
    .eq("user_id", userId);
}
