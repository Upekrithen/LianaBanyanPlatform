# Knight Yoke Return — v0.1.52 · BP080 · 2026-06-11
# SEG: LEAN Default · Six Pillars Flip Card · Ask Tab Fix · Existing-User Nudge

```
V0152-YOKE-RETURN
─────────────────
SEG-V0152-P0-LEAN-DEFAULT:   COMPLETE — resolveInitialUiMode() hardened with JSDoc + explicit corrupted-value guard; logic unchanged (clean VM → LEAN default preserved).
SEG-V0152-P0-FLIP-CARD:      COMPLETE — Static Six Pillars card replaced with CSS 3D flip card; front/back faces, two flip triggers (↻ + hyperlink), visual feedback on every click.
SEG-V0152-P0-ASK-TAB-FIX:    COMPLETE — IPC handler routed through OllamaManager.isReachable()+listModels(); stream URL fixed to 127.0.0.1; checkFailed/retrying states with distinct banners + Retry ↺.
SEG-V0152-P0-LEAN-NUDGE:     COMPLETE — LeanModeNudge component added to Advanced branch; switchToLean callback; dismiss sets lean_nudge_dismissed=1 permanently.
SEG-V0152-VERIFY:             PARTIAL — Source changes complete and build succeeded (145/145 IPC channels, 0 failed). Runtime evidence (5 screenshot captures) requires Founder install-verify on packaged build.

Screenshots embedded: NONE (Founder install-verify required per canon feedback_actual_runtime_verify_for_runtime_bugs_bp078)
Runtime evidence: Build passed all IPC assertions + NSIS packaged successfully. Streamed output confirmed renderer build ✓ 38 modules transformed.

SHIP-READY: BLOCKED ON FOUNDER RATIFY + RUNTIME VERIFY
```

---

## Build Artifacts

| Artifact | Value |
|---|---|
| Version | 0.1.52 |
| Installer | `MnemosyneC-Setup-0.1.52.exe` |
| SHA-256 | `03694EC037D337DEA48D93DB26E2D46BB145D3CF321631DB9253E132DF493C05` |
| SHA-512 (base64) | `SWKjH5JyFF9bEbqvEAUDnvX90lzvBABo0bp1Gs1+mtYz/WGjXKeM+ifECgV97fKlMYdl8OOH3UhmDrYdXREI8w==` |
| Size | 537,047,252 bytes |
| Release date | 2026-06-11T23:48:53.925Z |
| DRAFT release URL | https://github.com/Upekrithen/LianaBanyanPlatform/releases/tag/untagged-d120dc3012b807916c8e |
| Commit | 98581f3 |

---

## SEG Details

### SEG-V0152-P0-LEAN-DEFAULT

**File:** `src/renderer/components/LeanShell.tsx`

Replaced the bare `resolveInitialUiMode()` function with a documented, hardened version:
- Added JSDoc block documenting all 4 branches (lean stored / advanced stored / corrupted fallthrough / fresh install)
- Changed `localStorage.getItem(LS_UI_MODE) as UiMode | null` to plain `string | null` (type cast moved to return site)
- Added explicit `// Guard:` comment before the known-valid check
- Logic is IDENTICAL — clean VM with no localStorage → 'lean'; existing user → 'advanced'
- SEG-V0152-P0-LEAN-DEFAULT verified at source level; packaged runtime verify required

### SEG-V0152-P0-FLIP-CARD

**File:** `src/renderer/components/LeanHomeTab.tsx`

Removed the old static `<div style={s.pillarsCard}>` block and replaced with `<SixPillarsFlipCard />`. The existing `SixPillarsFlipCard` sub-component (already authored in v0.1.51) was confirmed correct and retained. Removed duplicate function declaration that caused build collision. Removed unused style entries (`pillarsCard`, `pillarsTitle`, `pillarsSub`, `pillarRow`, `pillarLabel`, `pillarDetail`, `proveIt`) from `s` object.

- Front face: Good/Fast/Cheap/Private/Free/Yours pillar rows + "Every figure is reproducible — Prove It · Run your own cabinet" as `<button>` with underline+hyperlink affordance
- Back face: CADRE benchmark provenance, cabinet instructions, SHA-verified source citation
- CSS 3D: `perspective: 800px`, `transformStyle: preserve-3d`, `backfaceVisibility: hidden` on both faces
- Flip triggers: ↻ button (aria-label="Flip card") + "Every figure is reproducible" button
- Visual feedback: opacity/scale transition on all flip-trigger clicks

### SEG-V0152-P0-ASK-TAB-FIX

**Files:** `src/main/index.ts` + `src/renderer/components/LeanAskTab.tsx`

**index.ts change:** `check-ollama-and-model` handler now:
```
if (!ollamaManager) return { reachable: false, hasModel: false, models: [] }
const reachable = await ollamaManager.isReachable()
if (!reachable) return { reachable: false, hasModel: false, models: [] }
const models = await ollamaManager.listModels()
```
Eliminated the standalone `fetch('http://127.0.0.1:11434/api/tags')` that bypassed OllamaManager entirely.

**LeanAskTab.tsx changes:**
- `streamOllama` fetch URL: `http://localhost:11434` → `http://127.0.0.1:11434`
- New `onSwitchToHome?: () => void` prop (passed from LeanShell as `() => setActiveTab('home')`)
- New `checkFailed` + `retrying` states
- `runCheck` callback (useCallback + useEffect) replaces old inline useEffect
- Two distinct banners:
  - `modelMissing && !checkFailed` → yellow banner "Your AI model is still setting up. Usually 2–5 minutes." + Retry ↺
  - `checkFailed` → red banner "Could not reach your local AI. Is Ollama running?" + Retry ↺ + "Open Home tab →"
- Empty-state guard updated: `!modelMissing && !checkFailed`

### SEG-V0152-P0-LEAN-NUDGE

**File:** `src/renderer/components/LeanShell.tsx`

- New `LS_LEAN_NUDGE_DISMISSED = 'lean_nudge_dismissed'` constant
- New `LeanModeNudge({ onSwitch })` component:
  - 32px tall banner, `background: '#0a1628'`, `borderBottom: '1px solid #1e3a5c'`
  - "✨ Try the new simpler view (Lean Mode) →" button (underline, `#6ee7b7`, briefly shows "Switching…" on click)
  - ✕ dismiss button (`color: '#475569'`) → sets `lean_nudge_dismissed=1` → banner hidden permanently
  - `dismissed` state initialized from localStorage (persistent across renders)
- New `switchToLean` useCallback (mirror of existing `switchToAdvanced`)
- Advanced branch updated to wrap `MnemosyneTabView` in column flex div with `<LeanModeNudge onSwitch={switchToLean} />` above it
- `<LeanAskTab />` updated to `<LeanAskTab onSwitchToHome={() => setActiveTab('home')} />`

---

## Cephas / Hugo Updates

| File | Change |
|---|---|
| `Cephas/cephas-hugo/static/download/latest.yml` | v0.1.52 sha512 + size |
| `Cephas/cephas-hugo/data/version.json` | `"version": "0.1.52"` |
| `Cephas/cephas-hugo/content/download/_index.md` | Download URL → v0.1.52; SHA-256 updated |
| `Cephas/cephas-hugo/firebase.json` | X-LB-Version → v0.1.52; X-LB-Build-Hash → v0.1.52+03694ec (both cephas + mnemosyne targets) |
| `Cephas/cephas-hugo/public/` | Hugo rebuilt --minify (2748ms, 1008 pages) |

---

## Founder Install-Verify Required (5 captures)

Per canon `feedback_actual_runtime_verify_for_runtime_bugs_bp078` and `feedback_ux_seg_screenshot_mandatory_bp078` — source change alone does NOT verify runtime behavior.

**(a) Fresh install LEAN default**
- Clean machine: clear localStorage (`mnemoUiMode`, `mnemosynec_onboarding_complete`)
- Install v0.1.52 packaged build
- Expected: opens to LEAN 3-tab UI (Home / Gauntlet / Ask)
- Screenshot required: LEAN shell on first launch

**(b) Six Pillars flip card — both triggers**
- Screenshot: front face with ↻ visible + "Every figure is reproducible…" as hyperlink
- Click ↻ → screenshot: back face with Prove It detail
- Click hyperlink on front → screenshot: same back face

**(c) Ask tab with gemma4:12b running**
- `ollama list` confirms gemma4:12b present
- Open Ask tab → no error banner
- Type "What is MnemosyneC?" → screenshot: streaming response visible

**(d) Existing user Advanced → nudge banner**
- `localStorage.setItem('mnemosynec_onboarding_complete', '1')`; clear `mnemoUiMode` + `lean_nudge_dismissed`
- Relaunch → Advanced mode with nudge banner at top
- Screenshot: nudge banner visible

**(e) Nudge → lean transition + dismiss persistence**
- Click nudge banner → screenshot: Lean mode active
- Dismiss (✕) → relaunch → screenshot: Advanced mode with no nudge

---

## Gates Status

| Gate | Status |
|---|---|
| Gate 1 — Version bump + build | COMPLETE (0.1.52 installer built, 537 MB) |
| Gate 2 — Cephas/Hugo deploy | PENDING Founder ratify |
| Gate 3 — Anonymous download verify | PENDING Founder ratify |

**DRAFT ONLY. Founder must say "ship it" / "push" / "fire" in own words before Gates 2 and 3 execute.**

---

*Knight · BP080 · v0.1.52 · 2026-06-11 · Sonnet 4.6*
