# KNIGHT SESSION 317 — V2 Guild Directory (AppShell)
## Bishop B080 | April 5, 2026 | Phase 4 page 4 of 6

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_31_MASTER_DESIGN_PACKET_B057.md` § 6
**Depends on**: K294 Foundation. K218 Guild system LIVE.
**Tracker row**: `Guild Directory` (B31 batch)

---

## PAGE PURPOSE

Professional guild discovery. Professional bodies, NOT Discord servers. Institutional aesthetic.

## ROUTE

`/guilds` (AppShell). Enhances existing K218 page.

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Guild Directory"
- **Headline**: "Find the professional bodies that fit your work."
- **Body**: "Browse guilds by discipline, threshold, charter, and representation structure to identify where your professional contribution belongs."
- **Primary CTA**: "Browse guilds"
- **Secondary CTA**: "Compare charters"
- **Proof strip**: "many-to-many membership" · "charter-based governance" · "staked Marks" · "elected representatives" · "Harper Guild oversight"

## SECTION FLOW

1. Hero + search/filters
2. Guild overview cards (institutional aesthetic)
3. `GuildCompareTool` — side-by-side charter comparison
4. `FeaturedCharters` + `FormingGuildsRail`
5. Guild detail panels (expand in place)
6. Join pathway (staking flow)
7. **`GuildVsTribeExplainer`** (visible educational module, NOT buried)

## CRITICAL DESIGN RULES

- **Institution profiles, NOT social tiles**
- **Harper Guild pinned/highlighted** as governance-critical
- **Guild vs Tribe distinction** in visible educational module
- **Comparison layer essential** — many guilds, each with non-refundable stake
- Charter access prominent on every card
- Top fields: **discipline · charter focus · threshold · stake · reps · standing**

## COMPONENTS (build in `platform/src/components/v2/guilds/`)

- `GuildSearchFilters.tsx`
- `GuildCard.tsx` (institutional aesthetic — denser, formal)
- `HarperGuildHighlight.tsx` (pinned at top)
- `GuildCompareTool.tsx` (side-by-side comparison)
- `FeaturedCharters.tsx`
- `FormingGuildsRail.tsx`
- `GuildDetailPanel.tsx` (expand in place)
- `GuildJoinStakingFlow.tsx` (staked Marks flow)
- `GuildVsTribeExplainer.tsx` (visible module)

## CARD FIELDS

- Guild name + discipline chip
- Charter focus (one-line summary)
- **Threshold** (staked Marks required)
- Member count
- Elected representatives count
- Standing (active / forming)
- "View charter" + "Compare" + "Join" actions

## JOIN STAKING FLOW

- Show required staked Marks
- Confirmation: "Stake is non-refundable while member of guild"
- Confirm with "As You Wish" stamp (solemn, NOT checkbox)
- Writes to existing guild_members + marks_stakes tables

## MOBILE

- Single-column guild cards
- Compare tool: swipe between guilds
- Harper Guild pinned at top
- StickyMobileCTA: "Browse guilds" / "Compare charters"

## BANNED (pre-completion check)

- NO Discord-server framing
- NO social-tile aesthetic
- NO burying the Guild-vs-Tribe distinction in help text
- NO omitting Harper Guild highlight
- NO red states
- NO "upgrade/premium/unlock"
- NO LLC / CEO / invest language

## ACCEPTANCE

- [ ] Route `/guilds` enhances existing K218 page
- [ ] Hero copy matches spec EXACTLY
- [ ] Guild cards use institutional aesthetic
- [ ] Harper Guild pinned/highlighted as governance-critical
- [ ] Guild vs Tribe explainer is a visible module (not buried)
- [ ] Compare tool enables side-by-side charter view
- [ ] Join flow requires staked Marks with "As You Wish" confirmation
- [ ] `data-tour-target="guilds"` anchor placed
- [ ] Mobile: single-col, swipe-compare, StickyMobileCTA
- [ ] `npm run build` passes
- [ ] Tracker: `assignee='K317'`, `in_progress` → `review`
- [ ] Librarian `update_session` K317
- [ ] Screenshots → `BISHOP_DROPZONE/99_Misc/PHASE_4_VISUAL_REVIEW_B080/`

## DO NOT

- Do not use social-network-style cards
- Do not hide Guild-vs-Tribe distinction
- Do not skip Harper Guild highlight
- Do not allow Mark un-staking within join flow

---

*Bishop B080 — Phase 4 page 4 of 6 — Guild Directory*
*Professional institutions. Harper pinned. Compare charters. Staked Marks.*
*FOR THE KEEP!*
