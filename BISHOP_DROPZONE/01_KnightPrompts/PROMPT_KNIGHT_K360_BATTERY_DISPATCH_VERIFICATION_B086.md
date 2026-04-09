# Knight Session K360 — Battery Dispatch Full Verification + Cron Wiring
# Bishop B086 | Priority: HIGH | Depends on: K351 (Spoonful generator DEPLOYED)

## CONTEXT
Battery Dispatch has 4 edge functions deployed:
- `process-scheduled-posts` — main scheduler
- `dispatch-viewing-beacons` — beacon distribution
- `dispatch-executor` — general dispatch
- `dispatch-crewman-episode` — BST episode distribution

15 test episodes are staged (5 puddings × 3 platforms). Chapter 999 test data was seeded. Social media Edge Function secrets are verified present. But we need to confirm the full pipeline actually fires and verify the cron scheduling.

## WHAT TO BUILD

### 1. Dispatch Health Dashboard
Create `DispatchHealthPage` (`/v2/ops/dispatch-health`):
- **Cron Status Panel**: show all pg_cron jobs related to dispatch, their schedule, last run, next run, status
- **Queue Inspector**: query `scheduled_posts` / `member_scheduled_posts` — show pending, processing, sent, failed counts
- **Audit Log Viewer**: read `dispatch_audit_log` — last 50 entries with filters (platform, status, date range)
- **Test Fire Button** (admin only): manually trigger `process-scheduled-posts` edge function with `{ test_mode: true }`
- **Platform Status Cards**: one card per platform (Twitter/X, Instagram, LinkedIn, Facebook) showing:
  - Connected: yes/no (check `member_social_accounts`)
  - Last successful post: timestamp
  - Posts queued: count
  - Error rate: last 7 days

### 2. Cron Schedule Verification
Check and fix pg_cron entries:
```sql
-- Expected schedules:
-- process-scheduled-posts: every 15 minutes
SELECT cron.schedule('dispatch-scheduled-posts', '*/15 * * * *',
  $$SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/process-scheduled-posts',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')),
    body := '{"process_all": true}'::jsonb
  )$$
);

-- dispatch-crewman-episode: hourly (BST episodes)
SELECT cron.schedule('dispatch-crewman-episode', '0 * * * *',
  $$SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/dispatch-crewman-episode',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')),
    body := '{"process_all": true}'::jsonb
  )$$
);
```

### 3. Dead Letter Queue
For posts that fail 3+ times:
```sql
CREATE TABLE IF NOT EXISTS dispatch_dead_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_post_id UUID,
  platform TEXT NOT NULL,
  error_message TEXT,
  payload JSONB,
  attempt_count INTEGER DEFAULT 0,
  first_failed_at TIMESTAMPTZ,
  last_failed_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id)
);
```
- Modify `process-scheduled-posts` to move posts to dead_letters after 3 failures
- Add "Dead Letters" tab to DispatchHealthPage showing unresolved failures

### 4. Spoonful Pipeline Connector
Wire K351's spoonful generator output into Battery Dispatch:
- When a Spoonful is generated from a Pudding, auto-create a `scheduled_posts` entry
- Stagger across platforms: Twitter immediately, LinkedIn +2h, Instagram +4h
- Respect Concurrent Distribution Grid (#2141): no two posts from same Pudding within 6 hours on same platform

## FILES TO CREATE/MODIFY
- `platform/src/pages/v2/ops/DispatchHealthPage.tsx`
- `platform/supabase/migrations/YYYYMMDDHHMMSS_k360_dispatch_verification.sql`
- Modify `platform/supabase/functions/process-scheduled-posts/index.ts` — add dead letter logic
- Add route to ops section
- Modify sidebar: add "Dispatch Health" under Tools & Content

## CONSTRAINTS
- Test mode must NEVER actually post to social platforms — log only
- Concurrent Distribution Grid: ~24 posts/day max, staggered across channels
- Dead letter resolution requires admin action, not auto-retry
- All timestamps in UTC with local display conversion

## DONE WHEN
- [ ] DispatchHealthPage shows real cron status + queue counts + audit log
- [ ] pg_cron schedules verified and corrected if needed
- [ ] Dead letter queue catches 3x failures
- [ ] Spoonful → scheduled_posts pipeline wired
- [ ] Test fire button works in test mode (no real posts)
- [ ] Chapter 999 test data visible in queue inspector
