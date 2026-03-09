// refresh-social-tokens/index.ts
// Proactively refreshes social media OAuth tokens before they expire.
// Run as a cron job every hour via Supabase pg_cron or external scheduler.
//
// Token expiry windows:
//   Twitter/X:    2 hours (refresh token valid 6 months)
//   LinkedIn:     60 days (refresh token valid 1 year)
//   TikTok:       24 hours (refresh token valid 1 year)
//   Facebook:     60 days (exchange for new long-lived token)
//   Instagram:    60 days (exchange for new long-lived token)
//   Threads:      60 days (exchange for new long-lived token)
//   Bluesky:      ~2 hours (refresh via refreshJwt)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Refresh tokens that expire within this window (in hours)
const REFRESH_WINDOW_HOURS = 1;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const results: Array<{ platform: string; user_id: string; status: string; error?: string }> = [];

  try {
    // Find all active accounts with tokens expiring within the refresh window
    const refreshThreshold = new Date(
      Date.now() + REFRESH_WINDOW_HOURS * 60 * 60 * 1000
    ).toISOString();

    const { data: expiringAccounts, error: queryError } = await supabase
      .from('member_social_accounts')
      .select('*')
      .eq('is_active', true)
      .not('token_expires_at', 'is', null)
      .lte('token_expires_at', refreshThreshold);

    if (queryError) {
      throw new Error(`Query error: ${queryError.message}`);
    }

    if (!expiringAccounts || expiringAccounts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No tokens need refreshing', refreshed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${expiringAccounts.length} tokens to refresh`);

    for (const account of expiringAccounts) {
      try {
        const refreshResult = await refreshToken(account);

        if (refreshResult) {
          await supabase
            .from('member_social_accounts')
            .update({
              access_token: refreshResult.accessToken,
              refresh_token: refreshResult.refreshToken || account.refresh_token,
              token_expires_at: refreshResult.expiresAt,
              updated_at: new Date().toISOString(),
            })
            .eq('id', account.id);

          results.push({
            platform: account.platform,
            user_id: account.user_id,
            status: 'refreshed',
          });
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`Failed to refresh ${account.platform} for ${account.user_id}: ${errorMsg}`);
        results.push({
          platform: account.platform,
          user_id: account.user_id,
          status: 'failed',
          error: errorMsg,
        });

        // If refresh fails with invalid_grant, mark account as needing reconnection
        if (errorMsg.includes('invalid_grant') || errorMsg.includes('expired')) {
          await supabase
            .from('member_social_accounts')
            .update({
              is_active: false,
              updated_at: new Date().toISOString(),
            })
            .eq('id', account.id);
        }
      }
    }

    const refreshed = results.filter((r) => r.status === 'refreshed').length;
    const failed = results.filter((r) => r.status === 'failed').length;

    return new Response(
      JSON.stringify({ message: `Refreshed ${refreshed}, failed ${failed}`, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('refresh-social-tokens error:', errorMsg);
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

interface RefreshResult {
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
}

async function refreshToken(account: any): Promise<RefreshResult | null> {
  switch (account.platform) {
    case 'twitter':
      return refreshTwitterToken(account);
    case 'linkedin':
      return refreshLinkedInToken(account);
    case 'tiktok':
      return refreshTikTokToken(account);
    case 'facebook':
      return refreshFacebookToken(account);
    case 'instagram':
      return refreshInstagramToken(account);
    case 'threads':
      return refreshThreadsToken(account);
    case 'bluesky':
      return refreshBlueskyToken(account);
    default:
      console.log(`No refresh handler for platform: ${account.platform}`);
      return null;
  }
}

// --- Twitter/X (OAuth 2.0 with refresh_token) ---
async function refreshTwitterToken(account: any): Promise<RefreshResult> {
  const clientId = Deno.env.get('TWITTER_CLIENT_ID')!;
  const clientSecret = Deno.env.get('TWITTER_CLIENT_SECRET')!;

  if (!account.refresh_token) {
    throw new Error('No refresh token available for Twitter');
  }

  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: account.refresh_token,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Twitter refresh failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token, // Twitter rotates refresh tokens
    expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  };
}

// --- LinkedIn (OAuth 2.0 with refresh_token) ---
async function refreshLinkedInToken(account: any): Promise<RefreshResult> {
  const clientId = Deno.env.get('LINKEDIN_CLIENT_ID')!;
  const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET')!;

  if (!account.refresh_token) {
    throw new Error('No refresh token available for LinkedIn');
  }

  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: account.refresh_token,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LinkedIn refresh failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || account.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  };
}

// --- TikTok (OAuth 2.0 with refresh_token) ---
async function refreshTikTokToken(account: any): Promise<RefreshResult> {
  const clientKey = Deno.env.get('TIKTOK_CLIENT_KEY')!;
  const clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET')!;

  if (!account.refresh_token) {
    throw new Error('No refresh token available for TikTok');
  }

  const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: account.refresh_token,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TikTok refresh failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  };
}

// --- Facebook (exchange long-lived token for new long-lived token) ---
async function refreshFacebookToken(account: any): Promise<RefreshResult> {
  const appId = Deno.env.get('FACEBOOK_APP_ID')!;
  const appSecret = Deno.env.get('FACEBOOK_APP_SECRET')!;

  // Facebook doesn't use refresh tokens — exchange the current long-lived token
  // for a new one. This must happen before the current token expires.
  const url = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
  url.searchParams.set('grant_type', 'fb_exchange_token');
  url.searchParams.set('client_id', appId);
  url.searchParams.set('client_secret', appSecret);
  url.searchParams.set('fb_exchange_token', account.access_token);

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Facebook refresh failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + (data.expires_in || 5184000) * 1000).toISOString(),
  };
}

// --- Instagram (exchange long-lived token) ---
async function refreshInstagramToken(account: any): Promise<RefreshResult> {
  // Instagram long-lived tokens can be refreshed if they are at least 24 hours old
  // and not yet expired
  const url = new URL('https://graph.instagram.com/refresh_access_token');
  url.searchParams.set('grant_type', 'ig_refresh_token');
  url.searchParams.set('access_token', account.access_token);

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Instagram refresh failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  };
}

// --- Threads (exchange long-lived token — same pattern as Instagram) ---
async function refreshThreadsToken(account: any): Promise<RefreshResult> {
  const url = new URL('https://graph.threads.net/refresh_access_token');
  url.searchParams.set('grant_type', 'th_refresh_token');
  url.searchParams.set('access_token', account.access_token);

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Threads refresh failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  };
}

// --- Bluesky (AT Protocol session refresh) ---
async function refreshBlueskyToken(account: any): Promise<RefreshResult> {
  if (!account.refresh_token) {
    throw new Error('No refresh JWT available for Bluesky');
  }

  const response = await fetch('https://bsky.social/xrpc/com.atproto.server.refreshSession', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${account.refresh_token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Bluesky refresh failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return {
    accessToken: data.accessJwt,
    refreshToken: data.refreshJwt,
    // Bluesky doesn't return explicit expiry — estimate 2 hours
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  };
}
