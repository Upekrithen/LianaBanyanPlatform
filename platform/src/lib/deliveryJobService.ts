/**
 * Delivery Job Service
 * ====================
 * Manages micro-local delivery jobs with:
 * - Job creation from aggregated orders
 * - Worker assignment
 * - Stripe payment authorization and capture
 * - Delivery tracking
 * - Reputation updates
 */

import { supabase } from "@/integrations/supabase/client";

// Types
export interface DeliveryJob {
  id: string;
  micro_local_area: string;
  pickup_location: string;
  pickup_address?: string;
  worker_id?: string;
  delivery_count: number;
  total_items: number;
  total_order_value: number;
  delivery_fee: number;
  tip_amount?: number;
  total_reimbursement: number;
  status: 'posted' | 'accepted' | 'picking_up' | 'in_transit' | 'completed' | 'cancelled';
  posted_at: string;
  completed_at?: string;
}

export interface DeliveryRecipient {
  id: string;
  job_id: string;
  user_id: string;
  delivery_address: string;
  delivery_instructions?: string;
  item_count: number;
  order_amount: number;
  payment_authorized: boolean;
  payment_captured: boolean;
  amount_charged?: number;
  status: 'pending' | 'en_route' | 'arrived' | 'delivered' | 'failed';
  delivered_at?: string;
  recipient_confirmed: boolean;
  rating?: number;
}

export interface MicroLocalArea {
  id: string;
  area_code: string;
  name: string;
  min_orders_for_job: number;
  base_delivery_fee: number;
  volume_discount_tiers: {
    min_orders: number;
    discount_percent: number;
  }[];
}

/**
 * Fetch available delivery jobs for workers
 */
export async function getAvailableJobs(areaCode?: string): Promise<DeliveryJob[]> {
  let query = supabase
    .from('grocery_delivery_jobs')
    .select('*')
    .eq('status', 'posted')
    .order('posted_at', { ascending: false });

  if (areaCode) {
    query = query.eq('micro_local_area', areaCode);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Accept a delivery job
 */
export async function acceptJob(jobId: string, workerId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('accept_delivery_job', {
    p_job_id: jobId,
    p_worker_id: workerId,
  });

  if (error) throw error;
  return data === true;
}

/**
 * Update job status
 */
export async function updateJobStatus(
  jobId: string, 
  status: DeliveryJob['status']
): Promise<void> {
  const updates: Record<string, any> = { status, updated_at: new Date().toISOString() };
  
  if (status === 'picking_up') {
    updates.pickup_started_at = new Date().toISOString();
  } else if (status === 'in_transit') {
    updates.pickup_completed_at = new Date().toISOString();
  } else if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('grocery_delivery_jobs')
    .update(updates)
    .eq('id', jobId);

  if (error) throw error;
}

/**
 * Get recipients for a delivery job
 */
export async function getJobRecipients(jobId: string): Promise<DeliveryRecipient[]> {
  const { data, error } = await supabase
    .from('grocery_delivery_recipients')
    .select('*')
    .eq('job_id', jobId)
    .order('delivery_order');

  if (error) throw error;
  return data || [];
}

/**
 * Mark delivery as complete
 */
export async function completeDelivery(
  recipientId: string, 
  photoUrl?: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('complete_delivery', {
    p_recipient_id: recipientId,
    p_photo_url: photoUrl || null,
  });

  if (error) throw error;
  return data === true;
}

/**
 * Confirm delivery receipt (by recipient)
 */
export async function confirmDeliveryReceipt(
  recipientId: string,
  rating?: number,
  feedback?: string
): Promise<void> {
  const { error } = await supabase
    .from('grocery_delivery_recipients')
    .update({
      recipient_confirmed: true,
      recipient_confirmed_at: new Date().toISOString(),
      rating,
      feedback,
    })
    .eq('id', recipientId);

  if (error) throw error;
}

// ============================================================================
// STRIPE INTEGRATION
// ============================================================================

/**
 * Create payment authorization for a recipient
 * Called when recipient joins an aggregated order
 */
export async function authorizePayment(
  recipientId: string,
  customerId: string,
  paymentMethodId: string,
  amount: number
): Promise<{ paymentIntentId: string; authorized: boolean }> {
  // INFRASTRUCTURE NOTE: Real Stripe integration requires a backend Edge Function
  // to create a PaymentIntent with capture_method: 'manual' (authorize without capturing).
  // Until the Stripe Edge Function exists, we record the intent to pay without a real PI.

  // Record payment intent without a real Stripe PaymentIntent ID
  // The stripe_payment_intent_id is left null until real Stripe integration
  const { error } = await supabase
    .from('grocery_delivery_recipients')
    .update({
      stripe_customer_id: customerId,
      stripe_payment_method_id: paymentMethodId,
      payment_authorized: true,
      payment_authorized_at: new Date().toISOString(),
    })
    .eq('id', recipientId);

  if (error) throw error;

  return {
    paymentIntentId: `pending_${recipientId.slice(0, 8)}`,
    authorized: true,
  };
}

/**
 * Capture payment after delivery confirmation
 * Called when recipient confirms delivery
 */
export async function capturePayment(
  recipientId: string
): Promise<{ captured: boolean; amount: number }> {
  // Get recipient details
  const { data: recipient, error: fetchError } = await supabase
    .from('grocery_delivery_recipients')
    .select('*')
    .eq('id', recipientId)
    .single();

  if (fetchError) throw fetchError;
  if (!recipient) throw new Error('Recipient not found');

  if (!recipient.payment_authorized) {
    throw new Error('Payment not authorized');
  }

  // INFRASTRUCTURE NOTE: Real Stripe capture requires an Edge Function — records intent for now
  // Update recipient
  const { error: updateError } = await supabase
    .from('grocery_delivery_recipients')
    .update({
      payment_captured: true,
      payment_captured_at: new Date().toISOString(),
      amount_charged: recipient.order_amount,
    })
    .eq('id', recipientId);

  if (updateError) throw updateError;

  return {
    captured: true,
    amount: recipient.order_amount,
  };
}

/**
 * Process worker reimbursement after job completion
 */
export async function processWorkerReimbursement(
  jobId: string
): Promise<{ success: boolean; amount: number }> {
  // Get job details
  const { data: job, error: fetchError } = await supabase
    .from('grocery_delivery_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (fetchError) throw fetchError;
  if (!job) throw new Error('Job not found');

  if (job.status !== 'completed') {
    throw new Error('Job not completed');
  }

  const reimbursementAmount = job.total_reimbursement || (job.delivery_fee + (job.tip_amount || 0));

  // In production, this would:
  // 1. Call Stripe to transfer funds to worker's connected account
  // 2. Or create a payout to their bank account
  
  // INFRASTRUCTURE NOTE: Needs real Stripe transfer to worker's connected account or bank payout

  // Update worker stats
  const { error: statsError } = await supabase.rpc('increment_worker_earnings', {
    p_worker_id: job.worker_id,
    p_earnings: reimbursementAmount,
  });

  // Fallback if RPC doesn't exist
  if (statsError && statsError.code === '42883') {
    await supabase
      .from('delivery_worker_stats')
      .upsert({
        user_id: job.worker_id,
        total_earnings: reimbursementAmount,
        total_jobs_completed: 1,
        last_job_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });
  }

  return {
    success: true,
    amount: reimbursementAmount,
  };
}

// ============================================================================
// REPUTATION INTEGRATION
// ============================================================================

/**
 * Update worker reputation after delivery
 */
export async function updateWorkerReputation(
  workerId: string,
  rating: number,
  isPositive: boolean
): Promise<void> {
  // INFRASTRUCTURE NOTE: This function needs to integrate with the reputation_scores system
  // via supabase.rpc('update_reputation', { p_user_id, p_rating, p_is_positive, p_context: 'delivery' })
}

// ============================================================================
// AGGREGATION
// ============================================================================

/**
 * Add shopping list to aggregation window
 */
export async function addToAggregation(
  shoppingListId: string,
  areaCode: string,
  deliveryDate: Date,
  orderValue: number
): Promise<string> {
  // Find or create aggregation window
  const dateStr = deliveryDate.toISOString().split('T')[0];
  
  const { data: existingWindow, error: fetchError } = await supabase
    .from('delivery_aggregation_windows')
    .select('*')
    .eq('micro_local_area_id', areaCode)
    .eq('delivery_date', dateStr)
    .eq('status', 'open')
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  if (existingWindow) {
    // Add to existing window
    const { error: updateError } = await supabase
      .from('delivery_aggregation_windows')
      .update({
        order_count: existingWindow.order_count + 1,
        total_value: existingWindow.total_value + orderValue,
        shopping_list_ids: [...(existingWindow.shopping_list_ids || []), shoppingListId],
      })
      .eq('id', existingWindow.id);

    if (updateError) throw updateError;
    return existingWindow.id;
  } else {
    // Create new window
    const { data: newWindow, error: createError } = await supabase
      .from('delivery_aggregation_windows')
      .insert({
        micro_local_area_id: areaCode,
        delivery_date: dateStr,
        window_start: new Date().toISOString(),
        window_end: new Date(deliveryDate.getTime() - 24 * 60 * 60 * 1000).toISOString(), // Day before
        order_count: 1,
        total_value: orderValue,
        shopping_list_ids: [shoppingListId],
        status: 'open',
      })
      .select()
      .single();

    if (createError) throw createError;
    return newWindow.id;
  }
}

/**
 * Check if aggregation window should trigger job creation
 */
export async function checkAggregationThreshold(windowId: string): Promise<boolean> {
  const { data: window, error: windowError } = await supabase
    .from('delivery_aggregation_windows')
    .select('*, micro_local_areas(*)')
    .eq('id', windowId)
    .single();

  if (windowError) throw windowError;
  if (!window) return false;

  const area = window.micro_local_areas as MicroLocalArea;
  const threshold = area?.min_orders_for_job || 3;

  if (window.order_count >= threshold) {
    // Create job
    const { data: jobId, error: jobError } = await supabase.rpc(
      'create_delivery_job_from_window',
      { p_window_id: windowId }
    );

    if (jobError) throw jobError;
    return true;
  }

  return false;
}

/**
 * Calculate volume discount for an order
 */
export function calculateVolumeDiscount(
  orderCount: number, 
  tiers: { min_orders: number; discount_percent: number }[]
): number {
  let discount = 0;
  
  for (const tier of tiers.sort((a, b) => b.min_orders - a.min_orders)) {
    if (orderCount >= tier.min_orders) {
      discount = tier.discount_percent;
      break;
    }
  }
  
  return discount;
}
