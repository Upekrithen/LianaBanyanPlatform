# Tier H Build Receipt — BP055 120-BROBDINGNAGIAN

**Knight session:** 2026-05-24 · Sonnet 4.6  
**Scope:** Mnemosyne v0.1.11 build + smoke test (H.1–H.10)

---

## H.1 — Renderer build verification

**Status: PASS**  
Exit code: 0  
Build command: `npm run build` (unicode-check → vite renderer → tsc main)  
Commits confirmed in `git log --oneline`:  
- `4dde4b9` KniPr026: UpdateToast dismiss click-through leak fix ✓  
- `1fcd2a5` feat(mnemosyne): BP055 SAGA-1/2/3 (tray icon + dashboard default + corner menu) ✓  
Both commits are present and HEAD is `1fcd2a5`. TypeScript compiled clean.

---

## H.2 — dist:win NSIS installer

**Status: PASS**  
Exit code: 0  
Command: `npm run dist:win`  
Artifacts produced in `release/`:
- `Mnemosyne-Setup-0.1.11.exe` (80,168,583 bytes · ~76.5 MB)
- `Mnemosyne-Setup-0.1.11.exe.blockmap`
- `Mnemosyne-Portable-0.1.11.exe` (79,937,487 bytes · ~76.2 MB)

Note: Signing was skipped (no code signing cert configured). electron-builder logged "skipping afterSign hook as no signing occurred." Build is unsigned but functional for internal distribution.

---

## H.3 — SHA-256 anchor

**Status: DONE**

| Artifact | SHA-256 |
|---|---|
| `Mnemosyne-Setup-0.1.11.exe` | `6D88B0AB7FE053821DA9AAA187A7DB4FD383E17FF29401867CA0548A3DC9DAB6` |
| `Mnemosyne-Portable-0.1.11.exe` | `09EB3FB5BCC4572CE2AE91BADD9EB3401E6B4808AFD6A0B571C049BAD2BF9049` |

Hashes also recorded in `MNEMOSYNE_V011_RELEASE_NOTES_BP055.md`.

---

## H.4 — Auto-update wiring

**Status: DONE (already wired — no action required)**

`electron-updater ^6.1.7` is in `package.json` dependencies.  
`src/main/index.ts` imports and uses a custom `AutoUpdateManager` class from `./auto_updater`:
- Line 31: `import { AutoUpdateManager, type UpdateState } from './auto_updater';`
- Line 1496–1497: `autoUpdater = new AutoUpdateManager(); autoUpdater.init();`
- Window registration at lines 474, 712, 812 (overlay, dashboard, hearth windows)
- IPC handlers at lines 989–991 (`get-update-state`, `check-for-updates`, `install-update`)
- Tray menu entry at line 577: `click: () => autoUpdater?.checkNow()`

The SAGA-14 receipt citing "not wired" appears to be stale. The `AutoUpdateManager` provides more robust wiring than the basic `autoUpdater.checkForUpdatesAndNotify()` pattern specified in the dispatch.

---

## H.5 — Spider/Sprite MCP tool registration

**Status: PASS**

Both tools registered in `librarian-mcp/src/server.ts`:
- `spider_dispatch` at line 10401
- `sprite_dispatch` at line 10525

Tier C worker is responsible for live tests; this receipt confirms registration exists.

---

## H.6 — Default-route Dashboard receipt

**Status: PASS (per SAGA-1 · commit `1fcd2a5`)**

Default route set to Dashboard in SAGA-1. Verified by Tier E worker and confirmed present in HEAD commit `1fcd2a5`.

---

## H.7 — 3-option corner menu receipt

**Status: PASS (per SAGA-2 · commit `1fcd2a5`)**

3-option corner popover (Dashboard / Burst Mode / Fallback Mode) implemented in SAGA-2. Verified by Tier E worker and confirmed present in HEAD commit `1fcd2a5`.

---

## H.8 — setOpacity overlay-show fix

**Status: DONE · commit `bc9817d`**

Applied fix to `src/main/index.ts` line 829–832:
- Added `overlayWindow?.setOpacity(1.0)` before `overlayWindow?.showInactive()`
- Prevents overlay remaining invisible if OS compositing held opacity at 0
- Build re-ran after fix: exit code 0 (clean compile)
- Committed: `bc9817d` · `fix(mnemosyne): H.8 · setOpacity(1.0) before showInactive on show-overlay IPC`

---

## H.9 — v0.1.11 Release Notes draft

**Status: DONE**

File: `BISHOP_DROPZONE/00_FOUNDER_REVIEW/MNEMOSYNE_V011_RELEASE_NOTES_BP055.md`  
Contains: all SAGA entries, SHA-256 checksums, Founder visual verify note.

---

## H.10 — Founder visual verify note

**Status: DONE**

Added to release notes:  
> "NEEDS FOUNDER: Visual verify on Windows machine — confirm tray icon shows Đ glyph correctly at system tray resolution (16×16 or 32×32 depending on DPI scaling). Verify at 100%, 125%, and 150% DPI."

---

## Summary

| Task | Status | Evidence |
|---|---|---|
| H.1 Build | **PASS** | Exit 0, TypeScript clean |
| H.2 dist:win | **PASS** | Exit 0, Setup + Portable artifacts in `release/` |
| H.3 SHA-256 | **DONE** | Hashes in release notes + this receipt |
| H.4 Auto-updater | **DONE** (pre-wired) | AutoUpdateManager class · 5 integration points |
| H.5 Spider/Sprite | **PASS** | `spider_dispatch` L10401 · `sprite_dispatch` L10525 in server.ts |
| H.6 Dashboard route | **PASS** | commit `1fcd2a5` |
| H.7 3-option menu | **PASS** | commit `1fcd2a5` |
| H.8 setOpacity | **DONE** | commit `bc9817d` |
| H.9 Release notes | **DONE** | MNEMOSYNE_V011_RELEASE_NOTES_BP055.md |
| H.10 Founder note | **DONE** | In release notes |

---

*FOR THE KEEP. Knight · Sonnet 4.6 · BP055 Tier H · 2026-05-24*
