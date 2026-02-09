/**
 * SOCIAL MEDIA OAUTH CONNECTIONS
 * ===============================
 * Handles OAuth flows for Twitter/X, LinkedIn, and Facebook.
 * Each platform requires a developer app registered with their API.
 *
 * Flow:
 *  1. User clicks "Connect Twitter" in Hofund Studio
 *  2. Opens OAuth popup → user authorizes
 *  3. Callback receives token → stored in social_media_plugs table
 *  4. Token used for posting via edge functions
 *
 * SETUP REQUIRED:
 *  - Twitter: Create app at developer.twitter.com, set callback URL
 *  - LinkedIn: Create app at linkedin.com/developers
 *  - Facebook: Create app at developers.facebook.com
 *  - Set secrets in Supabase: TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, etc.
 */

import { supabase } from "@/integrations/supabase/client";

export type SocialPlatform = "twitter" | "linkedin" | "facebook";

export interface SocialConnection {
  platform: SocialPlatform;
  isConnected: boolean;
  username?: string;
  lastPostedAt?: string;
  postCount: number;
}

// OAuth endpoint configuration
const OAUTH_CONFIG: Record<SocialPlatform, { authUrl: string; scope: string }> = {
  twitter: {
    authUrl: "https://twitter.com/i/oauth2/authorize",
    scope: "tweet.read tweet.write users.read offline.access",
  },
  linkedin: {
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    scope: "openid profile w_member_social",
  },
  facebook: {
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    scope: "pages_manage_posts,pages_read_engagement",
  },
};

/**
 * Initiate OAuth flow for a social platform.
 * Opens a popup window that redirects to the platform's OAuth page.
 * The callback URL should point to a Supabase edge function that
 * handles the token exchange and stores it.
 */
export async function connectPlatform(platform: SocialPlatform): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  // Generate state parameter for CSRF protection
  const state = btoa(JSON.stringify({
    userId: user.id,
    platform,
    timestamp: Date.now(),
  }));

  // Store state in session for verification
  sessionStorage.setItem("oauth_state", state);

  // Get the callback URL from the edge function
  const callbackUrl = `${window.location.origin}/api/social-oauth-callback`;

  const config = OAUTH_CONFIG[platform];

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
 * Disconnect a social platform.
 */
export async function disconnectPlatform(platform: SocialPlatform): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  await supabase
    .from("social_media_plugs")
    .update({
      is_connected: false,
      access_token: null,
      refresh_token: null,
      token_expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("platform", platform);
}

/**
 * Get all social connections for the current user.
 */
export async function getConnections(): Promise<SocialConnection[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("social_media_plugs")
    .select("platform, is_connected, platform_username, last_posted_at, post_count")
    .eq("user_id", user.id);

  const platforms: SocialPlatform[] = ["twitter", "linkedin", "facebook"];

  return platforms.map((platform) => {
    const plug = data?.find((d) => d.platform === platform);
    return {
      platform,
      isConnected: plug?.is_connected || false,
      username: plug?.platform_username || undefined,
      lastPostedAt: plug?.last_posted_at || undefined,
      postCount: plug?.post_count || 0,
    };
  });
}

/**
 * Post to a connected platform via edge function.
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

  const { data, error } = await supabase
    .from("scheduled_posts")
    .insert({
      user_id: user.id,
      post_text: text,
      post_image_url: imageUrl || null,
      share_url: `https://lianabanyan.com/RedCarpet?herald=${user.id}`,
      platform,
      plug_id: plugId || null,
      scheduled_for: scheduledFor.toISOString(),
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
    .from("scheduled_posts")
    .select("*")
    .eq("user_id", user.id)
    .order("scheduled_for", { ascending: true });

  return data || [];
}
