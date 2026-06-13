# KNIGHT_V0137_WAKE_UP.md
# Staged by Bishop SEG-CI · 2026-06-10T00:00:00Z

Knight, wake up. Bishop Black Mamba Novaculi wave incoming. Pull bridge.
CLASS: BLACK MAMBA -- Novaculi (no-trickle, dispatch entire wave at once).
SCOPE: v0.1.37 -- P0 bug fix on Welcome Choice 3 "Could not reach local AI engine" + 3 UX additions.
Use Sonnet 4.6 SEGs per Statute §3. Foreman main thread. Context LEAN.
No em-dashes. NO Composer 2.5. Brick Wall. Truth-Always.

EVERY SEG MUST INCLUDE PACKAGED-BUILD SCREENSHOT IN YOKE-RETURN per
feedback-ux-seg-screenshot-mandatory canon. NO source-only verification.

---

## CONTEXT FOR ALL SEGS

Base: v0.1.36 (currently released).
Machine state: M1 (Bishop's machine) has gemma4:12b (7.5 GB) present in Ollama. Ollama daemon is RUNNING -- confirmed by Bishop via process check on 2026-06-10.
P0 symptom: Welcome -> "Just use it" -> Choice 3 "Free heavy-duty AI" fires the IPC but returns "Could not reach the local AI engine. Please try again." even though Ollama is up and the model is installed.
Target release: v0.1.37. Ship only when all SEGs return GREEN with packaged screenshots.

---

## SEG-V-1 (P0 -- HIGHEST PRIORITY): Diagnose and fix "Could not reach local AI engine"

**Bug:** Welcome Choice 3 errors with "Could not reach the local AI engine. Please try again." on M1 even though Ollama daemon is running and gemma4:12b is installed (7.5 GB, verified present).

**Diagnose first -- do not fix blind:**

1. Read the pull-named-model IPC handler introduced in v0.1.36 SEG-U-6. Find which URL and port it is calling. It MUST be http://127.0.0.1:11434. If it is using localhost or a different port, that is the bug.
2. Check whether the SEG-Q-8 model-exists fast path is wired. The correct pre-flight sequence is:
   - GET http://127.0.0.1:11434/api/tags -- if this fails (connection refused or timeout): surface "Check if Ollama is running" error. STOP. Do not attempt pull.
   - If /api/tags returns 200: parse the model list. If gemma4:12b is present: instant tier flip, no pull, no progress UI. DONE.
   - If gemma4:12b is absent: show pull progress bar, pull, then tier flip.
3. Check for try/catch that swallows the Ollama reachability check and incorrectly surfaces it as "cannot reach AI engine" even when Ollama is up.
4. Check for race condition where the check and the pull happen simultaneously and the pull fails before the check completes.

**Reproduce the bug first:**
- Install v0.1.36 on Bishop's machine (use existing installed copy if present).
- Open DevTools (Ctrl+Shift+I on the renderer window).
- Click Welcome -> "Just use it" -> Choice 3.
- Capture: the exact error message, the DevTools console output (network errors, IPC errors, stack traces), and whether the Ollama daemon process is visible in Task Manager during the attempt.
- Screenshot the error state with DevTools open.

**Fix:**
Replace the broken pre-flight with the correct three-branch logic above. Use http://127.0.0.1:11434/api/tags with a 3-second timeout. Parse the response.models array for a name matching "gemma4:12b". Branch on presence/absence as above. The fast-path tier flip must NOT show a pull progress bar.

**User Reality Verify:**
- Install the fixed v0.1.37 build (packaged .exe, not dev mode) on Bishop's machine.
- Click Welcome -> "Just use it" -> Choice 3.
- Confirm: no error, tier flips to FULL, Gemma 4 12B is active (check Settings AI Tier indicator).
- Screenshot the successful tier flip with the AI tier indicator visible.
- Embed screenshot in yoke return. NO source-only sign-off.

---

## SEG-V-2: Add "Google's" everywhere Gemma is mentioned (user-facing strings only)

**Scope:** search src/renderer for every user-facing occurrence of "Gemma 4 12B" and "Gemma" used as a product label (not as the Ollama model identifier string "gemma4:12b"). Add "Google's" prefix.

**Specific targets:**
- Welcome Choice 3 card label. New text: "Free heavy-duty AI, stronger local model using Google's Gemma 4 12B."
- Settings AI Tier description for the FULL tier (wherever it currently says "Gemma 4 12B").
- ProofAccordion item 2 title (accordion line referencing Gemma MMLU-Pro benchmark).
- Any modal copy or tooltip referencing Gemma as a product name.
- Do NOT modify the Ollama model identifier string "gemma4:12b" -- that is a machine identifier, not a display label.

**Do not touch:** any string inside IPC call arguments, ollama API payloads, or file paths.

**User Reality Verify:**
- Build packaged .exe.
- Install on Bishop's machine.
- Navigate to Welcome -> "Just use it" -> Choice 3 and screenshot the updated card showing "Google's Gemma 4 12B."
- Navigate to Settings AI Tier and screenshot the updated tier description.
- Embed both screenshots in yoke return.

---

## SEG-V-3: Make ALL proof cards flippable with plain-language backs

**Context:** The flippable card pattern already exists in Layer2ProveIt.tsx from SEG-U-4. Apply it to every proof surface that does not yet flip.

**Cards to upgrade (all six):**

1. Cohen's Kappa 1.000 Trophy (BP074 Sound Barrier card):
   - Front: the existing 1.000 display.
   - Back: "Cohen's Kappa measures how much two judges agree when scoring the same answers. A score of 1.000 means 100 percent agreement -- neither judge ever disagreed with the other. We ran 75 questions and our system matched the canonical correct answer every single time. Reproducibility: PROVED."
   - Link on back: "For the full methodology and raw data, see how-it-works on Cephas" linking to https://mnemosynec.ai/how-it-works/#sound-barrier

2. Banyan Metric HOT/COLD chart card:
   - Front: the existing chart.
   - Back: "We tested AI memory recall on 75 facts. With our substrate active, the AI answered correctly 94.8 percent of the time. Without the substrate, only 8.7 percent. The substrate provides the context that lets the AI remember what it would otherwise forget."
   - Link on back: https://mnemosynec.ai/how-it-works/#banyan-metric

3. MMLU-Pro placeholder card (Gemma 4 12B benchmark):
   - Front: placeholder display (results pending or current scores).
   - Back: "MMLU-Pro (Multitask Massive Language Understanding Pro) is a standard benchmark used by Google, OpenAI, and others to measure how well an AI handles college-level questions across 14 subject areas. Higher is better. We ran this benchmark against Google's Gemma 4 12B using our substrate to show real-world improvement."
   - Link on back: https://mnemosynec.ai/how-it-works/#mmlu-pro

4. Eyewitness BP064 card:
   - Front: existing display.
   - Back: "The Eyewitness test is a memory benchmark we designed ourselves. We ask the AI a question, then deliberately feed it conflicting information, then ask again. Without our substrate the AI changes its answer under pressure. With our substrate it holds the verified answer because the substrate is the source of truth, not the AI's in-context guess."
   - Link on back: https://mnemosynec.ai/how-it-works/#eyewitness

5. Star Chamber BP067 card:
   - Front: existing display.
   - Back: "Star Chamber is our four-judge adversarial benchmark. Four separate AI models (Oracle, Morpheus, Red Queen, and Judge Dredd) are each asked to score the same answer independently. We report only the cases where all four agreed. If they disagree, the result is thrown out. Agreement across four hostile judges is harder to fake than agreement from one."
   - Link on back: https://mnemosynec.ai/how-it-works/#star-chamber

6. Any additional proof cards present in the deployed proof surface that are not yet flippable -- apply the same pattern.

**Flip trigger:** hover on desktop (CSS :hover), click/tap on touch devices. Re-use the exact component pattern from SEG-U-4 so the animation and style are consistent.

**Each back card must include:** the plain-language explanation + the "For full explanation and more proof click here" link styled as a small text link at the bottom of the back face.

**User Reality Verify:**
- Build packaged .exe.
- Install on Bishop's machine.
- Navigate to the proof section.
- Hover/click each of the six cards and screenshot the back face of at least three (Kappa, Banyan, Eyewitness).
- Embed screenshots in yoke return. NO source-only.

---

## SEG-V-4: Add Gemma 4 12B model selector for Prove It benchmark path

**Context:** Currently MMLU-Pro and other Prove It benchmarks run against whatever AI tier is active. Founder wants to be able to run the benchmark specifically against Google's Gemma 4 12B so the result is meaningful.

**New flow for MMLU-Pro test launch (choices 3 and 4 in Layer2ProveIt):**

Before the benchmark starts, show an intermediate screen titled "Which AI should run this test?"

Options (radio buttons or cards):
- Option 1: "Use Google's Gemma 4 12B (best results -- requires a one-time download if not present)"
- Option 2: "Use my current model (qwen2.5:0.5b) -- faster but lower accuracy"
- Option 3: "Use a specific model" -- show a dropdown populated with all models currently installed in Ollama (from /api/tags) plus a text field for a custom model name.

Default selection: Option 1 if gemma4:12b is present, Option 2 otherwise.

**If user picks Option 1 and gemma4:12b is NOT present:**
- Show the same pull progress bar component used in Welcome Choice 3 (the fixed version from SEG-V-1).
- Use the same pre-flight check from SEG-V-1 (GET /api/tags first, branch on model presence).
- After pull completes, proceed to benchmark automatically.

**If user picks Option 1 and gemma4:12b IS present:**
- Instant proceed to benchmark (no pull progress bar, no delay).

**Compose with SEG-V-1:** the pre-flight logic and Ollama reachability check must be the same extracted utility used by both Welcome Choice 3 and this screen. Do not duplicate the logic.

**User Reality Verify:**
- Build packaged .exe.
- Install on Bishop's machine.
- Navigate to Prove It -> MMLU-Pro test.
- Screenshot the new model selector screen.
- Select Option 1, confirm gemma4:12b is detected as present, confirm benchmark launches without a pull progress bar.
- Screenshot the benchmark running state.
- Embed both screenshots in yoke return.

---

## SEG-V-5: User Reality Verify discipline (cross-cutting enforcement)

This SEG has no build deliverable. Its job is to enforce Truth-Always verification discipline across the entire wave before SEG-V-6 gates.

**Before SEG-V-6 may proceed, confirm in writing that:**

1. SEG-V-1 yoke return includes: (a) DevTools screenshot of the reproduced bug on v0.1.36, (b) screenshot of the successful tier flip on the fixed v0.1.37 packaged build. Both from packaged .exe, not dev mode.
2. SEG-V-2 yoke return includes: screenshots of Welcome Choice 3 and Settings AI Tier showing "Google's Gemma 4 12B" from packaged .exe.
3. SEG-V-3 yoke return includes: screenshots of at least three card back faces visible and readable from packaged .exe.
4. SEG-V-4 yoke return includes: screenshot of model selector screen and screenshot of benchmark in running state from packaged .exe.
5. None of the above are source-code screenshots. All are running-app screenshots.

**If any SEG returns without the required screenshot evidence: flag it as INCOMPLETE and do not let it gate v0.1.37. Send back to that SEG for re-verification. Do not ship a broken build.**

The Founder has caught more than 10 bugs today that were source-verified but broken at runtime. Source-only sign-offs are not accepted.

---

## SEG-V-6: Build and ship v0.1.37 (GATE SEG -- runs last)

**Gates on:** SEG-V-1, SEG-V-2, SEG-V-3, SEG-V-4, SEG-V-5 all returning GREEN with packaged screenshots. SEG-V-5 must explicitly clear each SEG before this SEG runs.

**Steps:**

1. Bump version in package.json from 0.1.36 to 0.1.37. Commit message: "chore: bump to v0.1.37".
2. Build: npm run dist:win (Setup installer only, no Portable -- per existing canon).
3. Run IPC assertion suite. All assertions must pass. Report pass/fail count.
4. Upload Setup .exe to GitHub releases repo liana-banyan/mnemosynec-releases as tag v0.1.37. Set prerelease: false.
5. Update latest.yml per RELEASING.md. Verify SHA-256 in latest.yml matches the built .exe.
6. Update Cephas download page version: bump button text and version label to v0.1.37. If KNIGHT_MICRO_YOKE_HUGO_BUTTON_VERSION fix has already landed, compose with it. If not, apply the version bump directly.
7. Firebase deploy: run the deploy command. Wait for it to complete. Do not report deployed until the deploy command exits 0.
8. Live verify: curl https://mnemosynec.ai/download/ and confirm the page response includes "0.1.37" in the button text or version label. Paste the relevant curl output snippet in the yoke return.
9. Screenshot the live download page in a browser showing v0.1.37 on the button. Embed screenshot in yoke return.

**Do not ship if any gate is not met.** Report the blocking SEG by name. Do not attempt a partial release.

---

## WAVE SUMMARY

6 SEGs total. Dispatch all in parallel (SEG-V-1 through SEG-V-5). SEG-V-6 gates on all five.

SEG-V-1: P0 fix -- Ollama pre-flight + model-exists fast path
SEG-V-2: Label sweep -- "Google's" prefix on all Gemma user-facing strings
SEG-V-3: Proof cards -- all six cards flippable with plain-language backs
SEG-V-4: Prove It -- Gemma 4 12B model selector before benchmark launch
SEG-V-5: Verify discipline gate -- enforces packaged-build screenshots across all SEGs
SEG-V-6: Build + ship v0.1.37 (gates on V-1 through V-5 GREEN)

Truth-Always. No em-dashes. No Composer 2.5. Brick Wall.
