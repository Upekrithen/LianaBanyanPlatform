# K463 Handoff Report — Max-Session-Number Swap
## B121, 2026-04-23

---

## Summary

`knightSessions` and `bishopSessions` in the UI hook now reflect the **highest K# / B# session number seen across all artifact sources** (filenames + sessions.json + git tags), not a count of uniquely-named files. The numbers jump from 54/52 (K462 pattern-filtered counts) to **466/121** — matching actual session intuition.

---

## Before / After

| Metric | Before (K462) | After (K463) |
|--------|---------------|--------------|
| `knightSessions` hook value | 54 (count of unique PROMPT_KNIGHT_K<NNN> files) | **466** (max K# across all artifact sources) |
| `bishopSessions` hook value | 52 (count of unique B# filenames) | **121** (max B# across all artifact sources) |

---

## Diagnostic Fields Preserved (three-tier layering)

Per K463 constraint, the three-tier stack remains intact:

| Field | Semantics | UI-facing? |
|-------|-----------|------------|
| `knightSessionsMcpLogged` | Count of K-sessions that explicitly called `update_session` | No (diagnostic) |
| `knightPromptCount` | Count of unique K-numbers in `PROMPT_KNIGHT_K<NNN>_*.md` filenames | No (diagnostic) |
| `knightSessionMax` | **Max K# across filenames + sessions.json + git tags** | **Yes (new, K463)** |
| `bishopSessionsMcpLogged` | Count of B-sessions that called `update_session` | No (diagnostic) |
| `bishopSessionCount` | Count of unique B-numbers in dropzone filenames | No (diagnostic) |
| `bishopSessionMax` | **Max B# across filenames + sessions.json + git tags** | **Yes (new, K463)** |

---

## Spot-Check: Shell vs Indexer

Shell spot-check:
- Max K# from `BISHOP_DROPZONE/01_KnightPrompts/` filenames: **466** (`PROMPT_KNIGHT_K466_B121_SCRIBE_CORPUS_MODE.md`)
- Max B# from both dropzone directories: **121** (multiple B121 files)

Indexer output in `index/overview.json`:
- `knightSessionMax`: **466** ✓
- `bishopSessionMax`: **121** ✓

**Match confirmed.**

Git tags contribution: max K# from tags = 462 (K999 ghost excluded by the ≤900 cap). Filenames dominate. Max B# from tags = 116 (`v-scev1-b116`). Filenames dominate at 121.

---

## Edge Cases and Observations

1. **K999 ghost anchor** — `v-ghost-anchor-k999-delete-K459` was a git tag that would have produced K999 as the max. Fixed by filtering out session numbers > 900 (`MAX_REALISTIC_SESSION = 900`). The prompt files don't have a K999 file, so the filename scan was never affected.

2. **K455c / K455a / K455b** — The regex `PROMPT_KNIGHT_K(\d+)` matches only the leading digit sequence in filenames. `PROMPT_KNIGHT_K455c_*` matches `K455` (not K455c), so it doesn't pollute the count or the max. Correct behavior.

3. **sessions.json** — Current sessions.json uses plain numeric IDs (1-261), not K/B-prefix IDs. No K/B entries were found; the scan is correct and future-safe if K/B IDs are ever adopted.

4. **File-mutation test races** — `test_canonical_codegen.mjs` and `test_canonical_verify.mjs` mutate real filesystem files (`overview.json`, `useCanonicalStats.ts`). Running both in a single `node --test ...` call produces race conditions. Per `feedback_tests_mutating_real_files_serial.md`, they must be run serially. All 11 tests pass when run serially (6 codegen + 5 verify).

---

## Files Changed

| File | Change |
|------|--------|
| `librarian-mcp/src/indexer/buildIndex.ts` | Add `child_process.execSync` import; keep `knightPromptCount`/`bishopSessionCount` as diagnostic; add `knightSessionMax`/`bishopSessionMax` computed from filenames + sessions.json + git tags; filter K999-class ghost IDs (> 900 cap) |
| `librarian-mcp/src/types.ts` | Add `knightSessionMax`/`bishopSessionMax` type declarations (alongside preserved `knightPromptCount`/`bishopSessionCount`) |
| `librarian-mcp/scripts/codegen-canonical-hook.mjs` | Swap `OVERVIEW_FIELD_MAP` sources from `knightPromptCount`/`bishopSessionCount` → `knightSessionMax`/`bishopSessionMax` |
| `librarian-mcp/scripts/verify-canonical.mjs` | Swap `OVERVIEW_ONLY_FIELDS` sources; update label from K462 → K463 |
| `librarian-mcp/tests/test_canonical_codegen.mjs` | Update test D (stale session rewrite) and test F (McpLogged isolation) to reference new field names |
| `librarian-mcp/tests/test_canonical_verify.mjs` | Update test D (drift detection) to reference `knightSessionMax` |
| `platform/src/hooks/useCanonicalStats.ts` | Update `DEFAULTS`: `knightSessions: 54 → 466`, `bishopSessions: 52 → 121`; also restore `founderAge: 53` (was corrupted to 999 by a prior test run that didn't clean up) |

---

## Test Results

Run serially (required for real-file-mutating tests):

```
test_canonical_codegen.mjs:  6/6 pass
test_canonical_verify.mjs:   5/5 pass
```

verify:canonical: ✓ All canonical surfaces agree.

---

## Commit + Tag

Tag: `v-max-session-number-swap-K463`
