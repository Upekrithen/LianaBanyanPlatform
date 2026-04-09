# KNIGHT SESSION 254 — Deploy Launch Infrastructure (K251/K252) + Run Easter Scheduling
## Bishop B075 | April 4, 2026
## Priority: CRITICAL — Easter launch is April 5, 2026

---

## MISSION

Deploy the two migrations and three edge functions built in K251/K252, then run the scheduling script to set Easter Day 1 (April 5, 10am CT) as the first BST episode dispatch. Verify everything end-to-end.

---

## CONTEXT

K251 built: updated `dispatch-crewman-episode`, `schedule-opening-gambit.ts` script, `LaunchSchedulePage.tsx`, migration `20260404000009_multi_platform_dispatch.sql`

K252 built: `validate-viewing-access` edge function, `create-viewing-token` edge function, merged Viewing Schedule controls into `LaunchSchedulePage.tsx`, migration `20260404000010_viewing_schedule_access.sql`

All code is built and lint-clean. Nothing is deployed to Supabase yet.

---

## STEP 1: Deploy Migrations (Sequential)

```bash
cd platform

# Migration 9: Multi-platform dispatch tables
npx supabase db push --include-migrations "20260404000009_multi_platform_dispatch.sql"

# Migration 10: Viewing schedule access tables
npx supabase db push --include-migrations "20260404000010_viewing_schedule_access.sql"
```

**Verify:**
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('dispatch_platform_accounts', 'distribution_analytics', 'opening_gambit_funnel_events', 'platform_feature_flags', 'viewing_schedule_tokens', 'viewing_schedule_views');
```

All 6 tables must exist.

---

## STEP 2: Deploy Edge Functions (Parallel OK)

```bash
cd platform

# Updated function
npx supabase functions deploy dispatch-crewman-episode

# New functions
npx supabase functions deploy create-viewing-token
npx supabase functions deploy validate-viewing-access
```

**Verify each returns 200:**
```bash
curl -s -o /dev/null -w "%{http_code}" https://YOUR_SUPABASE_URL/functions/v1/dispatch-crewman-episode -H "Authorization: Bearer ANON_KEY"
curl -s -o /dev/null -w "%{http_code}" https://YOUR_SUPABASE_URL/functions/v1/create-viewing-token -H "Authorization: Bearer ANON_KEY"
curl -s -o /dev/null -w "%{http_code}" https://YOUR_SUPABASE_URL/functions/v1/validate-viewing-access -H "Authorization: Bearer ANON_KEY"
```

---

## STEP 3: Set Viewing Schedule to Private

```sql
-- Ensure initial state is private (K252 migration should have set this)
INSERT INTO platform_feature_flags (flag_name, flag_value, updated_by)
VALUES ('viewing_schedule_access', 'private', 'bishop-b075')
ON CONFLICT (flag_name) DO UPDATE SET flag_value = 'private', updated_at = NOW();
```

---

## STEP 4: Run Scheduling Script for Easter Day 1

```bash
cd platform

# Run the scheduling script
npx tsx scripts/schedule-opening-gambit.ts
```

**This script should:**
1. Set BST EP-001 (Chapter 1, StarScreaming) `scheduled_for` = April 5, 2026 10:00 AM CT (15:00 UTC)
2. Set Days 1-3 manual placements (13 items per K251 spec)
3. Call `schedule-distribution-grid` for Days 4-10

**Verify Day 1 is scheduled:**
```sql
SELECT id, episode_key, series, chapter, scheduled_for, status
FROM crewman_episodes
WHERE scheduled_for >= '2026-04-05T00:00:00Z'
  AND scheduled_for < '2026-04-06T00:00:00Z'
ORDER BY scheduled_for;
```

Must show at least 1 episode scheduled for April 5.

---

## STEP 5: Wire LaunchSchedulePage Route

Check if `/staff/launch-schedule` route exists in the router. If not, add it:

**File**: `platform/src/App.tsx` (or wherever routes are defined)

```tsx
import LaunchSchedulePage from './pages/staff/LaunchSchedulePage';

// In routes:
<Route path="/staff/launch-schedule" element={<LaunchSchedulePage />} />
```

Also add sidebar link in the staff navigation if not already present.

---

## STEP 6: Deploy Frontend

```bash
cd platform
npm run build
npx firebase deploy --only hosting:main
```

---

## STEP 7: Final Verification

1. Visit `/staff/launch-schedule` — page loads, shows Day 1 tab with scheduled episode
2. Viewing Schedule Access panel shows "private" toggle
3. Token generator works (create a test token, copy URL)
4. `dispatch-crewman-episode` cron is registered and will fire at scheduled time

---

## ACCEPTANCE CRITERIA

- [ ] 6 new tables exist in Supabase
- [ ] 3 edge functions deployed and responding
- [ ] At least 1 episode scheduled for April 5 10am CT
- [ ] LaunchSchedulePage accessible at `/staff/launch-schedule`
- [ ] Viewing schedule access = 'private'
- [ ] Frontend deployed to Firebase
- [ ] `npm run build` passes clean

---

## DO NOT

- Change viewing schedule access to anything other than 'private'
- Run the dispatch cron manually (it fires automatically)
- Modify any episode content — only scheduling metadata
- Deploy to any hosting target other than `main`
