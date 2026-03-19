import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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

    console.log(`[Verify] Success — user ${userId} marked as paid`);

    return new Response(
      JSON.stringify({ verified: true, status: "paid" }),
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
