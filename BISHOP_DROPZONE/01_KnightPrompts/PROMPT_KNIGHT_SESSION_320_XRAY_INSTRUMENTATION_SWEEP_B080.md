# KNIGHT SESSION 320 — X-Ray Instrumentation Sweep Across All V2 Pages
## Bishop B080 | April 5, 2026 | Tooling / Cross-cutting

**Scope**: Add `data-xray-id` attributes to all V2 page landmarks so X-Ray Goggles mode (`XRayOverlay.tsx`) draws cyan dashed outlines + label badges on every V2 surface.

---

## PROBLEM

`XRayOverlay` scans the DOM for `data-xray-id="..."` attributes at runtime. When a member toggles X-Ray Goggles ON via Denken, it draws a cyan dashed outline and a clickable label badge on every element carrying that attribute. Clicking the badge opens a draggable explainer panel with metadata from `xrayGlossary`.

**V2 pages built through K319 have `data-tour-target` attributes but NOT `data-xray-id`.** So when a member activates X-Ray mode on a V2 page, nothing outlines. The system is mounted and working — it just has nothing to annotate.

## YOUR TASK

Add `data-xray-id` attributes to **every landmark section** in **every V2 page + V2 component set** shipped through K319. Pair each ID with a matching glossary entry in `src/data/xrayGlossary.ts` so the explainer panel has something to show.

## SCOPE — PAGES TO INSTRUMENT

All V2 pages shipped K295-K319:

### Phase 1 (FocusShell)
- Welcome Gate (/welcome)
- Membership (/membership)
- Ghost Browse (/ghost-browse)
- HexIsle Landing (/hexisle)
- Red Carpet (/red-carpet)
- Transparency Ledger (/ledger)

### Phase 2 (AppShell)
- Wallet
- Cold Start (partially done B080 — verify 5 anchors in place)
- Captain Dashboard (/captain)
- Marketplace (/marketplace)
- Cephas Gateway (/cephas)
- Calendar (/calendar)

### Phase 3 (Creator Workspaces)
- Storefront Builder (/storefront/builder)
- Cue Card Creator (/cue-cards/create)
- Dispatch Compose (/dispatch/compose)
- Treasure Map Builder
- Beacon Run Creator
- Canister Configurator

### Phase 4 (Community & Governance — as they land K314-K319)
- Family Table Hub
- Crew Call Board
- Tribe Directory
- Guild Directory
- Star Chamber
- Backer Election

## NAMING CONVENTION

Use kebab-case, page-scoped IDs: `{page-slug}-{landmark-slug}`

Examples:
- `cold-start-pathway-grid`
- `captain-priority-queue`
- `dispatch-canonical-composer`
- `storefront-live-preview`
- `cephas-pudding-trilogy-shelves`

## ANCHOR SELECTION

On each page, annotate **landmark sections** only — not every button/input. Target 5-10 anchors per page:
- The hero / orientation card
- Each dominant card or section container
- Sticky elements (filter bars, mobile CTAs)
- Dominant primary-action wrappers

Do NOT annotate individual buttons, inputs, or list items — too noisy.

## GLOSSARY ENTRIES

For every new `data-xray-id`, add a matching entry in `src/data/xrayGlossary.ts`:

```ts
'cold-start-pathway-grid': {
  title: 'Pathway Grid',
  whatItIs: '6 equal starting paths across Food, Make, Serve, Shop, Guild, Tribe.',
  howItConnects: 'Each card routes to its pathway setup flow. No default selection — 6 equal options.',
  whyItExists: 'Reduces choice paralysis by surfacing 6 well-defined starting lanes instead of a blank wizard.',
},
```

Keep entries short (2-3 sentence max per field). Founder-voice, civic, no SaaS framing.

## VERIFICATION STEPS

For each page:
1. Toggle X-Ray ON via Denken
2. Confirm ALL landmark anchors render cyan dashed outlines
3. Click one badge — confirm explainer panel opens with glossary content
4. Close panel, repeat on another badge
5. Toggle X-Ray OFF — confirm all outlines disappear cleanly

## TRACKER

- Add new tracker row `X-Ray Instrumentation Sweep` with `assignee='K320'`, `in_progress → review`
- Log to Librarian via `update_session` as K320

## BANNED

- NO over-annotation — landmarks only, not micro-interactions
- NO annotating items inside loops (one `data-xray-id` on the wrapper, not each child)
- NO placeholder glossary entries — write real content
- NO duplicate IDs across pages (kebab-case + page-slug prefix prevents this)

## ACCEPTANCE

- [ ] Every V2 page (K295-K319 scope) has 5-10 landmark `data-xray-id` anchors
- [ ] Every new ID has a matching entry in `xrayGlossary.ts`
- [ ] `npm run build` passes
- [ ] Visual check: toggle X-Ray on 3 random V2 pages — confirm outlines + badges render
- [ ] Tracker updated, Librarian session logged

## DO NOT

- Do not modify `XRayOverlay.tsx` runtime logic
- Do not change `data-tour-target` attributes (separate system)
- Do not add X-Ray annotations to legacy (non-V2) pages this session
- Do not create new database tables

---

*Bishop B080 — K320 X-Ray Instrumentation Sweep*
*Unblocks X-Ray Goggles mode across entire V2 surface.*
*FOR THE KEEP!*
