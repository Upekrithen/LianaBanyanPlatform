import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type PlatformDispatchResult = {
  platformPostId: string;
  platformUrl?: string;
  simulated?: boolean;
};

type PlatformAccount = {
  id: string;
  platform: string;
  account_name: string;
  auth_token_encrypted: string | null;
  posting_config: Record<string, unknown> | null;
};

type NewsSlot = {
  id: string;
  scheduled_date: string;
  slot_time: string;
  content_type: "stats" | "breaking_news" | "deferred";
  content: string;
  status: "scheduled" | "dispatched" | "deferred";
  breaking_news_source: string | null;
};

type DispatchRequestBody = {
  chapter_id?: string;
  dry_run?: boolean;
  test_mode?: boolean;
};

type EpisodeCandidate = {
  id: string;
  chapter_id: string;
  content: string;
  cross_ref_text?: string | null;
  sequence_number: number;
  status: string;
  scheduled_for?: string | null;
  posted_at?: string | null;
  platform?: string | null;
  content_type?: string | null;
  channel?: string | null;
  primary_spice?: string | null;
  parent_post_id?: string | null;
  platform_post_id?: string | null;
  targetPlatform: string;
  chapter_number?: number | null;
};

type DispatchPlatformConfig = {
  platform: string;
  batch_size: number;
  include_preface: boolean;
  preface_style: "separate" | "inline";
  post_delay_ms: number;
  max_chars: number | null;
  thread_support: boolean;
  active: boolean;
};

type BatteryDispatchPlatformConfig = {
  platform: string;
  min_burst_size: number;
  max_burst_size: number;
  min_spacing_seconds: number;
  max_spacing_seconds: number;
  role: "live_fire" | "community" | "professional" | "evergreen" | "episodic" | null;
  preferred_windows: Array<{ start: string; end: string }>;
  stagger_offset_minutes: number;
  weekday_only: boolean;
  tz: string;
};

type EpisodePrefaceTemplate = {
  series: string;
  chapter: number | null;
  chapter_title: string | null;
  source_description: string | null;
  cephas_url: string | null;
  preface_template: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = (await req.json().catch(() => ({}))) as DispatchRequestBody;
    const requestedChapterId = body.chapter_id;
    const dryRun = body.dry_run === true || body.test_mode === true;

    let { data: chapter } = requestedChapterId
      ? await supabase
          .from("crewman_chapters")
          .select("*")
          .eq("id", requestedChapterId)
          .single()
      : await supabase
          .from("crewman_chapters")
          .select("*")
          .eq("status", "streaming")
          .order("chapter_number", { ascending: true })
          .limit(1)
          .maybeSingle();

    if (!chapter) {
      const { data: stagedCandidate } = await supabase
        .from("crewman_chapters")
        .select("id")
        .eq("status", "staged")
        .order("chapter_number", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (stagedCandidate?.id) {
        const { data: nextStagedChapter, error: stageStartError } = await supabase
          .from("crewman_chapters")
          .update({
            status: "streaming",
            stream_started_at: new Date().toISOString(),
          })
          .eq("id", stagedCandidate.id)
          .select("*")
          .single();

        if (stageStartError) {
          throw new Error(stageStartError.message);
        }

        chapter = nextStagedChapter;
      }
    }

    if (!chapter) {
      return responseOk({
        success: true,
        status: "idle",
        note: "No streaming or staged chapters found.",
      });
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const newsDispatch = dryRun ? { dispatched: false } : await tryDispatchNewsSlot({ supabase, now });
    if (newsDispatch?.dispatched) {
      return responseOk({
        success: true,
        status: "news_slot_dispatched",
        news_slot_id: newsDispatch.news_slot_id,
        content_type: newsDispatch.content_type,
        platform: newsDispatch.platform,
        platform_post_id: newsDispatch.platform_post_id,
        simulated: newsDispatch.simulated,
      });
    }

    const queuedCandidates = await getQueuedEpisodeCandidates({
      supabase,
      chapterId: chapter.id,
      chapterNumber: chapter.chapter_number ?? null,
      nowIso,
    });

    if (queuedCandidates.length === 0) {
      return responseOk({
        success: true,
        status: "waiting_for_vote_gate",
        chapter_id: chapter.id,
        chapter_number: chapter.chapter_number,
        note: "No queued episodes remain for current streaming chapter.",
      });
    }

    const activePlatforms = await getActiveDispatchPlatforms(supabase, queuedCandidates);
    const orderedPlatforms = orderPlatformsForDispatch(activePlatforms);
    const platformConfigs = await getDispatchPlatformConfigs(supabase, orderedPlatforms);
    const batteryPlatformConfigs = await getBatteryDispatchPlatformConfigs(supabase, orderedPlatforms);

    const dispatchLog: Array<Record<string, unknown>> = [];
    let totalEpisodesPosted = 0;
    let anySimulated = false;
    let xAnchorSlotIso: string | null = null;

    for (const platform of orderedPlatforms) {
      const config = platformConfigs.get(platform) ?? defaultDispatchPlatformConfig(platform);
      if (!config.active) continue;
      const batteryConfig = batteryPlatformConfigs.get(normalizeBatteryPlatform(platform))
        ?? defaultBatteryDispatchPlatformConfig(platform);
      const burstSize = getRandomIntInclusive(
        batteryConfig.min_burst_size,
        batteryConfig.max_burst_size,
      );
      const maxImmediatePosts = getMaxImmediatePostsPerInvocation();

      const platformQueue = queuedCandidates
        .filter((episode) => episode.targetPlatform === platform)
        .sort((a, b) => a.sequence_number - b.sequence_number)
        .slice(0, Math.max(1, burstSize));

      if (platformQueue.length === 0) continue;
      const isThreads = normalizeBatteryPlatform(platform) === "threads";
      const xAnchorDate = xAnchorSlotIso ? new Date(xAnchorSlotIso) : null;
      const plannedFirstSlot = getFirstPlannedSlot({
        platform,
        config: batteryConfig,
        now,
        xAnchorUtc: isThreads ? xAnchorDate : null,
      });

      if (normalizeBatteryPlatform(platform) === "x") {
        xAnchorSlotIso = plannedFirstSlot.toISOString();
      }

      const shouldDispatchImmediately = plannedFirstSlot.getTime() <= now.getTime() + 60_000;
      const immediateQueue = shouldDispatchImmediately
        ? platformQueue.slice(0, Math.max(1, maxImmediatePosts))
        : [];
      const deferredQueue = platformQueue.slice(immediateQueue.length);

      const platformAccount = await getDispatchPlatformAccount(supabase, platform);
      const preface = config.include_preface && immediateQueue.length > 0
        ? await generatePreface({
            supabase,
            episodes: immediateQueue,
            config,
            chapter,
          })
        : null;

      let priorPostId: string | null = null;
      if (immediateQueue.length > 0) {
        priorPostId = await getLatestPlatformPostId({
          supabase,
          chapterId: chapter.id,
          platform,
          beforeSequence: immediateQueue[0].sequence_number,
        });
      }
      let prefacePostId: string | null = null;

      if (preface && config.preface_style === "separate") {
        const prefaceResult = await postEpisodeToPlatform({
          supabase,
          platform,
          content: enforceMaxChars(preface, config.max_chars),
          parentPostId: config.thread_support ? priorPostId : null,
          platformAccount,
          dryRun,
        });
        anySimulated = anySimulated || !!prefaceResult.simulated;
        prefacePostId = prefaceResult.platformPostId;
        priorPostId = prefacePostId;

      }

      const platformBatchResults: Array<Record<string, unknown>> = [];
      const deferredEpisodes: Array<Record<string, unknown>> = [];

      for (let index = 0; index < immediateQueue.length; index += 1) {
        const episode = immediateQueue[index];
        let composedContent = composeDispatchBody(episode.content, episode.cross_ref_text);

        if (index === 0 && preface && config.preface_style === "inline") {
          composedContent = `${preface}\n\n${composedContent}`;
        }

        composedContent = appendDispatchHashtags(composedContent, episode.channel);
        composedContent = enforceMaxChars(composedContent, config.max_chars);

        const parentPostId = config.thread_support ? priorPostId : null;
        const dispatchResult = await postEpisodeToPlatform({
          supabase,
          platform,
          content: composedContent,
          parentPostId,
          platformAccount,
          dryRun,
        });
        anySimulated = anySimulated || !!dispatchResult.simulated;

        const { error: updateError } = await supabase
          .from("crewman_episodes")
          .update({
            status: "posted",
            posted_at: new Date().toISOString(),
            platform,
            parent_post_id: parentPostId,
            platform_post_id: dispatchResult.platformPostId,
          })
          .eq("id", episode.id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        await upsertDistributionAnalytics({
          supabase,
          episode,
          platform,
        });

        await recordSocialPostMapping({
          supabase,
          platform,
          externalPostId: dispatchResult.platformPostId,
          chapterNumber: episode.chapter_number ?? null,
          episodeNumber: episode.sequence_number,
        });

        totalEpisodesPosted += 1;
        priorPostId = dispatchResult.platformPostId;

        platformBatchResults.push({
          episode_id: episode.id,
          sequence_number: episode.sequence_number,
          parent_post_id: parentPostId,
          platform_post_id: dispatchResult.platformPostId,
          platform_url: dispatchResult.platformUrl,
          simulated: !!dispatchResult.simulated,
        });
      }

      if (deferredQueue.length > 0) {
        let cursor = immediateQueue.length > 0 ? new Date() : plannedFirstSlot;
        for (let index = 0; index < deferredQueue.length; index += 1) {
          const episode = deferredQueue[index];
          const candidateSlot = index === 0 && immediateQueue.length === 0
            ? cursor
            : new Date(cursor.getTime() + getRandomSpacingDelayMs(batteryConfig));
          const nextWindowSlot = findNextSlotInPreferredWindow(candidateSlot, batteryConfig);
          const scheduledFor = nextWindowSlot.toISOString();
          const { error: deferError } = await supabase
            .from("crewman_episodes")
            .update({ scheduled_for: scheduledFor })
            .eq("id", episode.id)
            .eq("status", "queued");

          if (deferError) {
            throw new Error(`Failed to defer queued episode ${episode.id}: ${deferError.message}`);
          }

          deferredEpisodes.push({
            episode_id: episode.id,
            sequence_number: episode.sequence_number,
            scheduled_for: scheduledFor,
          });
          cursor = nextWindowSlot;
        }
      }

      dispatchLog.push({
        platform,
        config,
        battery_config: batteryConfig,
        selected_burst_size: burstSize,
        max_immediate_posts: maxImmediatePosts,
        immediate_posts_dispatched: immediateQueue.length,
        deferred_count: deferredQueue.length,
        role: batteryConfig.role,
        planned_first_slot: plannedFirstSlot.toISOString(),
        window_used: resolveWindowForUtc(plannedFirstSlot, batteryConfig),
        staggered_from: isThreads && xAnchorDate ? "x" : "independent",
        preface_sent: !!preface,
        preface_style: config.preface_style,
        preface_post_id: prefacePostId,
        episodes_dispatched: platformBatchResults,
        deferred_episodes: deferredEpisodes,
      });
    }

    if (dispatchLog.length === 0) {
      return responseOk({
        success: true,
        status: "idle",
        chapter_id: chapter.id,
        chapter_number: chapter.chapter_number,
        note: "No due episodes matched active platform dispatch configuration.",
      });
    }

    return responseOk({
      success: true,
      status: "posted_burst",
      chapter_id: chapter.id,
      chapter_number: chapter.chapter_number,
      dry_run: dryRun,
      total_episodes_posted: totalEpisodesPosted,
      simulated: anySimulated || dryRun,
      dispatches: dispatchLog,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

async function postEpisodeToPlatform({
  supabase,
  platform,
  content,
  parentPostId,
  platformAccount,
  dryRun,
}: {
  supabase: any;
  platform: string;
  content: string;
  parentPostId: string | null;
  platformAccount: PlatformAccount | null;
  dryRun?: boolean;
}): Promise<PlatformDispatchResult> {
  const normalized = platform === "x" ? "twitter" : platform;
  const configuredToken = platformAccount?.auth_token_encrypted ?? null;

  if (dryRun) {
    const syntheticId = `dryrun_${normalized}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return {
      platformPostId: syntheticId,
      simulated: true,
      platformUrl: normalized === "twitter"
        ? `https://twitter.com/i/web/status/${syntheticId}`
        : undefined,
    };
  }

  if (normalized === "linkedin") {
    const linkedInAccount = await getSocialAccount(supabase, "linkedin");
    const token = configuredToken || linkedInAccount?.access_token || null;
    if (!token || !linkedInAccount?.platform_user_id) {
      const syntheticId = `sim_linkedin_${Date.now()}`;
      return { platformPostId: syntheticId, simulated: true };
    }

    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: `urn:li:person:${linkedInAccount.platform_user_id}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: content },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`LinkedIn post failed (${response.status}): ${text}`);
    }

    const syntheticId = `linkedin_${Date.now()}`;
    return { platformPostId: syntheticId };
  }

  if (normalized !== "twitter") {
    const syntheticId = `sim_${normalized}_${Date.now()}`;
    return {
      platformPostId: syntheticId,
      simulated: true,
      platformUrl: undefined,
    };
  }

  const socialAccount = await getSocialAccount(supabase, "twitter");
  const token = configuredToken
    || socialAccount?.access_token
    || Deno.env.get("CREWMAN_TWITTER_BEARER")
    || Deno.env.get("TWITTER_BEARER_TOKEN")
    || Deno.env.get("TWITTER_ACCESS_TOKEN");
  if (!token) {
    const syntheticId = `sim_twitter_${Date.now()}`;
    return {
      platformPostId: syntheticId,
      simulated: true,
      platformUrl: `https://twitter.com/i/web/status/${syntheticId}`,
    };
  }

  const payload: Record<string, unknown> = { text: content };
  if (parentPostId) {
    payload.reply = { in_reply_to_tweet_id: parentPostId };
  }

  const response = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 403 && text.toLowerCase().includes("unsupported authentication")) {
      const syntheticId = `sim_twitter_${Date.now()}`;
      return {
        platformPostId: syntheticId,
        simulated: true,
        platformUrl: `https://twitter.com/i/web/status/${syntheticId}`,
      };
    }
    throw new Error(`Twitter post failed (${response.status}): ${text}`);
  }

  const json = await response.json();
  const postId = json?.data?.id;
  if (!postId) {
    throw new Error("Twitter response missing tweet ID");
  }

  return {
    platformPostId: postId,
    platformUrl: `https://twitter.com/i/web/status/${postId}`,
  };
}

function responseOk(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getSocialAccount(supabase: any, platform: "twitter" | "linkedin") {
  const { data } = await supabase
    .from("member_social_accounts")
    .select("access_token, platform_user_id, is_default, last_used_at")
    .eq("platform", platform)
    .eq("is_active", true)
    .order("is_default", { ascending: false })
    .order("last_used_at", { ascending: false, nullsFirst: false })
    .limit(1);

  return data?.[0] ?? null;
}

function resolveTargetPlatform(episode: {
  platform?: string | null;
  content_type?: string | null;
}) {
  const fromGrid = episode.content_type?.startsWith("platform:")
    ? episode.content_type.slice("platform:".length).toLowerCase()
    : null;
  return fromGrid || episode.platform || "twitter";
}

function composeDispatchBody(content: string, crossRefText?: string | null) {
  const base = (content ?? "").trim();
  const crossRef = (crossRefText ?? "").trim();
  if (!crossRef) return base;
  return `${base}\n\n${crossRef}`;
}

function appendDispatchHashtags(content: string, channel?: string | null) {
  const normalizedChannel = (channel ?? "bst").toLowerCase();
  if (normalizedChannel === "spoonfuls") {
    return `${content}\n\n#Spoonfuls #LianaBanyan`;
  }
  return `${content}\n\n#CrewmanSix #AFoundersAIJourney #LianaBanyan`;
}

function enforceMaxChars(content: string, maxChars: number | null) {
  if (!maxChars || maxChars <= 0) return content;
  if (content.length <= maxChars) return content;
  return `${content.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

function defaultDispatchPlatformConfig(platform: string): DispatchPlatformConfig {
  const normalized = platform.toLowerCase();
  if (normalized === "twitter" || normalized === "x") {
    return {
      platform: "twitter",
      batch_size: 3,
      include_preface: true,
      preface_style: "separate",
      post_delay_ms: 1000,
      max_chars: 280,
      thread_support: true,
      active: true,
    };
  }
  if (normalized === "linkedin") {
    return {
      platform: "linkedin",
      batch_size: 1,
      include_preface: true,
      preface_style: "inline",
      post_delay_ms: 0,
      max_chars: 3000,
      thread_support: false,
      active: true,
    };
  }
  return {
    platform: normalized,
    batch_size: 1,
    include_preface: true,
    preface_style: "separate",
    post_delay_ms: 1000,
    max_chars: null,
    thread_support: false,
    active: true,
  };
}

async function getQueuedEpisodeCandidates({
  supabase,
  chapterId,
  chapterNumber,
  nowIso,
}: {
  supabase: any;
  chapterId: string;
  chapterNumber: number | null;
  nowIso: string;
}): Promise<EpisodeCandidate[]> {
  const { data: scheduledDue, error: scheduledError } = await supabase
    .from("crewman_episodes")
    .select("*")
    .eq("chapter_id", chapterId)
    .eq("status", "queued")
    .not("scheduled_for", "is", null)
    .lte("scheduled_for", nowIso)
    .order("scheduled_for", { ascending: true })
    .order("sequence_number", { ascending: true })
    .limit(200);
  if (scheduledError) {
    throw new Error(`Failed to load scheduled episodes: ${scheduledError.message}`);
  }

  let queue = (scheduledDue ?? []) as EpisodeCandidate[];
  if (queue.length === 0) {
    const { data: unscheduledFallback, error: unscheduledError } = await supabase
      .from("crewman_episodes")
      .select("*")
      .eq("chapter_id", chapterId)
      .eq("status", "queued")
      .is("scheduled_for", null)
      .order("sequence_number", { ascending: true })
      .limit(200);
    if (unscheduledError) {
      throw new Error(`Failed to load unscheduled episodes: ${unscheduledError.message}`);
    }
    queue = (unscheduledFallback ?? []) as EpisodeCandidate[];
  }

  return queue.map((episode) => ({
    ...episode,
    chapter_number: chapterNumber,
    targetPlatform: resolveTargetPlatform(episode),
  }));
}

async function getActiveDispatchPlatforms(supabase: any, candidates: EpisodeCandidate[]): Promise<string[]> {
  const { data, error } = await supabase
    .from("dispatch_platform_accounts")
    .select("platform")
    .eq("is_active", true);
  if (error) {
    throw new Error(`Failed to load active dispatch platform accounts: ${error.message}`);
  }

  const configured = new Set<string>(((data ?? []) as Array<{ platform: string }>).map((row) => row.platform));
  const candidatePlatforms = new Set<string>(candidates.map((episode) => episode.targetPlatform));

  if (configured.size === 0) {
    for (const platform of candidatePlatforms) configured.add(platform);
  } else {
    for (const platform of candidatePlatforms) {
      if (configured.has(platform)) continue;
      configured.add(platform);
    }
  }

  return Array.from(configured);
}

async function getDispatchPlatformConfigs(
  supabase: any,
  platforms: string[],
): Promise<Map<string, DispatchPlatformConfig>> {
  if (platforms.length === 0) return new Map();

  const { data, error } = await supabase
    .from("dispatch_platform_config")
    .select("platform, batch_size, include_preface, preface_style, post_delay_ms, max_chars, thread_support, active")
    .in("platform", platforms);
  if (error) {
    throw new Error(`Failed to load platform config: ${error.message}`);
  }

  const map = new Map<string, DispatchPlatformConfig>();
  for (const row of (data ?? []) as DispatchPlatformConfig[]) {
    map.set(row.platform, row);
  }

  return map;
}

function orderPlatformsForDispatch(platforms: string[]) {
  const priority = new Map<string, number>([
    ["x", 0],
    ["twitter", 0],
    ["threads", 1],
    ["linkedin", 2],
    ["facebook", 3],
    ["instagram", 4],
  ]);
  return [...platforms].sort((a, b) => {
    const aRank = priority.get(a.toLowerCase()) ?? 100;
    const bRank = priority.get(b.toLowerCase()) ?? 100;
    if (aRank !== bRank) return aRank - bRank;
    return a.localeCompare(b);
  });
}

async function getBatteryDispatchPlatformConfigs(
  supabase: any,
  platforms: string[],
): Promise<Map<string, BatteryDispatchPlatformConfig>> {
  if (platforms.length === 0) return new Map();

  const normalizedPlatforms = Array.from(new Set(platforms.map((platform) => normalizeBatteryPlatform(platform))));
  const { data, error } = await supabase
    .from("battery_dispatch_platform_config")
    .select(
      "platform, min_burst_size, max_burst_size, min_spacing_seconds, max_spacing_seconds, role, preferred_windows, stagger_offset_minutes, weekday_only, tz",
    )
    .in("platform", normalizedPlatforms);

  if (error) {
    // Keep dispatch running even before/without the migration.
    console.warn(`Battery dispatch platform config unavailable: ${error.message}`);
    return new Map();
  }

  const map = new Map<string, BatteryDispatchPlatformConfig>();
  for (const row of (data ?? []) as BatteryDispatchPlatformConfig[]) {
    map.set(row.platform, row);
  }

  return map;
}

function normalizeBatteryPlatform(platform: string) {
  const normalized = platform.toLowerCase();
  return normalized === "twitter" ? "x" : normalized;
}

function defaultBatteryDispatchPlatformConfig(platform: string): BatteryDispatchPlatformConfig {
  const normalized = normalizeBatteryPlatform(platform);
  if (normalized === "x") {
    return {
      platform: normalized,
      min_burst_size: 4,
      max_burst_size: 7,
      min_spacing_seconds: 15,
      max_spacing_seconds: 45,
      role: "live_fire",
      preferred_windows: [{ start: "10:00", end: "12:00" }, { start: "17:00", end: "19:00" }],
      stagger_offset_minutes: 0,
      weekday_only: false,
      tz: "America/Chicago",
    };
  }
  if (normalized === "threads") {
    return {
      platform: normalized,
      min_burst_size: 3,
      max_burst_size: 5,
      min_spacing_seconds: 20,
      max_spacing_seconds: 60,
      role: "community",
      preferred_windows: [{ start: "11:00", end: "13:00" }, { start: "18:00", end: "21:00" }],
      stagger_offset_minutes: 60,
      weekday_only: false,
      tz: "America/Chicago",
    };
  }
  if (normalized === "linkedin") {
    return {
      platform: normalized,
      min_burst_size: 1,
      max_burst_size: 2,
      min_spacing_seconds: 300,
      max_spacing_seconds: 600,
      role: "professional",
      preferred_windows: [{ start: "07:30", end: "09:30" }],
      stagger_offset_minutes: 0,
      weekday_only: true,
      tz: "America/Chicago",
    };
  }
  if (normalized === "facebook") {
    return {
      platform: normalized,
      min_burst_size: 1,
      max_burst_size: 2,
      min_spacing_seconds: 300,
      max_spacing_seconds: 600,
      role: "evergreen",
      preferred_windows: [{ start: "16:00", end: "20:00" }],
      stagger_offset_minutes: 0,
      weekday_only: false,
      tz: "America/Chicago",
    };
  }
  if (normalized === "instagram") {
    return {
      platform: normalized,
      min_burst_size: 1,
      max_burst_size: 2,
      min_spacing_seconds: 300,
      max_spacing_seconds: 600,
      role: "episodic",
      preferred_windows: [{ start: "17:00", end: "21:00" }],
      stagger_offset_minutes: 0,
      weekday_only: false,
      tz: "America/Chicago",
    };
  }
  return {
    platform: normalized,
    min_burst_size: 1,
    max_burst_size: 1,
    min_spacing_seconds: 1,
    max_spacing_seconds: 1,
    role: null,
    preferred_windows: [],
    stagger_offset_minutes: 0,
    weekday_only: false,
    tz: "UTC",
  };
}

function getRandomIntInclusive(minValue: number, maxValue: number) {
  const min = Math.ceil(Math.min(minValue, maxValue));
  const max = Math.floor(Math.max(minValue, maxValue));
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomSpacingDelayMs(config: BatteryDispatchPlatformConfig) {
  const spacingSeconds = getRandomIntInclusive(config.min_spacing_seconds, config.max_spacing_seconds);
  return spacingSeconds * 1000;
}

function getFirstPlannedSlot({
  platform,
  config,
  now,
  xAnchorUtc,
}: {
  platform: string;
  config: BatteryDispatchPlatformConfig;
  now: Date;
  xAnchorUtc: Date | null;
}) {
  const normalizedPlatform = normalizeBatteryPlatform(platform);
  if (normalizedPlatform === "threads" && xAnchorUtc) {
    const chainedBase = new Date(xAnchorUtc.getTime() + config.stagger_offset_minutes * 60_000);
    return findNextSlotInPreferredWindow(chainedBase, config);
  }

  const independentBase = new Date(now.getTime() + config.stagger_offset_minutes * 60_000);
  return findNextSlotInPreferredWindow(independentBase, config);
}

function findNextSlotInPreferredWindow(fromUtc: Date, config: BatteryDispatchPlatformConfig) {
  const tz = config.tz || "UTC";
  const windows = normalizePreferredWindows(config.preferred_windows);
  if (windows.length === 0) return fromUtc;

  const startMs = roundUpToMinuteMs(fromUtc.getTime());
  const maxLookaheadMinutes = 14 * 24 * 60;

  for (let step = 0; step <= maxLookaheadMinutes; step += 1) {
    const candidate = new Date(startMs + step * 60_000);
    const local = getLocalClock(candidate, tz);
    if (config.weekday_only && (local.weekday === 0 || local.weekday === 6)) continue;
    const localMinutes = local.hour * 60 + local.minute;
    if (windows.some((window) => localMinutes >= window.startMinutes && localMinutes < window.endMinutes)) {
      return candidate;
    }
  }

  return fromUtc;
}

function resolveWindowForUtc(dateUtc: Date, config: BatteryDispatchPlatformConfig) {
  const windows = normalizePreferredWindows(config.preferred_windows);
  if (windows.length === 0) return null;
  const local = getLocalClock(dateUtc, config.tz || "UTC");
  const localMinutes = local.hour * 60 + local.minute;
  const matched = windows.find((window) => localMinutes >= window.startMinutes && localMinutes < window.endMinutes);
  if (!matched) return null;
  return { start: matched.rawStart, end: matched.rawEnd, tz: config.tz || "UTC" };
}

function normalizePreferredWindows(input: unknown): Array<{
  startMinutes: number;
  endMinutes: number;
  rawStart: string;
  rawEnd: string;
}> {
  let raw = input;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  const windows: Array<{ startMinutes: number; endMinutes: number; rawStart: string; rawEnd: string }> = [];

  for (const item of raw) {
    const candidate = item as { start?: unknown; end?: unknown };
    const start = typeof candidate.start === "string" ? candidate.start : null;
    const end = typeof candidate.end === "string" ? candidate.end : null;
    if (!start || !end) continue;
    const startMinutes = parseClockMinutes(start);
    const endMinutes = parseClockMinutes(end);
    if (startMinutes == null || endMinutes == null || endMinutes <= startMinutes) continue;
    windows.push({ startMinutes, endMinutes, rawStart: start, rawEnd: end });
  }

  return windows;
}

function parseClockMinutes(value: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hour = Number.parseInt(match[1], 10);
  const minute = Number.parseInt(match[2], 10);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
}

function roundUpToMinuteMs(ms: number) {
  const minuteMs = 60_000;
  return Math.ceil(ms / minuteMs) * minuteMs;
}

function getLocalClock(dateUtc: Date, tz: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts = formatter.formatToParts(dateUtc);
  const hour = Number.parseInt(parts.find((part) => part.type === "hour")?.value ?? "0", 10);
  const minute = Number.parseInt(parts.find((part) => part.type === "minute")?.value ?? "0", 10);
  const weekdayToken = parts.find((part) => part.type === "weekday")?.value ?? "Mon";
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return {
    hour: Number.isNaN(hour) ? 0 : hour,
    minute: Number.isNaN(minute) ? 0 : minute,
    weekday: weekdayMap[weekdayToken] ?? 1,
  };
}

function getMaxImmediatePostsPerInvocation() {
  const raw = Deno.env.get("DISPATCH_MAX_IMMEDIATE_POSTS_PER_PLATFORM");
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  if (!Number.isFinite(parsed) || parsed < 1) return 2;
  return Math.min(parsed, 10);
}

async function getLatestPlatformPostId({
  supabase,
  chapterId,
  platform,
  beforeSequence,
}: {
  supabase: any;
  chapterId: string;
  platform: string;
  beforeSequence: number;
}) {
  const { data: priorEpisode, error } = await supabase
    .from("crewman_episodes")
    .select("platform_post_id")
    .eq("chapter_id", chapterId)
    .eq("platform", platform)
    .eq("status", "posted")
    .lt("sequence_number", beforeSequence)
    .order("sequence_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to load prior post for ${platform}: ${error.message}`);
  }
  return priorEpisode?.platform_post_id ?? null;
}

async function generatePreface({
  supabase,
  episodes,
  config,
  chapter,
}: {
  supabase: any;
  episodes: EpisodeCandidate[];
  config: DispatchPlatformConfig;
  chapter: Record<string, unknown>;
}): Promise<string> {
  const first = episodes[0];
  const last = episodes[episodes.length - 1];
  const series = (first.channel ?? "bst").toLowerCase();
  const chapterNumber = (first.chapter_number ?? chapter.chapter_number ?? null) as number | null;

  const template = await getPrefaceTemplate({
    supabase,
    series,
    chapterNumber,
  });

  const firstNumber = first.sequence_number;
  const lastNumber = last.sequence_number;
  const episodeRange = episodes.length === 1
    ? `Episode ${firstNumber}`
    : `Episodes ${firstNumber}-${lastNumber}`;

  if (template?.preface_template) {
    let preface = template.preface_template;
    const chapterTitle = template.chapter_title || String(chapter.chapter_title || chapter.title || "");
    const cephasUrl = template.cephas_url || inferCephasUrl(series, chapterNumber, firstNumber);
    preface = preface.replaceAll("{{episode_range}}", episodeRange);
    preface = preface.replaceAll("{{chapter_title}}", chapterTitle);
    preface = preface.replaceAll("{{cephas_url}}", cephasUrl);
    return preface.trim();
  }

  if (series === "spoonfuls") {
    const chapterLabel = String(chapter.chapter_title || chapter.title || "The Lighthouse Ladder");
    if (config.preface_style === "inline") {
      return `🥄 Spoonful — from "${chapterLabel}" (Pudding #${firstNumber})`;
    }
    return [
      `🥄 A Spoonful of Cephas — from "${chapterLabel}"`,
      "Bite-sized insights from the Pudding series.",
      inferCephasUrl("spoonfuls", null, firstNumber),
    ].join("\n");
  }

  return [
    `🧵 BST ${episodeRange} — Chapter ${chapterNumber ?? "?"}`,
    'From "Blood, Sweat, and Tears: A Founder\'s AI Journey"',
    `Full story: ${inferCephasUrl("bst", chapterNumber, firstNumber)}`,
    "↓",
  ].join("\n");
}

async function getPrefaceTemplate({
  supabase,
  series,
  chapterNumber,
}: {
  supabase: any;
  series: string;
  chapterNumber: number | null;
}): Promise<EpisodePrefaceTemplate | null> {
  let query = supabase
    .from("episode_preface_templates")
    .select("series, chapter, chapter_title, source_description, cephas_url, preface_template")
    .eq("series", series);

  if (chapterNumber == null) {
    query = query.is("chapter", null);
  } else {
    query = query.eq("chapter", chapterNumber);
  }

  const { data, error } = await query.limit(1).maybeSingle();
  if (error) {
    throw new Error(`Failed to load preface template: ${error.message}`);
  }
  return (data as EpisodePrefaceTemplate | null) ?? null;
}

function inferCephasUrl(series: string, chapter: number | null, episodeNumber: number) {
  if (series === "spoonfuls") {
    return `cephas.lianabanyan.com/pudding/${episodeNumber}`;
  }
  if (series === "bst" && chapter != null) {
    return `cephas.lianabanyan.com/bst/ch${chapter}`;
  }
  return "cephas.lianabanyan.com";
}

async function getDispatchPlatformAccount(supabase: any, platform: string): Promise<PlatformAccount | null> {
  const { data } = await supabase
    .from("dispatch_platform_accounts")
    .select("id, platform, account_name, auth_token_encrypted, posting_config")
    .eq("platform", platform)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1);

  return (data?.[0] as PlatformAccount | undefined) ?? null;
}

async function upsertDistributionAnalytics({
  supabase,
  episode,
  platform,
}: {
  supabase: any;
  episode: {
    id: string;
    scheduled_for?: string | null;
    posted_at?: string | null;
    channel?: string | null;
    primary_spice?: string | null;
    content_type?: string | null;
  };
  platform: string;
}) {
  const slotIso = episode.scheduled_for || episode.posted_at || new Date().toISOString();
  const slotDate = new Date(slotIso);
  const dayOfWeek = slotDate.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
  const hourLocal = slotDate.getUTCHours();

  const payload = {
    episode_id: episode.id,
    platform,
    time_slot: slotIso,
    day_of_week: dayOfWeek,
    hour_local: hourLocal,
    channel: (episode.channel || "bst").toLowerCase(),
    content_type: episode.primary_spice || episode.content_type || null,
    likes: 0,
    replies: 0,
    reposts: 0,
    clicks: 0,
    cross_ref_clicks: 0,
    beacon_creates: 0,
    collected_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("distribution_analytics")
    .upsert(payload, {
      onConflict: "episode_id,platform,time_slot",
    });
  if (error) {
    throw new Error(`Failed to write distribution analytics: ${error.message}`);
  }
}

async function recordSocialPostMapping({
  supabase,
  platform,
  externalPostId,
  chapterNumber,
  episodeNumber,
}: {
  supabase: any;
  platform: string;
  externalPostId: string;
  chapterNumber: number | null;
  episodeNumber: number | null;
}) {
  if (!externalPostId || !chapterNumber) return;
  const normalizedPlatform = platform === "twitter" ? "x" : platform;

  const { data: chapterUnlockConfig } = await supabase
    .from("chapter_unlock_config")
    .select("chapter_id")
    .eq("chapter_number", chapterNumber)
    .limit(1)
    .maybeSingle();

  if (!chapterUnlockConfig?.chapter_id) return;

  const { error } = await supabase
    .from("social_post_mapping")
    .upsert(
      {
        platform: normalizedPlatform,
        external_post_id: externalPostId,
        chapter_id: chapterUnlockConfig.chapter_id,
        episode_number: episodeNumber,
        posted_at: new Date().toISOString(),
      },
      { onConflict: "platform,external_post_id" },
    );

  if (error) {
    console.warn(`Failed to upsert social_post_mapping for ${normalizedPlatform}:${externalPostId}: ${error.message}`);
  }
}

async function tryDispatchNewsSlot({
  supabase,
  now,
}: {
  supabase: any;
  now: Date;
}): Promise<{
  dispatched: boolean;
  news_slot_id?: string;
  content_type?: string;
  platform?: string;
  platform_post_id?: string;
  simulated?: boolean;
}> {
  const today = now.toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("distribution_news_slots")
    .select("id, scheduled_date, slot_time, content_type, content, status, breaking_news_source")
    .eq("status", "scheduled")
    .lte("scheduled_date", today)
    .order("scheduled_date", { ascending: true })
    .order("slot_time", { ascending: true })
    .limit(5);
  if (error) {
    throw new Error(`Failed to load news slots: ${error.message}`);
  }

  const candidates = ((data ?? []) as NewsSlot[]).filter((slot) => {
    if (slot.status !== "scheduled") return false;
    const dueAt = slotDueAtUtc(slot);
    if (!dueAt) return false;
    return dueAt.getTime() <= now.getTime();
  });
  if (candidates.length === 0) {
    return { dispatched: false };
  }

  const dueSlot = candidates[0];
  const platform = "twitter";
  const platformAccount = await getDispatchPlatformAccount(supabase, platform);
  const dispatchResult = await postEpisodeToPlatform({
    supabase,
    platform,
    content: dueSlot.content,
    parentPostId: null,
    platformAccount,
  });

  const { error: updateError } = await supabase
    .from("distribution_news_slots")
    .update({
      status: "dispatched",
      dispatched_at: new Date().toISOString(),
      dispatched_platform: platform,
      dispatched_platform_post_id: dispatchResult.platformPostId,
    })
    .eq("id", dueSlot.id);
  if (updateError) {
    throw new Error(`Failed to update news slot dispatch status: ${updateError.message}`);
  }

  return {
    dispatched: true,
    news_slot_id: dueSlot.id,
    content_type: dueSlot.content_type,
    platform,
    platform_post_id: dispatchResult.platformPostId,
    simulated: !!dispatchResult.simulated,
  };
}

function slotDueAtUtc(slot: { scheduled_date: string; slot_time: string }) {
  if (!slot.scheduled_date || !slot.slot_time) return null;
  const iso = `${slot.scheduled_date}T${slot.slot_time}Z`;
  const dueAt = new Date(iso);
  return Number.isNaN(dueAt.getTime()) ? null : dueAt;
}
