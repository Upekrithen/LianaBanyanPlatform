import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const t0 = Date.now();
  const log = (msg: string) => console.log(`[Membership +${Date.now() - t0}ms] ${msg}`);
  log("Request received");

  try {
    // Accept token from Authorization header OR query param (for redirect flow)
    const url = new URL(req.url);
    const queryToken = url.searchParams.get("token");
    const authHeader = req.headers.get("Authorization");
    const token = queryToken || authHeader?.replace("Bearer ", "");
    const isRedirectMode = !!queryToken;

    if (!token) {
      return jsonResponse({ error: "No authorization" }, 401);
    }

    log("Creating Supabase client");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    log("Step 1: auth.getUser");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user?.email) {
      log(`Auth failed: ${authError?.message}`);
      if (isRedirectMode) {
        return Response.redirect(url.searchParams.get("cancel") || "https://lianabanyan.com/dashboard", 302);
      }
      return jsonResponse({ error: "Not authenticated" }, 401);
    }
    log(`Authenticated: ${user.email}`);

    log("Step 2: check user_credits");
    const { data: credits } = await supabaseClient
      .from("user_credits")
      .select("membership_stake_paid")
      .eq("user_id", user.id)
      .maybeSingle();

    if (credits?.membership_stake_paid) {
      if (isRedirectMode) {
        return Response.redirect("https://lianabanyan.com/dashboard?already_paid=true", 302);
      }
      return jsonResponse({ error: "Membership stake already paid" }, 400);
    }
    log("Credits check passed");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      log("STRIPE_SECRET_KEY not set");
      return jsonResponse({ error: "Payment service not configured" }, 500);
    }

    const origin = isRedirectMode
      ? "https://lianabanyan.com"
      : (req.headers.get("origin") || "https://lianabanyan.com");

    log(`Step 3: Stripe API (origin: ${origin})`);

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(stripeKey + ":")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "customer_email": user.email,
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][product_data][name]": "Liana Banyan Cooperative Membership",
        "line_items[0][price_data][product_data][description]": "Annual membership stake — $5/year",
        "line_items[0][price_data][unit_amount]": "500",
        "line_items[0][quantity]": "1",
        "mode": "payment",
        "success_url": `${origin}/membership-success?session_id={CHECKOUT_SESSION_ID}`,
        "cancel_url": `${origin}/dashboard`,
        "metadata[user_id]": user.id,
        "metadata[payment_type]": "lb_membership_stake",
      }),
    });

    log(`Stripe HTTP: ${stripeResponse.status}`);
    const stripeData = await stripeResponse.json();

    if (!stripeResponse.ok) {
      log(`Stripe error: ${JSON.stringify(stripeData)}`);
      const errMsg = stripeData?.error?.message || "Stripe checkout failed";
      if (isRedirectMode) {
        return Response.redirect(`https://lianabanyan.com/dashboard?stripe_error=${encodeURIComponent(errMsg)}`, 302);
      }
      return jsonResponse({ error: errMsg }, 500);
    }

    log(`Session created: ${stripeData.id}`);

    if (isRedirectMode) {
      return Response.redirect(stripeData.url, 302);
    }
    return jsonResponse({ url: stripeData.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`FATAL: ${msg}`);
    return jsonResponse({ error: msg }, 500);
  }
});
