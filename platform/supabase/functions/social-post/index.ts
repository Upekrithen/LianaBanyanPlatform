/**
 * SOCIAL POST — Immediate Posting to Social Media
 * ================================================
 * Posts immediately to a connected social media platform.
 * Used by the Hofund Studio, Family Table, and Cue Card Dispatch features.
 * 
 * MULTI-ACCOUNT SUPPORT (Feb 2026):
 * - Members can connect up to 6 accounts per platform
 * - Use accountId to post to a specific account
 * - Use platform to post to the default account (legacy)
 * 
 * Supports: Twitter/X, LinkedIn, Facebook, Bluesky, TikTok, Instagram, Threads
 * 
 * Request body:
 *   - accountId?: string (specific account ID - preferred for multi-account)
 *   - platform?: string (fallback: uses default account for platform)
 *   - text: string (the post content)
 *   - imageUrl?: string (optional image to attach)
 *   - videoUrl?: string (required for TikTok)
 * 
 * Returns:
 *   - success: boolean
 *   - postUrl?: string (URL to the created post)
 *   - error?: string
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type SocialPlatform = 'twitter' | 'linkedin' | 'facebook' | 'bluesky' | 'threads' | 'instagram' | 'tiktok' | 'reddit' | 'discord';

interface PostRequest {
  accountId?: string;  // Specific account ID (multi-account support)
  platform?: SocialPlatform;  // Fallback: use default account for platform
  text: string;
  imageUrl?: string;
  videoUrl?: string;  // Required for TikTok
}

interface PostResponse {
  success: boolean;
  postUrl?: string;
  postId?: string;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: PostRequest = await req.json();
    const { accountId, platform, text, imageUrl, videoUrl } = body;

    if (!text) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!accountId && !platform) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing accountId or platform' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's OAuth credentials
    // Use service role to read tokens (they may be encrypted/sensitive)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let socialAccount;
    let accountError;

    if (accountId) {
      // Multi-account mode: fetch specific account by ID
      console.log(`📤 Posting to account ${accountId} for user ${user.id}`);
      
      const result = await supabaseAdmin
        .from('member_social_accounts')
        .select('*')
        .eq('id', accountId)
        .eq('user_id', user.id)  // Security: ensure user owns this account
        .eq('is_active', true)
        .single();
      
      socialAccount = result.data;
      accountError = result.error;
    } else {
      // Legacy mode: fetch default account for platform
      console.log(`📤 Posting to ${platform} (default) for user ${user.id}`);
      
      // First try to get the default account
      let result = await supabaseAdmin
        .from('member_social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', platform)
        .eq('is_active', true)
        .eq('is_default', true)
        .single();
      
      // If no default, get the first active account
      if (result.error || !result.data) {
        result = await supabaseAdmin
          .from('member_social_accounts')
          .select('*')
          .eq('user_id', user.id)
          .eq('platform', platform)
          .eq('is_active', true)
          .order('created_at', { ascending: true })
          .limit(1)
          .single();
      }
      
      socialAccount = result.data;
      accountError = result.error;
    }

    const effectivePlatform = socialAccount?.platform || platform;

    if (accountError || !socialAccount) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: accountId 
            ? `Account not found or not active.`
            : `No connected ${platform} account. Please connect your account first.` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!socialAccount.access_token) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `${effectivePlatform} access token expired. Please reconnect your account.` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Post to the platform
    let result: PostResponse;

    switch (effectivePlatform) {
      case 'twitter':
        result = await postToTwitter(socialAccount.access_token, text, imageUrl);
        break;
      case 'linkedin':
        result = await postToLinkedIn(
          socialAccount.access_token, 
          socialAccount.platform_user_id,
          text
        );
        break;
      case 'facebook':
        result = await postToFacebook(
          socialAccount.access_token,
          socialAccount.platform_user_id,
          text
        );
        break;
      case 'bluesky':
        result = await postToBluesky(
          socialAccount.access_token,
          socialAccount.account_handle,
          text
        );
        break;
      case 'tiktok':
        result = await postToTikTok(
          socialAccount.access_token,
          socialAccount.platform_user_id,
          text,
          videoUrl
        );
        break;
      case 'instagram':
        result = await postToInstagram(
          socialAccount.access_token,
          socialAccount.platform_user_id,
          text,
          imageUrl
        );
        break;
      case 'threads':
        result = await postToThreads(
          socialAccount.access_token,
          socialAccount.platform_user_id,
          text
        );
        break;
      case 'reddit':
        result = await postToReddit(
          socialAccount.access_token,
          socialAccount.platform_config,
          text
        );
        break;
      case 'discord':
        result = await postToDiscord(
          socialAccount.access_token,
          text
        );
        break;
      default:
        result = { success: false, error: `Platform ${effectivePlatform} not yet supported for posting` };
    }

    // Update last used timestamp
    if (result.success) {
      await supabaseAdmin
        .from('member_social_accounts')
        .update({ 
          last_used_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', socialAccount.id);

      console.log(`✅ Successfully posted to ${effectivePlatform} (account: ${socialAccount.account_handle || socialAccount.id})`);
    } else {
      console.error(`❌ Failed to post to ${effectivePlatform}: ${result.error}`);
    }

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (err) {
    console.error('Social post error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ─── PLATFORM-SPECIFIC POSTING FUNCTIONS ───

/**
 * Post to Twitter/X using OAuth 2.0
 */
async function postToTwitter(
  accessToken: string, 
  text: string,
  imageUrl?: string
): Promise<PostResponse> {
  try {
    let mediaId: string | undefined;
    
    // Handle image upload if imageUrl provided
    // Twitter requires uploading media separately first
    if (imageUrl) {
      try {
        // Fetch the image data
        const imageRes = await fetch(imageUrl);
        if (imageRes.ok) {
          const imageBlob = await imageRes.blob();
          const formData = new FormData();
          formData.append('media', imageBlob);
          
          // Upload to Twitter
          const uploadRes = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
            body: formData,
          });
          
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            mediaId = uploadData.media_id_string;
          } else {
            console.error('Twitter media upload failed:', await uploadRes.text());
          }
        }
      } catch (mediaErr) {
        console.error('Error uploading media to Twitter:', mediaErr);
      }
    }
    
    const tweetPayload: any = { text };
    if (mediaId) {
      tweetPayload.media = { media_ids: [mediaId] };
    }

    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tweetPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twitter API response:', errorText);
      
      // Check for specific errors
      if (response.status === 401) {
        return { success: false, error: 'Twitter token expired. Please reconnect your account.' };
      }
      if (response.status === 403) {
        return { success: false, error: 'Twitter rejected the post. Check your app permissions.' };
      }
      
      return { success: false, error: `Twitter API error: ${response.status}` };
    }

    const data = await response.json();
    const postUrl = `https://twitter.com/i/web/status/${data.data.id}`;
    
    return { success: true, postUrl, postId: data.data.id };
  } catch (err) {
    return { success: false, error: `Twitter error: ${err.message}` };
  }
}

/**
 * Post to LinkedIn using OAuth 2.0
 */
async function postToLinkedIn(
  accessToken: string,
  authorId: string | null,
  text: string
): Promise<PostResponse> {
  try {
    if (!authorId) {
      return { success: false, error: 'LinkedIn author ID not found. Please reconnect.' };
    }

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: `urn:li:person:${authorId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LinkedIn API response:', errorText);
      
      if (response.status === 401) {
        return { success: false, error: 'LinkedIn token expired. Please reconnect your account.' };
      }
      
      return { success: false, error: `LinkedIn API error: ${response.status}` };
    }

    // LinkedIn returns the post URN in the header
    const postUrn = response.headers.get('x-restli-id');
    
    return { success: true, postId: postUrn || undefined };
  } catch (err) {
    return { success: false, error: `LinkedIn error: ${err.message}` };
  }
}

/**
 * Post to Facebook Page using Graph API
 */
async function postToFacebook(
  accessToken: string,
  pageId: string | null,
  text: string
): Promise<PostResponse> {
  try {
    const targetId = pageId || 'me';
    
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${targetId}/feed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          access_token: accessToken,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Facebook API response:', errorData);
      
      if (errorData.error?.code === 190) {
        return { success: false, error: 'Facebook token expired. Please reconnect your account.' };
      }
      
      return { success: false, error: `Facebook API error: ${errorData.error?.message || response.status}` };
    }

    const data = await response.json();
    const postUrl = `https://facebook.com/${data.id}`;
    
    return { success: true, postUrl, postId: data.id };
  } catch (err) {
    return { success: false, error: `Facebook error: ${err.message}` };
  }
}

/**
 * Post to Bluesky using AT Protocol
 */
async function postToBluesky(
  accessToken: string,
  handle: string | null,
  text: string
): Promise<PostResponse> {
  try {
    const service = Deno.env.get('BLUESKY_SERVICE') || 'https://bsky.social';
    
    // Create a post record
    const response = await fetch(`${service}/xrpc/com.atproto.repo.createRecord`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repo: handle,
        collection: 'app.bsky.feed.post',
        record: {
          text,
          createdAt: new Date().toISOString(),
          $type: 'app.bsky.feed.post',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Bluesky API response:', errorText);
      
      if (response.status === 401) {
        return { success: false, error: 'Bluesky session expired. Please reconnect your account.' };
      }
      
      return { success: false, error: `Bluesky API error: ${response.status}` };
    }

    const data = await response.json();
    // Construct the post URL from the URI
    // URI format: at://did:plc:xxx/app.bsky.feed.post/xxx
    const rkey = data.uri.split('/').pop();
    const postUrl = `https://bsky.app/profile/${handle}/post/${rkey}`;
    
    return { success: true, postUrl, postId: data.uri };
  } catch (err) {
    return { success: false, error: `Bluesky error: ${err.message}` };
  }
}

/**
 * Post to TikTok using Content Posting API
 * Note: TikTok requires video content - text-only posts are not supported
 * The video must be uploaded first, then the post is created
 */
async function postToTikTok(
  accessToken: string,
  openId: string | null,
  caption: string,
  videoUrl?: string
): Promise<PostResponse> {
  try {
    if (!videoUrl) {
      return { 
        success: false, 
        error: 'TikTok requires a video URL. Text-only posts are not supported.' 
      };
    }

    if (!openId) {
      return { success: false, error: 'TikTok user ID not found. Please reconnect.' };
    }

    // Step 1: Initialize video upload
    const initResponse = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        post_info: {
          title: caption.substring(0, 150), // TikTok title limit
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: videoUrl,
        },
      }),
    });

    if (!initResponse.ok) {
      const errorData = await initResponse.json();
      console.error('TikTok init response:', errorData);

      if (initResponse.status === 401) {
        return { success: false, error: 'TikTok token expired. Please reconnect your account.' };
      }

      return { 
        success: false, 
        error: `TikTok API error: ${errorData.error?.message || initResponse.status}` 
      };
    }

    const initData = await initResponse.json();
    
    // TikTok returns a publish_id for tracking
    // The actual post URL won't be available until processing completes
    return { 
      success: true, 
      postId: initData.data?.publish_id,
      // TikTok doesn't give us a direct URL immediately - video is processing
    };
  } catch (err) {
    return { success: false, error: `TikTok error: ${err.message}` };
  }
}

/**
 * Post to Instagram using Instagram Graph API (Business/Creator accounts only)
 * Requires: instagram_content_publish permission
 * Note: Instagram requires either an image or video - text-only not supported
 */
async function postToInstagram(
  accessToken: string,
  igUserId: string | null,
  caption: string,
  imageUrl?: string
): Promise<PostResponse> {
  try {
    if (!imageUrl) {
      return { 
        success: false, 
        error: 'Instagram requires an image URL. Text-only posts are not supported.' 
      };
    }

    if (!igUserId) {
      return { success: false, error: 'Instagram user ID not found. Please reconnect.' };
    }

    // Step 1: Create media container
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${igUserId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption,
          access_token: accessToken,
        }),
      }
    );

    if (!containerResponse.ok) {
      const errorData = await containerResponse.json();
      console.error('Instagram container response:', errorData);

      if (errorData.error?.code === 190) {
        return { success: false, error: 'Instagram token expired. Please reconnect your account.' };
      }

      return { 
        success: false, 
        error: `Instagram API error: ${errorData.error?.message || containerResponse.status}` 
      };
    }

    const containerData = await containerResponse.json();
    const containerId = containerData.id;

    // Step 2: Publish the container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${igUserId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken,
        }),
      }
    );

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json();
      console.error('Instagram publish response:', errorData);

      return { 
        success: false, 
        error: `Instagram publish error: ${errorData.error?.message || publishResponse.status}` 
      };
    }

    const publishData = await publishResponse.json();
    
    // Get the post permalink
    const mediaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${publishData.id}?fields=permalink&access_token=${accessToken}`
    );

    let postUrl: string | undefined;
    if (mediaResponse.ok) {
      const mediaData = await mediaResponse.json();
      postUrl = mediaData.permalink;
    }

    return { success: true, postUrl, postId: publishData.id };
  } catch (err) {
    return { success: false, error: `Instagram error: ${err.message}` };
  }
}

/**
 * Post to Threads using Threads API (part of Meta/Instagram)
 * Note: Threads API was released in 2024 and supports text posts
 */
async function postToThreads(
  accessToken: string,
  threadsUserId: string | null,
  text: string
): Promise<PostResponse> {
  try {
    if (!threadsUserId) {
      return { success: false, error: 'Threads user ID not found. Please reconnect.' };
    }

    // Step 1: Create media container for text post
    const containerResponse = await fetch(
      `https://graph.threads.net/v1.0/${threadsUserId}/threads`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_type: 'TEXT',
          text: text,
          access_token: accessToken,
        }),
      }
    );

    if (!containerResponse.ok) {
      const errorData = await containerResponse.json();
      console.error('Threads container response:', errorData);

      if (containerResponse.status === 401 || errorData.error?.code === 190) {
        return { success: false, error: 'Threads token expired. Please reconnect your account.' };
      }

      return { 
        success: false, 
        error: `Threads API error: ${errorData.error?.message || containerResponse.status}` 
      };
    }

    const containerData = await containerResponse.json();
    const containerId = containerData.id;

    // Step 2: Publish the thread
    const publishResponse = await fetch(
      `https://graph.threads.net/v1.0/${threadsUserId}/threads_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken,
        }),
      }
    );

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json();
      console.error('Threads publish response:', errorData);

      return { 
        success: false, 
        error: `Threads publish error: ${errorData.error?.message || publishResponse.status}` 
      };
    }

    const publishData = await publishResponse.json();
    
    // Get the post permalink
    const mediaResponse = await fetch(
      `https://graph.threads.net/v1.0/${publishData.id}?fields=permalink&access_token=${accessToken}`
    );

    let postUrl: string | undefined;
    if (mediaResponse.ok) {
      const mediaData = await mediaResponse.json();
      postUrl = mediaData.permalink;
    }

    return { success: true, postUrl, postId: publishData.id };
  } catch (err) {
    return { success: false, error: `Threads error: ${err.message}` };
  }
}

/**
 * Post to Reddit via OAuth API
 * access_token from member_social_accounts, subreddit from platform_config or OOB plug config
 */
async function postToReddit(
  accessToken: string,
  platformConfig: Record<string, any> | null,
  text: string
): Promise<PostResponse> {
  try {
    const subreddit = platformConfig?.subreddit || platformConfig?.subreddits;
    if (!subreddit) {
      return { success: false, error: 'No subreddit configured. Add a subreddit to your Reddit account settings.' };
    }

    const lines = text.split('\n');
    const title = lines[0].substring(0, 300);
    const body = lines.slice(1).join('\n').trim();

    const params = new URLSearchParams({
      kind: 'self',
      sr: subreddit,
      title,
      text: body || title,
    });

    const response = await fetch('https://oauth.reddit.com/api/submit', {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${accessToken}`,
        'User-Agent': 'LianaBanyan/1.0',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Reddit API response:', errorText);

      if (response.status === 401) {
        return { success: false, error: 'Reddit token expired. Please reconnect your account.' };
      }

      return { success: false, error: `Reddit API error: ${response.status}` };
    }

    const data = await response.json();

    if (data.json?.errors?.length > 0) {
      return { success: false, error: `Reddit: ${data.json.errors.map((e: any) => e[1]).join(', ')}` };
    }

    const postUrl = data.json?.data?.url;
    const postId = data.json?.data?.name;

    return { success: true, postUrl, postId };
  } catch (err) {
    return { success: false, error: `Reddit error: ${err.message}` };
  }
}

/**
 * Post to Discord via webhook URL
 * The access_token field stores the webhook URL for Discord accounts
 */
async function postToDiscord(
  webhookUrl: string,
  text: string
): Promise<PostResponse> {
  try {
    if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      return { success: false, error: 'Invalid Discord webhook URL. Please update your Discord connection.' };
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: text,
        username: 'Liana Banyan',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord webhook response:', errorText);

      if (response.status === 404) {
        return { success: false, error: 'Discord webhook not found. The channel may have been deleted.' };
      }

      return { success: false, error: `Discord webhook error: ${response.status}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: `Discord error: ${err.message}` };
  }
}
