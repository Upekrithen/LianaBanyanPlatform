# KNIGHT SESSION 326 — V2 Political Expedition (AppShell)
## Bishop B080 | April 5, 2026 | Phase 5 page 6 of 6 (CLOSES Reputation & Production)

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_32_MASTER_DESIGN_PACKET_B057.md` § 5
**Depends on**: K294 Foundation. Political Expedition system LIVE.
**Tracker row**: `Political Expedition` (B32 batch)

---

## PAGE PURPOSE

Turn "I care about co-ops and food" into: which bills, which reps, one effective letter. Issue → narrative → letter studio tuned for issue, district, bill.

## ROUTE

`/political-expedition` (AppShell).

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Don't just follow politics—enter the story"
- **Headline**: "From confused scroll to one letter that lands where it counts."
- **Body**: "Starts from your concern, narrates you into the legislative story, then sits you down in a letter studio tuned for your issue, district, and bill."
- **Primary CTA**: "Pick my issue"
- **Secondary CTA**: "Browse active bills"
- **Utility strip**: "Issue cards" · "Live chapters" · "Letter studio"

## SECTION FLOW

1. Hero
2. `IssuePicker` — 5 issue categories (cooperatives, food security, housing, small business, transportation)
3. `LegislativeStoryPanel` — "Current chapter" narrative snippets showing live legislative tension
4. `ActiveBillsList` — bills relevant to chosen issue/district
5. `LetterStudio` — issue/district/bill-aware letter editor with micro-notes
6. `TemplatePicker` — 5 templates (one per issue category)
7. `SubmissionFlow` — recipient selection, review, send

## CRITICAL DESIGN RULES

- **"Current chapter" narrative snippets** on issue cards show live legislative tension
- **Letter editor highlights sections with micro-notes** teaching argumentative structure as members write
- **5 templates**: cooperatives, food security, housing, small business, transportation
- Templates are starting points, not mandates
- **Issue → district → bill** flow is canonical, not a shortcut

## COMPONENTS (build in `platform/src/components/v2/political-expedition/`)

- `IssuePicker.tsx` — 5 category cards
- `IssueCard.tsx` — with "Current chapter" snippet
- `LegislativeStoryPanel.tsx`
- `ActiveBillsList.tsx` + `BillCard.tsx`
- `LetterStudio.tsx` — editor with argumentative micro-notes
- `MicroNote.tsx` — inline teaching callout
- `TemplatePicker.tsx`
- `SubmissionFlow.tsx`

## MOBILE

- Single-column flow
- Letter studio full-screen
- StickyMobileCTA: contextual per step ("Continue" / "Review" / "Send")

## DATA

- Existing political expedition schema (issues, bills, letter templates, reps lookup)
- District lookup from member profile zip code

## BANNED

- NO partisan framing on issue cards
- NO "urgent action" manipulation
- NO ghost-written full letters (templates are starters, not substitutes for member voice)
- NO red states
- NO "upgrade/premium/unlock"
- NO LLC / CEO / invest language

## ACCEPTANCE

- [ ] Route `/political-expedition` wired in AppSidebar
- [ ] Hero copy matches spec EXACTLY
- [ ] 5 issue categories with "Current chapter" snippets
- [ ] Letter studio shows micro-notes teaching argumentative structure
- [ ] 5 templates (one per category) functional
- [ ] Submission flow completes end-to-end
- [ ] `data-tour-target="political-expedition"` + `data-xray-id` anchors
- [ ] `npm run build` passes; tracker K326 review; Librarian logged

## DO NOT

- Do not auto-submit letters
- Do not use partisan labels on issues
- Do not ghost-write full letters for members

---

*Bishop B080 — Phase 5 page 6 of 6 — Political Expedition — CLOSES Phase 5*
*FOR THE KEEP!*
