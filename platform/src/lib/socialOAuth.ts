/**
 * SOCIAL MEDIA OAUTH CONNECTIONS
 * ===============================
 * Handles OAuth flows for Twitter/X, LinkedIn, Facebook, and more.
 * Each platform requires a developer app registered with their API.
 *
 * MULTI-ACCOUNT SUPPORT (Feb 2026):
 *  - Members can connect up to 6 accounts per platform
 *  - Example: Official, Personal, Silly, Friends, Junk accounts
 *  - One account per platform can be marked as "default"
 *  - Cue card dispatch allows selecting multiple accounts to post to
 *
 * Flow:
 *  1. User clicks "Connect Twitter" in Hofund Studio
 *  2. Opens OAuth popup → user authorizes
 *  3. Callback receives token → stored in member_social_accounts table
 *  4. Token used for posting via edge functions
 *
 * SETUP REQUIRED:
 *  - Twitter: Create app at developer.twitter.com, set callback URL
 *  - LinkedIn: Create app at linkedin.com/developers
 *  - Facebook: Create app at developers.facebook.com
 *  - Set secrets in Supabase: TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, etc.
 */

import { supabase } from "@/integrations/supabase/client";

export type SocialPlatform =
  | "twitter"
  | "linkedin"
  | "facebook"
  | "bluesky"
  | "threads"
  | "tiktok"
  | "instagram"
  | "imgur";

/** Maximum accounts per platform per user */
export const MAX_ACCOUNTS_PER_PLATFORM = 6;

/** Single account connection (supports multiple per platform) */
export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  platformUserId?: string;
  accountHandle?: string;
  accountNickname?: string;  // User-friendly name: "Official", "Silly", etc.
  isActive: boolean;
  isDefault: boolean;
  displayOrder: number;
  lastUsedAt?: string;
  createdAt: string;
}

/** Legacy interface for backward compatibility */
export interface SocialConnection {
  platform: SocialPlatform;
  isConnected: boolean;
  username?: string;
  lastPostedAt?: string;
  postCount: number;
  isConfigured: boolean;  // Whether API keys are set up
  accounts: SocialAccount[];  // All connected accounts for this platform
}

// OAuth endpoint configuration
// Platforms marked with isConfigured: false need API setup before use
const OAUTH_CONFIG: Record<SocialPlatform, { 
  authUrl: string; 
  scope: string; 
  isConfigured: boolean;
  setupNotes?: string;
}> = {
  twitter: {
    authUrl: "https://twitter.com/i/oauth2/authorize",
    scope: "tweet.read tweet.write users.read offline.access",
    isConfigured: true,
  },
  linkedin: {
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    scope: "openid profile w_member_social",
    isConfigured: true,
  },
  facebook: {
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    scope: "pages_manage_posts,pages_read_engagement",
    isConfigured: true,
  },
  bluesky: {
    authUrl: "", // AT Protocol uses App Passwords, not OAuth
    scope: "",
    isConfigured: true,
    setupNotes: "Uses App Passwords instead of OAuth. Click Connect to enter your handle and app password.",
  },
  threads: {
    authUrl: "https://graph.threads.net/oauth/authorize",
    scope: "threads_basic,threads_content_publish",
    isConfigured: true,
    setupNotes: "Uses same Meta/Facebook App credentials",
  },
  tiktok: {
    authUrl: "https://www.tiktok.com/v2/auth/authorize/",
    scope: "user.info.basic,video.publish,video.upload",
    isConfigured: true,
    setupNotes: "TikTok requires video content - text-only posts not supported",
  },
  instagram: {
    authUrl: "https://api.instagram.com/oauth/authorize",
    scope: "instagram_basic,instagram_content_publish",
    isConfigured: true,
    setupNotes: "Instagram requires image/video content - text-only posts not supported",
  },
  imgur: {
    authUrl: "https://api.imgur.com/oauth2/authorize",
    scope: "",
    isConfigured: true,
    setupNotes: "Imgur supports image uploads, gallery posts, and community sharing. Used for Deck Card exports and Cue Card distribution.",
  },
};

/**
 * Initiate OAuth flow for a social platform.
 * Opens a popup window that redirects to the platform's OAuth page.
 * The callback URL should point to a Supabase edge function that
 * handles the token exchange and stores it.
 */
/**
 * Check if a platform is configured (API keys set up)
 */
export function isPlatformConfigured(platform: SocialPlatform): boolean {
  return OAUTH_CONFIG[platform]?.isConfigured ?? false;
}

/**
 * Get setup notes for an unconfigured platform
 */
export function getPlatformSetupNotes(platform: SocialPlatform): string | undefined {
  return OAUTH_CONFIG[platform]?.setupNotes;
}

/**
 * Get list of all platforms with their configuration status
 */
export function getAllPlatforms(): Array<{ platform: SocialPlatform; isConfigured: boolean; setupNotes?: string }> {
  return (Object.keys(OAUTH_CONFIG) as SocialPlatform[]).map(platform => ({
    platform,
    isConfigured: OAUTH_CONFIG[platform].isConfigured,
    setupNotes: OAUTH_CONFIG[platform].setupNotes,
  }));
}

/**
 * Initiate OAuth flow for a social platform.
 * Opens a popup window that redirects to the platform's OAuth page.
 * The callback URL should point to a Supabase edge function that
 * handles the token exchange and stores it.
 */
export async function connectPlatform(platform: SocialPlatform): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  const config = OAUTH_CONFIG[platform];
  
  // Check if platform is configured
  if (!config.isConfigured) {
    throw new Error(`${platform} is not yet configured. ${config.setupNotes || 'Contact admin for setup.'}`);
  }

  // Special handling for Bluesky (AT Protocol, not OAuth)
  if (platform === "bluesky") {
    throw new Error("Bluesky uses App Passwords instead of OAuth. Use connectBluesky() instead.");
  }

  // Generate state parameter for CSRF protection
  const state = btoa(JSON.stringify({
    userId: user.id,
    platform,
    timestamp: Date.now(),
  }));

  // Store state in session for verification
  sessionStorage.setItem("oauth_state", state);

  // Get the callback URL - this goes to the Supabase edge function
  // The edge function handles the token exchange and stores credentials
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ruuxzilgmuwddcofqecc.supabase.co';
  const callbackUrl = `${supabaseUrl}/functions/v1/social-oauth-callback`;

  // Build OAuth URL
  const params = new URLSearchParams({
    response_type: "code",
    scope: config.scope,
    state,
    redirect_uri: callbackUrl,
  });

  // Platform-specific client ID params
  if (platform === "twitter") {
    params.set("client_id", import.meta.env.VITE_TWITTER_CLIENT_ID || "TWITTER_CLIENT_ID_NOT_SET");
    params.set("code_challenge", "challenge"); // PKCE
    params.set("code_challenge_method", "plain");
  } else if (platform === "linkedin") {
    params.set("client_id", import.meta.env.VITE_LINKEDIN_CLIENT_ID || "LINKEDIN_CLIENT_ID_NOT_SET");
  } else if (platform === "facebook") {
    params.set("client_id", import.meta.env.VITE_FACEBOOK_APP_ID || "FACEBOOK_APP_ID_NOT_SET");
  } else if (platform === "threads") {
    // Threads uses same Meta/Facebook app
    params.set("client_id", import.meta.env.VITE_FACEBOOK_APP_ID || "FACEBOOK_APP_ID_NOT_SET");
  } else if (platform === "instagram") {
    // Instagram uses same Meta/Facebook app
    params.set("client_id", import.meta.env.VITE_FACEBOOK_APP_ID || "FACEBOOK_APP_ID_NOT_SET");
  } else if (platform === "tiktok") {
    params.set("client_key", import.meta.env.VITE_TIKTOK_CLIENT_KEY || "TIKTOK_CLIENT_KEY_NOT_SET");
    params.set("response_type", "code");
  } else if (platform === "imgur") {
    params.set("client_id", import.meta.env.VITE_IMGUR_CLIENT_ID || "IMGUR_CLIENT_ID_NOT_SET");
    params.set("response_type", "code");
  }

  const authUrl = `${config.authUrl}?${params.toString()}`;

  // Open popup
  const popup = window.open(authUrl, `Connect ${platform}`, "width=600,height=700,scrollbars=yes");

  // Poll for popup close (token exchange handled by callback)
  if (popup) {
    const pollTimer = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollTimer);
        // Refresh connections after popup closes
        window.dispatchEvent(new CustomEvent("social-oauth-complete", { detail: { platform } }));
      }
    }, 500);
  }
}

/**
 * Connect to Bluesky using AT Protocol (App Password)
 * Bluesky doesn't use OAuth — it uses handle + app password
 * Supports multiple accounts with optional nickname
 */
export async function connectBluesky(
  handle: string, 
  appPassword: string,
  nickname?: string,
  service: string = "https://bsky.social"
): Promise<{ success: boolean; error?: string; accountId?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Must be logged in" };

  try {
    // Check account limit
    const { count } = await supabase
      .from("member_social_accounts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("platform", "bluesky")
      .eq("is_active", true);

    if ((count || 0) >= MAX_ACCOUNTS_PER_PLATFORM) {
      return { 
        success: false, 
        error: `Maximum ${MAX_ACCOUNTS_PER_PLATFORM} Bluesky accounts reached. Disconnect one first.` 
      };
    }

    // Create session with Bluesky AT Protocol
    const response = await fetch(`${service}/xrpc/com.atproto.server.createSession`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: handle, password: appPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Failed to authenticate with Bluesky" };
    }

    const session = await response.json();

    // Check if this specific account is already connected
    const { data: existing } = await supabase
      .from("member_social_accounts")
      .select("id")
      .eq("user_id", user.id)
      .eq("platform", "bluesky")
      .eq("platform_user_id", session.did)
      .single();

    if (existing) {
      // Update existing account
      const { data } = await supabase
        .from("member_social_accounts")
        .update({
          account_handle: session.handle,
          account_nickname: nickname || null,
          access_token: session.accessJwt,
          refresh_token: session.refreshJwt,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select("id")
        .single();

      return { success: true, accountId: data?.id };
    }

    // Insert new account
    const isFirstAccount = (count || 0) === 0;
    const { data, error } = await supabase
      .from("member_social_accounts")
      .insert({
        user_id: user.id,
        platform: "bluesky",
        platform_user_id: session.did,
        account_handle: session.handle,
        account_nickname: nickname || null,
        access_token: session.accessJwt,
        refresh_token: session.refreshJwt,
        is_active: true,
        is_default: isFirstAccount,  // First account is default
        display_order: count || 0,
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, accountId: data?.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Disconnect a specific social account by ID.
 * Use this for multi-account support.
 */
export async function disconnectAccount(accountId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  await supabase
    .from("member_social_accounts")
    .update({
      is_active: false,
      access_token: null,
      refresh_token: null,
      token_expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", accountId)
    .eq("user_id", user.id);  // Security: ensure user owns this account
}

/**
 * Disconnect ALL accounts for a platform (legacy behavior).
 */
export async function disconnectPlatform(platform: SocialPlatform): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  await supabase
    .from("member_social_accounts")
    .update({
      is_active: false,
      access_token: null,
      refresh_token: null,
      token_expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("platform", platform);
}

/**
 * Set an account as the default for its platform.
 */
export async function setDefaultAccount(accountId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  // The database trigger will automatically unset other defaults
  await supabase
    .from("member_social_accounts")
    .update({ is_default: true })
    .eq("id", accountId)
    .eq("user_id", user.id);
}

/**
 * Update account nickname.
 */
export async function updateAccountNickname(accountId: string, nickname: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  await supabase
    .from("member_social_accounts")
    .update({ 
      account_nickname: nickname,
      updated_at: new Date().toISOString(),
    })
    .eq("id", accountId)
    .eq("user_id", user.id);
}

/**
 * Get ALL social accounts for the current user (multi-account support).
 */
export async function getAllAccounts(): Promise<SocialAccount[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("member_social_accounts")
    .select("id, platform, platform_user_id, account_handle, account_nickname, is_active, is_default, display_order, last_used_at, created_at")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("platform")
    .order("display_order");

  return (data || []).map((row) => ({
    id: row.id,
    platform: row.platform as SocialPlatform,
    platformUserId: row.platform_user_id || undefined,
    accountHandle: row.account_handle || undefined,
    accountNickname: row.account_nickname || undefined,
    isActive: row.is_active,
    isDefault: row.is_default || false,
    displayOrder: row.display_order || 0,
    lastUsedAt: row.last_used_at || undefined,
    createdAt: row.created_at,
  }));
}

/**
 * Get accounts for a specific platform.
 */
export async function getAccountsForPlatform(platform: SocialPlatform): Promise<SocialAccount[]> {
  const allAccounts = await getAllAccounts();
  return allAccounts.filter((a) => a.platform === platform);
}

/**
 * Get all social connections for the current user (legacy + multi-account).
 * Returns one entry per platform with all accounts nested.
 */
export async function getConnections(): Promise<SocialConnection[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("member_social_accounts")
    .select("id, platform, platform_user_id, account_handle, account_nickname, is_active, is_default, display_order, last_used_at, created_at")
    .eq("user_id", user.id)
    .order("platform")
    .order("display_order");

  // All supported platforms
  const platforms: SocialPlatform[] = [
    "twitter",
    "linkedin",
    "facebook",
    "bluesky",
    "threads",
    "tiktok",
    "instagram",
    "imgur",
  ];

  return platforms.map((platform) => {
    const platformAccounts = (data || [])
      .filter((d) => d.platform === platform && d.is_active)
      .map((row) => ({
        id: row.id,
        platform: row.platform as SocialPlatform,
        platformUserId: row.platform_user_id || undefined,
        accountHandle: row.account_handle || undefined,
        accountNickname: row.account_nickname || undefined,
        isActive: row.is_active,
        isDefault: row.is_default || false,
        displayOrder: row.display_order || 0,
        lastUsedAt: row.last_used_at || undefined,
        createdAt: row.created_at,
      }));

    const defaultAccount = platformAccounts.find((a) => a.isDefault) || platformAccounts[0];

    return {
      platform,
      isConnected: platformAccounts.length > 0,
      username: defaultAccount?.accountHandle || undefined,
      lastPostedAt: defaultAccount?.lastUsedAt || undefined,
      postCount: 0,
      isConfigured: OAUTH_CONFIG[platform]?.isConfigured ?? false,
      accounts: platformAccounts,
    };
  });
}

/**
 * Post to a specific account via edge function.
 * Use accountId for multi-account support.
 */
export async function postToAccount(
  accountId: string,
  text: string,
  imageUrl?: string
): Promise<{ success: boolean; postUrl?: string; error?: string }> {
  const response = await supabase.functions.invoke("social-post", {
    body: { accountId, text, imageUrl },
  });

  if (response.error) {
    return { success: false, error: response.error.message };
  }

  return response.data;
}

/**
 * Post to multiple accounts at once.
 * Returns results for each account.
 */
export async function postToMultipleAccounts(
  accountIds: string[],
  text: string,
  imageUrl?: string
): Promise<Array<{ accountId: string; success: boolean; postUrl?: string; error?: string }>> {
  const results = await Promise.all(
    accountIds.map(async (accountId) => {
      const result = await postToAccount(accountId, text, imageUrl);
      return { accountId, ...result };
    })
  );
  return results;
}

/**
 * Post to a connected platform via edge function (legacy - uses default account).
 */
export async function postToSocial(
  platform: SocialPlatform,
  text: string,
  imageUrl?: string
): Promise<{ success: boolean; postUrl?: string; error?: string }> {
  const response = await supabase.functions.invoke("social-post", {
    body: { platform, text, imageUrl },
  });

  if (response.error) {
    return { success: false, error: response.error.message };
  }

  return response.data;
}

/**
 * Schedule a post for later.
 */
export async function schedulePost(
  platform: SocialPlatform,
  text: string,
  scheduledFor: Date,
  imageUrl?: string,
  plugId?: string
): Promise<{ success: boolean; postId?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  // Real table: member_scheduled_posts
  const { data, error } = await supabase
    .from("member_scheduled_posts")
    .insert({
      user_id: user.id,
      content: text,
      link_url: `https://lianabanyan.com/RedCarpet?herald=${user.id}`,
      hashtags: ["LianaBanyan"],
      scheduled_for: scheduledFor.toISOString(),
      time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      status: "scheduled",
    })
    .select("id")
    .single();

  if (error) return { success: false };
  return { success: true, postId: data.id };
}

/**
 * Get scheduled posts for current user.
 */
export async function getScheduledPosts() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("member_scheduled_posts")
    .select("*")
    .eq("user_id", user.id)
    .order("scheduled_for", { ascending: true });

  return data || [];
}

/**
 * Get count of accounts for a platform (for limit checking).
 */
export async function getAccountCount(platform: SocialPlatform): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("member_social_accounts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("platform", platform)
    .eq("is_active", true);

  return count || 0;
}

/**
 * Check if user can add another account for a platform.
 */
export async function canAddAccount(platform: SocialPlatform): Promise<boolean> {
  const count = await getAccountCount(platform);
  return count < MAX_ACCOUNTS_PER_PLATFORM;
}
