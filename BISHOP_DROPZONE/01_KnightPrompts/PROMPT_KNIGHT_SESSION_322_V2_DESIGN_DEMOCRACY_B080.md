# KNIGHT SESSION 322 — V2 Design Democracy (AppShell)
## Bishop B080 | April 5, 2026 | Phase 5 page 2 of 6

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_35_MASTER_DESIGN_PACKET_B058.md` § PAGE 6
**Depends on**: K294 Foundation. K221 Manufacturing system LIVE.
**Tracker row**: `Design Democracy` (B35 batch)

---

## PAGE PURPOSE

Live round voting for member-submitted designs → through 4-stage production pipeline. Framing is relative ("Leading / Strong contender / Needs votes"), never absolute ranking.

## ROUTE

`/design-democracy` (AppShell).

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Design Democracy"
- **Headline**: "Vote the community's next real product into existence."
- **Body**: "Submit a design for free. Use Credits to vote. Winners move through a 4-stage pipeline to shipped goods, with designers keeping 83.3% of revenue."
- **Primary CTA**: "See active round"
- **Secondary CTA**: "Submit a design"
- **Utility strip**: "Live rounds" · "4-stage pipeline" · "Designer keeps 83.3%"

## LAYOUT

1. `LiveRoundCountdownBanner` (heartbeat — shifts to "next round opens" when inactive)
2. `DesignGallery` with relative-framing voting
3. `MarkWeightVotingExplainer` (collapsible, localStorage-persisted after first view)
4. `FourStagePipelineTracker` — Voted → Prototyped → Produced → Shipped
5. `DesignerAttributionDrawer` — portfolio + 83.3% revenue
6. `SubmitDesignCTA` — free to submit, Credits to vote
7. `HistoricalWinnersArchive`

## CRITICAL DESIGN RULES

- **Relative framing on cards**: "Leading / Strong contender / Needs votes" — NEVER absolute rank number
- **Free to submit, Credits to vote** (clear distinction)
- **Designer keeps 83.3% revenue** displayed descriptively, not promotionally
- Countdown banner neutral colors, never red
- Mark-weight explainer collapses after first view per localStorage

## COMPONENTS (build in `platform/src/components/v2/design-democracy/`)

- `LiveRoundCountdownBanner.tsx`
- `DesignGallery.tsx`
- `DesignCard.tsx` (with relative-framing label)
- `VoteButton.tsx` (Credits-weighted)
- `MarkWeightVotingExplainer.tsx` (collapsible, persistent)
- `FourStagePipelineTracker.tsx`
- `DesignerAttributionDrawer.tsx`
- `SubmitDesignCTA.tsx`
- `HistoricalWinnersArchive.tsx`

## MOBILE

- Single-column gallery
- Countdown banner sticky
- Pipeline tracker horizontal scroll
- StickyMobileCTA: "See active round"

## DATA

- Existing K221 design democracy tables
- Credits vote balance from existing `transaction_ledger`

## BANNED

- NO absolute-rank numbers on design cards
- NO red countdown timer
- NO promotional "earn / profit / ROI" framing
- NO "upgrade/premium/unlock"
- NO LLC / CEO / invest language
- NO demographic intake

## ACCEPTANCE

- [ ] Route `/design-democracy` wired in AppSidebar
- [ ] Hero copy matches spec EXACTLY
- [ ] Countdown banner + neutral colors
- [ ] Design cards show relative framing only
- [ ] Mark-weight explainer collapsible + persistent
- [ ] 4-stage pipeline visible + prominent
- [ ] Designer attribution shows 83.3% keep descriptively
- [ ] Historical winners archive accessible
- [ ] `data-tour-target="design-democracy"` + `data-xray-id` anchors
- [ ] `npm run build` passes; tracker K322 review; Librarian logged

## DO NOT

- Do not use absolute ranks on cards
- Do not allow Credits to be cashed back to fiat
- Do not skip the relative-framing labels

---

*Bishop B080 — Phase 5 page 2 of 6 — Design Democracy*
*FOR THE KEEP!*
