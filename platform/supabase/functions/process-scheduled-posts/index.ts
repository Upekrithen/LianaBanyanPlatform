/**
 * PROCESS SCHEDULED SOCIAL MEDIA POSTS
 * =====================================
 * Cron-based function that runs every 5 minutes.
 * Picks up posts from scheduled_posts where scheduled_for <= NOW.
 * Posts to the connected social platform using stored OAuth tokens.
 *
 * Schedule: */5 * * * * (every 5 minutes)
 * Set in supabase/config.toml:
 *   [functions.process-scheduled-posts]
 *   schedule = "*/5 * * * *"
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch posts that are due
    const { data: pendingPosts, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select('*, social_media_plugs(*)')
      .eq('status', 'scheduled')
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(10); // Process 10 at a time

    if (fetchError) throw fetchError;

    if (!pendingPosts || pendingPosts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending posts', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${pendingPosts.length} scheduled posts`);

    let successCount = 0;
    let failCount = 0;

    for (const post of pendingPosts) {
      try {
        // Mark as posting
        await supabase
          .from('scheduled_posts')
          .update({ status: 'posting', updated_at: new Date().toISOString() })
          .eq('id', post.id);

        // Get the user's OAuth token for this platform
        const plug = post.social_media_plugs;

        if (!plug || !plug.is_connected || !plug.access_token) {
          throw new Error(`No connected ${post.platform} account`);
        }

        // Post to the platform
        let postUrl: string | null = null;

        if (post.platform === 'twitter') {
          postUrl = await postToTwitter(plug.access_token, post.post_text);
        } else if (post.platform === 'linkedin') {
          postUrl = await postToLinkedIn(plug.access_token, plug.platform_user_id, post.post_text);
        } else if (post.platform === 'facebook') {
          postUrl = await postToFacebook(plug.access_token, plug.platform_user_id, post.post_text);
        }

        // Mark as posted
        await supabase
          .from('scheduled_posts')
          .update({
            status: 'posted',
            posted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', post.id);

        // If this is a Herald post, record it
        if (post.herald_post_id) {
          await supabase
            .from('herald_posts')
            .update({
              posted_at: new Date().toISOString(),
              post_url: postUrl,
              status: 'posted',
            })
            .eq('id', post.herald_post_id);
        }

        // Update plug post count
        await supabase
          .from('social_media_plugs')
          .update({
            post_count: (plug.post_count || 0) + 1,
            last_posted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', plug.id);

        successCount++;
        console.log(`✅ Posted to ${post.platform} for user ${post.user_id}`);
      } catch (postError) {
        // Mark as failed
        await supabase
          .from('scheduled_posts')
          .update({
            status: post.retry_count >= 3 ? 'failed' : 'scheduled', // Retry up to 3 times
            error_message: postError.message,
            retry_count: (post.retry_count || 0) + 1,
            // If retrying, push 15 min into future
            scheduled_for: post.retry_count < 3
              ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
              : post.scheduled_for,
            updated_at: new Date().toISOString(),
          })
          .eq('id', post.id);

        failCount++;
        console.error(`❌ Failed to post to ${post.platform}: ${postError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        processed: pendingPosts.length,
        success: successCount,
        failed: failCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Scheduler error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ─── PLATFORM-SPECIFIC POSTING ───

async function postToTwitter(accessToken: string, text: string): Promise<string | null> {
  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twitter API error: ${error}`);
  }

  const data = await response.json();
  return `https://twitter.com/i/web/status/${data.data.id}`;
}

async function postToLinkedIn(
  accessToken: string,
  authorId: string | null,
  text: string
): Promise<string | null> {
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
    const error = await response.text();
    throw new Error(`LinkedIn API error: ${error}`);
  }

  return null; // LinkedIn doesn't return a direct post URL easily
}

async function postToFacebook(
  accessToken: string,
  pageId: string | null,
  text: string
): Promise<string | null> {
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
    const error = await response.text();
    throw new Error(`Facebook API error: ${error}`);
  }

  const data = await response.json();
  return `https://facebook.com/${data.id}`;
}
