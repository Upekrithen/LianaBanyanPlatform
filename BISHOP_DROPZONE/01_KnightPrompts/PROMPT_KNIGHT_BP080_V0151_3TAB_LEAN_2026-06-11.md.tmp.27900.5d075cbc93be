# KNIGHT PROMPT — BP080 · v0.1.51 · RADICAL 3-TAB LEAN UI
# Written: 2026-06-11 · Bishop SEG · §2 Truth-Always · §3 Sonnet 4.6

---

Knight,

**§3 BINDING: All SEGs Sonnet 4.6 verbatim. Every model: param must read `"sonnet"`. Every dispatch announcement must say "Sonnet 4.6". No exceptions. Pre-dispatch self-audit: does your SEG body contain "Sonnet 4.6"? If not — add it before firing.**

**USE SONNET 4.6 SEGs FOR ALL WORK in this Yoke.**

---

## WAKE-UP PARAGRAPH

This Yoke is the strategic pivot Founder verbatim ratified on 2026-06-11: "Seriously the lean version needs to be the Dr. MnemosyneC Elephant, with the chart proof 'does it work?' proof that goes to the Gauntlet tab, and the connection to other machines WAN and LAN is ON the included Gauntlet Test page, and then the Ask A question tab with the Join LB for Better Faster Cheaper button. Then it automatically does all the things. Make it so, please." You are building a 3-tab shell that IS the app for any first-time user. Existing users with advanced history keep their full multi-tab shell. Every SEG below is Sonnet 4.6. Nothing ships without Founder explicit ratify. Runtime evidence — screenshots of the packaged build — is mandatory before marking any SEG complete.

---

## TL;DR

v0.1.51 ships a `LeanShell.tsx` 3-tab wrapper (Home / Gauntlet / Ask) as the default UI for first-time installs. Existing advanced users are preserved automatically. Background automation silently sets up Ollama + gemma4:12b + LAN mesh. Off-the-Street test required before publish. 8 SEGs: 6 parallel + 1 sequential Off-the-Street verify + 1 sequential SHIP.

---

## HARD-BINDING BLOCK

| Canon ref | One-liner |
|---|---|
| `[[feedback_actual_runtime_verify_for_runtime_bugs_bp078]]` | Source change alone does NOT verify. Diagnostic log + screenshot from packaged build required. |
| `[[feedback_ux_seg_screenshot_mandatory_bp078]]` | Every UX-touching SEG captures packaged-build screenshot of affected surface. Source-only = canon violation. |
| `[[feedback_every_click_visible_feedback_canon_bp078]]` | Every clickable element produces visible feedback. Silence = broken by definition. |
| `[[feedback_long_running_progress_heartbeat_canon_bp078]]` | Any op >3s shows progress: real bar > step-by-step > heartbeat. Never silent. |
| `[[feedback_explicit_founder_ratify_before_publish]]` | Nothing publishes without Founder explicit "publish it / push / send / fire". Knight does NOT self-stamp. |
| `[[feedback_off_the_street_test_naming]]` | "Off the Street test" — never "Wife Test". Gender-neutral, means any cold stranger landing cold. |
| `[[feedback_verify_seg_output_before_claiming_inflight]]` | Dispatched ≠ executing ≠ landed. Check output file has real content before reporting progress to Bishop. |
| `[[feedback_knight_yoke_seg_mandatory]]` | "use Sonnet 4.6 SEGs for ALL work" — hard binding in this Yoke. |
| `[[reference_amnesia_substrate_cure_dr_mnemosynec_canon]]` | H1 canon: "Your AI has Amnesia. Dr. MnemosyneC has the Cure." Elephant mascot. Diagnostic-positive register only. |
| `[[feedback_off_the_street_test_naming]]` | Off the Street test. Not Wife Test. |
| `[[canon_electron_31_sandboxed_preload_must_use_require_electron_not_declare_const_bp078_bp079_correction]]` | preload.ts must use `require('electron')` not `import`. Pearl: pearl_8b0c6fb05fd9f38a. |
| Statute §3 | ALL SEGs Sonnet 4.6 verbatim — model param AND announcement. |
| Statute §13 | Substrate: `pheromone_query` first → `consult_scribes` → `search_knowledge` (product-index only). |
| `[[reference_cephas_hugo_every_time_ship_rule_bp079]]` | SHIP SEG bumps firebase.json headers + data/version.json + content/download/_index.md + static/download/latest.yml on BOTH cephas + mnemosyne targets. |

---

## CONTEXT: WHAT LANDED IN v0.1.49 / v0.1.50

- `LeanWelcomeView.tsx` exists: two-screen welcome (Amnesia/Cure + proof table). IPC bridge issues were the v0.1.50 focus.
- `OllamaManager` is the canonical Ollama spawn authority (all three prior rogue spawn paths should have been consolidated in v0.1.49).
- `lean-install-start` IPC handler registered in `src/main/index.ts`.
- `WanStatusBar` present in Kitchen Table view (per v0.1.48).
- `FederationPeerMeshPanel.tsx` — search for this first; reuse if it exists.
- `MnemosyneTabView.tsx` — the existing advanced multi-tab shell (~12+ tabs).

**TRUTH-ALWAYS NOTE:** Knight, use `search_knowledge` / file-read gadgets to confirm which of the above files exist at current HEAD before writing any new code that depends on them. Do not assume v0.1.49/v0.1.50 SEGs fully landed — verify disk state first.

---

## FEATURE FLAG CANON

```typescript
// localStorage key: 'mnemoUiMode'
// Values: 'lean' | 'advanced'
// Default for fresh installs (no mnemosynec_onboarding_complete): 'lean'
// Default for existing users (mnemosynec_onboarding_complete present AND truthy): 'advanced'
// User can override in Settings → "Show advanced features" toggle
```

This flag governs which shell renders. It is set ONCE at first launch (detection logic in `LeanShell.tsx` `useEffect` on mount). Never re-detect after set — respect user's manual toggle.

---

## SEGs — PARALLEL WAVE (all Sonnet 4.6, fire simultaneously)

---

### SEG-V0151-P0-3TAB-SHELL (Sonnet 4.6)

**Goal:** Create `src/renderer/components/LeanShell.tsx` — the 3-tab wrapper that IS the default app for new users.

**File to create:** `src/renderer/components/LeanShell.tsx`

**Tab structure:**

```
[ Home ]  [ Gauntlet ]  [ Ask ]
```

Tab bar: top of window, persistent. Active tab indicator: green underline (#6ee7b7 family). Dark background to match existing aesthetic (#0d1117 / #111827).

**Feature flag detection (on mount, once):**

```typescript
useEffect(() => {
  const stored = localStorage.getItem('mnemoUiMode');
  if (stored) return; // already set — respect it
  const isExistingUser = !!localStorage.getItem('mnemosynec_onboarding_complete');
  localStorage.setItem('mnemoUiMode', isExistingUser ? 'advanced' : 'lean');
}, []);
```

**Render logic:**

```
if (mnemoUiMode === 'advanced') → render <MnemosyneTabView /> (pass-through, zero behavior change)
if (mnemoUiMode === 'lean') → render LeanShell 3-tab UI
```

**Top-of-window thin status bar (shown only when background tasks are mid-setup):**

- Height: 24px, subdued (opacity 0.7, small font).
- Content: "Setting up your AI engine… [progress %]" OR "Connecting to nearby machines…" OR hidden when nothing is mid-setup.
- Driven by IPC events from SEG-V0151-P0-AUTOMATIC-BACKGROUND.
- Per `[[feedback_long_running_progress_heartbeat_canon_bp078]]`: never silent on long ops.

**Settings toggle:**

In whatever Settings panel exists, add: "Show advanced features" → boolean toggle → writes `mnemoUiMode` to 'advanced' or 'lean' → triggers re-render. Label: "Advanced mode (shows all tabs)". No restart required.

**LeanShell.tsx receives no props from existing app entry point change** — wire it in `src/renderer/App.tsx` (or equivalent root): replace direct `<MnemosyneTabView />` render with `<LeanShell />`. `LeanShell` internally decides which shell to show.

**Deliverable:** `LeanShell.tsx` source + diff of `App.tsx` wiring + packaged screenshot of tab bar rendering.

---

### SEG-V0151-P0-HOME-TAB (Sonnet 4.6)

**Goal:** Build the Home tab content component — `src/renderer/components/LeanHomeTab.tsx`.

**Mascot hero:**

```tsx
<img
  src="icons/mnemosynec-mark.png"
  alt="Dr. MnemosyneC"
  style={{ width: 96, height: 96 }}
  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
/>
```

Use the same graceful-fallback pattern as `LeanWelcomeView.tsx`. If a higher-resolution elephant asset exists at `icons/mnemosynec-elephant.png` or similar, prefer it. Search `public/icons/` and `resources/` before hardcoding the path.

**H1 (two lines, verbatim — do NOT rewrite):**

> Your AI has Amnesia.
> Dr. MnemosyneC has the Cure.

**Subhead (2 lines):**

> Every AI forgets everything when you start a new session.
> MnemosyneC gives it a permanent, private memory that stays.

**Proof table (Truth-Always — READ FROM DISK, do not hardcode):**

Knight SEG MUST read:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\librarian-mcp\r10_cross_vendor\results\CADRE_BENCHMARK_RESULTS_BP067.md`

Pull the Big-4 Baseline table (lines 26–33 per the v0.1.49 Yoke reference). Render as an HTML table:

| AI Model | Without MnemosyneC | With MnemosyneC | Lift |
|---|---|---|---|
| Claude Opus 4.8 | [from file] | [from file] | [from file] |
| GPT-5.5 | [from file] | [from file] | [from file] |
| Llama 3.1 8b | [from file] | [from file] | [from file] |
| Gemini 3.5 Flash | [from file] | [from file] | [from file] |

Column headers verbatim: "WITHOUT MnemosyneC" / "WITH MnemosyneC" / "Lift". Not "COLD"/"HOT" (internal terms only).

**Banyan Metric explainer (render below table, smaller text):**

> The Banyan Metric measures memory accuracy: does the AI recall facts from a prior session? All data stays on your computer. Cohen's kappa 0.936 (grader agreement). 75 questions · 4 vendors · 2026-05-30.

**CTA button (primary, green, prominent):**

```
[ See it work yourself → ]
```

On click: switches active tab to "Gauntlet" (calls `setActiveTab('gauntlet')` via prop or context — wire through `LeanShell`). Visible feedback: button briefly shows "Opening Gauntlet…" for 300ms before tab switch.

**Deliverable:** `LeanHomeTab.tsx` source + packaged screenshot showing elephant + H1 + table + CTA.

---

### SEG-V0151-P0-GAUNTLET-PLUS-MESH (Sonnet 4.6)

**Goal:** Extend the existing Gauntlet tab content to embed a WAN/LAN federation panel ABOVE the Gauntlet stages.

**Step 1 — Locate existing Gauntlet component:**

Search `src/renderer/` for the Gauntlet implementation. Prior Yokes reference `MnemosyneTabView.tsx` line ~1078. Use gadgets to find the exact component — it may be a separate `GauntletView.tsx` or embedded in the tab view. DO NOT rewrite from scratch if it exists — extend it.

**Step 2 — Create or reuse `FederationPanel.tsx`:**

Search for `FederationPeerMeshPanel.tsx` and `WanStatusBar` in the platform tree. If `FederationPeerMeshPanel.tsx` exists, reuse it. If `WanStatusBar` exists (confirmed in v0.1.48 Kitchen Table), extract and reuse. DO NOT duplicate WAN state logic.

**Federation panel content (rendered above Gauntlet stages, collapsible — default expanded):**

```
┌─ Connect to Other Machines ───────────────────────────────────────┐
│  This machine:  [LAN IP]  ·  WAN ID: [soccerball short ID]       │
│  LAN peers:    [list of discovered mDNS peers OR "Scanning…"]     │
│  WAN peers:    [connected count OR "None yet"]                    │
│  Federation:   [status badge: CONNECTED / DISCOVERING / OFFLINE]  │
│                                                                    │
│  [Connect via Email ID]   [Refresh Scan]                          │
└────────────────────────────────────────────────────────────────────┘
```

**LAN discovery:** use mDNS auto-discovery already wired in the mesh layer. Surface results here.

**WAN connection affordance:** "Connect via Email ID" opens a small inline form:

```
Enter the MnemosyneC Email ID of the other machine:
[____________] [Connect]
```

This uses the Socceri-Email-Identifier transport (reference: `[[reference_socceri_email_identifier_transport_bp080]]` — if this pearl/eblet exists in substrate, decode it first via `pearl_decode`; if not, wire via whatever WAN relay IPC channel exists in `src/main/`).

**Gauntlet distributed mode:** If 1+ peers connected, show badge: "Running distributed across [N] machines". If solo, "Running on this machine". Do NOT block Gauntlet stages on peer availability — local mode is always valid.

**Every button gives visible feedback per `[[feedback_every_click_visible_feedback_canon_bp078]]`:** "Refresh Scan" shows "Scanning…" spinner for duration. "Connect" shows "Connecting…" then success/error toast.

**Deliverable:** Updated Gauntlet tab source + federation panel source + packaged screenshot showing panel above Gauntlet stages.

---

### SEG-V0151-P0-ASK-TAB (Sonnet 4.6)

**Goal:** Build `src/renderer/components/LeanAskTab.tsx` — the Ask A Question tab.

**Layout (top to bottom):**

1. **Header:** "Ask A Question" (H2, white)
2. **Subhead (small, muted):** "Powered by gemma4:12b running on your own computer. Private by default."
3. **Message history area** (scrollable, flex-grow)
4. **Input row** (bottom, fixed): textarea + Send button
5. **Membership CTA banner** (pinned to very bottom, always visible)

**Chat mechanics:**

- Uses `OllamaManager` via existing IPC channel (search for the chat/stream IPC handler in `src/main/index.ts` — likely `ollama-chat` or `chat-stream`; do NOT create a duplicate handler).
- Model: `gemma4:12b`. If gemma4:12b is not yet pulled, show inline: "Your AI model is still downloading. You can ask questions once it's ready — usually 2–5 minutes." with a progress bar sourced from the background pull events (SEG-V0151-P0-AUTOMATIC-BACKGROUND).
- Persistent history: store messages in `localStorage` key `mnemo_ask_history` (JSON array, max 200 messages, trim oldest when exceeded).
- If user is paid-tier (detect via `localStorage.getItem('mnemo_lb_user_id')` being set AND `sku_tier.json` containing tier ≥ 1), surface an additional model selector: "Also available: Claude · GPT" (routes to existing cloud chat paths if wired, otherwise placeholder "Coming soon for members").

**Send button:** On click → immediately disabled + shows "Thinking…" → streams response token-by-token into message area → re-enables on completion or error. Per `[[feedback_every_click_visible_feedback_canon_bp078]]`.

**Membership CTA banner (pinned bottom, always visible, NOT dismissible):**

```
┌────────────────────────────────────────────────────────────────────┐
│  Join Liana Banyan — Better, Faster, Cheaper · $5/year            │
│  Workers, Builders, and Creators keep 83.3%.  No ads. No VC.      │
│                        [ Join Now → ]                              │
└────────────────────────────────────────────────────────────────────┘
```

"Join Now →" links to the membership flow (use existing `onJoinFlow` IPC or the LB account tab route — search for the existing join/auth trigger before creating a new one).

**Deliverable:** `LeanAskTab.tsx` source + packaged screenshot showing: chat input + sample message + membership banner at bottom.

---

### SEG-V0151-P0-AUTOMATIC-BACKGROUND (Sonnet 4.6)

**Goal:** On first launch of LeanShell (lean mode), silently run setup in the background — no modal gates, no blocking UI. All progress surfaced only via the thin status bar in `LeanShell`.

**Step 1 — Locate existing background-setup logic:**

Search `src/main/index.ts` for `runAutoPrepareIfNeeded`, `lean-install-start`, and `OllamaManager.init`. This SEG EXTENDS the existing setup pipeline — do NOT create a third parallel spawn path. All Ollama operations route through `OllamaManager`.

**Background sequence (fires on app ready, lean mode only):**

```
1. Check Ollama reachable (GET http://localhost:11434/api/tags, timeout 2s)
   → If reachable: skip install, proceed to step 2
   → If not reachable + bundled ollama.exe present: start OllamaManager (silent)
   → If not reachable + no bundled binary: open https://ollama.com in browser
     + emit IPC event: { type: 'setup-status', msg: 'Visit ollama.com to install Ollama, then relaunch MnemosyneC.' }
     + do NOT block UI — user can still use the app (Ask tab shows "Ollama needed" inline)

2. Check gemma4:12b in model list (parse /api/tags response)
   → If present: emit { type: 'setup-status', msg: 'ready' } → LeanShell hides status bar
   → If absent: pull via OllamaManager.pullModel('gemma4:12b')
     + emit progress events: { type: 'setup-progress', pct: N, msg: 'Downloading AI model… N%' }
     + LeanShell status bar shows "Downloading your AI model… N%" during pull
     + On complete: emit { type: 'setup-status', msg: 'ready' }

3. LAN mesh discovery (parallel with step 2, does not block):
   → mDNS scan for other MnemosyneC instances
   → If found: emit { type: 'setup-status', msg: 'Found N machine(s) nearby — connecting…' }
   → Attempt federation handshake (existing mesh IPC — search for 'mesh' or 'federation' handlers)
   → On success: emit { type: 'mesh-status', peers: [...] }
```

**IPC event shape (emit from main, listen in LeanShell):**

```typescript
// Main → Renderer
ipcMain.emit / webContents.send('lean-bg-status', { type, msg, pct? })

// LeanShell listener
useEffect(() => {
  window.amplify?.onLeanBgStatus?.((payload) => {
    // update thin status bar
  });
}, []);
```

Wire `onLeanBgStatus` in `preload.ts` (use `require('electron')` pattern per canon — pearl_8b0c6fb05fd9f38a).

**HARD BINDING:** Status bar DISAPPEARS when setup is complete (`msg: 'ready'` + no mid-ops). Do NOT leave a permanent "Ready" message — that is noise. Silence = success once done. Per `[[feedback_every_click_visible_feedback_canon_bp078]]`: the inverse is also true — don't show noise when nothing needs attention.

**Deliverable:** diff of `src/main/index.ts` background-setup block + `preload.ts` channel addition + packaged screenshot of status bar during model pull.

---

### SEG-V0151-P1-PRESERVE-ADVANCED-PATH (Sonnet 4.6)

**Goal:** Ensure existing users are NOT shown LeanShell. Implement the Settings toggle.

**Existing-user detection (in `LeanShell.tsx` — from SEG-V0151-P0-3TAB-SHELL):**

```typescript
const isExistingUser = !!localStorage.getItem('mnemosynec_onboarding_complete');
if (!localStorage.getItem('mnemoUiMode')) {
  localStorage.setItem('mnemoUiMode', isExistingUser ? 'advanced' : 'lean');
}
```

**Settings toggle implementation:**

Locate the existing Settings panel (`SettingsView.tsx` or equivalent — search `src/renderer/components/` for "settings"). Add a toggle row:

```
Advanced mode (shows all tabs)     [toggle]
```

Toggle reads/writes `localStorage.getItem/setItem('mnemoUiMode', 'lean' | 'advanced')`. On change: call a `setUiMode` context setter (wire via React context or prop lift from `LeanShell`) to re-render immediately. No app restart required.

**Backward-compat gate:** If `mnemoUiMode === 'advanced'`, `LeanShell` renders `<MnemosyneTabView />` with ALL existing props intact. Zero behavior change for advanced users. No existing tab is removed or hidden from the advanced view.

**Deliverable:** Settings toggle diff + test: existing user path confirmed (screenshot of full tab bar in advanced mode after toggle).

---

## SEGs — SEQUENTIAL WAVE (run after parallel wave complete)

---

### SEG-V0151-P1-OFFTHESTREET-VERIFY (Sonnet 4.6)

**Gate:** Run AFTER all P0 SEGs complete AND packaged build is available.

**Goal:** Pawn-class cold-walk of `LeanShell` as a stranger who has never seen MnemosyneC.

**Walk sequence:**

1. Launch the packaged installer on a clean machine (no prior MnemosyneC).
2. Note first impression: what do you see? Is the elephant visible? Is the headline clear?
3. Can you understand what the product does from the Home tab in under 10 seconds without any prior knowledge?
4. Click "See it work yourself →" — does it go somewhere? Is it obvious what "Gauntlet" means?
5. On the Gauntlet tab: is the federation panel self-explanatory? What is confusing?
6. Switch to Ask tab: is "Ask A Question" obvious? Is the membership CTA legible and non-threatening?
7. Background setup: did the status bar appear? Was it comprehensible? Did it disappear when done?

**Return: max 8 findings, each with:**

```
FINDING [N]: [jargon / friction / ambiguity / UX gap]
Location: [tab + element]
Recommendation: [specific copy or UX fix]
Severity: [P0-blocker / P1-important / P2-nice]
```

**Founder reviews this list before ANY copy is finalized.** Knight stages findings in Yoke-return. Do NOT auto-fix copy — surface for ratify.

**Special watch-list (known jargon risks):**

- "Gauntlet" — is this self-explanatory to a stranger? Flag if not.
- "Banyan Metric" — does the explainer paragraph land without context?
- "Federation" / "mesh" — civilian-comprehensible?
- "gemma4:12b" — does showing model name help or confuse?
- "Soccerball ID" / "WAN ID" — too technical for tab 2?

---

### SEG-V0151-VERIFY (Sonnet 4.6)

**Gate:** Run after SEG-V0151-P1-OFFTHESTREET-VERIFY complete AND Founder has reviewed Off-the-Street findings.

**Clean-VM install. Mandatory screenshot captures (label each):**

- (a) Home tab — elephant renders, H1 visible, proof table populated from CADRE file (not hardcoded), CTA visible
- (b) Click "See it work yourself →" — Gauntlet tab opens; federation panel visible above stages
- (c) Gauntlet runs 1+ stage successfully (screenshot of completed stage)
- (d) Ask tab — type "What is MnemosyneC?" — gemma4:12b response streams in (screenshot mid-stream)
- (e) Ask tab — "Join Liana Banyan" banner visible at bottom of Ask tab
- (f) Status bar visible during gemma4:12b pull on first launch (screenshot during download)
- (g) Existing-user test: set `mnemosynec_onboarding_complete = 'true'` in localStorage before launch → confirm full multi-tab `MnemosyneTabView` renders (NOT LeanShell) — screenshot of advanced mode tab bar
- (h) Settings toggle: switch lean → advanced → confirm tab bar switches live. Switch back advanced → lean → confirm 3-tab view returns.
- (i) Background install: confirm Ollama started + gemma4:12b pulled WITHOUT any modal gate blocking UI interaction during download

**Per `[[feedback_actual_runtime_verify_for_runtime_bugs_bp078]]` + `[[feedback_ux_seg_screenshot_mandatory_bp078]]`:** All 9 screenshots (a)–(i) are mandatory. Missing any = SEG incomplete. Source-only verify is a canon violation for this class of UX change.

---

### SEG-V0151-SHIP (Sonnet 4.6) — DRAFT ONLY

**Gate:** Run AFTER SEG-V0151-VERIFY confirms all 9 screenshots captured AND Founder has reviewed Off-the-Street findings.

**Status: DRAFT. Knight does NOT self-stamp. Founder ratifies in own words.**

**3 mandatory SHIP gates (per `[[reference_cephas_hugo_every_time_ship_rule_bp079]]`):**

**Gate 1 — Header verify:**

Every changed file has correct header comments. `LeanShell.tsx`, `LeanHomeTab.tsx`, `LeanAskTab.tsx` each include:

```typescript
// MnemosyneC · v0.1.51 · BP080 · 2026-06-11
// §2 Truth-Always · §3 Sonnet 4.6 · Founder-ratified DRAFT
```

**Gate 2 — Content verify:**

- `package.json` version bumped to `0.1.51`
- `data/version.json` updated: `{ "version": "0.1.51", "date": "2026-06-11", "buildHash": "[actual hash]" }`
- `firebase.json` headers bumped: `X-LB-Version: 0.1.51` + `X-LB-Build-Hash: [actual]` on BOTH cephas + mnemosyne targets
- `content/download/_index.md` version reference updated
- `static/download/latest.yml` updated
- CADRE benchmark table in `LeanHomeTab.tsx` sourced from file read (NOT hardcoded numbers) — verify this in the built output

**Gate 3 — Anonymous download verify:**

A person with no MnemosyneC history downloads the installer, runs it, lands on the 3-tab LeanShell, and completes the Off-the-Street sequence without terminal interaction. This is the ultimate gate.

**Stage to:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\`

Filename: `YOKE_KNIGHT_BP080_V0151_3TAB_LEAN_RETURN.md`

**Knight does NOT push to GitHub. Knight does NOT self-stamp.** Stage DRAFT. Founder fires the ratify.

---

## YOKE-RETURN FORMAT

Write yoke-return to:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\YOKE_KNIGHT_BP080_V0151_3TAB_LEAN_RETURN.md`

Per-SEG section:

```
## SEG-[name] — [COMPLETE | PARTIAL | BLOCKED]
Files changed: [list with absolute paths]
Runtime evidence: [screenshot paths OR explicit flag "Founder install-verify required"]
Open questions: [any; "None" if clean]
```

Off-the-Street findings list (max 8, formatted per spec above).

All 9 verify screenshots labeled (a)–(i).

SHIP gate status: Gate 1 / Gate 2 / Gate 3 — each PASS or OPEN.

Final line: `DRAFT — awaiting Founder ratify.`

---

## DISPATCH BLOCK — BLACK MAMBA

```
WAVE: BP080_V0151_3TAB_LEAN_2026-06-11
SEGs (parallel): 6
SEGs (sequential, after parallel complete): 3
Total: 9

PARALLEL WAVE:
  SEG-V0151-P0-3TAB-SHELL       model: sonnet
  SEG-V0151-P0-HOME-TAB         model: sonnet
  SEG-V0151-P0-GAUNTLET-PLUS-MESH model: sonnet
  SEG-V0151-P0-ASK-TAB          model: sonnet
  SEG-V0151-P0-AUTOMATIC-BACKGROUND model: sonnet
  SEG-V0151-P1-PRESERVE-ADVANCED-PATH model: sonnet

SEQUENTIAL WAVE (after parallel complete):
  SEG-V0151-P1-OFFTHESTREET-VERIFY  model: sonnet
  SEG-V0151-VERIFY                  model: sonnet
  SEG-V0151-SHIP                    model: sonnet (DRAFT only — no self-stamp)

STATUTES: §3 Sonnet 4.6 all SEGs · §2 Truth-Always · §13 substrate routing
HARD BINDINGS: runtime evidence · visible feedback · no self-stamp · Founder ratify before publish
YOKE-RETURN: C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\YOKE_KNIGHT_BP080_V0151_3TAB_LEAN_RETURN.md
```

---

## ADDENDUM 1 — FOUNDER RATIFY: USE EXISTING CUE DECK CARDS + 3 ANSWERS (2026-06-11)

### A1.1 — Ask Tab Model Lock

**HARD BINDING:** The Ask tab (SEG-V0151-P0-ASK-TAB) uses `gemma4:12b` ONLY for all chat. No Claude, no GPT, no cloud model exposure on the Ask tab — even for paid-tier members. The Ask tab is pure local. The optional "Also available: Claude · GPT" selector line in the SEG spec is REMOVED. Keep it clean: one model, one tab, fully private. Any cloud routing lives in the full advanced shell (MnemosyneTabView), not in LeanAskTab.

---

### A1.2 — Cue Deck Card Source-of-Truth: "All Six" Canon

**TRUTH-ALWAYS FLAG (Bishop §2):** The canonical "Good. Fast. Cheap. MnemosyneC gives you all six." card content was provided by Founder verbatim in BP080 session and is NOT yet present on disk in any Cephas/cephas-hugo content file, Escape Velocity Site src, Asteroid-ProofVault, or platform/src. It exists only in this Yoke addendum and the companion memory file `reference_six_pillars_cue_deck_card_canon_bp080.md`.

**Source-of-truth for this Yoke:** use the text below VERBATIM. Do NOT rewrite, simplify, or paraphrase. Do NOT invent copy.

```text
Good. Fast. Cheap.
MnemosyneC gives you all six.
Can't we all just get along?

Good — Every AI we tested got smarter on a shared memory: +72 to +83 points of accuracy across four model families. A free, local model jumped from 6% to 78%. ✔
Fast — Answers resolve against your own memory in milliseconds. A hash-verified mesh measured 16.6 ms median instead of a metered round-trip to someone else's server. ✔
Cheap — That free local model answers at $0 a call. Everything else runs at cost plus 20%, on hardware you already own. No new data center. ✔
Private — Runs entirely on your machine. No account, no upload, no telemetry, no phone-home. ✔
Free — SSPL Free Forever, Pledge #2260. No ads. No strings. No subscription. Patent-pending, 21 provisional filings, pledged to the member commons, never sold for extraction. ✔
Yours — Storm-proof immutability. Three infrastructure failures hit at once. The substrate held. Every fact is sha256-stamped, content-addressed, append-only. Nothing can be overwritten. Uninstall anytime; your originals are untouched and independently verifiable. ✔

Every figure is reproducible — Prove It · Run your own cabinet
```

**Six pillars (canonical order):** Good · Fast · Cheap · Private · Free · Yours

**Where to use this card in v0.1.51:**

- **Home tab hero section** — after the H1 + proof table, render the "Good. Fast. Cheap. / MnemosyneC gives you all six." headline + six pillar rows as a visual card. Each pillar gets its own row with the ✔ checkmark. Use the verbatim text above — no edits.
- **Ask tab Join CTA banner** — the pinned-bottom banner copy already specified in SEG-V0151-P0-ASK-TAB is sufficient for the Ask tab. Do NOT paste the full six-pillar card into the CTA banner — it is too long. The banner copy ("Join Liana Banyan — Better, Faster, Cheaper · $5/year") stands as-is.
- **Gauntlet tab / Federation panel** — no marketing copy needed here. The panel is functional (connection status, peer list, scan button). Do NOT embed the card here.

**Other Cue Deck Cards available for reuse (disk-verified in this session):**

Bishop searched `LianaBanyanPlatform/Cephas/cephas-hugo/content/` and `LianaBanyanPlatform/Escape Velocity Site/src/` for additional ready-to-use marketing Cue Deck Card files containing composed Founder copy for the six-pillar surfaces. Result: the Escape Velocity Site has a full Cue Card system (components: `CueCardFlip.tsx`, `CueCardStack.tsx`, `CueCardSystem.tsx`, `CueCardDeckManager.tsx`, `CueCardSelector.tsx`, `CueCardGallery.tsx`, `CueCardDemo.tsx`, `PatentCueCards.tsx`) and a DB migration system (`20241204010000_cue_card_system.sql`). However, none of these components contain the six-pillar "Good. Fast. Cheap." copy — they are structural/template components. The Cephas Hugo download page (`content/download/_index.md`) contains "Pledge #2260" and the six verified numbers table but NOT the "all six" card. **No other pre-written Founder-copy Cue Deck Card was found on disk for reuse on Home/Ask/Gauntlet surfaces.** Knight must use the verbatim card above for Home tab. Any NEW copy for other surfaces requires Founder copy-review and explicit ratify before publish — per `[[feedback_explicit_founder_ratify_before_publish]]`.

---

### A1.3 — Federation Panel: WAIT for User Click

**Amendment to SEG-V0151-P0-GAUNTLET-PLUS-MESH:**

The federation panel MUST NOT auto-attempt LAN discovery when the Gauntlet tab opens. Discovery is user-initiated only.

**Correct behavior:**

1. Gauntlet tab opens → federation panel renders in "idle" state:
   ```
   This machine: [LAN IP]  ·  WAN ID: [soccerball short ID]
   LAN peers:   (not yet scanned)
   WAN peers:   (not yet connected)
   [Connect to other machines ▼]
   ```
2. User clicks **"Connect to other machines"** button → THEN fire mDNS scan + WAN soccerball lookup simultaneously.
3. During scan: show "Scanning for nearby machines…" spinner in the LAN peers row. Show "Looking up WAN peers…" in WAN row.
4. On result: populate peer list or show "None found nearby" with a "Try again" affordance.

**Why:** Auto-discovery on tab open triggers network activity the user did not initiate, which conflicts with the "Private — No phone-home" pillar. A stranger landing on the Gauntlet tab should not see network traffic fire silently.

**Every button gives visible feedback** per `[[feedback_every_click_visible_feedback_canon_bp078]]` — "Connect to other machines" button must show immediate visual state change on click (spinner or "Scanning…" label swap) before results arrive.

---

### A1.4 — Site Cleanup: Parallel SEG, Not a v0.1.51 Gate

The Hugo site footer fix and hex background fix are being handled by a separate parallel SEG in this BP080 wave. The v0.1.51 app build does NOT need to wait on those site fixes to ship. They are independent tracks. Knight: do not block the v0.1.51 SHIP gate on site-cleanup completion.

---

*ADDENDUM 1 — Bishop SEG · BP080 · 2026-06-11 · §2 Truth-Always · Founder copy ratified verbatim*
