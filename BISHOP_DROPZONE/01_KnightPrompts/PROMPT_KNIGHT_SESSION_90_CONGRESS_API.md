# KNIGHT SESSION 90 — Congress.gov API: Live Bill Tracking
**Bishop Session**: 028
**Date**: March 23, 2026
**Innovation Count**: 1,935 (no change)
**Base**: K89 Housing / Mission TWO

## MISSION
Wire the Political Expedition page to the Congress.gov API for live bill tracking and representative-to-bill mapping. Replace manually seeded bill data with real-time congressional data. Members will see which bills their saved representatives are sponsoring, track bill progress through committee/floor/vote stages, and search for new legislation — all from live federal data.

The API key is already obtained. This session turns a static civics page into a living democracy dashboard.

## PREVIOUS SESSION
K89 built Housing / Mission TWO: Housing Hub page with 4 tabs, 6 tables (housing_properties, housing_contributions, housing_occupancy, housing_waterwheel, vacation_listings, vacation_bookings), Property Cards, Contribution Flow with WaterWheel impact estimate, WaterWheel Dashboard, Vacation Network, and Helm My Progress card (K81 gap fix). Migration 20260323000020. 17 production systems live.

## CONTEXT: WHAT EXISTS

| Component | Route/Location | Status | Session |
|-----------|---------------|--------|---------|
| Political Expedition | /political-expedition | LIVE (static seed data) | K86 |
| rep_cache table | Supabase | LIVE — has bioguide_id column | K86 |
| member_reps table | Supabase | LIVE — user saves reps | K86 |
| tracked_bills table | Supabase | LIVE — 7 seeded bills, static | K86 |
| member_bill_tracking | Supabase | LIVE — user tracks bills | K86 |
| rep_letter_templates | Supabase | LIVE — 5 templates | K86 |
| rep-lookup edge function | Supabase | LIVE — Google Civic API | K86 |
| CONGRESS_API_KEY | Supabase secrets | SET ✅ | Founder action |
| GOOGLE_API_KEY | Supabase secrets | SET ✅ | Founder action |

## TASK 1: Migration — Schema Additions
**File**: `supabase/migrations/20260323000021_congress_api.sql`

```sql
-- Add Congress API fields to tracked_bills
ALTER TABLE tracked_bills ADD COLUMN IF NOT EXISTS congress INTEGER;
ALTER TABLE tracked_bills ADD COLUMN IF NOT EXISTS bill_type TEXT;
ALTER TABLE tracked_bills ADD COLUMN IF NOT EXISTS congress_url TEXT;
ALTER TABLE tracked_bills ADD COLUMN IF NOT EXISTS sponsor_bioguide TEXT;
ALTER TABLE tracked_bills ADD COLUMN IF NOT EXISTS policy_area TEXT;
ALTER TABLE tracked_bills ADD COLUMN IF NOT EXISTS cosponsors_count INTEGER DEFAULT 0;
ALTER TABLE tracked_bills ADD COLUMN IF NOT EXISTS actions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE tracked_bills ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;
ALTER TABLE tracked_bills ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT false;

-- Bill cosponsors junction table
CREATE TABLE IF NOT EXISTS bill_cosponsors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID REFERENCES tracked_bills(id) ON DELETE CASCADE NOT NULL,
  bioguide_id TEXT NOT NULL,
  cosponsor_date DATE,
  is_original BOOLEAN DEFAULT false,
  UNIQUE(bill_id, bioguide_id)
);

ALTER TABLE bill_cosponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view cosponsors" ON bill_cosponsors FOR SELECT USING (true);
CREATE POLICY "Admin manages cosponsors" ON bill_cosponsors FOR ALL USING (public.is_admin());

-- Add terms and leadership to rep_cache
ALTER TABLE rep_cache ADD COLUMN IF NOT EXISTS terms JSONB DEFAULT '[]'::jsonb;
ALTER TABLE rep_cache ADD COLUMN IF NOT EXISTS leadership JSONB DEFAULT '[]'::jsonb;

-- Update existing seeded bills to mark as NOT live (manual)
UPDATE tracked_bills SET is_live = false WHERE is_live IS NULL;
```

## TASK 2: Edge Function — congress-api-sync
**File**: `supabase/functions/congress-api-sync/index.ts`

Single edge function with four sync modes, called via `?mode=bills|members|actions|search`:

### Mode: `bills` — Sync Tracked Bills
```
For each tracked_bill WHERE is_live = true:
  GET https://api.congress.gov/v3/bill/{congress}/{bill_type}/{bill_number}?api_key=KEY
  Update: title, summary (from /summaries sub-endpoint), status, sponsor_name, sponsor_party, sponsor_bioguide, introduced_date, last_action_date, last_action, policy_area, cosponsors_count, congress_url, last_synced_at

  GET .../cosponsors
  Upsert bill_cosponsors rows
```

### Mode: `members` — Sync Member Bills
```
For each DISTINCT bioguide_id in rep_cache that has a member_reps reference:
  GET https://api.congress.gov/v3/member/{bioguideId}/sponsored-legislation?api_key=KEY&limit=20
  GET https://api.congress.gov/v3/member/{bioguideId}/cosponsored-legislation?api_key=KEY&limit=20

  For each bill returned:
    Check if it exists in tracked_bills
    If not, INSERT with is_live = true, auto-populate all fields
    Upsert bill_cosponsors
```

### Mode: `actions` — Deep Action Pull
```
For each tracked_bill WHERE is_live = true:
  GET https://api.congress.gov/v3/bill/{congress}/{bill_type}/{bill_number}/actions?api_key=KEY
  Update actions JSONB column with full timeline
```

### Mode: `search` — On-Demand Bill Search
```
Accept query parameter: ?mode=search&q=cooperative
GET https://api.congress.gov/v3/bill?query={q}&api_key=KEY&limit=20
Return results as JSON (don't persist — let the UI handle "Track This Bill" action)
```

**Error handling:**
- 429 (rate limit) → return { error: "Rate limited", retry_after: header value }
- 404 → skip bill, log warning
- Network error → return partial results + error array

**Auth:** Require LB_SYSTEM_KEY header for sync modes. Search mode requires authenticated user.

## TASK 3: pg_cron Jobs
**File**: Add to existing cron setup or create `supabase/migrations/20260323000022_congress_cron.sql`

```sql
-- Bill status refresh every 6 hours
SELECT cron.schedule(
  'congress-bill-sync',
  '0 */6 * * *',
  $$SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/congress-api-sync?mode=bills',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'), 'x-lb-system-key', current_setting('app.settings.lb_system_key')),
    body := '{}'::jsonb
  )$$
);

-- Member bills sync daily at 3 AM
SELECT cron.schedule(
  'congress-member-sync',
  '0 3 * * *',
  $$SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/congress-api-sync?mode=members',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'), 'x-lb-system-key', current_setting('app.settings.lb_system_key')),
    body := '{}'::jsonb
  )$$
);

-- Deep action pull daily at 2 AM
SELECT cron.schedule(
  'congress-action-sync',
  '0 2 * * *',
  $$SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/congress-api-sync?mode=actions',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'), 'x-lb-system-key', current_setting('app.settings.lb_system_key')),
    body := '{}'::jsonb
  )$$
);
```

## TASK 4: UI — "My Reps' Bills" Tab
**File**: Modify `src/pages/PoliticalExpedition.tsx`

Add a new section/tab: **"Your Reps' Bills"**

This section:
1. Fetches the user's saved reps from `member_reps` → `rep_cache.bioguide_id`
2. Joins through `bill_cosponsors` to find `tracked_bills` where the user's reps are sponsors or cosponsors
3. Displays these bills with:
   - Bill number + title
   - Rep's role: "Sponsored by" or "Cosponsored by" [rep name]
   - Status badge (same as existing)
   - Last action date + description
   - "Track" button (adds to member_bill_tracking)
4. Empty state: "Save some representatives first to see their bills here"

## TASK 5: UI — Bill Detail Drawer
**File**: `src/components/political/BillDetailDrawer.tsx`

Click any bill → slide-out drawer showing:
- Full title
- Bill number + congress + type
- Sponsor info (photo from rep_cache, name, party, state)
- Cosponsors count + expandable list
- Policy area badge
- CRS Summary (from API)
- **Action Timeline**: vertical timeline of all actions from `actions JSONB`, newest first
  - Each action: date, description, chamber badge (House/Senate)
- Congress.gov link (external)
- "Track This Bill" / "Untrack" toggle
- "Write Your Rep About This Bill" → scrolls to letter section with bill pre-selected

## TASK 6: UI — Live Bill Search
**File**: `src/components/political/BillSearch.tsx`

Search input at the top of the "Bills That Matter" section:
- Debounced input (300ms)
- Calls congress-api-sync edge function with `?mode=search&q=...`
- Results appear below the search input as cards
- Each result has: bill number, title, sponsor, status, "Track This Bill" button
- Tracking a searched bill: INSERT into tracked_bills with is_live = true, then INSERT into member_bill_tracking
- "Searching Congress.gov..." loading state
- Error state: "Search unavailable — showing cached bills"

## TASK 7: UI — Sync Status + Admin Controls
Add to the Political Expedition page (visible to admins only):
- "Last synced: [timestamp]" badge
- "Sync Now" button → calls congress-api-sync with mode=bills
- "Sync Member Bills" button → calls with mode=members
- Bill count: "X live bills tracked, Y manually added"
- Sync log (last 5 sync results)

## TASK 8: Bill Number Format Normalization
The existing seeded bills use format "HR-2024" but Congress.gov uses "hr2024" (lowercase, no dash).

Create a utility function `normalizeBillNumber(billNumber: string)` that:
- Strips dashes and spaces
- Lowercases the type prefix
- Extracts congress number, bill type, and bill number for API calls
- Example: "HR-2024" → { congress: 119, billType: "hr", billNumber: 2024 }
- Example: "S-2025" → { congress: 119, billType: "s", billNumber: 2025 }

Use this everywhere bill numbers are displayed or sent to the API.

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `supabase/migrations/20260323000021_congress_api.sql` | Schema additions + bill_cosponsors table |
| `supabase/migrations/20260323000022_congress_cron.sql` | pg_cron jobs for sync |
| `supabase/functions/congress-api-sync/index.ts` | Edge function (4 modes) |
| `src/components/political/BillDetailDrawer.tsx` | Bill detail slide-out |
| `src/components/political/BillSearch.tsx` | Live bill search |

## FILES TO MODIFY

| File | Change |
|------|--------|
| `src/pages/PoliticalExpedition.tsx` | Add "Your Reps' Bills" section, wire BillDetailDrawer, add BillSearch, add admin sync controls |

## DO NOT TOUCH
- Housing files (K89)
- Ghost World files (K88)
- Arena/Emporium/Crew Tables (K87)
- Vehicle files (K85)
- Star Chamber (K79)
- Commerce engine (K80)

## BUILD ORDER
```
Task 1 (migration — schema additions)
  → Task 8 (bill number normalizer — utility)
    → Task 2 (edge function — all 4 modes)
      → Task 3 (pg_cron jobs)
      → Task 5 (bill detail drawer) [parallel with Task 3]
        → Task 4 (my reps' bills tab)
        → Task 6 (live search)
          → Task 7 (admin controls)
```

## DEPLOY CHECKLIST
1. Verify CONGRESS_API_KEY is set in Supabase secrets ✅ (already done)
2. Push migrations: `npx supabase db push --linked`
3. Deploy edge function: `npx supabase functions deploy congress-api-sync`
4. Verify pg_cron jobs are scheduled
5. `npm run build` — zero errors
6. `firebase deploy --only hosting:main`
7. Test: manually trigger sync, verify bills populate
8. Test: save a rep → check "Your Reps' Bills" shows their legislation
9. Test: search for "cooperative" → verify results appear
10. Test: click a bill → verify detail drawer with action timeline

## SUCCESS CRITERIA
- [ ] bill_cosponsors table created with RLS
- [ ] Schema additions on tracked_bills and rep_cache
- [ ] Edge function handles all 4 modes (bills, members, actions, search)
- [ ] pg_cron jobs running on schedule
- [ ] "Your Reps' Bills" section shows real congressional data
- [ ] Bill detail drawer shows full action timeline
- [ ] Live search returns results from Congress.gov
- [ ] Admin sync controls work
- [ ] Bill number normalization handles all formats
- [ ] Existing seeded bills still display (marked as manual)
- [ ] Zero console errors

Democracy was a muscle. Now it has a data feed.

**FOR THE KEEP.**
