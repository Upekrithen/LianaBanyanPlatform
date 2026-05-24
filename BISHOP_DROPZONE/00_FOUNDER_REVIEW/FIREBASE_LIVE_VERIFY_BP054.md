# KniPr033 · Firebase Live Verify — BP054 Corrections Spot-Check

**Verified:** 2026-05-24 · Knight (Cursor IDE · Mechanic class)  
**Task:** Confirm all 8 Firebase hosting targets are live and BP054 corrections present.

---

## Status Table

| Target | URL | Status | v0.1.10 | SSPL | Download URL correct |
|---|---|---|---|---|---|
| main | https://lianabanyan.com | 200 ✅ | ✅ | ✅ | ✅ |
| main/mnemosyne | https://lianabanyan.com/mnemosyne | 200 ✅ | ✅ | ✅ | ✅ |
| biz | https://lianabanyan.biz | 200 ✅ | N/A | N/A | N/A |
| org | https://lianabanyan.org | 200 ✅ | N/A | N/A | N/A |
| net | https://lianabanyan.net | 200 ✅ | N/A | N/A | N/A |
| the2ndsecond | https://the2ndsecond.com | 200 ✅ | N/A | N/A | N/A |
| hexisle | https://hexisle.lianabanyan.com | 200 ✅ | N/A | N/A | N/A |
| upekrithen | https://upekrithen.lianabanyan.com | 200 ✅ | N/A | N/A | N/A |
| cephas | https://cephas.lianabanyan.com | 200 ✅ | N/A | N/A | N/A |
| cephas/download/ | https://cephas.lianabanyan.com/download/ | 200 ✅ | ✅ | ✅ | ✅ |

**All 8 hosting targets live. All BP054 corrections confirmed.**

---

## BP054 Spot-Check Detail

### lianabanyan.com/mnemosyne

The `/mnemosyne` route lazy-loads `MnemosyneDownload-BPJ_kPuh.js` (9,270 bytes).  
Verified directly against that bundle:

| Check | Result | Evidence |
|---|---|---|
| Version = 0.1.10 | ✅ PASS | `const t="0.1.10"` — renders as `Alpha · v0.1.10` |
| License = SSPL (not AGPL) | ✅ PASS | `"Free to use. Open source (SSPL…"` and `"SSPL (Server Side Public License)"` |
| Download URL uses `liana-banyan/mnemosyne` | ✅ PASS | `https://github.com/liana-banyan/mnemosyne/releases/download/v${t}/…` |
| Wrong repo `lianabanyan/mnemosyne` present | ✅ ABSENT | No matches found |

Windows download URL resolves to:  
`https://github.com/liana-banyan/mnemosyne/releases/download/v0.1.10/Mnemosyne-Setup-0.1.10.exe`

macOS download URL resolves to:  
`https://github.com/liana-banyan/mnemosyne/releases/download/v0.1.10/Mnemosyne-0.1.10.dmg`

---

### cephas.lianabanyan.com/download/

Static Hugo page (114,394 bytes). Verified inline:

| Check | Result | Evidence |
|---|---|---|
| Version = v0.1.10 | ✅ PASS | `Latest release: v0.1.10 (pre-release, unsigned) · Free Forever · SSPL + Patent Pledge #2260` |
| License = SSPL (not AGPL) | ✅ PASS | `SSPL Free Forever · Pledge #2260 · No Ads · No Strings` |
| Download URL uses `liana-banyan/mnemosyne` | ✅ PASS | `href=https://github.com/liana-banyan/mnemosyne/releases/latest` |
| Wrong repo `lianabanyan/mnemosyne` present | ✅ ABSENT | No matches found |

---

## Summary

- **Non-200 targets:** None — all 8 targets return HTTP 200.
- **BP054 v0.1.10:** Present on both /mnemosyne and /download/ ✅
- **BP054 SSPL (not AGPL):** Present on both pages ✅
- **BP054 repo URL:** `liana-banyan/mnemosyne` (correct) on both pages ✅; wrong form `lianabanyan/mnemosyne` absent ✅

All corrections from BP054 are live and confirmed.
