# K452 Session-Gap Diagnostic — Report

_Authored by Knight K452 (Cursor / Sonnet 4.6), 2026-04-23. Diagnostic-only. No code changed._

---

## Where the counter lives

**Computation:** `librarian-mcp/scrambler/staleness.py`, function `detect_session_gaps()` (line 42).

The function reads `librarian-mcp/index/sessions.json` (the in-process session index). It groups every session entry by agent-prefix letter (B, K, etc.), finds the min and max numeric ID per prefix, then reports every integer in that range that has no matching entry as a "gap". The resulting list length is the 758 figure.

**Plumbing chain:**

1. `staleness.py:detect_session_gaps()` → returns a list of gap dicts
2. `scrambler/reconcile.py` calls it and stores `"session_gaps": len(session_gaps)` inside the `"staleness"` key of the reconciliation result
3. `src/server.ts:runTripleScrambler()` (line ~1460) calls `reconcile.py` and caches the result for 5 minutes
4. `src/server.ts:formatVerificationSection()` (line 1508) renders `Session gaps: ${st.session_gaps || 0}` — this is the line every `brief_me` call displays

**Input:** `librarian-mcp/index/sessions.json` — 262 session entries at time of diagnostic.

---

## 20-row sample with gap class

First 10 (chronologically first in the sorted gap list):

| # | Missing ID | Prefix | Between | Class | Root cause |
|---|-----------|--------|---------|-------|------------|
| 1 | B042 | B | B41 and B43 | cross_prefix | `K154-B041-sync` injects B:41 into B namespace; min pushed from 51 to 41 |
| 2 | B043 | B | B42 and B44 | cross_prefix | same |
| 3 | B044 | B | B43 and B45 | cross_prefix | same |
| 4 | B045 | B | B44 and B46 | cross_prefix | same |
| 5 | B046 | B | B45 and B47 | cross_prefix | same |
| 6 | B047 | B | B46 and B48 | cross_prefix | same |
| 7 | B048 | B | B47 and B49 | cross_prefix | same |
| 8 | B049 | B | B48 and B50 | cross_prefix | same |
| 9 | B050 | B | B49 and B51 | cross_prefix | same |
| 10 | B063 | B | B62 and B65 | skipped_within_range | B063–B064 never created; numbering jumped |

Last 10 (most recent in sorted gap list, all K-prefix):

| # | Missing ID | Prefix | Between | Class | Root cause |
|---|-----------|--------|---------|-------|------------|
| 11 | K989 | K | K988 and K990 | ghost_anchor | K999 test entry inflates K max from 422 to 999 |
| 12 | K990 | K | K989 and K991 | ghost_anchor | same |
| 13 | K991 | K | K990 and K992 | ghost_anchor | same |
| 14 | K992 | K | K991 and K993 | ghost_anchor | same |
| 15 | K993 | K | K992 and K994 | ghost_anchor | same |
| 16 | K994 | K | K993 and K995 | ghost_anchor | same |
| 17 | K995 | K | K994 and K996 | ghost_anchor | same |
| 18 | K996 | K | K995 and K997 | ghost_anchor | same |
| 19 | K997 | K | K996 and K998 | ghost_anchor | same |
| 20 | K998 | K | K997 and K999 | ghost_anchor | same |

---

## Histogram of 758 gaps

```
ghost_anchor:         576  (76.0%)
skipped_within_range: 173  (22.8%)
cross_prefix:           9  ( 1.2%)
no_end:                 0  ( 0.0%)
no_start:               0  ( 0.0%)
unknown:                0  ( 0.0%)
─────────────────────────────────
TOTAL:                758
```

**ghost_anchor (576):** A single sessions.json entry — `K999`, recorded on 2026-04-11 with summary "Test session with no real changes" and no files changed — pushes the K namespace maximum from K422 to K999. Every integer K423–K998 (576 values) is therefore flagged as a gap.

**skipped_within_range (173):** Within the real K range (K101–K422): 158 numeric skips where a session ID was simply never created. Within the real B range (B51–B113): 15 skips. A small sub-set (~6) are caused by non-standard ID formats (`KNIGHT_136`, `knight-153`, `knight-165`, `knight-205`, `K391_K392` → only K391 captured, `K398_K399` → only K398 captured) where the parser fails to extract the number and the session appears missing even though a record exists.

**cross_prefix (9):** The ID `K154-B041-sync` is a Knight session whose hyphenated segment `B041` is extracted by the gap detector and added to the B namespace. This drops B's effective minimum from 51 to 41, creating phantom gaps B042–B050.

---

## Root cause ranking — cheapest to most expensive

### 1. ghost_anchor — effort: 2 min — risk: zero — drops count by ~576

**What:** Delete or rename the `K999` entry from `librarian-mcp/index/sessions.json`.  
**How:** The entry is `{"id": "K999", "date": "2026-04-11", "summary": "Test session with no real changes", ...}`. Remove it (or change the ID to `K422-test` or similar so it doesn't create a runaway anchor).  
**Risk:** None. The entry is explicitly labeled a test with no files changed, no migrations, no functions.  
**Blast radius:** Zero. No canonical values, no deliverables, no ledger events reference K999.  
**Result:** 758 → 182.

---

### 2. cross_prefix — effort: 15 min, ~5 LOC — risk: low — drops count by ~9

**What:** Fix `detect_session_gaps()` in `staleness.py` (lines 57–68) to ignore cross-prefix numbers when parsing hyphenated IDs.  
**How:** When iterating over `-`-split parts, only register a number if its extracted prefix matches the _outer_ session's own prefix (the first character of `sid`). Example: for `K154-B041-sync`, only `K154` should be registered under `K`; `B041` should be skipped.  
**Risk:** Low. Pure detection logic; no schema or ledger change. Fixes future contamination too (`K357-B086-session`, `K-B088-batch`).  
**Blast radius:** Zero.  
**Result (after fix #1):** 182 → 173.

---

### 3. skipped_within_range / malformed-ID sub-class — effort: 30 min, ~10 LOC — risk: low — drops count by ~6

**What:** Fix the parser to handle non-standard ID formats: `KNIGHT_136` (should yield K136), `knight-153/165/205` (case-insensitive prefix), and `K391_K392` / `K398_K399` (underscore-joined multi-session IDs, should yield both numbers).  
**How:** In the no-dash branch of `detect_session_gaps()`, add a secondary regex `r'([A-Za-z]+)[\-_]?(\d+)'` applied case-insensitively, and split underscore-joined IDs the same way dashes are split.  
**Risk:** Low. Parsing only; no data changed.  
**Result (after #1+#2):** 173 → ~167.

---

### 4. skipped_within_range / genuine numeric skips — effort: 2–4 hrs — risk: medium — drops count by ~167

**What:** The remaining ~167 gaps are genuinely unused session numbers (the founding sessions started at K101, skipped liberally, used combined IDs like `K101-K102-K103`, etc.). The current definition of "gap" — _any integer in [min, max] that is absent_ — treats all of these as problems even though they are by design.  
**Options:**  
  a. **Redefine the metric:** Replace numeric-range gaps with ledger-based gaps — a "gap" becomes a session that fired `session_start` but has no `session_end` event. Requires auditing the ledger schema and updating `staleness.py`, `reconcile.py`, and the `brief_me` display string.  
  b. **Accept as noise:** Add a configurable floor (e.g., only flag if >N consecutive missing IDs) or a `known_gaps` allow-list in the scrambler config.  
**Risk:** Medium. Changes what "session gaps" semantically means; touches three files. Wrong threshold choice could hide real gaps.  
**Blast radius:** `staleness.py` + `reconcile.py` + `server.ts` display — no canonical memory touched.  
**Result (after #1+#2+#3):** ~167 → 0 (option a) or ~167 → threshold-dependent (option b).

---

## Recommended K453 scope

Fix ghost_anchor first: delete (or rename) the `K999` entry from `sessions.json`. This single one-line JSON edit drops the count from 758 to 182 with zero risk. Then fix cross_prefix in `staleness.py` (5 LOC) to drop 9 more. If 173 is acceptable noise, stop. If the target is <100, K454 should tackle the metric redefinition (option 4a or 4b) after Bishop approves the new definition.

---

## What I didn't investigate (flagged for Bishop)

- Whether the `k` (lowercase) prefix namespace (`knight-153`, `knight-165`, `knight-205`) is being tracked anywhere — it appears as a third prefix in the sessions index and is silently ignored by gap detection because only uppercase prefixes are used in the loop. Three sessions may be invisible to all reconciliation tooling.
- Whether any other sessions with very high IDs (e.g., a future test using K500 or B200) could regenerate the ghost_anchor problem. No guard currently prevents it.
- The 15 within-range B gaps were not individually verified against Bishop handoff notes — it's possible some of those numbers correspond to sessions that ran under non-standard IDs and are genuinely present but parsed as absent.

---

Done. Histogram produced. Top-1 fix (delete K999) would drop count by ~576, from 758 to 182. No code changed.
