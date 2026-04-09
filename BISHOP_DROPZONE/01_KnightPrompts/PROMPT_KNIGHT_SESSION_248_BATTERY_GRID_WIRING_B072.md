# KNIGHT SESSION 248 — Battery Dispatch + Opening Gambit Reloaded Integration
## Dispatched by: Bishop B072
## Date: April 3, 2026
## Priority: HIGH — Wire Distribution Grid into live Battery infrastructure + Opening Gambit

---

## MISSION

Wire the Concurrent Distribution Grid (#2141) into the live Battery Dispatch system (K240) and integrate with Opening Gambit Reloaded for coordinated multi-channel activation.

---

## CONTEXT

### What Exists
- Battery Dispatch LIVE (K240): crewman_chapters, crewman_episodes, dispatch/track edge functions, cron jobs
- Distribution Grid spec (K245): grid scheduler, cross-references, viewing schedule
- Spice Rack tagging (K246): spice tags on episodes
- Opening Gambit: 53 letters, compressed wave, Phase 1 fired Apr 2-3

### What This Session Does
- Connect Grid Scheduler output to Battery Dispatch's cron dispatch loop
- Multi-platform posting (extend dispatcher beyond single-platform)
- Coordinate BST/Spoonfuls/Stones launches with Opening Gambit letter wave
- Add engagement aggregation for self-referencing loop data

---

## IMPLEMENTATION

### 1. Migration: Multi-Platform Dispatch Support

File: `platform/supabase/migrations/20260404000009_multi_platform_dispatch.sql`

```sql
-- Platform accounts for multi-channel posting
CREATE TABLE IF NOT EXISTS public.dispatch_platform_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'threads', 'bluesky', 'instagram', 'facebook')),
  account_name TEXT NOT NULL,
  auth_token_encrypted TEXT,  -- encrypted OAuth token
  is_active BOOLEAN NOT NULL DEFAULT true,
  posting_config JSONB DEFAULT '{}',  -- platform-specific config (character limits, media support, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Engagement aggregation for self-referencing loop
CREATE TABLE IF NOT EXISTS public.distribution_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID REFERENCES public.crewman_episodes(id),
  platform TEXT NOT NULL,
  time_slot TIMESTAMPTZ NOT NULL,
  day_of_week TEXT NOT NULL,
  hour_local INTEGER NOT NULL,
  channel TEXT NOT NULL,       -- bst, spoonfuls, skipping_stones
  content_type TEXT,            -- spice tag (primary)
  likes INTEGER NOT NULL DEFAULT 0,
  replies INTEGER NOT NULL DEFAULT 0,
  reposts INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  cross_ref_clicks INTEGER NOT NULL DEFAULT 0,
  beacon_creates INTEGER NOT NULL DEFAULT 0,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_channel_platform
  ON public.distribution_analytics (channel, platform);
CREATE INDEX IF NOT EXISTS idx_analytics_content_type
  ON public.distribution_analytics (content_type);
CREATE INDEX IF NOT EXISTS idx_analytics_time
  ON public.distribution_analytics (day_of_week, hour_local);
```

### 2. Update Dispatch Cron

Modify existing `dispatch-crewman-episode` to:
1. Check `scheduled_for` timestamp — only dispatch when current time >= scheduled_for
2. Look up target platform from grid schedule (not hardcoded to twitter)
3. Post to correct platform account from dispatch_platform_accounts
4. Include cross_ref_text in post body
5. After posting, insert record into distribution_analytics

### 3. Edge Function: Aggregate Analytics

File: `platform/supabase/functions/aggregate-distribution-analytics/index.ts`

Runs on cron (daily). For each posted episode:
1. Pull engagement from platform APIs (or from track-crewman-engagement results)
2. Upsert into distribution_analytics with full dimensional data
3. Return daily summary: best-performing spice × channel × time_slot

### 4. Edge Function: Self-Reference Data Export

File: `platform/supabase/functions/export-loop-data/index.ts`

Generates a narrative-ready data summary for BST chapter production:
```json
{
  "period": "2026-04-04 to 2026-04-18",
  "top_spice_by_channel": { "twitter": "paprika", "linkedin": "garlic" },
  "best_time_slot": { "twitter": "2pm", "linkedin": "9am" },
  "cross_ref_conversion_rate": 0.12,
  "vote_gate_progress": { "chapter_3": "87%" },
  "narrative_summary": "Personal narrative (Paprika) outperformed technical detail (Cumin) 2.3x on Twitter..."
}
```

This export becomes source material for the next BST chapter's opening — completing the self-referencing loop.

### 5. Opening Gambit Reloaded Integration

When Opening Gambit letters reference "watch the cooperative being built":
1. Include Viewing Schedule URL in letter footer
2. Coordinate BST Chapter 3 launch to coincide with Phase 2 letter wave (media + influencers)
3. Add tracking: which letter recipients visit the Viewing Schedule → which series they engage with
4. Letter-to-viewer-to-member funnel attribution

---

## VALIDATION CHECKLIST

- [ ] Migration applies cleanly
- [ ] Dispatch respects scheduled_for timestamps
- [ ] Multi-platform posting works (or simulates cleanly)
- [ ] Cross-ref text included in posts
- [ ] Analytics records created per post
- [ ] Daily aggregation produces correct summaries
- [ ] Export generates narrative-ready data
- [ ] `npm run build` succeeds
- [ ] Session logged via Librarian (K248)
