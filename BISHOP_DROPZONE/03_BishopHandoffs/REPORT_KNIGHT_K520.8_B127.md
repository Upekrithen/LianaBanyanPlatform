# REPORT_KNIGHT_K520.8_B127 — Substrate Cache Write Patch
**Session:** K520.8 | **Bishop ref:** B127 | **Date:** 2026-04-27  
**Tag:** `v-substrate-cache-write-patch-K520-8`  
**Budget:** ~60 min

---

## TL;DR

`writeSubstrateCache` existed, was called, and was compiled — but had a **silent `catch {}` that swallowed all runtime errors**. This caused ~40 Bishop gate-blocks across B127. K520.8 adds explicit logging at every step, a round-trip self-test, and briefingText truncation. End-to-end integration test passes: delete → brief_me → file appears (21,567 bytes, schema valid). All 8 D-checks pass.

---

## Root Cause (Phase B)

**Hypothesis #3: silent exception confirmed by elimination.**

| Hypothesis | Status |
|------------|--------|
| Wire-not-called | ❌ Not the cause — grep confirmed call at line 1849 |
| Path mismatch | ❌ Not the cause — homedir() + path.join() resolves correctly on Windows |
| Silent exception | ✅ ROOT CAUSE — bare catch{} swallowed any runtime failure |
| Async/Promise dropped | ❌ Not the cause — function is synchronous void |
| Conditional skip | ❌ Not the cause — no conditional guards on the write |

The function was present in source AND in compiled dist (verified both). The directory `.lb-session` existed with correct permissions (K520.7 files written there). The path resolved identically in both server and gate. The ONLY explanation for the file being absent after many `brief_me` calls: a runtime exception was silently swallowed.

---

## Fix (Phase C)

**File modified:** `librarian-mcp/src/server.ts`

Four changes to `writeSubstrateCache`:

**C.1 Explicit logging** — `console.error` at every step:
- Dir ensured (with target path)
- Gotchas loaded (with count)
- Write attempted (with payload byte count)
- VERIFIED file present (with size) or FAILED (with exception detail)

**C.2 Path normalization** — already used `path.join(homedir(), ...)` + `mkdirSync({ recursive: true })`. Confirmed correct. No change needed.

**C.3 Await** — function is synchronous void; no Promise. Already correct.

**C.4 Schema sanity** — gate reads `ts` (epoch int) and `cached_at` (ISO string). Server writes both. Confirmed match.

**C.5 Round-trip self-test** — added `statSync(target)` after `writeFileSync`. If `size === 0`, throws (caught by outer try/catch with logging). Closes the gap between "called writeFileSync" and "file actually exists on disk."

**Added:** `statSync` to the `fs` import line.

**Added defensive guard:** `briefingText.slice(0, 50_000)` before `JSON.stringify`. Budget-enforced briefings are ~8K chars; this is belt-and-suspenders for pathological callers.

---

## Verification (Phase D) — 8/8 PASS

| Check | Result |
|-------|--------|
| D.1 Delete cache | PASS — file absent before test |
| D.2 Call brief_me via MCP stdio client | PASS — K520.8 logs fired, response received |
| D.3 File exists after call | PASS — 21,567 bytes |
| D.4 Valid JSON, ts recent (<600s) | PASS — ts age=91s, cached_at valid ISO |
| D.5 Gate passes with fresh cache | PASS — gate check: age=0s, fresh=True |
| D.6 Gate blocks stale cache (9h) | PASS — gate check: age=32400s, fresh=False (regression preserved) |
| D.7 Refresh restores gate pass | PASS — ts updated, age=0s, fresh=True |
| D.8 K520.7 bypass files untouched | PASS — founder_test_authority.json + audit.jsonl present |

---

## Files Modified / Created

| File | Action |
|------|--------|
| `librarian-mcp/src/server.ts` | Modified `writeSubstrateCache` — logging, truncation, round-trip test; added `statSync` import |
| `librarian-mcp/dist/server.js` | Rebuilt via `npm run build` |
| `librarian-mcp/test_brief_me_k520_8.mjs` | Created — MCP stdio integration test |
| `librarian-mcp/diag_k520_8.mjs` | Created — standalone path/write diagnostic |
| `librarian-mcp/diag_k520_8b.mjs` | Created — real readTablet + write diagnostic |
| `librarian-mcp-helm-pwa/synapse_K520.8.jsonl` | Created — 5 synapse entries |
| `librarian-mcp/stitchpunks/scribes/scribe_Toolsmith.jsonl` | Appended TS-073 |
| `BISHOP_DROPZONE/00_FOUNDER_REVIEW/AB_TEST_EMPIRICAL_SUBSTRATE_VALIDATION_B127_PROTOCOL.md` | Appended K520.8 status history |
| `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K520.8_B127.md` | This file |

---

## Toolsmith TS-073

**Category:** `claimed_to_ship_that_didnt`  
**Anti-pattern:** silent `catch {}` on disk-write operations.  
**Rule:** every Knight ratification claim of "X wired" must include an end-to-end test: delete target → call tool → verify side-effect exists.  
**Anchor:** K520.6 Phase B.4 claim unverified; B127 ~40 gate-blocks before K520.8.

---

*Knight report by Cursor Agent K520.8. 8/8 verifications pass. The cache wire is now closed. FOR THE KEEP!*
