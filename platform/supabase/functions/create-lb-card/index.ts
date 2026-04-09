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

    const body = await req.json();
    const cardType = body.type ?? "virtual";
    const shippingAddress = body.shipping_address;

    const { data: cardholder, error: chErr } = await adminClient
      .from("lb_cardholders")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (chErr || !cardholder) {
      throw new Error("No cardholder profile found. Create one first.");
    }

    if (!cardholder.provider_cardholder_id) {
      throw new Error("Cardholder has no provider account. Re-create profile.");
    }

    const issuer = await getCardIssuer(cardholder.provider);

    console.log(`[create-lb-card] provider=${cardholder.provider}, type=${cardType}, cardholder=${cardholder.id}`);

    let result;
    if (cardType === "physical") {
      if (!shippingAddress?.line1 || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.zip) {
        throw new Error("Physical cards require a shipping address (line1, city, state, zip)");
      }
      result = await issuer.issuePhysicalCard({
        providerCardholderId: cardholder.provider_cardholder_id,
        shippingAddress: {
          firstName: shippingAddress.first_name ?? "",
          lastName: shippingAddress.last_name ?? "",
          line1: shippingAddress.line1,
          line2: shippingAddress.line2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.zip,
          country: shippingAddress.country ?? "US",
        },
      });
    } else {
      result = await issuer.issueVirtualCard({
        providerCardholderId: cardholder.provider_cardholder_id,
        memo: "LB Card — cooperative spending",
      });
    }

    const { data: card, error: insertErr } = await adminClient
      .from("lb_cards")
      .insert({
        cardholder_id: cardholder.id,
        provider_card_id: result.providerCardId,
        stripe_card_id: cardholder.provider === "stripe" ? result.providerCardId : null,
        card_type: result.type,
        status: result.status === "open" ? "active" : result.status,
        last_four: result.lastFour,
        exp_month: result.expMonth,
        exp_year: result.expYear,
        provider_metadata: result.metadata,
      })
      .select("*")
      .single();

    if (insertErr) throw insertErr;

    console.log(`[create-lb-card] Issued ${cardType} card ${card.id} (last4: ${result.lastFour})`);

    return new Response(JSON.stringify({ card }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[create-lb-card] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
