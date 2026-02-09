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

    console.log('Starting expired vote reversion process...');

    // Call the database function to revert expired votes
    const { error: revertError } = await supabase.rpc('revert_expired_votes');

    if (revertError) {
      console.error('Error reverting votes:', revertError);
      throw revertError;
    }

    // Get statistics on reverted votes
    const { data: stats, error: statsError } = await supabase
      .from('user_votes')
      .select('vote_amount, reverted_at')
      .eq('status', 'reverted')
      .gte('reverted_at', new Date(Date.now() - 60000).toISOString()); // Last minute

    if (statsError) {
      console.error('Error fetching stats:', statsError);
    }

    const revertedCount = stats?.length || 0;
    const revertedAmount = stats?.reduce((sum, v) => sum + Number(v.vote_amount), 0) || 0;

    console.log(`Reverted ${revertedCount} votes totaling $${revertedAmount.toFixed(2)}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        reverted_count: revertedCount,
        reverted_amount: revertedAmount,
        message: 'Vote reversion completed successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in revert-expired-votes:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
