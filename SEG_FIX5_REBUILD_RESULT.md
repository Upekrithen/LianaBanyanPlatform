# SEG-V0147-FIX-5-REBUILD Result
**Agent:** SEG-V0147-FIX-5-REBUILD (Sonnet 4.6)
**Timestamp:** 2026-06-11T06:04 UTC (1:04 AM UTC-5)
**Task:** Full packaged Windows build after caithedral-core exports fix

---

## Build Exit Code
**EXIT CODE: 0 (SUCCESS)**

---

## Assertion Outputs (verbatim)

```
[assert-ollama] Auto-detected installer: release/MnemosyneC-Setup-0.1.47.exe
[assert-ollama] Inspecting release/MnemosyneC-Setup-0.1.47.exe (512.1 MB)
[assert-ollama] Using 7z at: C:\Users\Administrator\scoop\shims\7z.exe
[assert-ollama] Extracting inner app-64.7z from NSIS installer (may take ~10s)
[assert-ollama] PASS: ollama.exe present in installer (33.9 MB)
[assert-ollama] PASS: Floor model blob present in installer (379.4 MB)
[assert-ollama] PASS: vc_redist.x64.exe present in installer (24.4 MB)
[assert-ollama] All checks passed. Installer is safe to publish.
```

### Additional Assertions (verbatim)
```
[assert-ipc-handlers] PASS: all renderer IPC channels have registered handlers.
  142 passed, 0 failed out of 142 channels.

[assert-ipc-handlers] SKU Hard Check:
  [SKU HARD CHECK] PASS  'sku-check-model' found in dist/main/index.js
  [SKU HARD CHECK] PASS  'sku-upgrade-to' found in dist/main/index.js
  [SKU HARD CHECK] PASS  'sku-cancel-upgrade' found in dist/main/index.js
  [SKU HARD CHECK] PASS  'sku-current-tier' found in dist/main/index.js
[assert-ipc-handlers] SKU Hard Check PASSED: all 4 SKU channels present in dist/main/index.js.

[assert-preload-sandbox] OK: preload.js is sandbox-safe.
  Checked 407 lines.
```

---

## Installer
- **File:** `release\MnemosyneC-Setup-0.1.47.exe`
- **Size (bytes):** 537,023,905
- **Size (MB):** 512.1 MB

---

## SHA-256
```
0A7D4693A32E020C9EB682BF42C1A5598A0EB32102EC45E719EDBDED430A7504
```

---

## SHA-512 (base64)
```
PpMrhXDYd5rPj0t0R9+fhs2dyTopJe0OQJ0PLnLXefrfS0VbqJ9y+LNhsFj9FoEfenuuSZgN++oV84pwuMAWUQ==
```

---

## GitHub DRAFT Release
**URL:** https://github.com/Upekrithen/LianaBanyanPlatform/releases/tag/untagged-84fba51ce902f957eda4
**Status:** DRAFT - NOT published. NOT pushed to Latest.
**Title:** v0.1.47 - Ollama packaging fix + VC++ bundle + exports fix + heartbeat + window safe bounds

---

## GATE: HOLD-FOUNDER
Knight does NOT self-stamp GREEN. Runtime verification is a separate SEG (HOLD-FOUNDER).
Founder must ratify explicitly before publish.
