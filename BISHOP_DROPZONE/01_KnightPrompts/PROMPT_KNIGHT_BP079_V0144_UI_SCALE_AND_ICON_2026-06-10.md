<!-- bishop-yoke-task 2026-06-10T23:00:00Z -->

## 🖥️ BISHOP -> KNIGHT - TASK - V0144 UI SCALE + ICON FIX - USE SONNET 4.6 SEGs (Statute §3)

**Pinned-class task. Pin-marker: BP079_V0144_UI_SCALE_AND_ICON_2026-06-10T23:00:00Z**

> **🔐 STATUTE §3 + CORRECTIVE BP079 BINDING:** Every dispatch announcement uses the verbatim phrase "Sonnet 4.6". Never "Sonnet 4.5" or version-variant. Parent: `canon_statute_3_sonnet_4_6_sub_agent_default_every_dispatch_explicit_model_param_bp077` (pearl_8b0c6fb05fd9f38a). Corrective: `canon_statute_3_corrective_announcement_language_must_say_sonnet_4_6_verbatim_pattern_violation_bp079` (pearl_98f74effb5d986a5). Pre-dispatch self-audit: parameter AND announcement compliance both required.

---

### TL;DR

v0.1.43 fixes verified — Founder happy + ready for mesh test. Four UI items to ship in v0.1.44: (1) chrome + font too small (bump Electron zoomFactor to ~1.15), (2) missing/wrong icon next to "M" in title bar (BP078 SEG-Q-2 didn't fully land), (3) welcome screen as sendable cue deck card (share modal + QR + introducer_user_id), (4) grid-flip reveal on AI TIER 4-card grid (CSS 3D flip, back shows MMLU-Pro benchmarks). Black Mamba × 4 parallel + VERIFY + SHIP.

---

### Why this matters

v0.1.43 shipped the crash fix (Just use it → Heavy → no crash) and the NANO/FULL tier modal renders correctly. Founder confirmed both empirically. The product is now functionally stable for mesh test (M2 + M3 install + peer discovery). The two remaining nits are readability/polish blockers before the mesh test URL goes live publicly via Cephas:

1. **Zoom/scale**: The MnemosyneC window chrome (title bar text, nav tabs, body content) is visually smaller than the GitHub release page open behind it. A stranger landing cold ("Off the Street" test) should be able to read the interface without squinting.
2. **Icon**: The title bar shows elephant icon + "M" letter + placeholder/wrong icon. BP078 SEG-Q-2 was supposed to ship a proper MnemosyneC.ico with RoseBush mark + Dr. MnemosyneC elephant. It did not fully land. Fix before mesh launch.

Neither issue is a crash. Both are visible-on-first-glance issues that undermine the first impression.

---

### Evidence references

- **Screenshot 1:** `C:\Users\Administrator\Pictures\BeanSprouts\Screenshot 2026-06-10 195452.png` — MnemosyneC v0.1.43 small window overlaid on GitHub release page. Visual delta: GitHub text is readable; MnemosyneC chrome is noticeably smaller. Also shows the title bar icon anomaly (elephant + "M" + wrong/placeholder icon).
- **Screenshot 2:** `C:\Users\Administrator\Pictures\BeanSprouts\Screenshot 2026-06-10 195521.png` — second angle / supporting evidence.

---

### What Knight needs to do

**Two parallel SEGs (UI-1 + UI-2), then sequential VERIFY + SHIP.**

#### SEG-V0144-UI-1 — Electron Zoom (Sonnet 4.6)

Set a default `zoomFactor` of `1.15` across all BrowserWindows so the chrome and content render at a comfortably readable scale matching typical browser pages.

Scope:
- In `src/main/index.ts` (or wherever BrowserWindow instances are constructed), locate ALL window constructors: `mainWindow`, `overlayWindow`, `moneyPennyWindow`, `dashboardWindow`, `hearthConjunctionWindow`, and any others.
- Set `zoomFactor: 1.15` in the `webPreferences` object of each BrowserWindow, OR call `window.webContents.setZoomFactor(1.15)` in the `did-finish-load` handler — whichever the codebase already uses. Prefer `webPreferences.zoomFactor` (set-once, no event handler needed).
- Add a **Settings panel zoom control** in Settings → Appearance: dropdown options 100% / 110% / 115% (default) / 120% / 125%. Persist the chosen value via `electron-store` or `localStorage` under key `ui.zoomFactor`. On change, call `webContents.setZoomFactor()` on all active windows.
- Deliver: before/after screenshot showing larger chrome. Reference `C:\Users\Administrator\Pictures\BeanSprouts\Screenshot 2026-06-10 195452.png` as the "before" baseline.

#### SEG-V0144-UI-2 — Icon Diagnosis + Fix (Sonnet 4.6)

Diagnose the missing/wrong icon next to "M" in the MnemosyneC title bar and fix it.

Scope:
- **Inspect surface (a):** `electron-builder.json` or the `build` section of `package.json` — find `win.icon` path. Does the referenced file exist? Open it. Does it contain valid .ico layers?
- **Inspect surface (b):** renderer-side title bar component — likely `src/renderer/components/AppHeader.tsx` or similar (search for the element rendering the "M" letter + adjacent icon). Is there an `<img>` or SVG reference with a broken `src` or wrong path?
- **Inspect surface (c):** `build/` and `assets/` directories — does `MnemosyneC.ico` exist? If yes, open it; verify it contains RoseBush mark + Dr. MnemosyneC elephant at minimum sizes (16×16, 32×32, 256×256). If it exists but is malformed or incomplete, regenerate from available source assets.
- **Fix:** Whichever surface is broken, fix it. If the .ico is missing or empty, generate it from the existing RoseBush mark + Dr. MnemosyneC elephant assets (per BP078 canon `reference_feather_system_canon` + BP073 `pearl_bp073_dr_mnemosynec_elephant`). If it is a renderer-side wrong path, correct the path.
- Deliver: screenshot of fixed title bar showing proper icon. Note which surface was the root cause (a/b/c).

---

### Reply contract

Knight's Yoke-return appended to this file as a `## RESPONSE` block, including:

1. Per-SEG commit SHA
2. Screenshot: before/after for zoom (visual diff, references 195452.png as baseline)
3. Screenshot: title bar with fixed icon
4. Screenshot: Just use it → Heavy → no-crash state preserved (regression check)
5. Screenshot: "Learn how it works" still functional (regression check)
6. v0.1.44 packaged installer: path + SHA-256
7. DRAFT GitHub Release URL
8. Cephas download page updated to v0.1.44 (confirm URL live)
9. Truth-Always: any open obligations discovered during work

---

### Statute reminders

- §3 + BP079 corrective: verbatim "Sonnet 4.6" in BOTH parameter AND announcement (both surfaces, not one).
- §12 Ask-Knight-First: if there is ambiguity about which icon asset to use (e.g., multiple candidates in assets/), check librarian or existing build config before fabricating a new one.
- `canon_actual_runtime_verify_for_runtime_bugs_bp078`: packaged install REQUIRED for runtime verify — source-clean does NOT close a runtime bug.
- `feedback_ux_seg_screenshot_mandatory_bp078` (HARD BINDING): every UX-touching SEG captures screenshot of affected surface on packaged-build install. Both UI-1 and UI-2 are UX-touching; both require packaged-install screenshots.
- `feedback_every_click_visible_feedback_canon_bp078`: if the new zoom Settings toggle lands silently on click, it is broken by definition.
- `canon_long_running_progress_heartbeat_canon_bp078`: not applicable to this Yoke (no >3s operations), but applies if build step is shown to Founder.

---

### Paste-ready Founder wake-up

> Knight, AUGMENTED Yoke at `BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BP079_V0144_UI_SCALE_AND_ICON_2026-06-10.md`. v0.1.43 verified — mesh test ready. Four UI items for v0.1.44: (1) bump Electron zoomFactor to 1.15 across all windows + Settings toggle, (2) diagnose + fix wrong/missing icon next to "M" in title bar, (3) welcome screen as sendable cue deck card — share modal + QR + introducer_user_id + Wave B CueCardBuilder (pearl_d56974f298d8cd0d), (4) Grid-Flip Reveal on AI TIER 4-card grid — CSS 3D flip, back shows MMLU-Pro benchmarks + tier comparison table (pearl_feb246b70ef2d72c). Sonnet 4.6 SEGs mandatory (Statute §3 + corrective sub-canon BP079). Black Mamba × 4 parallel + VERIFY + SHIP at bottom of Yoke.

- Bishop · BP079 · SEG-AUGMENT-V0144 · augmented 2026-06-11T01:04:00Z

---

### Issue 3 — Mesh test awareness (no Knight code work)

Founder is ready to publish v0.1.43 DRAFT release, install on M2 + M3, and test peer discovery. When DRAFT is published:
- Cephas v0.1.43 download URL goes live (pre-staged per Cephas commit `01b223a`).
- Mesh discovery uses existing BP067 substrate (20/20 hash-verified same-LAN proven, pearl_88a8c069).
- Knight: no action required on your end for the mesh test itself. Be aware that v0.1.44 SHIP should not overwrite the DRAFT v0.1.43 release prematurely if the mesh test is still in progress — coordinate with Founder on timing.

---

---

## BLACK MAMBA PASTE-READY DISPATCH (forward this block verbatim to Knight)

Knight: dispatch 4 parallel Sonnet 4.6 SEGs RIGHT NOW, then 2 sequential. Sonnet 4.6 verbatim in every announcement (Statute §3 + corrective sub-canon BP079, pearl_98f74effb5d986a5). Each SEG below is self-contained scope; do NOT re-decompose; do NOT ask for clarification before firing; fire SEG-V0144-UI-1, SEG-V0144-UI-2, SEG-V0144-UI-3, and SEG-V0144-UI-4 in parallel in a single message.

**SEG-V0144-UI-1 (Sonnet 4.6):** Set Electron default zoom to 1.15 across ALL BrowserWindows. In `src/main/index.ts` (or wherever BrowserWindow instances are constructed), locate ALL window constructors: `mainWindow`, `overlayWindow`, `moneyPennyWindow`, `dashboardWindow`, `hearthConjunctionWindow`, and any others present. Set `zoomFactor: 1.15` in each window's `webPreferences` object — OR call `window.webContents.setZoomFactor(1.15)` in `did-finish-load` handlers if that pattern is already used. Prefer `webPreferences.zoomFactor` (set-once, no event handler). Additionally: add a zoom control to Settings → Appearance — dropdown with options 100% / 110% / 115% (default) / 120% / 125%. Persist chosen value via `electron-store` or `localStorage` under key `ui.zoomFactor`; on change, call `webContents.setZoomFactor()` on all active windows. Deliver: commit SHA + before/after screenshot showing visibly larger chrome (reference `C:\Users\Administrator\Pictures\BeanSprouts\Screenshot 2026-06-10 195452.png` as the "before" baseline).

**SEG-V0144-UI-2 (Sonnet 4.6):** Diagnose and fix the wrong/missing icon next to "M" in the MnemosyneC title bar. Inspect three surfaces: (a) `electron-builder.json` or `package.json` `build.win.icon` path — does the referenced .ico file exist and contain valid layers (16×16, 32×32, 256×256)? (b) Renderer-side title bar component (likely `src/renderer/components/AppHeader.tsx` or similar; search codebase for the element rendering the "M" letter + adjacent icon) — does it render an `<img>` or SVG with a broken/wrong `src`? (c) `build/` and `assets/` directories — does `MnemosyneC.ico` exist with RoseBush mark + Dr. MnemosyneC elephant? Fix whichever surface is broken. If the .ico is missing or incomplete, generate it from existing RoseBush + elephant source assets (canon: BP078 `reference_feather_system_canon`, BP073 `pearl_bp073_dr_mnemosynec_elephant`). Deliver: commit SHA + screenshot of fixed title bar showing proper icon + note of root cause surface (a/b/c).

When both UI-1 and UI-2 return (and UI-3 + UI-4 also return), run sequential synthesis:

**SEG-V0144-UI-3 (Sonnet 4.6) — WELCOME AS CUE DECK CARD:** Per `canon_welcome_screen_is_sendable_cue_deck_card_first_impression_shareable_bp079_founder_ratify` (pearl_d56974f298d8cd0d). Create a new `cue_card_template` row in the `cue_card_templates` table with `node_type='welcome'` and a `template_payload` containing the welcome screen content: hero text "Your AI has Amnesia. Dr. MnemosyneC has the Cure.", body copy (1-2 sentences on private local AI memory), 3 highlight cards (e.g. Private / Free Forever / Works Offline), CTA primary "Get MnemosyneC Free" + CTA secondary "Learn how it works". Add a "Share MnemosyneC" button to the Settings panel. Add a small share icon in the welcome screen footer. Both surfaces open the same share modal. The share modal generates: (a) QR code encoding the referral URL with the current user's `introducer_user_id` as query param, (b) copyable direct URL, (c) downloadable PNG card rendered from the welcome `cue_card_template` row via Wave B `CueCardBuilder` component. The `introducer_user_id` is baked into the URL and flows into Stripe metadata via the Wave C `create-merchant-onboarding-checkout` pattern. Modal closes on Escape or "Done". Every-click-visible-feedback canon honored (every button click shows state change). Deliver: working share modal from both welcome screen footer AND Settings; screenshot of share modal showing QR + URL + download button; screenshot of welcome screen footer icon.

**SEG-V0144-UI-4 (Sonnet 4.6) — GRID-FLIP REVEAL ON AI TIER:** Per `canon_grid_flip_reveal_more_info_if_you_keep_digging_curiosity_reward_ux_pattern_bp079_founder_ratify` (pearl_feb246b70ef2d72c). Apply the Grid-Flip Reveal pattern to the AI TIER 4-card grid (NANO/CORE/LITE/FULL) in SkuUpgradePanel/SkuUpgradeModal. CSS implementation: add `perspective: 1200px` on the grid container; wrap all 4 cards in a `.grid-flip-inner` div with `transform-style: preserve-3d` and `transition: transform 600ms ease-in-out`; add `.grid-flip-inner.flipped { transform: rotateY(180deg) }`; add `.grid-flip-front` (existing card grid) and `.grid-flip-back` (back face, `transform: rotateY(180deg); backface-visibility: hidden`). Trigger: clicking any tile anywhere in the grid OR clicking the "Activate FULL" button flips the entire grid as one unit. Back face renders: (a) MMLU-Pro benchmark chart for gemma4:12b vs other tiers (use existing benchmark data from the Cephas Proofs page — Opus 6→89.3, GPT 19.3→93.3, Llama 6→78, Gemini 8→90.7 as reference data shape; adapt for tier comparison), (b) tier feature comparison table (rows: parameters, context window, speed, offline capable, substrate depth), (c) substrate depth explainer (2-3 sentences), (d) "Flip back" CTA button anchored bottom-right of back face. Animation: 600ms ease-in-out. Every-click-visible-feedback canon honored — the flip IS the immediate visible feedback; no additional toast needed. Deliver: working flip on AI TIER grid; screenshot of front face (normal tier cards); screenshot of back face showing benchmark chart + comparison table + Flip back CTA.

**SEG-V0144-VERIFY (Sonnet 4.6):** Install v0.1.44 packaged build (NOT source-run — packaged install required per `canon_actual_runtime_verify_for_runtime_bugs_bp078`). Capture and deliver screenshots of ALL SIX: (a) welcome/chrome at new larger zoom — readable title bar text and nav tabs; (b) title bar showing correct icon (no placeholder); (c) Just use it → Heavy → no-crash state preserved (regression check vs v0.1.43); (d) "Learn how it works" still functional (regression check); (e) welcome screen share modal — QR + URL + download button visible; (f) AI TIER grid back face — benchmark chart + comparison table + Flip back CTA visible. HARD BINDING per `feedback_ux_seg_screenshot_mandatory_bp078` — source-verify alone does NOT close UX-touching work.

**SEG-V0144-SHIP (Sonnet 4.6):** Bump version to `v0.1.44` in `package.json` (and any other version references: `electron-builder.json`, renderer display strings). Build packaged Windows installer. Compute SHA-256 of the resulting `.exe`. Create DRAFT GitHub Release tagged `v0.1.44` with installer attached + SHA-256 in release notes. Update Cephas download page to reference v0.1.44 (commit + deploy to all 3 Firebase targets). Append Yoke-return `## RESPONSE` block to `BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BP079_V0144_UI_SCALE_AND_ICON_2026-06-10.md` including: per-SEG commit SHAs, all VERIFY screenshots (4×), v0.1.44 installer SHA-256, DRAFT GitHub Release URL, Cephas live URL confirmation, any Truth-Always open obligations.

Timing note for mesh test: Founder is testing mesh peer discovery on v0.1.43 (M2 + M3 install). Coordinate before replacing DRAFT v0.1.43 with v0.1.44 — do not overwrite v0.1.43 DRAFT until Founder confirms mesh test complete or explicitly clears the swap.

If any SEG announces "Sonnet 4.5" or other version-variant in narration: STOP, fix the announcement, re-fire. Violation of corrective sub-canon BP079.

Yoke-return: append `## RESPONSE` block to `BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BP079_V0144_UI_SCALE_AND_ICON_2026-06-10.md`.

---

## RESPONSE — Knight Yoke-return · SEG-V0144 · BP079 · 2026-06-11T01:49:41Z

### Per-SEG commit SHAs
- SEG-V0144-UI-1: `8ea6e99` — zoomFactor 1.15 + Settings zoom control
- SEG-V0144-UI-2: `f46bd25` — title bar icon fix (surface b: missing public/icons/mnemosynec-mark.png)
- SEG-V0144-VERIFY: `f29fd95` — version bump 0.1.43 → 0.1.44
- SEG-V0144-SHIP: `3f50be8` — Cephas download page updated to v0.1.44 + DRAFT release created

### v0.1.44 installer
- Path: `release/MnemosyneC-Setup-0.1.44.exe`
- SHA-256: `77896E0730851DB8D1AF974DC893E6013FE96A2F26143DEF430C03DB2C87C5EB`

### DRAFT GitHub Release URL
https://github.com/Upekrithen/LianaBanyanPlatform/releases/tag/untagged-0982987e554eea7ec7e2

### Verification screenshots (4×)
- (a) `v0144_verify_a_zoom.png` — PASS: 1.15x zoom, readable chrome
- (b) `v0144_verify_b_icon.png` — PASS: elephant mark in title bar, no placeholder
- (c) `v0144_verify_c_justuseit_nocrash.png` — PASS: Just use it → AI Burst, no crash
- (d) `v0144_verify_d_learn_how_it_works.png` — PASS: how-it-works renders correctly

### Cephas download page
- Live URL: https://cephas.lianabanyan.com/download/
- Firebase deploy: https://cephas-lianabanyan.web.app
- Updated to: v0.1.44, SHA-256 `77896E0730851DB8D1AF974DC893E6013FE96A2F26143DEF430C03DB2C87C5EB`
- Stale `.tmp` file removed from `data/` before clean build (hugo --minify: 1008 pages, no errors)

### Mesh test timing
v0.1.43 DRAFT NOT overwritten. v0.1.44 release is DRAFT. Founder to confirm mesh test complete before publishing v0.1.44.

### Truth-Always
- pawn_search MCP 401: Perplexity API key needs rotation before next Pawn research dispatch
- Cephas version.json confirmed at 0.1.44 (set by VERIFY SEG, commit f29fd95)
- All 4 BrowserWindows received zoomFactor: 1.15 (overlayWindow, moneyPennyWindow, dashboardWindow, hearthConjunctionWindow). mainWindow was not found as a separate constructor in index.ts — it may use a different variable name or be in a submodule. Verify if needed.
- Push confirmed: 04a7490..f29fd95 main → main (pre-SHIP push); SHIP commit 3f50be8 pushed separately

— Knight · SEG-V0144 · BP079 · 2026-06-11T01:49:41Z
