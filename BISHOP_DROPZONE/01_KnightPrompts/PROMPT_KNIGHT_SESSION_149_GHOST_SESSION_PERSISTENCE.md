# KNIGHT SESSION K149: Ghost Session Persistence + Conversion

**Priority**: HIGH — Core onboarding funnel  
**Estimated Scope**: 2–3 Knight sessions  
**Dependencies**: Ghost World system (live), Stripe membership ($5/yr), members table, Helm  
**Bishop Session**: 036

---

## OVERVIEW

Ghost World lets unauthenticated visitors browse, interact, and accumulate value before committing to membership. This session implements the **persistence layer** that makes Ghost browsing sticky and the **conversion trigger** that writes accumulated Ghost assets into the real member record on $5 membership purchase.

The goal: a visitor lands via a Cue Card QR, explores for 10 minutes, earns Shadow Marks and bookmarks 3 items — then leaves. When they return 3 days later, everything is still there. When they finally pay $5, all of it transfers to their real account with referrer attribution intact.

---

## SCOPE

### 1. Ghost Session Identity (localStorage)

- On first unauthenticated page load, generate a `ghost_id` (UUID v4) and store in `localStorage`
- Store creation timestamp alongside it: `ghost_created_at`
- If `ghost_id` already exists in localStorage, reuse it (returning visitor)
- Ghost ID format: `ghost_{uuid}` to distinguish from real member IDs in logs
- **Half-life**: Ghost sessions decay. After 30 days of inactivity, assets begin depreciation (Shadow Marks halve every 7 days after the 30-day mark). This creates urgency without hard deletion.

### 2. Ghost Asset Accumulation

Track these in localStorage (and optionally in a `ghost_sessions` Supabase table for analytics):

| Asset Type | Storage Key | Example |
|-----------|------------|---------|
| Shadow Marks earned | `ghost_shadow_marks` | `{ total: 15, history: [{source: 'beacon-run', amount: 5, ts: ...}] }` |
| Bookmarked items | `ghost_bookmarks` | `[{ type: 'product', id: 'abc', ts: ... }]` |
| Beacon Runs started | `ghost_beacon_runs` | `[{ runId: 'xyz', checkpoints: 3, ts: ... }]` |
| Treasure Map progress | `ghost_treasure_maps` | `[{ mapId: 'xyz', progress: 0.6, ts: ... }]` |
| Cue Cards collected | `ghost_cue_cards` | `['golden-key', 'five-dollars']` |
| Referrer attribution | `ghost_referrer` | `{ member_id: 'abc', cue_card: 'dinner', ts: ... }` |
| Pages visited | `ghost_breadcrumbs` | Last 50 page paths with timestamps |
| Time on platform | `ghost_time_total` | Cumulative seconds (updated on page unload) |

### 3. Ghost-to-Member Conversion Flow

**Trigger**: User clicks "Join for $5/year" (existing Stripe checkout)

**Pre-checkout**:
1. Check localStorage for `ghost_id`
2. If found, bundle ghost assets into a `ghost_conversion_payload` object
3. Pass `ghost_id` as metadata in the Stripe checkout session

**Post-checkout (webhook handler)**:
1. Stripe webhook confirms payment → create member record (existing flow)
2. Read `ghost_id` from Stripe session metadata
3. Write conversion record to `ghost_conversions` table:
   ```
   ghost_conversions {
     id: uuid PK,
     ghost_id: text,
     member_id: uuid FK → members,
     conversion_payload: jsonb,  -- full ghost asset snapshot
     referrer_member_id: uuid FK → members (nullable),
     referrer_cue_card: text (nullable),
     ghost_duration_days: integer,
     ghost_shadow_marks: integer,
     converted_at: timestamptz
   }
   ```
4. Convert Shadow Marks → real Marks (apply half-life depreciation at conversion time)
5. Transfer bookmarks to member's saved items
6. Credit referrer with sponsorship Mark (ONE LEVEL ONLY — not MLM)
7. Clear ghost localStorage keys (keep ghost_id for dedup)

### 4. Referrer Credit Attribution

- When a visitor arrives via a Cue Card link (e.g., `/c/dinner?ref=member123`), store the `ref` param as `ghost_referrer.member_id` and the card type as `ghost_referrer.cue_card`
- On conversion, credit the referrer with:
  - 1 Sponsorship Mark (one level only, NEVER second-degree)
  - Conversion notification in their Helm
  - Badge progress toward Ambassador/Captain milestones
- If no referrer stored, no credit issued (organic conversion)
- Referrer must be an active member at conversion time

### 5. Analytics Dashboard (Helm integration)

Add to the Creator Dashboard / Captain's War Room:
- Ghost sessions originated from my Cue Cards (count + conversion rate)
- Average ghost duration before conversion
- Top-performing Cue Card types by conversion
- Shadow Marks accumulated (total across all my ghosts)

---

## DATABASE MIGRATIONS

### Migration 1: `ghost_sessions` table
```sql
CREATE TABLE ghost_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ghost_id TEXT UNIQUE NOT NULL,
  referrer_member_id UUID REFERENCES members(id),
  referrer_cue_card TEXT,
  shadow_marks INTEGER DEFAULT 0,
  bookmarks JSONB DEFAULT '[]',
  breadcrumbs JSONB DEFAULT '[]',
  total_time_seconds INTEGER DEFAULT 0,
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  converted_at TIMESTAMPTZ,
  converted_member_id UUID REFERENCES members(id)
);

CREATE INDEX idx_ghost_sessions_referrer ON ghost_sessions(referrer_member_id);
CREATE INDEX idx_ghost_sessions_ghost_id ON ghost_sessions(ghost_id);
```

### Migration 2: `ghost_conversions` table
```sql
CREATE TABLE ghost_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ghost_id TEXT NOT NULL,
  member_id UUID NOT NULL REFERENCES members(id),
  conversion_payload JSONB NOT NULL,
  referrer_member_id UUID REFERENCES members(id),
  referrer_cue_card TEXT,
  ghost_duration_days INTEGER,
  ghost_shadow_marks INTEGER,
  converted_marks INTEGER,  -- after half-life depreciation
  converted_at TIMESTAMPTZ DEFAULT now()
);
```

### Migration 3: RLS policies
- `ghost_sessions`: Service role only (no direct member access)
- `ghost_conversions`: Members can read their own (where member_id = auth.uid() OR referrer_member_id = auth.uid())

---

## COMPONENT WORK

### New Components
- `GhostSessionProvider.tsx` — Context provider that manages ghost_id lifecycle, wraps the app
- `GhostAssetTracker.tsx` — Hook that syncs localStorage ↔ ghost_sessions table periodically
- `GhostConversionBanner.tsx` — Shows "You have 15 Shadow Marks! Join for $5 to keep them" prompt
- `GhostDepreciationWarning.tsx` — Shows countdown when assets approach half-life threshold

### Modified Components
- Stripe checkout flow — add ghost_id to session metadata
- Stripe webhook handler — add ghost conversion logic
- Helm Dashboard — add ghost analytics panel
- Shadow Marks display — show depreciation status for ghosts

---

## RULES (HARD BOUNDARIES)

1. **Credits NEVER cash out to fiat.** One-way valve. Irrevocable.
2. **Sponsorship Marks are ONE LEVEL ONLY.** Referrer gets credit. Referrer's referrer gets NOTHING. Not MLM. Never second-degree.
3. **Ghost data is ephemeral.** If localStorage is cleared, ghost assets are gone (unless synced to ghost_sessions table). This is acceptable — it creates natural urgency.
4. **Half-life is configurable** but default is 30 days idle + 7-day halving. Founder can adjust via admin panel.
5. **No PII stored in ghost session.** Ghost sessions are anonymous until conversion.

---

## TESTING CHECKLIST

- [ ] New visitor gets ghost_id in localStorage
- [ ] Returning visitor reuses existing ghost_id
- [ ] Shadow Marks accumulate correctly across visits
- [ ] Referrer attribution captured from QR/Cue Card link
- [ ] $5 checkout includes ghost_id in Stripe metadata
- [ ] Webhook converts ghost assets to real member assets
- [ ] Referrer receives exactly 1 Sponsorship Mark (not more)
- [ ] Half-life depreciation math is correct at conversion time
- [ ] Ghost analytics show in Creator Dashboard
- [ ] localStorage cleanup after conversion
- [ ] Ghost session older than 30 days shows depreciation warning

---

## KNIGHT NOTES

- This is 2–3 sessions of work. Suggested split:
  - **K149**: Ghost identity + localStorage + GhostSessionProvider + ghost_sessions migration
  - **K150**: Conversion flow (Stripe integration + ghost_conversions + referrer credit)
  - **K151**: Analytics dashboard + depreciation warnings + polish
- The ghost_sessions Supabase table is OPTIONAL for K149 — localStorage-only is a valid first pass. Table adds analytics and cross-device persistence.
- Coordinate with existing Shadow Marks system (migration `20260216000001_shadow_marks_cue_cards.sql`) for consistent Mark math.
