# KNIGHT SESSION 325 — V2 Pioneer Showcase (AppShell)
## Bishop B080 | April 5, 2026 | Phase 5 page 5 of 6

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_36_MASTER_DESIGN_PACKET_B058.md` § PAGE 6
**Depends on**: K294 Foundation. K207/K208 systems.
**Tracker row**: `Pioneer Showcase` (B36 batch)

---

## PAGE PURPOSE

Honor Pioneers (early-cohort members) without creating a second-class feeling. Mix Pioneer + non-Pioneer stories. Narrative over metrics. Badges decorate, don't dominate.

## ROUTE

`/pioneers` (AppShell).

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Pioneers"
- **Headline**: "Pioneers Opened the Gate. Everyone Builds What Comes Next."
- **Body**: "Early cohorts took on more risk and recognition reflects that. New members join a living story still being written."
- **Primary CTA**: "Browse Pioneers"
- **Secondary CTA**: "See current contribution paths"
- **Utility strip**: "Marketplace · HexIsle · Governance"

## LAYOUT

- `PioneerHero`
- `PioneerFiltersBar` — sort + filter chips (Marketplace, HexIsle, Governance)
- `PioneerGrid` — avatar, name, tagline, "Joined during Phase X"
- `PioneerProfileDrawer` — overview + contribution list + narrative story paragraph
- `RewardLadder` — visual timeline of cohorts, positive diminishing-reward framing
- `ContributionPaths` — if window open: steps to become Pioneer; if closed: new contribution paths
- `BadgesRow` — icon + one-line meaning per badge
- `MemberStoriesCarousel` — mix of Pioneers + non-Pioneers

## CRITICAL DESIGN RULES

- **Narrative over metrics** — NO large numeric leaderboards
- **Badges decorate, don't dominate**
- **Diminishing rewards framed positively**: "early uncertainty justified higher recognition"
- **Mix of Pioneer + non-Pioneer stories** prevents second-class feeling
- **"Living story still being written"** framing throughout

## COMPONENTS (build in `platform/src/components/v2/pioneers/`)

- `PioneerHero.tsx`
- `PioneerFiltersBar.tsx`
- `PioneerGrid.tsx` + `PioneerCard.tsx`
- `PioneerProfileDrawer.tsx`
- `RewardLadder.tsx`
- `ContributionPaths.tsx`
- `BadgesRow.tsx`
- `MemberStoriesCarousel.tsx`

## MOBILE

- Single-column grid
- Profile drawer full-screen
- StickyMobileCTA: "Browse Pioneers"

## DATA

- Existing membership / pioneer cohort data
- Badge definitions from existing badge system

## BANNED

- NO large numeric leaderboards
- NO Pioneers-vs-others framing
- NO badge-dominated cards
- NO shaming late joiners
- NO "upgrade/premium/unlock"
- NO LLC / CEO / invest language

## ACCEPTANCE

- [ ] Route `/pioneers` wired in AppSidebar
- [ ] Hero copy matches spec EXACTLY (headline tagline)
- [ ] Pioneer grid with filter chips
- [ ] Profile drawer with narrative story paragraph
- [ ] Reward ladder with positive diminishing framing
- [ ] Member stories carousel mixes Pioneers + non-Pioneers
- [ ] `data-tour-target="pioneers"` + `data-xray-id` anchors
- [ ] `npm run build` passes; tracker K325 review; Librarian logged

## DO NOT

- Do not create a Pioneers-only leaderboard
- Do not dominate cards with badges
- Do not frame late cohorts as inferior

---

*Bishop B080 — Phase 5 page 5 of 6 — Pioneer Showcase*
*FOR THE KEEP!*
