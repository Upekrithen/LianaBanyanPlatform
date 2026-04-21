/**
 * Demand Aggregation Service
 * ==========================
 * Auto-propagates demand from meal orders to ingredient requirements,
 * aggregates across micro-local areas, and creates delivery jobs.
 *
 * Flow:
 * 1. Meal order → auto-generates ingredient demand entries (via DB trigger)
 * 2. Demand aggregates by ingredient + area + time window
 * 3. When threshold hit → grocery delivery job created
 * 4. Participants notified: accept/self-fulfill/defer
 */

import { supabase } from '@/integrations/supabase/client';

export interface IngredientDemandEntry {
  id: string;
  source_type: 'meal_order' | 'family_plan' | 'manual' | 'recipe_use';
  meal_order_id?: string;
  recipe_id?: string;
  portfolio_recipe_id?: string;
  user_id: string;
  ingredient_name: string;
  ingredient_normalized: string;
  quantity: number;
  unit: string;
  category?: string;
  micro_local_area_id?: string;
  zip_code?: string;
  needed_by: string;
  flexibility_days: number;
  aggregation_window_id?: string;
  aggregation_status: 'pending' | 'aggregated' | 'self_fulfilled' | 'delivered' | 'cancelled';
  organic_required: boolean;
  substitution_allowed: boolean;
  created_at: string;
}

export interface AggregationWindow {
  id: string;
  micro_local_area_id?: string;
  zip_code?: string;
  area_name?: string;
  window_opens: string;
  window_closes: string;
  target_delivery_date: string;
  delivery_window_start?: string;
  delivery_window_end?: string;
  participant_count: number;
  total_items: number;
  total_estimated_value: number;
  unique_ingredients: number;
  min_participants: number;
  min_value: number;
  status: 'collecting' | 'threshold_met' | 'job_created' | 'in_progress' | 'completed' | 'cancelled';
  threshold_met_at?: string;
  delivery_job_id?: string;
  volume_discount_percent: number;
}

export interface AggregationParticipant {
  id: string;
  aggregation_window_id: string;
  user_id: string;
  item_count: number;
  estimated_value: number;
  status: 'auto_included' | 'opted_in' | 'opted_out' | 'self_fulfilling' | 'delivered' | 'cancelled';
  payment_authorized: boolean;
  share_of_delivery_fee?: number;
  total_charge?: number;
  notified_of_aggregation: boolean;
  response_deadline?: string;
}

export interface AggregatedShoppingItem {
  id: string;
  aggregation_window_id: string;
  ingredient_normalized: string;
  display_name: string;
  category?: string;
  total_quantity: number;
  unit: string;
  requesting_users: number;
  estimated_total_price?: number;
  actual_total_price?: number;
  status: 'needed' | 'purchased' | 'substituted' | 'unavailable' | 'partial';
}

// Thresholds for aggregation
export const AGGREGATION_THRESHOLDS = {
  minParticipants: 2,
  minValue: 25.00,
  maxParticipants: 20,
  maxValue: 500.00,
};

// Volume discount tiers for aggregated orders
export const AGGREGATION_DISCOUNTS = [
  { minValue: 200, discount: 15 },
  { minValue: 100, discount: 10 },
  { minValue: 50, discount: 5 },
];

/**
 * Normalize ingredient name for matching
 */
export function normalizeIngredient(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Get user's pending demand entries
 */
export async function getMyPendingDemand(): Promise<IngredientDemandEntry[]> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];

    const { data, error } = await supabase
      .from('ingredient_demand_entries')
      .select('*')
      .eq('user_id', userData.user.id)
      .in('aggregation_status', ['pending', 'aggregated'])
      .order('needed_by', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching pending demand:', error);
    return [];
  }
}

/**
 * Get aggregation windows user is participating in
 */
export async function getMyAggregationWindows(): Promise<{
  window: AggregationWindow;
  participation: AggregationParticipant;
}[]> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];

    // In production, join these tables
    const { data: participants, error: partError } = await supabase
      .from('aggregation_participants')
      .select('*')
      .eq('user_id', userData.user.id)
      .neq('status', 'cancelled');

    if (partError || !participants) return [];

    const windowIds = participants.map(p => p.aggregation_window_id);

    const { data: windows, error: winError } = await supabase
      .from('demand_aggregation_windows')
      .select('*')
      .in('id', windowIds);

    if (winError || !windows) return [];

    return participants.map(p => ({
      window: windows.find(w => w.id === p.aggregation_window_id)!,
      participation: p,
    })).filter(x => x.window);
  } catch (error) {
    console.error('Error fetching aggregation windows:', error);
    return [];
  }
}

/**
 * Get aggregated shopping list for a window
 */
export async function getAggregatedShoppingList(
  windowId: string
): Promise<AggregatedShoppingItem[]> {
  try {
    const { data, error } = await supabase
      .from('aggregated_shopping_list')
      .select('*')
      .eq('aggregation_window_id', windowId)
      .order('category', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    return [];
  }
}

/**
 * Manually add an ingredient to demand
 */
export async function addManualDemand(
  ingredient: {
    name: string;
    quantity: number;
    unit: string;
    category?: string;
    neededBy: string;
    zipCode?: string;
  }
): Promise<{ success: boolean; demandId?: string; error?: string }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('ingredient_demand_entries')
      .insert({
        source_type: 'manual',
        user_id: userData.user.id,
        ingredient_name: ingredient.name,
        ingredient_normalized: normalizeIngredient(ingredient.name),
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: ingredient.category,
        needed_by: ingredient.neededBy,
        zip_code: ingredient.zipCode,
        aggregation_status: 'pending',
      })
      .select('id')
      .single();

    if (error) throw error;

    // Trigger window assignment (would be done by background job in production)
    // await assignDemandToWindow(data.id);

    return { success: true, demandId: data.id };
  } catch (error: any) {
    console.error('Error adding manual demand:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Opt out of an aggregation window to self-fulfill
 */
export async function optOutOfAggregation(
  windowId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { success: false, error: 'Not authenticated' };

    // Call the database function
    const { error } = await supabase.rpc('opt_out_of_aggregation', {
      p_user_id: userData.user.id,
      p_window_id: windowId,
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error opting out:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Explicitly opt into an aggregation window
 */
export async function optInToAggregation(
  windowId: string,
  deliveryAddress: string,
  instructions?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('aggregation_participants')
      .update({
        status: 'opted_in',
        delivery_address: deliveryAddress,
        delivery_instructions: instructions,
        responded_at: new Date().toISOString(),
      })
      .eq('aggregation_window_id', windowId)
      .eq('user_id', userData.user.id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error opting in:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get open aggregation windows in user's area
 */
export async function getOpenWindowsInArea(
  zipCode: string
): Promise<AggregationWindow[]> {
  try {
    const { data, error } = await supabase
      .from('demand_aggregation_windows')
      .select('*')
      .eq('zip_code', zipCode)
      .eq('status', 'collecting')
      .gt('window_closes', new Date().toISOString())
      .order('target_delivery_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching open windows:', error);
    return [];
  }
}

/**
 * Calculate volume discount for an aggregation
 */
export function calculateAggregationDiscount(totalValue: number): number {
  for (const tier of AGGREGATION_DISCOUNTS) {
    if (totalValue >= tier.minValue) {
      return tier.discount;
    }
  }
  return 0;
}

/**
 * Format aggregation status for display
 */
export function formatAggregationStatus(status: AggregationWindow['status']): {
  label: string;
  color: string;
  description: string;
} {
  switch (status) {
    case 'collecting':
      return {
        label: 'Collecting Orders',
        color: 'blue',
        description: 'Gathering orders from your area',
      };
    case 'threshold_met':
      return {
        label: 'Ready for Delivery',
        color: 'amber',
        description: 'Enough orders to proceed - delivery job being created',
      };
    case 'job_created':
      return {
        label: 'Awaiting Worker',
        color: 'purple',
        description: 'Delivery job posted, waiting for someone to accept',
      };
    case 'in_progress':
      return {
        label: 'Shopping In Progress',
        color: 'emerald',
        description: 'Worker is shopping for your order',
      };
    case 'completed':
      return {
        label: 'Delivered',
        color: 'green',
        description: 'Order has been delivered',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        color: 'red',
        description: 'This aggregation was cancelled',
      };
  }
}

/**
 * Get progress towards threshold
 */
export function getThresholdProgress(window: AggregationWindow): {
  participantProgress: number;
  valueProgress: number;
  overallProgress: number;
  thresholdMet: boolean;
  neededParticipants: number;
  neededValue: number;
} {
  const participantProgress = Math.min(100, (window.participant_count / window.min_participants) * 100);
  const valueProgress = Math.min(100, (window.total_estimated_value / window.min_value) * 100);
  const overallProgress = Math.min(participantProgress, valueProgress);

  const thresholdMet =
    window.participant_count >= window.min_participants &&
    window.total_estimated_value >= window.min_value;

  return {
    participantProgress,
    valueProgress,
    overallProgress,
    thresholdMet,
    neededParticipants: Math.max(0, window.min_participants - window.participant_count),
    neededValue: Math.max(0, window.min_value - window.total_estimated_value),
  };
}

/**
 * Get time remaining in collection window
 */
export function getTimeRemaining(windowCloses: string): {
  hours: number;
  minutes: number;
  expired: boolean;
  formatted: string;
} {
  const closes = new Date(windowCloses);
  const now = new Date();
  const diffMs = closes.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { hours: 0, minutes: 0, expired: true, formatted: 'Closed' };
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let formatted: string;
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    formatted = `${days} day${days > 1 ? 's' : ''} left`;
  } else if (hours > 0) {
    formatted = `${hours}h ${minutes}m left`;
  } else {
    formatted = `${minutes} minutes left`;
  }

  return { hours, minutes, expired: false, formatted };
}
