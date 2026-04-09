# KNIGHT SESSION 297 — V2 Ghost Browse (FocusShell)
## Bishop B079 | April 4, 2026 | PHASE 1 of V2 Redesign

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_30_MASTER_DESIGN_PACKET_B057.md` § 4
**Depends on**: K294 Foundation primitives (especially `InformativeLock`)
**Tracker row**: `Ghost Browse` (B30 batch)

---

## PAGE PURPOSE
Generous preview that invites joining without punishing curiosity. 70% show / 30% soft-lock ratio.

## ROUTE
`/ghost-browse` (FocusShell). Acts as a preview shell wrapper — can compose sub-routes like `/ghost-browse/marketplace`.

## HERO SPEC (copy EXACTLY)
- **Eyebrow**: "Preview mode."
- **Headline**: "Look around before you join."
- **Body**: "Browse the platform, inspect pathways, and see how participation works. Join when you're ready to do more than observe."
- **Primary CTA**: "Join for $5/year." → `/membership`
- **Secondary CTA**: "Continue browsing." → scroll / next section
- **Proof strip**: "Open preview access" · "Participation requires membership" · "$5/year" · "No demographic intake."

## SECTION FLOW
1. Hero (FocusShell)
2. **Persistent preview-mode banner** at top of viewport (pinned via `position: sticky`)
3. **Public content surfaces** — marketplace previews, pathway cards, Cephas publication snippets (read-only)
4. **Soft-locked action thresholds** — where an action requires membership, render `<InformativeLock>` inline
5. **Membership explanation** — compact band linking to `/membership`
6. **Join CTA** — repeat primary

## DESIGN INSTRUCTION
- **70/30 rule**: 70% of content visible, 30% soft-locked at ACTION thresholds only
- Soft-lock triggers: contact creator, claim item, purchase, publish, join workflow
- Lock copy pattern (enforce via `<InformativeLock>`): "Members can respond, launch, and transact here."
- NEVER: "upgrade to unlock premium features"
- Content itself is NOT locked — only actions

## MOBILE
- **Bottom sheet** for locked actions (not repeated modals interrupting flow)
- Persistent "Preview mode" pill fixed to top
- StickyMobileCTA primary = "Join for $5/year"

## COMPONENTS TO USE (from K294)
- `<FocusShell>`
- `<Hero variant="focus">`
- `<ProofStrip>`
- `<InformativeLock action="respond, launch, and transact">`
- `<StickyMobileCTA>`

## NEW COMPONENTS
- `PreviewModeBanner.tsx` — sticky top banner, dismissible-per-session
- `LockedActionBottomSheet.tsx` — mobile sheet for soft-locks

## BANNED
- No "upgrade"
- No "premium"
- No "unlock features"
- No gating content itself (only actions)
- No repeated modal interruptions
- No red/warning styling on locks — locks are informative, not punitive

## ACCEPTANCE
- [ ] Route `/ghost-browse` wired
- [ ] Hero copy matches spec exactly
- [ ] Preview banner persistent and visible on scroll
- [ ] At least 3 `<InformativeLock>` instances in soft-locked sections, all with informative copy
- [ ] Mobile bottom sheet renders for locked actions (not repeated modals)
- [ ] 70/30 show/lock ratio verified
- [ ] `data-tour-target="ghost-browse"` on hero
- [ ] `npm run build` passes
- [ ] Tracker updated (`in_progress` → `review`)
- [ ] Screenshots desktop + mobile + locked-action state

## DO NOT
- Do not require auth to load this page
- Do not lock content reading (only interactive actions)
- Do not replicate the full marketplace here — this is a preview shell, deep marketplace is K304

---

*Bishop B079 — Phase 1 page 3 of 6*
*FOR THE KEEP!*
