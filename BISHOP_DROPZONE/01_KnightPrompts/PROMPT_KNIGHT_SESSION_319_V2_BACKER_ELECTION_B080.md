# KNIGHT SESSION 319 — V2 Backer Election (AppShell)
## Bishop B080 | April 5, 2026 | Phase 4 page 6 of 6 (CLOSES Community & Governance)

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_37_V2_PAGE_DESIGN_SPECS_PHASE_3C_PRODUCT_SPEC.md` § 1
**Depends on**: K294 Foundation. Existing `BackerElectionPage` present.
**Tracker row**: `Backer Election` (B37 batch)

---

## PAGE PURPOSE

Give members a clear, serious, trustworthy place to review proposals, stake Marks, cast votes, understand cooperative governance. Civic ritual, NOT financialized.

## ROUTE

`/backer-election` (AppShell). Enhances existing page.

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Cooperative Governance"
- **Headline**: "Vote on what the platform builds next"
- **Body**: "Backer Elections turn member judgment into platform direction. Members review proposals, stake Marks for voting weight, and participate in a governance ritual that feels civic, accountable, and legible rather than financialized."
- **Primary CTA**: "Review Active Proposals"
- **Secondary CTA**: "How Marks-Weighted Voting Works"
- **Proof strip**: "Live elections" · "turnout visibility" · "proposal deadlines" · "member-submitted measures"

## SECTION FLOW

1. Hero (with live election count + nearest deadline)
2. `OpenProposalsList` — status, category, countdown, turnout
3. `ProposalDetailWorkspace` (opens in place)
4. `MarksStakingPanel` — stake-to-vote mechanic
5. `VotingWorkspace` — cast vote
6. `TurnoutLedger` — visible turnout numbers
7. `HowVotingWorksExplainer` — Marks-weighted explanation
8. `MemberProposalSubmissionForm`

## CRITICAL DESIGN RULES

- **Civic ritual aesthetic**, NOT crypto / DAO / financial
- **Marks-weighted voting**: stake visible, weight visible, NEVER buy-votes framing
- **Turnout always visible** — proposals show live participation numbers
- **Countdown timers neutral color**, NEVER red
- **Member-submitted measures** promoted as first-class, not buried
- NEVER: "profit", "investment", "equity", "dividend", "ROI", "yield"

## COMPONENTS (build in `platform/src/components/v2/backer-election/`)

- `ProposalCard.tsx` — status + category + countdown + turnout
- `OpenProposalsList.tsx`
- `ProposalDetailWorkspace.tsx`
- `MarksStakingPanel.tsx` — stake amount, resulting vote weight
- `VotingWorkspace.tsx` — cast ballot with "As You Wish" confirm
- `TurnoutLedger.tsx` — live turnout display
- `HowVotingWorksExplainer.tsx` — educational module
- `MemberProposalSubmissionForm.tsx`

## PROPOSAL CARD FIELDS

- Title + category chip
- Status (Open / Under Review / Closed)
- Countdown to deadline (neutral color)
- Turnout count + percentage
- Brief description
- "Review Proposal" action

## STAKING FLOW

- Show member's current available Marks
- Show proposed stake amount
- Show resulting vote weight
- "As You Wish" solemn confirmation before stake locks

## MOBILE

- Single-column proposal list
- Proposal detail as drawer / full-screen
- Staking panel stacked
- StickyMobileCTA: "Review Active Proposals"

## DATA

- Use existing backer election / governance tables (`proposals`, `votes`, `marks_stakes`)
- Turnout computed live from `votes` table

## BANNED (pre-completion check)

- NO crypto / DAO visual language
- NO financial-returns framing
- NO "yield / ROI / profit / dividend / equity / invest"
- NO buy-votes framing
- NO red countdown timers
- NO burying member-submitted measures
- NO LLC / CEO language
- NO demographic intake

## ACCEPTANCE

- [ ] Route `/backer-election` enhances existing page
- [ ] Hero copy matches spec EXACTLY
- [ ] Open proposals show status + countdown + turnout live
- [ ] Marks staking panel shows stake → weight clearly
- [ ] Voting confirmed via "As You Wish" stamp
- [ ] Turnout ledger visible per proposal
- [ ] How Voting Works explainer present and legible
- [ ] Member proposal submission form accessible
- [ ] `data-tour-target="backer-election"` anchor placed
- [ ] Mobile: single-col, drawer-detail, StickyMobileCTA
- [ ] `npm run build` passes
- [ ] Tracker: `assignee='K319'`, `in_progress` → `review`
- [ ] Librarian `update_session` K319
- [ ] Screenshots → `BISHOP_DROPZONE/99_Misc/PHASE_4_VISUAL_REVIEW_B080/`

## DO NOT

- Do not use any financial-returns framing anywhere
- Do not use red countdown timers
- Do not skip the civic-ritual aesthetic
- Do not break existing Marks stake schema

---

*Bishop B080 — Phase 4 page 6 of 6 — Backer Election — CLOSES Community & Governance*
*Civic ritual. Marks-weighted voting. Turnout visible. Member-submitted measures first-class.*
*FOR THE KEEP!*
