# KNIGHT SESSION 289 — Engagement Events Ingestion (feeds K287 vote gate)
## Bishop B076 | April 4, 2026
## Source: Pawn B48 + K287 dependency

---

## Mission

Automate the ingestion of engagement events (likes, comments, shares, saves) from X, Threads, LinkedIn, Facebook, Instagram into the `chapter_engagement_events` table that K287 creates. This powers the live vote-gate progress display and auto-unlock triggers.

Without this, K287's unlock progress is manual-entry only. With this, unlock progress updates in real time from platform analytics.

## Why This Matters

K287 depends on `chapter_engagement_events` having real data. Manual entry is a stopgap; a platform-level integration turns the vote gate from a manual milestone tracker into a live community engagement scoreboard.

**Current state**: K287 migration creates the table + view + trigger. Manual staff form inserts events. Progress view computes percent_unlocked from whatever exists.

**K289 adds**: webhook receivers, polling workers, and API integrations that populate the events table automatically.

---

## Implementation

### Part 1 — Webhook receivers (primary path)

Create edge functions per platform to receive webhook callbacks:

- `platform/supabase/functions/webhook-x-engagement/index.ts`
- `platform/supabase/functions/webhook-threads-engagement/index.ts`
- `platform/supabase/functions/webhook-linkedin-engagement/index.ts`
- `platform/supabase/functions/webhook-meta-engagement/index.ts`

Each receives engagement event payloads, validates webhook signatures, maps the event to a chapter_id via `social_post_mapping` (new table), and inserts to `chapter_engagement_events`.

```sql
-- Map each dispatched social post to its source chapter/episode
CREATE TABLE IF NOT EXISTS public.social_post_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  external_post_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  episode_number INTEGER,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (platform, external_post_id)
);

CREATE INDEX idx_social_post_mapping_chapter ON public.social_post_mapping(chapter_id);
CREATE INDEX idx_social_post_mapping_external ON public.social_post_mapping(platform, external_post_id);
```

When Battery Dispatch posts to a platform, it records the returned post ID in `social_post_mapping`. Webhook receivers look up this mapping to attribute incoming engagement to the correct chapter.

### Part 2 — Polling workers (fallback for platforms without webhooks)

For platforms without reliable webhook support (or rate-limiting constraints), add scheduled edge functions:

- `poll-x-engagement` — runs every 15 min via pg_cron, fetches metrics for posts from last 72h via X API v2
- `poll-threads-engagement` — runs every 30 min via Meta Graph API
- `poll-linkedin-engagement` — runs every 60 min via LinkedIn API
- `poll-meta-engagement` — runs every 30 min for FB/IG via Graph API

Each polling function:
1. Queries `social_post_mapping` for posts in last 72h
2. Calls platform API for each post's current engagement counts
3. Computes delta vs previously-recorded counts
4. Inserts delta as new rows in `chapter_engagement_events`

### Part 3 — API credential management

API credentials stored in Supabase Vault (NOT in migration files):

```sql
-- Reference pattern (actual secrets set via Supabase dashboard):
-- vault.create_secret('X_BEARER_TOKEN', 'actual-token-value')
-- vault.create_secret('META_ACCESS_TOKEN', 'actual-token-value')
-- vault.create_secret('LINKEDIN_CLIENT_SECRET', 'actual-token-value')
```

Edge functions read secrets via `Deno.env.get()` or `vault.secrets`.

### Part 4 — Dispatcher integration

Update Battery Dispatch (see K285/K286) to write to `social_post_mapping` when it successfully posts content:

```ts
// After successful platform post:
await supabase.from('social_post_mapping').insert({
  platform: 'x',
  external_post_id: xResponse.data.id,
  chapter_id: post.chapter_id,
  episode_number: post.episode_number,
  posted_at: new Date().toISOString()
});
```

### Part 5 — Deduplication logic

Engagement events can arrive multiple times (webhook + polling). Ensure idempotency:

```sql
-- Unique constraint to prevent duplicate event recording
ALTER TABLE public.chapter_engagement_events
  ADD COLUMN IF NOT EXISTS external_event_id TEXT,
  ADD COLUMN IF NOT EXISTS platform_post_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS ux_engagement_event_dedupe
  ON public.chapter_engagement_events (platform, platform_post_id, external_event_id, event_type)
  WHERE external_event_id IS NOT NULL;
```

Webhook and polling inserts use `ON CONFLICT DO NOTHING` against this index.

### Part 6 — Admin dashboard

Add a staff page `platform/src/pages/staff/EngagementIngestionMonitor.tsx`:
- Status of each polling worker (last run, last success, error count)
- Rate of new events per platform per hour
- Gaps in coverage (chapters posted but no engagement events received)
- Manual re-poll trigger button

### Part 7 — Verification

After deploy:
1. Post test content to X via Battery Dispatch; verify `social_post_mapping` row created
2. Manually trigger poll-x-engagement; verify events arrive in `chapter_engagement_events`
3. Check `chapter_unlock_progress` view shows incrementing engagement
4. Verify auto-unlock trigger fires when threshold crossed
5. Verify dedupe: run polling twice, confirm no duplicate events

---

## Deliverables

1. **Migration**: `platform/supabase/migrations/20260404000033_engagement_ingestion.sql`
   - `social_post_mapping` table
   - Dedupe columns on `chapter_engagement_events`
2. **Edge functions**: 4 webhook receivers + 4 polling workers
3. **Battery Dispatch integration**: hook into K285 dispatch code to record post IDs
4. **Admin UI**: ingestion monitor page
5. **Cron schedules** for polling workers
6. **Documentation**: API setup runbook (which credentials needed per platform, where to find them in vault)
7. **Verification report**

---

## Dependencies

- **K287** (vote gate progress display) must be deployed first — creates the `chapter_engagement_events` table and `chapter_unlock_progress` view
- **K285/K286** (Battery Dispatch updates) must be deployed first — provides the dispatch code that will write to `social_post_mapping`

## Context References

- **Pawn B48**: `BISHOP_DROPZONE/PAWN_B48_DISTRIBUTION_STRATEGY_ANALYSIS.md` (§6 Vote Gate Psychology)
- **K287**: `PROMPT_KNIGHT_SESSION_287_VOTE_GATE_PROGRESS_DISPLAY_B076.md`
- **K285/K286**: Battery Dispatch burst pacing + role-based staggering

*Knight: execute end-to-end. Can ship in phases (webhooks first, then polling, then admin UI). FOR THE KEEP.*
