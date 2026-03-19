import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const { data } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { amount } = await req.json();
    const amountCents = Math.round(Number(amount) * 100);
    if (amountCents < 500 || amountCents % 500 !== 0) {
      throw new Error("Amount must be at least $5 and a multiple of $5");
    }

    const memberships = amountCents / 500;
    console.log(`[Sponsor] ${user.email}, $${amount} = ${memberships} memberships`);

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const origin = req.headers.get("origin") || "https://lianabanyan.com";

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(stripeKey + ":")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "customer_email": user.email,
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][product_data][name]": "Johnny Appleseed — Membership Sponsorships",
        "line_items[0][price_data][product_data][description]": `Sponsor ${memberships} membership${memberships > 1 ? "s" : ""} ($5 each)`,
        "line_items[0][price_data][unit_amount]": amountCents.toString(),
        "line_items[0][quantity]": "1",
        "mode": "payment",
        "success_url": `${origin}/sponsor-success?session_id={CHECKOUT_SESSION_ID}&count=${memberships}`,
        "cancel_url": `${origin}/sponsor`,
        "metadata[user_id]": user.id,
        "metadata[payment_type]": "sponsor_memberships",
        "metadata[memberships_count]": String(memberships),
        "metadata[amount_dollars]": String(amount),
      }),
    });

    const session = await stripeRes.json();
    if (!stripeRes.ok) throw new Error(session?.error?.message || "Stripe error");

    console.log(`[Sponsor] Session created: ${session.id}`);
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (error) {
    console.error("[Sponsor] Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
