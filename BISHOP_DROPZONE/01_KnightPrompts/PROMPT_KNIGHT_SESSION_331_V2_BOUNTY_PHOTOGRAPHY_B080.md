# KNIGHT SESSION 331 — V2 Bounty Photography Dashboard (AppShell)
## Bishop B080 | April 5, 2026 | Phase 6 page 5 of 6

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_37_V2_PAGE_DESIGN_SPECS_PHASE_3C_PRODUCT_SPEC.md` § 6
**Depends on**: K294 Foundation. Innovation #2100 (Bounty Photography Network, zero-storage).
**Tracker row**: `Bounty Photography` (B37 batch)

---

## PAGE PURPOSE

Cooperative work dashboard for photographers — find local shoots, manage assignments, submit social-post links (NOT file uploads), track earnings. Zero-storage model.

## ROUTE

`/bounty-photography` (AppShell). Post-auth.

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Bounty Photography"
- **Headline**: "Find local shoots, deliver proof, keep the work human"
- **Body**: "This dashboard helps photographers discover nearby bounties, manage active assignments, submit social-post links instead of uploads, and track earnings in a workflow designed to feel cooperative rather than extractive."
- **Primary CTA**: "View Available Bounties"
- **Secondary CTA**: "My Active Assignments"
- **Proof strip**: "Zero-storage model" · "Social-post proof" · "Local bounties"

## SECTION FLOW

1. Hero
2. `AvailableBountiesMap` — nearby bounties by radius
3. `BountyCard` list with claim flow
4. `ActiveAssignmentsPanel`
5. `ProofSubmissionFlow` — SOCIAL POST LINK only, NOT file upload
6. `EarningsTracker`
7. `PhotographerProfileSummary`

## CRITICAL DESIGN RULES

- **ZERO-STORAGE MODEL** — no image uploads to platform. Photographer posts to social (IG/X/public) and submits LINK.
- **Dual-channel proof**: link + optional merchant confirmation
- **Local bounties prioritized** by photographer location
- **Cooperative framing** — "deliver proof" / "keep the work human", never gig-economy extraction language

## COMPONENTS (build in `platform/src/components/v2/bounty-photography/`)

- `AvailableBountiesMap.tsx`
- `BountyCard.tsx`
- `ActiveAssignmentsPanel.tsx`
- `ProofSubmissionFlow.tsx` (link-only, NO uploads)
- `EarningsTracker.tsx`
- `PhotographerProfileSummary.tsx`

## MOBILE

- Map full-width, swipe to bounty cards below
- Proof submission full-screen
- StickyMobileCTA: "View Available Bounties"

## DATA

- Existing bounty photography tables (per #2100)

## BANNED

- NO file/image uploads (zero-storage model is canon)
- NO gig-economy extractive framing
- NO star ratings
- NO red states
- NO "upgrade/premium/unlock"
- NO LLC / CEO language

## ACCEPTANCE

- [ ] Route `/bounty-photography` wired in AppSidebar
- [ ] Hero copy matches spec EXACTLY
- [ ] Map shows local bounties by radius
- [ ] Proof submission = SOCIAL LINK ONLY (no file upload UI)
- [ ] Earnings tracker shows work history
- [ ] Cooperative framing throughout
- [ ] `data-tour-target="bounty-photography"` + `data-xray-id` anchors
- [ ] `npm run build` passes; tracker K331 review; Librarian logged

## DO NOT

- Do not add file upload anywhere (zero-storage canon)
- Do not use gig-economy language
- Do not rate photographers with stars

---

*Bishop B080 — Phase 6 page 5 of 6 — Bounty Photography*
*Zero-storage. Social link proof. Cooperative framing. Local bounties.*
*FOR THE KEEP!*
