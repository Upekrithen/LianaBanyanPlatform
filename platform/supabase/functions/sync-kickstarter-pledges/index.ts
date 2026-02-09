import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('Starting Kickstarter pledge sync...');

    // Get all unprocessed pledges
    const { data: pledges, error: fetchError } = await supabase
      .from('kickstarter_pledges')
      .select('*')
      .eq('is_processed', false);

    if (fetchError) throw fetchError;

    console.log(`Found ${pledges?.length || 0} unprocessed pledges`);

    let processedCount = 0;
    let errorCount = 0;

    for (const pledge of pledges || []) {
      try {
        // Get or create user
        let userId = pledge.user_id;
        
        if (!userId) {
          // Check if user exists
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', pledge.backer_email)
            .maybeSingle();
          
          userId = profile?.id;
          
          if (!userId) {
            console.log(`Skipping pledge ${pledge.id}: No user found for ${pledge.backer_email}`);
            continue;
          }
        }

        // Get user's current credits
        const { data: userCredit } = await supabase
          .from('user_credits')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (!userCredit) {
          // Create initial credit entry
          await supabase
            .from('user_credits')
            .insert({
              user_id: userId,
              total_credits: pledge.pledge_amount,
              used_credits: 0,
              initial_credit_accepted: true,
            });
        } else {
          // Add credits to existing
          await supabase
            .from('user_credits')
            .update({
              total_credits: userCredit.total_credits + pledge.pledge_amount,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
        }

        // Get product and production level for voting
        if (pledge.product_id) {
          const { data: productionLevels } = await supabase
            .from('production_levels')
            .select('id, votes_needed, current_votes')
            .eq('product_id', pledge.product_id)
            .order('level_number', { ascending: true })
            .limit(1);

          if (productionLevels?.[0]) {
            const productionLevel = productionLevels[0];
            
            // Create a pledge (vote) for this production level
            await supabase
              .from('pledges')
              .insert({
                production_level_id: productionLevel.id,
                amount: pledge.pledge_amount,
                source: 'kickstarter',
                status: 'active',
                commitment_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              });

            console.log(`Created vote for production level ${productionLevel.id}`);
          }
        }

        // Track for medallion eligibility
        const { data: products } = await supabase
          .from('products')
          .select('project_id')
          .eq('id', pledge.product_id)
          .maybeSingle();

        if (products?.project_id) {
          const { data: eligibility } = await supabase
            .from('medallion_eligibility')
            .select('*')
            .eq('user_id', userId)
            .eq('project_id', products.project_id)
            .maybeSingle();

          if (eligibility) {
            await supabase
              .from('medallion_eligibility')
              .update({
                total_direct_pledges: eligibility.total_direct_pledges + pledge.pledge_amount,
                total_contribution: (eligibility.total_contribution || 0) + pledge.pledge_amount,
                is_eligible: (eligibility.total_contribution + pledge.pledge_amount) >= 100,
                updated_at: new Date().toISOString(),
              })
              .eq('id', eligibility.id);
          } else {
            await supabase
              .from('medallion_eligibility')
              .insert({
                user_id: userId,
                project_id: products.project_id,
                total_direct_pledges: pledge.pledge_amount,
                total_contribution: pledge.pledge_amount,
                is_eligible: pledge.pledge_amount >= 100,
              });
          }
        }

        // Mark pledge as processed
        await supabase
          .from('kickstarter_pledges')
          .update({ is_processed: true })
          .eq('id', pledge.id);

        processedCount++;
        console.log(`Processed pledge ${pledge.id} for ${pledge.backer_email}`);

      } catch (error) {
        console.error(`Error processing pledge ${pledge.id}:`, error);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        errors: errorCount,
        total: pledges?.length || 0,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sync function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
