# KNIGHT SESSION 328 — V2 Content Shield (AppShell)
## Bishop B080 | April 5, 2026 | Phase 6 page 2 of 6

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_37_V2_PAGE_DESIGN_SPECS_PHASE_3C_PRODUCT_SPEC.md` § 2
**Depends on**: K294 Foundation. Existing defense/moderation tables.
**Tracker row**: `Content Shield` (B37 batch)

---

## PAGE PURPOSE

Transparent, fair, role-aware place for members to report harmful content, track case progress, and understand the platform's defense system. Protect commons without suspect-treatment.

## ROUTE

`/content-shield` (AppShell). Post-auth.

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Safety and Defense"
- **Headline**: "Protect the commons without treating everyone like a suspect"
- **Body**: "Content Shield gives members a respectful path to report problems, follow case status, and understand how automated review, community flags, steward judgment, and founder override work together."
- **Primary CTA**: "Report an Issue"
- **Secondary CTA**: "View My Cases"
- **Proof strip**: "Automated review" · "Community flags" · "Steward judgment" · "Founder override"

## SECTION FLOW

1. Hero
2. `ReportIssueFlow` — respectful, category-aware report wizard
3. `MyCasesPanel` — status tracking for member's reports
4. `DefenseSystemExplainer` — 4-layer system visible to all
5. `CommunityFlagsFeed` (for stewards/admins)
6. `ActiveModerationQueue` (role-gated)

## CRITICAL DESIGN RULES

- **Respectful reporting path** — no accusatory framing
- **4-layer defense visible**: Automated review / Community flags / Steward judgment / Founder override
- **Role-aware surfaces** — members see their own cases; stewards see queue
- **Status tracking** = member always knows where their case stands

## COMPONENTS (build in `platform/src/components/v2/content-shield/`)

- `ReportIssueFlow.tsx` — multi-step report wizard
- `MyCasesPanel.tsx` — member case list + status
- `DefenseSystemExplainer.tsx` — 4-layer visualization
- `CommunityFlagsFeed.tsx` (steward-gated)
- `ActiveModerationQueue.tsx` (steward/admin-gated)
- `CaseStatusBadge.tsx`

## MOBILE

- Single-column flow
- Report wizard full-screen per step
- StickyMobileCTA: "Report an Issue"

## BANNED

- NO accusatory copy
- NO treating all members as suspects
- NO hidden decision-making (members see status always)
- NO red dystopian imagery
- NO "upgrade/premium/unlock"
- NO LLC / CEO / invest language

## ACCEPTANCE

- [ ] Route `/content-shield` wired in AppSidebar
- [ ] Hero copy matches spec EXACTLY
- [ ] 4-layer defense system visually explained
- [ ] Report flow is respectful + category-aware
- [ ] My Cases panel shows status with transparency
- [ ] Steward/admin surfaces role-gated
- [ ] `data-tour-target="content-shield"` + `data-xray-id` anchors
- [ ] `npm run build` passes; tracker K328 review; Librarian logged

## DO NOT

- Do not expose steward queue to regular members
- Do not use red/dystopian framing
- Do not skip status transparency

---

*Bishop B080 — Phase 6 page 2 of 6 — Content Shield*
*Respectful reporting. 4-layer defense visible. Role-aware.*
*FOR THE KEEP!*
