---
knight_session: K458
bishop_session: B119
bridle_version: 10
status: READY TO DISPATCH
predecessor_gate: K451 baseline (v-migration-baseline-K451, eec98a7) ✓
target_tag: v-meter-reader-k458-mvp
task_class: Supabase schema + edge function + two platform adapters (Bluesky, Mastodon)
estimated_model: Sonnet 4.6 (infra-density; straightforward once scoped)
scope_size: LARGE (consider K458a / K458b split mid-session if needed)
---

**THE BRIDLE — read this before you respond. Follow all ten rules. Task follows the BRIDLE block.**

1. **Do the task I asked.** Do not restate it back. Do not ask "should I start?" — the answer is yes, start now.
2. **Verify before asserting.** If I point at a folder, open that folder. Run `ls`, `grep`, read the file. Memory and training are not evidence. Look, then claim.
3. **You get ONE clarifying question per turn, and only if the wrong answer would produce the wrong artifact.** Not for tone, font, format, or preferences you can pick defensibly yourself. Pick a defensible default and proceed.
4. **Read everything I sent** — text, screenshots, attachments, code, all of it. If you skimmed, say so in the first line of your reply.
5. **Don't invent.** If you don't know, say "I don't know" in one line, then look it up or flag it. Never guess and present the guess as fact. Never fabricate filenames, slot numbers, function names, counts, or prior states.
6. **No unasked scope.** No "while we're here." No bonus suggestions. I will ask if I want more.
7. **When you finish, state plainly what you did and what remains.** No self-congratulation, no apology, no closing summary of what I already read.
8. **If I correct you, fix the thing.** One sentence on root cause only if it prevents recurrence. Then fix. No essays.
9. **If you break any rule above, stop and say so on the next line.** Don't cover.
10. **MCP tooling discipline.** Always use `npm run build-guarded` (not raw `npm run build`) when modifying `librarian-mcp/src/`. Always use `npm start` (not raw `node dist/server.js`) to run the MCP server. The guard emits structured `server_rebuilding` errors during build windows; the supervisor auto-restarts on silent crash. Bypassing either returns us to the pre-K448 / pre-K449 silent-hang regime.

**End of BRIDLE. Task follows.**

---

## Context

**Founder-ratified B119** — the **Meter Reader** is a scheduled polling system that checks each member's social-media/email Plugs on a user-configured cron schedule, ingests inbound responses (comments, replies, mentions) as **Plug Echoes**, applies Shirley Temple content classification on ingest, and surfaces filtered Echoes to members via a **Radar** dashboard.

**Two canonical names:**
- **Plug Echo** — the return-flow data (inbound responses; internal/architecture/ledger-layer naming)
- **Radar** — the member's dashboard view of their Echoes (member-facing UI)

**Use case:** cooperative-platform-native external engagement monitoring, with default-STRICT age-appropriate filtering and a structured permissive-override requiring two stamps (see below). Enables the marketing positioning: *"Your kids are safe with us — because we don't have to watch them — and neither do you."* LB monitors responses to OUR posts only; never surveils member devices or third-party browsing.

**Reference memories (read before starting):**
- `project_slow_blade_architecture_v2.md` — Furnace stamps are the auditable ledger primitive this system extends
- `feedback_three_fates_scribe_routing.md` — every Echo ingest + override should route to appropriate Scribes
- Current Supabase `pg_cron` usage + edge function patterns (grep `platform/supabase/functions/` for cron-triggered examples)

---

## Scope

### Phase 1 — Supabase schema

New migration file at `platform/supabase/migrations/<YYYYMMDDHHMMSS>_k458_meter_reader.sql`:

```sql
-- plug_schedules: per-user, per-plug polling configuration
CREATE TABLE IF NOT EXISTS public.plug_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plug_id UUID NOT NULL,  -- FK to plugs table; confirm column name vs. existing schema
  platform TEXT NOT NULL CHECK (platform IN ('bluesky','mastodon','twitter','facebook','instagram','linkedin','reddit','discord','email')),
  cron_schedule TEXT NOT NULL,        -- standard cron syntax; validated on insert
  last_checked_at TIMESTAMPTZ,
  next_check_at TIMESTAMPTZ,
  shirley_temple_tier TEXT NOT NULL DEFAULT 'G' CHECK (shirley_temple_tier IN ('G','PG','PG-13','R')),
  additional_filters JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- plug_echoes: ingested responses to our posts
CREATE TABLE IF NOT EXISTS public.plug_echoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.plug_schedules(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  external_post_id TEXT NOT NULL,
  external_response_id TEXT NOT NULL,
  response_type TEXT NOT NULL,        -- 'comment' | 'reply' | 'mention' | 'like' | 'share' | 'email_reply'
  response_content TEXT,
  external_author_handle TEXT,
  shirley_temple_classification TEXT, -- classifier output at ingest
  filtered_out BOOLEAN NOT NULL DEFAULT false,
  override_stamps JSONB DEFAULT '[]'::jsonb,  -- array of stamp IDs if manually allowed past the filter
  surfaced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(platform, external_response_id)
);

-- plug_permission_changes: ledger of override events (audit trail)
CREATE TABLE IF NOT EXISTS public.plug_permission_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.plug_schedules(id),
  changed_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  purchasing_member_id UUID NOT NULL REFERENCES auth.users(id),  -- whose card backs the membership
  change_type TEXT NOT NULL,          -- 'tier_raised' | 'tier_lowered' | 'filter_added' | 'override_stamped'
  previous_tier TEXT,
  new_tier TEXT,
  stamp_1_id UUID NOT NULL,           -- Furnace stamp IDs (must be 2 for any permissive change)
  stamp_2_id UUID NOT NULL,
  rationale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS policies
ALTER TABLE public.plug_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plug_echoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plug_permission_changes ENABLE ROW LEVEL SECURITY;

-- Member can read/write their own schedules
CREATE POLICY plug_schedules_self ON public.plug_schedules FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Member can read their own Echoes (respects Shirley Temple tier via app-layer filter)
CREATE POLICY plug_echoes_self ON public.plug_echoes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.plug_schedules s
    WHERE s.id = plug_echoes.schedule_id AND s.user_id = auth.uid()
  ));

-- Only service role can insert Echoes (edge function does the ingest)
CREATE POLICY plug_echoes_ingest ON public.plug_echoes FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Permission changes: purchasing-member OR the schedule-owner can create, but only with 2 stamps
CREATE POLICY plug_permission_changes_self ON public.plug_permission_changes FOR ALL
  USING (changed_by_user_id = auth.uid()) WITH CHECK (changed_by_user_id = auth.uid());

-- Indices for hot paths
CREATE INDEX IF NOT EXISTS plug_schedules_next_check ON public.plug_schedules(next_check_at) WHERE active = true;
CREATE INDEX IF NOT EXISTS plug_echoes_schedule ON public.plug_echoes(schedule_id, created_at DESC);
CREATE INDEX IF NOT EXISTS plug_echoes_unsurfaced ON public.plug_echoes(schedule_id, filtered_out) WHERE surfaced_at IS NULL;
```

**Verify `plugs` table column names + existing plug schema before writing this migration** (`grep -r "CREATE TABLE.*plugs" platform/supabase/migrations/`). If `plugs` table column is `user_id` and `id` per standard, the FK above is correct; if named differently, adjust. If `plugs` doesn't yet exist as a table, STOP and ask — the Meter Reader assumes existing Battery/Plug infrastructure.

### Phase 2 — Meter Reader edge function

`platform/supabase/functions/meter-reader/index.ts`:

```typescript
// Triggered by pg_cron every minute
// Queries plug_schedules WHERE active AND next_check_at <= NOW()
// For each due schedule, invokes the platform adapter
// Adapter returns array of new Echoes (delta since last_checked_at)
// Edge function classifies each via Shirley Temple, writes to plug_echoes
// Updates next_check_at based on cron_schedule
```

Core behavior:
1. Query due schedules (limit 100 per invocation to respect edge function timeout)
2. For each, look up platform adapter by `platform` field
3. Call adapter with `(cached_credentials, last_checked_at)` → returns `{echoes: Echo[], new_last_checked_at: Date}`
4. Classify each echo via Shirley Temple classifier
5. Insert into `plug_echoes` with classification + `filtered_out = (tier > schedule.shirley_temple_tier)`
6. Update `plug_schedules.last_checked_at` + `plug_schedules.next_check_at` (parse cron_schedule; use `https://deno.land/x/croner` or similar)
7. Log audit row to a new `meter_reader_audit` table (batch summaries — count per schedule per run)

**pg_cron trigger** in the migration:
```sql
SELECT cron.schedule('meter-reader-minute', '* * * * *', 
  $$SELECT net.http_post(
    url := 'https://ruuxzilgmuwddcofqecc.supabase.co/functions/v1/meter-reader',
    headers := '{"Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb
  )$$);
```

(Verify pg_cron is enabled in the project before writing this; `SELECT * FROM pg_extension WHERE extname = 'pg_cron'`.)

### Phase 3 — Platform adapter interface + two implementations

`platform/supabase/functions/_shared/plug_adapters/types.ts`:

```typescript
export interface Echo {
  external_post_id: string;
  external_response_id: string;
  response_type: 'comment' | 'reply' | 'mention' | 'like' | 'share' | 'email_reply';
  response_content: string;
  external_author_handle: string;
  received_at: Date;
}

export interface PlugAdapter {
  platform: string;
  poll(credentials: Record<string,string>, sinceTimestamp: Date): Promise<Echo[]>;
}
```

**Adapter 1 — Bluesky** (`plug_adapters/bluesky.ts`):

Use AT Protocol. `app.bsky.notification.listNotifications` endpoint filtered by type: `['reply', 'mention', 'quote', 'like', 'repost']`. Credentials: handle + app-password or OAuth session token.

**Adapter 2 — Mastodon** (`plug_adapters/mastodon.ts`):

Use Mastodon REST API `/api/v1/notifications?types[]=mention&types[]=reblog&types[]=favourite&types[]=reply`. Credentials: instance URL + access token.

**Adapters 3-7 (DEFERRED):** Twitter/X (gated on paid API; Founder-ops task), Facebook / Instagram (Meta app review), LinkedIn (limited), Reddit (easy, next), Discord (webhook-based, next). Create stub adapter files for each with `NotImplementedError` + comment referencing K458c.

### Phase 4 — Shirley Temple classifier (ingest-time)

Classifier at `platform/supabase/functions/_shared/shirley_temple/classify.ts`:

```typescript
export type ShirleyTempleTier = 'G' | 'PG' | 'PG-13' | 'R';

export interface ClassificationResult {
  tier: ShirleyTempleTier;
  confidence: number;
  flags: string[];   // e.g. ['profanity', 'violence-verbal', 'adult-ref']
}

export function classifyContent(text: string): ClassificationResult;
```

**Implementation choice:** for MVP, deterministic keyword + regex rules per tier (similar to the existing Content Shield logic at `platform/src/pages/ContentControlsPage.tsx` if it has shared rules — reuse them). Log each classification to audit.

Phase 5 adds model-based classification as a second tier; K458 MVP uses deterministic only.

**Policy:** `filtered_out = (echo.tier > schedule.shirley_temple_tier)`. Default schedule tier is 'G' (strictest). Content above tier is hidden from member until permission change with 2 Furnace stamps is recorded.

### Phase 5 — Permission-override flow (2-stamp Furnace requirement)

New edge function `platform/supabase/functions/plug-permission-change/index.ts`:

1. Accepts `{schedule_id, new_tier, stamp_1_id, stamp_2_id, rationale}`
2. Verifies both stamp IDs exist in Furnace ledger (via hash lookup) and are owned by the calling user
3. Verifies calling user is the `purchasing_member` OR has purchasing-member-delegated authority (new column on profiles — query from there)
4. Writes row to `plug_permission_changes`
5. Updates `plug_schedules.shirley_temple_tier` to `new_tier`
6. Sends notification to purchasing_member (via existing notifications table — confirm surface)
7. Returns updated schedule

**Critical: single-stamp permissive changes MUST FAIL** — no partial-credit override. Both stamps required.

### Phase 6 — Member Helm UI (minimal)

Add to member Helm:
- Schedule list view (`/helm/plug-schedules`) — table of active schedules with cron, tier, last-checked, echo-count
- Single schedule editor (`/helm/plug-schedules/:id`) — edit cron, tier (with 2-stamp flow if raising), filters
- Radar view (`/helm/radar`) — unified feed of unsurfaced Echoes across all schedules, filtered by tier
- Permission change form (requires stamp selection)

**Keep UI minimal** — this session ships backend + one functional UI path. Polish is K458d.

### Phase 7 — Tests

- pgTAP tests for RLS policies (schedule-owner-only read/write; purchasing-member-only permission changes; 2-stamp requirement enforced)
- Unit tests for each adapter (mocked API responses)
- Unit tests for Shirley Temple classifier
- Integration test for meter-reader edge function (mocked schedules + mocked adapters → verify echo rows created correctly)
- Failure test: permission change with only 1 stamp → assert rejection

### Phase 8 — Tag + handoff

Tag `v-meter-reader-k458-mvp`. Report at `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K458_B119_METER_READER_MVP.md`.

Report must include:
- Migration file + what it adds
- Edge function file paths + role of each
- Adapter coverage (Bluesky ✓, Mastodon ✓, others stubbed with K458c reference)
- 2-stamp flow demo (test the full override in staging)
- Helm UI screenshots (3 views)
- RLS test coverage

---

## Non-goals (strict)

- Do NOT build Twitter/X adapter — gated on Founder's Basic-tier API approval
- Do NOT build Facebook/Instagram adapters — Meta app review is separate blocker
- Do NOT modify Battery / Plug outbound infrastructure. This is additive.
- Do NOT reimplement Furnace stamp verification — use existing Furnace lookup
- Do NOT change Shirley Temple tier definitions — reuse current ContentControlsPage definitions
- Do NOT ship model-based classification (K458b+); deterministic rules only in MVP
- Do NOT log raw Echo content to Scribes (privacy — Echoes go to `plug_echoes`, not Scribe Cathedral)

---

## Deliverables checklist

| # | Deliverable | Gate |
|---|---|---|
| 1 | Migration file with 3 tables + RLS + indices + pg_cron schedule | Phase 1 |
| 2 | `meter-reader` edge function polling due schedules | Phase 2 |
| 3 | `plug_adapters/bluesky.ts` + `plug_adapters/mastodon.ts` | Phase 3 |
| 4 | Stub adapters for Twitter/Facebook/Instagram/LinkedIn/Reddit/Discord/Email | Phase 3 |
| 5 | `shirley_temple/classify.ts` deterministic classifier | Phase 4 |
| 6 | `plug-permission-change` edge function with 2-stamp requirement | Phase 5 |
| 7 | Helm schedule-list + editor + Radar view | Phase 6 |
| 8 | pgTAP + unit + integration tests green | Phase 7 |
| 9 | Tag + handoff report with 3 UI screenshots + 2-stamp demo | Phase 8 |

---

## BRIDLE compliance

| Rule | Demonstrate |
|---|---|
| Rule 2 | Verify `plugs` table exists before writing FK; verify `pg_cron` extension enabled; verify Shirley Temple existing rules |
| Rule 5 | AT Protocol endpoint names exact (app.bsky.notification.listNotifications); Mastodon API path exact; cron syntax validated |
| Rule 6 | Zero UI polish beyond 3 functional views; zero model-classification; zero additional adapters |
| Rule 10 | No librarian-mcp/src edits (this session is platform-only) — confirm in handoff |

---

## Clarifying-question budget (BRIDLE Rule 3)

One permitted. Valid uses:
- If `plugs` table doesn't exist under that name, ask what schema Battery/Plug is on
- If `notifications` table for purchasing_member alerting doesn't have the expected shape
- If Shirley Temple tier rules aren't centralized anywhere that can be imported

Anything else: pick defensibly.

---

*Knight K458 authored by Bishop B119, 2026-04-23. Meter Reader MVP — Bluesky + Mastodon, default-STRICT Shirley Temple, 2-stamp Furnace override, Helm Radar view. Twitter + Meta adapters gated on external approvals (Founder-owned ops tasks). FOR THE KEEP.*
