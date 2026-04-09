# KNIGHT SESSION 316 — V2 Tribe Directory (AppShell)
## Bishop B080 | April 5, 2026 | Phase 4 page 3 of 6

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_35_MASTER_DESIGN_PACKET_B058.md` § PAGE 4
**Depends on**: K294 Foundation. Tribe system LIVE.
**Tracker row**: `Tribe Directory` (B35 batch)

---

## PAGE PURPOSE

Personal-tribe discovery: neighborhood, interest, hobby, family. Warmer/softer than Guild. **Tribe = personal. Guild = professional. Canonical distinction.**

## ROUTE

`/tribes` (AppShell). Post-auth, member-facing.

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Tribe Directory"
- **Headline**: "Find the people you share a table, a block, or a passion with."
- **Body**: "Tribes are personal — the neighbors, families, and fellow travelers who share your life outside of work."
- **Primary CTA**: "Browse tribes"
- **Secondary CTA**: "Start a tribe"
- **Utility strip**: "Neighborhood" · "Interest" · "Hobby" · "Family" · "Tribe ≠ Guild"

## LAYOUT

- **Sticky top**: Category Filter Bar (Neighborhood default, Interest, Hobby, Family, All)
- **Top-right toggle**: Map / List view (MAP default for Neighborhood, LIST for Interest/Hobby)
- **Top of content**: `MyTribesRail` (existing memberships with unread badges)
- **Main (list view)**: `TribeCard` grid (2-col desktop / 1-col mobile, warmer than Guild cards)
- **Main (map view)**: Tribe pins clustered by neighborhood + `NearbyTribesSidebar` (3 nearest, one-tap join)
- **Bottom**: `StartTribeInline` CTA (inline form: name, category, open/invite-only, charter — 2 minutes max)

## COMPONENTS (build in `platform/src/components/v2/tribes/`)

- `CategoryFilterBar.tsx`
- `MapListToggle.tsx`
- `MyTribesRail.tsx`
- `TribeCard.tsx` (warmer aesthetic than GuildCard)
- `TribeMapView.tsx`
- `NearbyTribesSidebar.tsx`
- `StartTribeInline.tsx` (2-minute form)

## CRITICAL DESIGN RULES

- **Tribe = personal. Guild = professional.** This distinction is visible on the page.
- **Start Tribe must complete in 2 minutes**: 4 fields maximum (name, category, open/invite-only, charter).
- **Tribe cards feel warmer** than Guild cards (softer color palette, more rounded, slightly less dense).
- Map default for Neighborhood category; List default for Interest/Hobby.

## CARD FIELDS

- Tribe name + category chip
- Charter excerpt (1-2 lines)
- Member count + activity level
- Join type badge (Open / Invite-only)
- Geographic tag (if Neighborhood tribe)
- "Join" or "Request to join" action

## MOBILE

- Single-column tribe cards
- Map view toggleable via top-right button
- StickyMobileCTA: "Browse tribes" / "Start a tribe"

## DATA

- Use existing tribe tables (`tribes`, `tribe_members`, `tribe_charters`)
- Map pins from `tribes.latitude` / `longitude` if present; else skip map for that tribe

## BANNED (pre-completion check)

- NO conflation with Guild (separate page, separate aesthetic)
- NO Discord-server-style framing
- NO red states
- NO "upgrade/premium/unlock"
- NO LLC / CEO / invest language
- NO demographic intake

## ACCEPTANCE

- [ ] Route `/tribes` wired in AppSidebar
- [ ] Hero copy matches spec EXACTLY
- [ ] 4 categories + All in sticky filter
- [ ] Map/List toggle with category-aware default
- [ ] My Tribes rail shows existing memberships
- [ ] Tribe cards visually warmer than Guild cards
- [ ] Start Tribe form completable in 2 minutes (4 fields)
- [ ] Tribe vs Guild distinction visible on page
- [ ] `data-tour-target="tribes"` anchor placed
- [ ] Mobile: single-col, map toggle, StickyMobileCTA
- [ ] `npm run build` passes
- [ ] Tracker: `assignee='K316'`, `in_progress` → `review`
- [ ] Librarian `update_session` K316
- [ ] Screenshots → `BISHOP_DROPZONE/99_Misc/PHASE_4_VISUAL_REVIEW_B080/`

## DO NOT

- Do not mix Tribe and Guild on one page
- Do not exceed 4 fields on Start Tribe form
- Do not use professional/institutional aesthetic on Tribe cards

---

*Bishop B080 — Phase 4 page 3 of 6 — Tribe Directory*
*Personal tribes. 4 categories. Warmer than Guild. 2-minute start.*
*FOR THE KEEP!*
