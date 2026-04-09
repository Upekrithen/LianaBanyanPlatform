# PROMPT — Knight Session 31
## Written by Bishop Session 012 (continued) — March 18, 2026
## Predecessor: Knight Session 30 (commit bf6a7bd)

---

## SESSION CONTEXT

**Canonical innovation count:** 1,748 (after Bishop 012 migrations)
**Last commit:** `bf6a7bd` (Knight Session 30)
**Last migration:** `20260318000004` (Gameplay Mechanics #1740-#1748) — PUSHED
**Campaign count:** 14 (Character Base added as Campaign 6)

Knight Session 30 built: Shadow Mark Demand Signaling (`/demand`), FAQ chain linking (data + Chapter 9), POLLINATED 1,709→1,719.

Bishop Session 012 (continued) built:
- FAQ "See Also" UI (chain-linked pills in FAQ.tsx)
- Pledged Mark Voting page (`/hexisle/vote`) — 14 campaign candidates
- HexIsle Cue Card (`/cue-cards/hexisle`) — dual-audience referral card
- Migration `20260318000002` — 11 innovations (#1720-#1730), PUSHED to Supabase
- Migration `20260318000003` — 9 innovations (#1731-#1739, Hitbase Counter details), PUSHED
- Migration `20260318000004` — 9 innovations (#1740-#1748, Gameplay Mechanics), PUSHED
- POLLINATED 1,719→1,748 across 22+ source files
- 6 new FAQ entries in knowledgeBase (Hitbase Counter, Coin-Terrain, Level Overlay, Character Layers, Root Lock, plus updates)
- Updated HexIsle Chain from 13→14 campaigns (65%→70% max bonus)
- Campaign 6 (Character Base / Hitbase Counter) — full copy written with patent detail
- Removed floating Patent Portfolio ticker and LIVE — ALPHA RELEASE buttons (Founder directive)
- IP Portfolio Bag 8 expanded: #1720-#1748 (29 innovations)

This session has THREE priorities:
1. Build remaining features Bishop prepared
2. Wire existing pages to Supabase
3. Deploy

---

## PRIORITY 1: BUILD NEW FEATURES

### 1A. Hitbase Counter Showcase Component

Create `src/components/hexisle/HitbaseCounterShowcase.tsx` — interactive visual explainer:
- Animated diagram: character pushed → piston displaces → cog advances → counter ring rotates
- 6-position numbered display (1-6 HP states)
- Supine-lock visual at HP=0 (character falls)
- Danger Tab level selector (shows HP/Mana ratio change)
- Link from HexIsle portal page and Campaign 6 context

Key innovations to reference: #1579 (Push-to-Hit Piston), #1580 (HP/Mana Dual Counter), #1583 (Root Lock 5 shapes)

### 1B. Character Layer System Interactive Display

Create `src/components/hexisle/CharacterLayerExplorer.tsx`:
- Two progression paths: Sword Path and Crown Path
- Visual layer stack: click to add/remove layers on the base body
- Sword: Peasant → +ToolBelt (Farmer) → +ScaleMail+TerrainArmor (Warrior) → +Crown (King)
- Crown: +Cloak (Merchant) → +Herbs+Staff (Healer) → -Cloak (Assassin) → +Wings+CrownHelmet (Queen)
- Campaign number badges on each progression stage
- "Ships complete at this stage" callout per campaign

Key innovations: #1720-#1730

### 1C. Wire Demand Signaling to Supabase

The `/demand` page currently shows mock data from `SAMPLE_PEDESTALS` in `demandSignalingService.ts`.

Create migration + wire to real Supabase tables:
- `pedestals` table (id, feature_name, description, area, status, activation_threshold, current_commitments, etc.)
- `shadow_mark_allocations` table (user_id, pedestal_id, fresh_today, carry_forward, total, consecutive_days, crystallized, last_allocated_at)
- `beacon_streaks` table (user_id, current_streak, longest_streak, last_active_at)
- Seed with the 8 sample pedestals already defined in code
- Wire `DemandSignaling.tsx` to fetch from Supabase instead of mock data
- RLS: users can read all pedestals, read/write own allocations

### 1D. Wire Pledged Mark Voting to Supabase

The `/hexisle/vote` page currently shows mock data from `CANDIDATES` array.

Create migration:
- `vote_candidates` table (id, name, description, campaign_number, type, status)
- `pledged_mark_votes` table (user_id, candidate_id, marks_pledged, pledged_at)
- Seed with 14 campaign candidates
- Wire `HexIsleVote.tsx` to fetch/write from Supabase
- RLS: users can read all candidates, read/write own votes

---

## PRIORITY 2: UPDATE EXISTING PAGES

### 2A. HexIsle Portal — Add Character Layer & Hitbase Sections

Update `/hexisle` portal page to include:
- Character Layer System section (link to CharacterLayerExplorer)
- Hitbase Counter section (link to HitbaseCounterShowcase)
- 14-campaign cadence overview (was 13)

### 2B. Campaign Chain Dashboard — Update to 14

Update `/chain` to reflect 14 campaigns (was 13). Update chain bonus max from 65% to 70%.

### 2C. Kickstarter Strategy Updates

If `KICKSTARTER_STRATEGY_*.md` exists in BISHOP_DROPZONE, update to reflect:
- 14 campaigns
- Character Base as Campaign 6
- Layer system (not separate miniatures)
- Hitbase Counter System as selling point

---

## PRIORITY 3: POLLINATE + DEPLOY

### 3A. Verify POLLINATION

Grep for any remaining "1,719" references (should be zero — Bishop already swept).
Grep for "13-campaign" or "13 campaign" references that should be "14".
Grep for "65%" chain bonus references that should be "70%".

### 3B. Build + Deploy

```bash
npm run build
firebase deploy --only hosting
```

Both targets: `lianabanyan-main.web.app` and `cephas-lianabanyan.web.app`

---

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `src/components/hexisle/HitbaseCounterShowcase.tsx` | Interactive Hitbase Counter explainer |
| `src/components/hexisle/CharacterLayerExplorer.tsx` | Layer progression visualizer |
| `supabase/migrations/NEXT_pedestals_and_shadow_marks.sql` | Demand Signaling tables |
| `supabase/migrations/NEXT_pledged_mark_votes.sql` | Voting tables |

## FILES TO MODIFY

| File | Changes |
|------|---------|
| `src/pages/DemandSignaling.tsx` | Wire to Supabase (replace mock data) |
| `src/pages/HexIsleVote.tsx` | Wire to Supabase (replace mock data) |
| `src/pages/HexIsle*.tsx` | Add Character Layer + Hitbase sections |
| `src/pages/Chain*.tsx` or equivalent | 13→14, 65%→70% |
| `src/App.tsx` | Any new routes if needed |

---

## CRITICAL RULES

1. **Characters are SAME BODY with snap-on layers** — NOT separate miniatures
2. **14 campaigns** — Campaign 6 = Character Base (Hitbase Counter System)
3. **Chain bonus max = 70%** (5% × 14 campaigns)
4. **Innovation count = 1,730** — verify after any changes
5. **SEC language** — no "invest", "return", "profit", "dividend", "yield" in user-facing copy
6. **Marks = effort-debt currency** — never "granted as gifts", always from differential
7. **"As You Wish"** = universal transaction confirmation
8. Build must pass `npx tsc --noEmit` before deploy

---

## COMMIT MESSAGE FORMAT

```
Session 31: [summary], [innovation count if changed], POLLINATE if applicable
```
