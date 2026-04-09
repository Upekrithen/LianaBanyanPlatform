# KNIGHT SESSION 321 — V2 ADAPT Score Profile (AppShell)
## Bishop B080 | April 5, 2026 | Phase 5 page 1 of 6 (OPENS Reputation & Production)

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_35_MASTER_DESIGN_PACKET_B058.md` § PAGE 3
**Depends on**: K294 Foundation. K219 Reputation system LIVE.
**Tracker row**: `ADAPT Score Profile` (B35 batch)

---

## PAGE PURPOSE

Show a member their ADAPT reputation clearly, warmly, forward-looking. 5 pillars, percentile context, improvement nudges. Never shaming, never red.

## ROUTE

`/adapt` (AppShell). Post-auth, member-facing.

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "ADAPT Score"
- **Headline**: "See how your contributions are shaping your standing."
- **Body**: "Five pillars, seven-day trends, and forward-looking nudges so you always know where you are and where to grow next."
- **Primary CTA**: "View my full breakdown"
- **Secondary CTA**: "How ADAPT works"
- **Utility strip**: "5 pillars" · "7-day trends" · "Room to grow"

## LAYOUT

- **Top banner**: `OverallScoreCard` (large composite score, warm arc/gauge, amber→green gradient, NEVER red)
- **Primary**: `FivePillarBreakdown` (horizontal bars, NOT radar)
- **Right of bars (desktop) / Below (mobile)**: `SevenDayTrendSparklines` per pillar
- **Below**: `PercentileContextPanel` ("top X%" framing, NEVER deficit)
- **Accordion**: `ImpactExplanation` (collapsed by default — how each pillar affects features)
- **Bottom**: `ImprovementSuggestionsRail` (2-3 forward-looking nudges)

## 5 PILLARS (verify canonical names from K219)

Each pillar row: name + icon | horizontal bar (warm color) | current score | one-sentence driver

## CRITICAL DESIGN RULES

- **Horizontal bars, NOT radar chart** (mobile legibility + instant comparison)
- **Down trends** framed as "Room to grow" — NEVER "Declining" / "Falling"
- **Percentile**: "You are in the top X%" — NEVER "X% of members score higher"
- **Colors**: warm amber → green gradient. NEVER red.
- **Improvement suggestions**: forward-looking and factual, NEVER shaming

## COMPONENTS (build in `platform/src/components/v2/adapt/`)

- `OverallScoreCard.tsx` — arc gauge, amber-to-green
- `FivePillarBreakdown.tsx` — horizontal bar list
- `PillarRow.tsx` — single pillar bar + driver sentence
- `SevenDayTrendSparklines.tsx`
- `PercentileContextPanel.tsx`
- `ImpactExplanation.tsx` — accordion
- `ImprovementSuggestionsRail.tsx` — 2-3 nudge cards

## MOBILE

- Single-column stack
- Sparklines render BELOW bars (not side-by-side)
- StickyMobileCTA: "View my full breakdown"

## DATA

- Existing ADAPT schema (K219)
- 7-day trend data from existing ADAPT history tables

## BANNED

- NO radar chart
- NO red gauge / red bars
- NO shaming copy ("declining", "weak", "low")
- NO "upgrade/premium/unlock"
- NO demographic intake
- NO LLC / CEO / invest language

## ACCEPTANCE

- [ ] Route `/adapt` wired in AppSidebar
- [ ] Hero copy matches spec EXACTLY
- [ ] 5 pillars render as horizontal bars
- [ ] Amber→green gradient (never red)
- [ ] 7-day sparklines per pillar
- [ ] Percentile shows "top X%" framing
- [ ] Impact accordion collapsed by default
- [ ] Suggestions rail shows 2-3 forward-looking nudges
- [ ] `data-tour-target="adapt"` + `data-xray-id` anchors placed
- [ ] Mobile: single-col, StickyMobileCTA
- [ ] `npm run build` passes
- [ ] Tracker K321 review; Librarian session logged

## DO NOT

- Do not use radar chart
- Do not use red for any state
- Do not shame down-trending pillars

---

*Bishop B080 — Phase 5 page 1 of 6 — ADAPT Score Profile*
*FOR THE KEEP!*
