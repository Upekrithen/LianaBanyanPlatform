/**
 * PROCESS SCHEDULED SOCIAL MEDIA POSTS
 * =====================================
 * Cron-based function that runs every 5 minutes.
 * Processes BOTH legacy (scheduled_posts + social_media_plugs)
 * and modern (member_scheduled_posts + member_social_accounts) tables.
 * Schedule: every 5 minutes (set in Supabase Dashboard)
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

    // Test mode: log only, never actually post
    let testMode = false;
    try {
      const body = await req.json();
      testMode = body?.test_mode === true;
    } catch { /* no body or not JSON — normal cron invocation */ }

    const now = new Date().toISOString();
    let successCount = 0;
    let failCount = 0;
    let deadLetterCount = 0;
    const details: Array<{ source: string; id: string; platform: string; status: string }> = [];
    const MAX_RETRIES = 3;

    // ─── 1. Process modern member_scheduled_posts ────────────────────

    const { data: memberPosts, error: memberError } = await supabase
      .from('member_scheduled_posts')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true })
      .limit(10);

    if (memberError) {
      console.error('Error fetching member_scheduled_posts:', memberError);
    }

    for (const post of (memberPosts ?? [])) {
      try {
        const hasBatteryDispatchAccess = await getBatteryDispatchAccessForUser(supabase, post.user_id);
        if (!hasBatteryDispatchAccess) {
          await supabase
            .from('member_scheduled_posts')
            .update({ status: 'suspended' })
            .eq('id', post.id);

          details.push({ source: 'member', id: post.id, platform: post.platform, status: 'suspended: access_required' });
          console.warn(`⚠️ [member] Suspended ${post.platform} post for user ${post.user_id} due to missing Battery Dispatch access`);
          continue;
        }

        await supabase
          .from('member_scheduled_posts')
          .update({ status: 'posting' })
          .eq('id', post.id);

        const account = await getAccountForPost(supabase, post.social_account_id, post.user_id, post.platform);
        if (!account) throw new Error(`No active ${post.platform} account found`);

        const content = buildPostContent(post.content, post.hashtags, post.link_url);

        if (testMode) {
          // Test mode: log but never post
          await supabase
            .from('member_scheduled_posts')
            .update({ status: 'scheduled', updated_at: new Date().toISOString() })
            .eq('id', post.id);
          successCount++;
          details.push({ source: 'member', id: post.id, platform: post.platform, status: 'test_logged' });
          console.log(`🧪 [member][test] Would post to ${post.platform} for user ${post.user_id}: ${content.slice(0, 80)}...`);
          continue;
        }

        const postUrl = await postToPlatform(account, post.platform, content);

        await supabase
          .from('member_scheduled_posts')
          .update({ status: 'posted', posted_at: new Date().toISOString(), platform_post_url: postUrl, updated_at: new Date().toISOString() })
          .eq('id', post.id);

        await supabase
          .from('member_social_accounts')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', account.id);

        await supabase
          .from('dispatch_audit_log')
          .insert({
            user_id: post.user_id,
            batch_id: post.dispatch_batch_id || post.id,
            dispatch_mode: post.dispatch_mode || 'scheduled',
            platform_count: 1,
            platforms: [post.platform],
            base_content: post.content?.slice(0, 500),
          })
          .then(({ error: auditErr }) => {
            if (auditErr) console.error('Audit log write failed:', auditErr);
          });

        successCount++;
        details.push({ source: 'member', id: post.id, platform: post.platform, status: 'posted' });
        console.log(`✅ [member] Posted to ${post.platform} for user ${post.user_id}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        const retryCount = (post.retry_count || 0) + 1;

        if (retryCount >= MAX_RETRIES) {
          // Move to dead letter queue after 3 failures
          await supabase
            .from('member_scheduled_posts')
            .update({ status: 'dead_letter', error_message: message, retry_count: retryCount, updated_at: new Date().toISOString() })
            .eq('id', post.id);

          await supabase
            .from('dispatch_dead_letters')
            .insert({
              original_post_id: post.id,
              source_table: 'member_scheduled_posts',
              platform: post.platform,
              error_message: message,
              payload: { content: post.content, hashtags: post.hashtags, link_url: post.link_url, user_id: post.user_id },
              attempt_count: retryCount,
              first_failed_at: post.updated_at || new Date().toISOString(),
              last_failed_at: new Date().toISOString(),
            });

          deadLetterCount++;
          details.push({ source: 'member', id: post.id, platform: post.platform, status: `dead_letter: ${message}` });
          console.error(`💀 [member] Dead-lettered ${post.platform} after ${retryCount} failures: ${message}`);
        } else {
          // Retry: reschedule for 15 min later
          await supabase
            .from('member_scheduled_posts')
            .update({
              status: 'scheduled',
              error_message: message,
              retry_count: retryCount,
              scheduled_for: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', post.id);

          failCount++;
          details.push({ source: 'member', id: post.id, platform: post.platform, status: `retry_${retryCount}: ${message}` });
          console.error(`⚠️ [member] Retry ${retryCount}/${MAX_RETRIES} for ${post.platform}: ${message}`);
        }
    }

    // ─── 2. Process legacy scheduled_posts (backward compat) ─────────

    const { data: legacyPosts, error: legacyError } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true })
      .limit(10);

    if (legacyError) {
      console.error('Error fetching scheduled_posts:', legacyError);
    }

    for (const post of (legacyPosts ?? [])) {
      try {
        await supabase
          .from('scheduled_posts')
          .update({ status: 'posting', updated_at: new Date().toISOString() })
          .eq('id', post.id);

        // Try member_social_accounts first, fall back to social_media_plugs
        let account = await getAccountForUser(supabase, post.user_id, post.platform);

        if (!account && post.plug_id) {
          const { data: plug } = await supabase
            .from('social_media_plugs')
            .select('*')
            .eq('id', post.plug_id)
            .single();

          if (plug?.is_connected && plug?.access_token) {
            account = {
              id: plug.id,
              access_token: plug.access_token,
              platform_user_id: plug.platform_user_id,
              account_handle: plug.account_handle || null,
            };
          }
        }

        if (!account) throw new Error(`No connected ${post.platform} account`);

        if (testMode) {
          await supabase
            .from('scheduled_posts')
            .update({ status: 'scheduled', updated_at: new Date().toISOString() })
            .eq('id', post.id);
          successCount++;
          details.push({ source: 'legacy', id: post.id, platform: post.platform, status: 'test_logged' });
          console.log(`🧪 [legacy][test] Would post to ${post.platform}: ${post.post_text?.slice(0, 80)}...`);
          continue;
        }

        const postUrl = await postToPlatform(account, post.platform, post.post_text);

        await supabase
          .from('scheduled_posts')
          .update({
            status: 'posted',
            posted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', post.id);

        if (post.herald_post_id) {
          await supabase
            .from('herald_posts')
            .update({ posted_at: new Date().toISOString(), post_url: postUrl, status: 'posted' })
            .eq('id', post.herald_post_id);
        }

        successCount++;
        details.push({ source: 'legacy', id: post.id, platform: post.platform, status: 'posted' });
        console.log(`✅ [legacy] Posted to ${post.platform} for user ${post.user_id}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        const retryCount = (post.retry_count || 0) + 1;

        if (retryCount >= MAX_RETRIES) {
          await supabase
            .from('scheduled_posts')
            .update({ status: 'failed', error_message: message, retry_count: retryCount, updated_at: new Date().toISOString() })
            .eq('id', post.id);

          await supabase
            .from('dispatch_dead_letters')
            .insert({
              original_post_id: post.id,
              source_table: 'scheduled_posts',
              platform: post.platform,
              error_message: message,
              payload: { post_text: post.post_text, user_id: post.user_id, herald_post_id: post.herald_post_id },
              attempt_count: retryCount,
              first_failed_at: post.updated_at || new Date().toISOString(),
              last_failed_at: new Date().toISOString(),
            });

          deadLetterCount++;
          details.push({ source: 'legacy', id: post.id, platform: post.platform, status: `dead_letter: ${message}` });
          console.error(`💀 [legacy] Dead-lettered ${post.platform} after ${retryCount} failures: ${message}`);
        } else {
          await supabase
            .from('scheduled_posts')
            .update({
              status: 'scheduled',
              error_message: message,
              retry_count: retryCount,
              scheduled_for: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', post.id);

          failCount++;
          details.push({ source: 'legacy', id: post.id, platform: post.platform, status: `retry_${retryCount}: ${message}` });
          console.error(`⚠️ [legacy] Retry ${retryCount}/${MAX_RETRIES} for ${post.platform}: ${message}`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        processed: (memberPosts?.length ?? 0) + (legacyPosts?.length ?? 0),
        success: successCount,
        failed: failCount,
        dead_letters: deadLetterCount,
        test_mode: testMode,
        details,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Scheduler error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ─── ACCOUNT LOOKUP ─────────────────────────────────────────────────

interface SocialAccount {
  id: string;
  access_token: string;
  platform_user_id: string | null;
  account_handle: string | null;
}

async function getAccountForPost(
  supabase: any,
  socialAccountId: string | null,
  userId: string,
  platform: string
): Promise<SocialAccount | null> {
  if (socialAccountId) {
    const { data } = await supabase
      .from('member_social_accounts')
      .select('id, access_token, platform_user_id, account_handle')
      .eq('id', socialAccountId)
      .eq('is_active', true)
      .single();
    if (data) return data;
  }
  return getAccountForUser(supabase, userId, platform);
}

async function getBatteryDispatchAccessForUser(supabase: any, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('battery_dispatch_access_status')
    .select('has_access')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    // Keep scheduler resilient before/without access migration.
    console.warn(`Battery dispatch access check unavailable; allowing post for ${userId}: ${error.message}`);
    return true;
  }

  return !!data?.has_access;
}

async function getAccountForUser(
  supabase: any,
  userId: string,
  platform: string
): Promise<SocialAccount | null> {
  const normalizedPlatform = platform === 'x' ? 'twitter' : platform;

  // Prefer default account, then any active account for this platform
  const { data } = await supabase
    .from('member_social_accounts')
    .select('id, access_token, platform_user_id, account_handle, is_default')
    .eq('user_id', userId)
    .eq('platform', normalizedPlatform)
    .eq('is_active', true)
    .order('is_default', { ascending: false })
    .limit(1);

  return data?.[0] || null;
}

function buildPostContent(content: string, hashtags?: string[] | null, linkUrl?: string | null): string {
  let text = content;
  if (hashtags?.length) {
    text += '\n\n' + hashtags.map(t => t.startsWith('#') ? t : `#${t}`).join(' ');
  }
  if (linkUrl) {
    text += '\n\n' + linkUrl;
  }
  return text;
}

// ─── PLATFORM-SPECIFIC POSTING ──────────────────────────────────────

async function postToPlatform(
  account: SocialAccount,
  platform: string,
  text: string
): Promise<string | null> {
  const normalized = platform === 'x' ? 'twitter' : platform;
  switch (normalized) {
    case 'twitter':
      return postToTwitter(account.access_token, text);
    case 'linkedin':
      return postToLinkedIn(account.access_token, account.platform_user_id, text);
    case 'facebook':
      return postToFacebook(account.access_token, account.platform_user_id, text);
    case 'bluesky':
      return postToBluesky(account.access_token, account.platform_user_id, text);
    default:
      throw new Error(`Unsupported platform: ${normalized}`);
  }
}

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
    throw new Error(`Twitter ${response.status}: ${error}`);
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
    throw new Error(`LinkedIn ${response.status}: ${error}`);
  }

  return null;
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
      body: JSON.stringify({ message: text, access_token: accessToken }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Facebook ${response.status}: ${error}`);
  }

  const data = await response.json();
  return `https://facebook.com/${data.id}`;
}

async function postToBluesky(
  accessToken: string,
  did: string | null,
  text: string
): Promise<string | null> {
  if (!did) throw new Error('Bluesky DID required');
  const response = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      repo: did,
      collection: 'app.bsky.feed.post',
      record: {
        text,
        createdAt: new Date().toISOString(),
        $type: 'app.bsky.feed.post',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Bluesky ${response.status}: ${error}`);
  }

  const data = await response.json();
  const rkey = data?.uri?.split('/')?.pop();
  return rkey ? `https://bsky.app/profile/${did}/post/${rkey}` : null;
}
