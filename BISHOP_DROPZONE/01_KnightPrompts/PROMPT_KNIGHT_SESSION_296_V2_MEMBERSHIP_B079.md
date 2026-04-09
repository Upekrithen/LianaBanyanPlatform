# KNIGHT SESSION 296 — V2 Membership Page (FocusShell)
## Bishop B079 | April 4, 2026 | PHASE 1 of V2 Redesign

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_30_MASTER_DESIGN_PACKET_B057.md` § 1
**Depends on**: K294 Foundation primitives
**Tracker row**: `Membership` (B30 batch)

---

## PAGE PURPOSE
Convert visitor to member. Single low-friction decision with structural legitimacy. **Conviction page, NOT pricing matrix.**

## ROUTE
`/membership` (FocusShell)

## HERO SPEC (copy EXACTLY)
- **Eyebrow**: "Membership for builders, creators, and operators."
- **Headline**: "Join the platform for $5 a year."
- **Body**: "Become a member of Liana Banyan CORPORATION and move from watching to participating across commerce, creation, and cooperative tools."
- **Primary CTA**: "Join for $5/year." → auth/join flow
- **Secondary CTA**: "Preview membership terms." → `/terms/membership`
- **Proof strip**: "$5/year membership" · "83.3% creator keeps" · "No demographic data required" · "Founder terms aligned."

## SECTION FLOW
1. Hero (FocusShell)
2. **What membership unlocks** — single column of capabilities, NOT a feature-comparison grid
3. **Why $5 matters** — the structural bylaw story, one column
4. **How creator economics work** — 83.3% / Cost+20% explained with ONE worked example
5. **Terms and trust** — plain-language membership promises
6. **Final CTA + FAQ** — accordion FAQ, repeat of primary CTA

## DESIGN INSTRUCTION
- ONE offer, ONE price, ONE promise
- NO plan comparison tables
- NO upsell framing
- NO decorative pricing-table flourish
- Single membership card — not three tiers

## MOBILE
- Proof chips swipeable
- Sticky bottom CTA ("Join for $5/year")
- FAQ as accordion (collapsed by default)

## COMPONENTS TO USE (from K294)
- `<FocusShell>`
- `<Hero variant="focus">`
- `<ProofStrip>`
- `<StickyMobileCTA>`

## NEW COMPONENTS
- `MembershipCapabilities.tsx` — single-column capability list
- `CreatorEconomicsExample.tsx` — one worked Cost+20% / 83.3% example
- `MembershipFAQ.tsx` — accordion

## BANNED
- No "premium/pro/plus/enterprise" tiers
- No "upgrade"
- No "equity/shares/dividends/ROI/invest"
- No "LLC", must say "Liana Banyan CORPORATION"
- No "CEO", must say "Founder & General Manager"
- No demographic fields
- No comparison tables

## ACCEPTANCE
- [ ] Route `/membership` wired
- [ ] Hero copy matches spec exactly
- [ ] ONE membership card (no tiers)
- [ ] $5/year appears in hero + one trust anchor only (not every card)
- [ ] 83.3% / Cost+20% worked example renders
- [ ] `data-tour-target="membership"` on hero
- [ ] StickyMobileCTA visible on mobile after scroll
- [ ] `npm run build` passes
- [ ] Tracker updated (`in_progress` → `review`)
- [ ] Screenshots at desktop + mobile

## DO NOT
- Do not wire actual Stripe checkout (that's a separate auth session)
- Do not add plan selectors
- Do not mention LB Card, Subscription Channels, or other paid add-ons here

---

*Bishop B079 — Phase 1 page 2 of 6*
*FOR THE KEEP!*
