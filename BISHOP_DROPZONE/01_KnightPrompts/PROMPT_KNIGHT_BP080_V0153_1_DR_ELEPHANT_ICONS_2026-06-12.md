# KNIGHT WAKE-UP PROMPT — BP080 · V0.1.53.1 / V0.1.54 · DR. ELEPHANT ICONS
**Date:** 2026-06-12
**Bishop:** Liana Banyan Bishop (Anthropic)
**Knight:** Sonnet 4.6 — ALL work via Sonnet 4.6 SEGs. HARD BINDING. No exceptions.
**Scope:** Replace Electron window icon and system tray icon with Dr. MnemosyneC elephant mascot.

---

## WAKE-UP PASTE BLOCK

You are Knight, Sonnet 4.6 implementer for the MnemosyneC / Liana Banyan Platform project. Bishop is orchestrator-only — ALL src edits, asset generation, build, and verification route through you. This is a single-focus yoke. Read every instruction before touching a single file.

**Founder Ask (verbatim, 2026-06-12):** "can we please use the Dr. Elephant picture for the Tab Icon? And in the hidden icons folder on the taskbar?"

**Interpretation confirmed by Bishop:**
- "Tab Icon" = Electron window icon (title bar top-left, Alt+Tab switcher, taskbar when app is active).
- "Hidden icons folder on the taskbar" = Windows system tray icon (notification area, shown when app runs in background).
- "Dr. Elephant picture" = the Dr. MnemosyneC canonical mascot PNG.

---

## ASSET RECON (Bishop-verified — DO NOT RE-GLOB, use these paths)

**Canonical Dr. MnemosyneC elephant mascot PNG:**
`C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\public\img\mascots\elephant-01-canonical.png`
- Dimensions: 869×869 px · RGBA · 165,348 bytes
- MD5: `8285f24356d39da37fe34881ea48f9fe`
- This is byte-identical to:
  - `LianaBanyanPlatform\Cephas\cephas-hugo\public\img\mascots\dr-mnemosynec.png`
  - `LianaBanyanPlatform\src\renderer\public\icons\mnemosynec-mark.png`
- Use `elephant-01-canonical.png` as source of truth.
- NOTE: `elephant-03-wildfire.png` (same folder, 539,894 bytes) is a stylized variant — do NOT use for icons.

**Current icons (to be replaced):**
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\assets\app-icon.ico` — 256×256, 93,310 bytes (NOT Dr. Elephant — different MD5)
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\assets\tray-icon.png` — 1536×1024 RGB, 1,273,987 bytes (NOT Dr. Elephant, wrong shape)

**No existing `.ico` of Dr. Elephant exists** — you must generate it.

---

## SEGs — ALL SONNET 4.6

### SEG-V0153.1-P0-VERIFY-MASCOT (Sonnet 4.6)

Before touching any file, open and visually describe `elephant-01-canonical.png`. Confirm it shows:
- A gray elephant
- White coat (doctor)
- Stethoscope
- Half-moon spectacles

If the image does NOT match all four brand criteria, STOP and report to Bishop. Do NOT proceed with icon generation using a non-matching asset.

If confirmed: proceed to SEG-V0153.1-P0-GENERATE-ICONS.

---

### SEG-V0153.1-P0-GENERATE-ICONS (Sonnet 4.6)

**Prerequisite:** `elephant-01-canonical.png` confirmed above.

**Tooling check first:** In `C:\Users\Administrator\Documents\LianaBanyanPlatform\package.json`, check `devDependencies` for `sharp`, `electron-icon-builder`, `png2icons`, `jimp`, or any icon-generation tool already present. Use whatever is already installed — do NOT npm install new packages without checking first.

If `sharp` is available: use it via a Node.js script. If none of the above exist, use Python `Pillow` (which is confirmed present in the environment — used successfully by Bishop to read image dims).

**Generate the following files:**

1. **`C:\Users\Administrator\Documents\LianaBanyanPlatform\assets\app-icon.ico`**
   Multi-resolution Windows ICO containing all of: 16×16, 32×32, 48×48, 64×64, 128×128, 256×256.
   Source: `elephant-01-canonical.png` — scale down with LANCZOS resampling, preserve RGBA.
   This REPLACES the existing file (it is not the Dr. Elephant; confirmed).

2. **`C:\Users\Administrator\Documents\LianaBanyanPlatform\assets\tray-icon.png`**
   32×32 px RGBA PNG — system tray icon. Must keep elephant recognizable at 32px.
   Use LANCZOS downscale. Do NOT add padding that obscures the mascot.
   This REPLACES the existing 1536×1024 RGB tray-icon.png.

3. **`C:\Users\Administrator\Documents\LianaBanyanPlatform\assets\tray-icon@2x.png`** (NEW)
   64×64 px RGBA PNG — high-DPI tray fallback. Same source, LANCZOS.

**Verification after generation:**
- Read back each output file with PIL/Image, print: path, size (bytes), dimensions, mode.
- Confirm `app-icon.ico` contains multiple resolutions (open with PIL `ICO` and check `info['sizes']` or iterate frames).
- Post this readback output verbatim in your yoke return.

---

### SEG-V0153.1-P0-WIRE-ELECTRON (Sonnet 4.6)

**File:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\index.ts`

Bishop-verified current state (do NOT re-read the whole file — use these grep-confirmed facts):

1. **Tray icon** (line ~937):
   ```ts
   const iconPath = join(__dirname, '../../assets/tray-icon.png');
   ```
   This path already points to `assets/tray-icon.png`. Since we are replacing that file with the Dr. Elephant 32×32 PNG, **no code change is needed for the tray icon path** — the file swap is sufficient. CONFIRM this by reading lines 934–950 of `src/main/index.ts` before declaring no-change.

2. **BrowserWindow icon** — three windows confirmed at these lines:
   - `moneyPennyWindow` (~line 1087): `icon: join(__dirname, '../../assets/app-icon.ico')`
   - `dashboardWindow` (~line 1136): `icon: join(__dirname, '../../assets/app-icon.ico')`
   - `hearthConjunctionWindow` (~line 1267): `icon: join(__dirname, '../../assets/app-icon.ico')`

   All three already reference `assets/app-icon.ico`. Since we are replacing that file with the Dr. Elephant ICO, **no code change is needed for BrowserWindow icon paths** — the file swap is sufficient. CONFIRM by reading those line ranges.

3. **Overlay window** (line ~842): Check if it has an `icon:` property. If not, ADD it:
   ```ts
   icon: join(__dirname, '../../assets/app-icon.ico'),
   ```
   Read lines 840–900 and report what you find before editing.

4. **`package.json` `build.icon`** field: Currently `"assets/app-icon"`. Since we regenerated `assets/app-icon.ico`, this is already correct. No change needed. CONFIRM by reading the build section.

**If any code changes are required** (overlay window missing icon, or any path is wrong): make the minimal targeted edit. Show the exact diff. Do NOT refactor surrounding code.

---

### SEG-V0153.1-VERIFY (Sonnet 4.6)

**Runtime verification is MANDATORY.** [[feedback_actual_runtime_verify_for_runtime_bugs_bp078]] and [[feedback_ux_seg_screenshot_mandatory_bp078]] — HARD BINDING.

Steps:
1. Build the packaged installer: `npm run build` or `npm run make` (check `package.json` scripts for the correct build command first).
2. Install the resulting NSIS `.exe` from `dist/` or `out/`.
3. Launch the installed app.
4. Capture **4 screenshots** — one for each surface:
   - (a) Title bar / top-left corner of main window — Dr. Elephant visible as window icon
   - (b) Windows taskbar (app pinned/active) — Dr. Elephant visible as taskbar icon
   - (c) Alt+Tab switcher — Dr. Elephant visible as app thumbnail icon
   - (d) System tray (hidden icons folder, expand the tray) — Dr. Elephant visible as tray icon

5. Embed all 4 screenshots inline in your yoke return. Label each (a)–(d).
6. If any surface does NOT show Dr. Elephant, diagnose and fix before returning.

**Known gotcha:** Tray icon on Windows may need to be 16×16 at the OS level. If the 32×32 tray PNG renders blurry or wrong, try resizing to 16×16 in the Electron code at line ~942:
```ts
icon = icon.resize({ width: 16, height: 16 });
```
That line already exists — it will auto-resize. No code change needed unless it breaks.

---

### SEG-V0153.1-SHIP (Sonnet 4.6) — DRAFT ONLY, DO NOT SELF-STAMP

Prepare DRAFT ship block for Bishop review. Do NOT self-stamp, do NOT trigger Firebase deploy. Bishop and Founder ratify before any publish action per [[feedback_explicit_founder_ratify_before_publish]].

**Version recommendation (Bishop pre-decision):**
- **Fold into v0.1.54 alongside COMMUNITY-CONNECT.** Do not ship as standalone v0.1.53.1. Rationale: icon-only change, no functional scope, batches better with next feature cycle. If Founder overrides and wants v0.1.53.1 standalone, Knight stages that build instead — just note it as a Founder decision point.

**SHIP DRAFT block to prepare:**
```
DRAFT — AWAITING RATIFY

VERSION: v0.1.54 (or v0.1.53.1 if Founder chooses standalone)
CHANGE: Replace Electron window icon and system tray icon with Dr. MnemosyneC elephant mascot
ASSETS REPLACED:
  - assets/app-icon.ico (multi-resolution ICO, 16–256px)
  - assets/tray-icon.png (32×32 px)
  - assets/tray-icon@2x.png (64×64 px, new)
CODE CHANGES: [list any src/main/index.ts edits or "file-swap only, no code changes"]
BUILD: [SHA of installer]
VERIFY: 4 screenshots attached — all 4 surfaces confirmed showing Dr. Elephant
GATE 1 — Header verify: [ ]
GATE 2 — Content verify: [ ]
GATE 3 — Anonymous download verify: [ ]
GATE 4 — Body-string count (Cephas sharpening 4): [ ]
BISHOP STAMP: PENDING
FOUNDER RATIFY: PENDING
```

Gates 1–4 per [[reference_cephas_hugo_every_time_ship_rule_bp079]] are Bishop+Founder actions, not Knight actions.

---

## YOKE RETURN FORMAT

Return to Bishop in this order:
1. **Mascot confirm:** Yes/No + description match.
2. **Tooling used:** what icon-generation tool was available and used.
3. **Generated files:** path + bytes + dims for each (verbatim PIL readback).
4. **ICO multi-res confirmation:** list the sizes inside app-icon.ico.
5. **Code changes:** list any src edits, or state "file-swap only — no code changes."
6. **Build result:** version built, installer path, SHA.
7. **4 screenshots:** embedded, labeled (a)–(d).
8. **SHIP DRAFT block:** filled in with actuals.
9. **Founder decision point:** v0.1.53.1 standalone or fold into v0.1.54?

---

## HARD BINDINGS (repeat for emphasis)

- ALL SEGs = Sonnet 4.6. Not Opus. Not default. Sonnet 4.6 verbatim.
- Runtime evidence REQUIRED — 4 screenshots from installed packaged build. Source-only verify is NOT sufficient.
- Bishop orchestrator-only. Knight does ALL implementation.
- No self-stamp. No auto-publish. DRAFT → Bishop → Founder ratify.
- §2 Truth-Always: if the mascot image does not match brand spec, STOP and report.
- §13 substrate routing: pheromone_query before search_knowledge for any substrate lookups.

---

## BLACK MAMBA DISPATCH BLOCK (paste into fresh Sonnet 4.6 session)

```
BLACK MAMBA DISPATCH — BP080 · DR. ELEPHANT ICONS

You are Knight (Sonnet 4.6). Your sole task today is the Dr. Elephant icon swap for MnemosyneC. Full instructions are in:

C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BP080_V0153_1_DR_ELEPHANT_ICONS_2026-06-12.md

Read the full yoke now. Then execute SEGs in order:
1. SEG-V0153.1-P0-VERIFY-MASCOT
2. SEG-V0153.1-P0-GENERATE-ICONS
3. SEG-V0153.1-P0-WIRE-ELECTRON
4. SEG-V0153.1-VERIFY (4 screenshots mandatory)
5. SEG-V0153.1-SHIP (DRAFT only)

Hard bindings: Sonnet 4.6 SEGs only · runtime screenshots required · no self-stamp · file-swap-first (check if code changes even needed before touching src).

Project root: C:\Users\Administrator\Documents\LianaBanyanPlatform
```
