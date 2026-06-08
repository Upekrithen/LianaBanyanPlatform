# BP077 Scope 3 -- Cephas Pedestals + Six Degrees Wiring Design

**Date:** 2026-06-08T04:45:00Z  
**Author:** Bishop (Sonnet 4.6)  
**Mandate:** Founder direct, BP077 Scope 3  
**Status:** RATIFIED DESIGN -- proceeding to implementation

---

## 1. SEG-1 AUDIT FINDINGS (Truth-Always -- source-verified this turn)

### 1.1 CephasInnovationPedestalsPage.tsx

- EXISTS at `platform/src/pages/CephasInnovationPedestalsPage.tsx`
- **What it shows:** Searchable list of all innovations from `cephas_content_registry` table (category='innovation'), with 3-level reading
- **Routing:** Already routed at `/cephas/innovation-pedestals` in `platform/src/routes/cephas.tsx`
- **Gap:** Does NOT display letters. Shows innovations only. No changes needed for routing.

### 1.2 usePedestals.ts

- EXISTS at `platform/src/hooks/usePedestals.ts`
- **What it does:** Operates on `leadership_pedestals` table -- leadership seat nominations/staking, NOT letter pedestals
- **Note:** DISTINCT from `paper_pedestal_forum_additions`. Two separate pedestal concepts:
  - `leadership_pedestals` = who sits in leadership seats (crown/board/advisory/ambassador/captain)
  - `paper_pedestal_forum_additions` = Mordecai-Esther Decree-Composition member additions to papers/letters
- **For BP077 wiring:** usePedestals is NOT the mechanism for letter publishing. The `paper_pedestal_forum_additions` table is.

### 1.3 OutreachSixDegreesPanel.tsx

- EXISTS at `platform/src/components/outreach/OutreachSixDegreesPanel.tsx`
- **Already FULLY WIRED** in `OutreachLetterDetailPage.tsx` for letters in `locked/proposed/scheduled` state
- **Two controls:** (1) Amplify (vote_type='approve') + (2) "I know them" Six-Degrees flag (six_degrees_flag=true)
- **Backend:** `outreach_letter_votes` table via `cast-outreach-letter-vote` edge function
- **Heart-of-Peace compliant:** Cooperative, member-driven signals. No algorithmic engagement-bait. No auto-notifications. No viral coefficient loops.
- **VERDICT:** Six Degrees is ALREADY WIRED. No new wiring needed for the panel itself.

### 1.4 Current Publish Flow

The "publish" action for outreach letters = `lock-outreach-letter` edge function at `platform/supabase/functions/lock-outreach-letter/index.ts`.

**State machine:** `draft → locked → proposed → scheduled → dispatched`

**On `draft → locked`:**
- Letter becomes visible on Glass Door (public outreach page)
- `OutreachSixDegreesPanel` IS SHOWN automatically (canAmplify = locked/proposed/scheduled)
- Six Degrees panel is engaged at this moment

**GAP:** `lock-outreach-letter` does NOT create a `paper_pedestal_forum_additions` record on lock.

### 1.5 paper_pedestal_forum_additions Table Schema (10 cols)

Source: `platform/supabase/migrations/20260503150000_bushel13_pedestal_forum_additions.sql`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| paper_id | text NOT NULL | Free-text canonical ID -- NOT FK |
| member_user_id | uuid NOT NULL REFERENCES auth.users | Author |
| author_display_name | text NOT NULL | Default 'Anonymous Member' |
| addition_class | pedestal_addition_class NOT NULL | 'contradictory' / 'extending' / 'both' |
| title | text NOT NULL | Non-empty CHECK |
| body | text NOT NULL | Non-empty CHECK |
| year_of_jubilee_stamp | text NOT NULL | Auto 'JUB-' + UUID |
| is_visible | boolean NOT NULL | Default true |
| created_at | timestamptz NOT NULL | Default now() |

**Append-only contract:** No UPDATE allowed (except is_visible for soft-hide). No DELETE. Enforced by trigger.

### 1.6 Letters State (43 total, source: brief_me 2026-06-08)

- 6 pending (no draft on disk)
- 36 drafted but not locked
- 0 locked awaiting dispatch
- 0 dispatched
- 1 blocked (Founder hold)

**Letter format:** Live in `outreach_letters` Supabase table. Physical files in ARCHIVE2April2026/LAUNCH_DOCUMENTS_MASTER/letters/ (archived).

### 1.7 Innovation #2149 -- Family Table Trust Graph

**Truth-Always:** Gadget search returned no results for "Innovation 2149" or "Family Table". The current innovation count is 2270. Innovation #2149 may be unindexed or the reference may be from a prior BP's naming. The OutreachSixDegreesPanel's "I know them" flag IS the operational Six Degrees / Family Table Trust Graph mechanism. **Yoke-back: Founder should confirm if Innovation #2149 requires specific lookup or if OutreachSixDegreesPanel satisfies the reference.**

### 1.8 Routing Audit

- `/publications` -- PublicationsIndex ALREADY ROUTED (cephas.tsx confirmed)
- `/cephas/innovation-pedestals` -- ALREADY ROUTED
- `/cephas/press-junket` -- ALREADY ROUTED
- `/papers/:paperId/pedestal-forum` -- ALREADY ROUTED (PedestalForum page)
- `/outreach` + `/outreach/:slug` -- ALREADY ROUTED (OutreachIndexPage + OutreachLetterDetailPage)
- **Gap:** `PedestalForum.tsx` only handles predefined paper IDs (1-12, 6-steps). Letter slugs will show "Paper not found" without modification.

---

## 2. WIRING GAPS (Truth-Always)

1. **PEDESTAL GAP:** `lock-outreach-letter` does not create a `paper_pedestal_forum_additions` row on `draft → locked` transition. Members cannot submit Decree-Composition additions to a letter's Pedestal Forum because no initial awareness exists in the system.

2. **PEDESTAL FORUM RENDER GAP:** `PedestalForum.tsx` has a hardcoded PAPERS registry (IDs 1-12, 6-steps). Letter slugs render as "Paper not found". Needs to gracefully handle unknown IDs with a generic letter-pedestal view.

3. **NAVIGATION GAP:** `OutreachLetterDetailPage.tsx` does not link to the letter's Pedestal Forum. After a letter is locked, there is no surface from which the Founder/member can navigate to compose decree-additions.

4. **SIX DEGREES -- NO GAP:** Already wired. OutreachSixDegreesPanel is already shown on locked letters. No additional code needed.

5. **ROUTING -- NO GAP:** PublicationsIndex, /cephas/innovation-pedestals, /outreach, /papers/:paperId/pedestal-forum all have routes.

---

## 3. WIRING DESIGN

### 3.1 Trigger Point

**`platform/supabase/functions/lock-outreach-letter/index.ts`**

When `target_state === 'locked'`: after the successful `lock_outreach_letter` RPC call, fetch the letter's slug + title data and insert a `paper_pedestal_forum_additions` row.

### 3.2 Three Side Effects on Publish

**Effect 1 -- Pedestal Record Creation**
- Location: `lock-outreach-letter/index.ts`
- When: `target_state === 'locked'` only (not on later transitions)
- What: INSERT into `paper_pedestal_forum_additions`:
  - `paper_id`: letter.slug (outreach letter slug as canonical free-text ID)
  - `member_user_id`: user.id (Founder, who is making the lock call)
  - `author_display_name`: 'Founder'
  - `addition_class`: 'extending' (letter extends platform public discourse)
  - `title`: letter's recipient_name + context
  - `body`: letter's substantive_summary or what_we_are_asking
- Guard: Check existing row first (no unique constraint on paper_id -- guard against re-lock scenarios)
- Error handling: Graceful degrade -- log error, do NOT block publish
- Timestamp: ISO-8601 UTC auto via `now()` (DB default, Statute §10 compliant)

**Effect 2 -- Six Degrees Seeding**
- ALREADY COMPLETE. OutreachSixDegreesPanel is rendered on OutreachLetterDetailPage for letters in `locked` state.
- No additional code needed. The panel shows immediately when the letter transitions to `locked`.
- Heart-of-Peace: Members voluntarily signal "I know them" and "Amplify" -- cooperative, not algorithmic.

**Effect 3 -- Cooperative Amplification Signal**
- ALREADY COMPLETE. The Amplify button on OutreachSixDegreesPanel IS the cooperative amplification mechanism.
- Heart-of-Peace compliant: binary member signal, no notification spam, no viral coefficient, no algorithmic push.

### 3.3 Files That Change

| File | Change |
|---|---|
| `platform/supabase/functions/lock-outreach-letter/index.ts` | Add paper_pedestal_forum_additions insert after lock transition |
| `platform/src/pages/papers/PedestalForum.tsx` | Add fallback for unknown paper IDs (letter slugs) |
| `platform/src/pages/OutreachLetterDetailPage.tsx` | Add Pedestal Forum link for locked/proposed/scheduled letters |

### 3.4 Already Built (No Change Needed)

- `OutreachSixDegreesPanel.tsx` -- fully wired, Heart-of-Peace compliant
- `usePedestals.ts` -- correct for leadership pedestals; NOT the mechanism here
- Routes: `/publications`, `/cephas/innovation-pedestals`, `/outreach`, `/papers/:paperId/pedestal-forum`
- `PublicationsIndex.tsx` -- already routed at `/publications`

### 3.5 Heart-of-Peace Compliance Check

**COMPLIANT.** The automation:
- Does NOT send notifications to all followers
- Does NOT auto-like or auto-amplify
- Does NOT create viral coefficient loops
- Does NOT engage algorithmic feed mechanics
- DOES: Make the letter's Pedestal Forum available for members who navigate to it
- DOES: Show the cooperative Six Degrees panel for members to voluntarily signal
- The broadcast layer is: "this letter is now available, trusted members can compose decree-additions and signal Six Degrees connections" -- purely cooperative, trust-scored, voluntary

### 3.6 Yoke-Back Items (Truth-Always -- for Founder ratification)

1. **Innovation #2149 (Family Table Trust Graph):** No file or substrate record found for this innovation number. The OutreachSixDegreesPanel IS the operational Six Degrees mechanism. Founder should confirm if Innovation #2149 requires specific treatment or if the panel satisfies the reference.

2. **LAUNCH_DOCUMENTS_MASTER invariant:** "When ANY letter is updated in LAUNCH_DOCUMENTS_MASTER/letters/, the corresponding Cephas letter MUST be updated immediately." The LAUNCH_DOCUMENTS_MASTER folder is in ARCHIVE2April2026 (archived). The lock-outreach-letter function does NOT sync to Hugo Cephas (static site). The outreach letters in Supabase are NOT synced to the Hugo static museum. Founder should confirm whether the Glass Door `outreach_letters` table is considered part of the LAUNCH_DOCUMENTS_MASTER invariant, or if those are separate letter types.

3. **PedestalStake flow:** The brief says "member voting/stake" but the `usePedestals` hook (PedestalStake pages) operates on `leadership_pedestals` not `paper_pedestal_forum_additions`. If letter staking means something beyond Decree-Composition additions (e.g., credit staking), that mechanism does not yet exist and is a future build item.

---

## 4. STOP RULE STATUS

**Publish flow EXISTS:** Confirmed -- `lock-outreach-letter` edge function is the publish trigger. Implementation can proceed.

**Six Degrees data exists:** Confirmed -- `outreach_letter_votes` table handles six_degrees_flag. Graceful degrade for empty trust graph: panel shows "0" counts but does not crash.

---

*Design document authored BP077 Scope 3 -- 2026-06-08T04:45:00Z -- Bishop Sonnet 4.6*
