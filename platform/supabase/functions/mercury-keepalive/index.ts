/**
 * MERCURY KEEPALIVE — Ping Mercury API to prevent token expiry
 * =============================================================
 * Reads MERCURY_API_TOKEN from Supabase secrets, hits /accounts endpoint.
 * Founder-only: requires authenticated user with founder role.
 *
 * To set the secret:
 *   supabase secrets set MERCURY_API_TOKEN=your-token-here
 *
 * Returns: { success, accounts_count, pinged_at }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Auth check — must be logged in
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Founder check — only the founder can ping this
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'founder') {
      return new Response(
        JSON.stringify({ success: false, error: 'Founder access only' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Mercury token from secrets
    const mercuryToken = Deno.env.get('MERCURY_API_TOKEN');
    if (!mercuryToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'MERCURY_API_TOKEN not set in Supabase secrets' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ping Mercury API — simple GET /accounts (read-only, no side effects)
    const mercuryRes = await fetch('https://backend.mercury.com/api/v1/accounts', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mercuryToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!mercuryRes.ok) {
      const errBody = await mercuryRes.text();
      return new Response(
        JSON.stringify({ success: false, error: `Mercury API ${mercuryRes.status}`, details: errBody }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mercuryData = await mercuryRes.json();
    const accountCount = Array.isArray(mercuryData?.accounts) ? mercuryData.accounts.length : 0;

    return new Response(
      JSON.stringify({
        success: true,
        accounts_count: accountCount,
        pinged_at: new Date().toISOString(),
        message: 'Mercury token kept alive. Clock reset.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
