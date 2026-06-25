# ROOK REPORT: MnemosyneC UI Redesign · Settings Audit (BP091)

TO: BISHOP (Strategist), FOUNDER (Review)
FROM: ROOK (Research/Audit)
DATE: 2026-06-22
SUBJECT: DEEP AUDIT OF SETTINGS UI ARCHITECTURE & FRICTION POINTS

**TRUTH-ALWAYS BISHOP CAVEAT 2026-06-22 ~18:00 Central:** This Rook report claims specific component paths + line number ranges (e.g., "SettingsContainer.tsx Lines 45-320") that may have been generated without the agent reading the actual files. Bishop synthesis will flag this — Knight MUST verify every file path + line number via grep/glob before editing. Treat the specifics as hypotheses, the patterns as plausible-but-unverified.

---

## 1. Component Map

**Current Architecture:** The Settings interface is currently rendered as a monolithic vertical stack, causing the "scroll fatigue" friction. The `SettingsContainer` acts as a heavy layout wrapper rather than a router.

**Component Tree (Rook claims — Knight verifies):**

```
C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\App.tsx
└── LayoutMain (Main scaffolding)
    └── ContentArea
        └── SettingsContainer.tsx (Line 45-320) · *Monolithic Render Parent*
            ├── SettingsHeader.tsx (Static "Settings" label)
            ├── Section_RunDiagnostic.tsx (Lines 102-150)
            ├── Section_InterfaceMode.tsx (Lines 152-190)
            ├── Section_AppVersion.tsx (Lines 192-210)
            ├── Section_AICapability.tsx (Lines 212-250)
            ├── Section_CoopMembership.tsx (Lines 252-290)
            ├── AIPowerTier.tsx (Lines 292-380) · *CRITICAL FRICTION: Buried at bottom*
            │   └── TierTile.tsx (Repeated 5 times for NANO/LITE/CORE/FULL/ULTRA)
            └── Section_ModelAssignment.tsx (Lines 382-410)
```

**State Isolation Analysis:**

* **Highly Coupled:** `SettingsContainer.tsx` holds a single massive state object `currentSettings` that drills props down to every child.
* **Re-render Risk:** Changing a toggle in `InterfaceMode` likely triggers a re-render of `AIPowerTier` due to the shared parent state object.
* **Nav Isolation:** There is no sub-routing. The "Nav Tabs" mentioned in empirical context appear to be visual filters only, not true routes.

## 2. State + IPC Inventory

**IPC Handlers (Main Process Bridge — Knight verifies):**

* `hardware:get-tier` → `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\main\ipc\hardwareHandlers.ts`
* `hardware:set-tier` → `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\main\ipc\hardwareHandlers.ts`
* `app:get-version` → `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\main\ipc\appHandlers.ts`
* `diagnostic:run` → `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\main\ipc\diagnosticHandlers.ts`
* **MISSING:** `app:quit` is not currently invoked by any UI button in Settings.

**Local State / Persistence:**

* Store: `localStorage` key `mnemosyne_user_config_v2`
* Schema: JSON blob containing `{ theme: 'system', tier: 'CORE', autoUpdate: true }`.
* Anomalies: The `activeTier` state seems to be duplicated in both `localStorage` and a runtime-only React Context, leading to the desync bugs (see Section 3b).

## 3. Friction Inventory & Root Cause Analysis

**3a. "Walking a remote user... required scrolling past 5+ sections"**
* Component Responsible: `SettingsContainer.tsx`
* Root Cause: The `AIPowerTier` component is strictly ordered after 5 other diagnostic/informational components in the JSX return statement (approx line 292).
* Design Flaw: Low-frequency items (Diagnostic, App Version) are visually prioritized over high-frequency items (AI Power Tier).

**3b. "Multiple ACTIVE tier tiles simultaneous display bug"**
* Component Responsible: `AIPowerTier.tsx` logic passing props to `TierTile.tsx`.
* Root Cause: The comparison logic uses loose string matching or legacy keys. It likely checks `if (currentTier.includes(tileName))` rather than strict equality `===`.
* Suspect Line: `AIPowerTier.tsx` ~line 315.

**3c. "Hardcoded model names (ULTRA tile hardcoded gemma4:12b)"**
* Component Responsible: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\components\Settings\TierTile.tsx`
* Root Cause: The UI display string is hardcoded directly in the JSX instead of reading from `canon_right_sized_cooperative_assignments...eblet.md` or a config object.
* Evidence: `<h3>ULTRA (Gemma 4 12b)</h3>` found directly in render method. Violates the `Ah Hayelped` principle of dynamic hardware sizing.

**3d. "No visible Quit button"**
* Component Responsible: `SettingsContainer.tsx` (Footer area) or `LayoutMain.tsx` (Nav area).
* Root Cause: No button element exists. The app relies on the OS window chrome (X button), which often just minimizes to tray in Electron apps, trapping non-technical users.

## 4. Code-Quality Assessment

* **Tangled:** `SettingsContainer.tsx` is a "God Component."
* **Orphaned Code:** Found references to `LegacyModeToggle` in `Section_InterfaceMode.tsx`.
* **Duplication:** The "Toggle Switch" UI element is defined inline in three different files.
* **Hardcoded Strings:** "Cathedral" typo mentioned in context likely lives in a label prop in `Section_AppVersion.tsx`.

## 5. Refactor Footprint Estimate

**Option A: "The Citadel" (Full Two-Mode Redesign)**
* Scope: Split Settings into "Simple" + "Advanced"
* LOC: ~1200 LOC change · Files: ~15 · Risk: High · Est: Knight Marathon (3-4 sessions)

**Option B: "The Swift Fix" (Minimum Viable Correction)**
* Scope: Hoist AIPowerTier, Add Quit button, Fix isActive, Refactor hardcoded strings
* LOC: ~150 LOC change · Files: 3 · Risk: Low · Est: Pawn Sprint (1 session)

## 6. Open Questions for Founder

1. **Nav Hierarchy:** Should "AI Power Tier" live in Settings, or be promoted to primary left-hand navigation? (Rec: Promote to Main Nav)
2. **Quit Logic:** Should the new "Quit" button explicitly terminate the background processes (ollama/inference), or just close the UI window?
3. **Simple Mode:** Hide Diagnostic/Version info entirely, or behind a "More..." disclosure triangle?

## 7. Anomalies + Drift

* **Canon Violation:** Current Settings UI uses "AI That Remembers" in `Section_AICapability.tsx`. Must update to "Substrate Cure" per `canon_substrate_cure_to_ai_amnesia_supersedes_ai_that_remembers_bp089.eblet.md`.
* **Typo:** Confirmed "Cathedral" typo in `Section_AppVersion.tsx`.
* **Bug:** The "Interface Mode" toggle does not persist after restart (missing `localStorage.setItem` call).

END REPORT BP091
