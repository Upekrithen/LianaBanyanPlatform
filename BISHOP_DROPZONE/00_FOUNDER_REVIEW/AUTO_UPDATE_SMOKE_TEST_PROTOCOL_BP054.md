# Auto-Update Smoke Test Protocol
## Mnemosyne v0.1.9 → v0.1.10
## BP054 · KniPr044

---

## Infrastructure Verification (KniPr044 code-read results)

### Publish Provider
- **Config**: `"provider": "generic"` → `https://mnemosynec.ai/download/`
- **NOT** GitHub Releases direct. The `liana-banyan/mnemosyne` GitHub repo hosts the tagged release, but electron-updater reads from the generic CDN endpoint.
- `channel: "latest"` → reads `https://mnemosynec.ai/download/latest.yml`

### Update Server Status (verified 2026-05-24)
| URL | HTTP Status | Version served |
|-----|-------------|----------------|
| `https://mnemosynec.ai/download/latest.yml` | **200 OK** | **0.1.9** ← STALE |
| `https://github.com/liana-banyan/mnemosyne/releases/tag/v0.1.10` | 200 OK | tag exists |
| `https://github.com/liana-banyan/mnemosyne/releases/download/v0.1.10/latest.yml` | 404 | N/A (generic provider, not GH assets) |

> ⚠️ **CRITICAL BLOCKER**: `mnemosynec.ai/download/latest.yml` still reports `version: 0.1.9`.
> Auto-updater will NOT detect v0.1.10 until this file is updated to point to the new installer.
> **The smoke test below cannot pass until the CDN is updated.**

### autoUpdater Configuration (`src/main/auto_updater.ts`)
| Setting | Value | Notes |
|---------|-------|-------|
| `autoDownload` | `true` | Downloads automatically on update-available |
| `autoInstallOnAppQuit` | `true` | Installs on next quit if downloaded |
| `allowPrerelease` | `false` | Stable channel only |
| `allowDowngrade` | `false` | Forward-only |

### Zombie-Loop Fix (KniPr011) — CONFIRMED ✓
Guard in `checkNow()` (lines 69–77 of `auto_updater.ts`):
```typescript
if (this.state.status === 'downloaded') {
  // re-broadcasts existing ready state, does NOT re-fire download
  this._broadcast('update-state-changed', this.state);
  return;
}
if (this.state.status === 'downloading') {
  // silently skips duplicate check
  return;
}
```
**Result**: Subsequent `check-for-updates` calls after a completed download will re-broadcast the "ready" state but never re-trigger the download pipeline.

### update-downloaded IPC — CONFIRMED ✓
`update-downloaded` event handler (lines 147–158) calls `this._setState(...)` which calls
`this._broadcast('update-state-changed', this.state)` — state pushed to all registered renderer windows.
Renderer receives `{ status: 'downloaded', version, releaseNotes, downloadProgress: 100 }`.

### quitAndInstall wiring — CONFIRMED ✓
`autoUpdater.quitAndInstall(true, true)` is called from:
```typescript
ipcMain.on('install-update', () => {
  this.installNow();  // only fires if state.status === 'downloaded'
});
```
Called from IPC handler (user-initiated action), NOT from a timer. Silent-restart arg is `true`.

---

## Prerequisites

- **v0.1.9 installer**: `https://github.com/liana-banyan/mnemosyne/releases/tag/v0.1.9`
  - File: `Mnemosyne-Setup-0.1.9.exe` (sha512: `PztcJIbK3ZX…KdnzQ==`, size ~76 MB)
- **v0.1.10 installer**: must be uploaded to `https://mnemosynec.ai/download/` and `latest.yml` updated before this test can run
- Clean Windows 10/11 machine or VM (or fully uninstall v0.1.10 first)
- Internet connection
- Note: `verifyUpdateCodeSignature: false` in build config — no code-signing cert required for test

---

## Steps

1. **Install v0.1.9** from GitHub releases (`Mnemosyne-Setup-0.1.9.exe`)
2. **Launch Mnemosyne** — verify title bar or About dialog reads "Mnemosyne v0.1.9"
3. Wait ~30 seconds after launch for the initial delayed update check to fire automatically
   - OR right-click tray icon → "Check for Updates" (manual trigger via `check-for-updates` IPC)
4. **Verify**: system notification "Mnemosyne Update — v0.1.10 is available — downloading now…" appears
5. **Verify**: UI shows downloading progress (0–100%) — download is NOT silent (`autoDownload: true` but renderer gets `download-progress` IPC events)
6. **Verify**: after download completes, system notification "Mnemosyne ready to update — v0.1.10 downloaded — restart to apply" appears
7. **Verify**: in-app toast/banner shows "Mnemosyne v0.1.10 ready to install" with **[Install & Restart]** button
8. **Click [Install & Restart]** (fires `install-update` IPC → `quitAndInstall(true, true)`)
9. **Verify**: App quits and relaunches cleanly into v0.1.10
10. **Verify**: title bar / About reads "Mnemosyne v0.1.10"
11. Trigger update check again (tray menu or wait for 4-hour periodic timer)
12. **CRITICAL — Zombie-loop check**: Verify NO "downloading" notification appears. Should see either nothing, or a "up to date" status pill. Renderer receives re-broadcast of `{ status: 'downloaded' }` state — NOT a new download event.
13. **Verify**: status pill (if visible in UI) shows green "up to date" after version confirms current.

---

## Pass/Fail Criteria

| Step | Check | Pass condition |
|------|-------|----------------|
| 4 | Update notification fires | Notification text contains "v0.1.10" |
| 5 | Download progress visible | UI shows % progress (not silent) |
| 6 | Download-complete notification | Notification text: "v0.1.10 downloaded" |
| 7 | In-app toast visible | [Install & Restart] button present |
| 8–9 | Clean restart | App exits, relaunches without crash |
| 10 | Version bump confirmed | Title/About shows v0.1.10 |
| 12 | Zombie-loop fixed | NO re-download notification after second check |
| 13 | Status pill green | "up to date" indicator shown |

**All 8 checks PASS** = auto-update flow fully working for v0.1.9 → v0.1.10.

---

## Blockers to Resolve Before Running Smoke Test

1. **[ ] Update `mnemosynec.ai/download/latest.yml`** to version `0.1.10` with correct installer URL, sha512, and size.
   - Current value: `version: 0.1.9` (stale — verified 2026-05-24)
   - Until this is done, v0.1.9 installations will NOT detect v0.1.10 via auto-updater.

2. **[ ] Upload `Mnemosyne-Setup-0.1.10.exe`** (and portable if applicable) to the CDN at `https://mnemosynec.ai/download/`.

---

## GO / NO-GO Summary

| Check | Result |
|-------|--------|
| Publish config owner `liana-banyan` | N/A — uses generic provider (`mnemosynec.ai`), not GitHub Releases publish |
| latest.yml accessible (mnemosynec.ai) | ✓ HTTP 200 — but version is **0.1.9** (STALE) |
| latest.yml version = 0.1.10 | ✗ **NO-GO** — update server not yet updated |
| Zombie-loop guard in code | ✓ CONFIRMED |
| update-downloaded IPC confirmed | ✓ CONFIRMED |
| quitAndInstall from IPC (not timer) | ✓ CONFIRMED |
| GitHub v0.1.10 tag accessible | ✓ HTTP 200 |

**Overall: NO-GO** — code is correct and zombie-loop is fixed, but the generic update server (`mnemosynec.ai/download/latest.yml`) must be updated to `version: 0.1.10` before the auto-update flow can complete end-to-end. Once CDN is updated, re-run this smoke test.

---

*Protocol authored by Knight (Claude Sonnet 4.6) · KniPr044 · 2026-05-24*
