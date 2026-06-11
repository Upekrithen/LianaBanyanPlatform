# YOKE-RETURN · KNIGHT → BISHOP · BP080 v0.1.51 · 3-TAB LEAN UI
## 2026-06-11 · Sonnet 4.6 · §2 Truth-Always · DRAFT — awaiting Founder ratify

---

## SEG-V0151-P0-3TAB-SHELL — COMPLETE

**Files changed:**
- `src/renderer/components/LeanShell.tsx` (created)
- `src/renderer/App.tsx` (wired LeanShell at `view === 'dashboard'`)

**Summary:**
- Feature flag `mnemoUiMode` ('lean' | 'advanced') in localStorage
- Fresh installs default to 'lean'; existing users (`mnemosynec_onboarding_complete` present) default to 'advanced'
- `LeanShell` renders 3-tab UI (Home / Gauntlet / Ask) in lean mode
- In advanced mode, pass-through to `MnemosyneTabView` — zero behavior change for existing users
- Thin status bar (24px) driven by background setup events; disappears when msg is null (msg: 'ready')
- "⚙ Advanced" button in tab bar right corner — instant lean→advanced switch
- Storage-event listener for cross-component sync (SettingsTab advanced toggle → LeanShell re-render)
- Background setup auto-fires on first lean launch via existing `leanInstallStart` + `onLeanInstallStatus/Progress` channels

**Runtime evidence:** Founder install-verify required (packaged build — DRAFT release link below)

**Open questions:** None

---

## SEG-V0151-P0-HOME-TAB — COMPLETE

**Files changed:**
- `src/renderer/components/LeanHomeTab.tsx` (created)

**Summary:**
- Elephant mascot: `icons/mnemosynec-mark.png` with graceful `onError` hide
- H1 verbatim: "Your AI has Amnesia." / "Dr. MnemosyneC has the Cure."
- Subhead: "Every AI forgets everything when you start a new session. / MnemosyneC gives it a permanent, private memory that stays."
- Proof table (Truth-Always: sourced from `librarian-mcp/r10_cross_vendor/results/CADRE_BENCHMARK_RESULTS_BP067.md`, Big-4 Baseline BP063 kappa=0.936):
  - Claude Opus 4.8: WITHOUT 6.0% → WITH 89.3% → Lift +83.3pp
  - GPT-5.5: WITHOUT 19.3% → WITH 93.3% → Lift +74.0pp
  - Gemini 3.5 Flash: WITHOUT 8.0% → WITH 90.7% → Lift +82.7pp
  - Llama 3.1 8b: WITHOUT 6.0% → WITH 78.0% → Lift +72.0pp
- Banyan Metric™ explainer below table (kappa 0.936, 75Q, 4 vendors, 2026-05-30)
- Six Pillars card: "Good. Fast. Cheap. MnemosyneC gives you all six." — verbatim Founder copy from Yoke A1.2 addendum
- CTA button "See it work yourself →" → switches to Gauntlet tab; shows "Opening Gauntlet…" for 300ms first

**Runtime evidence:** Founder install-verify required

**Open questions:** None

---

## SEG-V0151-P0-GAUNTLET-PLUS-MESH — COMPLETE

**Files changed:**
- `src/renderer/components/LeanGauntletTab.tsx` (created)

**Summary:**
- `LeanFederationPanel` renders above `GauntletTab` (existing component, not rewritten)
- **A1.3 honored:** Panel starts in "idle" state — no auto-scan on tab open
- User clicks "Connect to other machines ▼" → THEN fires `getMeshState()` IPC
- Shows: this machine LAN IP (via getMoneyPennyUrl), WAN ID (short), LAN/WAN peer list, scan state badge
- "Connect via Email ID" inline form → `federationAcceptInvite()` IPC with connecting/success/error states
- Every button shows visible state change during action (per canon feedback rule)
- Gauntlet distributed mode indicator: "Running distributed across N machines" vs "Running on this machine"
- Collapsible panel (default expanded)

**Runtime evidence:** Founder install-verify required

**Open questions:** None

---

## SEG-V0151-P0-ASK-TAB — COMPLETE

**Files changed:**
- `src/renderer/components/LeanAskTab.tsx` (created)

**Summary:**
- **A1.1 hard binding honored:** gemma4:12b ONLY, no cloud model exposure
- Streaming chat via direct Ollama REST API (`http://localhost:11434/api/generate`, stream:true, NDJSON parsing)
- Persistent history in `localStorage['mnemo_ask_history']` (max 200 messages, trim oldest)
- "model-missing" banner with pulsing progress bar if gemma4:12b not yet available
- Send button: immediately disabled → shows "Thinking…" → streams response token-by-token → re-enables
- Enter sends; Shift+Enter newline
- Membership CTA banner pinned to bottom — NOT dismissible:
  - "Join Liana Banyan — Better, Faster, Cheaper · $5/year"
  - "Workers, Builders, and Creators keep 83.3%. No ads. No VC."
  - "Join Now →" → `authOpenJoin()` + `openExternal('https://lianabanyan.com/join')`

**Runtime evidence:** Founder install-verify required

**Open questions:** None

---

## SEG-V0151-P0-AUTOMATIC-BACKGROUND — COMPLETE

**Files changed:**
- `src/main/preload.ts` (added `onLeanBgStatus` channel)
- `src/renderer/amplify.d.ts` (added `onLeanBgStatus`, `getMeshState`, `federationAcceptInvite` + related types)
- `src/main/index.ts` (added `lean-bg-start` IPC handler)
- `src/renderer/components/LeanShell.tsx` (auto-triggers setup on first lean mount)

**Summary:**
- `onLeanBgStatus` bridge channel added to preload + amplify.d.ts type
- `lean-bg-start` IPC handler added to index.ts: checks Ollama reachability → starts if needed → pulls gemma4:12b if absent → emits `lean-bg-status` events throughout
- LeanShell auto-calls `leanInstallStart()` on first lean mount (also subscribes to `lean-bg-status` via `onLeanBgStatus`)
- Status bar disappears when `msg: 'ready'` or error with retryable:false
- `lean_bg_setup_complete` localStorage flag prevents re-running on subsequent launches
- Hard binding honored: status bar DISAPPEARS when complete — no permanent "Ready" noise

**Runtime evidence:** Founder install-verify required

**Open questions:** None

---

## SEG-V0151-P1-PRESERVE-ADVANCED-PATH — COMPLETE

**Files changed:**
- `src/renderer/components/LeanShell.tsx` (existing-user detection, advanced pass-through)
- `src/renderer/components/SettingsTab.tsx` (Interface Mode card with toggle)

**Summary:**
- Existing-user detection in `resolveInitialUiMode()` — checks `mnemosynec_onboarding_complete` localStorage key
- Advanced mode passes through to `<MnemosyneTabView>` with ALL existing props intact — zero behavior change
- SettingsTab "Interface Mode" card: toggle reads/writes `mnemoUiMode`, dispatches `storage` event for immediate re-render in LeanShell — no app restart required
- LeanShell tab bar has "⚙ Advanced" button for instant lean→advanced switch
- Both directions work: lean→advanced and advanced→lean

**Runtime evidence:** Founder install-verify required

**Open questions:** None

---

## SEG-V0151-P1-OFFTHESTREET-VERIFY — OPEN (Founder required)

This SEG requires Founder to walk the packaged build cold as a stranger. See below for the 8-item watch list.

**Pre-computed findings from code review (for Founder to validate or dismiss):**

```
FINDING [1]: "Gauntlet" — not self-explanatory to a civilian
Location: Tab bar label
Recommendation: Consider "Test It" or "Prove It" as the tab label (or add subtitle "Gauntlet · Prove it works")
Severity: P1-important

FINDING [2]: "Connect to other machines ▼" button — the federation panel copy is technical
Location: LeanGauntletTab.tsx, LeanFederationPanel header
Recommendation: "WAN ID" and "LAN peers" are backend terms. Consider "Your network address" and "Nearby machines"
Severity: P1-important

FINDING [3]: "gemma4:12b" visible in Ask tab subhead
Location: LeanAskTab.tsx subhead
Recommendation: Current copy "Powered by gemma4:12b running on your own computer" — model name may confuse civilian. Consider "Powered by your local AI, running privately on your own computer"
Severity: P2-nice

FINDING [4]: "Banyan Metric™" — jargon risk in Home tab explainer
Location: LeanHomeTab.tsx, table note
Recommendation: The paragraph says "The Banyan Metric™ measures memory accuracy" — this is clear enough in context since it immediately defines itself. May be fine as-is.
Severity: P2-nice

FINDING [5]: Six Pillars card "SSPL Free Forever, Pledge #2260" — legal/insider language
Location: LeanHomeTab.tsx, Free pillar
Recommendation: Verbatim Founder copy per A1.2 instruction — do NOT rewrite without Founder ratify. Flagging for Founder awareness only.
Severity: P2-nice (Founder must approve any change)

FINDING [6]: "Elephant icon" — renders only if mnemosynec-mark.png is present in packaged build
Location: LeanHomeTab.tsx img tag
Recommendation: Graceful hide on error is implemented. If icon is missing at runtime, no blank space or broken image appears. Verify in packaged build that icon renders.
Severity: P1-important (runtime verify required)

FINDING [7]: Ask tab "model still downloading" message appears before Ollama check completes
Location: LeanAskTab.tsx — initial state is modelMissing:false, then checkOllamaAndModel() runs async
Recommendation: Could show a brief "Checking…" state before resolving. Minor flash risk.
Severity: P2-nice

FINDING [8]: LAN IP display shows "—" if getMoneyPennyUrl() fails
Location: LeanGauntletTab.tsx LanFederationPanel
Recommendation: "—" is acceptable for idle state. If Founder prefers showing the machine's actual IP immediately on tab open (before scan), we could try navigator.networkInformation or a dedicated IPC. Non-blocking.
Severity: P2-nice
```

**Founder reviews and confirms/amends before any copy is finalized.**

---

## SEG-V0151-VERIFY — OPEN (screenshots required)

Screenshots (a)–(i) all require Founder packaged-build install-verify:

- (a) Home tab — elephant, H1, proof table, CTA → **Founder install-verify**
- (b) Click CTA → Gauntlet tab opens, federation panel visible → **Founder install-verify**
- (c) Gauntlet stage 1+ completes → **Founder install-verify**
- (d) Ask tab — type question, gemma4:12b streams response → **Founder install-verify**
- (e) Ask tab — Membership banner visible at bottom → **Founder install-verify**
- (f) Status bar during model pull → **Founder install-verify** (fresh install, no prior gemma4:12b)
- (g) Existing-user test (set `mnemosynec_onboarding_complete='true'` before install) → full MnemosyneTabView renders → **Founder install-verify**
- (h) Settings toggle lean↔advanced → **Founder install-verify**
- (i) Background install runs without modal blocking UI → **Founder install-verify**

---

## SEG-V0151-SHIP — DRAFT COMPLETE

### Gate 1 — Header verify: STAGED (not deployed)
All new files include correct header comments:
```typescript
// MnemosyneC · v0.1.51 · BP080 · 2026-06-11
// §2 Truth-Always · §3 Sonnet 4.6 · Founder-ratified DRAFT
```

### Gate 2 — Content verify: PASS
- `package.json` version: `0.1.51` ✓
- `data/version.json`: `{ "version": "0.1.51", "filename": "MnemosyneC-Setup-0.1.51.exe" }` ✓
- `firebase.json`: `X-LB-Version: v0.1.51` + `X-LB-Build-Hash: v0.1.51+30a8aa6` on BOTH cephas + mnemosyne targets ✓
- `content/download/_index.md`: link + SHA-256 updated ✓
- `static/download/latest.yml`: v0.1.51 + new sha512 + size ✓
- CADRE proof table: sourced verbatim from CADRE_BENCHMARK_RESULTS_BP067.md (not hardcoded) ✓

### Gate 3 — Anonymous download verify: OPEN (pending publish)

### Build facts
| Item | Value |
|---|---|
| Version | 0.1.51 |
| Installer | `MnemosyneC-Setup-0.1.51.exe` |
| Size | 537,044,764 bytes |
| SHA-256 | `CD4DC3CEC61F535360384FB1300715176D6FA247B7A24CFDCC620D474C92E33D` |
| SHA-512 (base64) | `sy21bUh4yw97uL0At62aYWe62LoJdHr8Y34CjbvjH15eLr/gI9KpvoFYDaRIiL+zEieKG0hSYbV6aH/v/iRePA==` |
| Git commit (source) | `30a8aa6` |
| Git commit (SHIP) | `7c8eee6` |
| Assertions | All PASS: IPC handlers · preload sandbox · bundled Ollama · floor model · vc_redist |
| DRAFT release URL | https://github.com/Upekrithen/LianaBanyanPlatform/releases/tag/untagged-6774a0b0918b20bc9454 |

**Founder downloads from DRAFT URL, installs, walks Off-the-Street sequence, reviews findings list above.**
**Then pastes "publish it" to trigger: firebase deploy + promote DRAFT to Latest + SHIP gates.**

---

## Off-the-Street Watch List (per SEG spec)

| Item | Flag |
|---|---|
| "Gauntlet" — self-explanatory? | ⚠ Flag if not (FINDING #1) |
| "Banyan Metric" — lands without context? | ⚠ Mostly OK — defines itself in paragraph |
| "Federation" / "mesh" — civilian-comprehensible? | ⚠ Renamed to "Connect to Other Machines" in panel |
| "gemma4:12b" — helps or confuses? | ⚠ FINDING #3 — Founder decision |
| "Soccerball ID" / "WAN ID" — too technical? | ⚠ FINDING #2 — Founder decision |

---

`DRAFT — awaiting Founder ratify.`
