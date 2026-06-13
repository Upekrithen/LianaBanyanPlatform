---
forensic: BP081_V0156_ASK_RUNTIME_FORENSIC
composed_at: 2026-06-12
composed_by: Bishop SEG (Sonnet 4.6) content; Bishop main thread persisted
purpose: identify why v0.1.56 LEAN Ask fails at runtime — TRUTH-ALWAYS: binary was never installed; running v0.1.48
---

# v0.1.56 Ask Runtime Forensic · BP081

## §1 MnemosyneC userData path
`C:\Users\Administrator\AppData\Roaming\mnemosynec\`

Contents:
- `diagnostic-2026-06-11T15-08-07.log` (634 bytes)
- `diagnostic-2026-06-11T16-04-09.log` (628 bytes) ← MOST RECENT
- `kitchen_table_data.json` (5,531 bytes)
- `sku_tier.json` (38 bytes) — `{"tier":"full","model":"gemma4:12b"}`
- Standard Electron cache dirs
- NO new diagnostic log dated 2026-06-12
- NO eblet store visible

A second older directory `mnemosyne\` (no -c) exists but is empty/abandoned.

## §2 Diagnostic log tail (2026-06-11T16-04-09)

```
=== MnemosyneC Diagnostic ===
Timestamp: 2026-06-11T16:04:09.715Z
App version: 0.1.48          ← KEY FINDING
Platform: win32 x64
Electron: 31.7.7
userData: C:\Users\Administrator\AppData\Roaming\mnemosynec
Ollama running: true
Ollama model: gemma4:12b
activeModel=gemma4:12b targetModel=gemma4:12b
gemma4:12b manifest exists: true
```

**No 2026-06-12 diagnostic exists.** v0.1.56 has NEVER launched on this machine.

## §3 Ollama runtime state — HEALTHY

- Service: `ollama.exe` (PID 41892) + `ollama app.exe` (PID 51604) both running
- `http://127.0.0.1:11434/api/tags`: HTTP 200, 7 models including `gemma4:12b`
- `http://0.0.0.0:11434/api/tags`: HTTP 000 (client side — expected; not a real bind issue)
- Machine-level `OLLAMA_HOST=0.0.0.0:11434` is set (v0.1.55 NSIS landed it)
- `ollama list` returns:
  - gemma4:12b (7.6 GB)
  - qwen2.5:0.5b, gemma2:2b, qwen2.5:7b, mistral:7b, llama3.1:8b, llama3.3:70b

**Ollama is FINE. Not the failure.**

## §4 Installed v0.1.56 binary inspection

- `C:\Users\Administrator\AppData\Local\Programs\MnemosyneC\` — **DOES NOT EXIST**
- `C:\Program Files\MnemosyneC\` — DOES NOT EXIST
- `C:\Users\Administrator\AppData\Local\MnemosyneC\` — DOES NOT EXIST
- `C:\Users\Administrator\AppData\Local\Programs\voombrella-app\` — Voomly Cloud v1.4.19 (unrelated product)
- `C:\Users\Administrator\AppData\Local\mnemosynec-updater\installer.exe` (536 MB) — **EXISTS but NEVER RUN**
- Source `package.json` at `LianaBanyanPlatform\package.json` already at `0.1.57` (dev tree moved past)

**The v0.1.56 installer was downloaded into the updater cache but never executed. No install completed. The binary actually running on this machine is v0.1.48 from a prior session.**

## §5 Source-side trace

Error string origin: `src/renderer/components/LeanAskTab.tsx:230`
```typescript
} catch (e) {
  updateLastMsg(aiId, '⚠ Could not reach local AI. Make sure MnemosyneC is set up (see Home tab).');
}
```

This fires when `window.amplify?.aiDispatch?.query(...)` throws. In v0.1.48 (pre-family-match), the hard-coded `gemma4:12b` resolution path can fail when the IPC bridge / preload encounters a state mismatch. The error message is identical to what v0.1.55/v0.1.56 *would* show if the underlying IPC threw — but here the BINARY running is v0.1.48 with the OLD bug, not the new one.

## §6 Hypothesis — CONFIRMED HYPOTHESIS F (HIGH CONFIDENCE)

**The v0.1.56 NSIS installer was placed in the updater cache but NEVER EXECUTED on this machine.** Founder believes v0.1.56 is installed; in reality v0.1.48 is the running binary.

Evidence:
1. Most recent diagnostic log dated 2026-06-11 shows `App version: 0.1.48`
2. No 2026-06-12 diagnostic log exists despite Founder's report of installing today
3. `C:\Users\Administrator\AppData\Local\Programs\MnemosyneC\` does not exist
4. Only the unrun installer .exe (536 MB) is present in updater cache
5. Source tree has already moved to 0.1.57

**This means v0.1.56's family-match fix has NOT been runtime-tested on this machine. We don't know if v0.1.56 actually works — only that v0.1.48 doesn't.**

The same situation may apply to the other 2 machines Founder mentioned (M1, M2/M3) — install download ≠ install execution. Need to verify per-machine.

## §7 Recommended actions

### Founder-side (this machine):
1. Locate `C:\Users\Administrator\AppData\Local\mnemosynec-updater\installer.exe` OR re-download from staging URL:
   `https://github.com/liana-banyan/mnemosyne/releases/download/v0.1.56/MnemosyneC-Setup-0.1.56.exe`
2. **Right-click → Run as administrator** (NSIS needs elevation to write HKLM OLLAMA_HOST)
3. Watch for NSIS install dialog → click Next/Install → wait for completion screen
4. After install: confirm `C:\Users\Administrator\AppData\Local\Programs\MnemosyneC\` now exists
5. Launch MnemosyneC. Title bar should show "v0.1.56"
6. New diagnostic log should appear in `C:\Users\Administrator\AppData\Roaming\mnemosynec\` dated 2026-06-12 with `App version: 0.1.56`
7. Open Ask tab → click cold → answer should appear (no "Could not reach")

### If install fails (NSIS error, antivirus block, elevation denied):
- Note the error message verbatim
- Bishop diagnoses from there

### If install succeeds + v0.1.56 launches but Ask STILL broken:
- THEN we have a real v0.1.56 runtime regression
- Bishop fires deeper forensic on the actual v0.1.56 binary

### Knight side:
- v0.1.57 work continues — but DO NOT promote v0.1.57 to Latest until v0.1.56 is empirically verified working on at least one Founder machine
- Optional v0.1.56.1 hotfix: improve the LeanAskTab.tsx catch message to distinguish "preload bridge missing" from "IPC threw" so future users see actionable text not the generic "Could not reach"

## §8 Truth-Always log

This forensic caught a Founder-side assumption (Founder believed v0.1.56 was installed; binary state proved v0.1.48 was running). The fix is install completion verification, not source code. Empirical evidence > belief.

Also: when Founder reports a runtime issue, FIRST step should always be "what version is actually running" — confirmed via diagnostic log timestamp + app.getVersion() — before diagnosing v0.1.X regression. Adding to discipline:

**Proposed canon (BP081):** Before Bishop diagnoses any reported runtime regression in version X, confirm via diagnostic log that binary running IS version X. Do not assume install completion from "I installed it" statement.

Model: Sonnet 4.6
