import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  item_id: string;
  item_name: string;
  price: number;
  qty: number;
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
    const {
      storefront_id,
      storefront_name,
      customer_email,
      customer_name,
      items,
      delivery_fee,
      subtotal,
      total,
      delivery_date,
    } = await req.json() as {
      storefront_id: string;
      storefront_name: string;
      customer_email: string;
      customer_name: string;
      items: OrderItem[];
      delivery_fee: number;
      subtotal: number;
      total: number;
      delivery_date: string;
    };

    if (!customer_email || !items?.length || !storefront_id) {
      throw new Error("Missing required fields");
    }

    // Try to get authenticated user (optional — guest checkout allowed)
    let customerId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      customerId = data.user?.id || null;
    }

    // Insert order with pending status
    const { data: order, error: orderErr } = await supabaseClient
      .from("menu_orders")
      .insert({
        storefront_id,
        customer_id: customerId,
        customer_email,
        customer_name: customer_name || null,
        items: JSON.stringify(items),
        delivery_fee,
        subtotal,
        total,
        delivery_date,
        stripe_payment_status: "pending",
        delivery_status: "pending",
      })
      .select("id")
      .single();

    if (orderErr || !order) throw new Error("Failed to create order");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const origin = req.headers.get("origin") || "https://lianabanyan.com";

    // Build Stripe line items from order items
    const params = new URLSearchParams();
    params.set("customer_email", customer_email);
    params.set("mode", "payment");
    params.set("success_url", `${origin}/order-confirmed/${order.id}?session_id={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url", `${origin}/menu/${storefront_id}`);
    params.set("metadata[order_id]", order.id);
    params.set("metadata[payment_type]", "menu_order");
    params.set("metadata[storefront_id]", storefront_id);

    items.forEach((item, i) => {
      params.set(`line_items[${i}][price_data][currency]`, "usd");
      params.set(`line_items[${i}][price_data][unit_amount]`, String(Math.round(item.price * 100)));
      params.set(`line_items[${i}][price_data][product_data][name]`, item.item_name);
      params.set(`line_items[${i}][quantity]`, String(item.qty));
    });

    // Add delivery fee as a line item
    if (delivery_fee > 0) {
      const idx = items.length;
      params.set(`line_items[${idx}][price_data][currency]`, "usd");
      params.set(`line_items[${idx}][price_data][unit_amount]`, String(Math.round(delivery_fee * 100)));
      params.set(`line_items[${idx}][price_data][product_data][name]`, `Delivery – ${storefront_name}`);
      params.set(`line_items[${idx}][quantity]`, "1");
    }

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(stripeKey + ":")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const session = await stripeRes.json();
    if (!stripeRes.ok) throw new Error(session?.error?.message || "Stripe error");

    // Update order with Stripe session ID
    await supabaseClient
      .from("menu_orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    console.log(`[Menu Checkout] Order ${order.id} → Stripe session ${session.id}`);

    return new Response(JSON.stringify({ url: session.url, order_id: order.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[Menu Checkout] Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
