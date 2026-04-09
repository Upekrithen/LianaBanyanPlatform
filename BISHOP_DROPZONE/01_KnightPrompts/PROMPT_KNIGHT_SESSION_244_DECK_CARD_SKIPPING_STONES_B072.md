# KNIGHT SESSION 244 — Deck Card Template + Deep-Link Routing + Skipping Stones Card Variant
## Dispatched by: Bishop B072
## Date: April 3, 2026
## Priority: HIGH — Physical-digital bridge for BST + Skipping Stones

---

## MISSION

Implement Deck Card Deep-Link Pipeline (#2135) — the physical/digital card system that bridges BST episodes and Skipping Stones to their source content. Two card variants: BST Episode cards and Skipping Stone cards.

---

## CONTEXT (READ FIRST)

### Deck Card Deep-Link Pipeline (#2135)
Each BST episode and each Skipping Stone gets a Deck Card with a QR code that deep-links to the exact passage in the source paper. The physical card becomes a complete onboarding pipeline.

### Scale
- BST episodes: 142 produced (Chapters 1-3), targeting 3,000-5,000 at full scale
- Skipping Stones: ~30 per 3-paper pilot batch, ~300 at full scale across ~30 papers
- Each card = one potential member acquisition funnel

### Related A&A Formals
- `BISHOP_DROPZONE/AA_FORMAL_2135_DECK_CARD_DEEP_LINK_PIPELINE_B071.md`
- `BISHOP_DROPZONE/AA_FORMAL_2139_SKIPPING_STONES_DEPTH_NAVIGATION_B072.md`

---

## IMPLEMENTATION

### 1. Migration: Deck Card Table

File: `platform/supabase/migrations/20260404000005_deck_cards.sql`

```sql
CREATE TABLE IF NOT EXISTS public.deck_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_type TEXT NOT NULL CHECK (card_type IN ('bst_episode', 'skipping_stone')),
  -- BST episode reference
  episode_id UUID REFERENCES public.crewman_episodes(id),
  -- Skipping Stone reference
  paper_key TEXT,
  section_anchor TEXT,
  -- Common fields
  title TEXT NOT NULL,
  hook_text TEXT NOT NULL,  -- max 140 chars for Skipping Stones, ~280 for BST
  deep_link_url TEXT NOT NULL,
  qr_code_data TEXT,  -- encoded QR payload
  -- Design
  card_template TEXT NOT NULL DEFAULT 'default',
  logo_variant TEXT NOT NULL DEFAULT 'standard' CHECK (logo_variant IN ('standard', 'skipping_stone')),
  -- Tracking
  scan_count INTEGER NOT NULL DEFAULT 0,
  signup_count INTEGER NOT NULL DEFAULT 0,  -- scans that led to signups
  status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'printed', 'distributed', 'retired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.deck_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read deck cards" ON public.deck_cards FOR SELECT USING (true);
CREATE POLICY "Service role manage deck cards" ON public.deck_cards FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_deck_cards_type ON public.deck_cards (card_type);
CREATE INDEX IF NOT EXISTS idx_deck_cards_episode ON public.deck_cards (episode_id) WHERE episode_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deck_cards_paper ON public.deck_cards (paper_key) WHERE paper_key IS NOT NULL;
```

### 2. Edge Function: Generate Deck Cards (Batch)

File: `platform/supabase/functions/generate-deck-cards/index.ts`

Accepts:
```json
{
  "type": "bst_episode",
  "chapter_id": "uuid",
  "base_url": "https://lianabanyan.com"
}
```
OR:
```json
{
  "type": "skipping_stone",
  "paper_key": "starscreaming",
  "stones": [
    { "section_anchor": "the-wall", "title": "The Wall", "hook_text": "There is a wall built from confident lies delivered at machine speed." }
  ],
  "base_url": "https://lianabanyan.com"
}
```

Logic:
1. For BST: fetch all episodes in chapter, generate deep-link per episode
2. For Skipping Stones: use provided stones array
3. Deep-link format: `{base_url}/read/{paper_key}#{section_anchor}?ref={ref_code}`
4. Generate QR data string (actual QR image generation is client-side or external service)
5. Bulk insert into deck_cards table
6. Return generated cards with IDs

### 3. Edge Function: Track Deck Card Scan

File: `platform/supabase/functions/track-deck-card-scan/index.ts`

Called when a QR code is scanned (the deep-link landing page calls this):

Accepts:
```json
{
  "card_id": "uuid",
  "scanned_by_member_id": "uuid-or-null"
}
```

Logic:
1. Increment scan_count on deck_card
2. If scanned_by_member_id is present → create Reading Beacon at position
3. If scanner is not a member → redirect to signup with card_id as referral source
4. Return deep-link URL for redirect

### 4. Deep-Link Landing Page

File: `platform/src/pages/ReadLandingPage.tsx`

Route: `/read/:paperKey` (with optional `#section` anchor and `?ref=` param)

This is the "Proof is in the Pudding" landing:
- If member: create/update Reading Beacon, show content at section
- If visitor: show teaser + "The Proof is in the Pudding" CTA
  - Option A: "Read the Pudding" → accessible Pudding article (Layer 3)
  - Option B: "This is NOT Pudding" → full academic paper (Layer 4)
  - Option C: "Join to track your reading" → signup with card referral attribution

Wire route in `platform/src/routes/public.tsx` or appropriate route file.

### 5. Deck Card Design Templates

File: `platform/src/components/DeckCardTemplate.tsx`

Two variants:

**BST Episode Card**:
- Front: BST series logo + episode number + first line of episode text
- Back: QR code + "Scan to read the full story" + #CrewmanSix

**Skipping Stone Card**:
- Front: Skipping stone logo + paper title + section title
- Back: QR code + "The Proof is in the Pudding" + lianabanyan.com

Both render as printable cards (standard business card dimensions: 3.5" x 2").

---

## VALIDATION CHECKLIST

- [ ] deck_cards migration applies cleanly
- [ ] Batch generation works for both BST and Skipping Stone types
- [ ] Deep-link URLs resolve correctly with section anchors
- [ ] Scan tracking increments counts
- [ ] Landing page shows "Proof is in the Pudding" CTA for visitors
- [ ] Landing page creates Reading Beacon for members
- [ ] Card templates render at printable dimensions
- [ ] `npm run build` succeeds
- [ ] Session logged via Librarian (K244)
