# KNIGHT SESSION 332 — V2 Guided Tour Overlay (AppShell component)
## Bishop B080 | April 5, 2026 | Phase 6 page 6 of 6 (CLOSES V2 REDESIGN — FINAL SESSION)

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_36_MASTER_DESIGN_PACKET_B058.md` § PAGE 5
**Depends on**: K294 Foundation. **ALL V2 pages K295-K331** with `data-tour-target` attributes. K320 X-Ray sweep ideally landed first.
**Tracker row**: `Guided Tour Overlay` (B36 batch)

---

## PAGE PURPOSE

Cross-cutting guided tour OVERLAY (NOT standalone page). State-machine-driven tour that anchors to `data-tour-target` attributes on V2 pages already shipped. Last session because it depends on every other V2 page.

## INTEGRATION TYPE

**NOT a page.** An overlay component mounted globally that reads route and tour-target anchors.

## HERO / TRIGGER SPEC

- Trigger: "Take the Grand Tour" from Denken menu, or first-visit auto-prompt
- Intro modal: "Want a guided walk through Liana Banyan?" with "Start" / "Skip" / "Remind me later"

## ARCHITECTURE (FULLY SPEC'D BY PAWN)

### State Machine: `guidedTourReducer`

Modes: `idle` → `intro` → `running` → `completed` / `skipped`

### Persistence

`useGuidedTour` hook with localStorage key `lb_guided_tour_state_v1`

### Tour Anchors

Each stop references a `data-tour-target="..."` attribute placed on V2 pages during K295-K331.

Example anchors already present:
- `data-tour-target="welcome-gate"`
- `data-tour-target="wallet"`
- `data-tour-target="cold-start"`
- `data-tour-target="captain"`
- `data-tour-target="marketplace"`
- `data-tour-target="cephas"`
- `data-tour-target="calendar"`
- `data-tour-target="storefront-builder"`
- `data-tour-target="cue-card-creator"`
- `data-tour-target="dispatch-compose"`
- `data-tour-target="treasure-map-builder"`
- `data-tour-target="beacon-run-creator"`
- `data-tour-target="canister-configurator"`
- `data-tour-target="family-table"`
- `data-tour-target="crew-call"`
- `data-tour-target="tribes"`
- `data-tour-target="guilds"`
- `data-tour-target="star-chamber"`
- `data-tour-target="backer-election"`
- `data-tour-target="adapt"`
- `data-tour-target="design-democracy"`
- `data-tour-target="wheels"`
- `data-tour-target="housing"`
- `data-tour-target="pioneers"`
- `data-tour-target="political-expedition"`
- `data-tour-target="lb-card"`
- `data-tour-target="content-shield"`
- `data-tour-target="subscription-channel"`
- `data-tour-target="coalitions"`
- `data-tour-target="bounty-photography"`

## COMPONENTS (build in `platform/src/components/v2/guided-tour/`)

- `GuidedTourOverlay.tsx` — mounted globally, reads route + state
- `TourIntroModal.tsx`
- `TourStopTooltip.tsx` — positioned over current anchor
- `TourProgressIndicator.tsx` — step N of M
- `TourControls.tsx` — Next / Back / Skip / End

## STATE MACHINE (from Pawn spec)

```ts
type TourMode = 'idle' | 'intro' | 'running' | 'completed' | 'skipped';

type TourState = {
  mode: TourMode;
  currentStopIndex: number;
  stops: TourStop[];
};

type TourAction =
  | { type: 'OPEN_INTRO' }
  | { type: 'START' }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SKIP' }
  | { type: 'COMPLETE' }
  | { type: 'RESET' };
```

## HOOK: `useGuidedTour`

- Reads from localStorage `lb_guided_tour_state_v1`
- Exposes: `mode`, `currentStop`, `next()`, `back()`, `skip()`, `start()`, `reset()`
- Persists state on every transition

## CRITICAL DESIGN RULES

- **OVERLAY, not standalone page**
- **Respects `data-tour-target` anchors** built into every V2 page
- **Skippable at any time** — no dark patterns
- **Persistent state** via localStorage (`lb_guided_tour_state_v1`)
- **First-visit auto-prompt** (once) — "Remind me later" available

## ROUTE INTEGRATION

- Mount `<GuidedTourOverlay />` globally in `App.tsx` under auth provider
- Tour navigation uses `react-router navigate()` to traverse between V2 pages
- Each stop = `{ route, targetRef, title, body }`

## MOBILE

- Tooltip adapts to mobile viewport
- Controls bottom-anchored (thumb reach)
- Intro modal full-screen

## BANNED

- NO dark patterns (skip always available)
- NO tour that blocks pages outside V2 surfaces
- NO auto-replay after skip
- NO "upgrade/premium/unlock" language
- NO LLC / CEO language

## ACCEPTANCE

- [ ] `<GuidedTourOverlay />` mounted globally in `App.tsx`
- [ ] `useGuidedTour` hook with localStorage persistence (`lb_guided_tour_state_v1`)
- [ ] Tour traverses all V2 pages via `data-tour-target` anchors
- [ ] Intro modal appears on first visit (then respects localStorage)
- [ ] Skip / Back / Next / End all work
- [ ] State machine modes: idle → intro → running → completed/skipped
- [ ] `data-xray-id="guided-tour-overlay"` on the overlay wrapper
- [ ] `npm run build` passes; tracker K332 review; Librarian logged

## DO NOT

- Do not make tour unskippable
- Do not persist tour step through page navigation without localStorage
- Do not re-prompt skipped tour automatically
- Do not reference tour-target anchors that don't exist yet — verify against built pages

---

*Bishop B080 — Phase 6 page 6 of 6 — Guided Tour Overlay — CLOSES V2 REDESIGN*
*State machine. localStorage persistence. Cross-cutting overlay. All 31 V2 anchors traversed.*
*FOR THE KEEP!*
