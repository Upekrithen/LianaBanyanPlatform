# Knight Yoke — v0.1.52 · BP080 · 2026-06-11
# LEAN Default · Six Pillars Flip Card · Ask Tab Fix · Existing-User Nudge
# Status: DRAFT — awaiting Founder explicit ratify before any ship action
# §2 Truth-Always · §3 Sonnet 4.6 ALL SEGs (hard binding) · Bishop orchestrator-only

---

## WAKE-UP PROMPT (paste to Knight before anything else)

> Knight, this is a v0.1.52 Yoke from Bishop, BP080, 2026-06-11.
> Four Founder-verbatim asks. All Sonnet 4.6 SEGs. Read this file fully
> before writing a single line of source. Statutes §2 and §3 apply.
> DRAFT until Founder says "ship it" in his own words.

---

## HARD BINDINGS (read before every SEG)

1. **§3 — ALL SEGs use Sonnet 4.6 verbatim.** Not Sonnet 3.7, not Haiku, not Opus. Sonnet 4.6.
2. **Bishop orchestrator-only** — Knight does ALL src edits, builds, and deploys. No exceptions.
3. **Runtime evidence required** before marking any SEG complete (canon: `feedback_actual_runtime_verify_for_runtime_bugs_bp078`).
4. **Every click gives visible feedback** (canon: `feedback_every_click_visible_feedback_canon_bp078`).
5. **UX SEG mandatory screenshot capture** — every UX-touching SEG captures a screenshot of the affected surface on packaged-build install and embeds in yoke-return (canon: `feedback_ux_seg_screenshot_mandatory_bp078`).
6. **DRAFT until Founder explicit ratify** — "ship it so we can move forward" ≠ GREEN (canon: `feedback_forward_pressure_ratify_is_not_verified_ratify_bp080`).
7. **3 SHIP gates required** — bump firebase.json headers + 4 sweep files + deploy + HEAD verify + anon download verify (HTTP 200, >100 MB) (canon: `reference_cephas_hugo_every_time_ship_rule_bp079`).

---

## CONTEXT — what Bishop found in the codebase

Before writing any SEG, Knight should orient against these findings. Do NOT re-read the files unless you need to extend them — these are authoritative summaries.

### LEAN mode / UI mode state machine (already written in v0.1.51)

- **`src/renderer/components/LeanShell.tsx`** — contains `resolveInitialUiMode()` (lines 35–42).
  - The logic already reads `mnemoUiMode` from localStorage, then falls back to: existing users (`mnemosynec_onboarding_complete` present) → `'advanced'`; new users → `'lean'`.
  - **The LEAN-default logic is ALREADY correct in v0.1.51.** The `resolveInitialUiMode()` function already defaults new users to `'lean'`.
  - SEG-V0152-P0-LEAN-DEFAULT must **verify** this is actually working on a clean VM and confirm no regression — do NOT rewrite working logic.
  - `LS_UI_MODE = 'mnemoUiMode'` · `LS_ONBOARDING_COMPLETE = 'mnemosynec_onboarding_complete'`
  - `LS_LEAN_SETUP_DONE = 'lean_bg_setup_complete'`

- **`src/renderer/components/SettingsTab.tsx`** — toggle at lines 1522–1535 reads/writes `mnemoUiMode` and dispatches `StorageEvent` to sync LeanShell. Already functional.

### Six Pillars card (already in v0.1.51 LeanHomeTab.tsx)

- **`src/renderer/components/LeanHomeTab.tsx`** — `SIX_PILLARS` constant at lines 26–51. Card rendered at lines 276–286.
- Currently: a static `<div style={s.pillarsCard}>` — NOT a flip card.
- "Every figure is reproducible — Prove It · Run your own cabinet" is currently a plain `<p style={s.proveIt}>` at line 285 — NOT a link, NOT interactive.
- Target: convert to a CSS 3D flip card with:
  - Front: existing pillar rows + "Every figure is reproducible…" rendered as a clickable `<a>` / `<button>` (hyperlink affordance)
  - Back: reproducibility detail content (see SEG spec below)
  - Flip affordance: ↻ icon bottom-right of both faces
  - Two triggers to flip to back: (a) click the ↻ indicator, (b) click "Every figure is reproducible…"
  - Reference component: `Escape Velocity Site/src/components/cue-cards/` (CueCardFlip.tsx) for CSS 3D approach — read it before writing

### Ask tab "not set up" error — root cause identified by Bishop

- **`src/renderer/components/LeanAskTab.tsx`** — `LeanAskTab` component.
- On mount (lines 190–194), calls `window.amplify?.checkOllamaAndModel?.(MODEL)` which invokes IPC `check-ollama-and-model`.
- **IPC handler** (`src/main/index.ts` lines 1733–1748): fetches `http://127.0.0.1:11434/api/tags` directly — a standalone fetch, NOT routed through OllamaManager.
- **The streaming path** (`streamOllama`, lines 54–99) fetches `http://localhost:11434/api/generate`.
- **Root causes (two candidates, both must be addressed):**
  1. **localhost vs 127.0.0.1 address mismatch** — `checkOllamaAndModel` probes `127.0.0.1`; if it succeeds but `localhost` DNS resolves differently on Founder's machine, `streamOllama` can still fail. The stream error path returns: `"Could not reach local AI. Make sure MnemosyneC is set up (see Home tab)."` — this is what Founder sees.
  2. **`checkOllamaAndModel` bypasses OllamaManager entirely** — it does its own fetch to `/api/tags`. If OllamaManager already verified the model is running (PRE_INSTALLED_RUNNING branch, `activeModel=gemma4:12b`), the Ask tab's independent re-probe can still miss it due to timing or host resolution.
- **Fix required:** Ask tab must use OllamaManager as single source of truth. Add a new IPC channel `ask-tab-check` (or reuse/fix `check-ollama-and-model`) that:
  1. Calls the existing `ollamaManager.isReachable()` (already uses port 11434)
  2. Calls `ollamaManager.listModels()` to check model presence
  3. Returns `{ reachable, hasModel, models }` — same shape as current interface so LeanAskTab.tsx needs no type change
- Additionally: `streamOllama` must use `http://127.0.0.1:11434` (same address as the IPC probe), not `http://localhost:11434`, to eliminate host-resolution ambiguity.
- The `modelMissing` banner text ("Your AI model is still downloading") is misleading when the model IS installed but the check failed. Add a `checkFailed` boolean to show a distinct "Could not verify model — Retry" button with a retry trigger (per every-click-visible-feedback canon).

### Existing-user nudge

- No existing component for this. A new `LeanModeNudge` component is needed.
- Conditions: `mnemoUiMode === 'advanced'` AND `lean_nudge_dismissed` NOT in localStorage.
- A small dismissible banner at the top of `MnemosyneTabView` (or injected via `LeanShell` when `uiMode === 'advanced'`).
- One-click → sets `mnemoUiMode = 'lean'` + dispatches StorageEvent (same pattern as SettingsTab toggle) → LeanShell re-renders to lean.
- Dismiss → sets `lean_nudge_dismissed = '1'` in localStorage → never shown again.

---

## SEG SPECIFICATIONS

### SEG-V0152-P0-LEAN-DEFAULT (Sonnet 4.6)

**Task:** Verify and harden the fresh-install LEAN default.

**What to do:**
1. Read `src/renderer/components/LeanShell.tsx` `resolveInitialUiMode()` (lines 35–42).
2. Confirm the logic is correct as-written: no `mnemoUiMode` stored + no `mnemosynec_onboarding_complete` → returns `'lean'`, writes `'lean'` to localStorage.
3. If correct, do NOT change the logic — confirm only.
4. **Harden one edge case:** if `mnemoUiMode` is stored as any value OTHER than `'lean'` or `'advanced'` (e.g., corrupted, legacy value), the current code falls through to the `isExistingUser` branch. Add a guard: if stored value is not `'lean'` and not `'advanced'`, treat as no-value and apply the new/existing logic.
5. Write a **runtime verification comment** block at the top of the function documenting expected behavior for future devs.
6. **Do NOT change the Advanced mode default for existing users** — `mnemosynec_onboarding_complete` present → `'advanced'` is intentional and must be preserved.

**Acceptance:** Clean-VM packaged install with no localStorage flags opens to LEAN 3-tab UI on first launch.

---

### SEG-V0152-P0-FLIP-CARD (Sonnet 4.6)

**Task:** Convert the static Six Pillars card in `LeanHomeTab.tsx` to a CSS 3D flip card.

**What to read first:**
- `src/renderer/components/LeanHomeTab.tsx` (full — you already have the Six Pillars structure)
- `Escape Velocity Site/src/components/cue-cards/CueCardFlip.tsx` (or equivalent) — read for CSS 3D approach, then adapt inline to the LeanHomeTab card. Do NOT import from the Escape Velocity Site into the Electron renderer.

**Front face (unchanged copy — verbatim Founder copy, do NOT alter):**
```
Good. Fast. Cheap.
MnemosyneC gives you all six. Can't we all just get along?

[Good row] [Fast row] [Cheap row] [Private row] [Free row] [Yours row]

Every figure is reproducible — Prove It · Run your own cabinet   [↻]
```
- The "Every figure is reproducible…" line: render as a `<button>` styled as a hyperlink (underline, `#6ee7b7` color, cursor pointer). Do NOT use `<a href>` — this is an Electron renderer, no external nav.
- The `↻` flip indicator: a small `<button>` positioned `bottom: 12px; right: 12px` of the front face. `aria-label="Flip card"`. On click → flip to back. Font size 16px, color `#6ee7b7`.
- Both the "Every figure is reproducible…" button and the ↻ button flip to back side.

**Back face (new content — reproducibility detail):**
```
Prove It — How to verify every figure yourself

✓ Benchmark data: CADRE_BENCHMARK_RESULTS_BP067.md
  75 questions · 4 vendors · 2026-05-30
  Cohen's kappa 0.936 (grader agreement)
  Hash-verified — all 20/20 mesh rounds matched

✓ Run your own cabinet:
  1. Install MnemosyneC (free)
  2. Open Gauntlet tab → Run Test
  3. Results appear live — your machine, your numbers

✓ Source: Asteroid-ProofVault/BP067_MARATHON_COMPLETION_RECEIPT.md
  pearl_241641f4 · SID 3ed52d5f

All figures are sha256-stamped, content-addressed, append-only.
Nothing can be overwritten. Independently verifiable.
```
- Back face also has the ↻ indicator bottom-right to flip back to front.
- Back face background: `#0a0f1a`; border `1px solid #6ee7b7` (accent to distinguish from front).
- Back face text: `fontSize: 12`, `color: '#94a3b8'`, line-height 1.6. Headings `color: '#6ee7b7'`.

**CSS 3D implementation:**
```css
/* Outer container — sets perspective */
.flip-card-outer {
  perspective: 800px;
}
/* Inner — rotates */
.flip-card-inner {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.45s ease;
}
.flip-card-inner.flipped {
  transform: rotateY(180deg);
}
/* Both faces */
.flip-card-front, .flip-card-back {
  position: absolute; /* back-face hidden */
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.flip-card-back {
  transform: rotateY(180deg);
}
```
Implement in inline styles / a local `<style>` tag within the component — do NOT create a separate CSS file unless it already exists.

**State:** `const [flipped, setFlipped] = useState(false);` at the LeanHomeTab component level (or extract to a `SixPillarsFlipCard` sub-component — preferred for readability).

**Every-click visible feedback:** the ↻ button must visually respond on click (brief opacity flash or scale transform). The "Every figure is reproducible" button must also give immediate visual response (color change, brief underline pulse).

**Acceptance:**
- Card renders correctly on v0.1.52 packaged install
- Click ↻ → smooth 3D flip to back face
- Click "Every figure is reproducible…" → same flip
- Click ↻ on back → flip back to front
- Both affordances show instant visual response on click
- Screenshot of front and back faces captured by SEG-V0152-VERIFY

---

### SEG-V0152-P0-ASK-TAB-FIX (Sonnet 4.6)

**Task:** Fix Ask tab "not set up" / "Could not reach local AI" error when gemma4:12b IS running.

**Root cause summary (Bishop-verified):**
1. `streamOllama` in `LeanAskTab.tsx` fetches `http://localhost:11434` — host may resolve differently from `127.0.0.1` on some Windows machines.
2. `check-ollama-and-model` IPC handler (in `src/main/index.ts`) performs its own raw fetch to `127.0.0.1:11434/api/tags`, bypassing OllamaManager entirely. If OllamaManager already confirmed `PRE_INSTALLED_RUNNING` (gemma4:12b running), this independent re-probe can still return `hasModel: false` under race/timing conditions.
3. When `checkOllamaAndModel` returns `hasModel: false`, `modelMissing` is set to `true`, the banner shows, and the textarea is still enabled but stream calls return "Could not reach local AI…" which the Founder reads as "not set up."

**Changes required:**

**A. `src/main/index.ts` — fix `check-ollama-and-model` handler:**
- Route through OllamaManager instead of a standalone fetch.
- New logic:
  ```typescript
  safeHandle('check-ollama-and-model', async (_event, { modelName }: { modelName: string }) => {
    try {
      const reachable = await ollamaManager.isReachable();
      if (!reachable) return { reachable: false, hasModel: false, models: [] };
      const models = await ollamaManager.listModels();
      const hasModel = models.some(
        (m) => m === modelName || m.startsWith(modelName.split(':')[0])
      );
      return { reachable: true, hasModel, models };
    } catch {
      return { reachable: false, hasModel: false, models: [] };
    }
  });
  ```
- `ollamaManager.isReachable()` and `ollamaManager.listModels()` already exist — use them. Do NOT add new methods unless truly absent.

**B. `src/renderer/components/LeanAskTab.tsx` — fix stream address + improve error state:**
- Change `streamOllama` fetch URL from `'http://localhost:11434/api/generate'` to `'http://127.0.0.1:11434/api/generate'` (line 61). Consistent with IPC probe address.
- Add `checkFailed` boolean state alongside `modelMissing`:
  ```typescript
  const [modelMissing, setModelMissing] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);
  ```
- In the mount effect:
  ```typescript
  useEffect(() => {
    let cancelled = false;
    window.amplify?.checkOllamaAndModel?.(MODEL).then((res) => {
      if (cancelled) return;
      if (!res) { setCheckFailed(true); return; }
      setModelMissing(!res.reachable || !res.hasModel);
      setCheckFailed(false);
    }).catch(() => {
      if (!cancelled) setCheckFailed(true);
    });
    return () => { cancelled = true; };
  }, []);
  ```
- Add a **retry handler** `handleRetryCheck` that re-runs the same check and clears both states before re-probing.
- Replace the single `modelMissing` banner with two distinct states:
  - `modelMissing` (reachable but no model): "Your AI model is still setting up. Usually 2–5 minutes. [Retry ↺]"
  - `checkFailed` (not reachable at all): "Could not reach your local AI. Is Ollama running? [Retry ↺] · [Open Home tab →]"
  - The `[Retry ↺]` button calls `handleRetryCheck` — per every-click-visible-feedback, button must visually change on click (spinner char or brief disabled state).
  - The `[Open Home tab →]` button calls a new optional `onSwitchToHome?: () => void` prop (add to `LeanAskTab` — pass `() => setActiveTab('home')` from `LeanShell.tsx`).
- When neither `modelMissing` nor `checkFailed`: existing empty-state "Ask anything. Your AI is private and local." — unchanged.

**Acceptance:**
- Founder's machine: open Ask tab → no error banner → type question → response streams.
- On a machine with no Ollama: `checkFailed` banner shown with Retry and Home tab link.
- Retry button produces visible feedback on click.
- Screenshot: Ask tab with successful response captured by SEG-V0152-VERIFY.

---

### SEG-V0152-P0-LEAN-DEFAULT-EXISTING-USER-NUDGE (Sonnet 4.6)

**Task:** Add a non-intrusive dismissible nudge for existing users currently in Advanced mode.

**New component:** `LeanModeNudge` — a thin banner, ~32px tall, rendered above `MnemosyneTabView` when in Advanced mode.

**Show condition:** `mnemoUiMode === 'advanced'` AND `localStorage.getItem('lean_nudge_dismissed') !== '1'`

**Banner copy (verbatim — do not alter):**
> Try the new simpler view (Lean Mode) →

**Behavior:**
- Click "Try the new simpler view (Lean Mode) →" → sets `localStorage.setItem('mnemoUiMode', 'lean')` + dispatches `StorageEvent` (same pattern as SettingsTab toggle at line 1523–1526 of `SettingsTab.tsx`) → LeanShell re-renders to lean. Per every-click-visible-feedback: button text briefly changes to "Switching…" before the re-render.
- Dismiss button (✕, right side of banner): sets `localStorage.setItem('lean_nudge_dismissed', '1')` → banner disappears. Per every-click-visible-feedback: brief opacity fade before removal.
- Once dismissed, `lean_nudge_dismissed = '1'` is permanent — never shown again on this machine.
- Banner is NOT shown in lean mode. ONLY shown when `uiMode === 'advanced'`.

**Where to render:** In `LeanShell.tsx`, in the `uiMode === 'advanced'` branch (lines 228–237), render `<LeanModeNudge />` above `<MnemosyneTabView ... />`:
```tsx
if (uiMode === 'advanced') {
  return (
    <>
      <LeanModeNudge onSwitch={switchToLean} />
      <MnemosyneTabView ... />
    </>
  );
}
```
Add `switchToLean` callback (same pattern as existing `switchToAdvanced`):
```typescript
const switchToLean = useCallback(() => {
  localStorage.setItem(LS_UI_MODE, 'lean');
  setUiMode('lean');
}, []);
```

**Visual spec:**
- Height: 32px, `background: '#0a1628'`, `borderBottom: '1px solid #1e3a5c'`
- Left: "✨ Try the new simpler view (Lean Mode) →" — `fontSize: 12`, `color: '#6ee7b7'`, cursor pointer, underline on hover
- Right: `✕` dismiss button — `fontSize: 11`, `color: '#475569'`, cursor pointer
- No animation required except the brief feedback on click

**Acceptance:**
- Existing user opens v0.1.52 → stays in Advanced → nudge banner appears at top.
- Click nudge → transitions to Lean mode.
- Click ✕ → banner disappears permanently (verify by re-launching).
- Screenshot of Advanced mode with nudge banner visible captured by SEG-V0152-VERIFY.

---

### SEG-V0152-VERIFY (Sonnet 4.6 — run AFTER all P0 SEGs complete)

**Task:** Clean-VM packaged install verification. Sequential after all P0 SEGs.

Per canon `feedback_actual_runtime_verify_for_runtime_bugs_bp078` and `feedback_ux_seg_screenshot_mandatory_bp078` — source change alone does NOT verify a runtime fix.

**Required captures (all 5 mandatory):**

(a) **Fresh install LEAN default:**
- Clean machine: no `mnemoUiMode`, no `mnemosynec_onboarding_complete` in localStorage.
- Install v0.1.52 packaged build.
- Launch → confirm opens to LEAN 3-tab UI (Home / Gauntlet / Ask tabs visible, NOT the Advanced multi-tab layout).
- Screenshot: LEAN shell on first launch.

(b) **Six Pillars flip card — both triggers:**
- Screenshot of front face with ↻ indicator visible and "Every figure is reproducible…" as hyperlink.
- Click ↻ → screenshot of back face with reproducibility detail.
- Click "Every figure is reproducible…" on front → confirm same back face (reset card first).
- Screenshot of back face via hyperlink trigger.

(c) **Ask tab works with gemma4:12b:**
- Open Ask tab on Founder's machine (gemma4:12b confirmed running via `ollama list`).
- Type a test question, e.g. "What is MnemosyneC?"
- Screenshot: streaming response visible — no "not set up" or "Could not reach" error.

(d) **Existing user Advanced → nudge banner:**
- Set `localStorage.setItem('mnemosynec_onboarding_complete', '1')` and clear `mnemoUiMode` + `lean_nudge_dismissed`.
- Relaunch → confirm opens in Advanced mode with nudge banner visible at top.
- Screenshot: nudge banner in Advanced mode.

(e) **Nudge → lean transition + dismiss persistence:**
- Click nudge banner → confirm switch to Lean mode.
- Screenshot: Lean mode active after nudge click.
- Return to Advanced, refresh → confirm nudge gone after dismiss.
- Screenshot: Advanced mode with no nudge banner after dismiss.

**All 5 screenshots must be embedded in the yoke-return.** If any check fails, STOP — surface to Bishop/Founder. Do NOT self-stamp.

---

### SEG-V0152-SHIP (Sonnet 4.6 — DRAFT ONLY, after VERIFY GREEN)

**Status: DRAFT — Knight does NOT self-stamp. Founder ratifies in own words.**

Three mandatory SHIP gates per `reference_cephas_hugo_every_time_ship_rule_bp079`:

**Gate 1 — Version bump + build:**
- `package.json` version → `0.1.52`
- `npm run dist:win` (or equivalent build command for this project)
- Confirm installer produced at expected path

**Gate 2 — Cephas/Hugo deploy:**
- Bump `Cephas/cephas-hugo/` headers + 4 sweep files per Cephas canon
- `firebase deploy` (Firebase wrappers, not raw gcloud — per `feedback_squarespace_dns_firebase_deploy_canon_bp080`)
- HEAD verify: `curl -I https://mnemosynec.ai` returns 200

**Gate 3 — Anonymous download verify:**
- No-auth HEAD request to installer download URL
- HTTP 200, file size > 100 MB
- Record SHA256 of produced installer

**Knight does NOT execute Gate 2 or Gate 3 without Founder explicit "ship it" / "push" / "send" / "fire."**

---

## RETURN FORMAT

When all P0 SEGs are complete and VERIFY passes, Knight returns to Bishop:

```
V0152-YOKE-RETURN
─────────────────
SEG-V0152-P0-LEAN-DEFAULT:   [COMPLETE | FAILED | BLOCKED] — <1 sentence>
SEG-V0152-P0-FLIP-CARD:      [COMPLETE | FAILED | BLOCKED] — <1 sentence>
SEG-V0152-P0-ASK-TAB-FIX:    [COMPLETE | FAILED | BLOCKED] — <1 sentence>
SEG-V0152-P0-LEAN-NUDGE:     [COMPLETE | FAILED | BLOCKED] — <1 sentence>
SEG-V0152-VERIFY:             [GREEN | RED | PARTIAL] — <1 sentence per check>

Screenshots embedded: [list filenames]
Runtime evidence: [describe what was observed]

SHIP-READY: [YES | NO | BLOCKED ON <item>]
```

---

## BLACK MAMBA DISPATCH BLOCK

```
Knight,

BP080 · v0.1.52 Yoke · 2026-06-11

Four Founder-verbatim asks from today's session. Use Sonnet 4.6 SEGs for ALL work — hard binding per §3. Read the full Yoke at:

  LianaBanyanPlatform\BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BP080_V0152_LEAN_DEFAULT_FLIPCARD_ASK_FIX_2026-06-11.md

SCOPE SUMMARY:

1. SEG-V0152-P0-LEAN-DEFAULT — Verify + harden fresh-install LEAN default in LeanShell.tsx. Logic already correct in v0.1.51; confirm on clean VM, harden the corrupted-value edge case, add verification comment block.

2. SEG-V0152-P0-FLIP-CARD — Convert static Six Pillars card in LeanHomeTab.tsx to a CSS 3D flip card. Front: existing pillar rows + "Every figure is reproducible — Prove It · Run your own cabinet" as clickable hyperlink. Back: reproducibility detail (CADRE benchmark provenance, Prove It steps, cabinet instructions). Flip indicator ↻ bottom-right of both faces. Two triggers flip to back: indicator click + hyperlink click.

3. SEG-V0152-P0-ASK-TAB-FIX — Fix Ask tab showing error when gemma4:12b is verifiably running. Root cause: check-ollama-and-model IPC bypasses OllamaManager; streamOllama uses localhost vs 127.0.0.1. Fix: route IPC handler through ollamaManager.isReachable() + listModels(); change stream URL to 127.0.0.1; add checkFailed state with distinct Retry + Home-tab-link UX.

4. SEG-V0152-P0-LEAN-DEFAULT-EXISTING-USER-NUDGE — Add LeanModeNudge dismissible banner in LeanShell.tsx Advanced branch. Copy: "Try the new simpler view (Lean Mode) →". One-click switches to lean. Dismiss (✕) sets lean_nudge_dismissed=1 permanently. Never shown again after dismiss.

Then SEG-V0152-VERIFY (all 5 screenshot captures mandatory) → SEG-V0152-SHIP (DRAFT ONLY — Founder ratifies).

PRIORITY ORDER: ASK-TAB-FIX is highest-urgency (Founder hit this today). FLIP-CARD is highest visible-delight. Both P0.

HARD BINDINGS:
- Sonnet 4.6 verbatim for ALL SEGs
- Runtime evidence required — source change alone does NOT verify
- Every click gives visible feedback
- Screenshot of each affected surface on packaged-build install embedded in return
- DRAFT until Founder explicit "ship it" / "push" / "fire" in his own words
- 3 SHIP gates mandatory before release

Bishop awaits your yoke-return.
```

---

*Bishop · BP080 · 2026-06-11 · §2 Truth-Always · §3 Sonnet 4.6*
