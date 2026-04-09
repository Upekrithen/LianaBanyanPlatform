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
    const { card_id, action } = body;
    if (!card_id) throw new Error("card_id is required");
    if (!action) throw new Error("action is required (freeze, unfreeze, cancel, update_limits)");

    const { data: card, error: cardErr } = await adminClient
      .from("lb_cards")
      .select("*, lb_cardholders!inner(id, user_id, provider)")
      .eq("id", card_id)
      .single();

    if (cardErr || !card) throw new Error("Card not found");

    const cardholderRow = (card as any).lb_cardholders;
    if (cardholderRow.user_id !== user.id) {
      throw new Error("Not authorized to control this card");
    }

    if (action === "update_limits") {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (body.spending_limit_daily != null) {
        updates.spending_limit_daily = body.spending_limit_daily;
      }
      if (body.spending_limit_monthly != null) {
        updates.spending_limit_monthly = body.spending_limit_monthly;
      }

      const { error: updErr } = await adminClient
        .from("lb_cardholders")
        .update(updates)
        .eq("id", cardholderRow.id);

      if (updErr) throw updErr;

      console.log(`[update-lb-card-controls] Updated limits for cardholder ${cardholderRow.id}`);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (!card.provider_card_id) {
      throw new Error("Card has no provider ID — cannot update status");
    }

    const issuer = await getCardIssuer(cardholderRow.provider);
    let newStatus: string;

    switch (action) {
      case "freeze": {
        const res = await issuer.freezeCard(card.provider_card_id);
        newStatus = "frozen";
        console.log(`[update-lb-card-controls] Froze card ${card_id}, provider status: ${res.newStatus}`);
        break;
      }
      case "unfreeze": {
        const res = await issuer.unfreezeCard(card.provider_card_id);
        newStatus = "active";
        console.log(`[update-lb-card-controls] Unfroze card ${card_id}, provider status: ${res.newStatus}`);
        break;
      }
      case "cancel": {
        const res = await issuer.cancelCard(card.provider_card_id);
        newStatus = "canceled";
        console.log(`[update-lb-card-controls] Canceled card ${card_id}, provider status: ${res.newStatus}`);
        break;
      }
      default:
        throw new Error(`Unknown action: '${action}'. Supported: freeze, unfreeze, cancel, update_limits`);
    }

    const { error: updErr } = await adminClient
      .from("lb_cards")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", card_id);

    if (updErr) throw updErr;

    return new Response(JSON.stringify({ success: true, status: newStatus }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[update-lb-card-controls] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
