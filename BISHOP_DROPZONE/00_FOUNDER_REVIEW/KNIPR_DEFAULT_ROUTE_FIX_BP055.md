# KNIPR — Default Route Fix BP055
**Session:** Knight · Cursor Sonnet 4.6 · BP055 · 60-NOVACULI parallel dispatch  
**Date:** 2026-05-24  
**Mechanic:** Knight (Cursor · Sonnet 4.6)  
**Saladin's Pattern:** one-shot, one-kill, no wounding-and-leaving

---

## SAGA-1 · Mnemosyne default route = Dashboard, NOT overlay

### Acceptance: PASS ✅

### Root Cause Confirmed
`createOverlayWindow()` was firing unconditionally at line 1528 of `src/main/index.ts` on every launch. The Dashboard only opened for first-run (`if (firstRun)`). Every subsequent launch: overlay showed, Dashboard did not.

### Changes Made

**File: `src/main/index.ts`**

| Location | Before | After |
|---|---|---|
| L1527-1528 (boot sequence) | `createOverlayWindow()` called unconditionally | Removed — comment replaced with SAGA-1 note |
| L1550-1561 (Dashboard open logic) | `openDashboard()` only on first run | `openDashboard({ focus: true })` on **every** launch (unless `MNEMOSYNE_NO_AUTO_OPEN=1`) |
| L1641 (`activate` handler) | `if (!overlayWindow) createOverlayWindow()` | `openDashboard({ focus: true })` — macOS dock click opens Dashboard |
| L530-534 (tray AI Burst radio) | `setMode('ai_burst')` only | Also calls `createOverlayWindow()` + `showInactive()` — Burst Mode is the opt-in overlay surface |

### Invariants Preserved
- Tray right-click → **Show Overlay** (`rebuildTrayMenu` L587-592): still creates overlay on demand
- Tray right-click → **🔥 AI Burst Mode**: now additionally surfaces the overlay (opt-in)
- `MNEMOSYNE_NO_AUTO_OPEN=1` env var: still skips auto-open (CI / headless)
- `markFirstRunComplete()`: still fires on first run after Dashboard shows

---

## SAGA-2 · "Normal" corner button → 3-option popover menu

### Acceptance: PASS ✅

### Diagnosis
`DashboardCornerAffordance.tsx` was a single-action `<button>` that called `openDashboard()` on click. No popover, no mode switching capability.

`setFrameMode` IPC was already wired on both sides (preload.ts L222-223, main index.ts L846-848) — no new IPC needed.

### Changes Made

**File: `src/renderer/components/DashboardCornerAffordance.tsx`** — full rewrite

The pill button is now a **click-to-open popover** container with 3 menu items:

| Item | Action | IPC |
|---|---|---|
| 🪟 **Open Dashboard** | `window.amplify?.openDashboard?.()` | `open-dashboard` (existing) |
| 🔥 **Burst Mode** | `setFrameMode('ai_burst')` + `showOverlay()` | `set-frame-mode` + `show-overlay` (both existing) |
| ❄️ **Fallback Mode** | `setFrameMode('fallback')` | `set-frame-mode` (existing) |

### UX Behaviors
- Click pill → opens popover (pill border-radius morphs from rounded-pill to top-rounded-rect)
- Click outside → closes popover, re-enables click-through
- Escape key → closes popover
- `setClickthrough(false)` on mouse-enter (prevents pointer fall-through during hover)
- `setClickthrough(true)` on close / mouse-leave (restores overlay passthrough)
- Font: `NotCents-CAI` / `CAINotCents` preserved
- Voice: Heart-of-Peace ("Open Dashboard", "Burst Mode", "Fallback Mode")

---

## SAGA-3 · Mnemosyne tray icon regression

### Acceptance: PASS ✅

### Investigation

**Git log for `assets/tray-icon.png`:**
```
891ee81  refactor: monorepo restructure BP054 (moved path only)
7f5445c  feat(mnemosyne): v0.1.7 unsigned Founder-test ship · BP051  ← REGRESSION
d29b66d  feat(mnemosyne): v0.1.6 BP048 — Đ purge, watchdog, Bridge CTA, tray icon  ← KNOWN-GOOD
```

**Blob hash comparison:**
| Commit | Blob SHA | Status |
|---|---|---|
| `d29b66d` (v0.1.6, explicit tray fix) | `6cc3337471ab708150ad62fb07a937bfc2a24054` | ✅ Known-good |
| `7f5445c` (v0.1.7) | `46a99093c0852792c3268b258706294bf7baafaa` | ❌ Regressed |
| `HEAD` (before fix) | `46a99093c0852792c3268b258706294bf7baafaa` | ❌ Regressed |

**Regressing commit:** `7f5445c` — "v0.1.7 unsigned Founder-test ship · cert callback pending · BP051"  
The v0.1.7 build regenerated all app icons in one pass, replacing the hand-tuned NotCents Đ tray icon with a generic dark-circle variant. The icon blob changed from `6cc3337` to `46a9909`.

**Reference:** `C:\Users\Administrator\Downloads\Relevant 24 May 2026\NotCents.png` — canonical NotCents Đ glyph (black on white). Tray icon should render as Đ on a dark tray-appropriate background — confirmed visually.

### Fix Applied

Restored `assets/tray-icon.png` from git blob `6cc3337471ab708150ad62fb07a937bfc2a24054` (d29b66d state) using binary-safe `System.Diagnostics.Process` + `MemoryStream` extraction. File size: **842 bytes** (correct); PNG magic byte confirmed: `0x89`.

**File changed:** `assets/tray-icon.png`

---

## Build Verification

```
npm run build → EXIT 0
unicode-check OK: zero Đ / ⊃ / 🪙 in src/
✓ 348 modules transformed.
✓ tsc -p tsconfig.main.json (no errors)
```

All three SAGAs: **PASS**. No blockers.

---

## Commit Scope (files changed)
- `src/main/index.ts` — SAGA-1 boot sequence + tray menu  
- `src/renderer/components/DashboardCornerAffordance.tsx` — SAGA-2 popover refactor  
- `assets/tray-icon.png` — SAGA-3 icon restoration  

FOR THE KEEP. 🌊⚓🪙 Đ
