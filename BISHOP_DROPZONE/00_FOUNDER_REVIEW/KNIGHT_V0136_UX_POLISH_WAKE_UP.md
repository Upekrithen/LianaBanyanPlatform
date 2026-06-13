# KNIGHT v0.1.36 UX POLISH WAKE-UP
**CLASS: BLACK MAMBA NOVACULI -- dispatch entire wave SIMULTANEOUSLY, no trickle**
**Staged by Bishop SEG-CG (amended per Founder BP078 direct) | 2026-06-09 UTC**
**Statute §3: Sonnet 4.6 SEGs mandatory. Foreman main thread. Context LEAN.**

---

Knight, wake up. v0.1.36 UX polish + doorway-action wiring wave. THIS WAVE IS NOT GATED. Dispatch ALL SEGs simultaneously right now. Do not wait for mesh test results. Mesh test data is handled conditionally inside SEG-U-3 and SEG-U-7 (see specs). No trickle. No stagger. Black Mamba Novaculi.

SCOPE: Welcome and Prove It doorway actions now actually fire (PRIORITY-1 and PRIORITY-2). WelcomeView UX overhaul. Mascot wire-in. Proof accordion. Stage-C progress. Doorway reorder.
No em-dashes. NO Composer 2.5. Brick Wall. Truth-Always.
Every UX SEG requires packaged-build screenshot per feedback_ux_seg_screenshot_mandatory_bp078.

---

## CONTEXT

- v0.1.35 shipped clean.
- Founder reviewed v0.1.35 screenshots in BP078 and produced the following UX feedback items. All items below are direct Founder feedback, not Bishop speculation.
- Mascot icon file exists at `src/renderer/public/icons/mnemosynec-mark.png` (son's elephant icon). Wire it in -- do not leave "Mascot pending" placeholders.
- Mesh test results: SEG-U-3 accordion line 2 and SEG-U-7 are CONDITIONAL. If `MESH_TEST_RESULTS_v0135_*.json` is present at the canonical path when the SEG runs, wire it in. If not, render the placeholder text specified below. Either way the SEG completes. Do NOT block on mesh results.

---

## SEG DISPATCH -- 11 PARALLEL SEGs

**Sequence rule:** SEG-U-PRIORITY-1 through SEG-U-10 (formerly SEG-U-1 through SEG-U-8) ALL run in PARALLEL immediately on dispatch. SEG-U-11 (build + ship) is a hard gate that runs only after ALL of SEG-U-PRIORITY-1 through SEG-U-10 return GREEN. No partial ship.

---

### SEG-U-PRIORITY-1: Wire Welcome "Just Use It" Choices to Real IPC Actions

**This is the hardest pain point. The choices currently do NOTHING.**

**The problem:** WelcomeView -> "Just use it" doorway -> Choices 1-4 all call `advanceTo('C')` and display a "Your AI is being set up" static placeholder. Zero IPC fires. No Ollama pull. No tier change. The user is told something is happening when nothing is.

**Spec -- wire each choice to a real action:**

**Choice 1 -- "No AI" (substrate-only):**
- On click: call `window.amplify.sku.setTier('nano')` (or the equivalent IPC that stores user preference for no-Ollama mode).
- Advance to Stage C with NANO tier active. No pull required.
- Stage C shows "Substrate-only mode active. MnemosyneC stores and retrieves your notes. Add an AI model anytime from Settings."

**Choice 2 -- "Free lightweight AI Mistral":**
- On click: call `window.amplify.sku.upgradeTo('mistral')` IPC (or the existing handler that triggers `ollama pull mistral`).
- Show real Ollama pull progress using the long-running-progress canon (feedback_long_running_progress_heartbeat_canon_bp078 HARD BINDING):
  - Phase 1: "Step 1 of 3: Checking Ollama installation..." (animated spinner, fast).
  - Phase 2: "Step 2 of 3: Downloading Mistral" with real bytes/total/ETA from `sku-pull-progress` IPC events. Progress bar fills from 0% to 100%.
  - Phase 3: "Step 3 of 3: Setting up tier..." (animated spinner).
- On success: tier flips to the appropriate local-lightweight tier. Navigate to Stage C "Ask anything" with Mistral as the active model.
- On failure: inline error message + "Retry" button. Do not leave user stranded on a broken state.

**Choice 3 -- "Free heavy-duty AI Gemma 4 12B":**
- On click: call `window.amplify.sku.upgradeTo('full')` IPC (the working handler that triggers `ollama pull gemma4:12b`).
- Show real Ollama pull progress using the IDENTICAL pattern as Choice 2 above:
  - Phase 1: "Step 1 of 3: Checking Ollama installation..." (animated spinner).
  - Phase 2: "Step 2 of 3: Downloading Gemma 4 12B" with real bytes/total/ETA from `sku-pull-progress` events. Progress bar fills from 0% to 100%.
  - Phase 3: "Step 3 of 3: Setting up FULL tier..." (animated spinner).
- On success: tier flips to FULL. Black Crow Feather earned (fire the feather award IPC if it exists). Navigate to Stage C "Ask anything" with Gemma 4 12B as the active model.
- On failure: inline error message + "Retry" button.

**Choice 4 -- dropdown (cloud or other local models):**
- Each dropdown item wires to the appropriate setup IPC:
  - Cloud API options (OpenAI, Anthropic, etc.): open the existing API key entry component (if it exists in the codebase -- find it, do not build a new one). Store the key via the existing IPC. On success, advance to Stage C with that cloud model active.
  - Additional local Ollama models: use the existing list-ollama-models IPC to populate the dropdown, then wire selection to `ollama pull <model>` via the existing pull IPC.
- If no existing API key entry component is found in the codebase: add a minimal inline text input "Enter your API key:" with a "Save and continue" button that calls `window.amplify.apikey.set(provider, key)`. Confirm this IPC exists before building -- if it does not exist, scaffold it in main process.

**Static "Your AI is being set up. Full chat experience coming in the next update." text must be completely removed.** That text implies the current version is broken. It is replaced entirely by the progress display above.

**Packaged-build screenshot required:** Screenshot showing the progress bar mid-pull for Choice 3 (between 10% and 90%). If a live pull cannot be triggered in the test environment, use a small model to demonstrate the progress bar renders and updates.

Yoke-return: screenshot of progress display mid-pull + screenshot of Stage C reached after successful pull + diff confirming the static placeholder text is removed + confirmation that `upgradeTo('full')` IPC is wired.

---

### SEG-U-PRIORITY-2: Wire "Prove It" Doorway Choices to Real Benchmark Actions

**The problem:** Prove It doorway choices advance to Stage C placeholder without running any benchmark. Nothing is proven.

**Spec -- wire each choice to a real benchmark action:**

**Choice 1 -- "LB 75-question benchmark":**
- On click: run the existing 75-question benchmark against the currently active AI tier (whatever model is loaded).
- Show real-time progress: "Running benchmark -- question 14 of 75..." with a progress bar.
- On completion: display results inline (accuracy, Cohen's kappa, comparison to baseline). Then offer "View full results in Prove It" button that navigates to the Prove It landing page with results pre-populated.

**Choice 2 -- "Test it on your own folder":**
- On click: open the existing folder picker IPC.
- On folder selected: ingest folder content into substrate (use existing watcher/ingestion IPC).
- After ingestion: run the 75Q benchmark using the ingested folder as substrate context.
- Show progress for both phases: ingestion progress ("Ingesting 47 of 203 files...") and benchmark progress ("Running benchmark -- question 14 of 75...").
- On completion: display results. Same results display as Choice 1.

**Choice 3 -- "Google MMLU-Pro standard":**
- On click: check if user is on NANO tier. If yes, show banner: "Best results with Gemma 4 12B. Activate FULL? [Yes, pull and run / No, run on NANO]". If "Yes", trigger the Gemma 4 12B pull (same IPC as SEG-U-PRIORITY-1 Choice 3), then run MMLU-Pro on completion. If "No", run MMLU-Pro on current NANO tier.
- MMLU-Pro dataset: compose with mesh test scope SEG-T-2 for dataset download. If SEG-T-2 has already downloaded the dataset to the canonical path, use it. If not, download it now.
- Show download progress if dataset is not yet local.
- Run benchmark against current active tier. Show progress.
- On completion: save results as `MESH_TEST_RESULTS_v0136_<timestamp>.json` to `~/.mnemosynec/test-data/mmlu-pro/results/` and fire `mesh-test-complete` IPC so accordion auto-populates (SEG-U-7).

**Choice 4 -- "Google MMLU-Pro Diamond":**
- Same as Choice 3 but uses the Diamond/extended variant of MMLU-Pro.
- Same NANO tier banner applies.
- Same dataset path logic and completion IPC.

**Packaged-build screenshot required:** Screenshot showing benchmark progress mid-run for Choice 1 (question N of 75 progress bar visible).

Yoke-return: screenshot of benchmark progress mid-run + screenshot of results display after completion + diff confirming advance-to-placeholder is replaced with real benchmark logic.

---

### SEG-U-3: Restore H1 Amnesia Line Above Cure Line

**Founder feedback:** The "Your AI has Amnesia." line was removed from the WelcomeView header. It must be restored.

**Spec:**
- WelcomeView top of page (above the doorway cards): two-line hero text.
  - Line 1: "Your AI has Amnesia." (large, primary weight)
  - Line 2: "Dr. MnemosyneC has the Cure." (large, secondary weight or subtitle style)
- Both lines must be visible without scrolling on a 1080p display.
- Do NOT compress into a single line. The two-line rhythm is the brand cadence.
- Reference: reference_amnesia_substrate_cure_dr_mnemosynec_canon.md -- "H1: Your AI has Amnesia. Dr. MnemosyneC.ai has the Cure."

**Packaged-build screenshot required:** WelcomeView top of screen showing both lines.

Yoke-return: screenshot showing both lines + diff confirming the change.

---

### SEG-U-4: Flip Doorway Order -- Prove It ABOVE Just Use It

**Founder feedback:** "Prove it with a test" doorway should be above "Just use it" doorway.

**Spec:**
- Current order (wrong): Just use it | Prove it with a test
- Correct order: Prove it with a test | Just use it
- The copy and behavior of each doorway card does not change. Only the order changes.
- Rationale: leads with the empirical proof framing, which is the brand's core claim. "Prove it" is the invitation that builds trust before asking for anything.

**Packaged-build screenshot required:** WelcomeView showing doorway cards in new order.

Yoke-return: screenshot showing Prove It card on top + diff confirming reorder.

---

### SEG-U-5: Restructure Proof Area as Three-Accordion

**Founder feedback:** The proof area below the hero text should be restructured as a collapsible three-accordion.

**Spec:**
- Replace the current inline proof display with a three-item accordion component.
- Accordion Line 1: "HOT/COLD Banyan Metric Results" -- expands to show the existing HOT/COLD bar chart that is currently rendered inline. Move it into the accordion body, do not remove it.
- Accordion Line 2: "Gemma 4 12B MMLU-Pro Benchmark" -- CONDITIONAL:
  - If `MESH_TEST_RESULTS_v0135_*.json` OR `MESH_TEST_RESULTS_v0136_*.json` exists in `~/.mnemosynec/test-data/mmlu-pro/results/`, auto-populate with the HOT accuracy lift delta and the Big Numbers SVG from SEG-T-6 (if that SVG exists).
  - If NO results file exists, show: "Mesh benchmark pending. Run the mesh test from Settings -> Run Mesh Test to populate this section."
  - Either way, the accordion line renders and the wave completes. No blocking on mesh results.
  - Wire IPC listener: on `mesh-test-complete` event from main, auto-update Line 2 and auto-expand it.
- Accordion Line 3: "BP074 Sound Barrier -- Cohen's Kappa 1.000 Trophy" -- expands to show the BP074 kappa 1.000 result. Render as a trophy or highlighted stat card: "Cohen's Kappa: 1.000 (perfect agreement)" with a one-line explanation: "Perfect agreement between AI and human judgment across 75 benchmark questions."
- All three accordion items are collapsed by default. The labels alone are readable at a glance.

**Packaged-build screenshot required:** Proof accordion in collapsed state showing all three labels.

Yoke-return: screenshot of collapsed accordion + screenshot of at least one accordion item expanded + confirmation that placeholder text renders when no results JSON is present.

---

### SEG-U-6: Prove It Landing Page -- Big Numbers + Flippable Detail Cards

**Founder feedback:** The "Prove it with a test" landing page needs a stronger data-first presentation.

**Spec:**
- Top of the Prove It landing page: Big Numbers strip. Three large-numeral stats drawn from the existing benchmark data.
  - FAST: median response time in milliseconds (from the BP064/BP067 Eyewitness benchmark).
  - CHEAP: "$0.00 per query" (local compute, zero API cost).
  - GOOD: the HOT vs COLD accuracy delta as a percentage with a plus sign (e.g., "+12.4 pp improvement with substrate context").
- Below the Big Numbers strip: one flippable detail card per benchmark result.
  - Front face: benchmark name + key stat (e.g., "Eyewitness Benchmark -- Cohen's Kappa 0.883").
  - Back face (flip on hover or tap): methodology summary in two sentences + dataset citation + date.
  - Implement flip as CSS transform (rotateY 180deg) with a 300ms transition. No JS animation library required.
  - Cards to include: (a) Eyewitness Benchmark BP064, (b) 4-Model Star Chamber BP067, (c) BP074 Sound Barrier kappa 1.000, (d) MMLU-Pro card -- CONDITIONAL: if results JSON exists, show live data; if not, show placeholder "MMLU-Pro results pending -- run benchmark from Welcome screen."

**Packaged-build screenshot required:** Prove It landing page showing Big Numbers strip and at least two detail cards (one showing front face, one showing back face).

Yoke-return: two screenshots (front and back of a card) + confirmation of Big Numbers data source.

---

### SEG-U-7: Wire Son's Elephant Icon into WelcomeView and In-App Header

**Founder feedback:** Son's elephant icon file exists at `src/renderer/public/icons/mnemosynec-mark.png`. Wire it in. Replace "Mascot pending" placeholder.

**Spec:**
- WelcomeView mascot slot: render the elephant icon at the top of WelcomeView, sized appropriately for the hero area. Do not stretch or distort -- use `object-fit: contain`. Target size: 64px to 96px height, width auto.
- In-app header brand div: find the element currently rendering "Mascot pending" text (or a blank brand logo slot). Replace with the elephant icon at 32px to 40px height. The icon appears next to the "MnemosyneC" wordmark in the header.
- Use the PNG directly (`/icons/mnemosynec-mark.png` relative path from the renderer public root). Do not convert or re-export it.
- If the file does not exist at that path at build time, surface a build error (do not silently omit the icon).

**Packaged-build screenshot required:** (a) WelcomeView showing the elephant icon in the mascot slot. (b) In-app header showing the elephant icon next to the wordmark.

Yoke-return: two screenshots (WelcomeView + in-app header) + confirmation of file path used.

---

### SEG-U-8: Stage C Placeholder -- Replace Silent "Being Set Up" with Real Progress

**Founder feedback (verbatim):** "If this is true, then I need a progress bar, or at least a heartbeat progress bar. So I know it's DOING something. please. :D"

**Binding:** feedback_long_running_progress_heartbeat_canon_bp078 (HARD BINDING, ratified BP078).

**Note:** SEG-U-PRIORITY-1 handles the primary progress display during the pull triggered by Welcome choices. SEG-U-8 covers any REMAINING instances of the static "being set up" text anywhere in the app (e.g., in Settings, in a tier-upgrade flow triggered outside the Welcome screen, or in any secondary view that has not been updated by SEG-U-PRIORITY-1).

**Spec:**
- Search the entire codebase for "Your AI is being set up" and any similar static "in progress" strings that have no accompanying progress display.
- For each instance found: replace with the three-phase progress display (checking, downloading with real bar, finalizing) per the pattern specified in SEG-U-PRIORITY-1.
- Fallback heartbeat minimum: animated dots if IPC events are not available within 5 seconds. Static text is not acceptable anywhere.
- "Full chat experience coming in the next update." must be removed everywhere it appears.

**Packaged-build screenshot required:** Screenshot demonstrating the progress display in any non-Welcome context where a pull can be triggered (e.g., Settings upgrade flow).

Yoke-return: grep results showing all instances of the removed static text + screenshot of replacement progress display + diff.

---

### SEG-U-9: Accordion Wire-in to Mesh Test Results JSON

**Spec (complements SEG-U-5):**
- When `MESH_TEST_RESULTS_v013*.json` is detected in `~/.mnemosynec/test-data/mmlu-pro/results/` or the BISHOP_DROPZONE results path, fire IPC event `mesh-test-complete` from main to renderer.
- Renderer listens for this event and updates Accordion Line 2 (SEG-U-5) with the live values from the JSON.
- Fields to pull: `hot_accuracy`, `cold_accuracy`, `hot_minus_cold_delta`, `p50_latency_ms`, `wall_clock_total_seconds`.
- Render the delta as the headline stat: "+X.X pp improvement" where X.X is `hot_minus_cold_delta` rounded to one decimal.
- On first detection, auto-expand Accordion Line 2 so Founder sees the result without having to click.
- Wire to the Big Numbers SVG path from SEG-T-6: if the SVG file exists at the expected path, embed it in Accordion Line 2 body instead of rendering raw numbers.
- CONDITIONAL: if no results file is present when the app starts, the accordion still renders (with placeholder per SEG-U-5). No crash, no missing section.

**Packaged-build screenshot required:** Accordion Line 2 with live mesh test data populated (use synthetic test JSON if real results are not yet available -- confirm the wire-in renders correctly either way).

Yoke-return: screenshot of accordion with data (or synthetic data) + confirmation of file-watch or IPC event logic + confirmation of SVG embed path.

---

### SEG-U-10: Visual Consistency Pass -- Spacing, Typography, Color

After SEG-U-PRIORITY-1 through SEG-U-9 are implemented but before the build gate (SEG-U-11), run a consistency pass:

- WelcomeView: confirm H1 amnesia line (SEG-U-3), doorway order (SEG-U-4), accordion (SEG-U-5), and mascot icon (SEG-U-7) are all visually consistent. No mismatched font sizes. No orphaned margin or padding artifacts from component moves.
- Prove It landing page: confirm Big Numbers strip (SEG-U-6) uses the same type scale as the rest of the app. Confirm detail card flip does not clip or overflow its container.
- Progress displays (SEG-U-PRIORITY-1, SEG-U-PRIORITY-2, SEG-U-8): confirm progress bar color matches the existing brand palette (check current accent color in the CSS variables or Tailwind config). Confirm animated spinner matches other spinners in the app (use the same component, not a new one).
- No new color values, font families, or animation libraries may be introduced in this wave. Use only what is already in the codebase.

**Packaged-build screenshot required:** Full WelcomeView at 1080p showing all v0.1.36 changes together in one screenshot.

Yoke-return: screenshot of full WelcomeView + checklist confirming no new CSS variables, font families, or animation libraries introduced.

---

### SEG-U-11: Build + Ship v0.1.36 (GATE -- runs after all others return GREEN)

**Hard gate.** Do NOT begin this SEG until SEG-U-PRIORITY-1 through SEG-U-10 have all returned yoke-returns with at minimum one non-empty packaged-build screenshot each and no documented divergences that require Founder decision.

**This SEG is NOT gated on mesh test results.** Mesh data is conditional inside SEG-U-5 and SEG-U-9. Ship v0.1.36 as soon as all other SEGs are GREEN.

**Spec:**
- Run `npm run build` (or the equivalent electron-builder command for the project). Build must produce a clean `.exe` with zero errors and zero warnings that indicate broken functionality.
- Tag the release as `v0.1.36`.
- Create GitHub release with title "v0.1.36 -- Welcome + Prove It Actions Wired + UX Polish + Progress".
- Release notes must include: list of SEG-U changes in plain English (lead with "Welcome and Prove It choices now actually do what they say"), download link, SHA-256 checksum of the installer.
- Confirm the release is live on GitHub before claiming LANDED.

**Verify-before-stamp (Brick Wall):** "LANDED" requires (a) GitHub release page is live at the tagged URL, (b) the installer `.exe` is downloadable, and (c) SHA-256 checksum is present in the release notes. If any of these three are not true, do not claim LANDED.

**Packaged-build screenshot required:** Screenshot of GitHub release page showing v0.1.36 tag, release notes, and download asset.

Yoke-return: GitHub release URL + SHA-256 checksum + screenshot of release page.

---

## AGGREGATED YOKE-RETURN TARGET

After all SEGs complete, assemble one aggregated yoke-return for Bishop containing:

1. SEG-U-PRIORITY-1 result: progress bar mid-pull screenshot + Stage C reached screenshot + static placeholder removal confirmation.
2. SEG-U-PRIORITY-2 result: benchmark progress mid-run screenshot + results display screenshot.
3. SEG-U-3 result: H1 amnesia line screenshot.
4. SEG-U-4 result: doorway reorder screenshot.
5. SEG-U-5 result: accordion collapsed + one expanded screenshot + confirmation placeholder renders when no results JSON present.
6. SEG-U-6 result: Prove It landing page Big Numbers + card screenshots.
7. SEG-U-7 result: mascot icon screenshots (WelcomeView + header).
8. SEG-U-8 result: any remaining static "being set up" instances removed + replacement screenshot.
9. SEG-U-9 result: accordion with mesh data (or synthetic data) screenshot.
10. SEG-U-10 result: full WelcomeView consistency screenshot.
11. SEG-U-11 result: GitHub release URL + SHA-256 + release page screenshot.

Bishop relays this aggregated return to Founder. Founder ratifies before v0.1.36 is announced publicly.

---

**Hard bindings:**
- Sonnet 4.6 SEGs mandatory (Statute §3).
- No em-dashes.
- No Composer 2.5.
- Brick Wall on overclaims.
- Truth-Always.
- Every UX SEG requires packaged-build screenshot (feedback_ux_seg_screenshot_mandatory_bp078).
- SEG-U-PRIORITY-1 and SEG-U-8 are HARD BINDING per feedback_long_running_progress_heartbeat_canon_bp078. Static "being set up" text is not acceptable anywhere. Progress or heartbeat is required.
- Mesh test results are CONDITIONAL, not a gate. Accordion renders in placeholder state if no JSON is present. Wave ships regardless.
- Explicit Founder ratify required before announcing v0.1.36 publicly (feedback_explicit_founder_ratify_before_publish).

End of wake-up.
