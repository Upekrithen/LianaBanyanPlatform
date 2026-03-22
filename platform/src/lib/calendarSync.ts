/**
 * Calendar Sync — Client-side auto-population of calendar events
 * from storefronts, subscriptions, and delivery routes.
 *
 * Phase 1: runs when Calendar page loads; checks for missing auto-events.
 * Phase 2: edge function triggered by storefront/order changes.
 */

import { supabase } from '@/integrations/supabase/client';
import type { CalendarType } from './calendarService';

interface Storefront {
  id: string;
  business_name: string;
  slug: string;
  order_cutoff_hour?: number;
  delivery_start_hour?: number;
  delivery_end_hour?: number;
}

export async function syncStorefrontEvents(userId: string): Promise<number> {
  const { data: storefronts } = await supabase
    .from('storefronts' as never)
    .select('id, business_name, slug, order_cutoff_hour, delivery_start_hour, delivery_end_hour')
    .eq('owner_id', userId)
    .eq('is_active', true) as { data: Storefront[] | null };

  if (!storefronts || storefronts.length === 0) return 0;

  const { data: existing } = await supabase
    .from('calendar_events' as never)
    .select('source_id, source_type')
    .eq('owner_id', userId)
    .eq('calendar_type', 'business')
    .in('source_type', ['order_cutoff', 'delivery_window']) as {
    data: { source_id: string; source_type: string }[] | null;
  };

  const existingSet = new Set(
    (existing || []).map(e => `${e.source_id}:${e.source_type}`)
  );

  const toInsert: any[] = [];

  for (const sf of storefronts) {
    if (sf.order_cutoff_hour != null && !existingSet.has(`${sf.id}:order_cutoff`)) {
      const cutoffTime = new Date();
      cutoffTime.setHours(sf.order_cutoff_hour, 0, 0, 0);
      toInsert.push({
        owner_id: userId,
        calendar_type: 'business',
        title: `Order Cutoff — ${sf.business_name}`,
        start_time: cutoffTime.toISOString(),
        all_day: false,
        color: '#ef4444',
        source_type: 'order_cutoff',
        source_id: sf.id,
        recurrence_rule: 'FREQ=DAILY',
        metadata: { storefront_slug: sf.slug },
      });
    }

    if (
      sf.delivery_start_hour != null &&
      sf.delivery_end_hour != null &&
      !existingSet.has(`${sf.id}:delivery_window`)
    ) {
      const startTime = new Date();
      startTime.setHours(sf.delivery_start_hour, 0, 0, 0);
      const endTime = new Date();
      endTime.setHours(sf.delivery_end_hour, 0, 0, 0);
      toInsert.push({
        owner_id: userId,
        calendar_type: 'business',
        title: `Delivery Window — ${sf.business_name}`,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        all_day: false,
        color: '#06b6d4',
        source_type: 'delivery_window',
        source_id: sf.id,
        recurrence_rule: 'FREQ=DAILY',
        metadata: { storefront_slug: sf.slug },
      });
    }
  }

  if (toInsert.length === 0) return 0;

  const { error } = await supabase
    .from('calendar_events' as never)
    .insert(toInsert);

  if (error) {
    console.error('Calendar sync error:', error);
    return 0;
  }

  return toInsert.length;
}

export async function syncDeliveryRouteEvents(userId: string): Promise<number> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const { data: orders } = await supabase
    .from('menu_orders' as never)
    .select('id, storefront_id, delivery_date, delivery_time_slot, customer_name')
    .eq('runner_id', userId)
    .eq('delivery_date', tomorrowStr)
    .eq('stripe_payment_status', 'paid') as {
    data: {
      id: string;
      storefront_id: string;
      delivery_date: string;
      delivery_time_slot: string | null;
      customer_name: string | null;
    }[] | null;
  };

  if (!orders || orders.length === 0) return 0;

  const { data: existing } = await supabase
    .from('calendar_events' as never)
    .select('source_id')
    .eq('owner_id', userId)
    .eq('source_type', 'delivery_window')
    .eq('calendar_type', 'route') as { data: { source_id: string }[] | null };

  const existingIds = new Set((existing || []).map(e => e.source_id));
  const toInsert: any[] = [];

  for (const order of orders) {
    if (existingIds.has(order.id)) continue;

    const startTime = new Date(`${order.delivery_date}T10:00:00`);
    toInsert.push({
      owner_id: userId,
      calendar_type: 'route' as CalendarType,
      title: `Delivery: ${order.customer_name || 'Customer'}`,
      start_time: startTime.toISOString(),
      all_day: false,
      color: '#06b6d4',
      source_type: 'delivery_window',
      source_id: order.id,
      metadata: { order_id: order.id, storefront_id: order.storefront_id },
    });
  }

  if (toInsert.length === 0) return 0;

  const { error } = await supabase
    .from('calendar_events' as never)
    .insert(toInsert);

  return error ? 0 : toInsert.length;
}

export async function runCalendarSync(userId: string): Promise<{ storefrontEvents: number; routeEvents: number }> {
  const [storefrontEvents, routeEvents] = await Promise.all([
    syncStorefrontEvents(userId),
    syncDeliveryRouteEvents(userId),
  ]);
  return { storefrontEvents, routeEvents };
}
