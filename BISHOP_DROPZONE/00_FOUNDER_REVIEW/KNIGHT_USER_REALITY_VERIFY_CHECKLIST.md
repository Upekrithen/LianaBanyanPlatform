# KNIGHT USER-REALITY VERIFICATION CHECKLIST

**Classification:** P0 Discipline Document  
**Applies to:** All IPC fixes, UX fixes, and any change where Knight claims "PASS" before Founder review  
**Effective from:** v0.1.30  
**Regression reference:** BP078

---

## 1. THE DISCIPLINE FAILURE PATTERN

**Name:** Source-Verified-Only PASS (SVP)

### What happened

In three separate incidents spanning v0.1.27 through v0.1.30, Knight verified source code, declared the fix verified, and shipped. In each case, the Founder encountered the bug at runtime on an installed build.

The pattern:
1. A P0 bug is filed (IPC channel not registered, UX broken).
2. Knight reads the source TypeScript, confirms the handler is present in source.
3. Knight reports "verified -- handler registered, IPC fix is in place."
4. Build is packaged and installed.
5. Founder clicks the button. Bug is still present.
6. Post-mortem reveals: the fix was in source but the compiled `dist/main/*.js` did not include the handler, or the handler registration path was not reached at startup, or the channel name had a mismatch that only surfaces at runtime.

### The gap

**Source verification is not user-reality verification.**

Reading source code confirms intent. It does not confirm execution. The gap between source and runtime includes:

- Compilation errors or omissions that silence the fix before it reaches `dist/`
- Handler registration inside conditional branches not executed at startup
- Channel name typos that only manifest when the renderer actually invokes
- Preload or renderer invocations targeting a different string than the main-process registration
- Electron packaging steps that exclude or transform modules

No IPC fix or UX fix is PASS until the Founder's action path has been exercised on a packaged build.

---

## 2. MANDATORY PRE-SHIP CHECKLIST

Every item below is required before claiming any IPC or UX fix "verified." Skipping any item means the verification status is SOURCE-ONLY, not PASS.

### Step A -- Install on a clean profile

- Install the packaged installer on a machine or profile that has no existing installation of this app.
- Do not test against the dev tree (`npm start` or equivalent).
- Do not test against an existing install that may carry cached state, registered handlers from a prior version, or leftover IPC channels.
- A clean profile means: no prior `userData` directory, no prior registry entries from a previous install.

### Step B -- Open DevTools console

- In the running installed build, press `Ctrl+Shift+I` to open Electron DevTools.
- Navigate to the Console tab.
- Clear existing output so the test run is isolated.

### Step C -- Click the actual button

- Do not read the code that calls the IPC channel.
- Do not call `ipcRenderer.invoke` manually from the console.
- Click the exact UI element that the Founder would click in normal use.
- If the fix is for the SKU upgrade flow, open the upgrade modal and click the upgrade button.
- If the fix is for a settings panel, open settings and trigger the relevant action.
- The goal is to reproduce the Founder's exact action path.

### Step D -- Capture DevTools console output

- After clicking, capture the DevTools console output by screenshot or by copying the full text.
- The capture must be attached to or referenced in the yoke-return.
- A verbal description ("I saw no errors") is not sufficient.

### Step E -- Confirm no "No handler registered" errors

- Inspect the captured console output.
- Confirm there is no message of the form: `Error invoking remote method 'channel-name': No handler registered for 'channel-name'`
- Confirm there is no unhandled promise rejection from `ipcRenderer.invoke`.
- If any such error is present, the fix is not complete. Do not claim PASS.

### Step F -- Confirm IPC return value shape

- Confirm the return value from the IPC call matches the expected shape.
- Not `undefined`.
- Not an error object when success was expected.
- For channels that return structured data, confirm the expected fields are present.
- Log the return value explicitly if it is not visible in the UI.

### Step G -- Screenshot the success UI state

- Take a screenshot of the UI showing the expected post-action state.
- For the upgrade modal: the modal should show progress or confirmation, not a blank panel.
- For any IPC-driven UI update: the update should be visible, not absent or frozen.
- Attach the screenshot reference to the yoke-return.

### Step H -- SKU upgrade channels (required for any SKU upgrade fix)

Confirm all four of the following channels respond without error:

| Channel | Expected behavior |
|---|---|
| `sku-upgrade-to` | Initiates upgrade, returns status |
| `sku-current-tier` | Returns current SKU tier string |
| `sku-check-model` | Returns model availability for current SKU |
| `sku-cancel-upgrade` | Cancels in-progress upgrade, returns acknowledgment |

Testing one channel and assuming the others are fine is not acceptable. Each must be individually exercised.

---

## 3. GUARDRAIL RULES

The `assert-ipc-handlers` script, or any equivalent build-time IPC verification tool, is only trustworthy if it follows all rules below. A script that violates any rule must not be used as evidence of PASS.

### Rule A -- Scan compiled output, not source

The script must scan `dist/main/*.js` (or the equivalent compiled output directory).

Scanning `src/**/*.ts` confirms source intent. It does not confirm what was compiled and packaged. The script must operate on the same artifact that the installer packages.

### Rule B -- Cross-check with exact string match

The script must:
1. Collect all `ipcRenderer.invoke('channel-name')` calls from the compiled renderer bundle.
2. Collect all `ipcMain.handle('channel-name')` registrations from the compiled main bundle.
3. Match them by exact string equality.

Substring matching, prefix matching, or regex-based matching that does not require exact equality is not acceptable.

### Rule C -- Fail the build on any missing channel

If any renderer invoke target is absent from the compiled main registrations, the build must fail with a non-zero exit code.

A warning is not a failure. A warning can be ignored. The build must not proceed to packaging if any channel is unmatched.

### Rule D -- Print individual channel results

The script must print each channel name and whether it matched or did not match.

Example acceptable output:
```
MATCH    sku-upgrade-to
MATCH    sku-current-tier
MISSING  sku-check-model
MATCH    sku-cancel-upgrade
FAIL: 1 channel(s) unregistered in compiled main
```

A count alone ("3 of 4 channels matched") is not acceptable. The failing channel name must be printed.

### Rule E -- Do not count comments, log strings, or preload definitions

A channel name found in any of the following locations does not count as a handler registration:

- A code comment: `// handles 'sku-upgrade-to'`
- A log string: `console.log('registering sku-upgrade-to')`
- A preload bridge definition: `contextBridge.exposeInMainWorld(...)` or `ipcRenderer.invoke(...)` in a preload file
- A type definition or interface declaration
- A test file or mock

Handler registration means exactly one thing: `ipcMain.handle('channel-name', handler)` in a code path that is reachable at app startup.

### Rule F -- Registration must be reachable at startup

A handler registration inside a conditional branch counts only if the condition is true at normal app startup.

Examples of registrations that do NOT count:
- Inside `if (process.env.DEBUG_MODE)` when that env var is not set in production
- Inside a click handler or user-triggered callback
- Inside a function that is defined but never called during startup

If the script cannot statically determine reachability, it must flag the channel as UNVERIFIED and require manual confirmation. UNVERIFIED is not PASS.

---

## 4. SCOPE DEFINITION

### Source-verified

Definition: The developer read the source code and confirmed the relevant logic is present.

Sufficient for: Low-risk refactors, purely cosmetic changes, changes with no IPC or runtime behavior.

Not sufficient for: Any P0 bug fix, any IPC channel registration, any UI state driven by IPC, any change where the Founder's action path is affected.

### User-reality verified

Definition: A human installed the packaged build, executed the Founder's exact action path, observed the expected result, and captured evidence (screenshot or console log).

Required for: All IPC fixes. All UX fixes where the user-facing state depends on an IPC call. All changes tagged P0 or P1. All changes that were previously shipped as source-verified and were found to be broken at runtime.

### The rule

If a yoke-return says "verified" on a P0 IPC or UX fix without explicit user-reality verification evidence, the verification is invalid. The fix must be re-verified before it is treated as PASS.

---

## 5. SIGN-OFF FORMAT

Every yoke-return that claims PASS on an IPC or UX fix must include the following two lines verbatim:

```
Source-verified: YES/NO
User-reality verified: YES/NO -- [description]
```

### If user-reality verified is YES

The description must include:
- What build was installed (version, installer file name or hash if available)
- What action was taken (exact button or UI element clicked)
- What was observed (what the console showed, what the UI showed)
- Where the evidence is (screenshot path, log paste, or inline content)

Example:

```
Source-verified: YES
User-reality verified: YES -- Installed v0.1.30-rc2 clean on fresh profile. Opened upgrade modal, clicked "Upgrade to Pro". DevTools console: no errors. sku-upgrade-to returned {status: "initiated", tier: "pro"}. Modal showed progress bar. Screenshot: /verification/v0130-sku-upgrade-pass.png
```

### If user-reality verified is NO

The description must include an explicit acknowledgment that source-only verification was performed and state the reason user-reality verification was not done.

Example:

```
Source-verified: YES
User-reality verified: NO -- Source-only verification performed. Build pipeline did not produce a packaged installer in this session. User-reality verification deferred to next packaging run. This fix is NOT claimed as PASS for P0 purposes.
```

A yoke-return that omits the user-reality line entirely, or that says "verified" without this format, is treated as SOURCE-ONLY and does not close a P0 bug.

---

## ENFORCEMENT

This document is in effect for all Knight agents working on LianaBanyanPlatform as of v0.1.30.

Any yoke-return claiming PASS on an IPC or UX fix that does not include the sign-off format defined in Section 5 is non-compliant and must be returned for re-verification before the Founder acts on it.

The pattern described in Section 1 caused three P0 regressions. It will not recur.

---

## 6. v0.1.33 DEVTOOLS ACCESS PATHS (SEG-Q-3 · BP078)

Three documented paths to open Chromium DevTools in MnemosyneC v0.1.33+:

### Path 1 -- Settings button (NEW in v0.1.33)
1. Open the MnemosyneC Dashboard window.
2. Click the gear icon (Settings) or navigate to Settings.
3. Scroll to the "For Techies" section.
4. Click "Toggle DevTools". The Chromium DevTools panel opens detached.
5. This path always works regardless of keyboard shortcut conflicts.

### Path 2 -- Title bar right-click (NEW in v0.1.33)
1. Right-click anywhere on the MnemosyneC window title bar (the top border area with the title text).
2. A context menu appears with "Toggle Developer Tools" as the first item.
3. Click it. DevTools opens detached.
4. Works on both the Dashboard window and the Hearth Conjunction ("Bridge") window.
5. Note: this replaces the default Windows system context menu for MnemosyneC title bars.

### Path 3 -- Keyboard shortcut (pre-existing)
- `Ctrl+Shift+D` toggles the developer application menu, which contains "Toggle DevTools".
- Known issue: conflicts with some Windows global shortcuts on certain machines.
- If this path fails, use Path 1 or Path 2 above.

### Path 4 -- Remote debugging (power-user)
Launch MnemosyneC with the remote debugging port flag:
```
"MnemosyneC.exe" --remote-debugging-port=9222
```
Then open Chrome or Edge and navigate to `chrome://inspect` (or `edge://inspect`).
Click "Configure..." and add `localhost:9222`.
All MnemosyneC windows will appear under "Remote Target".
This path is recommended when you need to attach external profiling tools or run automated tests against the running app.
