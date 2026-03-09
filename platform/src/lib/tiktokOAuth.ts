/**
 * TikTok OAuth Helper Functions
 * 
 * Handles the client-side OAuth flow for TikTok Login Kit.
 */

// TikTok OAuth configuration
const TIKTOK_CLIENT_KEY = import.meta.env.VITE_TIKTOK_CLIENT_KEY || '';
const REDIRECT_URI = `${window.location.origin}/auth/tiktok/callback`;

// Scopes we're requesting
const SCOPES = ['user.info.profile'];

/**
 * Generate a random state string for CSRF protection
 */
function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate code verifier for PKCE
 */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate code challenge from verifier (S256)
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Initiate TikTok OAuth flow
 * Opens TikTok authorization in a new window or redirects
 */
export async function initiateTikTokOAuth(options?: { popup?: boolean }): Promise<void> {
  if (!TIKTOK_CLIENT_KEY) {
    console.error('TikTok Client Key not configured');
    throw new Error('TikTok integration not configured. Please contact support.');
  }

  // Generate PKCE values
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  // Store for callback verification
  sessionStorage.setItem('tiktok_oauth_state', state);
  sessionStorage.setItem('tiktok_code_verifier', codeVerifier);

  // Build authorization URL
  const params = new URLSearchParams({
    client_key: TIKTOK_CLIENT_KEY,
    response_type: 'code',
    scope: SCOPES.join(','),
    redirect_uri: REDIRECT_URI,
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;

  if (options?.popup) {
    // Open in popup window
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    window.open(
      authUrl,
      'tiktok_oauth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
    );
  } else {
    // Full redirect
    window.location.href = authUrl;
  }
}

/**
 * Check if TikTok is configured
 */
export function isTikTokConfigured(): boolean {
  return !!TIKTOK_CLIENT_KEY;
}

/**
 * Get the redirect URI (for display/debugging)
 */
export function getTikTokRedirectUri(): string {
  return REDIRECT_URI;
}

/**
 * Get stored code verifier (for token exchange)
 */
export function getStoredCodeVerifier(): string | null {
  return sessionStorage.getItem('tiktok_code_verifier');
}

export default {
  initiateTikTokOAuth,
  isTikTokConfigured,
  getTikTokRedirectUri,
  getStoredCodeVerifier
};
