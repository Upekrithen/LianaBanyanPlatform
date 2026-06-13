# BP078_KNIGHT_UX_SPEC_SYNTHESIZED
## Synthesized Knight UX Spec — Rook Proposal + Pawn Overrides
**SEG-CB (Sonnet 4.6, Statute §3) · 2026-06-09**
**Sources verified live: SkuUpgradePanel.tsx, SettingsTab.tsx, MnemosyneTabView.tsx, ROOK_UX_OVERHAUL_PROPOSAL_BP078.md, PAWN_RETURN_ROOK_UX_OVERHAUL_BP078.md, benchmarks/run_bp076_phase2_drt.py**

---

## §8 — Truth-Always Findings from Phase A/B (read first; spec depends on these)

### SkuUpgradePanel vs MnemDrtPanel: DIFFERENT SYSTEMS

After reading all live files, the situation is clear:

**SkuUpgradePanel.tsx** is a standalone file at `src/renderer/components/SkuUpgradePanel.tsx`. It manages the model-download upgrade path: checks current SKU tier via `window.amplify.sku.currentTier()`, drives the `upgradeTo('full')` IPC, shows NANO/CORE/LITE/FULL tier cards, and fires the Black Crow Feather earn on completion. Its section header label inside the component is "AI Tier". It is wired into `SettingsTab.tsx` at Section 3c under the `<section>` header "AI Tier".

**MnemDrtPanel** is NOT a separate file. There is no `MnemDrtPanel.tsx` on disk. The panel is an inline function named `MnemDrtPanel()` defined inside `SettingsTab.tsx` starting at line 951, added in BP077 v0.1.27. It manages retrieval settings: SKU type selector (NANO/CORE/LITE/FULL chips), master Mnem-DRT toggle, source specialists (Wikipedia/Wikidata/arXiv/Wolfram Alpha), filtration pipeline toggle, eblet store quota, and federation exchange. Its section header is "Mnem Retrieval (Mnem-DRT)".

**They are DIFFERENT systems.** SkuUpgradePanel governs model installation and upgrade. MnemDrtPanel governs retrieval settings and DRT enablement. They happen to share the same NANO/CORE/LITE/FULL vocabulary because the DRT features are gated by the same SKU dimension.

**Rook's diagnosis is correct:** both surfaces are in Settings, both use NANO/CORE/LITE/FULL labels, they sit adjacent in the scroll order (Section 3b = Mnem-DRT, Section 3c = AI Tier), and a stranger scrolling through will see what looks like two different panels using the same tier labels for apparently different purposes. This is a real UX friction point.

**Founder's screenshot:** If Founder saw "two panels with the same labels," that is exactly what the live code produces. It is not a duplicate render of one panel. It is two distinct panels, each using NANO/CORE/LITE/FULL, one for DRT config and one for model-install upgrade.

### ThreeOptionAsk / showOnboardAsk gating

`showOnboardAsk` is a React state variable in `MnemosyneTabView.tsx` initialized to `false`. It is only set to `true` in one path: when `Bp067FirstRunSpine` calls `onAskOnboard()` on first-run completion. `ThreeOptionAsk` is a local function in `MnemosyneTabView.tsx` that renders inline in the shell (not in Settings). It has four option cards: Use Free Forever, Join cooperative $5/year, Enable Developer Mode, Check for Updates.

**This is NOT a standing Settings panel.** The "intent panel" Rook referenced is this `ThreeOptionAsk` component in the main shell view, shown only once after the BP067 first-run spine completes. It is not mounted inside `SettingsTab.tsx` at all. Rook's Diagnosis Layer 1 "Canon-Collision: Intent Capture" described it as being mounted at the top of SettingsTab — that is a misread. The BP078 canon (`feedback_intent_capture_at_join_modal.md`) says intent capture must fire inside the $5 join flow. `ThreeOptionAsk` fires after first-run, not inside `FirstStepsView.tsx`. Whether this is a canon violation depends on whether "inside the join flow" means strictly inside `FirstStepsView` or is satisfied by any post-first-run surfacing. This is a Founder ratify item.

### Mnem-DRT canon BP076/BP077 verification

Librarian search returned no results for BP076 or BP077. The ground truth is the live code:

- `run_bp076_phase2_drt.py` header confirms BP076 is a benchmark experiment session for the "Mnem-DRT cooperative-cathedral retrieval experiment."
- `SettingsTab.tsx` line 6 states: "BP077 v0.1.27: Mnem-DRT panel added (MnemosyneC Mnem-as-interface)."
- The inline `MnemDrtPanel()` uses NANO/CORE/LITE/FULL as SKU type selectors where:
  - NANO = "BYO Ollama -- minimal Mnem" (no DRT)
  - CORE = "Bundled Ollama -- opt-in Mnem-DRT"
  - LITE = "Bundled Ollama + gemma2:2b -- opt-in Mnem-DRT"
  - FULL = "Full suite -- Mnem-DRT always on"
- `SkuUpgradePanel.tsx` defines NANO/CORE/LITE/FULL as model-install tiers where NANO = qwen2.5:0.5b, CORE/LITE = coming soon, FULL = gemma4:12b.

**The dimension is install footprint AND retrieval depth AND model bundling — all three at once.** NANO/CORE/LITE/FULL are the canonical SKU labels that govern multiple orthogonal dimensions simultaneously. The label set is load-bearing across both panels. Rook's proposed rename to "Base/Expanded/Complete/Archive" is canon-violating and would create a split between the two panels that does not reflect how the underlying system works (they share one SKU axis). SEG-4 kill is correct.

---

## §1 — Verdict on Rook Proposal

ACCEPT WITH CHANGES. Rook correctly diagnosed tab overflow severity, Settings discoverability cliff, the Check-for-Update/SKU-upgrade collision, the label collision between the two panels, and the canon issue with ThreeOptionAsk. His synthesis of Proposal A + targeted extraction elements is the right architectural direction. Changes required per Pawn: top-5 tab cut must swap Helm/Substrate for AI/FAQ per stranger-safe criterion; pill copy must be sharpened; SkuUpgradePanel must remain in Settings as source-of-truth with pill as a fast path; rename of Mnem-DRT labels must be rejected entirely; overflow must use dynamic available-space measurement not a hardcoded 1400px; and accessibility requirements must be explicitly specified.

---

## §2 — Accept from Rook

**Tab bar overflow concept.** The core diagnosis is verified live: `visibleTabs` in `MnemosyneTabView.tsx` renders up to 16 tabs in a flat flex row with no overflow container. At typical laptop widths, rightmost tabs clip. A "More" dropdown pattern is the right fix. Implementation must use dynamic available-space measurement per §3 below, not a hardcoded breakpoint.

**"Check for Update" SKU surface concept.** Verified: the titlebar "Check for Updates" button at line 549 of `MnemosyneTabView.tsx` calls `window.amplify.checkForUpdates()`, which is the electron-updater path only. The model upgrade lives deep in Settings. Rook's diagnosis of a UX collision is accurate. A separate titlebar pill for AI model upgrade is correct.

**Titlebar upgrade pill concept.** Accept the concept: a pill in the titlebar area that is visible to non-FULL users and provides fast access to the model upgrade. Accept Pawn's copy recommendation (`Get FULL AI Free`) over Rook's (`Upgrade AI (Free)`). The pill opens a modal that contains the SkuUpgradePanel flow AND offers a link to "Open AI Tier in Settings." This is the accelerator path, not the only home.

**Standing intent panel deletion.** The `ThreeOptionAsk` component in `MnemosyneTabView.tsx` fires after first-run spine completion. If Founder confirms this is the panel to delete, deletion is canon-compliant per `feedback_intent_capture_at_join_modal.md` provided the four actions are re-homed per §5. Conditional on Founder ratify (see §9).

---

## §3 — Modify from Rook (per Pawn)

### Top-5 tab cut (Pawn Option 1)

Use Pawn's stranger-safe cut, not Rook's architecture-first cut.

**Visible tabs (always in bar):** Frame / AI / FAQ / Kitchen Table / $ LB Account

**Far-right:** Settings as a gear icon (not a labeled tab). Gear icon must have `aria-label="Settings"` and `title="Settings"` tooltip.

**Everything else in More dropdown:** Helm / Gauntlet (if forTechies) / Developer (if devEnabled) / Atlas / Pearls / Substrate / Console / Caithedral Core / Battery / Broadcast

Rationale: AI is the semantic core of what the app does. FAQ is the self-recovery surface for confused first-run users. Kitchen Table is a named consumer feature. $ LB Account surfaces the cooperative membership path. Frame is the daily-driver tab. This set passes the Off-the-Street test for all three Pawn user profiles. Settings as a gear icon is a universal convention and saves a visible slot.

**Tab priority order for dynamic degradation:** Frame must never be hidden. AI must be in top 3 at all widths. FAQ must be in top 4. Kitchen Table may degrade to More at very narrow widths. $ LB Account may degrade to More at very narrow widths. Gear icon (Settings) has fixed position at far right and is never moved to More.

### Pill copy (Pawn recommendation, pending Founder ratify)

Pill label: **`Get FULL AI Free`**

Modal header: use the longer Founder-voice sentence: "FULL is the in-app upgrade to Gemma 4 12B, a FREE flagship open model. Bigger download, better performance, still free."

Pill visibility: visible when currentTier is not 'full'. Hidden (not disabled) when currentTier is 'full'. During upgrade-in-progress state, pill shows a spinner and "Upgrading..." and is non-interactive. After upgrade completes, pill hides.

### Modal vs Settings dual surface

Do NOT fully extract SkuUpgradePanel from Settings. Implement the dual-surface pattern:

- Titlebar pill opens a modal containing the full `SkuUpgradePanel` component plus a "Open AI Tier in Settings" link below the panel.
- Settings Section 3c "AI Tier" retains the full `SkuUpgradePanel` component as source-of-truth. FULL users see current tier confirmed there.
- The pill is additive, not a replacement.
- Modal state: if an upgrade is in progress and the user opens Settings, the same `SkuUpgradePanel` component reflects that state (shared IPC event stream).

### Breakpoint strategy (Pawn requirement)

Do NOT use a hardcoded 1400px or any single numeric breakpoint.

Implementation spec for Knight:
1. Attach a `ResizeObserver` to the tab bar container element.
2. On each observation, measure `containerWidth` and sum the rendered widths of priority tabs in order.
3. Keep tabs visible in priority order until the next tab would cause overflow (leaving a fixed reserved budget for the More button).
4. Subtract fixed reserved budget for titlebar actions (pill + Check for Updates + mode chip + close button) before computing available tab width.
5. Move overflowed tabs into the More dropdown.
6. Re-run on every resize observation and on every visibility-flag change (devEnabled, forTechies).
7. Minimum visible tabs: always at least Frame + gear icon, even at very narrow widths.

Test states that must pass: 1024 / 1366 / 1920 / 4K / DevTools docked right / DevTools docked bottom / 125% OS zoom / ultrawide.

---

## §4 — Reject from Rook

### Mnem-DRT rename: REJECT entirely

Rook proposed renaming NANO/CORE/LITE/FULL inside the Mnem-DRT SKU selector to "Base / Expanded / Complete / Archive." This is rejected for three reasons verified from live files:

1. `MnemDrtPanel` is an inline function inside `SettingsTab.tsx`, not a separate file. There is no `MnemDrtPanel.tsx` to edit in isolation.
2. NANO/CORE/LITE/FULL are the canonical BP076 SKU labels that SkuUpgradePanel and MnemDrtPanel share because they describe the same underlying install-tier axis. Renaming only the DRT surface would create a split vocabulary where the user sees "Base" in Mnem-DRT settings but "NANO" in AI Tier settings, worsening confusion rather than resolving it.
3. "Archive" as the highest tier label semantically implies storage state, not retrieval power or model completeness. It is internally inconsistent with the other three terms.

SEG-4 (Mnem-DRT rename) was being killed via Knight interrupt. That kill is confirmed correct. Do not reopen.

**Alternative mitigation accepted:** Add a short explanatory sentence above the MnemDrtPanel SKU selector that makes clear these chips select the install type, not a separate tier: e.g., "Your install type sets which retrieval features are available. Match this to your AI Tier above." This costs one line of copy and resolves the confusion without breaking canon.

### Extraction of SkuUpgradePanel from Settings: REJECT full extraction

Already addressed in §3. Pill is additive; Settings panel stays.

---

## §5 — Replacement map for intent panel deletion

If Founder ratifies deletion of ThreeOptionAsk, each of its four actions must be re-homed as follows:

| Action | Current location | Re-home to |
|---|---|---|
| Use Free Forever | Option 1 in ThreeOptionAsk | Explicit copy inside FirstStepsView join modal showing the no-payment path ("Use free, no account needed") + persistent note in LB Account tab: "Using free? No account required." |
| Join the cooperative $5/year | Option 2 in ThreeOptionAsk | Helm gate screen already shows "Join — $5/year" button. Add persistent entry point as a card in $ LB Account tab with same CTA. Ensure $ LB Account is visible in top-5. |
| Enable Developer Mode | Option 3 in ThreeOptionAsk | Settings, Developer Mode section (Section 5). Section is already implemented. Add a direct labeled link: "Enable Developer Mode" in the Settings gear dropdown or as a visible Settings subsection header. Not hidden behind vague copy. |
| Check for Updates | Option 4 in ThreeOptionAsk | Already handled by the persistent "Check for Updates" button in the titlebar. No new surface needed. Confirm this button remains post-refactor. |

---

## §6 — Accessibility requirements (Pawn additions)

**More dropdown:**
- Trigger button must use `aria-haspopup="menu"` and `aria-expanded={isOpen}`.
- Dropdown items must be reachable by keyboard (Tab or arrow keys).
- Dropdown dismisses on Escape and on click-outside.
- Each dropdown item is a `<button role="menuitem">` or `<a role="menuitem">`.
- Focus returns to the More trigger button on close.

**Upgrade modal:**
- Root element: `role="dialog"` with `aria-modal="true"`.
- Programmatic title: `aria-labelledby` pointing to a visible heading inside the modal.
- Focus trap: on open, first interactive element inside modal receives focus. Tab cycles within modal only.
- Escape key closes the modal.
- On close, focus returns to the invoking pill button.
- Overlay click closes modal (with confirmation if upgrade is in progress).

**Titlebar pill:**
- `aria-label="Get FULL AI Free — open model upgrade options"` (exact text pending Founder ratify of copy).
- `title` tooltip: "Upgrade to FULL — Gemma 4 12B, free download."
- When hidden (FULL users), remove from DOM entirely rather than `display:none` + `aria-hidden`, to avoid phantom tab stops.

**Persistent current-tier status:**
- Settings Section 3c must always show current tier in text form, not only as color or badge state. Example: "Current tier: NANO" as a readable `<p>` above the tier cards.
- This text must remain for FULL users so they can verify installed tier without the pill being visible.

**Gear icon (Settings):**
- `aria-label="Settings"` required since there is no visible text label.
- `title="Settings"` for mouse users.

---

## §7 — Test pass criteria (Pawn additions)

**Overflow at multiple widths:**
- 1024px: Frame + AI + FAQ visible. More dropdown present. Settings gear visible. No tab clips.
- 1366px: Frame + AI + FAQ + Kitchen Table + $ LB Account visible. Settings gear visible. Remaining in More.
- 1920px: all priority tabs visible. More may contain advanced tabs only.
- 4K and ultrawide: all tabs may be visible. More may be empty and hidden.
- DevTools docked right (reduces effective width): tabs degrade correctly per available-space algorithm.
- DevTools docked bottom: no effect on tab bar; verify no regression.
- 125% OS zoom: tab widths expand; algorithm still degrades correctly.

**Pill visibility:**
- NANO user: pill visible immediately on mount.
- FULL user: pill not present in DOM.
- During upgrade: pill shows "Upgrading..." with spinner, non-interactive.
- Current tier is always readable as text in Settings Section 3c regardless of pill state.

**IPC failure path:**
- If `sku-upgrade-to` IPC call fails, modal shows clear inline error message. No silent failure.
- Upgrade CTA button disables during pending state. Re-enables on failure for retry.
- `assert-ipc-handlers.mjs` must block release if `sku-upgrade-to`, `sku-check-model`, and `sku-current-tier` handlers are absent.

**Black Crow Feather:**
- Successful upgrade via titlebar pill modal fires `feather_earned` analytics event with `{ color: 'black', reason: 'full_sku_upgrade_completed' }`.
- Successful upgrade via Settings panel fires same event.
- Verify `earnBlackCrowFeather` IPC path reaches Supabase `crow_feathers` table in both entry points.

**More dropdown accessibility:**
- Tab into More trigger, press Enter, dropdown opens.
- Arrow keys cycle items.
- Escape closes dropdown, focus returns to trigger.
- Screen reader announces "More, menu button" and expansion state.

**Modal accessibility:**
- Pill click opens modal with focus on first interactive element.
- Tab stays within modal.
- Escape closes modal, focus returns to pill.

**Off-the-Street test (3 users, explicit pass criteria):**
- Founder's wife (non-technical, first run): can find "Get FULL AI Free" in titlebar within 30 seconds, click it, read the modal copy, start the upgrade. Can find current tier in Settings without hunting. Pass = completes or consciously declines within 2 minutes.
- In-laws (email-comfortable): can find FAQ and AI tabs in the visible bar. Can find "$5 join" in $ LB Account tab. Can verify "Use free forever" path is presented. Pass = no confused pause longer than 10 seconds on any of these.
- Cold newspaper reader: reads the visible bar labels (Frame, AI, FAQ, Kitchen Table, $ LB Account) and can infer what the app does in 30 seconds without opening any tab. Pass = can articulate what the app is for without opening settings.

---

## §9 — Founder ratify items (before Knight ships)

Knight must not implement any of the following until Founder gives explicit direction:

1. **Final pill copy.** Pawn recommends `Get FULL AI Free`. Two viable alternatives: `Upgrade to FULL Free` or `Get Gemma 4 AI Free`. Founder voice canon must confirm which label is approved before Knight codes the button.

2. **Top-5 tab cut.** Pawn Option 1 is recommended: Frame / AI / FAQ / Kitchen Table / $ LB Account. Rook proposed: Frame / Helm / Kitchen Table / Substrate / Settings. Founder must confirm visible set before Knight implements the dynamic overflow algorithm.

3. **ThreeOptionAsk deletion.** The live code shows `ThreeOptionAsk` fires after the BP067 first-run spine completes, not inside FirstStepsView. Founder must confirm: (a) is this the "standing intent panel" to be deleted, and (b) does the current firing location violate canon, or is the post-first-run display acceptable?

4. **Modal header copy.** Pawn recommends the longer Founder-voice sentence inside the modal header. Founder must confirm the modal header copy is approved before Knight codes it.

---

## §10 — Knight handoff structure

### SEG-1: Dynamic tab overflow algorithm
**Scope:** Modify `MnemosyneTabView.tsx` to implement ResizeObserver-based dynamic tab prioritization. No new files.
**Files:** `src/renderer/components/MnemosyneTabView.tsx`
**Changes:**
- Define a `PRIORITY_TABS` constant in order: `['frame', 'ai-selector', 'faq', 'kitchen-table', 'lb-account']`.
- Gear icon (Settings) is fixed at far right, not part of priority array.
- Attach ResizeObserver to the tab bar container ref.
- On each observation, compute visible tab count from available width minus reserved space for titlebar controls.
- Render visible tabs from priority list, then "More" dropdown for remainder.
- More dropdown button: `aria-haspopup="menu"` `aria-expanded={moreOpen}`.
- Dropdown items: `role="menuitem"`, keyboard-navigable, Escape-closeable.
**IPC:** None.
**Test pass:** All width/zoom states from §7.

### SEG-2: Titlebar upgrade pill
**Scope:** Add `Get FULL AI Free` pill to titlebar in `MnemosyneTabView.tsx`. Opens modal.
**Files:** `src/renderer/components/MnemosyneTabView.tsx`, `src/renderer/components/SkuUpgradeModal.tsx` (new component wrapping SkuUpgradePanel).
**Changes:**
- Create `SkuUpgradeModal.tsx`: renders a `role="dialog"` modal wrapper around `SkuUpgradePanel`. Include modal header with Founder-voice copy (pending ratify). Include "Open AI Tier in Settings" link at bottom that closes modal and navigates to settings tab.
- In `MnemosyneTabView.tsx`, add pill button between mode chip and close button.
- Pill reads current SKU tier from IPC on mount and subscribes to tier changes.
- Pill hidden (removed from DOM) when tier === 'full'. Visible otherwise.
- Pill shows spinner + "Upgrading..." when upgrade in progress.
- `aria-label` on pill per §6.
- Focus trap and return per §6.
**IPC:** Reuses `window.amplify.sku.currentTier()`, `onPullProgress`, `onPullComplete`, `onPullError`.
**Test pass:** Pill visibility states, modal focus trap, Escape behavior, feather earn fires.

### SEG-3: Settings dual-surface + persistent tier text
**Scope:** Ensure Settings Section 3c retains SkuUpgradePanel and adds persistent current-tier text. Remove nothing.
**Files:** `src/renderer/components/SettingsTab.tsx`
**Changes:**
- Add current-tier text above the SkuUpgradePanel: `<p>Current tier: {currentTier.toUpperCase()}</p>` wired to same IPC as pill.
- Add explanatory sentence above MnemDrtPanel SKU selector: "Your install type sets which retrieval features are available. Match this to your AI Tier above."
- No removal of SkuUpgradePanel from Settings.
**IPC:** `window.amplify.sku.currentTier()` added to SettingsTab state.
**Test pass:** FULL user sees "Current tier: FULL" in Settings. Upgrading via pill reflects in Settings panel state.

### SEG-4: KILLED
SEG-4 (Mnem-DRT rename) is cancelled. Knight interrupt confirmed. Do not reopen.

### SEG-5: Replacement map implementation (conditional on Founder ratifying ThreeOptionAsk deletion)
**Scope:** If Founder ratifies deletion of ThreeOptionAsk, implement the four replacement re-homes.
**Files:** `src/renderer/components/MnemosyneTabView.tsx` (delete ThreeOptionAsk render), `src/renderer/components/FirstStepsView.tsx` (add free-path copy), `src/renderer/components/LBAccountTab.tsx` (add $5 join card + free-forever note).
**Changes:**
- Delete the `{showOnboardAsk && <ThreeOptionAsk ... />}` block from MnemosyneTabView render. Keep the handler functions in case they are needed by other surfaces.
- FirstStepsView: add explicit "Use free — no account required" option or link.
- LBAccountTab: add "Join the cooperative — $5/year" CTA card at top if user is not yet a member. Add "Using free? No account required." note for non-members.
- Settings Developer Mode section: ensure the section header "Developer Mode" is prominent and not hidden behind intermediate copy.
- Check for Updates: already in titlebar — no change.
**IPC:** None new.
**Test pass:** All four re-homed actions discoverable by an Off-the-Street user without the ThreeOptionAsk being present.

### SEG-6: IPC resilience + release gate
**Scope:** Implement inline error handling for upgrade IPC failure + release gate.
**Files:** `src/renderer/components/SkuUpgradePanel.tsx`, `scripts/assert-ipc-handlers.mjs` (verify exists or create).
**Changes:**
- SkuUpgradePanel already shows error state on `onPullError`. Verify error message is surfaced in modal context as well (not just Settings).
- Confirm upgrade CTA disables during 'upgrading' phase and re-enables on 'error' phase (already present in live code — verify).
- `assert-ipc-handlers.mjs`: must check for `sku-upgrade-to`, `sku-check-model`, `sku-current-tier` handlers. Block release CI if any are absent.
**IPC:** No new handlers. Resilience harness only.
**Test pass:** IPC failure shows inline error, no silent failure. assert-ipc-handlers.mjs blocks release.

### SEG-7: Accessibility pass
**Scope:** Implement all §6 requirements not covered by SEG-1 and SEG-2.
**Files:** `src/renderer/components/MnemosyneTabView.tsx`, `src/renderer/components/SkuUpgradeModal.tsx`.
**Changes:**
- More dropdown: full ARIA and keyboard per §6.
- Modal: full ARIA, focus trap, Escape, overlay-click, focus return per §6.
- Pill: full ARIA label per §6.
- Gear icon: `aria-label="Settings"`.
**Test pass:** All accessibility requirements from §6.

### SEG-8: Off-the-Street verification
**Scope:** 3-user live test per §7 pass criteria. Not a code SEG. Founder or designated tester runs with wife, in-laws, cold reader against a pre-release build.
**Gate:** Must pass before v0.1.30 release tag.

---

**READY-FOR-RATIFY. Awaiting Founder direction on §9 items before Knight begins SEG-1.**
