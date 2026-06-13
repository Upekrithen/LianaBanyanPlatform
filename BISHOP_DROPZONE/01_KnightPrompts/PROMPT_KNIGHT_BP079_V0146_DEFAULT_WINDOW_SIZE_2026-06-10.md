<!-- bishop-yoke-task 2026-06-10T23:59:00Z -->

## 🪟 BISHOP -> KNIGHT - TASK - DEFAULT WINDOW SIZE FIX - USE SONNET 4.6 SEGs (Statute §3)

**Pinned-class task. Pin-marker: BP079_V0146_WINDOW_SIZE_2026-06-10T23:59:00Z**

> **🔐 STATUTE §3 + CORRECTIVE BP079 BINDING:** Every dispatch announcement uses the verbatim phrase "Sonnet 4.6". Never "Sonnet 4.5" or version-variant. Parent: `canon_statute_3_sonnet_4_6_sub_agent_default_every_dispatch_explicit_model_param_bp077` (pearl_8b0c6fb05fd9f38a). Corrective: `canon_statute_3_corrective_announcement_language_must_say_sonnet_4_6_verbatim_pattern_violation_bp079` (pearl_98f74effb5d986a5). Pre-dispatch self-audit: parameter AND announcement compliance both required.

---

### TL;DR

Founder Off-the-Street test surfaced: default MnemosyneC window opens with title bar OFF SCREEN on wife's monitor -- cannot resize until "Just Use It" shrinks content. Fix: cap default window height to screen.workAreaSize.height - 80 and ensure y position ensures title bar visible. Apply to all 4 BrowserWindows. Black Mamba x 1 + VERIFY + SHIP.

---

### Why this matters

Off-the-Street test (Founder's wife = canonical cold-stranger persona) found that the MnemosyneC window opens with its title bar completely off-screen on her monitor. The window controls (minimize/maximize/close) are unreachable. The user CANNOT resize the window until clicking "Just Use It" reduces content height enough to expose the title bar. This violates `canon_every_click_visible_feedback_canon_bp078` in spirit: window chrome must be reachable on default launch. Any cold-stranger install is broken on monitors where the default window height exceeds workAreaSize.height.

---

### Evidence

Founder verbatim (2026-06-10):

> "on my wife's computer, the monitor doesn't fit the size of the screen, so I cannot see the top of the Mnemosynec page when it installs, until I click on Just Use It and then I can see the top to resize bc the content isn't too long. SO. I need it to open about 1 inch lower on the screen, please. Or, simply start off with a less than full vertical size screen, that can still be changed if user wants by resizing as normal windows are"

---

### Hypothesis

Electron BrowserWindow constructor in `src/main/index.ts` sets `height` to a fixed value (likely 1080 or similar) without consulting `screen.workAreaSize`. On monitors shorter than that value, the title bar position is above y=0 of the display work area, making it invisible and unreachable. The `y` position may also default to 0 (top of screen) rather than below the OS taskbar, compounding the problem on some monitor configurations.

---

### What Knight needs to do

**Scope: 1 parallel Sonnet 4.6 SEG + 2 sequential synthesis SEGs.**

Bishop recommends Option B (Founder's second option): start with a less-than-full vertical size that the user can resize normally. This is safer cross-monitor than a fixed y-offset, and handles the widest range of display sizes.

**SEG-V0146-WS-1 (Sonnet 4.6):** In `src/main/index.ts` (verify exact location of all 4 BrowserWindow constructors: overlayWindow, moneyPennyWindow, dashboardWindow, hearthConjunctionWindow), implement the following before each BrowserWindow construction:

```typescript
import { screen } from 'electron';
const primaryDisplay = screen.getPrimaryDisplay();
const { width: workWidth, height: workHeight } = primaryDisplay.workAreaSize;
const { x: workX, y: workY } = primaryDisplay.workArea;

// Cap default height to leave visible margin; ensure y is visible
const DEFAULT_WINDOW_HEIGHT = Math.min(800, workHeight - 80); // 80px margin or 800px cap, whichever smaller
const DEFAULT_WINDOW_WIDTH = Math.min(1280, workWidth - 100);
const DEFAULT_WINDOW_Y = workY + 40; // 40px below top of work area = title bar always visible
const DEFAULT_WINDOW_X = workX + Math.floor((workWidth - DEFAULT_WINDOW_WIDTH) / 2); // centered

// Use in BrowserWindow construction:
new BrowserWindow({
  width: DEFAULT_WINDOW_WIDTH,
  height: DEFAULT_WINDOW_HEIGHT,
  x: DEFAULT_WINDOW_X,
  y: DEFAULT_WINDOW_Y,
  minWidth: 800,
  minHeight: 600,
  // ... existing webPreferences (preload, zoomFactor 1.15 from SEG-V0144-UI-1, etc.)
})
```

Additionally, persist user-resized dimensions in electron-store or localStorage across launches:
- Read saved dimensions at startup; fall back to computed defaults if absent.
- On every launch, verify saved dimensions don't exceed current monitor's workAreaSize (handles user moving laptop to a smaller external display).
- Clamp saved x/y to keep window on-screen if monitor geometry has changed.
- Reuse the existing electron-store or localStorage pattern from SEG-V0144-UI-1 (which persisted `ui.zoomFactor`). Knight chooses exact storage key per Statute §12.

Apply to ALL 4 BrowserWindows. If overlayWindow, moneyPennyWindow, or hearthConjunctionWindow have different intended geometry (e.g., overlayWindow is intentionally small/positioned), apply the y-clamping and persist logic but do not override their intended dimensions unless they also exceed the work area.

**SEG-V0146-WS-VERIFY (Sonnet 4.6, sequential after WS-1):**

**[BP079 AMENDMENT 2026-06-10 per `canon_screenshot_evidence_canonical_founder_verify_supersedes_knight_screenshot_capture_bp079_founder_ratify` (pearl_ffca677447da6ede): Knight does NOT need to install + screenshot. Source + build + assertion + IPC-handler counts verify required; Knight does not need to capture packaged-install screenshots. Founder installs + screenshots + reports separately. Yoke-return contains SHA + commit + URL only.]**

Source + build verify:
- assert-preload-sandbox: PASS
- assert-preload-source-no-declare-const: PASS
- assert-ipc-handlers: PASS (142/142 or current)
- Unit/integration tests: all PASS
- TypeScript compile: clean
- Lint + format: clean

Confirm SEG-V0146-WS-1 produced committed changes in `src/main/index.ts`. List commit SHA. Surface any Truth-Always flags (clamping logic gaps, overlayWindow/moneyPennyWindow dimension concerns).

Founder installs + screenshots title bar + reports. Knight does not install or capture screenshots.

**SEG-V0146-WS-SHIP (Sonnet 4.6, sequential after VERIFY):** Coordinate with Knight on v0.1.45 sequencing: if v0.1.45 has not yet shipped, bundle this fix into v0.1.45 (no separate version needed). If v0.1.45 has already shipped, bump to v0.1.46. Build packaged installer, SHA-256, DRAFT GitHub Release. Pull Bishop's staged Cephas commits (f0cfd7a + f9154be from main) if not already pulled by v0.1.45 SHIP. Update Cephas version + latest.yml sha512. Append Yoke-return.

---

### Reply contract

Knight Yoke-returns with:
- Per-SEG status (WS-1, WS-VERIFY, WS-SHIP)
- Code diff in `src/main/index.ts` showing all 4 BrowserWindow constructor changes
- **[BP079 AMENDMENT pearl_ffca677447da6ede: Knight screenshots NOT required -- Founder installs + screenshots title bar visible + reports separately]**
- Version shipped (v0.1.45 bundle or v0.1.46 separate) + SHA-256 + GitHub release URL
- Coordination note: did this bundle with v0.1.45 or ship as v0.1.46?

---

### Statute reminders

- §3 + corrective BP079: "Sonnet 4.6" verbatim in every SEG announcement AND every `model:` parameter
- §12 Ask-Knight-First: Knight decides storage key for persisted dimensions (reuse existing pattern)
- `canon_actual_runtime_verify_for_runtime_bugs_bp078`: live packaged-install test required; source change alone does NOT verify
- `feedback_ux_seg_screenshot_mandatory_bp078`: screenshot evidence mandatory but **FOUNDER is the capture-actor** per `canon_screenshot_evidence_canonical_founder_verify_supersedes_knight_screenshot_capture_bp079_founder_ratify` (pearl_ffca677447da6ede, BP079 amendment 2026-06-10). Knight does NOT install or screenshot. Founder installs + screenshots + reports.
- `feedback_off_the_street_test_naming_bp078`: this fix originates from Off-the-Street test (Founder's wife, cold-stranger persona)
- `canon_every_click_visible_feedback_canon_bp078`: window controls must be visible and reachable on default launch

---

### Paste-ready Founder wake-up

> Knight, NEW Yoke at `BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BP079_V0146_DEFAULT_WINDOW_SIZE_2026-06-10.md`. Founder Off-the-Street test (wife's monitor): default window opens with title bar OFF SCREEN. Fix in Electron main: cap height to screen.workAreaSize.height - 80, y to workArea.y + 40, persist user-resized dimensions. All 4 BrowserWindows. Black Mamba x 1 + VERIFY + SHIP. Sonnet 4.6 verbatim (Statute §3 + corrective BP079). Coordinate v0.1.45/v0.1.46 sequencing with Founder.

- Bishop - BP079 - pinned 2026-06-10T23:59:00Z

---

## BLACK MAMBA PASTE-READY DISPATCH (forward this block verbatim to Knight)

Knight: dispatch 1 parallel Sonnet 4.6 SEG RIGHT NOW, then 2 sequential synthesis SEGs. Sonnet 4.6 verbatim in every announcement (Statute §3 + corrective sub-canon BP079, pearl_98f74effb5d986a5). SEG below is self-contained scope; do NOT re-decompose; do NOT ask for clarification before firing.

**SEG-V0146-WS-1 (Sonnet 4.6):** In `src/main/index.ts`, locate ALL 4 BrowserWindow constructors (overlayWindow, moneyPennyWindow, dashboardWindow, hearthConjunctionWindow). Before each BrowserWindow construction, compute safe defaults using `screen.getPrimaryDisplay()`:

```typescript
import { screen } from 'electron';
const primaryDisplay = screen.getPrimaryDisplay();
const { width: workWidth, height: workHeight } = primaryDisplay.workAreaSize;
const { x: workX, y: workY } = primaryDisplay.workArea;

const DEFAULT_WINDOW_HEIGHT = Math.min(800, workHeight - 80);
const DEFAULT_WINDOW_WIDTH = Math.min(1280, workWidth - 100);
const DEFAULT_WINDOW_Y = workY + 40;
const DEFAULT_WINDOW_X = workX + Math.floor((workWidth - DEFAULT_WINDOW_WIDTH) / 2);
```

Use `DEFAULT_WINDOW_WIDTH/HEIGHT/X/Y` in each BrowserWindow constructor. Keep `minWidth: 800, minHeight: 600`. Preserve all existing webPreferences (preload, zoomFactor 1.15, etc.).

Also persist user-resized dimensions across launches: read saved w/h/x/y from electron-store (reuse the `ui.zoomFactor` store pattern from SEG-V0144-UI-1; store keys e.g. `window.main.width`, `window.main.height`, `window.main.x`, `window.main.y`). On each launch, clamp saved dimensions to current workAreaSize (handles monitor changes). On window `resize` and `move` events, save new dimensions to store. Fall back to computed defaults when no saved value exists.

For overlayWindow/moneyPennyWindow/hearthConjunctionWindow: apply y-clamping (never place above workY + 40) but do not override their intended width/height if those windows have specific smaller sizes -- just ensure y is never off-screen.

Deliver: code diff in `src/main/index.ts`.

When SEG-V0146-WS-1 returns, run sequential synthesis:

**SEG-V0146-WS-VERIFY (Sonnet 4.6):** **[BP079 AMENDMENT 2026-06-10 per `canon_screenshot_evidence_canonical_founder_verify_supersedes_knight_screenshot_capture_bp079_founder_ratify` (pearl_ffca677447da6ede): Knight does NOT need to install + screenshot. Source + build + assertion + IPC-handler counts verify required; Knight does not need to capture packaged-install screenshots. Founder installs + screenshots + reports separately.]** Source + build verify: assert-preload-sandbox PASS, assert-preload-source-no-declare-const PASS, assert-ipc-handlers PASS (142/142 or current), unit/integration tests all PASS, TypeScript compile clean, lint + format clean. Confirm SEG-V0146-WS-1 committed changes in `src/main/index.ts`. List commit SHA. Surface Truth-Always flags (clamping logic, overlayWindow concerns). Yoke-return: SHA + commit + GitHub DRAFT URL + per-SEG status.

**SEG-V0146-WS-SHIP (Sonnet 4.6):** Coordination: if v0.1.45 has NOT yet shipped, bundle this fix into v0.1.45 (add WS-1 diff to the v0.1.45 SEG-V0145-SHIP scope; no new version number needed). If v0.1.45 has already shipped, bump to v0.1.46. Build packaged installer. SHA-256. DRAFT GitHub Release with note: "Fix: window opens with title bar visible on all monitor sizes (Off-the-Street test fix)." Pull Bishop staged Cephas commits f0cfd7a + f9154be if not already pulled. Update Cephas version + latest.yml sha512. Append Yoke-return to `BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BP079_V0146_DEFAULT_WINDOW_SIZE_2026-06-10.md` as `## RESPONSE` block.

Yoke-return must include: per-SEG commit SHA + code diff summary + screenshot SID or binary + version shipped (v0.1.45 bundle or v0.1.46) + SHA-256 + GitHub release URL + Truth-Always findings.

If any SEG announces "Sonnet 4.5" or other version-variant in narration: STOP, fix the announcement, re-fire. Violation of corrective sub-canon BP079.

---
