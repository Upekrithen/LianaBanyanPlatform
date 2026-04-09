/**
 * process-marks-payback — K154 Edge Function
 *
 * Mechanic: $5/year membership. At 100+ Marks in a year, next year's renewal
 * auto-deducts 5 Credits from earned Credits. Member pays $0 out of pocket.
 *
 * Invoked by cron or membership renewal check. Processes a single member
 * (POST { member_id }) or all eligible members (POST { all: true }).
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RenewalResult {
  member_id: string;
  method: "credits" | "stripe";
  marks_earned: number;
  credits_deducted: number;
  checkout_url?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const memberIds: string[] = [];

    if (body.member_id) {
      memberIds.push(body.member_id);
    } else if (body.all) {
      // Find all members with active memberships expiring within 7 days
      const cutoff = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: expiring } = await supabase
        .from("membership_subscriptions")
        .select("user_id")
        .eq("status", "active")
        .lte("current_period_end", cutoff);

      for (const row of expiring || []) {
        memberIds.push(row.user_id);
      }
    }

    if (memberIds.length === 0) {
      return new Response(JSON.stringify({ processed: 0, results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: RenewalResult[] = [];

    for (const memberId of memberIds) {
      const result = await processOneMember(supabase, memberId);
      results.push(result);
    }

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function processOneMember(
  supabase: ReturnType<typeof createClient>,
  memberId: string
): Promise<RenewalResult> {
  // 1. Get membership period
  const { data: membership } = await supabase
    .from("membership_subscriptions")
    .select("current_period_end, current_period_start")
    .eq("user_id", memberId)
    .eq("status", "active")
    .single();

  const yearStart = membership?.current_period_start
    || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

  // 2. Count Marks earned in membership year
  // Marks appear as payee_id entries with currency='marks' in the ledger
  const { count: marksCount } = await supabase
    .from("transaction_ledger")
    .select("*", { count: "exact", head: true })
    .eq("payee_id", memberId)
    .eq("currency", "marks")
    .eq("status", "completed")
    .gte("created_at", yearStart);

  const marksEarned = marksCount || 0;

  // 3. Calculate Credit balance (sum of credits in cents)
  const { data: creditRows } = await supabase
    .from("transaction_ledger")
    .select("amount_cents, payer_id, payee_id")
    .or(`payer_id.eq.${memberId},payee_id.eq.${memberId}`)
    .eq("currency", "credits")
    .eq("status", "completed");

  let balanceCents = 0;
  for (const row of creditRows || []) {
    if (row.payee_id === memberId) balanceCents += row.amount_cents || 0;
    if (row.payer_id === memberId) balanceCents -= row.amount_cents || 0;
  }

  const creditBalance = balanceCents / 100;

  // 4. Determine renewal method
  if (marksEarned >= 100 && creditBalance >= 5) {
    // Auto-deduct 5 Credits (500 cents)
    const { error: ledgerErr } = await supabase
      .from("transaction_ledger")
      .insert({
        ledger_category: "marks_payback",
        amount_cents: 500,
        currency: "credits",
        payer_id: memberId,
        status: "completed",
        description: "Marks Payback: membership renewal via earned Credits",
        metadata: { marks_earned: marksEarned, renewal_type: "marks_payback" },
      });

    if (ledgerErr) throw ledgerErr;

    // Log to membership_renewals
    await supabase.from("membership_renewals").insert({
      member_id: memberId,
      method: "credits",
      amount: 5.0,
      marks_at_renewal: marksEarned,
      credits_deducted: 5.0,
      membership_year_start: yearStart,
      membership_year_end: new Date(
        new Date(yearStart).getTime() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });

    return {
      member_id: memberId,
      method: "credits",
      marks_earned: marksEarned,
      credits_deducted: 5,
    };
  } else {
    // Member doesn't qualify — return Stripe checkout path
    // Log the check attempt
    await supabase.from("membership_renewals").insert({
      member_id: memberId,
      method: "stripe",
      amount: 5.0,
      marks_at_renewal: marksEarned,
      credits_deducted: 0,
      membership_year_start: yearStart,
      membership_year_end: new Date(
        new Date(yearStart).getTime() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });

    return {
      member_id: memberId,
      method: "stripe",
      marks_earned: marksEarned,
      credits_deducted: 0,
      checkout_url: "/membership?renew=true",
    };
  }
}
