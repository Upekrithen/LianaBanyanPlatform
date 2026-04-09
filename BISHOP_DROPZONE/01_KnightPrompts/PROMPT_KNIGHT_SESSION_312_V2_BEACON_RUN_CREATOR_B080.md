# KNIGHT SESSION 312 — V2 Beacon Run Creator (AppShell)
## Bishop B080 | April 5, 2026 | Phase 3 page 5 of 6

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_32_MASTER_DESIGN_PACKET_B057.md` § 3
**Depends on**: K294 Foundation primitives. Beacons system LIVE.
**Tracker row**: `Beacon Run Creator` (B32 batch)

---

## PAGE PURPOSE

Turn a loose idea into a fully playable Beacon Run with pacing, difficulty, and learning goals. Story-first authoring.

## ROUTE

`/beacons/create` (AppShell). Post-auth, member-facing. Existing `/beacons` index stays put.

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Tell a story people walk through"
- **Headline**: "Sketch a Beacon Run like you'd plan a day with a friend."
- **Body**: "The Creator asks for your story first, then helps you lay down beacons, challenges, and rewards that serve that arc."
- **Primary CTA**: "Start my run story"
- **Secondary CTA**: "Browse example runs"
- **Proof strip**: "Story-first" · "Narrative checkpoints" · "Design heuristics built in"

## SECTION FLOW — STORY FIRST

1. Hero (AppShell variant)
2. **RunGoalCapture** (Step 1) — "What is this run for?" + "One-sentence story"
3. **MapDesigner** — narrative-verb checkpoint placement (discover / debate / decide / meet / make / move)
4. **ChallengeTypeSelector** — challenge types with "when to use this" tooltips (design heuristics)
5. **PacingDifficultyPanel** — beat count, difficulty tier, estimated duration
6. **RewardsConfig** — Marks + Joules + badge per completion
7. **RunPreview** — playable preview as a participant would experience it
8. **PublishControls**

## CRITICAL DESIGN RULES

- **STORY FIRST**. Nothing else unlocks until "Run goal" + "One-sentence story" are written.
- **Narrative verbs on checkpoints**, NOT coordinate IDs. Checkpoint labels use verbs (discover, debate, decide, meet, make, move) — never "Node 1", "Checkpoint A".
- **"When to use this" tooltips** on challenge types teach design heuristics (teaching, not gating).
- NEVER gamified leaderboard copy.
- NEVER red states ("failed", "wrong path"). Use "reroute" / "try another angle".

## COMPONENTS (build in `platform/src/components/v2/beacons/`)

- `RunGoalCapture.tsx` — story + goal capture (gates everything else)
- `MapDesigner.tsx` — narrative-verb checkpoint composer
- `NarrativeCheckpoint.tsx` — single checkpoint with verb label
- `ChallengeTypeSelector.tsx` — challenge types + heuristic tooltips
- `PacingDifficultyPanel.tsx` — beat count, difficulty, duration
- `RewardsConfig.tsx` — Marks / Joules / badge
- `RunPreview.tsx` — participant-perspective walkthrough
- `PublishControls.tsx`

## NARRATIVE VERBS (canonical set)

Checkpoints use these verbs as labels: **discover / debate / decide / meet / make / move / reflect / reroute**

## CHALLENGE TYPES WITH HEURISTICS

Each challenge type has a "When to use this:" tooltip teaching design decisions. Example types:
- Trivia (quick knowledge check)
- Artifact find (exploration)
- Dialogue choice (debate/decide)
- Creation task (make)
- Travel (move)

## MOBILE

- Single-column stack
- Story capture step full-screen (no distractions)
- Preview full-screen
- StickyMobileCTA: contextual per step

## BANNED (pre-completion check)

- NO composer entry before story + goal written
- NO coordinate-ID checkpoint labels
- NO gamified leaderboard language
- NO red failure states
- NO "upgrade/premium/unlock"
- NO LLC / CEO / invest language
- NO demographic intake

## ACCEPTANCE

- [ ] Route `/beacons/create` wired in AppSidebar
- [ ] Hero copy matches spec EXACTLY
- [ ] Story + goal capture gates all subsequent steps
- [ ] Checkpoints use narrative verb labels, never IDs
- [ ] Challenge types have "When to use this" tooltips
- [ ] Preview renders participant walkthrough
- [ ] Publish controls gate finalization
- [ ] `data-tour-target="beacon-run-creator"` anchor placed
- [ ] Mobile: full-screen story step, StickyMobileCTA, accessible verb picker
- [ ] `npm run build` passes
- [ ] Tracker: `assignee='K312'`, `in_progress` → `review`
- [ ] Librarian `update_session` K312
- [ ] Screenshots → `BISHOP_DROPZONE/99_Misc/PHASE_3_VISUAL_REVIEW_B080/`

## DO NOT

- Do not build Beacon runtime player (authoring only this session)
- Do not introduce gamified leaderboards
- Do not use coordinate IDs on checkpoints
- Do not allow skip of story/goal capture

---

*Bishop B080 — Phase 3 page 5 of 6 — Beacon Run Creator*
*Story-first. Narrative verbs. Design heuristics as tooltips.*
*FOR THE KEEP!*
