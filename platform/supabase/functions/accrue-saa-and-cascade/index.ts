import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CAP_AMOUNT = 10_000_000;
const MAX_CASCADE_DEPTH = 20;

interface GrowthMetric {
  revenue_delta?: number;
  level_advanced?: boolean;
  engagement_score?: number;
  custom_weights?: Record<string, number>;
}

interface AccrualEntry {
  recipient_user_id: string;
  source_type: string;
  source_reference_id: string;
  amount: number;
  role: string;
}

interface CascadeEvent {
  from_user_id: string;
  to_user_id: string;
  amount: number;
  source_ripple_id: string | null;
}

function calculateSaaFromGrowth(growth: GrowthMetric): number {
  let base = 0;
  if (growth.revenue_delta) base += growth.revenue_delta * 0.01;
  if (growth.level_advanced) base += 500;
  if (growth.engagement_score) base += growth.engagement_score * 10;
  return Math.max(base, 0);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { engagement_id, growth_metric } = await req.json();

    if (!engagement_id || !growth_metric) {
      return new Response(
        JSON.stringify({ error: "engagement_id and growth_metric are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Load engagement
    const { data: engagement, error: engErr } = await supabaseAdmin
      .from("patron_engagements")
      .select("engagement_id, member_id, patron_id, status")
      .eq("engagement_id", engagement_id)
      .single();

    if (engErr || !engagement) {
      return new Response(
        JSON.stringify({ error: "Engagement not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Resolve patron user_id
    const { data: patronReg } = await supabaseAdmin
      .from("patron_registrations")
      .select("user_id")
      .eq("patron_id", engagement.patron_id)
      .single();

    if (!patronReg) {
      return new Response(
        JSON.stringify({ error: "Patron registration not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Load active ripples on this engagement
    const { data: ripples } = await supabaseAdmin
      .from("ripple_contributions")
      .select("ripple_id, backer_user_id, ripple_type")
      .eq("engagement_id", engagement_id)
      .eq("status", "active");

    const totalSaa = calculateSaaFromGrowth(growth_metric as GrowthMetric);

    if (totalSaa <= 0) {
      return new Response(
        JSON.stringify({ success: true, total_saa: 0, accruals: [], cascades: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Proportional distribution: Patron gets 60%, Ripples split 40%
    const rippleCount = ripples?.length ?? 0;
    const patronShare = rippleCount > 0 ? totalSaa * 0.6 : totalSaa;
    const rippleShareEach = rippleCount > 0 ? (totalSaa * 0.4) / rippleCount : 0;

    const accruals: AccrualEntry[] = [];

    // Patron accrual
    accruals.push({
      recipient_user_id: patronReg.user_id,
      source_type: "open_water_patron",
      source_reference_id: engagement_id,
      amount: patronShare,
      role: "patron",
    });

    // Ripple accruals
    if (ripples) {
      for (const r of ripples) {
        accruals.push({
          recipient_user_id: r.backer_user_id,
          source_type: "open_water_ripple",
          source_reference_id: r.ripple_id,
          amount: rippleShareEach,
          role: `ripple_${r.ripple_type}`,
        });
      }
    }

    // Write saa_ledger entries
    const ledgerRows = accruals.map((a) => ({
      recipient_user_id: a.recipient_user_id,
      source_type: a.source_type,
      source_reference_id: a.source_reference_id,
      amount: a.amount,
      cap_applicable: true,
      capped_and_reseeded: false,
    }));

    const { error: ledgerErr } = await supabaseAdmin
      .from("saa_ledger")
      .insert(ledgerRows);

    if (ledgerErr) throw ledgerErr;

    // Cap check + cascade for each recipient
    const allCascadeEvents: CascadeEvent[] = [];
    const uniqueRecipients = [...new Set(accruals.map((a) => a.recipient_user_id))];

    for (const userId of uniqueRecipients) {
      const userAccrual = accruals
        .filter((a) => a.recipient_user_id === userId)
        .reduce((sum, a) => sum + a.amount, 0);

      await processCascade(
        supabaseAdmin,
        userId,
        userAccrual,
        null,
        allCascadeEvents,
        0
      );
    }

    // Log saa_accrued engagement event
    await supabaseAdmin.from("engagement_events").insert({
      engagement_id,
      event_type: "saa_accrued",
      event_data: {
        growth_metric,
        total_saa: totalSaa,
        patron_share: patronShare,
        ripple_share_each: rippleShareEach,
        ripple_count: rippleCount,
        cascade_count: allCascadeEvents.length,
      },
      recorded_by: engagement.member_id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        total_saa: totalSaa,
        accruals: accruals.map((a) => ({
          recipient: a.recipient_user_id,
          amount: a.amount,
          role: a.role,
        })),
        cascades: allCascadeEvents,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function processCascade(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  newAmount: number,
  sourceRippleId: string | null,
  cascadeEvents: CascadeEvent[],
  depth: number
): Promise<void> {
  if (depth >= MAX_CASCADE_DEPTH || newAmount <= 0) return;

  // Upsert saa_cap_tracking
  const { data: existing } = await supabase
    .from("saa_cap_tracking")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const priorCumulative = existing ? Number(existing.cumulative_saa) : 0;
  const newCumulative = priorCumulative + newAmount;

  if (!existing) {
    await supabase.from("saa_cap_tracking").insert({
      user_id: userId,
      cumulative_saa: Math.min(newCumulative, CAP_AMOUNT),
      cap_reached: newCumulative >= CAP_AMOUNT,
      cap_reached_at: newCumulative >= CAP_AMOUNT ? new Date().toISOString() : null,
      overflow_cascaded: Math.max(newCumulative - CAP_AMOUNT, 0),
      last_cascade_at: newCumulative >= CAP_AMOUNT ? new Date().toISOString() : null,
    });
  } else {
    const update: Record<string, unknown> = {
      cumulative_saa: Math.min(newCumulative, CAP_AMOUNT),
    };
    if (newCumulative >= CAP_AMOUNT && !existing.cap_reached) {
      update.cap_reached = true;
      update.cap_reached_at = new Date().toISOString();
    }
    if (newCumulative > CAP_AMOUNT) {
      update.overflow_cascaded =
        Number(existing.overflow_cascaded) + (newCumulative - CAP_AMOUNT);
      update.last_cascade_at = new Date().toISOString();
    }
    await supabase
      .from("saa_cap_tracking")
      .update(update)
      .eq("user_id", userId);
  }

  // If no overflow, done
  if (newCumulative <= CAP_AMOUNT) return;

  const overflow = newCumulative - CAP_AMOUNT;

  // Find cascade targets: users this person has previously engaged with
  // as Patron or as downstream Ripple beneficiary
  const { data: patronEngagements } = await supabase
    .from("patron_engagements")
    .select("member_id")
    .eq("patron_id", userId);

  const { data: memberEngagements } = await supabase
    .from("patron_engagements")
    .select("patron_id")
    .eq("member_id", userId);

  const { data: ripplesBacked } = await supabase
    .from("ripple_contributions")
    .select("engagement_id")
    .eq("backer_user_id", userId);

  const targetUserIds = new Set<string>();

  // Members this user was Patron to
  if (patronEngagements) {
    for (const pe of patronEngagements) {
      if (pe.member_id !== userId) targetUserIds.add(pe.member_id);
    }
  }

  // Resolve patron user_ids for engagements where this user was Member
  if (memberEngagements) {
    for (const me of memberEngagements) {
      const { data: reg } = await supabase
        .from("patron_registrations")
        .select("user_id")
        .eq("patron_id", me.patron_id)
        .single();
      if (reg && reg.user_id !== userId) targetUserIds.add(reg.user_id);
    }
  }

  // Members/Patrons from engagements this user backed via Ripple
  if (ripplesBacked) {
    for (const rb of ripplesBacked) {
      const { data: eng } = await supabase
        .from("patron_engagements")
        .select("member_id, patron_id")
        .eq("engagement_id", rb.engagement_id)
        .single();
      if (eng) {
        if (eng.member_id !== userId) targetUserIds.add(eng.member_id);
        const { data: reg } = await supabase
          .from("patron_registrations")
          .select("user_id")
          .eq("patron_id", eng.patron_id)
          .single();
        if (reg && reg.user_id !== userId) targetUserIds.add(reg.user_id);
      }
    }
  }

  const targets = [...targetUserIds];
  if (targets.length === 0) return;

  const perTarget = overflow / targets.length;

  for (const targetId of targets) {
    // Record cascade ledger
    await supabase.from("ripple_cascade_ledger").insert({
      from_user_id: userId,
      to_user_id: targetId,
      amount: perTarget,
      source_ripple_id: sourceRippleId,
    });

    cascadeEvents.push({
      from_user_id: userId,
      to_user_id: targetId,
      amount: perTarget,
      source_ripple_id: sourceRippleId,
    });

    // Write SAA ledger entry for cascaded amount
    await supabase.from("saa_ledger").insert({
      recipient_user_id: targetId,
      source_type: "open_water_ripple",
      source_reference_id: null,
      amount: perTarget,
      cap_applicable: true,
      capped_and_reseeded: false,
    });

    // Recursive cascade
    await processCascade(
      supabase,
      targetId,
      perTarget,
      sourceRippleId,
      cascadeEvents,
      depth + 1
    );
  }
}
