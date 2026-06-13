# BP078 v0.1.38 P0 Diagnosis and Wake-Up Receipt

Timestamp: 2026-06-10T03:25:00Z

## Files Created or Edited

1. `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_V0138_P0_WAKE_UP.md`
   -- Knight v0.1.38 P0 wake-up with dist findings, 4 SEGs, hard binding on runtime verification

2. `C:\Users\Administrator\.claude\projects\C--Users-Administrator-Documents\memory\feedback_actual_runtime_verify_for_runtime_bugs_bp078.md`
   -- New discipline canon: runtime bugs require runtime evidence before SEG complete

3. `C:\Users\Administrator\.claude\projects\C--Users-Administrator-Documents\memory\MEMORY.md`
   -- Canon index entry added after line 25 (after long-running progress canon)

## Dist Inspection Summary

Extracted and read: `C:\Program Files\Mnemosyne\MnemosyneC\resources\app.asar` (v0.1.37)

- Preload: `checkOllamaAndModel` bridge correctly wired (present in contextBridge.exposeInMainWorld)
- Main handler: `check-ollama-and-model` registered once in `registerIPCHandlers()`, fetches `127.0.0.1:11434`, never throws
- Error path: "Could not reach local AI engine. Please try again." (no "Check that Ollama is running" suffix) = CATCH path in renderer component D3 -- IPC invoke itself threw, not a reachability failure
- Root cause hypothesis: `registerIPCHandlers()` is called INSIDE `app.whenReady().then(async () => {...})` at step 6 of 7. If `substrateServer.start()` (step 2) or any earlier async step rejects, the whole callback rejects and steps 4-7 (ollamaManager init + registerIPCHandlers + openDashboard) never execute. No try-catch wrapper around the whenReady block.
- Cannot confirm without runtime log. SEG-W-1 in wake-up requires Knight to capture DevTools console output.

## Founder Action

Paste `KNIGHT_V0138_P0_WAKE_UP.md` to Knight as the new session wake-up prompt.
