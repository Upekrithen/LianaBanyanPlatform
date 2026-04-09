/**
 * create-project-funding-checkout
 * K96 — Creates a Stripe Checkout session for project funding (1/3 Standard).
 *
 * Routes to handle-project-funding-webhook (NOT stripe-webhook).
 * Enforces clean denominations: $5, $10, $25, $50, $100.
 * Verifies project exists and has a cost declaration.
 */

import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Clean denominations only (in cents) — per V2 §4.1
const VALID_AMOUNTS_CENTS = [500, 1000, 2500, 5000, 10000];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { project_id, amount_cents } = await req.json() as {
      project_id: string;
      amount_cents: number;
    };

    if (!project_id || !amount_cents) {
      throw new Error("Missing project_id or amount_cents");
    }

    if (!VALID_AMOUNTS_CENTS.includes(amount_cents)) {
      throw new Error(
        `Invalid amount. Must be one of: ${VALID_AMOUNTS_CENTS.map((c) => `$${c / 100}`).join(", ")}`
      );
    }

    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseAdmin.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    // Verify project exists
    const { data: project, error: projectErr } = await supabaseAdmin
      .from("projects")
      .select("id, name, status")
      .eq("id", project_id)
      .single();

    if (projectErr || !project) {
      throw new Error("Project not found");
    }

    // Verify cost declaration exists (required for cap tracking)
    const { data: costDecl } = await supabaseAdmin
      .from("project_cost_declarations")
      .select("id, declared_cost_cents, cap_reached")
      .eq("project_id", project_id)
      .single();

    if (!costDecl) {
      throw new Error("Project has no cost declaration — cannot accept funding yet");
    }

    const amountDollars = amount_cents / 100;
    console.log(
      `[ProjectFunding] Creating checkout: $${amountDollars} for "${project.name}" by ${user.email}`
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Look up existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Fund: ${project.name}`,
              description: `1/3 Funding Standard — $${amountDollars} contribution. ` +
                `$${(amountDollars / 3).toFixed(2)} to project, ` +
                `$${(amountDollars / 3).toFixed(2)} assignable to you, ` +
                `$${(amountDollars / 3).toFixed(2)} seeds the ecosystem.`,
            },
            unit_amount: amount_cents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/project-funded?session_id={CHECKOUT_SESSION_ID}&project=${project_id}`,
      cancel_url: `${req.headers.get("origin")}/projects/${project_id}`,
      metadata: {
        type: "project_funding",
        funder_id: user.id,
        project_id: project_id,
        amount_cents: amount_cents.toString(),
      },
    });

    console.log(`[ProjectFunding] Checkout session created: ${session.id}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[ProjectFunding] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
