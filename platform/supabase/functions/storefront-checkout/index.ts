import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CheckoutPayload {
  storefront_id: string;
  product_id: string;
  quantity: number;
  payment_method: "credits" | "stripe";
  is_service?: boolean;
  notes?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
    } = await supabaseClient.auth.getUser(token);
    if (!user) throw new Error("Invalid token");

    const payload: CheckoutPayload = await req.json();
    const {
      storefront_id,
      product_id,
      quantity,
      payment_method,
      is_service,
      notes,
    } = payload;

    if (!storefront_id || !product_id || !quantity) {
      throw new Error("Missing required fields: storefront_id, product_id, quantity");
    }

    // Fetch product details
    const { data: product, error: productErr } = await supabaseClient
      .from("storefront_products")
      .select("id, name, price, cost_basis, storefront_id")
      .eq("id", product_id)
      .eq("storefront_id", storefront_id)
      .single();

    if (productErr || !product) throw new Error("Product not found");

    const unitPrice = Number(product.price);
    const totalPrice = unitPrice * quantity;

    // For services: 50% now, 50% in escrow
    const isServiceOrder = is_service === true;
    const upfrontAmount = isServiceOrder
      ? Math.round(totalPrice * 50) / 100
      : totalPrice;
    const escrowAmount = isServiceOrder ? totalPrice - upfrontAmount : 0;

    if (payment_method === "credits") {
      // Check wallet balance
      const { data: wallet } = await supabaseClient
        .from("credit_wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      const balance = wallet?.balance ?? 0;
      if (balance < upfrontAmount) {
        throw new Error(
          `Insufficient credits. Need ${upfrontAmount}, have ${balance}.`
        );
      }

      // Deduct from buyer
      await supabaseClient.rpc("decrement_credit_balance" as never, {
        p_user_id: user.id,
        p_amount: upfrontAmount,
      });

      // Record buyer transaction
      await supabaseClient.from("credit_transactions").insert({
        user_id: user.id,
        amount: -upfrontAmount,
        type: "purchase",
        description: `Order: ${product.name} x${quantity} from storefront`,
        reference_id: storefront_id,
      });

      // Credit the storefront owner (83.3%)
      const { data: storefront } = await supabaseClient
        .from("storefronts")
        .select("owner_user_id")
        .eq("id", storefront_id)
        .single();

      if (storefront?.owner_user_id) {
        const creatorShare = Math.round(upfrontAmount * 833) / 1000;
        await supabaseClient.rpc("increment_credit_balance" as never, {
          p_user_id: storefront.owner_user_id,
          p_amount: creatorShare,
        });
        await supabaseClient.from("credit_transactions").insert({
          user_id: storefront.owner_user_id,
          amount: creatorShare,
          type: "sale",
          description: `Sale: ${product.name} x${quantity} (83.3% of ${upfrontAmount})`,
          reference_id: storefront_id,
        });
      }

      // Create order
      const { data: order, error: orderErr } = await supabaseClient
        .from("storefront_orders")
        .insert({
          storefront_id,
          product_id,
          buyer_user_id: user.id,
          quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          payment_method: "credits",
          status: isServiceOrder ? "pending" : "confirmed",
          escrow_status: isServiceOrder ? "held" : "none",
          escrow_amount: escrowAmount > 0 ? escrowAmount : null,
          notes: notes || null,
        })
        .select("id")
        .single();

      if (orderErr) throw new Error("Failed to create order: " + orderErr.message);

      // Update product order count toward threshold
      await supabaseClient.rpc("increment_order_count" as never, {
        p_product_id: product_id,
        p_quantity: quantity,
      });

      return new Response(
        JSON.stringify({
          success: true,
          order_id: order!.id,
          payment_method: "credits",
          amount_paid: upfrontAmount,
          escrow_held: escrowAmount,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stripe checkout
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    if (!stripeKey) throw new Error("Stripe not configured");

    const origin = req.headers.get("origin") || "https://lianabanyan.com";

    // Create order first with pending status
    const { data: order, error: orderErr } = await supabaseClient
      .from("storefront_orders")
      .insert({
        storefront_id,
        product_id,
        buyer_user_id: user.id,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        payment_method: "cash",
        status: "pending",
        escrow_status: isServiceOrder ? "held" : "none",
        escrow_amount: escrowAmount > 0 ? escrowAmount : null,
        notes: notes || null,
      })
      .select("id")
      .single();

    if (orderErr || !order) throw new Error("Failed to create order");

    // Build Stripe session
    const params = new URLSearchParams();
    params.set("customer_email", user.email || "");
    params.set("mode", "payment");
    params.set(
      "success_url",
      `${origin}/storefront/${storefront_id}?order=${order.id}&success=1`
    );
    params.set("cancel_url", `${origin}/storefront/${storefront_id}`);
    params.set("metadata[order_id]", order.id);
    params.set("metadata[payment_type]", "storefront_order");
    params.set("metadata[storefront_id]", storefront_id);

    if (isServiceOrder) {
      // Charge only the upfront portion
      params.set("line_items[0][price_data][currency]", "usd");
      params.set(
        "line_items[0][price_data][unit_amount]",
        String(Math.round(upfrontAmount * 100))
      );
      params.set(
        "line_items[0][price_data][product_data][name]",
        `${product.name} (50% upfront)`
      );
      params.set("line_items[0][quantity]", "1");
    } else {
      params.set("line_items[0][price_data][currency]", "usd");
      params.set(
        "line_items[0][price_data][unit_amount]",
        String(Math.round(unitPrice * 100))
      );
      params.set(
        "line_items[0][price_data][product_data][name]",
        product.name
      );
      params.set("line_items[0][quantity]", String(quantity));
    }

    const stripeRes = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(stripeKey + ":")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      }
    );

    const session = await stripeRes.json();
    if (!stripeRes.ok)
      throw new Error(session?.error?.message || "Stripe error");

    await supabaseClient
      .from("storefront_orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        checkout_url: session.url,
        payment_method: "stripe",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[Storefront Checkout]", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
