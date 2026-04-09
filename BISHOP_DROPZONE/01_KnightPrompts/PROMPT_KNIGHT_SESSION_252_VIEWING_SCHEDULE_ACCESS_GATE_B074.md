# KNIGHT SESSION 252 — Viewing Schedule Access Gate + Public Rollout
## Dispatched by: Bishop B074
## Date: April 4, 2026
## Priority: MEDIUM — Needed by Day 6 (Apr 10) when Viewing Schedule goes semi-public

---

## MISSION

Implement graduated access control for the Viewing Schedule page so it can transition from private → semi-public → fully public across the 10-day Opening Gambit launch:
1. Feature flag controlling Viewing Schedule visibility level
2. Shareable link system for "semi-public" mode (invite-only access via token URL)
3. Full public mode toggle for Day 10
4. Access analytics to track who's viewing the schedule

---

## CONTEXT

### What Exists
- `ViewingSchedulePage.tsx` (K245 DEPLOYED): Full page with grid, "Now Playing" carousel, spice filters, series guide
- `crewman_episodes` with `scheduled_for` timestamps (after K251)
- Feature flags table: `platform_feature_flags` (used across platform)
- Opening Gambit timeline: semi-public Day 6 (Apr 10), fully public Day 10 (Apr 14)

### Why This Matters
The Viewing Schedule is the public-facing proof that LB has real, scheduled content. Media contacts receiving Opening Gambit Phase 3 letters (Day 5) will get the Viewing Schedule URL in the letter footer. They need to see a professional, live TV Guide with real upcoming content — but we don't want random traffic before the content wave is established.

---

## IMPLEMENTATION

### 1. Migration: Access Control for Viewing Schedule

File: `platform/supabase/migrations/YYYYMMDDHHMMSS_viewing_schedule_access.sql`

```sql
-- Viewing Schedule access tokens for semi-public sharing
CREATE TABLE IF NOT EXISTS public.viewing_schedule_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  label TEXT,                    -- "Crown letter recipient", "Phase 3 media", etc.
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  use_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Track views for analytics
CREATE TABLE IF NOT EXISTS public.viewing_schedule_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID REFERENCES public.viewing_schedule_tokens(id),
  viewer_ip_hash TEXT,          -- hashed, not raw IP
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Feature flag for access level
INSERT INTO public.platform_feature_flags (flag_key, flag_value, description)
VALUES ('viewing_schedule_access', 'private', 'Access level: private | semi_public | public')
ON CONFLICT (flag_key) DO NOTHING;

-- RLS: public read when flag = 'public', token-gated when 'semi_public'
ALTER TABLE public.viewing_schedule_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage tokens" ON public.viewing_schedule_tokens
  FOR ALL USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'staff'));
```

### 2. Edge Function: Validate Viewing Schedule Access

File: `platform/supabase/functions/validate-viewing-access/index.ts`

```typescript
// Accepts: { token?: string }
// Returns: { allowed: boolean, access_level: string }
//
// Logic:
// 1. Check platform_feature_flags for 'viewing_schedule_access'
// 2. If 'public' → always allowed
// 3. If 'semi_public' → check token validity (active, not expired, under max_uses)
// 4. If 'private' → only authenticated staff
// 5. Log view in viewing_schedule_views
```

### 3. Edge Function: Generate Shareable Link

File: `platform/supabase/functions/create-viewing-token/index.ts`

```typescript
// Accepts: { label: string, expires_days?: number, max_uses?: number }
// Returns: { token: string, url: string }
// Staff-only endpoint
// URL format: https://lianabanyan.com/viewing-schedule?t=<token>
```

### 4. Update ViewingSchedulePage.tsx

Add access gate at the top of the page component:

```typescript
// On mount:
// 1. Check feature flag 'viewing_schedule_access'
// 2. If 'public' → render normally
// 3. If 'semi_public' → check URL param ?t=<token>, validate via edge function
//    - Valid token → render with "You're watching early! 🍿" banner
//    - No/invalid token → show "Coming Soon" splash with Bring Popcorn teaser
// 4. If 'private' → require staff auth
```

**"Coming Soon" splash** (shown to unauthorized visitors during semi-public):
```
+------------------------------------------+
|          🍿 BRING POPCORN                |
|                                           |
|    The show is almost live.               |
|    Full schedule opens [countdown].       |
|                                           |
|    [Join the waitlist]                    |
+------------------------------------------+
```

### 5. Staff Controls

Add to existing staff dashboard (Content Command Center or similar):

**Viewing Schedule Access Panel:**
- Current access level indicator (Private / Semi-Public / Public)
- Toggle buttons to change level (calls UPDATE on feature flag)
- Token generator: "Create shareable link" → label + expiry → generates URL
- Active tokens list with use counts
- View analytics: total views, views by token, timeline chart

### 6. Day 6 + Day 10 Execution

**Day 6 (Apr 10)**: Staff toggles flag to `semi_public`. Generates tokens:
- "Crown recipients" token (for letter follow-ups)
- "Phase 3 media" token (embedded in letter footer URLs)
- "Inner circle" token (for early members)

**Day 10 (Apr 14)**: Staff toggles flag to `public`. Anyone can view. Tokens still tracked for attribution.

---

## DELIVERABLES

1. Migration: `viewing_schedule_tokens` + `viewing_schedule_views` tables + feature flag
2. `validate-viewing-access` edge function
3. `create-viewing-token` edge function
4. Updated `ViewingSchedulePage.tsx` with access gate + "Coming Soon" splash
5. Staff panel for managing access level + tokens
6. Verification: page shows "Coming Soon" when flag = semi_public and no token provided

---

## IMPORTANT NOTES

- Hash IPs before storing — never store raw IP addresses (privacy compliance)
- Token URLs must be short and shareable: `/viewing-schedule?t=abc123def456`
- The "Coming Soon" splash should be attractive — it's the first thing media contacts might see
- Do NOT gate the schedule data itself behind RLS — gate the PAGE. The dispatch system needs unimpeded access to crewman_episodes.
- The show is about **Liana Banyan** — the splash copy should reflect the cooperative, not the Founder
- Keep token management simple — no complex permission tiers, just active/inactive + expiry
