import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { writeLedgerEntry } from "../_shared/ledgerWriter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const sessionId = body.session_id;
    const bodyUserId = body.user_id;

    console.log(`[Verify] session_id=${sessionId}, body_user_id=${bodyUserId}`);

    // Try to get user from auth header
    let authUserId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    console.log(`[Verify] Has auth header: ${!!authHeader}`);

    if (authHeader) {
      try {
        const anonClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? "",
          { global: { headers: { Authorization: authHeader } } }
        );
        const { data: { user } } = await anonClient.auth.getUser(
          authHeader.replace("Bearer ", "")
        );
        authUserId = user?.id ?? null;
        console.log(`[Verify] Auth user: ${authUserId}`);
      } catch (e) {
        console.log(`[Verify] Auth failed: ${e}`);
      }
    }

    const userId = authUserId || bodyUserId;
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "No user identified. Please return to dashboard and try again." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Mark as paid using service role
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: upsertError } = await adminClient
      .from("user_credits")
      .upsert(
        {
          user_id: userId,
          membership_stake_paid: true,
          membership_stake_paid_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("[Verify] DB error:", JSON.stringify(upsertError));
      return new Response(
        JSON.stringify({ error: `Database error: ${upsertError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Also activate membership in member_profiles + update membership_payments
    const oneYear = new Date();
    oneYear.setFullYear(oneYear.getFullYear() + 1);

    await adminClient
      .from("member_profiles")
      .update({
        membership_status: "active",
        membership_expires_at: oneYear.toISOString().split("T")[0],
      })
      .eq("user_id", userId);

    if (sessionId) {
      await adminClient
        .from("membership_payments")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("stripe_session_id", sessionId)
        .eq("status", "pending");
    }

    // Write to transaction_ledger for Subchapter T classification
    try {
      await writeLedgerEntry({
        stripe_event_id: sessionId ? `membership_${sessionId}` : `membership_${userId}_${Date.now()}`,
        stripe_session_id: sessionId || undefined,
        ledger_category: 'membership',
        amount_cents: 500,
        payer_id: userId,
        is_patronage: true,
        patronage_type: 'purchase',
        description: 'Access Key — annual membership',
        webhook_source: 'verify-membership-payment',
      });
    } catch (ledgerErr) {
      console.error("[Verify] Ledger write failed (non-fatal):", ledgerErr);
    }

    // Convert guest wallet if one exists for this user's email
    let guestWalletResult = null;
    try {
      const { data: profile } = await adminClient
        .from("member_profiles")
        .select("email")
        .eq("user_id", userId)
        .single();

      const memberEmail = profile?.email;
      if (memberEmail) {
        const convertRes = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/convert-guest-wallet`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({ member_id: userId, email: memberEmail }),
          }
        );
        guestWalletResult = await convertRes.json();
        console.log(`[Verify] Guest wallet check:`, JSON.stringify(guestWalletResult));
      }
    } catch (walletErr) {
      console.error("[Verify] Guest wallet conversion (non-fatal):", walletErr);
    }

    console.log(`[Verify] Success — user ${userId} marked as paid + membership activated`);

    return new Response(
      JSON.stringify({
        verified: true,
        status: "paid",
        guest_wallet: guestWalletResult,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Verify] Fatal:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
