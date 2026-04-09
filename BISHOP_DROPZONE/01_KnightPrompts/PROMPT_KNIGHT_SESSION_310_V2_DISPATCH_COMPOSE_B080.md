# KNIGHT SESSION 310 — V2 Dispatch Compose (AppShell) + K288 Access Gating Merge
## Bishop B080 | April 5, 2026 | Phase 3 page 3 of 6

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_32_MASTER_DESIGN_PACKET_B057.md` § 4
**Depends on**: K294 Foundation. K160 Battery Dispatch LIVE. K285/K286/K287/K288 access gating logic lands HERE.
**Tracker row**: `Dispatch Compose` (B32 batch)

---

## PAGE PURPOSE

Quiet room to craft one clear story, then project it across 11 channels. Intent-first, narrative-first composition. Single source of truth for a message; platform variations happen at the edges.

## CRITICAL — SESSION ALSO MERGES K288 GATING

Per K309 V2 plan: **K288 Battery Dispatch access gating was deferred to Dispatch Compose**. This session lands:
- K285 / K286 / K287 / K288 access control logic as a single atomic UI surface on this page
- Gating keys off member role (Creator/Captain/Admin) + active subscription + guild membership

## ROUTE

`/dispatch/compose` (AppShell). Access-gated. Post-auth, Creator+ roles only.

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "One story, many megaphones"
- **Headline**: "Write the message once, then teach it to every channel."
- **Body**: "Starts by asking 'What change are you trying to make?' then helps draft in one canonical place. Platform variations happen around the edges."
- **Primary CTA**: "Start a dispatch"
- **Secondary CTA**: "View queue"
- **Proof strip**: "11 channels" · "One canonical message" · "As You Wish confirmation"

## SECTION FLOW

1. Hero (AppShell variant)
2. **IntentField** — REQUIRED field ABOVE composer: "What change are you trying to make?" placeholder: "Moving members from X to Y"
3. **CanonicalComposer** — dominant card, single editable canonical message
4. **ChannelVariationsPanel** — 11 channel tiles showing edge-variation deltas (NOT full rewrites)
5. **WorkflowBar** — story-lifecycle states (Draft → Review → Scheduled → Dispatched → Archived), NOT object-ID based
6. **AsYouWishConfirmation** — solemn confirmation stamp (NOT a checkbox) before dispatch
7. **QueueSidebar** — collapsible, shows past + pending dispatches

## ACCESS GATING (K285/K286/K287/K288 MERGE)

- Before rendering composer, check:
  - Member role is Creator / Captain / Admin
  - Active membership ($5/year) is current
  - (If guild-scoped dispatch) member is in the guild
- On gate failure: informative lock message (per design doctrine rule 8): "Members with active creator status can compose dispatches here." NEVER punitive.
- Gate state pulls from existing `member_roles` + `memberships` tables; no new tables

## CRITICAL DESIGN RULES

- **Intent field REQUIRED** above composer. Cannot draft without intent.
- **Workflow bar shows STORY lifecycle**, not object IDs. Never show dispatch UUID as primary identifier.
- **MoneyPenny context-aware edits** offered inline (NOT auto-apply): suggestion chips the user approves
- **"As You Wish" stamp** = solemn confirmation UX pattern, NOT a checkbox. Full-screen or modal confirmation with deliberate affordance.
- **Past message recall** via MoneyPenny: "You said something similar on [date]. Want to reference it?"
- Platform variations are EDGES only — word count clipping, tag adjustment, CTA swap. Core message stays canonical.

## COMPONENTS (build in `platform/src/components/v2/dispatch/`)

- `IntentField.tsx` — required intent capture
- `CanonicalComposer.tsx` — single canonical editor
- `ChannelVariationsPanel.tsx` — 11 channel tiles w/ edge deltas
- `ChannelVariationTile.tsx` — individual channel preview
- `WorkflowBar.tsx` — story-lifecycle state display
- `AsYouWishConfirmation.tsx` — solemn stamp confirmation modal
- `QueueSidebar.tsx` — collapsible past+pending list
- `MoneyPennySuggestionChip.tsx` — inline edit suggestion
- `DispatchAccessGate.tsx` — K285-K288 gating wrapper

## 11 CHANNELS (canonical list)

Confirm exact channel list against K160 Battery Dispatch system. Likely includes:
- Email broadcast · SMS broadcast · In-app notification · OOB Auto-Post · Beacon · Treasure Map nudge · Crew Call feed · Guild channel · Tribe channel · Family Table · Helm broadcast

(Verify with K160 code before finalizing tiles.)

## MOBILE

- Single-column: Hero → IntentField → Composer → Channels (collapsed) → Workflow → Confirm
- Queue sidebar drawer, off-canvas
- StickyMobileCTA: "Start a dispatch" → "Continue" → "As You Wish"
- As You Wish confirmation is full-screen on mobile

## BANNED (pre-completion check)

- NO composer without Intent field filled
- NO object-ID primary identifiers in workflow bar
- NO checkbox-style confirmation (solemn stamp pattern required)
- NO auto-apply MoneyPenny edits
- NO punitive lock messaging
- NO "upgrade/premium/unlock"
- NO red states
- NO LLC / CEO / invest language
- NO demographic intake

## ACCEPTANCE

- [ ] Route `/dispatch/compose` wired in AppSidebar (under Battery Dispatch parent)
- [ ] Hero copy matches spec EXACTLY
- [ ] Intent field required, blocks composer until filled
- [ ] Canonical composer is dominant, single source of truth
- [ ] 11 channel tiles render with edge-variation deltas
- [ ] Workflow bar uses story-lifecycle language
- [ ] "As You Wish" confirmation is solemn stamp, not checkbox
- [ ] Access gate (K285-K288 merged) displays informative lock on non-eligible members
- [ ] MoneyPenny suggestion chips render (stubbed if engine not ready)
- [ ] `data-tour-target="dispatch-compose"` anchor placed
- [ ] Mobile: single-column stack, off-canvas queue drawer, StickyMobileCTA
- [ ] `npm run build` passes
- [ ] Tracker: `assignee='K310'`, `in_progress` → `review`
- [ ] Librarian `update_session` K310 — NOTE K285-K288 gating merged here
- [ ] Screenshots → `BISHOP_DROPZONE/99_Misc/PHASE_3_VISUAL_REVIEW_B080/`

## DO NOT

- Do not wire real dispatch sending (stub to existing K160 dispatch edge function)
- Do not build new MoneyPenny engine (stub suggestions)
- Do not create new DB tables — use existing K160 Battery Dispatch schema
- Do not skip the intent field requirement under any circumstance
- Do not revert the "As You Wish" stamp pattern to a simple checkbox

---

*Bishop B080 — Phase 3 page 3 of 6 — Dispatch Compose*
*Merges K285-K288 Battery Dispatch gating as single atomic UI.*
*Intent-first. Canonical message. Solemn confirmation. 11 channel edges.*
*FOR THE KEEP!*
