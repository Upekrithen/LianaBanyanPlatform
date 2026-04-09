# KNIGHT SESSION 318 — V2 Star Chamber (AppShell)
## Bishop B080 | April 5, 2026 | Phase 4 page 5 of 6

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_31_MASTER_DESIGN_PACKET_B057.md` § 5
**Depends on**: K294 Foundation. Star Chamber system LIVE (existing `/star-chamber` page).
**Tracker row**: `Star Chamber` (B31 batch)

---

## PAGE PURPOSE

Trustworthy AI dispute resolution. Arbitration chamber, NOT courtroom fantasy, NOT dystopian spectacle.

## ROUTE

`/star-chamber` (AppShell). Enhances existing page.

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Star Chamber"
- **Headline**: "Structured review for hard cases."
- **Body**: "Star Chamber brings four distinct AI judges into one disciplined review process, with clear reasoning paths, escalation context, and exceptional-case founder override."
- **Primary CTA**: "Open active cases"
- **Secondary CTA**: "How review works"
- **Proof strip**: "Oracle, Morpheus, Red Queen, Dredd" · "Claude + Perplexity backends" · "Areopagus escalation" · "founder override for exceptional cases"

## SECTION FLOW

1. Hero + process overview
2. `FourJudgeExplainer` — Oracle · Morpheus · Red Queen · Dredd
3. `CaseQueue` — active cases grid
4. `ActiveCaseWorkspace` — opens case in-place
5. **`JudgeReasoningMatrix`** — questions left, judge responses across columns, convergence/divergence visible
6. `EscalationLadder` — Areopagus escalation path
7. `FinalRulingCard` + `AuditTrail`

## CRITICAL DESIGN RULES

- **Arbitration panel aesthetic**. Process legitimacy first.
- **No judge avatars**. No AI oracle theatrics. Solemn but not ominous.
- **Reasoning matrix**: 4 columns (one per judge), rows are questions, convergence/divergence visible at a glance.
- **Founder override** = exceptional-path annotation with timestamp, NOT dominant control. Rendered as a distinct annotation layer.
- **Areopagus escalation** = visible ladder, not buried.

## COMPONENTS (build in `platform/src/components/v2/star-chamber/`)

- `FourJudgeExplainer.tsx` — 4 judges: Oracle/Morpheus/RedQueen/Dredd
- `CaseQueueGrid.tsx`
- `CaseRow.tsx` — single case preview
- `ActiveCaseWorkspace.tsx`
- `JudgeReasoningMatrix.tsx` — 4-column reasoning grid with convergence indicators
- `EscalationLadder.tsx` — Areopagus path display
- `FinalRulingCard.tsx`
- `AuditTrailTable.tsx`

## FOUR JUDGES (canonical names — do NOT rename)

- **Oracle** (Claude backend)
- **Morpheus** (Claude backend)
- **Red Queen** (Perplexity backend)
- **Dredd** (Perplexity backend)

## MOBILE

- Case queue as stacked cards
- Reasoning matrix scrolls horizontally (4 columns don't fit vertically)
- Escalation ladder as vertical stepper
- StickyMobileCTA: "Open active cases"

## DATA

- Existing Star Chamber schema (`star_chamber_cases`, `star_chamber_verdicts`, `round_tables`)
- Judge responses from existing edge function `star-chamber-analyze`

## BANNED (pre-completion check)

- NO judge avatars / mascots
- NO courtroom theatrics
- NO dystopian imagery
- NO gamified voting
- NO exposing founder override as dominant control
- NO red states (even for verdicts — use amber for escalation)
- NO "upgrade/premium/unlock"
- NO LLC / CEO / invest language

## ACCEPTANCE

- [ ] Route `/star-chamber` enhances existing page
- [ ] Hero copy matches spec EXACTLY
- [ ] 4 judges named correctly (Oracle/Morpheus/Red Queen/Dredd)
- [ ] Reasoning matrix shows convergence/divergence at a glance
- [ ] Founder override is annotation layer, NOT dominant control
- [ ] Escalation ladder visible as discrete section
- [ ] Audit trail complete
- [ ] Solemn-not-ominous aesthetic maintained
- [ ] `data-tour-target="star-chamber"` anchor placed
- [ ] Mobile: stacked cards, horizontal-scroll matrix, StickyMobileCTA
- [ ] `npm run build` passes
- [ ] Tracker: `assignee='K318'`, `in_progress` → `review`
- [ ] Librarian `update_session` K318
- [ ] Screenshots → `BISHOP_DROPZONE/99_Misc/PHASE_4_VISUAL_REVIEW_B080/`

## DO NOT

- Do not rename the four judges
- Do not add judge avatars
- Do not make founder override dominant
- Do not use courtroom / dystopian visual language

---

*Bishop B080 — Phase 4 page 5 of 6 — Star Chamber*
*Arbitration panel aesthetic. Four judges. Reasoning matrix. Areopagus escalation.*
*FOR THE KEEP!*
