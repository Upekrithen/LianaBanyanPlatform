import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { writeLedgerEntry } from "../_shared/ledgerWriter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Pioneer {
  id: string;
  member_id: string;
  cue_card_role: string;
  tier: string;
  monthly_bonus_marks: number;
  bonus_duration_months: number;
  bonus_started_at: string;
  bonus_expires_at: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify caller is founder (admin)
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const {
      data: { user },
    } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "founder") {
      return new Response(
        JSON.stringify({ error: "Admin only" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    const now = new Date();
    const billingMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

    console.log(`[Pioneer Bonus] Starting disbursement for ${billingMonth}`);

    // All pioneers with active bonus potential
    const { data: pioneers, error: pErr } = await supabaseAdmin
      .from("pioneers")
      .select("id, member_id, cue_card_role, tier, monthly_bonus_marks, bonus_duration_months, bonus_started_at, bonus_expires_at")
      .gt("monthly_bonus_marks", 0);

    if (pErr) throw pErr;

    const allPioneers = (pioneers ?? []) as Pioneer[];
    let disbursed = 0;
    let skipped = 0;
    let expired = 0;
    let totalMarks = 0;
    const details: { role: string; tier: string; number?: number; status: string; marks: number; reason?: string }[] = [];

    for (const p of allPioneers) {
      const startedAt = new Date(p.bonus_started_at);
      const monthsEnrolled = (now.getFullYear() - startedAt.getFullYear()) * 12 + (now.getMonth() - startedAt.getMonth());

      // Early Adopter = one-time (duration_months = 0, so check any prior disbursement)
      if (p.tier === "early_adopter") {
        const { data: anyPrior } = await supabaseAdmin
          .from("pioneer_bonus_log")
          .select("id")
          .eq("pioneer_id", p.id)
          .eq("status", "disbursed")
          .limit(1);

        if (anyPrior && anyPrior.length > 0) {
          await supabaseAdmin.from("pioneer_bonus_log").insert({
            pioneer_id: p.id,
            member_id: p.member_id,
            role: p.cue_card_role,
            tier: p.tier,
            bonus_marks: 0,
            billing_month: billingMonth,
            status: "skipped",
            reason: "already_disbursed",
          } as never).maybeSingle();
          skipped++;
          details.push({ role: p.cue_card_role, tier: p.tier, status: "skipped", marks: 0, reason: "already_disbursed" });
          continue;
        }
      } else {
        // Monthly tiers: check if bonus period has expired
        if (p.bonus_duration_months > 0 && monthsEnrolled >= p.bonus_duration_months) {
          await supabaseAdmin.from("pioneer_bonus_log").insert({
            pioneer_id: p.id,
            member_id: p.member_id,
            role: p.cue_card_role,
            tier: p.tier,
            bonus_marks: 0,
            billing_month: billingMonth,
            status: "expired",
            reason: "duration_exceeded",
          } as never).maybeSingle();
          expired++;
          details.push({ role: p.cue_card_role, tier: p.tier, status: "expired", marks: 0, reason: "duration_exceeded" });
          continue;
        }
      }

      // Check if already disbursed for this month
      const { data: existing } = await supabaseAdmin
        .from("pioneer_bonus_log")
        .select("id")
        .eq("pioneer_id", p.id)
        .eq("billing_month", billingMonth)
        .limit(1);

      if (existing && existing.length > 0) {
        skipped++;
        details.push({ role: p.cue_card_role, tier: p.tier, status: "skipped", marks: 0, reason: "already_disbursed" });
        continue;
      }

      // Disburse
      const marks = p.monthly_bonus_marks;
      const eventId = `pioneer_bonus_${p.id}_${billingMonth}`;

      const { error: insertErr } = await supabaseAdmin.from("pioneer_bonus_log").insert({
        pioneer_id: p.id,
        member_id: p.member_id,
        role: p.cue_card_role,
        tier: p.tier,
        bonus_marks: marks,
        billing_month: billingMonth,
        status: "disbursed",
      } as never);

      if (insertErr) {
        // UNIQUE constraint violation = already disbursed (concurrent safety)
        if (insertErr.code === "23505") {
          skipped++;
          details.push({ role: p.cue_card_role, tier: p.tier, status: "skipped", marks: 0, reason: "concurrent_dedup" });
          continue;
        }
        console.error(`[Pioneer Bonus] Insert error for ${p.id}:`, insertErr);
        continue;
      }

      // Credit Marks via ledger
      try {
        await writeLedgerEntry({
          stripe_event_id: eventId,
          ledger_category: "pioneer_bonus",
          amount_cents: marks * 100,
          currency: "marks",
          payee_id: p.member_id,
          is_patronage: false,
          description: `Pioneer bonus: ${p.tier} ${p.cue_card_role} — ${billingMonth}`,
          webhook_source: "disburse-pioneer-bonuses",
          metadata: {
            pioneer_id: p.id,
            tier: p.tier,
            role: p.cue_card_role,
            billing_month: billingMonth,
            bonus_marks: marks,
          },
        });
      } catch (ledgerErr) {
        console.error(`[Pioneer Bonus] Ledger write non-fatal for ${p.id}:`, ledgerErr);
      }

      disbursed++;
      totalMarks += marks;
      details.push({ role: p.cue_card_role, tier: p.tier, status: "disbursed", marks });
    }

    const summary = {
      billing_month: billingMonth,
      disbursed,
      skipped,
      expired,
      total_marks: totalMarks,
      total_pioneers_processed: allPioneers.length,
      details,
    };

    console.log(`[Pioneer Bonus] Complete:`, JSON.stringify(summary));

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Pioneer Bonus] Fatal:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
