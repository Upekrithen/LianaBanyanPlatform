# KNIGHT WAKE-UP -- v0.1.35 STAGE A + STAGE B
# BLACK MAMBA WAVE -- Novaculi

Knight, wake up. Bishop Black Mamba wave incoming. Pull bridge.
CLASS: BLACK MAMBA -- Novaculi (no-trickle, dispatch entire wave at once).
SCOPE: v0.1.35 STAGE A + STAGE B per Staged Launch Plan at
BISHOP_DROPZONE\00_FOUNDER_REVIEW\BP078_STAGED_LAUNCH_PLAN.md
Use Sonnet 4.6 SEGs per Statute §3. Foreman main thread. Context LEAN.
No em-dashes. NO Composer 2.5. Brick Wall. Truth-Always.

---

## MISSION SUMMARY

v0.1.35 ships Stage A (Welcome) and Stage B (Layer 2 choices) of the Staged Launch Plan. No tab unlock yet. No recruited milestone yet. Those ship in v0.1.36 and v0.1.37. This wave establishes the lifecycle foundation and the full Welcome-to-Layer-2 flow.

Read the Staged Launch Plan before dispatching SEGs. The plan is the canonical reference for all stage definitions and surface rules.

---

## SEG WAVE (11 parallel SEGs, dispatch ALL at once per Novaculi)

---

### SEG-S-1: Lifecycle Stage Tracker (FOUNDATION -- gate for all others)

Build the lifecycle stage infrastructure. All other SEGs depend on this.

Tasks:
- Create `src/renderer/hooks/useLifecycleStage.ts`
- Persist `mnemosynec_lifecycle_stage` in localStorage. Default value: `'A'`.
- Persist `mnemosynec_lifecycle_history` in localStorage as array of `{ stage: string, timestamp: string }`.
- Export `useLifecycleStage()` React hook returning `{ stage, advanceTo, history }`.
- Implement `advanceTo(newStage)` which writes stage + appends to history array.
- Implement transitions: A to B (doorway click), B to C (layer 2 choice click), C to D (emit `first_successful_round_trip` custom event -- DO NOT handle D transition in this SEG, just define the event name as a constant. Handling is v0.1.36.).
- Add Settings reset: expose a function `resetToWelcome()` that sets stage back to `'A'` and clears history. Wire this to a button in Settings -> Advanced -> "Reset to Welcome Tour" (create the button, even if Settings is not yet visible at stage A/B/C -- it needs to exist for stage D+).
- YOKE RETURN: commit hash + screenshot of localStorage showing `mnemosynec_lifecycle_stage = A` in DevTools after app launch on a clean profile.

---

### SEG-S-2: Force-Show WelcomeView for All Users on v0.1.35 Launch

Existing users on v0.1.34 or earlier may have the old bp067 first-run flag set. They must see WelcomeView on first launch of v0.1.35.

Tasks:
- On app startup, check for `mnemosynec_lifecycle_stage` in localStorage.
- If missing OR if only the old bp067-era first-run flag is present but lifecycle stage is absent, set stage to `'A'` and route to WelcomeView.
- Old flag does NOT bypass the lifecycle check. Migration is: old flag present + lifecycle stage absent = treat as stage A.
- If `mnemosynec_lifecycle_stage` is already `'B'` or later, respect it (do not regress the user).
- Write a migration comment in code: `// BP078 migration: pre-v0.1.35 users start at stage A`.
- YOKE RETURN: commit hash + screenshot showing WelcomeView appearing on a machine that had v0.1.34 installed (Bishop's machine counts -- simulate by clearing only the lifecycle key and leaving other flags in place).

---

### SEG-S-3: Refined Hero / Subline / Bullets in WelcomeView

Update WelcomeView copy to match BP078 canon.

Tasks:
- HERO: `Dr. MnemosyneC has the cure`
- SUBLINE: `Private AI memory and retrieval on your own computer. Test it first or start using it now.`
- THREE BULLETS (rendered as a clean list, not a wall of text):
  1. `Free AI that remembers, runs locally, belongs to you.`
  2. `Private AI memory on your computer.`
  3. `Learn how it works` rendered as a link to `https://mnemosynec.ai/how-it-works/`
- Do not change layout structure, only the text content and the link on bullet 3.
- YOKE RETURN: commit hash + screenshot of WelcomeView showing updated hero, subline, and bullets.

---

### SEG-S-4: Son's Elephant Graphic on Welcome Screen

Place the mascot graphic between the subline and the doorway cards.

Tasks:
- Asset path: `src/renderer/public/icons/mnemosynec-mark.png` (Founder places this file -- do not create a placeholder image, just handle the missing case gracefully).
- Render `<img src="icons/mnemosynec-mark.png" />` between subline and doorways.
- Height: 160px. Width: auto. Center-aligned.
- If asset is missing at build time: render a `<div className="mascot-pending">Mascot pending</div>` text placeholder with a build-time `console.warn('mnemosynec-mark.png not found at src/renderer/public/icons/')`. Do NOT fail the build. Do NOT throw an error.
- YOKE RETURN: commit hash + screenshot of WelcomeView showing either the graphic (if Founder has placed it) or the graceful placeholder.

---

### SEG-S-5: Benchmark Proof Graphic on Welcome Screen

Render the empirical proof bar chart on WelcomeView.

Tasks:
- Build a React component `BenchmarkProofChart` using inline SVG or a lightweight SVG approach (no new npm dependency).
- Data: HOT 94.8%, COLD 8.7%, Cohen's kappa 0.883 (BP064 canon -- do not change these numbers).
- Two bars: HOT (blue, 94.8%) and COLD (gray, 8.7%). Label each bar with its percentage.
- Caption below chart: `Empirical proof from the Eyewitness Benchmark. Same model, with and without MnemosyneC.`
- Place the component below the elephant graphic, above the doorway cards.
- YOKE RETURN: commit hash + screenshot of WelcomeView showing the chart and caption rendered correctly.

---

### SEG-S-6: Two Doorway Cards

Replace any existing doorway UI with two clean cards.

Tasks:
- Card A: title `Just use it` / subtitle `Start with the AI that fits your computer.`
- Card B: title `Prove it with a test` / subtitle `See benchmark results before you decide.`
- On Card A click: call `advanceTo('B')` + render Layer 2 Use It surface.
- On Card B click: call `advanceTo('B')` + render Layer 2 Prove It surface.
- Cards are side by side on wide screen, stacked on narrow screen.
- Each card has a visible hover state (border highlight or subtle shadow).
- YOKE RETURN: commit hash + screenshot of both doorway cards rendered in WelcomeView.

---

### SEG-S-7: Just Use It -- Layer 2 (4 Outcome-First Options)

Build the Layer 2 surface for the "Just use it" path.

Tasks:
- Render four choice cards or a clean radio-button list:
  1. `No AI, search and organize with your own computer only.`
  2. `Free lightweight AI, fast local helper using Ollama plus Mistral.`
  3. `Free heavy-duty AI, stronger local model using Gemma 4 12B.`
  4. `Use another AI already on this machine or add a new one.` -- followed by a dropdown that enumerates: detected Ollama models (via IPC call to list Ollama models), plus manual entries for Anthropic, OpenAI, Google, Mistral.
- On any choice click: call `advanceTo('C')` + trigger the appropriate setup IPC. Stage C lands on a minimal Frame "Ask anything" surface. The full tab bar does NOT appear (tab bar unlock is v0.1.37). Show only the Ask box and a minimal header.
- Back-to-Welcome affordance: a visible `Back` link or button that routes to WelcomeView (sets stage back to A).
- YOKE RETURN: commit hash + screenshot of the Layer 2 Use It surface showing all four choices.

---

### SEG-S-8: Prove It -- Layer 2 (4 Outcome-First Options)

Build the Layer 2 surface for the "Prove it with a test" path.

Tasks:
- Above the choices, render: `Compare how well each mode retrieves, reasons, and answers before deciding how you want to use it.`
- Four choices:
  1. `Small built-in proof test, LB 75-question benchmark.`
  2. `Test it on your own folder.` -- followed by a folder picker (use existing IPC for folder selection).
  3. `Google benchmark set, standard.` (MMLU-Pro)
  4. `Google benchmark set, difficult.` (MMLU-Pro Diamond)
- On any choice click: call `advanceTo('C')` + invoke the appropriate benchmark runner. Stage C lands on a minimal benchmark progress view. The full tab bar does NOT appear.
- Back-to-Welcome affordance: a visible `Back` link or button that routes to WelcomeView.
- YOKE RETURN: commit hash + screenshot of the Layer 2 Prove It surface showing all four choices and the intro line.

---

### SEG-S-9: Mesh Checkbox on Both Pathways

Add the mesh opt-in checkbox to the Welcome surface.

Tasks:
- Render one shared mesh checkbox below BOTH doorway cards (visible in Stage A, persisted through Stage B).
- Default: UNCHECKED.
- Persist checked state to localStorage key `mnemosynec_mesh_enabled`.
- Label: `Uses connected cooperative memory sources when available. You stay in control.`
- The checkbox state survives doorway selection and layer 2 navigation. User does not need to re-check it.
- YOKE RETURN: commit hash + screenshot of WelcomeView showing the mesh checkbox below the doorway cards.

---

### SEG-S-10: Stage A + B Gate Hides Tab Bar

Enforce the lifecycle gate on the tab bar.

Tasks:
- In `MnemosyneTabView` (or the root app router), read `mnemosynec_lifecycle_stage` from localStorage via the `useLifecycleStage` hook.
- If stage is A, B, or C: do NOT render the tab bar. Render only the active stage surface.
- If stage is D or later: render the full tab bar as normal.
- Settings gear: hidden at stages A, B, C. Visible at stage D or later. (A subtle "Settings" text link may appear once Settings is needed in stage D+.)
- Migration: any pre-v0.1.35 user without a lifecycle stage key gets set to stage A via SEG-S-2. Their tab bar is suppressed until they complete their first round trip (v0.1.36 will handle the D trigger -- for now they stay at stage A).
- YOKE RETURN: commit hash + screenshot showing WelcomeView with NO tab bar visible.

---

### SEG-S-11: Build + Ship v0.1.35 (GATE: S-1 through S-10 all GREEN)

Do not run this SEG until all prior SEGs have returned green.

Tasks:
- Bump version from 0.1.34 to 0.1.35 in package.json and anywhere else version is declared.
- Run full build. Fix any build errors. Do not ship a red build.
- IPC assert: verify IPC calls from SEG-S-7 and SEG-S-8 are registered and respond.
- Build packaged installer: `npm run build:win` or equivalent. Confirm .exe is produced.
- Install on a clean profile AND on a machine with v0.1.34 already installed (Bishop's machine). Verify migration: v0.1.34 user sees WelcomeView on first v0.1.35 launch.
- Capture screenshots of WelcomeView on both installs.
- Upload release to `liana-banyan/mnemosynec-releases` as v0.1.35. Tag `v0.1.35`.
- Update Cephas download page. Hugo page must show v0.1.35. Firebase deploy AND verify via live curl -- not just claimed deployed. This resolves the Cephas-page-was-never-actually-deployed bug from v0.1.34.
- Update `latest.yml` and `RELEASING.md` per existing checklist.
- YOKE RETURN: commit hash + GitHub release URL + screenshot of Cephas download page showing v0.1.35 live + screenshot of WelcomeView on clean install + screenshot of WelcomeView on migration install (v0.1.34 to v0.1.35).

---

## YOKE RETURN REQUIREMENT (MANDATORY PER EVERY SEG)

Each SEG yoke return must include:
1. Commit hash
2. Packaged build install screenshot of the affected surface
3. No "deployed" or "landed" claim without a screenshot proving it

Truth-Always. Dispatched is not executing. Claimed is not verified.

---

## HARD BINDINGS

- SEGs MANDATORY. No em-dashes anywhere in code comments or UI strings.
- Truth-Always. No overclaims. No "LANDED" without proof.
- NO Composer 2.5. Sonnet 4.6 SEGs only per Statute §3.
- Counsel SETTLED. Rook paused. Cohesion Scopes 5 and 6 stay queued.
- Brick Wall: no scope creep into v0.1.36 or v0.1.37 work.

---

## DEFERRED (do not touch in this wave)

**Deferred to v0.1.36:**
- Stage C to D recruitment trigger
- first_successful_round_trip event handling and storage
- Ask box functional AI round trip wiring

**Deferred to v0.1.37:**
- Tab bar unlock at stage D
- Settings gear reappear logic
- Four tabs plus More visible after recruited

**Deferred to v0.1.38+:**
- $ LB Account tab unlock at stage E
- Cooperative membership UI at stage E
- Full advanced surfaces at stage F
- Marks, Credits, Joules UI
- Mirror Clause UI

---

## COMPOSES WITH

- `BISHOP_DROPZONE\00_FOUNDER_REVIEW\BP078_STAGED_LAUNCH_PLAN.md` (sibling file, canonical reference)
- BP073 Amnesia / Substrate Cure canon
- BP074 son's character art canon (elephant mascot at asset path above)
- BP078 Pawn UX evaluation (Off-the-Street failure -- this wave is the structural fix)
- feedback-every-click-visible-feedback canon (every transition gives user visible feedback)
- feedback-ux-seg-screenshot-mandatory canon (every SEG returns a screenshot)

---

End of wake-up. Dispatch all 11 SEGs in parallel. No trickle. No partial drops.
Foreman holds bridge until all 11 return. Then compile and ship S-11 gate.

*BP078 -- Knight v0.1.35 Stage 1 Wake-Up -- Bishop Black Mamba*
