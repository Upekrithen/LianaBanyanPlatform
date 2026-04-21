import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

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

    console.log('Starting expired votes check...');

    // Call the database function to revert expired votes
    const { error } = await supabase.rpc('revert_expired_votes');

    if (error) {
      console.error('Error reverting votes:', error);
      throw error;
    }

    // Get count of reverted votes for logging
    const { data: revertedCount } = await supabase
      .from('pledges')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'reverted')
      .gte('reverted_at', new Date(Date.now() - 60000).toISOString()); // Last minute

    console.log(`Successfully checked and reverted expired votes. Recent reverts: ${revertedCount || 0}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Expired votes checked and reverted',
        recentReverts: revertedCount || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-expired-votes:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
