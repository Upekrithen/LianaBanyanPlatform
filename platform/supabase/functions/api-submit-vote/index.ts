import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
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

    const apiKey = req.headers.get('x-api-key');
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate API key
    const { data: credential } = await supabase
      .from('xml_access_credentials')
      .select('id, project_id')
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .maybeSingle();

    if (!credential) {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { 
      production_level_id, 
      user_email, 
      vote_amount,
      time_commitment_days,
      equity_ratio,
      cash_ratio
    } = await req.json();

    if (!production_level_id || !user_email || !vote_amount || !time_commitment_days) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate commitment deadline
    const commitmentDeadline = new Date();
    commitmentDeadline.setDate(commitmentDeadline.getDate() + time_commitment_days);

    // Create pledge (source: 'external_client')
    const { data: pledge, error: pledgeError } = await supabase
      .from('pledges')
      .insert({
        production_level_id,
        amount: vote_amount,
        source: 'external_client',
        time_commitment_days,
        commitment_deadline: commitmentDeadline.toISOString(),
        equity_ratio: equity_ratio || 0.5,
        cash_ratio: cash_ratio || 0.5,
        status: 'active'
      })
      .select()
      .single();

    if (pledgeError) throw pledgeError;

    // Update production level current votes count
    const { error: countError } = await supabase
      .from('production_levels')
      .select('id')
      .eq('id', production_level_id)
      .single();

    if (!countError) {
      const { data: pledgeSum } = await supabase
        .from('pledges')
        .select('amount')
        .eq('production_level_id', production_level_id);
      
      const totalVotes = pledgeSum?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      
      await supabase
        .from('production_levels')
        .update({ current_votes: totalVotes })
        .eq('id', production_level_id);
    }

    // Log access
    await supabase
      .from('xml_access_logs')
      .insert({
        credential_id: credential.id,
        project_id: credential.project_id,
        success: true,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      });

    return new Response(JSON.stringify({ 
      success: true, 
      pledge_id: pledge.id,
      message: 'Vote submitted successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in api-submit-vote:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
