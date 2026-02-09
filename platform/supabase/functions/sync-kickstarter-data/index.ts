import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

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
  const kickstarterApiKey = Deno.env.get('KICKSTARTER_API_KEY');

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Create sync log entry
  const { data: syncLog, error: logError } = await supabase
    .from('kickstarter_sync_log')
    .insert({ status: 'running' })
    .select()
    .single();

  if (logError) {
    console.error('Failed to create sync log:', logError);
    return new Response(
      JSON.stringify({ error: 'Failed to start sync' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    if (!kickstarterApiKey) {
      throw new Error('KICKSTARTER_API_KEY not configured');
    }

    // Get last successful sync time
    const { data: lastSync } = await supabase
      .from('kickstarter_sync_log')
      .select('sync_completed_at')
      .eq('status', 'success')
      .order('sync_completed_at', { ascending: false })
      .limit(1)
      .single();

    const sinceDate = lastSync?.sync_completed_at || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    console.log(`Syncing Kickstarter pledges since: ${sinceDate}`);

    // Call Kickstarter API
    // Note: Actual endpoint structure depends on Kickstarter's API documentation
    const response = await fetch('https://api.kickstarter.com/v1/pledges', {
      headers: {
        'Authorization': `Bearer ${kickstarterApiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Kickstarter API error: ${response.status} ${response.statusText}`);
    }

    const pledgesData = await response.json();
    console.log(`Received ${pledgesData.pledges?.length || 0} pledges from Kickstarter`);

    let syncedCount = 0;

    // Process each pledge
    for (const pledge of pledgesData.pledges || []) {
      // Find or create user
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', pledge.backer_email)
        .single();

      let userId = existingUser?.id;

      if (!userId) {
        // Create user profile
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            email: pledge.backer_email,
            full_name: pledge.backer_name || null,
          })
          .select()
          .single();

        userId = newProfile?.id;
      }

      // Get product (for now, fetch first available product)
      const { data: product } = await supabase
        .from('products')
        .select('id')
        .limit(1)
        .single();

      // Upsert pledge data
      const { error: pledgeError } = await supabase
        .from('kickstarter_pledges')
        .upsert(
          {
            kickstarter_pledge_id: pledge.id,
            backer_email: pledge.backer_email,
            pledge_amount: pledge.amount,
            user_id: userId,
            product_id: product?.id,
            synced_at: new Date().toISOString(),
          },
          { onConflict: 'kickstarter_pledge_id' }
        );

      if (pledgeError) {
        console.error('Failed to sync pledge:', pledgeError);
      } else {
        syncedCount++;
      }
    }

    // Update sync log as successful
    await supabase
      .from('kickstarter_sync_log')
      .update({
        status: 'success',
        sync_completed_at: new Date().toISOString(),
        pledges_synced: syncedCount,
      })
      .eq('id', syncLog.id);

    console.log(`✅ Sync completed successfully: ${syncedCount} pledges`);

    return new Response(
      JSON.stringify({
        success: true,
        pledges_synced: syncedCount,
        sync_log_id: syncLog.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Sync failed:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update sync log as failed
    await supabase
      .from('kickstarter_sync_log')
      .update({
        status: 'failed',
        sync_completed_at: new Date().toISOString(),
        error_message: errorMessage,
      })
      .eq('id', syncLog.id);

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        sync_log_id: syncLog.id,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});