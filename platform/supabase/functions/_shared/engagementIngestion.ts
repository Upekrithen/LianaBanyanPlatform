import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-lb-signature",
};

const EVENT_TYPES = ["like", "comment", "share", "save", "view"] as const;
type EventType = (typeof EVENT_TYPES)[number];

type MappingRow = {
  platform: string;
  external_post_id: string;
  chapter_id: string;
  episode_number: number | null;
};

type WorkerStats = Record<string, unknown>;

type EventInsert = {
  chapterId: string;
  platform: string;
  episodeNumber: number | null;
  eventType: EventType;
  eventCount: number;
  platformPostId: string | null;
  externalEventId: string | null;
  source: "webhook" | "polling" | "manual";
  recordedAt?: string | null;
};

type NormalizedWebhookEvent = {
  platformPostId: string;
  eventType: EventType;
  eventCount: number;
  externalEventId: string | null;
  recordedAt: string | null;
};

export function createServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
}

export function responseJson(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function normalizePlatform(platform: string) {
  const normalized = platform.trim().toLowerCase();
  if (normalized === "twitter") return "x";
  if (normalized === "ig") return "instagram";
  return normalized;
}

export async function verifyWebhookSignature(
  req: Request,
  rawBody: string,
  opts: {
    secretEnvKey: string;
    headerName?: string;
  },
) {
  const signatureHeader = opts.headerName ?? "x-lb-signature";
  const incoming = req.headers.get(signatureHeader);
  const secret = Deno.env.get(opts.secretEnvKey);

  // If secret is not configured yet, keep route operable for staged rollout.
  if (!secret) return true;
  if (!incoming) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = toHex(signature);
  const normalizedIncoming = normalizeIncomingSignature(incoming);
  return secureEqual(expected, normalizedIncoming);
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function secureEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let i = 0; i < left.length; i += 1) {
    result |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return result === 0;
}

function normalizeIncomingSignature(signature: string): string {
  const trimmed = signature.trim().toLowerCase();
  if (trimmed.startsWith("sha256=")) {
    return trimmed.slice("sha256=".length);
  }
  return trimmed;
}

export function extractWebhookEvents(payload: unknown): NormalizedWebhookEvent[] {
  const rows = normalizePayloadToRows(payload);
  const events: NormalizedWebhookEvent[] = [];
  for (const row of rows) {
    const platformPostId = firstString(
      row.platform_post_id,
      row.post_id,
      row.external_post_id,
      row.tweet_id,
      row.media_id,
      row.urn,
      row.object_id,
      row.target_id,
      row.id,
    );
    if (!platformPostId) continue;

    const eventType = mapEventType(firstString(row.event_type, row.type, row.action, row.verb));
    if (!eventType) continue;
    const eventCount = firstNumber(row.event_count, row.count, row.delta, row.value) ?? 1;
    if (!Number.isFinite(eventCount) || eventCount <= 0) continue;
    const externalEventId = firstString(row.external_event_id, row.event_id, row.trace_id, row.id);
    const recordedAt = firstString(row.recorded_at, row.occurred_at, row.created_at, row.timestamp);

    events.push({
      platformPostId: String(platformPostId),
      eventType,
      eventCount,
      externalEventId: externalEventId ?? null,
      recordedAt: recordedAt ?? null,
    });
  }
  return events;
}

function normalizePayloadToRows(payload: unknown): Record<string, unknown>[] {
  if (!payload || typeof payload !== "object") return [];
  const asRecord = payload as Record<string, unknown>;

  const rows = asArrayOfObjects(asRecord.events)
    || asArrayOfObjects(asRecord.data)
    || asArrayOfObjects(asRecord.items)
    || asArrayOfObjects(asRecord.changes);
  if (rows) return rows;
  return [asRecord];
}

function asArrayOfObjects(input: unknown): Record<string, unknown>[] | null {
  if (!Array.isArray(input)) return null;
  const rows = input.filter((item) => item && typeof item === "object") as Record<string, unknown>[];
  return rows.length > 0 ? rows : null;
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  return null;
}

function firstNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function mapEventType(rawType: string | null): EventType | null {
  if (!rawType) return null;
  const value = rawType.toLowerCase();
  if (value.includes("like") || value.includes("favorite") || value.includes("reaction")) return "like";
  if (value.includes("comment") || value.includes("reply")) return "comment";
  if (value.includes("share") || value.includes("retweet") || value.includes("repost") || value.includes("quote")) {
    return "share";
  }
  if (value.includes("save") || value.includes("bookmark")) return "save";
  if (value.includes("view") || value.includes("impression")) return "view";
  return null;
}

export async function insertEngagementEvent(
  supabase: ReturnType<typeof createClient>,
  event: EventInsert,
) {
  const { error } = await supabase
    .from("chapter_engagement_events")
    .upsert(
      {
        chapter_id: event.chapterId,
        platform: normalizePlatform(event.platform),
        episode_number: event.episodeNumber,
        event_type: event.eventType,
        event_count: event.eventCount,
        platform_post_id: event.platformPostId,
        external_event_id: event.externalEventId,
        source: event.source,
        recorded_at: event.recordedAt || new Date().toISOString(),
      },
      { onConflict: "platform,platform_post_id,external_event_id,event_type", ignoreDuplicates: true },
    );

  if (error) throw error;
}

export async function getSocialPostMapping(
  supabase: ReturnType<typeof createClient>,
  platform: string,
  platformPostId: string,
): Promise<MappingRow | null> {
  const normalized = normalizePlatform(platform);
  let query = supabase
    .from("social_post_mapping")
    .select("platform, external_post_id, chapter_id, episode_number")
    .eq("external_post_id", platformPostId)
    .limit(1);

  if (normalized === "x") {
    query = query.in("platform", ["x", "twitter"]);
  } else {
    query = query.eq("platform", normalized);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return (data as MappingRow | null) ?? null;
}

export async function markWorkerStatus(
  supabase: ReturnType<typeof createClient>,
  workerName: string,
  success: boolean,
  stats: WorkerStats = {},
  errorMessage?: string,
) {
  const { error } = await supabase.rpc("touch_engagement_ingestion_worker", {
    p_worker_name: workerName,
    p_success: success,
    p_error_message: errorMessage ?? null,
    p_stats: stats,
  });

  if (!error) return;

  // Fallback if function is unavailable during phased deployment.
  await supabase
    .from("engagement_ingestion_worker_status")
    .upsert({
      worker_name: workerName,
      last_run_at: new Date().toISOString(),
      last_success_at: success ? new Date().toISOString() : null,
      last_error_at: success ? null : new Date().toISOString(),
      error_count: success ? 0 : 1,
      last_error_message: success ? null : (errorMessage ?? "Unknown error"),
      last_stats: stats,
      updated_at: new Date().toISOString(),
    }, { onConflict: "worker_name" });
}

export async function ingestWebhookPayload(params: {
  req: Request;
  platform: string;
  workerName: string;
  secretEnvKey: string;
  signatureHeader?: string;
}) {
  const rawBody = await params.req.text();
  const signatureOk = await verifyWebhookSignature(params.req, rawBody, {
    secretEnvKey: params.secretEnvKey,
    headerName: params.signatureHeader,
  });
  if (!signatureOk) {
    return responseJson(401, { error: "Invalid signature" });
  }

  let payload: unknown = {};
  if (rawBody.length) {
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = {};
    }
  }
  const events = extractWebhookEvents(payload);
  const supabase = createServiceClient();

  let inserted = 0;
  let unmapped = 0;
  for (const event of events) {
    const mapping = await getSocialPostMapping(supabase, params.platform, event.platformPostId);
    if (!mapping) {
      unmapped += 1;
      continue;
    }

    await insertEngagementEvent(supabase, {
      chapterId: mapping.chapter_id,
      platform: mapping.platform,
      episodeNumber: mapping.episode_number,
      eventType: event.eventType,
      eventCount: event.eventCount,
      platformPostId: event.platformPostId,
      externalEventId: event.externalEventId,
      source: "webhook",
      recordedAt: event.recordedAt,
    });
    inserted += 1;
  }

  await markWorkerStatus(
    supabase,
    params.workerName,
    true,
    { total_events: events.length, inserted, unmapped },
  );
  return responseJson(200, { ok: true, total_events: events.length, inserted, unmapped });
}

type PollMetrics = Partial<Record<EventType, number>>;
type PollFetchFn = (platformPostId: string) => Promise<PollMetrics | null>;

export async function runPollingJob(params: {
  workerName: string;
  platform: string | string[];
  fetchMetrics: PollFetchFn;
}) {
  const supabase = createServiceClient();
  const normalizedPlatforms = Array.isArray(params.platform)
    ? params.platform.map(normalizePlatform)
    : [normalizePlatform(params.platform)];

  let query = supabase
    .from("social_post_mapping")
    .select("platform, external_post_id, chapter_id, episode_number, posted_at")
    .gte("posted_at", new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString())
    .order("posted_at", { ascending: false })
    .limit(200);

  if (normalizedPlatforms.length === 1) {
    query = query.eq("platform", normalizedPlatforms[0]);
  } else {
    query = query.in("platform", normalizedPlatforms);
  }

  const { data: mappings, error } = await query;
  if (error) {
    await markWorkerStatus(supabase, params.workerName, false, {}, error.message);
    throw error;
  }

  let postsChecked = 0;
  let rowsInserted = 0;
  let apiErrors = 0;

  for (const mapping of (mappings ?? []) as MappingRow[]) {
    postsChecked += 1;
    try {
      const metrics = await params.fetchMetrics(mapping.external_post_id);
      if (!metrics) continue;

      const { data: existingRows, error: existingError } = await supabase
        .from("chapter_engagement_events")
        .select("event_type, event_count")
        .eq("platform", mapping.platform)
        .eq("platform_post_id", mapping.external_post_id);
      if (existingError) throw existingError;

      const existingTotals: Record<EventType, number> = {
        like: 0,
        comment: 0,
        share: 0,
        save: 0,
        view: 0,
      };
      for (const row of (existingRows ?? []) as Array<{ event_type: EventType; event_count: number }>) {
        if (EVENT_TYPES.includes(row.event_type)) {
          existingTotals[row.event_type] += Number(row.event_count) || 0;
        }
      }

      for (const eventType of EVENT_TYPES) {
        const current = Math.max(0, Math.floor(metrics[eventType] ?? 0));
        if (current <= 0) continue;
        const delta = Math.max(0, current - existingTotals[eventType]);
        if (delta <= 0) continue;

        await insertEngagementEvent(supabase, {
          chapterId: mapping.chapter_id,
          platform: mapping.platform,
          episodeNumber: mapping.episode_number,
          eventType,
          eventCount: delta,
          platformPostId: mapping.external_post_id,
          externalEventId: `poll:${mapping.external_post_id}:${eventType}:${current}`,
          source: "polling",
        });
        rowsInserted += 1;
      }
    } catch {
      apiErrors += 1;
    }
  }

  await markWorkerStatus(supabase, params.workerName, true, {
    posts_checked: postsChecked,
    rows_inserted: rowsInserted,
    api_errors: apiErrors,
  });

  return responseJson(200, {
    ok: true,
    worker: params.workerName,
    posts_checked: postsChecked,
    rows_inserted: rowsInserted,
    api_errors: apiErrors,
  });
}
