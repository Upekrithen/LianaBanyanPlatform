# KNIGHT SESSION 311 — V2 Treasure Map Builder (AppShell)
## Bishop B080 | April 5, 2026 | Phase 3 page 4 of 6

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_37_V2_PAGE_DESIGN_SPECS_PHASE_3C_PRODUCT_SPEC.md` § 5
**Depends on**: K294 Foundation primitives. K118 Treasure Maps system LIVE.
**Tracker row**: `Treasure Map Builder` (B37 batch)

---

## PAGE PURPOSE

Give members a fast, friendly authoring tool for building quiz-driven learning paths through Cephas content. Creative, not bureaucratic.

## ROUTE

`/treasure-maps/builder` (AppShell). Post-auth, member-facing. Existing index at `/treasure-maps` (K118) stays put.

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Treasure Map Builder"
- **Headline**: "Turn knowledge into a path people can follow"
- **Body**: "Treasure Maps combine Cephas content, quiz questions, sequence design, and completion rewards into a guided learning journey that feels creative rather than bureaucratic."
- **Primary CTA**: "Start a New Map"
- **Secondary CTA**: "Preview an Example Map"
- **Proof strip**: "Cephas source library" · "multiple question types" · "difficulty settings" · "completion rewards"

## SECTION FLOW

1. Hero (AppShell variant)
2. **TemplateOrBlankChooser** — template grid OR blank-start
3. **CephasContentPicker** — browse + select from Cephas library
4. **PathSequenceBuilder** — drag-order nodes, visualize sequence
5. **NodeQuizEditor** — per-node quiz question editor (multiple question types)
6. **DifficultyRewardConfig** — difficulty tier + completion reward settings
7. **FullPreviewMode** — end-to-end learner walkthrough preview
8. **PublishChecklist** — launch controls

## COMPONENTS (build in `platform/src/components/v2/treasure-maps/`)

- `TemplateOrBlankChooser.tsx` — template grid + blank entry
- `CephasContentPicker.tsx` — Cephas library browser (search, filter, select)
- `PathSequenceBuilder.tsx` — drag-sortable node list
- `MapNode.tsx` — individual sequence node display
- `NodeQuizEditor.tsx` — quiz editor with question-type selector
- `QuestionTypeSelector.tsx` — multiple-choice, true/false, short-answer, ordering
- `DifficultyRewardConfig.tsx` — difficulty + reward settings
- `FullPreviewMode.tsx` — learner-perspective walkthrough
- `PublishChecklist.tsx` — launch gate

## QUESTION TYPES (canonical)

- Multiple choice (single correct)
- Multiple select (multiple correct)
- True / false
- Short answer (text input)
- Ordering / sequence

## COMPLETION REWARDS

- **Marks** (effort-differential) — author sets amount per completed map
- **Joules** (surplus stamp) — awarded on first completion (author-optional)
- **Cephas badge** — visible on completer's profile
- NEVER: "points", "XP", "level up", gamified leaderboard language in reward copy

## MOBILE

- Single-column stack, one step at a time
- Preview mode full-screen
- Drag-order via long-press + arrow controls (accessibility)
- StickyMobileCTA: contextual per step ("Continue" / "Preview" / "Publish")

## DATA

- Cephas library query: existing `cephas_content` / `publications` tables
- Map drafts: use existing K118 `treasure_maps` schema if present, else add `treasure_map_drafts` table via migration
- Nodes: linked via `treasure_map_nodes` (existing or new per K118)

## BANNED (pre-completion check)

- NO gamified leaderboard language
- NO "points / XP / level up" framing for rewards
- NO "upgrade/premium/unlock"
- NO red states
- NO LLC / CEO / invest language
- NO demographic intake

## ACCEPTANCE

- [ ] Route `/treasure-maps/builder` wired in AppSidebar
- [ ] Hero copy matches spec EXACTLY
- [ ] Template OR blank-start chooser is first interactive step
- [ ] Cephas content picker queries live library
- [ ] 5 question types render in quiz editor
- [ ] Difficulty + reward config writes to draft state
- [ ] Full preview mode runs learner walkthrough end-to-end
- [ ] Publish checklist gates "Publish Map" button
- [ ] `data-tour-target="treasure-map-builder"` anchor placed
- [ ] Mobile: single-column, drag-order accessible, StickyMobileCTA
- [ ] `npm run build` passes
- [ ] Tracker: `assignee='K311'`, `in_progress` → `review`
- [ ] Librarian `update_session` K311
- [ ] Screenshots → `BISHOP_DROPZONE/99_Misc/PHASE_3_VISUAL_REVIEW_B080/`

## DO NOT

- Do not rebuild K118 Treasure Maps runtime (authoring only this session)
- Do not introduce gamified point/XP systems
- Do not break existing `/treasure-maps` index page
- Do not publish maps without checklist gate

---

*Bishop B080 — Phase 3 page 4 of 6 — Treasure Map Builder*
*Quiz-driven learning paths. Creative, not bureaucratic. Marks + Joules + Cephas badge as rewards.*
*FOR THE KEEP!*
