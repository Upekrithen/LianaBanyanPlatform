import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VoteRequest {
  production_level_id: string;
  vote_amount: number;
  commitment_deadline: string;
  cash_ratio?: number;
  equity_ratio?: number;
  time_commitment_days?: number;
  is_eoi?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const voteData: VoteRequest = await req.json();

    // Generate idempotency key (user_id + production_level + timestamp hash)
    const idempotencyKey = `vote_${user.id}_${voteData.production_level_id}_${Date.now()}`;

    // Check if already processed (prevent duplicate votes)
    const { data: existingOp } = await supabaseClient.rpc('is_operation_processed', {
      _idempotency_key: idempotencyKey
    });

    if (existingOp && existingOp[0]?.processed) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Vote already processed',
          result: existingOp[0].response
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Acquire distributed lock for this production level
    const lockKey = `production_level:${voteData.production_level_id}`;
    const { data: lockResult } = await supabaseClient.rpc('acquire_lock', {
      _lock_key: lockKey,
      _timeout_ms: 30000,
      _user_id: user.id
    });

    if (!lockResult || !lockResult[0]?.success) {
      // Lock failed - queue for retry
      await supabaseClient.rpc('queue_failed_operation', {
        _operation_type: 'vote',
        _user_id: user.id,
        _operation_data: voteData,
        _error_message: 'Failed to acquire lock - system busy',
        _attempt_count: 1,
        _requires_admin: false
      });

      return new Response(
        JSON.stringify({
          success: false,
          message: 'System busy - vote queued for processing',
          retry: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 503 }
      );
    }

    const lockToken = lockResult[0].lock_token;

    try {
      // Validate user has sufficient credits
      const { data: userCredits } = await supabaseClient
        .from('user_credits')
        .select('total_credits, used_credits')
        .eq('user_id', user.id)
        .single();

      if (!userCredits) {
        throw new Error('User credits not found');
      }

      const availableCredits = userCredits.total_credits - userCredits.used_credits;
      if (availableCredits < voteData.vote_amount) {
        throw new Error(`Insufficient credits. Available: ${availableCredits}, Required: ${voteData.vote_amount}`);
      }

      // Validate deadline hasn't passed (server time only)
      const deadline = new Date(voteData.commitment_deadline);
      if (deadline < new Date()) {
        throw new Error('Commitment deadline has passed');
      }

      // Process vote in transaction
      const { data: voteResult, error: voteError } = await supabaseClient
        .from('user_votes')
        .insert({
          user_id: user.id,
          production_level_id: voteData.production_level_id,
          vote_amount: voteData.vote_amount,
          commitment_deadline: voteData.commitment_deadline,
          cash_ratio: voteData.cash_ratio || 0.5,
          equity_ratio: voteData.equity_ratio || 0.5,
          time_commitment_days: voteData.time_commitment_days,
          is_eoi: voteData.is_eoi || false,
          status: 'active'
        })
        .select()
        .single();

      if (voteError) throw voteError;

      // Update user credits (used_credits will auto-update via trigger)
      const { error: creditsError } = await supabaseClient
        .from('user_credits')
        .update({ used_credits: userCredits.used_credits + voteData.vote_amount })
        .eq('user_id', user.id);

      if (creditsError) throw creditsError;

      // Record successful operation
      await supabaseClient.rpc('record_operation', {
        _idempotency_key: idempotencyKey,
        _user_id: user.id,
        _operation_type: 'vote',
        _request_data: voteData,
        _response_data: { vote_id: voteResult.id },
        _status: 'completed'
      });

      // Release lock
      await supabaseClient.rpc('release_lock', {
        _lock_key: lockKey,
        _lock_token: lockToken
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Vote processed successfully',
          vote_id: voteResult.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      // Release lock on error
      await supabaseClient.rpc('release_lock', {
        _lock_key: lockKey,
        _lock_token: lockToken
      });

      // Queue failed operation for retry
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      await supabaseClient.rpc('queue_failed_operation', {
        _operation_type: 'vote',
        _user_id: user.id,
        _operation_data: voteData,
        _error_message: errorMessage,
        _error_stack: errorStack,
        _attempt_count: 1,
        _requires_admin: false
      });

      // Record failed operation
      const errorMsg = error instanceof Error ? error.message : String(error);
      await supabaseClient.rpc('record_operation', {
        _idempotency_key: idempotencyKey,
        _user_id: user.id,
        _operation_type: 'vote',
        _request_data: voteData,
        _response_data: { error: errorMsg },
        _status: 'failed'
      });

      throw error;
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing vote:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
