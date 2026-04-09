# KNIGHT SESSION 309 — V2 Cue Card Creator (AppShell)
## Bishop B080 | April 5, 2026 | Phase 3 page 2 of 6

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_31_MASTER_DESIGN_PACKET_B057.md` § 2
**Depends on**: K294 Foundation primitives. K116 Cue Cards system already LIVE.
**Tracker row**: `Cue Card Creator` (B31 batch)

---

## PAGE PURPOSE

Quick design + share of personalized outreach cards. Speed-to-confidence, not maximal freedom. Canva-lite for relationship outreach.

## ROUTE

`/cue-cards/create` (AppShell). Post-auth, member-facing. Existing index at `/cue-cards` (K116) stays put.

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Cue Card Creator"
- **Headline**: "Make an invite card that feels like you."
- **Body**: "Build a shareable outreach card tied to your profile, storefront, or guild, then send it by link or email with simple one-level attribution built in."
- **Primary CTA**: "Create new card"
- **Secondary CTA**: "Use a starter layout"
- **Proof strip**: "Profile, storefront, or guild links" · "one-level attribution only" · "email or shareable link"

## SECTION FLOW

1. Hero (AppShell variant)
2. **TemplatePicker** (opens first — NOT blank canvas)
3. **CardEditorCanvas** (two-pane desktop: preview left, controls right)
4. **ContentPanel** (right pane: link target, copy fields, contact info)
5. **VisualCustomization** (right pane: color/type/image — simple, bounded)
6. **ShareStep** (email vs link, recipient entry)
7. **AttributionConfirmation** (quiet trust note)

## CRITICAL DESIGN RULES

- **OPENS WITH TEMPLATES**, not blank canvas
- Templates ARE the quality floor (starter layouts only, no freeform chaos)
- **ONE-LEVEL ATTRIBUTION ONLY** — responses to this card attribute to the sender. Period. No chains, no tiers, no "downstream", no gamification.
- Quiet trust note on attribution: "Responses to this card are attributed to you only."
- NEVER mention downstream, chains, MLM mechanics, referral tiers, rewards-for-referrals

## COMPONENTS (build in `platform/src/components/v2/cue-cards/`)

- `TemplatePicker.tsx` — starter layout grid (6-8 templates)
- `CardEditorCanvas.tsx` — two-pane wrapper
- `CardPreviewPane.tsx` — live preview (left on desktop)
- `CardControlsPane.tsx` — controls container (right on desktop)
- `ContentPanel.tsx` — link target selector (profile/storefront/guild), copy fields
- `VisualCustomization.tsx` — bounded style controls
- `ShareStep.tsx` — email/link selector, recipient entry
- `AttributionConfirmation.tsx` — trust note + send confirmation

## TEMPLATES (starter layouts)

6-8 templates minimum. Must include:
- Profile invite
- Storefront welcome
- Guild introduction
- Tribe seed
- Project pledge ask
- Family Table invite

Each template:
- Pre-filled structure (headline, body, CTA slot)
- "Recommended for:" tag
- Editable fields highlighted on load

## MOBILE

- Template-first, stacked workflow
- Advanced styling behind "Adjust design" drawer
- Preview toggles via button (no persistent two-pane on mobile)
- StickyMobileCTA: contextual ("Continue" / "Send card")

## ATTRIBUTION WIRING

- Existing K116 Cue Card attribution system stays the single source of truth
- This page writes to the SAME `cue_cards` table that K116 reads
- One-level attribution is enforced at DB level already — confirm existing constraint, do not re-implement
- Display attribution as a quiet note ONLY, never as a gamified feature

## BANNED (pre-completion check)

- NO blank canvas opening state
- NO chains / tiers / downstream / MLM / multi-level attribution language
- NO gamification of referrals
- NO "earn rewards", "level up", "climb the ranks"
- NO "upgrade/premium/unlock"
- NO red states
- NO LLC / CEO / invest language
- NO demographic intake

## ACCEPTANCE

- [ ] Route `/cue-cards/create` wired in AppShell sidebar (under Cue Cards parent)
- [ ] Hero copy matches spec EXACTLY
- [ ] Template picker opens first (no blank canvas)
- [ ] Two-pane desktop layout (preview left, controls right)
- [ ] Share step offers email + link, recipient entry works
- [ ] Attribution confirmation shows quiet trust note
- [ ] `data-tour-target="cue-card-creator"` anchor placed
- [ ] Mobile: template-first, "Adjust design" drawer, StickyMobileCTA
- [ ] `npm run build` passes
- [ ] Tracker: `assignee='K309'`, `in_progress` → `review`
- [ ] Librarian `update_session` K309
- [ ] Screenshots → `BISHOP_DROPZONE/99_Misc/PHASE_3_VISUAL_REVIEW_B080/`

## DO NOT

- Do not build real email sending (stub to existing `send-transactional-email` edge function)
- Do not create new cue card DB tables — use existing K116 schema
- Do not introduce multi-level attribution anywhere
- Do not add AI-generated copy (static templates only)

---

*Bishop B080 — Phase 3 page 2 of 6 — Cue Card Creator*
*Canva-lite. Templates as floor. One-level attribution. Quiet trust note.*
*FOR THE KEEP!*
