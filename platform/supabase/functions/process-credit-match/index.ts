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

    const { referralCode, pledgeAmount, refereeId, productionLevelId } = await req.json();

    console.log('Processing credit match:', { referralCode, pledgeAmount, refereeId });

    // Find active referral
    const { data: referral, error: refError } = await supabase
      .from('user_referrals')
      .select('*')
      .eq('referral_code', referralCode)
      .eq('status', 'active')
      .single();

    if (refError || !referral) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired referral code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if referral is maxed out
    if (referral.current_uses >= referral.max_uses) {
      return new Response(
        JSON.stringify({ error: 'Referral code has reached maximum uses' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Calculate matched amount (up to shared credit amount)
    const matchedAmount = Math.min(
      parseFloat(pledgeAmount),
      parseFloat(referral.shared_credit_amount) - parseFloat(referral.total_matched || '0')
    );

    if (matchedAmount <= 0) {
      return new Response(
        JSON.stringify({ error: 'No credits available for matching' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get referee's pledge to record match
    const { data: refereePledge } = await supabase
      .from('pledges')
      .select('id')
      .eq('production_level_id', productionLevelId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Create credit match record
    const { error: matchError } = await supabase
      .from('credit_matches')
      .insert({
        referral_id: referral.id,
        referee_pledge_id: refereePledge?.id,
        referrer_credit_amount: matchedAmount,
        referee_credit_amount: matchedAmount,
        matched_amount: matchedAmount
      });

    if (matchError) {
      console.error('Error creating credit match:', matchError);
      throw matchError;
    }

    // Update referral usage
    const { error: updateError } = await supabase
      .from('user_referrals')
      .update({
        current_uses: referral.current_uses + 1,
        total_matched: (parseFloat(referral.total_matched || '0') + matchedAmount).toString()
      })
      .eq('id', referral.id);

    if (updateError) {
      console.error('Error updating referral:', updateError);
    }

    // Update medallion eligibility for both users
    const { data: product } = await supabase
      .from('production_levels')
      .select('product_id')
      .eq('id', productionLevelId)
      .single();

    const { data: projectData } = await supabase
      .from('products')
      .select('project_id')
      .eq('id', product?.product_id)
      .single();

    const projectId = projectData?.project_id;

    // Update referrer's medallion eligibility
    await updateMedallionEligibility(supabase, referral.referrer_id, projectId, 0, matchedAmount);

    // Update referee's medallion eligibility
    await updateMedallionEligibility(supabase, refereeId, projectId, parseFloat(pledgeAmount), matchedAmount);

    console.log('Credit match processed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        matchedAmount,
        message: `Both you and your referrer earned $${matchedAmount.toFixed(2)} in matched credits!`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-credit-match:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function updateMedallionEligibility(
  supabase: any,
  userId: string,
  projectId: string,
  directPledge: number,
  matchedCredits: number
) {
  // Get existing eligibility
  const { data: existing } = await supabase
    .from('medallion_eligibility')
    .select('*')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .maybeSingle();

  const newDirectTotal = (parseFloat(existing?.total_direct_pledges || '0') + directPledge);
  const newMatchedTotal = (parseFloat(existing?.total_matched_credits || '0') + matchedCredits);
  const totalContribution = newDirectTotal + newMatchedTotal;
  const isEligible = totalContribution >= 1000;

  if (existing) {
    await supabase
      .from('medallion_eligibility')
      .update({
        total_direct_pledges: newDirectTotal,
        total_matched_credits: newMatchedTotal,
        total_contribution: totalContribution,
        is_eligible: isEligible,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('medallion_eligibility')
      .insert({
        user_id: userId,
        project_id: projectId,
        total_direct_pledges: newDirectTotal,
        total_matched_credits: newMatchedTotal,
        total_contribution: totalContribution,
        is_eligible: isEligible
      });
  }
}
