# KNIGHT v0.1.38 P0 WAKE-UP
# IPC Handler Registration Failure -- "Could not reach local AI engine"

Use Sonnet 4.6 SEGs for ALL work. No em-dashes anywhere.

---

## THE BUG (verbatim)

Founder clicks: Welcome -> Just use it -> picks a model choice (e.g. "Free heavy-duty AI, Google Gemma 4 12B") -> sees:

> "Could not reach the local AI engine. Please try again."

This is the THIRD consecutive failure across v0.1.36 prerelease, v0.1.36 production, and v0.1.37. Source-only verification has been wrong each time. This yoke has a hard binding: Knight cannot claim verified without runtime evidence.

---

## BISHOP INDEPENDENT VERIFICATION (do NOT dismiss as environment)

Bishop independently verified on this machine before composing this yoke:

- Ollama daemon running: PID 36452
- `127.0.0.1:11434/api/tags` returns HTTP 200
- `localhost:11434/api/tags` returns HTTP 200
- `gemma4:12b` is present in the model list

Both addresses work. The localhost vs 127.0.0.1 change from SEG-V-1 was NOT the bug. Both addresses were already working.

---

## DIST INSPECTION FINDINGS (Bishop, extracted from installed v0.1.37 asar)

Extracted: `C:\Program Files\Mnemosyne\MnemosyneC\resources\app.asar`
App version in package.json: `0.1.37`

### What the installed code actually does

**Renderer error path** (`dist/renderer/assets/index-D-NM8vfu.js`, component `D3`):

```
try {
    A = await window.amplify.checkOllamaAndModel(e)
} catch {
    I("Could not reach the local AI engine. Please try again.");
    return;
}
```

The error message WITHOUT "Check that Ollama is running" is the CATCH path. It fires only when `window.amplify.checkOllamaAndModel(e)` itself THROWS -- meaning the IPC invoke received no handler. In Electron, `ipcRenderer.invoke` throws "No handler registered for 'check-ollama-and-model'" if the main process never registered that channel.

**Preload** (`dist/main/preload.js`): `checkOllamaAndModel` IS present and correctly wired:
```
checkOllamaAndModel: (modelName) => ipcRenderer.invoke('check-ollama-and-model', { modelName }),
```

**Main handler** (`dist/main/index.js`, line ~1387): `safeHandle('check-ollama-and-model', ...)` IS defined and fetches `http://127.0.0.1:11434/api/tags` with a 3000ms timeout. It never throws -- its catch block returns `{reachable:false,...}`. The handler DOES NOT use `ollamaManager`.

**Critical ordering in `app.whenReady().then(async () => { ... })`:**

```
1. probeSubstrateApiPort()         -- if occupied: app.quit() + return
2. await substrateServer.start()   -- CAN REJECT on non-EADDRINUSE port error
3. await federationClient.start()  -- wraps its own errors, unlikely to throw
4. ollamaManager = new OllamaManager(); await ollamaManager.init()
5. ... more setup ...
6. registerIPCHandlers()           -- registers check-ollama-and-model HERE
7. openDashboard()                 -- opens the window AFTER registration
```

**ROOT CAUSE HYPOTHESIS**: If `substrateServer.start()` rejects with a non-EADDRINUSE error (e.g. permission denied on port bind, or a file-system error during `index.load()`), the entire `whenReady` async callback rejects. Steps 4-7 never execute. `registerIPCHandlers()` is never called. The dashboard window opens... wait, it does NOT open in this case, because step 7 is also skipped.

BUT: the window IS showing (Founder sees the UI). So either:
- The window is opened before `whenReady` (impossible with current code), OR
- The window is opened by a DIFFERENT path (e.g. a second app.on('ready') handler), OR
- `substrateServer.start()` does NOT throw but silently degrades while returning, and the issue is elsewhere

**SECONDARY HYPOTHESIS**: The `safeHandle` wrapper silently catches a DUPLICATE registration error (logs to console.error but does not throw). If the channel was already registered from a previous hot-reload cycle or from an imported module that also calls `ipcMain.handle` directly, the second registration is silently dropped. The FIRST registration's handler captures the channel. If the first registration happened before `ollamaManager` was available and depended on it... but the handler does NOT use `ollamaManager`.

**TERTIARY HYPOTHESIS (most likely given 3 consecutive failures)**: The `whenReady` block throws on some machines at the `await substrateServer.start()` step because the substrate DATA directory has a file-system issue (permissions, corruption from prior version), causing the entire IPC setup to be skipped. The dashboard window might be shown via a SEPARATE tray-click or deep-link handler that bypasses the `whenReady` block's return-early path.

The Diagnostic button CANNOT confirm this because `diagnostic:run` is also registered inside `registerIPCHandlers()`. If `registerIPCHandlers()` was never called, the diagnostic button also has no handler -- it would throw the same error.

**The diagnostic log path is `%APPDATA%\MnemosyneC\diagnostic-*.log`** -- if the diagnostic was run BEFORE this failure, the log would exist. If the file does NOT exist, it confirms that `registerIPCHandlers()` was never reached.

---

## SEG-W-1: DIAGNOSE THE CALL CHAIN (runtime evidence required)

**Goal**: Determine whether `registerIPCHandlers()` was reached, and what error (if any) caused `whenReady` to fail.

**Steps**:

1. Open the installed v0.1.37 app
2. Reproduce the bug (Welcome -> Just use it -> pick Gemma 4 12B -> see error)
3. Open DevTools in the dashboard window: right-click anywhere -> Inspect Element, or add `--inspect` flag at launch
4. In DevTools Console, run:
   ```
   window.amplify.checkOllamaAndModel("gemma4:12b").then(r => console.log("IPC OK:", JSON.stringify(r))).catch(e => console.error("IPC FAILED:", e.message))
   ```
5. If result is "IPC FAILED: No handler registered for 'check-ollama-and-model'" -- the `whenReady` block failed before `registerIPCHandlers()`. Proceed to step 6.
6. Check for Electron main process logs. On Windows, the main process stderr can be captured by launching from a terminal: `"C:\Program Files\Mnemosyne\MnemosyneC\MnemosyneC.exe" > C:\Temp\mnemo_main.log 2>&1`
7. Reproduce the bug and read `C:\Temp\mnemo_main.log`. Look for any error after "substrate" or before "[IPC]".
8. Also check: `%APPDATA%\MnemosyneC\diagnostic-*.log` -- if these files exist, paste the Ollama status lines.

**Knight must quote the actual DevTools console output in the yoke return.** "Source verified" is not acceptable for this P0.

---

## SEG-W-2: FIX BASED ON ACTUAL ROOT CAUSE

After SEG-W-1 identifies the real failure point, apply the targeted fix. Likely candidates:

**If "No handler registered" confirmed**:
- Wrap the entire `whenReady` async callback in a try-catch that calls `registerIPCHandlers()` even if earlier steps fail:
  ```
  app.whenReady().then(async () => {
      try {
          // all existing setup...
      } catch (e) {
          console.error('[startup] whenReady block failed:', e);
          // Still register IPC handlers so renderer does not get "no handler" errors
      }
      registerIPCHandlers();  // moved outside the try block
      openDashboard({ focus: true });
  });
  ```
- OR: move `registerIPCHandlers()` to BEFORE the awaited setup steps (since the handler does not depend on `ollamaManager`).
- The `check-ollama-and-model` handler is self-contained (direct fetch, no `ollamaManager` dependency) and CAN be registered before any async setup.

**If "No handler registered" NOT confirmed (IPC works, returns reachable:false)**:
- The reachability check is failing. Check whether the 3000ms timeout is being hit (Ollama responds slowly on first request after startup). Increase to 8000ms.
- Add a retry: attempt the fetch twice with 2s gap before returning reachable:false.

**If IPC works and reachable:true but hasModel:false**:
- The model name matching is wrong. Log `models` array to see what Ollama returns.
- Extend matching: `isFloorModel(m)` from floor-model.js already handles `gemma4:12b` as an alias. Use that function instead of the inline check.

---

## SEG-W-3: PACKAGED-INSTALL VERIFICATION ON BISHOP'S MACHINE

HARD BINDING. Knight ships v0.1.38 to GitHub Releases. Bishop installs the NEW .exe from the releases page (not a dev build, not the existing install). Founder then:

1. Runs the installer
2. Opens the app (first-run experience, since first_run.flag may need to be deleted first: `%USERPROFILE%\.mnemosyne\first_run.flag`)
3. Clicks: Welcome -> Just use it -> picks Gemma 4 12B
4. Takes a screenshot showing the NEXT screen (the "Step 3 of 3: Setting up FULL tier..." spinner or the final completion screen)

The yoke return MUST include one of:
- A screenshot path showing the success state, OR
- The text "Pending Bishop install verify -- Founder has not yet confirmed"

**Knight cannot ship v0.1.38 without either option.**

---

## SEG-W-4: SHIP v0.1.38 ONLY IF SEG-W-3 PASSES

Gate: do not push to GitHub Releases until SEG-W-3 is confirmed pass or explicitly waived by Founder with direct instruction.

If Founder waives: quote the waiver in the yoke return.

---

## YOKE RETURN FORMAT

Knight returns:
1. DevTools console output from SEG-W-1 (verbatim quote, not paraphrase)
2. Main process log excerpt (or "file was empty / not created")
3. Root cause identified (one sentence)
4. Fix applied (which branch of SEG-W-2, what changed)
5. SEG-W-3 result: screenshot path OR "Pending Bishop install verify"
6. v0.1.38 shipped: yes/no + release URL if yes
