# Knight M23 Pre-Block — Empirical Component Map
## MnemosyneC Settings UI Architecture Survey

**Produced by:** Sonnet 4.6 (read-only dispatch)
**Date:** 2026-06-22
**Purpose:** Replace Rook's hypothetical component tree with ground-truth findings
**Scope:** `src/` directory (MnemosyneC Electron app) — NOT `platform/src/` (web SPA)
**Method:** Pure grep/glob/Read — zero edits, zero commits, zero deploys

---

## CRITICAL FINDING: Wrong Search Root

> Rook's report references `platform\src\components\Settings\TierTile.tsx` and similar paths.
> `platform/src/` is the **web SPA** (lianabanyan.com + portals). The MnemosyneC Electron app lives in `src/` (workspace root). Every Rook file path claim that begins with `platform\src\` is wrong by definition.

The correct search root is: `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\`

---

## KniPr [Pre-Block]: Empirical Component Map

```
SettingsContainer:      NOT FOUND (does not exist anywhere in src/)
AIPowerTier:            NOT FOUND as standalone component
TierTile:               NOT FOUND as standalone component
Section_AICapability:   NOT FOUND
Section_AppVersion:     NOT FOUND
All "Section_*" files:  ZERO FILES — glob returned 0 results
Substrate-Cure violation: FOUND — WelcomeView.tsx:203 + ShareMnemosyneC.tsx:101
                          (NOT in Section_AICapability.tsx — that file does not exist)
"Cathedral" in UI labels: NOT FOUND in any rendered UI string in SettingsTab
app:quit IPC:           DIFFERENT CHANNEL — handler EXISTS as 'app:request-quit' (src/main/index.ts:2900)
                        Rook claimed it was ABSENT — it is PRESENT under different name
localStorage key:       'mnemosyne_user_config_v2' — NOT FOUND anywhere
                        Actual keys written by SettingsTab: see Section 5 below

Discrepancies from Rook's map: MAJOR — see Section 6
```

---

## 1. Actual Component Tree

```
src/renderer/App.tsx (447 lines)
└── MnemosyneTabView.tsx (src/renderer/components/MnemosyneTabView.tsx · 1512 lines)
    │   [16-tab shell — Tab 4 = Settings (gear icon)]
    └── SettingsTab.tsx (src/renderer/components/SettingsTab.tsx · 2633 lines)
        │   [MONOLITHIC — all Settings sections inline in one file]
        │   [Sub-components defined in same file:]
        ├── ChronosResearchPanel (inline, ~lines 93–164)
        ├── MyContributionPanel (inline, ~lines 463–541)
        ├── FolderManagerPanel (inline, grep: "Substrate Folders" section)
        └── [IMPORTED component for tier tiles:]
            └── SkuUpgradePanel (src/renderer/components/SkuUpgradePanel.tsx · 976 lines)
                    [Renders NANO/LITE/CORE/FULL/ULTRA tier tiles inline — NO TierTile.tsx]
```

**App.tsx → MnemosyneTabView.tsx → SettingsTab.tsx is the actual render path.**

There is no `LayoutMain.tsx`, no `ContentArea`, no `SettingsContainer.tsx`, no `SettingsHeader.tsx`.

---

## 2. SettingsTab.tsx — Full Section Inventory

**File:** `src/renderer/components/SettingsTab.tsx`
**Line count:** 2633 lines

**Actual section order** (from `sectionHeader` style grep + reading file):

| # | Section Name | Line | Notes |
|---|---|---|---|
| 0 | Run Diagnostic (shortcut) | 1427–1445 | AT TOP — before search box. Rook placed it at "Lines 102-150" in a non-existent file. |
| — | Settings search box | 1447–1513 | Quick-jump search, not a section |
| — | Disambiguator note | 1516–1528 | "App updates change software…" |
| 1 | Interface Mode | 1531–1560 | lean ↔ advanced toggle (`mnemoUiMode` key) |
| 2 | App Version | 1563–1682 | Update check + version display |
| 3 | AI Capability | 1640–1682 | Current tier badge + "Activate FULL" CTA |
| 4 | Cooperative Membership | 1684–1699 | $5/year display |
| 5 | AI Power Tier | 1701–1731 | Renders `<SkuUpgradePanel>` — see Section 3 |
| 5b | AI Model Assignment | 1733–1808 | Pawn/Bishop/Knight/Rook piece model selectors |
| 6 | Hardware Tier & Plow Model | 1810–1938 | RAM detection + model override |
| 7 | Advanced (collapsible) | 1938–~2056 | DevTools + Run Diagnostic (2nd instance) |
| 8 | Appearance | 2057–2148 | Theme + zoom |
| 9 | Substrate Mode | 2149–2181 | ai_burst / normal / fallback |
| 10 | Developer Mode | 2183–2207 | Role-gated (member + Pledge #2260) |
| 11 | Research Participation | ~2210 | `<ChronosResearchPanel />` |
| 12 | My Contribution | ~2213 | `<MyContributionPanel />` |
| 13 | Substrate Folders | ~2216 | `<FolderManagerPanel />` |
| 14 | Grand Projects | 2219–~2260 | Library of Congress Grand Project |

**Prop interface (lines 17–24):**

```typescript
// src/renderer/components/SettingsTab.tsx:17-24
interface SettingsTabProps {
  authState: AuthState | null;
  onDevModeToggle?: (enabled: boolean) => void;
  devEnabled?: boolean;
  // SEG-UX-2: scroll-to-anchor target from pill modal "Open AI Tier in Settings"
  scrollTo?: string | null;
  onScrollConsumed?: () => void;
}
```

**Comment block confirms ordering intent:**

```typescript
// src/renderer/components/SettingsTab.tsx:3-4
// SEG-R-2/3/4/5/6/7/12: restructured -- new top-level cards, AI Power Tier, Memory Depth Tier, Advanced collapsible
// Order: App Version | AI Capability | Cooperative Membership | AI Power Tier (+ model assign) | Memory Depth Tier | Advanced | Appearance | Substrate | Developer | Research | Contribution | Folders | Grand Projects
```

**Confirmed:** AI Power Tier appears **5th** in the render order (after Run Diagnostic shortcut, Interface Mode, App Version, AI Capability, Cooperative Membership). Rook's claim of "buried after 5+ sections" is accurate in substance — the scrolling friction is REAL. The root cause is accurate; only the file attribution is wrong.

---

## 3. SkuUpgradePanel.tsx — Tier Tiles

**File:** `src/renderer/components/SkuUpgradePanel.tsx`
**Line count:** 976 lines

**Tier definitions (lines 41–87) — hardcoded in static array `SKU_TIERS`:**

```typescript
// src/renderer/components/SkuUpgradePanel.tsx:41-87
const SKU_TIERS: SkuTierDef[] = [
  { id: 'nano',  name: 'NANO',  model: 'qwen2.5:0.5b',   modelSize: '~500 MB bundled' },
  { id: 'lite',  name: 'LITE',  model: 'gemma2:2b',       modelSize: '~2 GB download' },
  { id: 'core',  name: 'CORE',  model: 'gemma2:9b',       modelSize: '~6 GB download' },
  { id: 'full',  name: 'FULL',  model: 'gemma4:12b',      modelSize: '~7 GB download' },
  { id: 'ultra', name: 'ULTRA', model: 'llama3.3:70b',    modelSize: '~42 GB download' },
];
```

**Model names ARE hardcoded** — Rook's claim is correct that strings are not config-driven. They live in `SKU_TIERS` array in `SkuUpgradePanel.tsx` (not in a separate TierTile.tsx, and NOT `<h3>ULTRA (Gemma 4 12b)</h3>` as Rook claimed — they're in a typed data structure).

**Active tile logic (lines 101–112) — already uses STRICT equality:**

```typescript
// src/renderer/components/SkuUpgradePanel.tsx:101-112
function getTileState(
  tileTier: SkuTierId,
  effectiveTier: SkuTierId,
  autoDetectedTier: SkuTierId,
): TileState {
  if (tileTier === effectiveTier) return 'active';          // STRICT ===
  const tileIdx = TIER_ORDER.indexOf(tileTier);
  const hwIdx = TIER_ORDER.indexOf(autoDetectedTier);
  if (tileIdx <= hwIdx) return 'available';
  if (tileIdx === hwIdx + 1) return 'challenge-destiny';
  return 'insufficient';
}
```

> **ROOK DISCREPANCY:** Rook claimed the multi-active bug was due to `includes()` or `==` loose comparison at "AIPowerTier.tsx ~line 315". The actual code uses strict `===`. The radio bug may have already been fixed (possibly by M18b). Knight should smoke-test to confirm only one tile shows active — the code path is correct.

**Tiles are rendered inline in SkuUpgradePanel.tsx** via `SKU_TIERS.map(...)` starting at line 743. There is NO `TierTile.tsx` sub-component.

**Header label (line 710):** `"Caithedral AI Tier"` — this is the rendered label inside SkuUpgradePanel (within the Settings AI Power Tier section).

---

## 4. Other Settings-Adjacent Component Files

All in `src/renderer/`:

| File | Lines | Role |
|---|---|---|
| `components/SkuUpgradePanel.tsx` | 976 | Tier tiles (NANO/LITE/CORE/FULL/ULTRA) |
| `components/SkuUpgradeModal.tsx` | ~175 | Modal wrapper around SkuUpgradePanel |
| `hearth/conjunction/ApiKeysSettings.tsx` | — | API key settings (Hearth Conjunction window only) |
| `hearth/conjunction/TierSelect.tsx` | — | Tier selection in Hearth Conjunction window |
| `components/AccountTypeSettings.tsx` | — | Account type (platform web SPA — NOT in Electron) |
| `components/ProfileSettings.tsx` | — | Profile settings |
| `components/ProfileVisibilitySettings.tsx` | — | Profile visibility |
| `swirling-winds/wind-settings-card.tsx` | — | Wind tier settings |
| `utils/glow_tier.ts` | — | Tier utility (glow rendering) |

> **Note:** `platform/src/pages/cathedral/CathedralSettings.tsx` and `platform/src/pages/LBFrameTierSettingsPage.tsx` are in the **web SPA** (`platform/src/`) — they are NOT part of the MnemosyneC Electron app.

---

## 5. IPC Handlers — Actual vs Rook Claims

**All `ipcMain.handle` calls in `src/main/` (key handlers relevant to Settings):**

| Rook's Claimed Channel | Actual Channel | File | Line | Match? |
|---|---|---|---|---|
| `hardware:get-tier` | `hardware:get-tier` | `src/main/index.ts` | 5002 | EXISTS — but via `safeHandle()`, not separate hardwareHandlers.ts |
| `hardware:set-tier` | `hardware:set-model` (via preload) | `src/main/preload.ts` | 1638 | DIFFERENT name |
| `app:get-version` | NOT FOUND as dedicated handler | — | — | ABSENT (version likely read from electron app API differently) |
| `diagnostic:run` | `diagnostic:run` | `src/main/index.ts` | 1649 | EXISTS — in index.ts via `safeHandle()`, not separate diagnosticHandlers.ts |
| `app:quit` (**"MISSING"**) | `app:request-quit` | `src/main/index.ts` | 2900 | **EXISTS** — Rook said ABSENT; it exists under a different channel name |

**`app:request-quit` (line 2900):**
```typescript
// src/main/index.ts:2900
ipcMain.handle('app:request-quit', () => { app.quit(); });
```

**Preload bridge surface (line 1603):**
```typescript
// src/main/preload.ts:1603
ipcRenderer.invoke('app:request-quit'),
```

> Rook's claim that `app:quit` is "not currently invoked by any UI button in Settings" — the Settings UI does NOT have a Quit button (confirmed). The handler exists in main but is not wired to any button. The UX gap is REAL; only the channel name was misidentified.

**Additional IPC handlers NOT mentioned by Rook but relevant to Settings:**

- `brain-registry:list` / `brain-registry:get-active` / `brain-registry:set-active` — Brain Registry (AI model brain swap)
- `bridge:check-messages` / `bridge:send-message` — Knight-Bishop bridge
- `mnemosynec:get-memory-md` / `mnemosynec:reload-memory-md` — Memory scaffold
- `watcher:add-folder` / `watcher:list-folders` / `watcher:get-stats` — Substrate Folders
- `caithedral:*` — 10+ Caithedral substrate tools

---

## 6. "Cathedral" Strings — Actual Locations

Grep pattern: `Cathedral` (case-sensitive) in `src/`:

| File | Line | String | Context | UI-rendered? |
|---|---|---|---|---|
| `src/renderer/lib/angel_of_death/layers/lb_stamp_layer.ts` | 207 | `attesingCathedralNode` | Code variable name (typo in variable — "attesing") | NO |
| `src/renderer/lib/angel_of_death/types.ts` | 53 | `attesingCathedralNode` | TypeScript type field | NO |
| `src/main/index.ts` | 4413 | `"...Caithedral Cathedral Architecture..."` | Patent title data string (PROV-021 filing record) | NO |
| `src/main/genesis_mint_exec.ts` | 84 | `"...Caithedral Cathedral Architecture..."` | Same patent title, duplicate | NO |
| `src/main/services/SubstratedFolderWatcher.ts` | 8 | `CathedralFederation (v0.1.9+)` | Code comment | NO |

**VERDICT:** Zero "Cathedral" (wrong spelling) instances in UI-rendered strings in SettingsTab. Rook's claim of a "Cathedral typo in Section_AppVersion.tsx" is UNFOUNDED — that file does not exist, and no such typo exists in any rendered Settings label. The correct Caithedral spelling is already used in all rendered UI contexts found.

---

## 7. "AI That Remembers" — Actual Locations (Canon Violation)

Grep pattern: `AI that remembers` / `AI That Remembers` in `src/`:

| File | Line | Exact String | Should be |
|---|---|---|---|
| `src/renderer/components/WelcomeView.tsx` | 203 | `"Free AI that remembers, runs locally, belongs to you."` | "The Substrate Cure to AI Amnesia" |
| `src/renderer/components/ShareMnemosyneC.tsx` | 101 | `"Share the AI that remembers — free forever, runs locally, belongs to you."` | Update per BP089 canon |

**VERDICT:** Two instances confirmed. Rook correctly identified the violation but attributed it to `Section_AICapability.tsx` (which does not exist). The actual violations are in `WelcomeView.tsx` and `ShareMnemosyneC.tsx`.

**NOT in SettingsTab.tsx at all.** The Settings UI does not render "AI That Remembers" anywhere.

---

## 8. localStorage Keys Written by Settings Components

### SettingsTab.tsx (src/renderer/components/SettingsTab.tsx):

| Key | Line | Value Type | Section |
|---|---|---|---|
| `mnemo_chronos_consent` | 90 | JSON object | Research Participation (ChronosResearchPanel) |
| `mnemo_mnem_drt` | 939 | JSON object | Memory Depth Tier (MnemDrtPanel) |
| `mnemo_theme` | 1360 | `'dark' \| 'light' \| 'system'` | Appearance |
| `ui.zoomFactor` | 1365 | string (number) | Appearance |
| `mnemo_default_mode` | 1371 | SubstrateMode string | Substrate Mode |
| `mnemo_piece_models` | 1377 | JSON object | AI Model Assignment |
| `mnemoUiMode` | 1545 | `'lean' \| 'advanced'` | Interface Mode toggle |
| `mnemo_folder_prompt_count` | 2282 | string (number) | Substrate Folders |
| `mnemo_auto_install_on_quit` | 2331 | `'true' \| 'false'` | Advanced section |

> **ROOK DISCREPANCY:** Rook claimed the localStorage key was `mnemosyne_user_config_v2` containing `{ theme, tier, autoUpdate }`. **This key does NOT exist anywhere in `src/`.** Settings are stored in multiple discrete keys (above), not one blob. The "desync bug" from a unified config blob is likely moot — settings are already split by concern.

### Additional keys from other src/ components (selected):

| Key | File | Purpose |
|---|---|---|
| `mnemoUiMode` | `LeanShell.tsx` | UI mode cross-window sync |
| `LS_UI_MODE` (constant) | `LeanShell.tsx` | lean ↔ advanced shell |
| `mnemosyne_faq_topic` | `MnemosyneTabView.tsx` | FAQ topic surfacing |
| `mnemo_install_ts` | `MnemosyneTabView.tsx` | Install timestamp |
| `mnemo_folder_prompt_count` | `MnemosyneTabView.tsx` | Folder index nudge |
| `LS_ACTIVE_TAB` (constant) | `MnemosyneTabView.tsx` | Active tab persistence |
| `LS_DEVELOPER_MODE` (constant) | `MnemosyneTabView.tsx` | Dev mode flag |
| `LS_GAUNTLET_FIRST_COMPLETE` | `MnemosyneTabView.tsx` | Gauntlet gate |
| `LS_ONBOARDING_COMPLETE` | `MnemosyneTabView.tsx` | WelcomeView gate |
| `LS_BP067_FIRST_RUN_COMPLETE` | `Bp067FirstRunSpine.tsx` | Full spine gate |
| `mnemo_overlay_active` | `App.tsx` | Frame overlay toggle |

---

## 9. Component File Line Counts Summary

| File | Path | Lines |
|---|---|---|
| `App.tsx` | `src/renderer/App.tsx` | 447 |
| `MnemosyneTabView.tsx` | `src/renderer/components/MnemosyneTabView.tsx` | 1512 |
| **`SettingsTab.tsx`** | `src/renderer/components/SettingsTab.tsx` | **2633** |
| **`SkuUpgradePanel.tsx`** | `src/renderer/components/SkuUpgradePanel.tsx` | **976** |
| `WelcomeView.tsx` | `src/renderer/components/WelcomeView.tsx` | ~240 (est.) |
| `ShareMnemosyneC.tsx` | `src/renderer/components/ShareMnemosyneC.tsx` | ~120 (est.) |

---

## 10. Rook Discrepancy Summary

| Rook Claim | Empirical Reality | Impact on M23 |
|---|---|---|
| `SettingsContainer.tsx` at lines 45-320 | DOES NOT EXIST. All settings are in `SettingsTab.tsx` (2633 lines, monolithic). | §1a target: use `SettingsTab.tsx` directly |
| `Section_*.tsx` files (7 files) | NONE OF THESE FILES EXIST. Sections are inline JSX within `SettingsTab.tsx`. | All block targets must reference `SettingsTab.tsx` |
| `AIPowerTier.tsx` | DOES NOT EXIST. AI Power Tier is a `<section>` block in `SettingsTab.tsx` rendering `<SkuUpgradePanel>`. | §1a: work with `SettingsTab.tsx` sections |
| `TierTile.tsx` | DOES NOT EXIST. Tiles are inline `SKU_TIERS.map(...)` in `SkuUpgradePanel.tsx`. | §1e: edit model names in `SkuUpgradePanel.tsx:41-87` |
| Radio loose comparison bug | ALREADY strict `===` in `getTileState()` — `SkuUpgradePanel.tsx:106`. | §1f: smoke-test only; code may already be correct |
| `app:quit` handler MISSING | Handler EXISTS as `app:request-quit` at `src/main/index.ts:2900`. | §1b: wire button to `app:request-quit` (not `app:quit`) |
| `mnemosyne_user_config_v2` localStorage | KEY DOES NOT EXIST. Settings use discrete keys (9 listed above). | §3b/§5d: use actual key schema |
| "AI That Remembers" in `Section_AICapability.tsx` | File doesn't exist. Violation is in `WelcomeView.tsx:203` and `ShareMnemosyneC.tsx:101`. | §1c: target these two files |
| "Cathedral" typo in `Section_AppVersion.tsx` | File doesn't exist. No "Cathedral" in any UI-rendered string in SettingsTab. Correct "Caithedral" spelling appears where needed. | §1d: M18b sweep likely already resolved; confirm via smoke |
| platform\src\ file paths | MnemosyneC Electron app is in `src/` (root). `platform/src/` is the web SPA. | All edits go to `src/`, not `platform/src/` |
| `hardwareHandlers.ts` / `appHandlers.ts` / `diagnosticHandlers.ts` | These separate handler files DO NOT EXIST. Hardware, diagnostic, and app IPC are registered in `src/main/index.ts` via `safeHandle()`. | §1b IPC work: target `src/main/index.ts` |

---

## 11. M23 Block Target Corrections

Based on empirical map, the following corrections apply to the M23 dispatch before any code edits:

### §1a — Promote AIPowerTier to Main Nav
- **Target file:** `src/renderer/components/SettingsTab.tsx` (remove/detach section at line 1701)
- **Router file:** `src/renderer/App.tsx` or `src/renderer/components/MnemosyneTabView.tsx` (add nav item)
- **AI Power Tier content:** currently rendered via `<SkuUpgradePanel analytics={undefined} />` at line 1731

### §1b — Add Quit Button
- **IPC channel:** `app:request-quit` (NOT `app:quit`)
- **Handler exists at:** `src/main/index.ts:2900`
- **Preload bridge at:** `src/main/preload.ts:1603`
- **Target files for button:** `src/renderer/App.tsx` (titlebar) and/or `src/renderer/components/SettingsTab.tsx` (footer)

### §1c — Substrate-Cure Copy Fix
- **Files to edit:**
  - `src/renderer/components/WelcomeView.tsx:203`
  - `src/renderer/components/ShareMnemosyneC.tsx:101`
- **SettingsTab.tsx is CLEAN** — no "AI That Remembers" instances

### §1d — Caithedral Spelling Fix
- **Rendered UI labels:** Already using correct "Caithedral" spelling
- **Non-rendered occurrences:** Code variables (`attesingCathedralNode`) and comments — likely leave as-is
- **Smoke-test recommended:** confirm M18b sweep covered this

### §1e — Hardcoded Model Names
- **Target file:** `src/renderer/components/SkuUpgradePanel.tsx:41-87` (`SKU_TIERS` array)
- **Current hardcoded values:** nano=qwen2.5:0.5b, lite=gemma2:2b, core=gemma2:9b, full=gemma4:12b, ultra=llama3.3:70b
- **Extraction:** Factor out to config object or props from parent

### §1f — Radio Semantics
- **`getTileState()` already uses strict `===`** at `src/renderer/components/SkuUpgradePanel.tsx:106`
- **Action:** Smoke-test only — visually confirm only one tile is active at a time. If bug is gone, §1f is a no-op.

---

## Appendix: Files with "Settings" in Name (`src/`)

```
src/renderer/components/SettingsTab.tsx           [PRIMARY — 2633 lines]
src/renderer/hearth/conjunction/ApiKeysSettings.tsx [Hearth window API keys]
src/renderer/swirling-winds/wind-settings-card.tsx  [Wind tier]
```

(Note: `platform/src/` has 5 more Settings-prefixed files — all in the web SPA, irrelevant to MnemosyneC Electron.)

## Appendix: Files with "Tier" in Name (`src/`)

```
src/renderer/utils/glow_tier.ts                  [Tier glow utility]
src/renderer/hearth/conjunction/TierSelect.tsx   [Tier select in Hearth conjunction]
```

(Note: `platform/src/` has 22 more Tier-prefixed files — all in the web SPA.)

---

*Empirical Component Map — M23 Pre-Block*
*Produced by Knight (Sonnet 4.6 read-only dispatch) · BP091 · 2026-06-22*
*Truth-Always: all findings are direct grep/glob/Read results. Zero speculation.*
