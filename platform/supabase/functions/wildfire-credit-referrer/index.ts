// wildfire-credit-referrer edge function
// BP094 - Wildfire viral tracking: credit Marks to the member whose shared card
// led to a new member signup.
// No em-dashes in comments. Hyphens only.
// Marks table: public.shadow_marks_ledger (discovered via baseline migration §14)
// Reason value: 'referral_credit' (CHECK constraint on shadow_marks_ledger.reason)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const WILDFIRE_REFERRAL_MARKS_AWARD = 5;

serve(async (req: Request) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  let body: {
    member_id?: string;
    referrer_id?: string;
    record?: Record<string, unknown>;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const memberId: string | undefined =
    body.member_id ??
    (body.record as { id?: string } | undefined)?.id;

  const referrerId: string | undefined =
    body.referrer_id ??
    (body.record as { wildfire_share_referrer_id?: string } | undefined)
      ?.wildfire_share_referrer_id;

  if (!memberId || !referrerId) {
    return new Response(
      JSON.stringify({
        skipped: true,
        reason: "No referrer or no member - organic signup",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // Idempotency check: skip if this exact referral was already credited
  const { data: existing } = await supabase
    .from("shadow_marks_ledger")
    .select("id")
    .eq("user_id", referrerId)
    .eq("reason", "referral_credit")
    .eq("note", `bp094_wildfire_referral:${memberId}`)
    .maybeSingle();

  if (existing) {
    return new Response(
      JSON.stringify({
        skipped: true,
        reason: "Already credited for this referral",
        referrer_id: referrerId,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // Insert Marks credit for the referrer
  const { error: marksErr } = await supabase.from("shadow_marks_ledger").insert({
    user_id: referrerId,
    amount: WILDFIRE_REFERRAL_MARKS_AWARD,
    reason: "referral_credit",
    ref_id: memberId,
    note: `bp094_wildfire_referral:${memberId}`,
    created_at: new Date().toISOString(),
  });

  if (marksErr) {
    console.error("Marks credit error:", marksErr.message);
    return new Response(
      JSON.stringify({ error: marksErr.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      credited: true,
      referrer_id: referrerId,
      marks_awarded: WILDFIRE_REFERRAL_MARKS_AWARD,
      new_member_id: memberId,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
