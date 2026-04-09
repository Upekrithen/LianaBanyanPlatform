# KNIGHT SESSION 295 — V2 Welcome Gate (FocusShell)
## Bishop B079 | April 4, 2026 | PHASE 1 of V2 Redesign

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_30_MASTER_DESIGN_PACKET_B057.md` § 2
**Depends on**: K294 Foundation primitives
**Tracker row**: `Welcome Gate` (B30 batch)

---

## PAGE PURPOSE
Turn first-visit confusion into orientation. One confident next action.

## ROUTE
`/welcome` (FocusShell). Default landing for unauthenticated visitors who hit the root domain.

## HERO SPEC (copy EXACTLY)
- **Eyebrow**: "A working platform, not a brochure."
- **Headline**: "Start where you want to build."
- **Body**: "Explore a cooperative platform for commerce, creation, production, and local coordination—then choose your path when you're ready."
- **Primary CTA**: "Explore the pathways." → `/cold-start`
- **Secondary CTA**: "Browse as a guest." → `/ghost-browse`
- **Proof strip**: "6 starting pathways" · "$5/year membership" · "See before you join" · "No demographic intake."

## SECTION FLOW
1. Hero (FocusShell, `variant="focus"`)
2. Visual pathway map — 6 paths (Food, Manufacturing, Service, Local Business, Guild, Tribe)
3. How the platform works — 3 steps
4. Why people stay — testimonial/quote band
5. Start with one path — split CTA (repeat of primary + secondary)

## DESIGN INSTRUCTION
Museum entrance, not dashboard. Product-forward like Linear, but wider frame for multi-mode platform. Calm typography, strong spacing, no dashboard density.

## MOBILE
- Pathway map collapses to vertical stack of 6 cards
- StickyMobileCTA pinned after first scroll (primary = "Explore the pathways")
- Proof strip swipeable

## COMPONENTS TO USE (from K294)
- `<FocusShell>` wrapper
- `<Hero variant="focus" ...>` for the top section
- `<ProofStrip>` inside hero
- `<StickyMobileCTA>` for mobile
- `useTourTarget('welcome')` on hero (for K330 Guided Tour anchor)

## NEW COMPONENTS
- `PathwayMapVisual.tsx` — 6-path visual (SVG/CSS grid, no heavy animation)
- `HowItWorks3Step.tsx` — 3 labelled steps
- `WhyPeopleStay.tsx` — 2-3 short quotes

## BANNED (pre-completion check)
- No "upgrade/premium/unlock/subscribe"
- No "equity/shares/dividends/ROI/invest"
- No demographic fields, no sign-up form on this page
- No "CEO" or "LLC"
- No red states

## ACCEPTANCE
- [ ] Route `/welcome` wired in `App.tsx`
- [ ] Hero copy matches spec exactly (verify via preview_inspect)
- [ ] 6 pathway cards render at desktop 3x2, mobile 1x6
- [ ] StickyMobileCTA appears after scroll on mobile viewport
- [ ] `data-tour-target="welcome"` on hero
- [ ] `npm run build` passes
- [ ] `v2_redesign_tracker`: set `status='in_progress'`, `assignee='K295'` on start; `status='review'` on end
- [ ] Proof via preview_screenshot at desktop + mobile widths

## DO NOT
- Do not build the actual 6 pathway destinations (just link to `/cold-start`)
- Do not add auth flows — this is pre-auth
- Do not embed pricing details (that's Membership page, K296)

---

*Bishop B079 — Phase 1 page 1 of 6*
*FOR THE KEEP!*
