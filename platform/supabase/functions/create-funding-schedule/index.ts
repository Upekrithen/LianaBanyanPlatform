import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FREQUENCY_TO_INTERVAL: Record<
  string,
  { interval: string; interval_count: number }
> = {
  daily: { interval: "day", interval_count: 1 },
  weekly: { interval: "week", interval_count: 1 },
  biweekly: { interval: "week", interval_count: 2 },
  monthly: { interval: "month", interval_count: 1 },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2024-04-10",
  });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const supabaseAnon = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );

  try {
    const {
      recipient_id,
      amount,
      frequency,
      purpose,
      purpose_note,
      card_serial,
      funding_relationship,
    } = await req.json();

    // Authenticate funder
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user: funder },
    } = await supabaseAnon.auth.getUser(token);
    if (!funder) throw new Error("Not authenticated");

    // Validate inputs
    if (!recipient_id) throw new Error("recipient_id is required");
    if (!amount || amount < 1 || amount > 10000)
      throw new Error("Amount must be between $1 and $10,000");
    if (!FREQUENCY_TO_INTERVAL[frequency])
      throw new Error("Invalid frequency. Use: daily, weekly, biweekly, monthly");

    const validRelationships = ["employer", "family", "sponsor", "self", "guild", "other"];
    const relationship = validRelationships.includes(funding_relationship)
      ? funding_relationship
      : "other";

    // KYC verification — both parties must be verified cooperative members
    const { data: funderProfile } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name, kyc_verified")
      .eq("id", funder.id)
      .maybeSingle();

    const { data: recipientProfile } = await supabaseAdmin
      .from("profiles")
      .select("kyc_verified")
      .eq("id", recipient_id)
      .maybeSingle();

    const funderKyc = funderProfile?.kyc_verified === true;
    const recipientKyc = recipientProfile?.kyc_verified === true;

    if (!funderKyc) {
      throw new Error(
        "You must complete identity verification before funding a card. Visit your profile to verify.",
      );
    }
    if (!recipientKyc) {
      throw new Error(
        "The recipient must complete identity verification before receiving card funding.",
      );
    }

    // Verify the recipient has authorized this funder (unless self-funding)
    if (funder.id !== recipient_id) {
      const { data: auth } = await supabaseAdmin
        .from("lb_card_funding_sources")
        .select("id")
        .eq("card_owner_id", recipient_id)
        .eq("authorized_funder_id", funder.id)
        .is("revoked_at", null)
        .maybeSingle();
      if (!auth) {
        throw new Error(
          "Recipient has not authorized you to fund their card. They must authorize you first.",
        );
      }
    }

    // Verify recipient is a cardholder
    const { data: recipientHolder } = await supabaseAdmin
      .from("lb_cardholders")
      .select("id, stripe_cardholder_id")
      .eq("user_id", recipient_id)
      .maybeSingle();
    if (!recipientHolder)
      throw new Error("Recipient does not have an LB Card setup");

    const funderEmail = funderProfile?.email || funder.email;
    let customerId: string;

    const existingCustomers = await stripe.customers.list({
      email: funderEmail,
      limit: 1,
    });
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: funderEmail,
        name: funderProfile?.full_name || undefined,
        metadata: { lb_user_id: funder.id },
      });
      customerId = customer.id;
    }

    // Create Stripe Price for this recurring amount
    const intervalCfg = FREQUENCY_TO_INTERVAL[frequency];
    const price = await stripe.prices.create({
      currency: "usd",
      unit_amount: Math.round(amount * 100),
      recurring: {
        interval: intervalCfg.interval as Stripe.PriceCreateParams.Recurring.Interval,
        interval_count: intervalCfg.interval_count,
      },
      product_data: {
        name: `LB Card Funding — ${purpose || "general"}`,
        metadata: {
          type: "lb_card_funding",
          recipient_id,
          funder_id: funder.id,
        },
      },
    });

    // Create Stripe Subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: price.id }],
      metadata: {
        type: "lb_card_funding",
        funder_id: funder.id,
        recipient_id,
        purpose: purpose || "general",
      },
    });

    // Store schedule with compliance fields
    const { data: schedule, error: insertErr } = await supabaseAdmin
      .from("lb_card_funding_schedules")
      .insert({
        funder_id: funder.id,
        recipient_id,
        card_serial: card_serial || null,
        stripe_subscription_id: subscription.id,
        amount,
        frequency,
        purpose: purpose || "general",
        purpose_note: purpose_note || null,
        status: "active",
        funding_relationship: relationship,
        kyc_verified_funder: funderKyc,
        kyc_verified_recipient: recipientKyc,
        next_funding_at: new Date(
          (subscription as any).current_period_end * 1000,
        ).toISOString(),
      })
      .select()
      .single();
    if (insertErr) throw insertErr;

    console.log(
      `[LB Card Funding] Schedule created: ${schedule.id} | $${amount} ${frequency} | ${funder.id} -> ${recipient_id} | relationship: ${relationship}`,
    );

    return new Response(
      JSON.stringify({ schedule, subscription_id: subscription.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[create-funding-schedule] Error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
