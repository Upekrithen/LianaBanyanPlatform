import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCardIssuer } from "../_shared/cardIssuer.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const { data: { user }, error: authErr } = await anonClient.auth.getUser(token);
    if (authErr || !user) throw new Error("Not authenticated");

    const { name, billing } = await req.json();
    if (!name?.first_name || !name?.last_name) {
      throw new Error("first_name and last_name are required");
    }
    if (!billing?.line1 || !billing?.city || !billing?.postal_code) {
      throw new Error("billing address (line1, city, postal_code) is required");
    }

    const { data: existing } = await adminClient
      .from("lb_cardholders")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      throw new Error("Cardholder profile already exists");
    }

    const { data: flagRow } = await adminClient
      .from("founder_feature_flags")
      .select("notes")
      .eq("feature_key", "lb_card_provider")
      .maybeSingle();
    const provider = flagRow?.notes ?? Deno.env.get("LB_CARD_PROVIDER") ?? "stripe";

    const issuer = await getCardIssuer(provider);
    const email = user.email ?? "";

    console.log(`[create-lb-cardholder] provider=${provider}, user=${user.id}`);

    const result = await issuer.createCardholder({
      firstName: name.first_name,
      lastName: name.last_name,
      email,
      billing: {
        line1: billing.line1,
        line2: billing.line2,
        city: billing.city,
        state: billing.state,
        postalCode: billing.postal_code,
        country: billing.country || "US",
      },
    });

    const { data: cardholder, error: insertErr } = await adminClient
      .from("lb_cardholders")
      .insert({
        user_id: user.id,
        provider,
        provider_cardholder_id: result.providerCardholderId,
        stripe_cardholder_id: provider === "stripe" ? result.providerCardholderId : null,
        status: result.status === "active" ? "approved" : result.status,
        kyc_status: "approved",
        card_balance_cents: 0,
        provider_metadata: result.metadata,
      })
      .select("*")
      .single();

    if (insertErr) throw insertErr;

    console.log(`[create-lb-cardholder] Created cardholder ${cardholder.id} via ${provider}`);

    return new Response(JSON.stringify({ cardholder }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[create-lb-cardholder] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
