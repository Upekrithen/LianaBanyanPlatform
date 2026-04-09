# KNIGHT SESSION 243 — Cue Card Interest Signal + Linchpin Bridge Implementation
## Dispatched by: Bishop B072
## Date: April 3, 2026
## Priority: HIGH — Social discovery + growth attribution chain

---

## MISSION

Implement Cue Card Interest Signal (#2136) and Reading Beacon Influencer Bridge (#2137) — the social sharing and attribution layers that turn reading into recruitment.

---

## CONTEXT (READ FIRST)

### Cue Card Interest Signal (#2136)
Members share Reading Beacons on their Cue Card as a statement of interest. Others see what you're reading + your progress. "Read Along" creates their own beacon at the same position. Creates reading cohorts.

### Reading Beacon Influencer Bridge (#2137)
When a shared Reading Beacon leads to a new member signup, it's attributed as a Linchpin connection. Content is the referral. Reading is the recruitment. Members progress through Linchpin → Matchstick → Torch → Beacon tiers.

### Related A&A Formals
- `BISHOP_DROPZONE/AA_FORMAL_2136_CUE_CARD_INTEREST_SIGNAL_B071.md`
- `BISHOP_DROPZONE/AA_FORMAL_2137_READING_BEACON_INFLUENCER_BRIDGE_B071.md`

### Dependencies
- K242 (Reading Beacon + Beacon Wallet) must be deployed first
- Existing tables: `cue_cards`, `linchpin_connections`, `beacons`, `reading_progress`

---

## IMPLEMENTATION

### 1. Migration: Interest Signal Column

File: `platform/supabase/migrations/20260404000003_cue_card_interest_signals.sql`

```sql
-- Add interest signal support to cue_cards
ALTER TABLE public.cue_cards ADD COLUMN IF NOT EXISTS shared_beacons UUID[] DEFAULT '{}';
ALTER TABLE public.cue_cards ADD COLUMN IF NOT EXISTS interest_visibility TEXT DEFAULT 'public'
  CHECK (interest_visibility IN ('public', 'crew', 'private'));

-- Reading cohorts: groups of members reading the same paper
CREATE TABLE IF NOT EXISTS public.reading_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_key TEXT NOT NULL,
  member_id UUID NOT NULL REFERENCES auth.users(id),
  joined_via_member_id UUID REFERENCES auth.users(id), -- who they "Read Along" from
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(paper_key, member_id)
);

-- RLS: public read, authenticated insert own
ALTER TABLE public.reading_cohorts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read cohorts" ON public.reading_cohorts FOR SELECT USING (true);
CREATE POLICY "Members join cohorts" ON public.reading_cohorts FOR INSERT WITH CHECK (auth.uid() = member_id);

-- Index for cohort queries
CREATE INDEX IF NOT EXISTS idx_reading_cohorts_paper ON public.reading_cohorts (paper_key);
```

### 2. Migration: Linchpin Reading Attribution

File: `platform/supabase/migrations/20260404000004_linchpin_reading_attribution.sql`

```sql
-- Extend linchpin_connections for reading-sourced attribution
ALTER TABLE public.linchpin_connections ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'direct'
  CHECK (source_type IN ('direct', 'cue_card', 'reading_beacon', 'deck_card'));
ALTER TABLE public.linchpin_connections ADD COLUMN IF NOT EXISTS source_beacon_id UUID REFERENCES public.beacons(id);
ALTER TABLE public.linchpin_connections ADD COLUMN IF NOT EXISTS source_paper_key TEXT;
```

### 3. Edge Function: Share Interest Signal

File: `platform/supabase/functions/share-interest-signal/index.ts`

Accepts:
```json
{
  "beacon_id": "uuid-of-reading-beacon"
}
```

Logic:
1. Verify beacon belongs to authenticated member
2. Add beacon_id to member's cue_card.shared_beacons array
3. Return updated Cue Card with beacon data for rendering

### 4. Edge Function: Read Along

File: `platform/supabase/functions/read-along/index.ts`

Accepts:
```json
{
  "source_member_id": "uuid-of-member-sharing",
  "paper_key": "starscreaming"
}
```

Logic:
1. Get authenticated member_id
2. Look up source member's beacon for this paper_key
3. Create new beacon for requesting member at same position
4. Add both to reading_cohorts table
5. Return new beacon + cohort size

### 5. Edge Function: Attribute Reading Signup

File: `platform/supabase/functions/attribute-reading-signup/index.ts`

Accepts (called during signup flow when referral source is a reading beacon):
```json
{
  "new_member_id": "uuid",
  "source_beacon_ref_code": "Read001MnL002"
}
```

Logic:
1. Look up beacon by ref_code → get source member_id and paper_key
2. Create linchpin_connection with source_type = 'reading_beacon'
3. Update source member's Linchpin tier counts
4. Return attribution record

### 6. Interest Signal UI Components

File: `platform/src/components/CueCardInterestSignal.tsx`

On a Cue Card, renders shared Reading Beacons as:
- Paper title + reading depth indicator (1-4 dots)
- Progress percentage from reading_progress
- "Read Along" button for viewers
- Cohort count ("12 people reading this")

File: `platform/src/components/ReadAlongButton.tsx`

Button component that:
- Calls read-along edge function
- Creates local beacon
- Shows confirmation: "You're now reading [Paper Title] — check your Beacon Wallet"

---

## VALIDATION CHECKLIST

- [ ] Migrations apply cleanly
- [ ] Interest signal renders on Cue Card
- [ ] "Read Along" creates beacon + cohort entry
- [ ] Attribution records created on reading-sourced signup
- [ ] Linchpin tier counts update correctly
- [ ] `npm run build` succeeds
- [ ] Session logged via Librarian (K243)
