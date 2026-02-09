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

    const { 
      hiring_member_id, 
      hired_member_id, 
      agreed_rate, 
      lb_scale_rate,
      service_link_id,
      contract_id 
    } = await req.json();

    // Validate inputs
    if (!hiring_member_id || !hired_member_id || !agreed_rate || !lb_scale_rate) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate compliance
    const rate_differential = ((agreed_rate - lb_scale_rate) / lb_scale_rate) * 100;
    const rate_compliant = agreed_rate >= lb_scale_rate * 0.95; // 5% tolerance

    let violation_severity = null;
    let reputation_penalty = null;

    if (!rate_compliant) {
      if (rate_differential < -20) {
        violation_severity = "severe";
        reputation_penalty = 50;
      } else if (rate_differential < -10) {
        violation_severity = "major";
        reputation_penalty = 25;
      } else {
        violation_severity = "minor";
        reputation_penalty = 10;
      }
    }

    // Log the transaction
    const { data: logData, error: logError } = await supabase
      .from('lb_member_hiring_log')
      .insert({
        hiring_member_id,
        hired_member_id,
        service_link_id,
        agreed_rate,
        lb_scale_rate,
        rate_compliant,
        violation_severity,
        reputation_penalty,
        contract_id
      })
      .select()
      .single();

    if (logError) throw logError;

    // If violation, update service link violations count
    if (!rate_compliant && service_link_id) {
      const { error: updateError } = await supabase.rpc('increment_violation_count', {
        link_id: service_link_id
      });
      
      if (updateError) {
        console.error("Failed to increment violation count:", updateError);
      }
    }

    // Apply reputation penalty if applicable
    if (reputation_penalty && hired_member_id) {
      const { error: repError } = await supabase.rpc('apply_reputation_penalty', {
        user_id: hired_member_id,
        penalty: reputation_penalty
      });

      if (repError) {
        console.error("Failed to apply reputation penalty:", repError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        log: logData,
        rate_compliant,
        violation_severity,
        reputation_penalty
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error logging member transaction:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
