import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const ALLOWED_ORIGINS = [
  "https://lianabanyan.com",
  "https://www.lianabanyan.com",
  "https://mnemosynec.org",
  "https://www.mnemosynec.org",
  "https://mnemosynec.ai",
  "https://www.mnemosynec.ai",
  "http://localhost:8080",
  "http://localhost:5173",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  };
}

function jsonResponse(req: Request, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
  });
}

const DEFAULT_PRICE_ID = "price_1SIXWsDMOngHJB3UxKPFmXZE";

async function createStripeCheckoutSession(
  stripeKey: string,
  params: Record<string, string>,
): Promise<{ ok: boolean; data?: Record<string, unknown>; error?: string }> {
  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${btoa(stripeKey + ":")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });

  const stripeData = await stripeResponse.json();
  if (!stripeResponse.ok) {
    return { ok: false, error: stripeData?.error?.message || "Stripe checkout failed" };
  }
  return { ok: true, data: stripeData };
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const t0 = Date.now();
  const log = (msg: string) => console.log(`[Membership +${Date.now() - t0}ms] ${msg}`);
  log("Request received");

  try {
    const url = new URL(req.url);
    const queryToken = url.searchParams.get("token");
    const authHeader = req.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : "";
    const token = queryToken || bearerToken;
    const isRedirectMode = !!queryToken;

    let body: Record<string, unknown> = {};
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch { /* no body is ok */ }
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      log("STRIPE_SECRET_KEY not set");
      return jsonResponse(req, { error: "Payment service not configured" }, 500);
    }

    // ── Anonymous path (mnemosynec.org island — email only, no JWT) ──
    if (!token) {
      const email = typeof body.email === "string" ? body.email.trim() : "";
      if (!email || !email.includes("@")) {
        return jsonResponse(req, { error: "email required" }, 400);
      }

      const priceId = (typeof body.priceId === "string" && body.priceId) || DEFAULT_PRICE_ID;
      const successUrl = (typeof body.successUrl === "string" && body.successUrl)
        || "https://mnemosynec.org/join/success/";
      const cancelUrl = (typeof body.cancelUrl === "string" && body.cancelUrl)
        || "https://mnemosynec.org/join/";

      log(`Anonymous checkout for ${email}`);

      const stripeParams: Record<string, string> = {
        "customer_email": email,
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        "mode": "payment",
        "success_url": successUrl.includes("{CHECKOUT_SESSION_ID}")
          ? successUrl
          : `${successUrl}${successUrl.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`,
        "cancel_url": cancelUrl,
        "metadata[payment_type]": "lb_membership_stake",
        "metadata[type]": "membership",
        "metadata[is_renewal]": "false",
        "metadata[auto_renew]": "false",
        "metadata[source]": "mnemosynec_anon",
        "metadata[customer_email]": email,
      };

      const stripeResult = await createStripeCheckoutSession(stripeKey, stripeParams);
      if (!stripeResult.ok || !stripeResult.data?.url) {
        log(`Stripe error: ${stripeResult.error}`);
        return jsonResponse(req, { error: stripeResult.error || "Stripe checkout failed" }, 500);
      }

      log(`Anonymous session created: ${stripeResult.data.id}`);
      return jsonResponse(req, { url: stripeResult.data.url as string });
    }

    // ── Authenticated path (existing lianabanyan.com flow) ──
    let inviteCode = "";
    let isRenewal = false;
    let autoRenew = false;
    let introducer_user_id = "";
    inviteCode = (body.inviteCode as string) || "";
    isRenewal = body.isRenewal === true;
    autoRenew = body.autoRenew === true;
    introducer_user_id = (body.introducer_user_id as string) || "";

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
      return jsonResponse(req, { error: "Not authenticated" }, 401);
    }
    log(`Authenticated: ${user.email}`);

    log("Step 2: check user_credits");
    const { data: credits } = await supabaseClient
      .from("user_credits")
      .select("membership_stake_paid")
      .eq("user_id", user.id)
      .maybeSingle();

    if (credits?.membership_stake_paid && !isRenewal) {
      if (isRedirectMode) {
        return Response.redirect("https://lianabanyan.com/dashboard?already_paid=true", 302);
      }
      return jsonResponse(req, { error: "Membership stake already paid" }, 400);
    }
    log("Credits check passed");

    const origin = isRedirectMode
      ? "https://lianabanyan.com"
      : (req.headers.get("origin") || "https://lianabanyan.com");

    log(`Step 3: Stripe API (origin: ${origin})`);

    const stripeMode = autoRenew ? "subscription" : "payment";

    const stripeParams: Record<string, string> = {
      "customer_email": user.email,
      "line_items[0][price]": DEFAULT_PRICE_ID,
      "line_items[0][quantity]": "1",
      "mode": stripeMode,
      "success_url": `${origin}/membership-success?session_id={CHECKOUT_SESSION_ID}`,
      "cancel_url": `${origin}/join?membership=cancelled`,
      "client_reference_id": user.id,
      "metadata[user_id]": user.id,
      "metadata[payment_type]": "lb_membership_stake",
      "metadata[type]": "membership",
      "metadata[is_renewal]": isRenewal ? "true" : "false",
      "metadata[auto_renew]": autoRenew ? "true" : "false",
      "metadata[introducer_user_id]": introducer_user_id || "",
    };

    if (inviteCode) {
      stripeParams["metadata[invite_code]"] = inviteCode;
    }

    const stripeResult = await createStripeCheckoutSession(stripeKey, stripeParams);
    if (!stripeResult.ok || !stripeResult.data?.url) {
      log(`Stripe error: ${stripeResult.error}`);
      const errMsg = stripeResult.error || "Stripe checkout failed";
      if (isRedirectMode) {
        return Response.redirect(`https://lianabanyan.com/dashboard?stripe_error=${encodeURIComponent(errMsg)}`, 302);
      }
      return jsonResponse(req, { error: errMsg }, 500);
    }

    const stripeData = stripeResult.data;
    log(`Session created: ${stripeData.id}`);

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await adminClient.from("membership_payments").insert({
      member_id: user.id,
      amount: 5.00,
      stripe_session_id: stripeData.id as string,
      status: "pending",
      is_renewal: isRenewal,
      introducer_user_id: introducer_user_id || null,
    });

    log("Pending payment recorded");

    if (isRedirectMode) {
      return Response.redirect(stripeData.url as string, 302);
    }
    return jsonResponse(req, { url: stripeData.url as string });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`FATAL: ${msg}`);
    return jsonResponse(req, { error: msg }, 500);
  }
});
