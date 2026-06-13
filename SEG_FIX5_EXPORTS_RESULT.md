# SEG-V0147-FIX-5-EXPORTS Result
**Date:** 2026-06-11
**Agent:** SEG-V0147-FIX-5-EXPORTS (Sonnet 4.6)
**Status:** ✅ COMPLETE

---

## All Subpath Imports Found (src/main/ + src/renderer/)

| Import | File | In exports map (before)? |
|--------|------|--------------------------|
| `caithedral-core/tools/soccerball` | `src/main/caithedral_tools_ipc.ts:18` | ✅ Yes |
| `caithedral-core/tools/eblit` | `src/main/caithedral_tools_ipc.ts:20` | ✅ Yes |
| `caithedral-core/tools/substrace` | `src/main/caithedral_tools_ipc.ts:22` | ✅ Yes |
| `caithedral-core/tools/quilt` | `src/main/caithedral_tools_ipc.ts:24` | ✅ Yes |
| `caithedral-core/tools/substrate_address` | `src/main/caithedral_tools_ipc.ts:29` | ✅ Yes |
| `caithedral-core/tools/dag_soccerball` | `src/main/caithedral_tools_ipc.ts:105`, `src/main/index.ts:92`, `src/main/federation_client.ts:20`, `src/main/substrate_api.ts:106` | ✅ Yes |
| `caithedral-core/dns/wan_soccerball_address` | `src/main/federation/wan_escalation.ts:1` | ❌ **MISSING** |

No renderer (`src/renderer/`) imports of `caithedral-core/` found.

---

## Subpaths Missing and Added

| Subpath | Compiled dist file | Action |
|---------|-------------------|--------|
| `./dns/wan_soccerball_address` | `./dist/main/dns/wan_soccerball_address.js` | ✅ **ADDED** |

---

## Diff: caithedral-core/package.json exports map (before → after)

```diff
   "exports": {
     ".": "./dist/main/main/index.js",
     "./tools/soccerball": "./dist/main/tools/soccerball_tools.js",
     "./tools/pearl": "./dist/main/tools/pearl_tools.js",
     "./tools/eblit": "./dist/main/tools/eblit_tools.js",
     "./tools/substrace": "./dist/main/tools/substrace_tools.js",
     "./tools/quilt": "./dist/main/tools/quilt_tools.js",
     "./tools/substrate_address": "./dist/main/tools/substrate_address.js",
     "./tools/dag_soccerball": "./dist/main/tools/dag_soccerball_tools.js",
+    "./dns/wan_soccerball_address": "./dist/main/dns/wan_soccerball_address.js",
     "./tools/soccerball.ts": "./src/tools/soccerball_tools.ts",
     ...
   }
```

---

## Build Results

- `npm run build:caithedral-core` — **exit code 0** ✅
- `caithedral-core/dist/main/dns/wan_soccerball_address.js` — compiled and present ✅
- `node_modules/caithedral-core/package.json` — updated with new export ✅
- `node_modules/caithedral-core/dist/main/dns/wan_soccerball_address.js` — synced to node_modules ✅

Build produced some `Write-Warning` noise about locked files during the copy step — these are non-fatal (exit 0) and do not affect correctness. The `wan_soccerball_address.js` file was copied successfully.

---

## Root Cause Summary

`src/main/federation/wan_escalation.ts` imports `from 'caithedral-core/dns/wan_soccerball_address'`. In dev mode, Node.js resolves this by filesystem fallback (no `exports` enforcement). In packaged Electron (asar), strict ESM `exports` enforcement is active — if the subpath isn't listed, Node throws `ERR_PACKAGE_PATH_NOT_EXPORTED`. The fix is a single line added to the `exports` map mapping `./dns/wan_soccerball_address` → `./dist/main/dns/wan_soccerball_address.js`.

---

## Files Modified

1. `caithedral-core/package.json` — added `./dns/wan_soccerball_address` export entry

No other files modified. `npm run dist:win` not executed per instructions.
