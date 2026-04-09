# KNIGHT SESSION 288 — Battery Dispatch Access Gating (Influencer + Project Paths)
## Bishop B076 | April 4, 2026
## Source: Founder direction, live

---

## Mission

Implement access gating for Battery Dispatch. Access is **not universal** to $5 members — it's **included (not extra)** for members who have declared commitment through one of multiple paths. Battery Dispatch becomes a "cooperative infrastructure for people doing the work" benefit, preserving perceived value without introducing paywalls.

## Why This Matters

Battery Dispatch is sophisticated infrastructure (multi-platform scheduling, burst pacing, role-based staggering, Cue Card dispatch, news slots). Giving it to every $5 member commoditizes it; gating it behind commitment preserves value while staying consistent with the $5/year forever bylaw.

**Access design principles:**
- Not a paywall — included with commitment, not sold separately
- Not a one-time signup — requires active status (keep using to keep access)
- Self-selecting — grant paths map to real use cases
- Stackable — multiple paths grant access; users don't need to re-qualify

## Grant Paths

Any of the following grants active Battery Dispatch access:

1. **Influencer designation** — member declares themselves an Influencer via signup flow
2. **Project creation** — member starts a Bridge (project control panel)
3. **Harper Guild status** (Cub Harper or higher) — auto-granted
4. **Jukebox artist** — auto-granted (artists licensing music via Jukebox)
5. **Crown holder** — auto-granted (initiative Crown seats)
6. **Captain role** — auto-granted (cooperative hub leaders)

## Active Status Requirements

Access is maintained by **active status** in a 90-day rolling window:

- **Influencer**: at least 1 piece of content published in last 90 days
- **Project-holder**: at least 1 Cue Card scheduled OR 1 transaction on the Bridge in last 90 days
- **Harper**: Cub Harper (or higher) status maintained with current bounty completions
- **Jukebox artist**: active licenses or new tracks in last 90 days
- **Crown/Captain**: role is active (not resigned/revoked)

If all grant paths for a user go inactive, Battery Dispatch access **auto-suspends** (NOT removed — access is restored the moment any path becomes active again). Access history is preserved.

## Entry Friction (Low but Non-Zero)

**Influencer signup** requires:
- Accept Creator Agreement (disclosure rules, publishing commitments)
- Publish first piece within 30 days of signup

**Project creation** requires:
- Accept Project Operating Agreement
- Schedule first Cue Card OR list first product within 30 days

Both paths are **free** — just require commitment + first action.

---

## Implementation

### Part 1 — Schema

```sql
-- Track all access grants (multiple paths possible per user)
CREATE TABLE IF NOT EXISTS public.battery_dispatch_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_source TEXT NOT NULL CHECK (access_source IN (
    'influencer','project','harper','jukebox_artist','crown','captain','staff_override'
  )),
  source_ref_id TEXT,  -- e.g. project_id, initiative_id, harper profile id
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','revoked')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, access_source, source_ref_id)
);

CREATE INDEX idx_bda_user ON public.battery_dispatch_access(user_id);
CREATE INDEX idx_bda_status ON public.battery_dispatch_access(status);
CREATE INDEX idx_bda_last_active ON public.battery_dispatch_access(last_active_at DESC);

ALTER TABLE public.battery_dispatch_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their own access" ON public.battery_dispatch_access
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Staff read all access" ON public.battery_dispatch_access
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.staff_members WHERE user_id = auth.uid())
  );
```

### Part 2 — Access-check helper view

```sql
CREATE OR REPLACE VIEW public.battery_dispatch_access_status AS
SELECT
  user_id,
  BOOL_OR(status = 'active') AS has_access,
  array_agg(DISTINCT access_source) FILTER (WHERE status = 'active') AS active_sources,
  MAX(last_active_at) AS most_recent_activity,
  COUNT(*) FILTER (WHERE status = 'active') AS active_grant_count
FROM public.battery_dispatch_access
GROUP BY user_id;
```

### Part 3 — Active-status refresh function (run daily via cron)

```sql
CREATE OR REPLACE FUNCTION public.refresh_battery_dispatch_access_status()
RETURNS void AS $$
DECLARE
  v_90_days_ago TIMESTAMPTZ := now() - interval '90 days';
BEGIN
  -- Suspend grants where last_active_at < 90 days AND no activity signals refresh
  UPDATE public.battery_dispatch_access
  SET status = 'suspended', updated_at = now()
  WHERE status = 'active'
    AND last_active_at < v_90_days_ago;

  -- Reactivate if activity signals would bring them back
  -- (This is path-specific; add logic per grant_source)
  -- Example: reactivate influencers who published in last 90 days
  UPDATE public.battery_dispatch_access bda
  SET status = 'active', last_active_at = now(), updated_at = now()
  WHERE bda.status = 'suspended'
    AND bda.access_source = 'influencer'
    AND EXISTS (
      SELECT 1 FROM public.member_publications mp
      WHERE mp.user_id = bda.user_id
        AND mp.published_at > v_90_days_ago
    );

  -- Similar reactivation logic for other paths
  -- (project: new cue card or bridge transaction)
  -- (harper: active bounty completion)
  -- (jukebox_artist: new license/track)
  -- (crown/captain: role still active)
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule daily refresh at 02:00 UTC
SELECT cron.schedule(
  'refresh-battery-dispatch-access',
  '0 2 * * *',
  $cron$ SELECT public.refresh_battery_dispatch_access_status(); $cron$
);
```

### Part 4 — Grant triggers (auto-grant on qualifying actions)

Add triggers that auto-insert into `battery_dispatch_access` when:

- A user is promoted to Cub Harper or higher in `harper_guild_members`
- A user creates a project/Bridge in `projects` (or equivalent)
- A user is assigned a Crown in `initiative_crowns`
- A user is appointed Captain in `captains` table (if exists)
- A user becomes a Jukebox artist with licensed tracks

Pattern (illustrative):
```sql
CREATE OR REPLACE FUNCTION public.grant_battery_dispatch_on_harper_promotion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.harper_status IN ('cub_harper','stamped_harper','harper','master_harper') THEN
    INSERT INTO public.battery_dispatch_access (user_id, access_source, source_ref_id, status)
    VALUES (NEW.user_id, 'harper', NEW.id::text, 'active')
    ON CONFLICT (user_id, access_source, source_ref_id) DO UPDATE
      SET status = 'active', last_active_at = now(), updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Part 5 — Gate Battery Dispatch UI + edge functions

Modify the Battery Dispatch interface and edge functions to:

1. **Check access on page load** — query `battery_dispatch_access_status` for `auth.uid()`
2. **If `has_access = false`**: show upgrade path UI
   - "To use Battery Dispatch, sign up as an Influencer OR start a Project"
   - Link to Influencer signup flow
   - Link to Bridge creation flow
   - Note any OTHER paths available (if they're close to Harper status, etc.)
3. **If `has_access = true`**: full Battery Dispatch UI as normal

### Part 6 — Admin UI (staff dashboard)

Add a staff page for auditing access:
- Table of all active grants, filterable by source
- Users with suspended access (and how to reactivate)
- Override grant/revoke controls (source='staff_override')

Path: `platform/src/pages/staff/BatteryDispatchAccessAudit.tsx`

### Part 7 — Influencer signup flow

Minimal signup flow that:
1. Presents the Creator Agreement
2. On acceptance: grants `access_source='influencer'` with 30-day grace period before requiring first publication
3. Nudges user to publish first piece

### Part 8 — Verification

After deploy:
1. Create test user — verify no access
2. Grant test user Harper status — verify access auto-granted
3. Set test user's `last_active_at` to 91 days ago — run refresh function — verify access suspends
4. Simulate new bounty completion — verify access reactivates
5. Staff override path: grant/revoke manually — verify

---

## Deliverables

1. **Migration**: `platform/supabase/migrations/20260404000033_battery_dispatch_access_gating.sql`
2. **Frontend gate**: Battery Dispatch page guard + upgrade UI
3. **Admin UI**: access audit dashboard
4. **Influencer signup flow** (minimal, can be v2-expanded)
5. **Cron job** for daily access refresh
6. **Verification report**

---

## Context References

- **Founder direction**: "Gate to Influencers + Project starters; valued asset, but included not extra"
- **Bishop B076 analysis**: three refinements applied (active status, low-friction non-zero entry, auto-grant for Harpers/Jukebox artists/Crown/Captain)
- **Harper Guild bounty criteria**: `BISHOP_DROPZONE/HARPER_GUILD_BOUNTY_CRITERIA_DRAFT_B076.md`
- **K285/K286**: Battery Dispatch burst pacing + role-based staggering (access gating layers on top of those)

*Knight: execute end-to-end. FOR THE KEEP.*
