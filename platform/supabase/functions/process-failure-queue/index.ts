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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Service role for admin operations
    );

    // Get pending failures that haven't exceeded max retries
    const { data: failures, error: fetchError } = await supabaseClient
      .from('operation_failures')
      .select('*')
      .in('status', ['pending', 'retrying'])
      .lt('attempt_count', 3)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(50);

    if (fetchError) throw fetchError;

    if (!failures || failures.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No pending failures to process',
          processed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      manual_review: 0
    };

    // Process each failure
    for (const failure of failures) {
      try {
        // Mark as retrying
        await supabaseClient
          .from('operation_failures')
          .update({ 
            status: 'retrying',
            last_retry_at: new Date().toISOString()
          })
          .eq('id', failure.id);

        // Exponential backoff: wait longer for each retry
        const backoffMs = Math.pow(2, failure.attempt_count) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffMs));

        // Retry the operation based on type
        let retrySuccess = false;

        switch (failure.operation_type) {
          case 'vote':
            retrySuccess = await retryVote(supabaseClient, failure);
            break;
          case 'eoi_conversion':
            retrySuccess = await retryEOIConversion(supabaseClient, failure);
            break;
          case 'blockchain_write':
            retrySuccess = await retryBlockchainWrite(supabaseClient, failure);
            break;
          default:
            console.log(`Unknown operation type: ${failure.operation_type}`);
            retrySuccess = false;
        }

        if (retrySuccess) {
          // Mark as resolved
          await supabaseClient
            .from('operation_failures')
            .update({ 
              status: 'resolved',
              resolved_at: new Date().toISOString()
            })
            .eq('id', failure.id);
          
          results.succeeded++;
        } else {
          // Increment attempt count
          const newAttemptCount = failure.attempt_count + 1;
          const newStatus = newAttemptCount >= 3 ? 'manual_review' : 'pending';

          await supabaseClient
            .from('operation_failures')
            .update({ 
              attempt_count: newAttemptCount,
              status: newStatus,
              requires_admin: newAttemptCount >= 3
            })
            .eq('id', failure.id);

          if (newStatus === 'manual_review') {
            results.manual_review++;
            
            // Send notification to admins
            console.log(`Operation ${failure.id} requires manual review after ${newAttemptCount} attempts`);
            const resendApiKey = Deno.env.get('RESEND_API_KEY');
            if (resendApiKey) {
              try {
                await fetch('https://api.resend.com/emails', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${resendApiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    from: 'system@lianabanyan.org',
                    to: 'admin@lianabanyan.org',
                    subject: `[ACTION REQUIRED] Operation ${failure.id} Failed`,
                    html: `<p>Operation <strong>${failure.id}</strong> of type <strong>${failure.operation_type}</strong> has failed ${newAttemptCount} times and requires manual review.</p><p>Entity ID: ${failure.entity_id}</p>`
                  })
                });
                console.log(`Admin notification sent for failure ${failure.id}`);
              } catch (emailError) {
                console.error(`Failed to send admin notification for failure ${failure.id}:`, emailError);
              }
            } else {
              console.warn('RESEND_API_KEY not set, skipping admin email notification');
            }
          } else {
            results.failed++;
          }
        }

        results.processed++;

      } catch (error) {
        console.error(`Error processing failure ${failure.id}:`, error);
        results.failed++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        ...results,
        message: `Processed ${results.processed} failures. ${results.succeeded} succeeded, ${results.failed} failed, ${results.manual_review} require manual review.`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing failure queue:', error);
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

// Retry functions for different operation types
async function retryVote(supabase: any, failure: any): Promise<boolean> {
  try {
    const voteData = failure.operation_data;
    
    // Re-validate and process vote
    const { error } = await supabase
      .from('user_votes')
      .insert({
        user_id: failure.user_id,
        production_level_id: voteData.production_level_id,
        vote_amount: voteData.vote_amount,
        commitment_deadline: voteData.commitment_deadline,
        status: 'active'
      });

    return !error;
  } catch (error) {
    console.error('Vote retry failed:', error);
    return false;
  }
}

async function retryEOIConversion(supabase: any, failure: any): Promise<boolean> {
  try {
    // Call EOI conversion function
    const { error } = await supabase.rpc('convert_eoi_credits_with_vesting');
    return !error;
  } catch (error) {
    console.error('EOI conversion retry failed:', error);
    return false;
  }
}

async function retryBlockchainWrite(supabase: any, failure: any): Promise<boolean> {
  try {
    // Queue blockchain write operation
    // This would typically call the blockchain minting function
    console.log('Blockchain write retry not yet implemented');
    return false;
  } catch (error) {
    console.error('Blockchain write retry failed:', error);
    return false;
  }
}
