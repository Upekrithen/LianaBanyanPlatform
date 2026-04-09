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
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: authData } = await supabaseClient.auth.getUser(token);
    const user = authData.user;
    if (!user) throw new Error("Not authenticated");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const origin = req.headers.get("origin") || "https://lianabanyan.com";

    // Check if account already exists
    const { data: existing } = await supabaseClient
      .from("member_connect_accounts")
      .select("stripe_account_id, onboarding_status")
      .eq("user_id", user.id)
      .maybeSingle();

    let stripeAccountId = existing?.stripe_account_id;

    if (!stripeAccountId) {
      // Create Stripe Express account
      const params = new URLSearchParams({
        type: "express",
        country: "US",
        "capabilities[transfers][requested]": "true",
        "metadata[lb_user_id]": user.id,
      });
      if (user.email) params.set("email", user.email);

      const createRes = await fetch("https://api.stripe.com/v1/accounts", {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(stripeKey + ":")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });
      const account = await createRes.json();
      if (!createRes.ok) throw new Error(account?.error?.message || "Failed to create account");

      stripeAccountId = account.id;

      await supabaseClient.from("member_connect_accounts").insert({
        user_id: user.id,
        stripe_account_id: stripeAccountId,
        onboarding_status: "pending",
      });
    }

    // Create onboarding link
    const linkParams = new URLSearchParams({
      account: stripeAccountId!,
      refresh_url: `${origin}/dashboard/payouts`,
      return_url: `${origin}/dashboard/payouts`,
      type: "account_onboarding",
    });

    const linkRes = await fetch("https://api.stripe.com/v1/account_links", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(stripeKey + ":")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: linkParams,
    });
    const link = await linkRes.json();
    if (!linkRes.ok) throw new Error(link?.error?.message || "Failed to create onboarding link");

    console.log(`[Connect] Onboarding link created for user ${user.id}`);
    return new Response(
      JSON.stringify({ onboarding_url: link.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[Connect] Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
