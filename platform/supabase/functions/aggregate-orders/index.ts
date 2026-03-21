/**
 * AGGREGATE-ORDERS — Groups pending orders by storefront and notifies providers
 * ===============================================================================
 * Triggered by cron (daily at cutoff) or manually for testing.
 *
 * Flow:
 * 1. Query all menu_orders with delivery_date = target_date and delivery_status = 'pending'
 * 2. Group by storefront_id
 * 3. Build itemized summary per storefront
 * 4. Send consolidated email to storefront owner via Resend
 * 5. Update orders to delivery_status = 'aggregated'
 *
 * SEC-safe: No investment language.
 * Innovation: Commerce Engine Order Aggregation
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderRow {
  id: string;
  storefront_id: string;
  customer_email: string;
  customer_name: string | null;
  items: string;
  delivery_fee: number;
  subtotal: number;
  total: number;
  delivery_date: string;
}

interface StorefrontInfo {
  id: string;
  name: string;
  user_id: string;
  business_location: string | null;
  delivery_window_start: string;
  delivery_window_end: string;
}

interface ParsedItem {
  item_name: string;
  qty: number;
  price: number;
}

function formatTime(t: string | null): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}

function buildProviderEmailHtml(
  storefrontName: string,
  location: string | null,
  deliveryDate: string,
  deliveryWindow: string,
  orders: OrderRow[],
  consolidatedItems: Map<string, { name: string; qty: number; unitPrice: number }>,
  grandTotal: number
): string {
  const itemRows = Array.from(consolidatedItems.values())
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${item.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:600;">${item.qty}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">$${item.unitPrice.toFixed(2)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">$${(item.unitPrice * item.qty).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const orderList = orders
    .map(
      (o) =>
        `<li style="margin-bottom:4px;">${o.customer_name || o.customer_email} — $${o.total.toFixed(2)}</li>`
    )
    .join("");

  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#1a1a1a;">
      <div style="margin-bottom:24px;">
        <h1 style="font-size:24px;font-weight:bold;margin:0;">Liana Banyan</h1>
        <p style="color:#666;font-size:14px;margin:4px 0 0;">Order Aggregation</p>
      </div>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin-bottom:24px;">
        <h2 style="font-size:20px;font-weight:600;margin:0 0 8px;">${storefrontName}</h2>
        ${location ? `<p style="color:#666;font-size:14px;margin:0 0 4px;">📍 ${location}</p>` : ""}
        <p style="color:#666;font-size:14px;margin:0;">📅 ${deliveryDate} &nbsp;|&nbsp; 🚚 ${deliveryWindow}</p>
        <p style="font-size:18px;font-weight:700;color:#16a34a;margin:12px 0 0;">${orders.length} order${orders.length === 1 ? "" : "s"} — $${grandTotal.toFixed(2)} total</p>
      </div>

      <h3 style="font-size:16px;margin-bottom:8px;">Consolidated Item List</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #d1d5db;">Item</th>
            <th style="padding:8px 12px;text-align:center;border-bottom:2px solid #d1d5db;">Qty</th>
            <th style="padding:8px 12px;text-align:right;border-bottom:2px solid #d1d5db;">Unit</th>
            <th style="padding:8px 12px;text-align:right;border-bottom:2px solid #d1d5db;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <h3 style="font-size:16px;margin-bottom:8px;">Individual Orders (${orders.length})</h3>
      <ul style="font-size:14px;padding-left:20px;margin-bottom:24px;">${orderList}</ul>

      <div style="border-top:1px solid #e5e7eb;margin-top:32px;padding-top:16px;">
        <p style="color:#999;font-size:11px;line-height:1.5;">
          LIANA BANYAN CORPORATION — Wyoming C-Corp<br>
          Creators keep 83.3%. Cost + 20% locked forever.
        </p>
      </div>
    </div>
  `;
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
    const body = await req.json().catch(() => ({}));

    // Target date defaults to tomorrow
    const targetDate =
      body.delivery_date ||
      new Date(Date.now() + 86400000).toISOString().split("T")[0];

    console.log(`[Aggregate Orders] Processing delivery_date=${targetDate}`);

    // 1. Fetch all pending orders for the target date
    const { data: orders, error: ordErr } = await supabaseClient
      .from("menu_orders")
      .select("id, storefront_id, customer_email, customer_name, items, delivery_fee, subtotal, total, delivery_date")
      .eq("delivery_date", targetDate)
      .eq("delivery_status", "pending")
      .eq("stripe_payment_status", "paid");

    if (ordErr) throw new Error(`Failed to fetch orders: ${ordErr.message}`);
    if (!orders || orders.length === 0) {
      console.log("[Aggregate Orders] No pending paid orders for", targetDate);
      return new Response(
        JSON.stringify({ message: "No orders to aggregate", delivery_date: targetDate }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Group orders by storefront
    const grouped = new Map<string, OrderRow[]>();
    for (const order of orders as OrderRow[]) {
      const list = grouped.get(order.storefront_id) || [];
      list.push(order);
      grouped.set(order.storefront_id, list);
    }

    console.log(`[Aggregate Orders] ${orders.length} orders across ${grouped.size} storefront(s)`);

    // 3. For each storefront, build consolidated list and send email
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const results: { storefront_id: string; storefront_name: string; order_count: number; email_sent: boolean }[] = [];

    for (const [storefrontId, sfOrders] of grouped) {
      // Fetch storefront info + owner email
      const { data: sf } = await supabaseClient
        .from("storefronts")
        .select("id, name, user_id, business_location, delivery_window_start, delivery_window_end")
        .eq("id", storefrontId)
        .single() as { data: StorefrontInfo | null };

      if (!sf) {
        console.warn(`[Aggregate Orders] Storefront ${storefrontId} not found, skipping`);
        continue;
      }

      // Get owner email from auth.users via profiles or direct lookup
      const { data: ownerData } = await supabaseClient.auth.admin.getUserById(sf.user_id);
      const ownerEmail = ownerData?.user?.email;

      // Consolidate items across all orders
      const consolidated = new Map<string, { name: string; qty: number; unitPrice: number }>();
      let grandTotal = 0;

      for (const order of sfOrders) {
        grandTotal += order.total;
        const parsed: ParsedItem[] =
          typeof order.items === "string" ? JSON.parse(order.items) : order.items;
        for (const item of parsed) {
          const key = item.item_name.toLowerCase();
          const existing = consolidated.get(key);
          if (existing) {
            existing.qty += item.qty;
          } else {
            consolidated.set(key, { name: item.item_name, qty: item.qty, unitPrice: item.price });
          }
        }
      }

      const deliveryWindow = `${formatTime(sf.delivery_window_start)}–${formatTime(sf.delivery_window_end)}`;

      // Send email to provider
      let emailSent = false;
      if (resendKey && ownerEmail) {
        try {
          const html = buildProviderEmailHtml(
            sf.name,
            sf.business_location,
            targetDate,
            deliveryWindow,
            sfOrders,
            consolidated,
            grandTotal
          );

          const emailRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Liana Banyan <noreply@lianabanyan.com>",
              to: [ownerEmail],
              subject: `📋 ${sfOrders.length} order${sfOrders.length === 1 ? "" : "s"} for ${sf.name} — ${targetDate}`,
              html,
            }),
          });

          emailSent = emailRes.ok;
          if (!emailRes.ok) {
            console.warn(`[Aggregate Orders] Email failed for ${sf.name}:`, await emailRes.text());
          } else {
            console.log(`[Aggregate Orders] Email sent to ${ownerEmail} for ${sf.name}`);
          }
        } catch (emailErr) {
          console.warn(`[Aggregate Orders] Email error for ${sf.name}:`, emailErr);
        }
      }

      // 4. Update all orders to 'aggregated'
      const orderIds = sfOrders.map((o) => o.id);
      await supabaseClient
        .from("menu_orders")
        .update({ delivery_status: "aggregated" })
        .in("id", orderIds);

      results.push({
        storefront_id: storefrontId,
        storefront_name: sf.name,
        order_count: sfOrders.length,
        email_sent: emailSent,
      });
    }

    console.log(`[Aggregate Orders] Complete:`, JSON.stringify(results));

    return new Response(
      JSON.stringify({
        delivery_date: targetDate,
        storefronts_processed: results.length,
        total_orders: orders.length,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Aggregate Orders] Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
