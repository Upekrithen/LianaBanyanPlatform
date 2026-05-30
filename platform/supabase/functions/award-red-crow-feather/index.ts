/**
 * award-red-crow-feather — BP063
 * =============================
 * Awards the Red Crow Feather to qualifying members.
 *
 * Modes:
 *   POST { mode: "single", user_id: "..." }
 *     → check and award one member
 *   POST { mode: "batch_retroactive" }
 *     → sweep all members without the feather; award all who qualify
 *     → requires service-role key (admin-only)
 *
 * Criterion: first_connect_ts < CERT_ACTIVATION_TS (or cert not yet active)
 * Proof source (priority order):
 *   1. creator_referrals.signed_up_at WHERE referred_user_id = user AND
 *      handshake_vesting_state IN ('HANDSHAKE_COMPLETED','REWARDS_VESTED')
 *      ORDER BY signed_up_at ASC LIMIT 1
 *   2. profiles.created_at (fallback for direct-install members with no referral row)
 *
 * GUARDRAIL: No monetary/investment fields on feather metadata (honor-not-security, Art XI).
 * Authored: 2026-05-30T00:00:00Z · SEG-REDCROW-SPEC · pearl_7890a4f9
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function computeHmac(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const hmacSecret = Deno.env.get('RED_CROW_HMAC_SECRET') ?? 'red-crow-dev-secret';
    const db = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { mode, user_id } = body;

    const { data: configRow } = await db
      .from('red_crow_feather_config')
      .select('config_value')
      .eq('config_key', 'CERT_ACTIVATION_TS')
      .single();
    const certActivationTs: string | null = configRow?.config_value ?? null;

    if (mode === 'single') {
      if (!user_id) return new Response(JSON.stringify({ error: 'user_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      const result = await processMember(db, user_id, certActivationTs, hmacSecret);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (mode === 'batch_retroactive') {
      const authHeader = req.headers.get('Authorization') ?? '';
      if (!authHeader.includes(serviceKey.slice(0, 20))) {
        return new Response(JSON.stringify({ error: 'service-role required for batch mode' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: alreadyIssued } = await db
        .from('red_crow_feather_issuances')
        .select('user_id');
      const alreadyIssuedSet = new Set((alreadyIssued ?? []).map((r: any) => r.user_id));

      const { data: referralMembers } = await db
        .from('creator_referrals')
        .select('referred_user_id, signed_up_at, id')
        .in('handshake_vesting_state', ['HANDSHAKE_COMPLETED', 'REWARDS_VESTED'])
        .not('referred_user_id', 'is', null)
        .order('signed_up_at', { ascending: true });

      const { data: profileMembers } = await db
        .from('profiles')
        .select('id, created_at');

      const processed: string[] = [];
      const awarded: string[] = [];
      const errors: string[] = [];
      const seenUsers = new Set<string>();

      for (const row of (referralMembers ?? [])) {
        if (!row.referred_user_id || seenUsers.has(row.referred_user_id)) continue;
        seenUsers.add(row.referred_user_id);
        if (alreadyIssuedSet.has(row.referred_user_id)) continue;

        const qualifies = certActivationTs === null || row.signed_up_at < certActivationTs;
        if (!qualifies) continue;

        const result = await processMember(db, row.referred_user_id, certActivationTs, hmacSecret);
        processed.push(row.referred_user_id);
        if (result.awarded) awarded.push(row.referred_user_id);
        if (result.error) errors.push(`${row.referred_user_id}: ${result.error}`);
      }

      for (const profile of (profileMembers ?? [])) {
        if (seenUsers.has(profile.id) || alreadyIssuedSet.has(profile.id)) continue;
        seenUsers.add(profile.id);

        const qualifies = certActivationTs === null || profile.created_at < certActivationTs;
        if (!qualifies) continue;

        const result = await processMember(db, profile.id, certActivationTs, hmacSecret);
        processed.push(profile.id);
        if (result.awarded) awarded.push(profile.id);
        if (result.error) errors.push(`${profile.id}: ${result.error}`);
      }

      return new Response(JSON.stringify({
        mode: 'batch_retroactive',
        processed: processed.length,
        awarded: awarded.length,
        errors: errors.length,
        error_details: errors.slice(0, 20),
        cert_activation_ts: certActivationTs,
        run_at: new Date().toISOString(),
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'mode must be "single" or "batch_retroactive"' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[award-red-crow-feather] error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processMember(
  db: ReturnType<typeof createClient>,
  userId: string,
  certActivationTs: string | null,
  hmacSecret: string
): Promise<{ awarded: boolean; featherId?: string; error?: string }> {
  const { data: existing } = await db
    .from('red_crow_feather_issuances')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (existing) return { awarded: false };

  let firstConnectTs: string | null = null;
  let connectSource: 'creator_referrals' | 'profiles_fallback' = 'creator_referrals';
  let connectReferralId: string | undefined;

  const { data: referral } = await db
    .from('creator_referrals')
    .select('id, signed_up_at')
    .eq('referred_user_id', userId)
    .in('handshake_vesting_state', ['HANDSHAKE_COMPLETED', 'REWARDS_VESTED'])
    .order('signed_up_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (referral?.signed_up_at) {
    firstConnectTs = referral.signed_up_at;
    connectReferralId = referral.id;
  } else {
    const { data: profile } = await db
      .from('profiles')
      .select('created_at')
      .eq('id', userId)
      .maybeSingle();
    if (profile?.created_at) {
      firstConnectTs = profile.created_at;
      connectSource = 'profiles_fallback';
    }
  }

  if (!firstConnectTs) return { awarded: false, error: 'no_connect_ts' };

  const qualifies = certActivationTs === null || firstConnectTs < certActivationTs;
  if (!qualifies) return { awarded: false };

  const proofPayload = JSON.stringify({
    user_id: userId,
    first_connect_ts: firstConnectTs,
    cert_activation_ts: certActivationTs,
    connect_source: connectSource,
    issued_at: new Date().toISOString(),
  });
  const proofHmac = await computeHmac(hmacSecret, proofPayload);

  const { data: feather, error: featherErr } = await db
    .from('crow_feathers')
    .insert({
      user_id: userId,
      category: 'red_crow',
      record_value: 1,
      metadata: {
        honor_badge: true,
        badge_class: 'first_cohort_unsigned_install',
        first_connect_ts: firstConnectTs,
        cert_activation_ts: certActivationTs,
        connect_source: connectSource,
        informed_trust: true,
        // GUARDRAIL: no investment_value, roi, equity, shares, dividends
      },
    })
    .select('id')
    .single();

  if (featherErr) return { awarded: false, error: featherErr.message };

  const { error: issuanceErr } = await db
    .from('red_crow_feather_issuances')
    .insert({
      user_id: userId,
      crow_feather_id: feather.id,
      first_connect_ts: firstConnectTs,
      cert_activation_ts: certActivationTs ?? null,
      connect_source: connectSource,
      connect_referral_id: connectReferralId ?? null,
      proof_hmac: proofHmac,
    });

  if (issuanceErr && issuanceErr.code !== '23505') {
    return { awarded: true, featherId: feather.id, error: issuanceErr.message };
  }

  return { awarded: true, featherId: feather.id };
}
