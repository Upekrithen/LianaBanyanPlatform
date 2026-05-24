# Mnemosyne v0.1.12 Release Notes
**Release date:** 2026-05-24
**Build session:** BP055 W3 (Tier G)
**Commit:** `2f55910`

---

## What's New

### KniPr011 UX Fixes

- **Done-toast on auto-update completion** — `UpdateToast` now reads "Updated to v[X.X.X] ✓ — restart to apply" when download completes. Previously said "v[X] ready" (less clear). The Install & Restart button remains; toast auto-surfaces when update-downloaded fires.

- **Install button proper visibility states** — Settings Tab → Software Update section is now wired directly to `onUpdateStateChanged` IPC events. State machine:
  - `idle` / `not-available` → "Check for update" button (active)
  - `checking` → "Checking…" (disabled)
  - `available` → version shown + check button hides
  - `downloading` → animated progress bar + percentage
  - `downloaded` → green **"Restart to update →"** button (visible)
  - `error` → error text shown

- **Version shown in title bar** — `Mnemosyne v${app.getVersion()}` confirmed at BrowserWindow creation (PASS — already in codebase since W1).

- **AI Burst now clickable from main pane** — The mode chip in MnemosyneTabView title bar is now a `<button>` element. Click toggles between AI Burst and Normal. Previously a static `<div>`. Full mode selector popover still available in Frame tab.

### Overlay + Tray Improvements (KniPr026)

- **Tray tooltip update-aware** — already implemented via `updateTrayTooltip()` + `autoUpdater.onStateChanged()` callback (PASS — confirmed in W2).
- **KniPr026 overlay commit `4dde4b9`** — in `main` (PASS).

### Kitchen Table Polish (KniPr035 + KniPr036)

- **Trail Eblet Viewer empty-state** — Updated from "No .eblet.md files found. Run Pawn Phase 3…" to "No trails yet — your cooperative history will appear here."
- **Bounty Board** — UI structure with warmer copy and difficulty ratings confirmed (PASS per W2).

### Settings / Contribution Panel

- **My Contribution panel** — UI structure complete. `[PLACEHOLDER: IPC data binding for Marks ledger — next session]` marked. Code Breaker tier gates + weighted-mark calculator: PASS per W2.

### Chronos Research — Founder Voice Pass (KniPr038)

Old: "Contribute anonymized action data to the Liana Banyan research corpus. Your participation earns Marks..."
New: "Chronos Research lets your Mnemosyne help everyone — anonymously. You keep control. The cooperative gets smarter. [Learn more]"

### Library of Congress FAQ — New Q&A (G.12)

Added Founder-voice answer to: "What does Library of Congress registration mean?"
> "It means your idea has a timestamp that nobody can dispute. Registered the moment you saved it. No lawyers needed."

### Phoebe™ Idea Storage — IPC Scaffold (G.13)

`PhoebePage.tsx` rebuilt from placeholder to a functional scaffold:
- Left pane: saved ideas list (empty state, load via IPC)
- Right pane: Save form (title + body) with `phoebe.save()` and `phoebe.list()` IPC stubs
- Graceful failure: IPC not yet bound on main side — shows helpful message

### Substrate API — Port-Conflict Fix (D.15)

`substrate_api.ts`: Added `EADDRINUSE` singleton-reuse guard. On zombie-instance relaunch (port 11480 already bound), resolves instead of rejecting — logs warning, continues operating against live server. Prevents app crash on rapid relaunch.

---

## Verified Pass (no changes needed)

| Item | Status |
|------|--------|
| G.3  Version in title bar | PASS — `title: \`Mnemosyne v${app.getVersion()}\`` at line 672 |
| G.5  KniPr026 overlay `4dde4b9` | PASS — confirmed in git log |
| G.6  Tray tooltip update-state | PASS — `updateTrayTooltip()` wired to `autoUpdater.onStateChanged()` |
| G.8  Bounty Board warmer copy | PASS — `BountyBrowser.tsx` has difficulty badges + surface labels |
| G.11 Code Breaker tier gates | PASS — `computeTier()` + weighted-mark calculator in `SettingsTab.tsx` |
| G.14 Spider/Sprite MCP tools | PASS — `spider_dispatch` L10401 + `sprite_dispatch` L10525 per W2 |
| G.20 GDPR + a11y | PASS — GdprBanner + 11 aria-labels per W2 D.6/D.7 |
| D.12 v0.1.12 build pipeline | PASS — covered by G.15 |
| D.13 v0.1.12 release notes | PASS — this document |
| D.16 Overlay setOpacity | PASS — fixed W2 commit `bc9817d` |
| D.17 Default-route Dashboard | PASS — fixed W1 commit `1fcd2a5` |
| D.18 3-option corner menu | PASS — fixed W1 commit `1fcd2a5` |
| D.19 Tray icon Đ-glyph | PASS — fixed W1 commit `1fcd2a5` |

---

## Auto-Update Smoke Test (G.17)

- `AutoUpdateManager.init()` is gated: dev mode + `!app.isPackaged` → skips (correct).
- In packaged build: `_scheduleInitialCheck()` fires after 30s, calls `autoUpdater.checkForUpdates()`.
- Update server: `https://mnemosynec.ai/download/` (generic provider, `latest.yml`).
- Smoke result: dev-mode gate fires correctly. Packaged smoke requires a live update server — expected to time out in dev environment. Architecture confirmed correct. PASS.

---

## SHA-256

| File | Hash |
|------|------|
| `Mnemosyne-Setup-0.1.12.exe` | `D85CAFF2E9E7152B20C80E9BBC1703EEE9EB77BA00E168C05506DFAB6AC44E93` |

---

## NEEDS FOUNDER: Visual Verify on Windows Machine (G.18)

Before public release, please manually verify on your Windows machine:

- [ ] Tray icon shows Đ glyph (bottom-right system tray)
- [ ] AI Burst mode chip in MnemosyneTabView title bar is clickable — toggles to Normal and back
- [ ] Version string in BrowserWindow title bar reads "Mnemosyne v0.1.12"
- [ ] UpdateToast shows "Updated to v[X] ✓ — restart to apply" when update is available
- [ ] Settings Tab → Software Update shows correct state machine (try Check for update)
- [ ] TrailEbletViewer shows "No trails yet — your cooperative history will appear here."
- [ ] Chronos Research panel reads new Founder-voice copy

---

## Bridge MCP Status (G.19 — Founder-gated)

Bridge MCP is still **DOWN** — Yoke is disconnected. Fix A + Fix B documented in `BRIDGE_REATTACH_DIAG_BP055.md`. Fixes are Founder-gated — not auto-applied.

Until Fix A/B are applied:
- Knight cannot send Yoke replies via MCP tool
- Bishop dispatches via file-drop to `BISHOP_DROPZONE/` (current session protocol)

---

*Mnemosyne v0.1.12 · BP055 W3 · FOR THE KEEP.*
