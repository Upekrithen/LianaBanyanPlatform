/**
 * calendar-sync-commerce — Creates calendar events from commerce activity.
 * Called internally from stripe-webhook and distribute-order-earnings
 * using the x-system-key auth pattern.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-system-key",
};

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);
const SYSTEM_KEY = Deno.env.get("LB_SYSTEM_KEY") || "";

type EventType = "order_placed" | "order_paid" | "delivery_scheduled" | "earnings_distributed";

interface CalendarSyncPayload {
  event_type: EventType;
  user_id: string;
  metadata: Record<string, unknown>;
}

async function createCalendarEvent(
  ownerId: string,
  calendarType: string,
  title: string,
  sourceType: string,
  sourceId: string,
  color: string,
  metadata: Record<string, unknown>,
  startTime?: string,
  endTime?: string | null,
) {
  const now = new Date().toISOString();

  // Dedup: skip if an event with this source_type + source_id already exists
  const { data: existing } = await supabaseAdmin
    .from("calendar_events")
    .select("id")
    .eq("owner_id", ownerId)
    .eq("source_type", sourceType)
    .eq("source_id", sourceId)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabaseAdmin
    .from("calendar_events")
    .insert({
      owner_id: ownerId,
      calendar_type: calendarType,
      title,
      start_time: startTime ?? now,
      end_time: endTime ?? null,
      all_day: false,
      color,
      source_type: sourceType,
      source_id: sourceId,
      is_private: false,
      metadata,
    })
    .select("id")
    .single();

  if (error) console.error("[calendar-sync-commerce] insert error:", error);
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const headerKey = req.headers.get("x-system-key");
  if (!SYSTEM_KEY || !headerKey || headerKey !== SYSTEM_KEY) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const payload: CalendarSyncPayload = await req.json();
  const { event_type, user_id, metadata } = payload;

  if (!event_type || !user_id) {
    return new Response(JSON.stringify({ error: "Missing event_type or user_id" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results: unknown[] = [];

  switch (event_type) {
    case "order_placed": {
      const storefrontName = (metadata.storefront_name as string) || "Storefront";
      const itemCount = (metadata.item_count as number) || 0;
      const runnerId = (metadata.runner_id as string) || user_id;
      const orderId = metadata.order_id as string;
      const deliveryWindowStart = metadata.delivery_window_start as string | undefined;

      const evt = await createCalendarEvent(
        runnerId,
        "route",
        `Delivery: ${storefrontName} — ${itemCount} item${itemCount !== 1 ? "s" : ""}`,
        "order_placed",
        orderId,
        "#eab308",
        metadata,
        deliveryWindowStart,
      );
      results.push(evt);
      break;
    }

    case "order_paid": {
      const orderId = metadata.order_id as string;
      const total = metadata.total as number;
      const storefrontOwnerId = (metadata.storefront_owner_id as string) || user_id;

      const evt = await createCalendarEvent(
        storefrontOwnerId,
        "business",
        `Payment received: $${(total ?? 0).toFixed(2)} from order`,
        "order_paid",
        orderId,
        "#22c55e",
        metadata,
      );
      results.push(evt);
      break;
    }

    case "delivery_scheduled": {
      const orderId = metadata.order_id as string;
      const deliveryDate = metadata.delivery_date as string;

      const evt = await createCalendarEvent(
        user_id,
        "route",
        `Delivery scheduled: ${deliveryDate}`,
        "delivery_scheduled",
        orderId,
        "#06b6d4",
        metadata,
        deliveryDate ? `${deliveryDate}T10:00:00Z` : undefined,
      );
      results.push(evt);
      break;
    }

    case "earnings_distributed": {
      const orderId = metadata.order_id as string;
      const creatorAmount = metadata.creator_amount as number | undefined;
      const onboarderAmount = metadata.onboarder_amount as number | undefined;
      const stewardAmount = metadata.steward_amount as number | undefined;

      const parts: string[] = [];
      if (creatorAmount) parts.push(`Creator $${(creatorAmount / 100).toFixed(2)}`);
      if (onboarderAmount) parts.push(`Onboarder $${(onboarderAmount / 100).toFixed(2)}`);
      if (stewardAmount) parts.push(`Steward $${(stewardAmount / 100).toFixed(2)}`);

      const evt = await createCalendarEvent(
        user_id,
        "business",
        `Earnings split: ${parts.join(", ")}`,
        "earnings_distributed",
        orderId,
        "#f97316",
        metadata,
      );
      results.push(evt);
      break;
    }

    default:
      console.log(`[calendar-sync-commerce] Unknown event_type: ${event_type}`);
  }

  console.log(`[calendar-sync-commerce] ${event_type} for user ${user_id}: ${results.length} event(s)`);

  return new Response(
    JSON.stringify({ ok: true, events: results }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
