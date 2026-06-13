<!-- bishop-yoke-task 2026-06-11T00:00:00Z -->

## BISHOP -> KNIGHT — TASK — V0149 LEAN INSTALL EXPERIENCE — TWO-SCREEN WELCOME + SINGLE-CTA INSTALL FLOW + OLLAMA PATH CONSOLIDATION — USE SONNET 4.6 SEGs (Statute §3)

**Pinned-class task. Pin-marker: BP080_V0149_LEAN_INSTALL_2026-06-11T00:00:00Z**

> **STATUTE §3 BINDING:** Every dispatch announcement and every SEG invocation uses the verbatim phrase "Sonnet 4.6". Never "Sonnet 4.5" or any version-variant. Parent: `canon_statute_3_sonnet_4_6_sub_agent_default_every_dispatch_explicit_model_param_bp077` (pearl_8b0c6fb05fd9f38a). Pre-dispatch self-audit: parameter AND announcement compliance both required. Every SEG param: `model: "sonnet"`.

---

### Context

v0.1.48 shipped (DRAFT, Founder ratify pending). The strategic pivot landed: Founder verbatim 2026-06-11 — **"I want to work on the LEAN version — where it loads just the first two screens of the MnemosyneC.ai. And then it actually downloads Actual Ollama and Actual Gemma 4 12b."**

This is the Off-the-Street test canon (`[[feedback_off_the_street_test_naming]]`): a cold stranger landing on the app must see value, click one button, get a working AI. The current welcome flow with SKU tier picker fails this. This Yoke replaces it.

**Known v0.1.48 failure modes (carry-forward diagnosis — DO NOT ignore):**

1. `libuv -4058 (ENOENT on subprocess spawn)` — the `sku-upgrade-to` IPC handler at `src/main/index.ts` line 3091 resolves the Ollama binary with its OWN `existsSync` + `spawn` logic (`ollamaExe = join(__dirname, '..', '..', 'resources', 'ollama', 'ollama.exe')`). This duplicated-path code is entirely separate from `OllamaManager.init()` which FIX-1 made robust. Same error class, different code path.

2. `"Could not reach the local AI engine"` — same duplicated-code-path bug. `OllamaManager` is never consulted before the spawn in the SKU handler.

3. `runAutoPrepareIfNeeded()` at `src/main/index.ts` line 1373 has the SAME pattern: its own `existsSync` + `spawn` outside OllamaManager. Three separate Ollama-spawn code paths exist in the codebase. All three must route through OllamaManager after this Yoke.

**Truth-Always note on benchmark table:** The Big-4 numbers in the task brief come from `librarian-mcp/r10_cross_vendor/results/CADRE_BENCHMARK_RESULTS_BP067.md` (test date 2026-05-30, Haiku-graded, Cohen's κ 0.936). Knight reads that file directly in SEG-V0149-P0-LEAN-WELCOME — do NOT hardcode.

---

### HARD-BINDING BLOCK

| Canon ref | One-liner |
|---|---|
| `[[feedback_actual_runtime_verify_for_runtime_bugs_bp078]]` | Source change alone does NOT verify a runtime fix. Diagnostic log required. |
| `[[feedback_verify_seg_output_before_claiming_inflight]]` | Dispatched ≠ executing ≠ landed. |
| `[[feedback_every_click_visible_feedback_canon_bp078]]` | Every click gives visible feedback. Silence = broken. |
| `[[feedback_long_running_progress_heartbeat_canon_bp078]]` | Any op >3s shows progress: bar > step-by-step > heartbeat. 5 GB pull = visible progress bar mandatory. |
| `[[feedback_ux_seg_screenshot_mandatory_bp078]]` | UX-touching SEGs capture packaged-build screenshot. Source-only verify is a canon violation. |
| `[[feedback_knight_yoke_seg_mandatory]]` | "use Sonnet 4.6 SEGs for ALL work" — hard binding. |
| `[[feedback_explicit_founder_ratify_before_publish]]` | Nothing publishes without Founder explicit "publish it / push / send / fire". |
| `[[feedback_forward_pressure_ratify_is_not_verified_ratify_bp080]]` | Forward-pressure ratify ≠ verified ratify. A stamp given to "move forward" is not a GREEN gate. |
| `[[feedback_off_the_street_test_naming]]` | Never "Wife Test" publicly. Use "Off the Street test" — gender-neutral, means any cold stranger. |
| `[[reference_amnesia_substrate_cure_dr_mnemosynec_canon]]` | H1 canon: "Your AI has Amnesia. Dr. MnemosyneC has the Cure." Elephant mascot. Diagnostic-positive register. |
| Statute §3 | All SEGs Sonnet 4.6, must say "Sonnet 4.6" verbatim in every announcement AND every model: param. |
| Statute §13 | Substrate retrieval: `pheromone_query` first. `search_knowledge` = product-index only, NOT substrate. |
| `[[reference_cephas_hugo_every_time_ship_rule_bp079]]` | Every SHIP SEG bumps firebase.json X-LB-Version + X-LB-Build-Hash on BOTH cephas + mnemosyne targets, data/version.json, content/download/_index.md, static/download/latest.yml. |

---

### SEG-V0149-P0-LEAN-WELCOME (Sonnet 4.6) — NEW `LeanWelcomeView.tsx` — FIRST INSTALL ONLY

**File to create:** `src/renderer/components/LeanWelcomeView.tsx`

This replaces `WelcomeView.tsx` for new installs only (no `sku_tier.json` detected). Existing users skip it entirely — see SEG-V0149-P1-BACKWARD-COMPAT.

**Two-screen structure.** Both screens are contained in this single component. Screen toggle via `useState<1|2>` (default 1). No routing.

---

#### Screen 1 — Amnesia + Cure

Render the following verbatim marketing content. All text below is canonical — Knight may add punctuation/formatting but NOT rewrite the substance:

**H1 (two lines):**
> Your AI has Amnesia.
> Dr. MnemosyneC has the Cure.

**Pronunciation note (render below H1, smaller):**
> Mnemosyne (neh-MOZ-uh-nee) is the Greek goddess of memory.

**Body paragraph:**
> Every time you start a new session, your AI forgets everything. Your projects, your preferences, your past conversations — gone. Dr. MnemosyneC gives your AI a permanent, private memory that actually stays.

**Compatibility line:**
> Works alongside ChatGPT, Claude, Gemini, or any AI you already use.

**Privacy line:**
> All your data stays on your own computer. No cloud. No account required.

**Pricing line:**
> Free to use. A $5/year membership unlocks the full cooperative.

**PRIMARY CTA (the only action on screen 1):**
> [button] Download MnemosyneC v0.1.49 for Windows

Below the button:
> Free forever · No ads · No strings · Data stays on your computer

**Mascot:**
> `<img src="icons/mnemosynec-mark.png" />` — same graceful-fallback pattern as existing `WelcomeView.tsx` (`onError` hides the element).

**"What your first session looks like" — 3-step inline explainer:**
1. Tell it something
2. Come back later
3. It remembers

**Screen 2 CTA (secondary, below the fold on screen 1):**
> [text link or ghost button] "Does it actually work? See the proof →" — scrolls or transitions to Screen 2.

---

#### Screen 2 — Does it actually work? / PROVE IT YOURSELF

**H2:**
> Does it actually work?

**Sub-heading:**
> 75 questions · 4 AI vendors · real test run 2026-05-30. No tricks.

**Benchmark table (Truth-Always: read from source on disk):**

Knight SEG MUST read `C:\Users\Administrator\Documents\LianaBanyanPlatform\librarian-mcp\r10_cross_vendor\results\CADRE_BENCHMARK_RESULTS_BP067.md` and pull the Big-4 table from the "Big-4 Baseline" section. Do NOT hardcode these numbers; do NOT rely on memory. The canonical numbers from that file (as of 2026-06-11) are:

| Model | WITHOUT MnemosyneC | WITH MnemosyneC | Lift |
|---|---|---|---|
| Claude Opus 4.8 | 6.0% | 89.3% | +83.3pp |
| GPT-5.5 | 19.3% | 93.3% | +74.0pp |
| Llama 3.1 8b | 6.0% | 78.0% | +72.0pp |
| Gemini 3.5 Flash | 8.0% | 90.7% | +82.7pp |

Column header labels: "WITHOUT MnemosyneC" / "WITH MnemosyneC" (not "COLD" / "HOT" — those are internal terms).

**Banyan Metric explainer paragraph (render below table):**
> The Banyan Metric measures memory-specific accuracy: does the AI correctly recall facts from a prior session when those facts are in the cooperative substrate? COLD = no substrate (fresh session). HOT = substrate loaded. Every test is independently repeatable. Cohen's kappa 0.936 (grader agreement). Test date: 2026-05-30. Source: BP067 hash-verified.

**Back navigation:**
> [back link] ← Back to Download

---

#### Style requirements for LeanWelcomeView

- Match the dark-background aesthetic of existing `WelcomeView.tsx` (`#0d1117` overlay, `#111827` card).
- Screen 1 PRIMARY CTA: large, prominent button — green (#6ee7b7 tonal family), full card width.
- NO SKU tier picker. NO "Prove it with a test" vs "Just use it" doorway cards. ONE action.
- The component receives `onComplete: () => void` — called after the install flow completes (from SEG-V0149-P0-INSTALL-FLOW).
- Minimal interface: no mesh checkbox, no share button on screen 1. Those are mainline-flow features.
- Screen 2 is informational only — no action buttons except "Back to Download" returning to screen 1.

**Source of truth discipline:** The `_index.md` at `Cephas/cephas-hugo/content/_index.md` contains the canonical cooperative framing. If screen 1 copy needs cooperative-flavor context for supporting text, source from there. Truth-Always binding applies.

---

### SEG-V0149-P0-INSTALL-FLOW (Sonnet 4.6) — SINGLE-CTA INSTALL SEQUENCE

When the user clicks "Download MnemosyneC v0.1.49 for Windows" on Screen 1 of `LeanWelcomeView`, this flow fires. The IPC handler lives in `src/main/index.ts`. The new handler name: `lean-install-start`.

**CRITICAL RULE: every state transition in this flow fires a visible IPC event to the renderer. No silent steps. Per `[[feedback_every_click_visible_feedback_canon_bp078]]`.**

**Step 1 — Detect Ollama:**
- Call `ollamaManager.getStatus()` (already available from the initialized `OllamaManager` instance).
- If `status.running === true` → emit IPC `lean-install-status: { step: 'ollama_ready', message: 'Found your local AI engine. Setting up...' }` → skip to Step 3.
- If Ollama process is not running but binary exists at the bundled path (`join(process.resourcesPath, 'ollama', 'ollama.exe')`) or pre-installed path → call `ollamaManager.init()` (not a new spawn; the CANONICAL init path) → await result → proceed to Step 2b.
- If no Ollama anywhere → Step 2a.

**CRITICAL PATH RULE: use `ollamaManager.init()` / `ollamaManager` methods EXCLUSIVELY. ZERO new `spawn('ollama', ...)` calls outside OllamaManager. This is the whole point of this SEG.**

**Step 2a — No Ollama installed:**
Emit IPC `lean-install-status: { step: 'need_ollama', message: 'Opening browser to download Ollama...' }`.

Two sub-options — Knight decides and documents the choice in Yoke-return:

- **Option A (simpler):** `shell.openExternal('https://ollama.com/download/windows')`. Emit follow-up message: `{ step: 'waiting_ollama', message: 'Install Ollama, then come back and click Resume.' }`. Show a "Resume" button in the renderer that re-fires `lean-install-start` (polls detection again).

- **Option B (bundled silent install):** If the NSIS build already bundles `ollama-setup.exe` in `extraResources` — check `join(process.resourcesPath, 'ollama-setup.exe')` exists. If yes, invoke it silently (`spawn(..., ['/S'])`) with a visible progress heartbeat. If no, fall back to Option A.

Knight: evaluate Option B against (a) Ollama MIT license — YES, redistribution permitted; (b) bundled installer size — the `ollama.exe` binary is already bundled in v0.1.48 (`resources/ollama/ollama.exe`). An NSIS setup wrapper is NOT needed; `ollama.exe` itself is the runtime. If the bundled `ollama.exe` can serve as the Ollama installation without a separate installer setup, document this path. The simpler path is preferred if correct.

**Step 2b — Ollama on disk, not running:**
`ollamaManager.init()` handles starting it. Wire the `onStatusUpdate` callback so every branch transition emits `lean-install-status` IPC to the renderer. The renderer shows each step in plain language.

**Step 3 — Pull gemma4:12b:**
- Check if `gemma4:12b` is already pulled: `ollamaManager.isModelAvailable('gemma4:12b')` (Knight adds this method if not present, reading from `ollama list` JSON output).
- If already available → emit `lean-install-status: { step: 'model_ready', message: 'Full AI model already on your machine.' }` → skip to Step 4.
- If not available: begin pull via `ollamaManager.pullModel('gemma4:12b', progressCallback)`. The `pullModel` method already exists (it is used by the mainline SKU flow — Knight finds it in `ollama_manager.ts`).
- Emit IPC `lean-install-progress` events every 1–2 seconds (heartbeat canon). Payload: `{ bytesDownloaded, totalBytes, percentComplete, speedLabel, eta_s }`.
- Renderer shows a real progress bar with bytes, %, and ETA. NOT a spinner. NOT "please wait". Per `[[feedback_long_running_progress_heartbeat_canon_bp078]]`.

**Step 4 — Done:**
- Write `sku_tier.json: { tier: 'full', model: 'gemma4:12b' }` to `app.getPath('userData')`.
- Emit `lean-install-status: { step: 'done', message: 'Your AI is ready.' }`.
- Call `onComplete()` in the renderer — app advances to mainline Frame view.

**IPC channel names (canonical for this flow):**
- `lean-install-start` — renderer → main (fire the sequence)
- `lean-install-status` — main → renderer (step transitions)
- `lean-install-progress` — main → renderer (pull byte progress)
- `lean-install-error` — main → renderer (fatal or recoverable error with message + retry flag)

**Error handling:**
- If any step fails, emit `lean-install-error: { message, retryable: boolean }`.
- Renderer shows the error text visibly + "Try again" button if `retryable: true`.
- No silent failures. Per `[[feedback_every_click_visible_feedback_canon_bp078]]`.

---

### SEG-V0149-P0-AUDIT-DUP-PATHS (Sonnet 4.6) — FIND AND CONSOLIDATE OLLAMA DETECTION CODE PATHS

**Scope:** Find every location in `src/main/` that spawns an Ollama process OR detects Ollama outside of `OllamaManager.ts`. Refactor each to route through OllamaManager.

**Known duplicates (Bishop diagnosis — verify and fix all):**

1. `src/main/index.ts` line ~3091 — `safeHandle('sku-upgrade-to', ...)` — has own `existsSync` + `spawn('ollama', ['pull', ...])`. This is the root cause of the v0.1.48 -4058/ENOENT failures. Replace with `ollamaManager.pullModel(modelName, progressCallback)`.

2. `src/main/index.ts` line ~1373 — `runAutoPrepareIfNeeded()` — has own `existsSync` + `spawn(ollamaCmd, ['pull', AUTO_PREPARE_MODEL])`. Replace with `ollamaManager.pullModel(AUTO_PREPARE_MODEL, progressCallback)` gated by the same `isGemma4Ready()` check.

3. Any other `spawn.*ollama` occurrences — grep `src/main/` for `spawn` calls with `ollama` in args. Each must either be inside OllamaManager or be eliminated.

**Acceptance criteria:**
- `grep -r "spawn.*ollama" src/main/ --include="*.ts"` returns ONLY occurrences inside `ollama_manager.ts`.
- All `pull` operations route through `ollamaManager.pullModel()`.
- All Ollama detection routes through `ollamaManager.getStatus()` or `ollamaManager.init()`.
- The `lean-install-start` IPC handler (SEG-V0149-P0-INSTALL-FLOW) is the ONLY new entry point, and it uses OllamaManager exclusively.

Deliver: grep output BEFORE consolidation (showing all duplicate paths) + grep output AFTER (showing zero duplicates outside OllamaManager) + code diff.

---

### SEG-V0149-P1-BACKWARD-COMPAT (Sonnet 4.6) — EXISTING USERS SKIP LEANWELCOME

**Scope:** The `LeanWelcomeView` is for first installs only.

**Detection logic (in `src/renderer/App.tsx` or wherever the welcome gate is wired):**
- Check `localStorage.getItem('mnemosynec_onboarding_complete')` (the existing `LS_ONBOARDING_COMPLETE` constant from `WelcomeView.tsx`).
- ALSO check via IPC: does `sku_tier.json` exist at `app.getPath('userData')`?
- If EITHER is true → skip LeanWelcomeView, go straight to Frame/mainline.
- If NEITHER is true → show LeanWelcomeView (new install path).

After LeanWelcomeView completes (onComplete fired):
- Set `localStorage.setItem('mnemosynec_onboarding_complete', 'true')`.
- App proceeds to mainline Frame as normal.

Knight: check whether `WelcomeGatePage.tsx` (`src/pages/WelcomeGatePage.tsx`) or `WelcomeGate.tsx` (`src/components/WelcomeGate.tsx`) already handles this routing. If so, wire LeanWelcomeView into that existing gate. Do NOT create a parallel gate.

**Per BP078 cohesion canon:** Do not break existing users. The SKU tier picker, `WelcomeView.tsx`, and all existing `Layer2UseIt`/`Layer2ProveIt` surfaces remain untouched — they are used for the settings/mainline flow post-onboarding.

---

### SEG-V0149-P1-OFFTHESTREET-VERIFY (Sonnet 4.6) — PAWN OFF-THE-STREET SIMULATION

**Scope:** Simulate a cold-stranger walk through `LeanWelcomeView` and report what is confusing, unclear, or requires background knowledge that a cold stranger would not have.

**Instructions for this SEG:**
- Read `src/renderer/components/LeanWelcomeView.tsx` (as created by SEG-V0149-P0-LEAN-WELCOME).
- Adopt the persona: you are someone who has never heard of MnemosyneC, cooperative tech, Mnemosyne, eblets, or Liana Banyan. You just opened an app.
- Walk through Screen 1 top to bottom. List anything that:
  - Uses jargon a stranger would not understand.
  - Creates friction before the primary CTA.
  - Has ambiguous copy.
  - Violates the Off-the-Street test (clarity, trust, action).
- Walk through Screen 2 (benchmark table + Banyan Metric explainer). Same audit.
- Return a numbered list of findings, each with: (a) the specific element, (b) the problem, (c) a suggested fix. Maximum 10 findings.

Deliver: numbered findings list (not prose). Do NOT modify the source — audit only.

---

### SEG-V0149-P2-CLEANUP-PRIOR-FAILURES (Sonnet 4.6) — BACKLOG FROM V0.1.48

Six discrete cleanup items. Do all six in this SEG. They are small.

1. **`sku_tier.json` write-path silence:** The `writeFileSync` inside `sku-upgrade-to` `'close'` handler (index.ts line ~3149) is wrapped in `try { ... } catch { /* non-fatal */ }`. Add a diagnostic log emit on failure: `console.warn('[SKU] Failed to write sku_tier.json:', err)`. Non-fatal behavior unchanged; just no longer silent.

2. **Diagnostic log "SKU tier: none" cosmetic:** The diagnostic log currently emits `SKU tier: none` when no tier file exists. Change to `SKU tier: not yet set (fresh install)` to be accurate and not alarming.

3. **caithedral-core copy script PowerShell quoting bug:** If there is a `scripts/copy-caithedral.ps1` or similar that generates 200+ noise lines in the build log due to quoting issues — find it, fix the quoting. If not present, skip this item and note its absence.

4. **Run Diagnostic discoverability:** Currently the Run Diagnostic button is buried inside Settings → Advanced (collapsible, bottom). Move it or add a prominent alias entry at the top of the Settings panel, labeled "Run Diagnostic" with a subtitle "Check your AI engine and memory system health." The deep nested location remains for power users; the top-of-settings alias is the discoverability fix.

5. **Gauntlet vs Settings/Advanced naming clarity:** If "Gauntlet" appears in the UI (header, menu, or tab) but the user-visible section is called "Advanced" — reconcile. Pick one name and use it consistently. Document the decision in the Yoke-return.

6. **Mandatory live-URL HEAD verify in every SHIP SEG:** Add a `// EVERY TIME: post-deploy verify` comment block to the SHIP SEG template in `src/main/index.ts` or wherever SHIP is documented, making the live-URL HEAD + GET verify canon visually mandatory by convention. This is a discipline bake-in, not functional code.

---

### SEG-V0149-VERIFY (Sonnet 4.6) — CLEAN-VM LEAN FLOW VERIFY

**Environment requirements (non-negotiable):**
- Fresh Windows VM or clean profile.
- NO pre-installed Ollama.
- NO existing `sku_tier.json`.
- NO existing `mnemosynec_onboarding_complete` localStorage entry.
- Install from shipped v0.1.49 `.exe` installer — NOT from dev tree.

**Five MANDATORY captures — HOLD if any missing:**

(a) **LeanWelcome Screen 1 renders correctly:** Screenshot showing the two-line hero ("Your AI has Amnesia. / Dr. MnemosyneC has the Cure."), the primary CTA button ("Download MnemosyneC v0.1.49 for Windows"), and the mascot. No SKU tier picker visible.

(b) **Install flow visible feedback:** Screenshot OR screen recording still showing the `lean-install-status` step messages as the Ollama detect/start path runs. The UI must show visible state — not a blank screen.

(c) **gemma4:12b pull progress bar:** Screenshot showing a real progress bar with bytes downloaded / total bytes / percentage / ETA during the pull. NOT a spinner. NOT a static "please wait". Per `[[feedback_long_running_progress_heartbeat_canon_bp078]]`.

(d) **App advances to Frame after pull completes:** Screenshot showing the mainline Frame view (not WelcomeView, not LeanWelcomeView) with a working AI response visible. This is the "it works" gate.

(e) **Existing-user re-install — no LeanWelcome:** On a machine that already has `sku_tier.json` present, confirm LeanWelcomeView is NOT shown — app goes straight to Frame. Screenshot of Frame on launch (no welcome screen).

**Plus standard carry-forward captures:**
- Window top showing visible buffer above title bar (FIX-3 carry-forward — confirm no regression).
- Diagnostic log excerpt showing: `ollamaPath=<path>`, `branch=<branch>`, `activeModel=gemma4:12b`, `userData=...\mnemosynec\`.
- `node scripts/assert-bundled-ollama-in-installer.mjs` PASS on v0.1.49 installer.

Do NOT mark VERIFY complete if any capture is missing. State explicitly which captures are present and which are pending.

Per `[[feedback_actual_runtime_verify_for_runtime_bugs_bp078]]` and `[[feedback_ux_seg_screenshot_mandatory_bp078]]`.

---

### SEG-V0149-SHIP (Sonnet 4.6) — BUILD + TAG + DRAFT RELEASE + FULL EVERY-TIME SWEEP

**HARD GATE: do NOT execute until VERIFY is GREEN (all eight captures confirmed).**

**Per `[[reference_cephas_hugo_every_time_ship_rule_bp079]]` — ALL of the following are mandatory in every SHIP SEG. No exceptions. No partial sweeps.**

1. **Bump version to `0.1.49`:**
   - `package.json` `"version"` field.
   - `electron-builder.json` / `electron-builder.yml` (whichever stores version separately).

2. **Build:** `npm run dist:win` (or equivalent).

3. **Assertion:** `node scripts/assert-bundled-ollama-in-installer.mjs` — must PASS (ollama.exe ✓, floor model blob ✓, vc_redist.x64.exe ✓).

4. **SHA-256** the installer.

5. **`Cephas/cephas-hugo/static/download/latest.yml`** — update sha512 and version.

6. **`Cephas/cephas-hugo/data/version.json`** — bump to `"version": "0.1.49"`, `"filename": "MnemosyneC-Setup-0.1.49.exe"`.

7. **`Cephas/cephas-hugo/content/download/_index.md`** — update the download link URL and SHA-256 line to reflect v0.1.49.

8. **`Cephas/cephas-hugo/firebase.json`** — bump `X-LB-Version` to `v0.1.49` and `X-LB-Build-Hash` to `v0.1.49+<short-git-hash>` on BOTH the `cephas` target `/download/**` headers AND the `mnemosyne` target `/download/**` headers.

9. **GitHub Release as DRAFT** — title: `v0.1.49 — Lean Install Experience: two-screen welcome + single-CTA Ollama+gemma4:12b install + duplicate Ollama path consolidation`.

   Release body:
   ```
   New installs:
   - LeanWelcomeView replaces SKU tier picker for first launch. Two screens: (1) "Your AI has Amnesia" + single-CTA install button, (2) benchmark proof table (75 questions, 4 vendors, 2026-05-30).
   - Single-CTA install: click one button, Ollama detected or installed, gemma4:12b pulled with real progress bar (bytes/ETA), app advances to Frame. No decisions required.

   Bug fixes:
   - Consolidated all Ollama spawn paths through OllamaManager (was: 3 separate spawn code paths; now: 1). Root cause of v0.1.48 libuv -4058 ENOENT and "Could not reach the local AI engine" errors.
   - sku_tier.json write failure now logs diagnostic warning (was: silent).
   - Run Diagnostic promoted to top of Settings panel for discoverability.

   Carry-forward from v0.1.48:
   - gemma4:12b SKU promotion, Mesh Glance page, substrate paths, userData rename, diagnostic enrichment.
   ```

10. **Post-deploy live-URL verify (mandatory — EVERY TIME):**
    - `HEAD https://mnemosynec.ai/download/` — confirm `X-LB-Version: v0.1.49` in response headers.
    - `GET https://mnemosynec.ai/download/` — confirm page renders (HTTP 200) and version string visible in body.
    - Document both results in Yoke-return.

11. **Write gate status** into this Yoke file as a new `## GATE STATUS` section:
    ```
    GATE: DRAFT — awaiting Founder ratify
    ```

**Knight does NOT self-stamp GREEN. Founder ratifies in own words. Per `[[feedback_explicit_founder_ratify_before_publish]]` and `[[feedback_forward_pressure_ratify_is_not_verified_ratify_bp080]]`.**

---

### Open Question (requires Founder input before Knight can close SEG-V0149-P0-INSTALL-FLOW Step 2a)

**Q1 — Ollama bundling decision:**
The `resources/ollama/ollama.exe` binary is already in the NSIS payload (confirmed by `assert-bundled-ollama-in-installer.mjs`). This binary IS a working Ollama runtime — it can be invoked directly. Knight should determine: does invoking the bundled `ollama.exe serve` constitute a full Ollama installation on the machine, or does the user also need the Ollama tray-app / system service installer from `ollama.com/download/windows`?

If the bundled binary is sufficient for headless serve + pull — Knight takes Option A-prime: use bundled binary entirely, never open the browser, no external download needed. This is the cleanest UX and the Founder's stated preference ("Actual Ollama" = the working engine, not specifically the Windows installer experience).

If a separate Ollama system install is required for model storage paths / tray app features the user expects — Knight takes Option A: open browser, show "Resume" button, wait for user to install.

Knight surfaces this finding in the Yoke-return with a recommendation. If Knight concludes the bundled binary is sufficient, that becomes the canonical path and no Founder input is needed. If Knight concludes the system installer is required, surface as open question for Founder.

---

### Acceptance Gate

All eight VERIFY captures required for HARD GATE GREEN. Anything short = DRAFT:

1. (a) LeanWelcome Screen 1 screenshot — no SKU tier picker, hero + CTA visible.
2. (b) Install flow visible feedback screenshot.
3. (c) gemma4:12b pull progress bar screenshot (bytes + % + ETA).
4. (d) Frame view after pull with working AI response.
5. (e) Existing-user re-install: Frame on launch, no LeanWelcome.
6. Window top buffer screenshot (FIX-3 carry-forward).
7. Diagnostic log excerpt (ollamaPath, branch, activeModel=gemma4:12b, userData=...mnemosynec).
8. Assertion PASS on v0.1.49 installer.

Plus: post-deploy live-URL HEAD + GET verify results (SHIP step 10).

---

### Reply Contract

Knight Yoke-returns with:

- **SEG-V0149-P0-LEAN-WELCOME:** Confirmation that benchmark numbers were READ from disk (file path + line number), not hardcoded. Code diff for `LeanWelcomeView.tsx`.
- **SEG-V0149-P0-INSTALL-FLOW:** Code diff for `lean-install-start` IPC handler + renderer wiring. Ollama bundling decision documented (Option A / A-prime / B + rationale).
- **SEG-V0149-P0-AUDIT-DUP-PATHS:** grep-before + grep-after output. Code diff consolidating all spawn paths through OllamaManager.
- **SEG-V0149-P1-BACKWARD-COMPAT:** Code diff for gate routing. Confirmation which existing file (`WelcomeGatePage.tsx` or other) was used.
- **SEG-V0149-P1-OFFTHESTREET-VERIFY:** Numbered findings list (max 10) from cold-stranger walk.
- **SEG-V0149-P2-CLEANUP-PRIOR-FAILURES:** Status for all 6 items (done / skipped-with-reason).
- **SEG-V0149-VERIFY:** All 8 captures present, or explicit HOLD stating which are pending.
- **SEG-V0149-SHIP:** SHA-256 + GitHub Release DRAFT URL + GATE: DRAFT + post-deploy HEAD/GET verify results.
- **Truth-Always flags:** any finding where Bishop's diagnosis above was wrong or incomplete.

If VERIFY is PENDING-FOUNDER: Knight states "HOLD — SHIP blocked pending Founder verify on clean-VM install. All commits staged. Resume SHIP after Founder confirms captures (a)-(e)."

---

### Statute Reminders

- §3: "Sonnet 4.6" verbatim in every SEG announcement AND every `model:` parameter. Not "Sonnet 4.5". Not "the model". Verbatim.
- §12: Ask-Knight-First for anything Knight could know before surfacing to Founder.
- §13: Substrate retrieval in SEG discovery = `pheromone_query` first, `consult_scribes` second. Do NOT use `search_knowledge` for substrate facts.
- `[[feedback_actual_runtime_verify_for_runtime_bugs_bp078]]`: The Ollama path consolidation (SEG-V0149-P0-AUDIT-DUP-PATHS) is a runtime-behavior fix. Source change alone does NOT verify it. The VERIFY captures are the gate.
- `[[feedback_ux_seg_screenshot_mandatory_bp078]]`: LeanWelcomeView is a UX-touching SEG. All five VERIFY (a)-(e) screenshots are mandatory. Not a source-only verify.
- `[[feedback_long_running_progress_heartbeat_canon_bp078]]`: The gemma4:12b pull is a 5 GB operation. A real progress bar (bytes + % + ETA) is MANDATORY. A spinner or "please wait" is a canon violation.
- `[[feedback_every_click_visible_feedback_canon_bp078]]`: The "Download MnemosyneC" CTA must produce IMMEDIATE visible feedback on click (step message, spinner transition, or IPC-driven status). No silent pause > 300ms.
- `[[feedback_forward_pressure_ratify_is_not_verified_ratify_bp080]]`: Knight does not self-stamp GREEN. DRAFT stays DRAFT until Founder's own words ratify.
- `[[feedback_off_the_street_test_naming]]`: Off-the-Street test. Not "Wife Test".

---

### Paste-Ready Wake-Up

Knight — v0.1.48 is DRAFT, Founder ratify pending. The next build is v0.1.49: the Lean Install Experience. Founder's verbatim directive: "I want to work on the LEAN version — where it loads just the first two screens of the MnemosyneC.ai. And then it actually downloads Actual Ollama and Actual Gemma 4 12b." The Off-the-Street test: cold stranger lands, sees value, clicks one button, gets a working AI. The current SKU tier picker flow fails this. Here is what you build. Use Sonnet 4.6 SEGs for ALL work. Dispatch all P0 SEGs in parallel immediately. (1) Create `src/renderer/components/LeanWelcomeView.tsx` — two screens: Screen 1 = hero "Your AI has Amnesia. / Dr. MnemosyneC has the Cure." + pronunciation note + body paragraph + compatibility line + privacy line + pricing line + ONE primary CTA button "Download MnemosyneC v0.1.49 for Windows" + mascot + 3-step explainer + link to Screen 2. Screen 2 = "Does it actually work?" + benchmark table (READ from `C:\Users\Administrator\Documents\LianaBanyanPlatform\librarian-mcp\r10_cross_vendor\results\CADRE_BENCHMARK_RESULTS_BP067.md` Big-4 Baseline section — do NOT hardcode numbers) + Banyan Metric explainer. No SKU picker. No doorway cards. One action. (2) Wire new `lean-install-start` IPC handler: detect Ollama via `ollamaManager` (CANONICAL path ONLY), start if needed via `ollamaManager.init()`, pull `gemma4:12b` via `ollamaManager.pullModel()` with real byte/ETA heartbeat progress bar every 1-2s. Write `sku_tier.json` on success. Call `onComplete()`. No new `spawn('ollama', ...)` calls outside OllamaManager. (3) Grep `src/main/` for ALL spawn calls with ollama in args — there are THREE outside OllamaManager (sku-upgrade-to handler line ~3091, runAutoPrepareIfNeeded line ~1373, plus any others). Consolidate ALL to route through `ollamaManager.pullModel()`. This is the root cause of the v0.1.48 -4058/ENOENT failures. Zero duplicate Ollama-spawn paths is the acceptance criterion. (4) Gate LeanWelcomeView to first-install only: if `sku_tier.json` exists OR `mnemosynec_onboarding_complete` localStorage is set, skip to Frame. Wire into existing `WelcomeGatePage.tsx` or `WelcomeGate.tsx` — do NOT create a parallel gate. (5) Pawn Off-the-Street audit: read LeanWelcomeView as a cold stranger, return numbered findings list (max 10). (6) Six cleanup items: sku_tier.json write diagnostic warning; "SKU tier: none" → "not yet set (fresh install)"; caithedral copy script PowerShell quoting noise; Run Diagnostic to top of Settings; Gauntlet vs Advanced naming reconcile; EVERY TIME verify comment in SHIP template. VERIFY: 8 captures mandatory — (a) LeanWelcome screen 1 screenshot no picker, (b) install flow visible feedback, (c) gemma4:12b pull progress bar with bytes+ETA, (d) Frame with working AI response, (e) existing-user skip LeanWelcome, plus window top buffer carry-forward, diagnostic log excerpt, assertion PASS. SHIP: bump to 0.1.49, build, assertion PASS, SHA-256, latest.yml, data/version.json, content/download/_index.md, firebase.json X-LB-Version bump on BOTH cephas + mnemosyne targets, GitHub Release DRAFT, post-deploy HEAD+GET verify on https://mnemosynec.ai/download/. DRAFT only. Founder ratifies in own words. Open question: Knight determines whether the bundled `resources/ollama/ollama.exe` (already in payload) is sufficient as a full Ollama runtime (headless serve + pull) or whether the system installer from ollama.com is required — recommend in Yoke-return. Use Sonnet 4.6 SEGs for ALL work — Statute §3 verbatim in every announcement.

- Bishop SEG-V0149-LEAN-INSTALL-YOKE — BP080 — pinned 2026-06-11T00:00:00Z

---

## BLACK MAMBA PASTE-READY DISPATCH (forward this block verbatim to Knight)

Knight, dispatch 5 parallel Sonnet 4.6 SEGs RIGHT NOW, then 2 sequential synthesis SEGs. Sonnet 4.6 verbatim in every announcement (Statute §3). Each SEG below is self-contained scope; do NOT re-decompose; do NOT ask for clarification before firing; fire all 5 in parallel in a single message.

**SEG-V0149-P0-LEAN-WELCOME (Sonnet 4.6) — NEW `LeanWelcomeView.tsx`:** Create `src/renderer/components/LeanWelcomeView.tsx`. Two screens via `useState<1|2>` default 1. Match dark-bg aesthetic of existing `WelcomeView.tsx` (#0d1117 overlay, #111827 card). Screen 1: H1 "Your AI has Amnesia. / Dr. MnemosyneC has the Cure." (two lines) + pronunciation note "(neh-MOZ-uh-nee) is the Greek goddess of memory" + body paragraph "Every time you start a new session, your AI forgets everything. Your projects, your preferences, your past conversations — gone. Dr. MnemosyneC gives your AI a permanent, private memory that actually stays." + "Works alongside ChatGPT, Claude, Gemini, or any AI you already use." + "All your data stays on your own computer. No cloud. No account required." + "Free to use. A $5/year membership unlocks the full cooperative." + PRIMARY CTA button (green, full-width) "Download MnemosyneC v0.1.49 for Windows" + tagline "Free forever · No ads · No strings · Data stays on your computer" + mascot img `icons/mnemosynec-mark.png` with graceful onError hide + 3-step explainer "Tell it something / Come back later / It remembers" + ghost link to Screen 2 "Does it actually work? See the proof →". Screen 2: H2 "Does it actually work?" + "75 questions · 4 AI vendors · real test run 2026-05-30. No tricks." + benchmark table (columns: Model / WITHOUT MnemosyneC / WITH MnemosyneC / Lift). CRITICAL — READ TABLE DATA from `C:\Users\Administrator\Documents\LianaBanyanPlatform\librarian-mcp\r10_cross_vendor\results\CADRE_BENCHMARK_RESULTS_BP067.md` Big-4 Baseline section. Do NOT hardcode. Truth-Always. + Banyan Metric explainer paragraph (accuracy, COLD=no substrate, HOT=substrate loaded, kappa 0.936, test date 2026-05-30, BP067 hash-verified) + "← Back to Download" link. Props: `onComplete: () => void`. No SKU picker. No doorway cards. No mesh checkbox. No share button. Deliver: code diff + confirmation of which line numbers in CADRE_BENCHMARK_RESULTS_BP067.md were used as source.

**SEG-V0149-P0-INSTALL-FLOW (Sonnet 4.6) — `lean-install-start` IPC HANDLER:** Add to `src/main/index.ts`. New IPC handler `lean-install-start`. CRITICAL RULE: use `ollamaManager` methods EXCLUSIVELY — zero new `spawn('ollama', ...)` calls. Step 1: `ollamaManager.getStatus()` — if running → emit `lean-install-status: {step:'ollama_ready', message:'Found your local AI engine. Setting up...'}` → skip to Step 3. If not running → `ollamaManager.init()` (canonical path) → Step 2. Step 2: if init fails with no Ollama found → evaluate bundled `join(process.resourcesPath, 'ollama', 'ollama.exe')` — if that binary IS the Ollama runtime (can serve headless + pull), use it and emit `{step:'starting_engine', message:'Starting your AI engine...'}`. If system installer required → `shell.openExternal('https://ollama.com/download/windows')` + emit `{step:'waiting_ollama', message:'Install Ollama, then click Resume.'}` + renderer shows Resume button that re-fires `lean-install-start`. Step 3: `ollamaManager.isModelAvailable('gemma4:12b')` — if available → `{step:'model_ready', message:'Full AI model already on your machine.'}` → Step 4. If not → `ollamaManager.pullModel('gemma4:12b', cb)` — emit `lean-install-progress: {bytesDownloaded, totalBytes, percentComplete, speedLabel, eta_s}` every 1-2s — real progress bar mandatory, NOT spinner. Step 4: `writeFileSync(join(app.getPath('userData'), 'sku_tier.json'), JSON.stringify({tier:'full', model:'gemma4:12b'}))` → emit `{step:'done', message:'Your AI is ready.'}` → renderer calls onComplete(). Error path: emit `lean-install-error: {message, retryable}`. Renderer wiring: in `LeanWelcomeView.tsx`, CTA button fires `window.amplify.leanInstallStart()` — add to preload.ts. Deliver: code diff (index.ts + preload.ts + LeanWelcomeView wiring) + bundled-binary decision with rationale.

**SEG-V0149-P0-AUDIT-DUP-PATHS (Sonnet 4.6) — CONSOLIDATE ALL OLLAMA SPAWN PATHS:** Grep `src/main/` for `spawn` with ollama in args. Known duplicates: (1) `safeHandle('sku-upgrade-to', ...)` line ~3091 — replace `spawn(ollamaCmd, ['pull', modelName])` with `ollamaManager.pullModel(modelName, progressCallback)` + wire `sku-pull-progress` IPC events through the pullModel callback. (2) `runAutoPrepareIfNeeded()` line ~1373 — replace `spawn(ollamaCmd, ['pull', AUTO_PREPARE_MODEL])` with `ollamaManager.pullModel(AUTO_PREPARE_MODEL, cb)`. (3) Any other spawn-ollama occurrences — find and consolidate. Acceptance: `grep -r "spawn.*ollama" src/main/ --include="*.ts"` returns ONLY occurrences inside `ollama_manager.ts`. Deliver: grep-before output + grep-after output + code diff.

**SEG-V0149-P1-BACKWARD-COMPAT (Sonnet 4.6) — LEANWELCOME GATE — FIRST INSTALL ONLY:** Read `src/pages/WelcomeGatePage.tsx` and `src/components/WelcomeGate.tsx`. Wire `LeanWelcomeView` into the existing gate: if `sku_tier.json` exists (IPC check) OR `localStorage.getItem('mnemosynec_onboarding_complete')` is set → skip to Frame. If neither → render `LeanWelcomeView`. On `LeanWelcomeView` `onComplete`: set `localStorage.setItem('mnemosynec_onboarding_complete', 'true')` then advance to Frame. Do NOT create a parallel gate. Do NOT modify `WelcomeView.tsx`, `Layer2UseIt`, or `Layer2ProveIt`. Deliver: code diff (WelcomeGatePage.tsx or WelcomeGate.tsx + App.tsx if needed) + confirmation of which existing file was modified.

**SEG-V0149-P2-CLEANUP-PRIOR-FAILURES (Sonnet 4.6) — 6 CLEANUP ITEMS:** (1) `sku-upgrade-to` close handler catch block — add `console.warn('[SKU] Failed to write sku_tier.json:', err)`. (2) Diagnostic log — change "SKU tier: none" to "SKU tier: not yet set (fresh install)". (3) caithedral-core copy script PowerShell quoting — find `scripts/copy-caithedral.ps1` or similar, fix quoting that produces 200+ noise lines in build log; if not present, note absence. (4) Run Diagnostic — add prominent entry at TOP of Settings panel: label "Run Diagnostic", subtitle "Check your AI engine and memory system health." Deep-nested Advanced location stays; this adds a top alias. (5) Gauntlet vs Advanced — audit all UI surfaces for naming inconsistency; pick one and apply it; document the decision. (6) SHIP SEG discipline — add `// EVERY TIME: post-deploy verify (HEAD + GET https://mnemosynec.ai/download/)` comment block to wherever SHIP is documented/templated. Deliver: code diffs for all 6 items + status (done/skipped-with-reason) per item.

When all 5 parallel SEGs return, run sequential synthesis:

**SEG-V0149-P1-OFFTHESTREET-VERIFY (Sonnet 4.6):** Read `src/renderer/components/LeanWelcomeView.tsx` as created by SEG-V0149-P0-LEAN-WELCOME. Adopt persona: cold stranger, never heard of MnemosyneC/cooperative tech/eblets/Liana Banyan. Walk Screen 1 top to bottom, then Screen 2. For each screen: list anything that (a) uses jargon, (b) creates friction before primary CTA, (c) has ambiguous copy, (d) violates Off-the-Street test. Return max 10 numbered findings, each with: element / problem / suggested fix. No prose. Do NOT modify source. Deliver: numbered findings list only.

**SEG-V0149-VERIFY (Sonnet 4.6, sequential after all P0+P1 SEGs return):** Clean-VM packaged install. 8 MANDATORY captures — HOLD if any missing: (a) LeanWelcome Screen 1 screenshot — hero visible, no SKU picker, CTA visible; (b) Install flow visible feedback screenshot — step message visible in UI; (c) gemma4:12b pull progress bar screenshot — bytes + % + ETA visible, NOT spinner; (d) Frame view with working AI response after pull completes; (e) Existing-user: Frame on launch, no LeanWelcome shown. Plus: (f) window top buffer screenshot (FIX-3 carry-forward); (g) diagnostic log excerpt — ollamaPath, branch, activeModel=gemma4:12b, userData=...mnemosynec; (h) assertion PASS on v0.1.49 installer. Per `[[feedback_actual_runtime_verify_for_runtime_bugs_bp078]]` and `[[feedback_ux_seg_screenshot_mandatory_bp078]]`.

**SEG-V0149-SHIP (Sonnet 4.6, sequential after VERIFY GREEN):** HARD GATE: do NOT execute until all 8 VERIFY captures confirmed. When green: (1) Bump `package.json` + `electron-builder.json` to `0.1.49`. (2) `npm run dist:win`. (3) Assertion PASS — must pass, do not proceed otherwise. (4) SHA-256. (5) `Cephas/cephas-hugo/static/download/latest.yml` — sha512 + version. (6) `Cephas/cephas-hugo/data/version.json` — `"version":"0.1.49"`, `"filename":"MnemosyneC-Setup-0.1.49.exe"`. (7) `Cephas/cephas-hugo/content/download/_index.md` — update download link + SHA-256 line. (8) `Cephas/cephas-hugo/firebase.json` — bump X-LB-Version to `v0.1.49` and X-LB-Build-Hash to `v0.1.49+<short-git-hash>` on BOTH cephas target `/download/**` headers AND mnemosyne target `/download/**` headers. (9) GitHub Release DRAFT — title: "v0.1.49 — Lean Install Experience: two-screen welcome + single-CTA Ollama+gemma4:12b install + duplicate Ollama path consolidation". (10) EVERY TIME post-deploy verify: HEAD `https://mnemosynec.ai/download/` confirm `X-LB-Version: v0.1.49` in response headers; GET confirm HTTP 200 and version string in body. Document both results. (11) Write `GATE: DRAFT — awaiting Founder ratify` into this Yoke file. Knight does NOT self-stamp GREEN. Per `[[feedback_explicit_founder_ratify_before_publish]]` and `[[feedback_forward_pressure_ratify_is_not_verified_ratify_bp080]]`. Deliver: SHA-256 + GitHub Release DRAFT URL + assertion PASS confirmation + post-deploy HEAD/GET results.

Yoke-return: per-SEG status + all 8 VERIFY captures (or HOLD with explicit pending list) + SHA-256 + GitHub Release DRAFT URL + bundled-binary decision + Off-the-Street findings list + Truth-Always flags.

If any SEG announces "Sonnet 4.5" or other version-variant in narration: STOP, fix the announcement, re-fire.

---

## GATE STATUS

GATE: DRAFT — awaiting Knight execution + Founder ratify

---
