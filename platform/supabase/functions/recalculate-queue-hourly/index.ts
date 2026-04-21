import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🕐 Hourly queue recalculation started');

    // Check if we're within 9am-9pm operating hours (server timezone)
    const currentHour = new Date().getHours();
    if (currentHour < 9 || currentHour >= 21) {
      console.log(`⏸️ Outside operating hours (current: ${currentHour}:00). Skipping recalculation.`);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Outside operating hours (9am-9pm)',
          current_hour: currentHour
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get previous queue state for notification comparison
    const { data: previousQueue } = await supabase
      .from('production_value_ratings')
      .select('product_id, queue_position')
      .order('queue_position', { ascending: true });

    const previousPositions = new Map(
      previousQueue?.map(r => [r.product_id, r.queue_position]) || []
    );

    // Call the calculate-value-ratings function
    const { data, error } = await supabase.functions.invoke('calculate-value-ratings');

    if (error) {
      console.error('❌ Error calculating ratings:', error);
      throw error;
    }

    console.log(`✅ Recalculated ${data.ratings_calculated} product ratings`);

    // Get updated queue state
    const { data: updatedQueue } = await supabase
      .from('production_value_ratings')
      .select(`
        product_id,
        queue_position,
        products (
          name,
          product_sku
        )
      `)
      .order('queue_position', { ascending: true });

    // Find products that jumped up significantly (5+ positions)
    const notifications: any[] = [];

    for (const current of updatedQueue || []) {
      const previousPos = previousPositions.get(current.product_id);

      if (previousPos && previousPos > current.queue_position) {
        const jump = previousPos - current.queue_position;

        // Only notify for jumps of 5+ positions
        if (jump >= 5) {
          const product = Array.isArray(current.products) ? current.products[0] : current.products;
          notifications.push({
            product_id: current.product_id,
            product_name: product?.name || 'Unknown Product',
            product_sku: product?.product_sku || 'UNKNOWN',
            old_position: previousPos,
            new_position: current.queue_position,
            position_jump: jump
          });
        }
      }
    }

    // Get users who backed these products and have notifications enabled
    if (notifications.length > 0) {
      const productIds = notifications.map(n => n.product_id);

      const { data: usersToNotify } = await supabase
        .from('user_votes')
        .select(`
          user_id,
          production_levels (
            product_id
          )
        `)
        .in('production_levels.product_id', productIds);

      // Get user preferences
      const userIds = [...new Set(usersToNotify?.map(u => u.user_id) || [])];
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('user_id, queue_position_notifications')
        .in('user_id', userIds)
        .eq('queue_position_notifications', true);

      const notificationUserIds = new Set(preferences?.map(p => p.user_id) || []);

      console.log(`📬 ${notifications.length} products jumped queue, notifying ${notificationUserIds.size} users`);

      // Log notifications (you can implement actual notification sending here)
      for (const notif of notifications) {
        console.log(`  📈 ${notif.product_name}: #${notif.old_position} → #${notif.new_position} (+${notif.position_jump})`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        hour: currentHour,
        ratings_calculated: data.ratings_calculated,
        notifications: notifications.length,
        top_5_products: data.top_10?.slice(0, 5)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Hourly recalculation error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
