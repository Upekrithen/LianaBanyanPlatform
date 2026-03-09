/**
 * SOCIAL OAUTH CALLBACK
 * ======================
 * Handles OAuth callback redirects from social platforms.
 * Exchanges authorization code for access token and stores it.
 * 
 * Flow:
 *   1. User clicks "Connect Twitter" → redirected to Twitter auth
 *   2. User authorizes → Twitter redirects here with code
 *   3. This function exchanges code for tokens
 *   4. Tokens stored in member_social_accounts
 *   5. Window closes with success message
 *
 * Supported platforms: Twitter/X, LinkedIn, Facebook, Instagram, TikTok, Threads, Imgur
 *
 * Required Secrets (set in Supabase Dashboard):
 *   - TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET
 *   - LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET
 *   - FACEBOOK_APP_ID, FACEBOOK_APP_SECRET
 *   - IMGUR_CLIENT_ID, IMGUR_CLIENT_SECRET
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
      console.error(`OAuth error: ${error} - ${errorDescription}`);
      return createErrorPage(`Authorization failed: ${errorDescription || error}`);
    }

    if (!code || !state) {
      return createErrorPage('Missing authorization code or state');
    }

    // Decode state to get user ID and platform
    let stateData: { userId: string; platform: string; timestamp: number };
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      return createErrorPage('Invalid state parameter');
    }

    const { userId, platform } = stateData;

    if (!userId || !platform) {
      return createErrorPage('Invalid state data');
    }

    console.log(`Processing OAuth callback for ${platform}, user ${userId}`);

    // Create Supabase admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the base URL for redirect
    const baseUrl = Deno.env.get('SITE_URL') || 'https://lianabanyan.com';
    const redirectUri = `${baseUrl}/api/social-oauth-callback`;

    // Exchange code for tokens based on platform
    let tokenData: {
      accessToken: string;
      refreshToken?: string;
      expiresIn?: number;
      platformUserId?: string;
      username?: string;
    };

    switch (platform) {
      case 'twitter':
        tokenData = await exchangeTwitterToken(code, redirectUri);
        break;
      case 'linkedin':
        tokenData = await exchangeLinkedInToken(code, redirectUri);
        break;
      case 'facebook':
        tokenData = await exchangeFacebookToken(code, redirectUri);
        break;
      case 'instagram':
        tokenData = await exchangeInstagramToken(code, redirectUri);
        break;
      case 'tiktok':
        tokenData = await exchangeTikTokToken(code, redirectUri);
        break;
      case 'threads':
        tokenData = await exchangeThreadsToken(code, redirectUri);
        break;
      case 'imgur':
        tokenData = await exchangeImgurToken(code, redirectUri);
        break;
      default:
        return createErrorPage(`Unsupported platform: ${platform}`);
    }

    // Calculate token expiration
    const expiresAt = tokenData.expiresIn 
      ? new Date(Date.now() + tokenData.expiresIn * 1000).toISOString()
      : null;

    // Store tokens in database
    const { error: upsertError } = await supabase
      .from('member_social_accounts')
      .upsert({
        user_id: userId,
        platform,
        platform_user_id: tokenData.platformUserId,
        access_token: tokenData.accessToken,
        refresh_token: tokenData.refreshToken,
        token_expires_at: expiresAt,
        account_handle: tokenData.username,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, { 
        onConflict: 'user_id,platform',
        ignoreDuplicates: false,
      });

    if (upsertError) {
      console.error('Database error:', upsertError);
      return createErrorPage('Failed to save connection');
    }

    console.log(`✅ Successfully connected ${platform} for user ${userId}`);

    // Return success page that closes the popup
    return createSuccessPage(platform);

  } catch (err) {
    console.error('OAuth callback error:', err);
    return createErrorPage(err.message || 'Unknown error');
  }
});

// ─── TOKEN EXCHANGE FUNCTIONS ───

async function exchangeTwitterToken(code: string, redirectUri: string) {
  const clientId = Deno.env.get('TWITTER_CLIENT_ID');
  const clientSecret = Deno.env.get('TWITTER_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Twitter API credentials not configured');
  }

  // Exchange code for token
  const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: 'challenge', // PKCE
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    console.error('Twitter token error:', error);
    throw new Error('Failed to get Twitter access token');
  }

  const tokenData = await tokenResponse.json();

  // Get user info
  const userResponse = await fetch('https://api.twitter.com/2/users/me', {
    headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
  });

  let username: string | undefined;
  let platformUserId: string | undefined;

  if (userResponse.ok) {
    const userData = await userResponse.json();
    username = `@${userData.data.username}`;
    platformUserId = userData.data.id;
  }

  return {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresIn: tokenData.expires_in,
    platformUserId,
    username,
  };
}

async function exchangeLinkedInToken(code: string, redirectUri: string) {
  const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
  const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('LinkedIn API credentials not configured');
  }

  // Exchange code for token
  const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    console.error('LinkedIn token error:', error);
    throw new Error('Failed to get LinkedIn access token');
  }

  const tokenData = await tokenResponse.json();

  // Get user profile
  const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
  });

  let username: string | undefined;
  let platformUserId: string | undefined;

  if (profileResponse.ok) {
    const profileData = await profileResponse.json();
    username = profileData.name;
    platformUserId = profileData.sub;
  }

  return {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresIn: tokenData.expires_in,
    platformUserId,
    username,
  };
}

async function exchangeFacebookToken(code: string, redirectUri: string) {
  const appId = Deno.env.get('FACEBOOK_APP_ID');
  const appSecret = Deno.env.get('FACEBOOK_APP_SECRET');

  if (!appId || !appSecret) {
    throw new Error('Facebook API credentials not configured');
  }

  // Exchange code for short-lived token
  const tokenResponse = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
    new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      code,
      redirect_uri: redirectUri,
    })
  );

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    console.error('Facebook token error:', error);
    throw new Error('Failed to get Facebook access token');
  }

  const tokenData = await tokenResponse.json();

  // Exchange for long-lived token
  const longLivedResponse = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
    new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: tokenData.access_token,
    })
  );

  let accessToken = tokenData.access_token;
  let expiresIn = tokenData.expires_in;

  if (longLivedResponse.ok) {
    const longLivedData = await longLivedResponse.json();
    accessToken = longLivedData.access_token;
    expiresIn = longLivedData.expires_in;
  }

  // Get user info
  const userResponse = await fetch(
    `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${accessToken}`
  );

  let username: string | undefined;
  let platformUserId: string | undefined;

  if (userResponse.ok) {
    const userData = await userResponse.json();
    username = userData.name;
    platformUserId = userData.id;
  }

  // Get page access token if user has pages (for posting to pages)
  // This is optional - some users post as themselves
  const pagesResponse = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
  );

  if (pagesResponse.ok) {
    const pagesData = await pagesResponse.json();
    if (pagesData.data && pagesData.data.length > 0) {
      // Use first page's token for posting
      const page = pagesData.data[0];
      accessToken = page.access_token;
      platformUserId = page.id;
      username = page.name;
    }
  }

  return {
    accessToken,
    expiresIn,
    platformUserId,
    username,
  };
}

/**
 * Exchange TikTok authorization code for access token
 * Uses TikTok Login Kit / Content Posting API
 */
async function exchangeTikTokToken(code: string, redirectUri: string) {
  const clientKey = Deno.env.get('TIKTOK_CLIENT_KEY');
  const clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET');

  if (!clientKey || !clientSecret) {
    throw new Error('TikTok API credentials not configured');
  }

  // Exchange code for token
  const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    console.error('TikTok token error:', error);
    throw new Error('Failed to get TikTok access token');
  }

  const tokenData = await tokenResponse.json();

  // Get user info
  const userResponse = await fetch(
    'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,display_name,avatar_url',
    {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
    }
  );

  let username: string | undefined;
  let platformUserId: string | undefined;

  if (userResponse.ok) {
    const userData = await userResponse.json();
    username = userData.data?.user?.display_name;
    platformUserId = userData.data?.user?.open_id;
  }

  return {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresIn: tokenData.expires_in,
    platformUserId: platformUserId || tokenData.open_id,
    username,
  };
}

/**
 * Exchange Instagram authorization code for access token
 * Uses Instagram Basic Display API / Graph API for Business accounts
 */
async function exchangeInstagramToken(code: string, redirectUri: string) {
  const appId = Deno.env.get('INSTAGRAM_APP_ID') || Deno.env.get('FACEBOOK_APP_ID');
  const appSecret = Deno.env.get('INSTAGRAM_APP_SECRET') || Deno.env.get('FACEBOOK_APP_SECRET');

  if (!appId || !appSecret) {
    throw new Error('Instagram API credentials not configured');
  }

  // Exchange code for short-lived token
  const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    console.error('Instagram token error:', error);
    throw new Error('Failed to get Instagram access token');
  }

  const tokenData = await tokenResponse.json();

  // Exchange for long-lived token
  const longLivedResponse = await fetch(
    `https://graph.instagram.com/access_token?` +
    new URLSearchParams({
      grant_type: 'ig_exchange_token',
      client_secret: appSecret,
      access_token: tokenData.access_token,
    })
  );

  let accessToken = tokenData.access_token;
  let expiresIn = 3600; // Default 1 hour

  if (longLivedResponse.ok) {
    const longLivedData = await longLivedResponse.json();
    accessToken = longLivedData.access_token;
    expiresIn = longLivedData.expires_in;
  }

  // Get user info
  const userResponse = await fetch(
    `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
  );

  let username: string | undefined;
  let platformUserId: string | undefined;

  if (userResponse.ok) {
    const userData = await userResponse.json();
    username = `@${userData.username}`;
    platformUserId = userData.id;
  }

  return {
    accessToken,
    expiresIn,
    platformUserId: platformUserId || tokenData.user_id,
    username,
  };
}

/**
 * Exchange Threads authorization code for access token
 * Threads uses the same Meta infrastructure as Instagram
 */
async function exchangeThreadsToken(code: string, redirectUri: string) {
  const appId = Deno.env.get('THREADS_APP_ID') || Deno.env.get('FACEBOOK_APP_ID');
  const appSecret = Deno.env.get('THREADS_APP_SECRET') || Deno.env.get('FACEBOOK_APP_SECRET');

  if (!appId || !appSecret) {
    throw new Error('Threads API credentials not configured');
  }

  // Exchange code for short-lived token
  const tokenResponse = await fetch('https://graph.threads.net/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    console.error('Threads token error:', error);
    throw new Error('Failed to get Threads access token');
  }

  const tokenData = await tokenResponse.json();

  // Exchange for long-lived token
  const longLivedResponse = await fetch(
    `https://graph.threads.net/access_token?` +
    new URLSearchParams({
      grant_type: 'th_exchange_token',
      client_secret: appSecret,
      access_token: tokenData.access_token,
    })
  );

  let accessToken = tokenData.access_token;
  let expiresIn = 3600;

  if (longLivedResponse.ok) {
    const longLivedData = await longLivedResponse.json();
    accessToken = longLivedData.access_token;
    expiresIn = longLivedData.expires_in;
  }

  // Get user profile
  const userResponse = await fetch(
    `https://graph.threads.net/v1.0/me?fields=id,username,threads_profile_picture_url&access_token=${accessToken}`
  );

  let username: string | undefined;
  let platformUserId: string | undefined;

  if (userResponse.ok) {
    const userData = await userResponse.json();
    username = `@${userData.username}`;
    platformUserId = userData.id;
  }

  return {
    accessToken,
    expiresIn,
    platformUserId: platformUserId || tokenData.user_id,
    username,
  };
}

/**
 * Exchange Imgur authorization code for access token
 * Imgur uses standard OAuth 2.0
 * Upload endpoint: POST https://api.imgur.com/3/image
 * Gallery: POST https://api.imgur.com/3/gallery/{galleryHash}
 */
async function exchangeImgurToken(code: string, _redirectUri: string) {
  const clientId = Deno.env.get('IMGUR_CLIENT_ID');
  const clientSecret = Deno.env.get('IMGUR_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Imgur API credentials not configured');
  }

  // Exchange code for token
  const tokenResponse = await fetch('https://api.imgur.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    console.error('Imgur token error:', error);
    throw new Error('Failed to get Imgur access token');
  }

  const tokenData = await tokenResponse.json();

  // Imgur returns account_username and account_id directly in token response
  return {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresIn: tokenData.expires_in,
    platformUserId: tokenData.account_id?.toString(),
    username: tokenData.account_username,
  };
}

// ─── HTML RESPONSE HELPERS ───

function createSuccessPage(platform: string): Response {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Connected!</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 { font-size: 2rem; margin-bottom: 1rem; }
    p { font-size: 1.1rem; opacity: 0.9; }
    .icon { font-size: 4rem; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">✓</div>
    <h1>${capitalize(platform)} Connected!</h1>
    <p>You can close this window now.</p>
  </div>
  <script>
    // Notify parent window and close
    if (window.opener) {
      window.opener.dispatchEvent(new CustomEvent('social-oauth-complete', { 
        detail: { platform: '${platform}', success: true } 
      }));
    }
    setTimeout(() => window.close(), 2000);
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

function createErrorPage(message: string): Response {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Connection Failed</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 400px;
    }
    h1 { font-size: 1.5rem; margin-bottom: 1rem; }
    p { font-size: 1rem; opacity: 0.9; }
    .icon { font-size: 4rem; margin-bottom: 1rem; }
    button {
      margin-top: 1.5rem;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      background: white;
      color: #dc2626;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">✕</div>
    <h1>Connection Failed</h1>
    <p>${escapeHtml(message)}</p>
    <button onclick="window.close()">Close</button>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 400,
    headers: { 'Content-Type': 'text/html' },
  });
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
