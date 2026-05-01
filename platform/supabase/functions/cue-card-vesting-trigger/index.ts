/**
 * cue-card-vesting-trigger — KN087 / BP009
 * ============================================================
 * Listens for LB Frame Handshake Phase 5 receipt events and
 * advances the vesting state machine for matching referrals.
 *
 * Called by:
 *   1. LB Frame installer → reports Handshake phase progress
 *   2. Internal cron (hourly) → sweeps PENDING rows for timeout cleanup
 *
 * BRIDLE v11 Rule 4 enforcement:
 *   Marks are credited to sender ONLY at HANDSHAKE_COMPLETED → REWARDS_VESTED.
 *   NOT at email-send time. NOT at download time. NOT at LB Frame install.
 *   Only at successful Handshake Phase 5 receipt.
 *
 * Request body (from LB Frame installer):
 *   {
 *     event_type: "DOWNLOADED" | "HANDSHAKE_INITIATED" | "HANDSHAKE_COMPLETED",
 *     recipient_email: string,
 *     handshake_session_id: string,   // KN086 Phase 5 receipt session ID
 *     referral_token: string | null,  // Optional: the ref= token from download URL
 *   }
 *
 * On HANDSHAKE_COMPLETED:
 *   1. Find matching creator_referrals row
 *   2. Advance state to HANDSHAKE_COMPLETED
 *   3. Compute Marks reward for sender
 *   4. Update reward_marks + reward_tier
 *   5. Advance state to REWARDS_VESTED
 *   6. Credit Marks to sender's wallet (marks_wallet upsert)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type HandshakeEventType = 'DOWNLOADED' | 'HANDSHAKE_INITIATED' | 'HANDSHAKE_COMPLETED';

const STATE_MAP: Record<HandshakeEventType, string> = {
  DOWNLOADED: 'RECIPIENT_DOWNLOADED',
  HANDSHAKE_INITIATED: 'HANDSHAKE_INITIATED',
  HANDSHAKE_COMPLETED: 'HANDSHAKE_COMPLETED',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const db = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const {
      event_type,
      recipient_email,
      handshake_session_id,
      referral_token,
    }: {
      event_type: HandshakeEventType;
      recipient_email: string;
      handshake_session_id: string;
      referral_token?: string;
    } = body;

    if (!event_type || !recipient_email) {
      return new Response(
        JSON.stringify({ success: false, error: 'event_type and recipient_email required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newState = STATE_MAP[event_type];
    if (!newState) {
      return new Response(
        JSON.stringify({ success: false, error: `Unknown event_type: ${event_type}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find matching referral row — by referral_token (preferred) or recipient_email
    let referralQuery = db.from('creator_referrals').select('*');
    if (referral_token) {
      referralQuery = referralQuery.eq('id', referral_token);
    } else {
      referralQuery = referralQuery
        .eq('recipient_email', recipient_email)
        .neq('handshake_vesting_state', 'REWARDS_VESTED')
        .order('created_at', { ascending: false })
        .limit(1);
    }

    const { data: referrals, error: findErr } = await referralQuery;
    if (findErr) {
      console.error('[cue-card-vesting] referral lookup error:', findErr);
      return new Response(
        JSON.stringify({ success: false, error: 'DB lookup error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const referral = Array.isArray(referrals) ? referrals[0] : referrals;
    if (!referral) {
      console.log(`[cue-card-vesting] No pending referral found for ${recipient_email}`);
      return new Response(
        JSON.stringify({ success: true, action: 'no_matching_referral' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Advance state
    const { error: advanceErr } = await db.rpc('advance_cue_card_vesting', {
      p_referral_id: referral.id,
      p_new_state: newState,
      p_handshake_session_id: handshake_session_id ?? null,
    });

    if (advanceErr) {
      console.error('[cue-card-vesting] advance error:', advanceErr);
    }

    // If HANDSHAKE_COMPLETED → compute and vest Marks to sender
    if (event_type === 'HANDSHAKE_COMPLETED') {
      const { data: rewardData, error: rewardErr } = await db.rpc('compute_referral_marks_reward', {
        p_referrer_id: referral.referrer_id,
      });

      if (rewardErr) {
        console.error('[cue-card-vesting] reward compute error:', rewardErr);
      }

      const marksReward = rewardData ?? 1;

      // Update referral row with reward info
      await db
        .from('creator_referrals')
        .update({
          reward_marks: marksReward,
          handshake_vesting_state: 'REWARDS_VESTED',
          vesting_state_updated_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        })
        .eq('id', referral.id);

      // Credit Marks to sender's marks_wallet (upsert pattern)
      // Marks are closed-loop cooperative participation allocation (BRIDLE Rule 2 — no fiat cashout)
      const { error: walletErr } = await db.rpc('credit_marks_to_wallet', {
        p_user_id: referral.referrer_id,
        p_amount: marksReward,
        p_source: 'cue_card_referral',
        p_reference_id: referral.id,
        p_description: `LB Frame referral reward — Handshake completed by ${recipient_email}`,
      }).maybeSingle();

      if (walletErr) {
        // Non-fatal: Marks will be credited via next reconciliation sweep
        console.warn('[cue-card-vesting] wallet credit soft error:', walletErr.message);
      }

      console.log(
        `[cue-card-vesting] REWARDS_VESTED: referral ${referral.id}, ` +
        `sender ${referral.referrer_id} +${marksReward} Marks`
      );

      return new Response(
        JSON.stringify({
          success: true,
          action: 'rewards_vested',
          referral_id: referral.id,
          marks_awarded: marksReward,
          sender_id: referral.referrer_id,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        action: 'state_advanced',
        referral_id: referral.id,
        new_state: newState,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[cue-card-vesting] unhandled error:', err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
