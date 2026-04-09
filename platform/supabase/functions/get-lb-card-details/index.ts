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

    const { card_id } = await req.json();
    if (!card_id) throw new Error("card_id is required");

    // Load card + cardholder, verifying ownership via user_id
    const { data: card, error: cardErr } = await adminClient
      .from("lb_cards")
      .select("*, lb_cardholders!inner(user_id, provider)")
      .eq("id", card_id)
      .single();

    if (cardErr || !card) throw new Error("Card not found");

    const cardholderRow = (card as any).lb_cardholders;
    if (cardholderRow.user_id !== user.id) {
      throw new Error("Not authorized to view this card");
    }

    if (!card.provider_card_id) {
      throw new Error("Card has no provider ID — cannot reveal details");
    }

    const issuer = await getCardIssuer(cardholderRow.provider);
    const details = await issuer.getCardDetails(card.provider_card_id);

    console.log(`[get-lb-card-details] Revealed card ${card_id} for user ${user.id}`);

    return new Response(
      JSON.stringify({
        number: details.number,
        cvc: details.cvc,
        exp_month: details.expMonth,
        exp_year: details.expYear,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[get-lb-card-details] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
