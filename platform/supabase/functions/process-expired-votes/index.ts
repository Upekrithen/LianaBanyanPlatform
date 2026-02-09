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

    console.log('Processing expired votes...');

    // Call the database function to revert expired votes
    const { error: revertError } = await supabase.rpc('revert_expired_votes');

    if (revertError) {
      console.error('Error reverting expired votes:', revertError);
      throw revertError;
    }

    // Get count of reverted votes for logging
    const { data: revertedVotes, error: countError } = await supabase
      .from('user_votes')
      .select('id, user_id, vote_amount, production_level_id')
      .eq('status', 'reverted')
      .gte('reverted_at', new Date(Date.now() - 60000).toISOString()); // Last minute

    if (countError) {
      console.error('Error counting reverted votes:', countError);
    } else {
      console.log(`Successfully reverted ${revertedVotes?.length || 0} expired votes`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Expired votes processed successfully',
      reverted_count: revertedVotes?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-expired-votes:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
