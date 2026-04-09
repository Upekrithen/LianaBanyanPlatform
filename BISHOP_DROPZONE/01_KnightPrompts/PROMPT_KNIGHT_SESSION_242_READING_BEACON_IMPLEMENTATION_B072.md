# KNIGHT SESSION 242 — Reading Beacon + Beacon Wallet Implementation
## Dispatched by: Bishop B072
## Date: April 3, 2026
## Priority: HIGH — Core infrastructure for Skipping Stones + BST depth tracking

---

## MISSION

Implement Reading Beacon (#2134) and Beacon Wallet — the reading position tracking system that powers both BST episode engagement and Skipping Stones depth navigation.

---

## CONTEXT (READ FIRST)

Reading Beacons save a member's reading position within any Liana Banyan publication. Each beacon carries an auto-generated reference code and is stored in a **Beacon Wallet** in the member's Helm.

### Auto-Reference Code Format
`Read[BeaconNum][PaperRef][PageNum]`
- Example: `Read001MnL002` = Beacon #1, Mnemonic Load paper, position 2
- Example: `Read047AIC005` = Beacon #47, AI Cake paper, position 5

### Four-Layer Integration (Skipping Stones)
1. **Skipping Stone scan** → beacon created at section entry point
2. **Pudding completion** → beacon updated to Layer 3 depth
3. **Full paper completion** → beacon updated to Layer 4 depth
4. **Layer 4 completion** → triggers engagement proof for vote-gating

### Related A&A Formals
- `BISHOP_DROPZONE/AA_FORMAL_2134_READING_BEACON_B071.md`
- `BISHOP_DROPZONE/AA_FORMAL_2138_READING_PROGRESS_BEACON_INTEGRATION_B071.md`

---

## IMPLEMENTATION

### 1. Migration: Reading Beacon Extension

File: `platform/supabase/migrations/20260404000001_reading_beacons.sql`

Extend existing `beacons` table (DO NOT create a new table — Reading Beacons use existing beacon infrastructure):

```sql
-- Add reading-specific columns to existing beacons table
ALTER TABLE public.beacons ADD COLUMN IF NOT EXISTS reading_ref_code TEXT;
ALTER TABLE public.beacons ADD COLUMN IF NOT EXISTS reading_paper_key TEXT;
ALTER TABLE public.beacons ADD COLUMN IF NOT EXISTS reading_position INTEGER DEFAULT 0;
ALTER TABLE public.beacons ADD COLUMN IF NOT EXISTS reading_depth INTEGER DEFAULT 1 CHECK (reading_depth BETWEEN 1 AND 4);
ALTER TABLE public.beacons ADD COLUMN IF NOT EXISTS reading_completed_at TIMESTAMPTZ;

-- reading_depth: 1=Skipping Stone, 2=Proof CTA, 3=Pudding, 4=Full Paper
-- reading_ref_code: auto-generated "Read001MnL002" format
-- reading_paper_key: references content key in cephas system

-- Index for fast Beacon Wallet queries
CREATE INDEX IF NOT EXISTS idx_beacons_reading ON public.beacons (member_id, orange_subtype)
WHERE orange_subtype = 'reading';
```

### 2. Migration: Beacon Wallet View

File: `platform/supabase/migrations/20260404000002_beacon_wallet_view.sql`

```sql
-- Beacon Wallet = all reading beacons for a member, grouped by paper
CREATE OR REPLACE VIEW public.beacon_wallet AS
SELECT
  b.member_id,
  b.reading_paper_key,
  b.reading_ref_code,
  b.reading_position,
  b.reading_depth,
  b.reading_completed_at,
  b.created_at AS started_at,
  b.updated_at AS last_read_at,
  rp.percent_complete,
  rp.coverage_minutes,
  rp.golden_keys
FROM public.beacons b
LEFT JOIN public.reading_progress rp
  ON rp.member_id = b.member_id
  AND rp.content_key = b.reading_paper_key
WHERE b.orange_subtype = 'reading'
ORDER BY b.updated_at DESC;
```

### 3. Edge Function: Create/Update Reading Beacon

File: `platform/supabase/functions/upsert-reading-beacon/index.ts`

Accepts:
```json
{
  "paper_key": "starscreaming",
  "position": 5,
  "depth": 3
}
```

Logic:
1. Get authenticated member_id from JWT
2. Check if reading beacon exists for this member + paper_key
3. If exists: update position, depth, updated_at (only if new depth >= current depth)
4. If new: auto-generate ref_code (`Read[count+1][paperAbbrev][position]`), insert
5. If depth reaches 4 and all positions complete: set reading_completed_at
6. Return beacon with ref_code

### 4. Edge Function: Get Beacon Wallet

File: `platform/supabase/functions/get-beacon-wallet/index.ts`

Returns authenticated member's full Beacon Wallet:
- All reading beacons grouped by paper
- Current depth per paper
- reading_progress data (percent_complete, golden_keys)
- "Active reads" (depth < 4) vs "Completed reads" (depth = 4)

### 5. Beacon Wallet UI Page

File: `platform/src/pages/BeaconWalletPage.tsx`

Route: `/helm/beacons` (nested under Helm)

UI:
- **Active Reads** section: papers in progress, sorted by last_read_at
  - Paper title + progress bar (reading_depth / 4)
  - Ref code badge
  - "Continue Reading" button → deep-link to current position
- **Completed Reads** section: papers with depth = 4
  - Completion date
  - Golden keys earned
  - "Share on Cue Card" button (feeds into #2136 Interest Signal)
- **Stats bar**: Total beacons, papers started, papers completed, total coverage_minutes

Wire route in `platform/src/routes/helm.tsx` or appropriate Helm route file.

---

## INTEGRATION POINTS

| System | Integration |
|--------|------------|
| `reading_progress` table | LEFT JOIN for percent_complete, coverage_minutes, golden_keys |
| `beacons` table | Extend with reading columns (orange_subtype = 'reading') |
| Cephas content | paper_key references content slugs |
| Helm | Beacon Wallet lives in /helm/beacons |
| Crewman episodes | Episode deep-links create beacons at position |
| Skipping Stones | QR scan creates beacon at section entry point |

---

## VALIDATION CHECKLIST

- [ ] Migrations apply cleanly (`supabase db push`)
- [ ] Edge functions deploy (`supabase functions deploy`)
- [ ] Upsert creates new beacon with auto-ref-code
- [ ] Upsert updates existing beacon (depth only increases)
- [ ] Beacon Wallet returns grouped results
- [ ] UI page renders with mock/test data
- [ ] Route wired in Helm routes
- [ ] `npm run build` succeeds
- [ ] Session logged via Librarian (K242)
