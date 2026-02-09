import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Stake price mappings (Stripe price IDs)
const STAKE_PRICES: Record<string, Record<number, { price_id: string; amount: number; cumulative: number }>> = {
  journeyman: {
    1: { price_id: "price_1SIXbLDMOngHJB3UEDaWbiPS", amount: 500, cumulative: 500 },
    2: { price_id: "price_1SIXbNDMOngHJB3U7xiBk8s2", amount: 750, cumulative: 1250 },
    3: { price_id: "price_1SIXbPDMOngHJB3UdLEdWZh0", amount: 1000, cumulative: 2250 },
    4: { price_id: "price_1SIXbRDMOngHJB3UTWbCeUvM", amount: 1250, cumulative: 3500 },
    5: { price_id: "price_1SIXbUDMOngHJB3UCAvQ76vD", amount: 1500, cumulative: 5000 },
    6: { price_id: "price_1SIXbVDMOngHJB3UEdTcQHAI", amount: 2000, cumulative: 7000 },
  },
  master: {
    1: { price_id: "price_1SIXbXDMOngHJB3Uo3saOuEr", amount: 10000, cumulative: 10000 },
    2: { price_id: "price_1SIXbYDMOngHJB3UtBihqlog", amount: 5000, cumulative: 15000 },
    3: { price_id: "price_1SIXbZDMOngHJB3Ud2oGWVrr", amount: 7500, cumulative: 22500 },
    4: { price_id: "price_1SIXbZDMOngHJB3UMjLa4MCy", amount: 10000, cumulative: 32500 },
    5: { price_id: "price_1SIXbZDMOngHJB3Uuk06p7rX", amount: 15000, cumulative: 47500 },
    6: { price_id: "price_1SIXbZDMOngHJB3UN782C4fu", amount: 20000, cumulative: 67500 },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { tier, class_level } = await req.json();

    // Validate input
    if (!tier || !class_level) {
      throw new Error("Tier and class level required");
    }

    if (!["journeyman", "master"].includes(tier)) {
      throw new Error("Invalid tier");
    }

    if (class_level < 1 || class_level > 6) {
      throw new Error("Invalid class level");
    }

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    console.log(`[Guild Stake] Creating checkout for ${tier} class ${class_level} - user: ${user.email}`);

    // Check if already paid for this tier/class
    const { data: existingPayment } = await supabaseClient
      .from("guild_stake_payments")
      .select("id")
      .eq("user_id", user.id)
      .eq("tier", tier)
      .eq("class_level", class_level)
      .eq("payment_status", "completed")
      .maybeSingle();

    if (existingPayment) {
      return new Response(
        JSON.stringify({ error: `Stake for ${tier} class ${class_level} already paid` }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Get stake price info
    const stakeInfo = STAKE_PRICES[tier][class_level];
    if (!stakeInfo) {
      throw new Error("Invalid stake configuration");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: stakeInfo.price_id,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/guild-stake-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/dashboard`,
      metadata: {
        user_id: user.id,
        payment_type: "guild_stake",
        tier,
        class_level: class_level.toString(),
        amount: stakeInfo.amount.toString(),
        cumulative: stakeInfo.cumulative.toString(),
      },
    });

    console.log(`[Guild Stake] Checkout session created: ${session.id}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[Guild Stake] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
