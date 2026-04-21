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

    console.log('Starting value rating calculation...');

    // Get all products with their production data
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        product_sku,
        created_at,
        production_levels(
          id,
          current_votes,
          votes_needed,
          units_count
        )
      `);

    if (productsError) throw productsError;

    // Get ghost data (industry pricing as demand indicator)
    const { data: ghostData } = await supabase
      .from('industry_pricing_data')
      .select('product_id, units_in_run');

    // Get machine availability
    const { data: machines } = await supabase
      .from('machine_schedules')
      .select('*')
      .eq('is_reserved', false);

    // Get existing value ratings to check production history
    const { data: existingRatings } = await supabase
      .from('production_value_ratings')
      .select('product_id, never_produced, days_since_last_production');

    const availableMachineSlots = machines?.length || 0;

    const ratings: any[] = [];

    for (const product of products || []) {
      // Calculate preorder count (total votes across all levels)
      const preorderCount = product.production_levels?.reduce(
        (sum: number, level: any) => sum + (level.current_votes || 0),
        0
      ) || 0;

      // Get ghost data weight
      const ghost = ghostData?.find(g => g.product_id === product.id);
      const ghostWeight = ghost ? Math.log10(ghost.units_in_run + 1) : 0;

      // Check production history
      const existing = existingRatings?.find(r => r.product_id === product.id);
      const neverProduced = existing?.never_produced ?? true;
      const daysSinceLast = existing?.days_since_last_production;

      // Calculate priority boost
      let priorityBoost = 1.0;
      if (neverProduced) {
        priorityBoost = 2.0;
      } else if (daysSinceLast && daysSinceLast > 90) {
        priorityBoost = 1.5;
      }

      // Node availability score (0-1)
      const nodeAvailabilityScore = Math.min(1.0, availableMachineSlots / 10);

      // Demand factor (logarithmic scale for preorders + ghost data)
      // This makes 5k medallions worth more than 500k widgets
      const demandFactor = Math.log10(preorderCount + 1) + ghostWeight;

      // Cycle fit score (simplified - can be enhanced)
      const cycleFitScore = 0.5; // Placeholder for schedule matching logic

      // Calculate final value score
      const valueScore = (
        nodeAvailabilityScore * 10 +
        priorityBoost * 20 +
        demandFactor * 15 +
        cycleFitScore * 5
      );

      ratings.push({
        product_id: product.id,
        value_score: valueScore,
        node_availability_score: nodeAvailabilityScore,
        priority_boost: priorityBoost,
        demand_factor: demandFactor,
        cycle_fit_score: cycleFitScore,
        ghost_data_weight: ghostWeight,
        preorder_count: preorderCount,
        never_produced: neverProduced,
        days_since_last_production: daysSinceLast,
        calculation_details: {
          available_machine_slots: availableMachineSlots,
          ghost_units: ghost?.units_in_run || 0,
          breakdown: {
            node_score_contribution: nodeAvailabilityScore * 10,
            priority_contribution: priorityBoost * 20,
            demand_contribution: demandFactor * 15,
            cycle_fit_contribution: cycleFitScore * 5
          }
        }
      });
    }

    // Sort by value score and assign queue positions
    ratings.sort((a, b) => b.value_score - a.value_score);
    ratings.forEach((rating, index) => {
      rating.queue_position = index + 1;
    });

    // Upsert all ratings
    const { error: upsertError } = await supabase
      .from('production_value_ratings')
      .upsert(ratings, { onConflict: 'product_id' });

    if (upsertError) throw upsertError;

    console.log(`Successfully calculated ${ratings.length} value ratings`);

    return new Response(
      JSON.stringify({
        success: true,
        ratings_calculated: ratings.length,
        top_10: ratings.slice(0, 10)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error calculating value ratings:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
