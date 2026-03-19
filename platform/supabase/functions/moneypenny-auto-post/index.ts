/**
 * MONEYPENNY AUTO-POST — Post Approved Drafts to Social Media
 * ============================================================
 * Finds approved-but-unposted drafts from moneypenny_social_drafts
 * and approved responses from social_interactions, then posts them
 * via the platform's social-post infrastructure.
 *
 * Can be called:
 *   - On a cron schedule (every 5 minutes)
 *   - Manually from the MoneyPenny dashboard (immediate dispatch)
 *   - With a specific draft/interaction ID for single-item posting
 *
 * Request body (all optional):
 *   - draftId?: string   — Post a specific moneypenny_social_drafts row
 *   - interactionId?: string — Post a specific social_interactions response
 *   - dryRun?: boolean   — Preview what would be posted without actually posting
 *
 * Uses member_social_accounts for platform tokens (defaults to Founder's accounts).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutoPostResult {
  draftsPosted: number;
  responsesPosted: number;
  errors: string[];
  details: PostDetail[];
}

interface PostDetail {
  source: 'draft' | 'response';
  id: string;
  platform: string;
  content: string;
  postUrl?: string;
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const { draftId, interactionId, dryRun } = body as {
      draftId?: string;
      interactionId?: string;
      dryRun?: boolean;
    };

    const result: AutoPostResult = {
      draftsPosted: 0,
      responsesPosted: 0,
      errors: [],
      details: [],
    };

    // ─── 1. Process MoneyPenny Social Drafts ───────────────────────

    let draftsQuery = supabase
      .from('moneypenny_social_drafts')
      .select('*')
      .eq('status', 'approved')
      .is('posted_at', null)
      .order('created_at', { ascending: true })
      .limit(10);

    if (draftId) {
      draftsQuery = supabase
        .from('moneypenny_social_drafts')
        .select('*')
        .eq('id', draftId)
        .limit(1);
    }

    const { data: drafts, error: draftsError } = await draftsQuery;
    if (draftsError) {
      result.errors.push(`Draft fetch error: ${draftsError.message}`);
    }

    for (const draft of (drafts ?? [])) {
      const platform = draft.platform || 'twitter';
      const content = draft.content;

      if (dryRun) {
        result.details.push({
          source: 'draft', id: draft.id, platform, content,
        });
        continue;
      }

      const postResult = await postToSocialPlatform(supabase, platform, content);

      if (postResult.success) {
        await supabase
          .from('moneypenny_social_drafts')
          .update({
            status: 'posted',
            posted_at: new Date().toISOString(),
            post_url: postResult.postUrl || null,
          })
          .eq('id', draft.id);

        result.draftsPosted++;
        result.details.push({
          source: 'draft', id: draft.id, platform, content,
          postUrl: postResult.postUrl,
        });
      } else {
        result.errors.push(`Draft ${draft.id}: ${postResult.error}`);
        result.details.push({
          source: 'draft', id: draft.id, platform, content,
          error: postResult.error,
        });
      }
    }

    // ─── 2. Process Social Interactions (Approved Responses) ───────

    let interactionsQuery = supabase
      .from('social_interactions')
      .select('*')
      .eq('response_status', 'approved')
      .is('published_at', null)
      .not('draft_response', 'is', null)
      .order('received_at', { ascending: true })
      .limit(10);

    if (interactionId) {
      interactionsQuery = supabase
        .from('social_interactions')
        .select('*')
        .eq('id', interactionId)
        .limit(1);
    }

    const { data: interactions, error: interError } = await interactionsQuery;
    if (interError) {
      result.errors.push(`Interaction fetch error: ${interError.message}`);
    }

    for (const interaction of (interactions ?? [])) {
      const platform = interaction.channel || 'twitter';
      const content = interaction.draft_response;

      if (!content) continue;

      if (dryRun) {
        result.details.push({
          source: 'response', id: interaction.id, platform, content,
        });
        continue;
      }

      const postResult = await postToSocialPlatform(supabase, platform, content);

      if (postResult.success) {
        await supabase
          .from('social_interactions')
          .update({
            response_status: 'published',
            published_at: new Date().toISOString(),
          })
          .eq('id', interaction.id);

        result.responsesPosted++;
        result.details.push({
          source: 'response', id: interaction.id, platform, content,
          postUrl: postResult.postUrl,
        });
      } else {
        result.errors.push(`Interaction ${interaction.id}: ${postResult.error}`);
        result.details.push({
          source: 'response', id: interaction.id, platform, content,
          error: postResult.error,
        });
      }
    }

    // ─── 3. Log the run ────────────────────────────────────────────

    if (!dryRun) {
      await supabase.from('moneypenny_actions').insert({
        title: `Auto-Post Run: ${result.draftsPosted} drafts, ${result.responsesPosted} responses posted`,
        description: result.errors.length > 0
          ? `Errors: ${result.errors.join('; ')}`
          : 'All posts successful',
        source: 'auto',
        priority: result.errors.length > 0 ? 'urgent' : 'low',
        status: 'done',
        completed_at: new Date().toISOString(),
      });
    }

    return new Response(JSON.stringify({
      success: true,
      dryRun: !!dryRun,
      ...result,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ─── Social Posting via member_social_accounts ─────────────────────────

async function postToSocialPlatform(
  supabase: any,
  platform: string,
  text: string
): Promise<{ success: boolean; postUrl?: string; error?: string }> {
  const normalizedPlatform = platform === 'x' ? 'twitter' : platform;

  const { data: accounts } = await supabase
    .from('member_social_accounts')
    .select('id, access_token, platform_user_id, account_handle')
    .eq('platform', normalizedPlatform)
    .eq('is_active', true)
    .limit(1);

  if (!accounts || accounts.length === 0) {
    return { success: false, error: `No connected ${normalizedPlatform} account found` };
  }

  const account = accounts[0];

  try {
    switch (normalizedPlatform) {
      case 'twitter':
        return await postToTwitter(account.access_token, text);
      case 'linkedin':
        return await postToLinkedIn(account.access_token, account.platform_user_id, text);
      case 'facebook':
        return await postToFacebook(account.access_token, account.platform_user_id, text);
      case 'bluesky':
        return await postToBluesky(account.access_token, account.platform_user_id, text);
      default:
        return { success: false, error: `Unsupported platform: ${normalizedPlatform}` };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Post failed' };
  }
}

async function postToTwitter(
  accessToken: string, text: string
): Promise<{ success: boolean; postUrl?: string; error?: string }> {
  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { success: false, error: `Twitter ${response.status}: ${body}` };
  }

  const data = await response.json();
  const tweetId = data?.data?.id;
  return {
    success: true,
    postUrl: tweetId ? `https://twitter.com/i/web/status/${tweetId}` : undefined,
  };
}

async function postToLinkedIn(
  accessToken: string, userId: string, text: string
): Promise<{ success: boolean; postUrl?: string; error?: string }> {
  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: `urn:li:person:${userId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { success: false, error: `LinkedIn ${response.status}: ${body}` };
  }

  return { success: true };
}

async function postToFacebook(
  accessToken: string, pageId: string, text: string
): Promise<{ success: boolean; postUrl?: string; error?: string }> {
  const url = `https://graph.facebook.com/v18.0/${pageId}/feed`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, access_token: accessToken }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { success: false, error: `Facebook ${response.status}: ${body}` };
  }

  const data = await response.json();
  return {
    success: true,
    postUrl: data?.id ? `https://facebook.com/${data.id}` : undefined,
  };
}

async function postToBluesky(
  accessToken: string, did: string, text: string
): Promise<{ success: boolean; postUrl?: string; error?: string }> {
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
    const body = await response.text();
    return { success: false, error: `Bluesky ${response.status}: ${body}` };
  }

  const data = await response.json();
  const rkey = data?.uri?.split('/')?.pop();
  return {
    success: true,
    postUrl: rkey ? `https://bsky.app/profile/${did}/post/${rkey}` : undefined,
  };
}
