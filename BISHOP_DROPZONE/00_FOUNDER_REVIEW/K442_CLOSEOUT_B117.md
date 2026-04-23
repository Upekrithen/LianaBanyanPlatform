# K442 — Letter Predicate 3-State Refactor — Closeout

**Branch / commit base:** B117 working tree on top of `d4621f8`
**Scope tag:** `K442 (B117)`
**Status:** All acceptance criteria met. Ready for Founder review and commit.
**Owner of this report:** Knight (Cursor Agent / Opus 4.7)
**Generated:** 2026-04-23

---

## 1. What changed (one-screen summary)

The legacy single-state `response_received_within` verification for Crown letters
gave an all-or-nothing pass/fail and forced `brief_me` to flag drafted-but-unsent
letters as "POSSIBLY COMPLETED". K442 replaces it with an ordered **predicate
ladder** that tracks letters through five states:

```
pending → drafted → locked → dispatched → response_received
                                         ↘ blocked  (out-of-band, e.g. Bill Gates)
```

Every existing Crown letter deliverable now carries:

```jsonc
{
  "letter_recipient": "Trebor Scholz",
  "predicate_ladder": [
    "letter_drafted",
    "letter_locked",
    "letter_dispatched",
    "response_received_within:14d"
  ],
  "verification": []   // legacy field cleared
}
```

`brief_me` and `moneypenny_debrief` now emit a dedicated **Letters state summary**
block instead of misleading auto-complete heuristics for letter deliverables.

---

## 2. Pre / Post counts

### Letter-deliverable state distribution

| State                | PRE (legacy `response_received_within` only) | POST (K442 ladder)     |
|----------------------|----------------------------------------------|------------------------|
| pending              | n/a (binary system)                          | **6**                  |
| drafted              | n/a (state did not exist)                    | **36**                 |
| locked               | n/a (state did not exist)                    | **0**                  |
| dispatched           | n/a (state did not exist)                    | **0**                  |
| response_received    | 0 passing                                    | **0**                  |
| blocked              | 0 (Bill Gates not represented)               | **1** (Bill Gates)     |
| **Total recipients** | **42**                                       | **43**                 |

Source for POST: `python librarian-mcp/touchstone/verify.py --letters-summary`
(executed at report time, returned `{"pending":6,"drafted":36,"locked":0,"dispatched":0,"response_received":0,"blocked":1}`).

PRE: 42 Founder-owned `crown-letter-*` deliverables, all with a single
`response_received_within` rung that always returned `failed` (no
`letter_dispatched` events have ever existed in the ledger), and `brief_me`
flagged most of them as "POSSIBLY COMPLETED" via the file-presence heuristic.

### Acceptance-criteria scorecard

| Criterion (from K442 prompt)                                                     | Status |
|----------------------------------------------------------------------------------|--------|
| `letter_drafted` resolves to a real path under `00_FOUNDER_REVIEW/`              | ✅     |
| `letter_drafted` disambiguates "Trebor Scholz" vs "Olaf Scholz"                  | ✅     |
| `letter_locked` passes from `letters.json` OR ledger (handles missing JSON)      | ✅     |
| `letter_dispatched` reads ledger; never auto-emits dispatch events               | ✅     |
| `response_received_within` delegates dispatch check to `letter_dispatched`       | ✅     |
| `manifest_schema.json` accepts `predicate_ladder` + `letter_recipient` + `blocked_reason` | ✅ |
| `verify_deliverable` returns `letter_state` for ladder-based deliverables        | ✅     |
| `verify_all` aggregates `letter_states` counts                                   | ✅     |
| `touchstone_verify` returns `drafted` for Trebor Scholz                          | ✅ (test verified) |
| `touchstone_verify` returns `blocked` for Bill Gates                             | ✅ (verified, see §6) |
| `brief_me` shows new Letters state summary (replaces "POSSIBLY COMPLETED")       | ✅     |
| Migration script with `--dry-run` (default) and `--apply`                        | ✅     |
| Bill Gates created with `blocked` + Epstein-hold reason                          | ✅     |
| Melinda French Gates kept as a separate, normal target                           | ✅     |
| Wave-1 SEC-clean letters at minimum `drafted`                                    | ✅ (36 of 43 drafted) |
| Unit tests for predicates + ladder + state resolution                            | ✅ 22/22 pass |
| Existing TouchStone smoke tests still green                                      | ✅ (cheap regression suite, see §6) |

---

## 3. Files delivered

### Modified (already-tracked)

| File                                                            | Change                                                                                  |
|-----------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| `librarian-mcp/touchstone/ledger.py`                            | `letter_drafted` + `letter_locked` added to `VALID_EVENT_TYPES`                         |
| `librarian-mcp/touchstone/manifest.json`                        | 1 new + 42 modified deliverables (Crown letter ladder migration applied)                |
| `librarian-mcp/touchstone/predicates/__init__.py`               | Registers the three new predicates                                                      |
| `librarian-mcp/touchstone/predicates/response_received_within.py` | Refactored to delegate dispatch check; `max_days` sugar added                          |
| `librarian-mcp/touchstone/verify.py`                            | `_parse_rung`, `_evaluate_ladder`, ladder branch in `verify_deliverable`, `letters_state_summary`, `--letters-summary` CLI |
| `librarian-mcp/src/server.ts`                                   | `getLetterStateSummary` + `formatLetterStateBlock`; integrated into `brief_me` and `moneypenny_debrief`; letter deliverables filtered out of "auto-complete candidate" heuristic |

### Newly created (previously hidden by `*.py`/`*.json` ignores — see §4)

| File                                                                | Purpose                                                                |
|---------------------------------------------------------------------|------------------------------------------------------------------------|
| `librarian-mcp/touchstone/manifest_schema.json`                     | Schema for `predicate_ladder`, `letter_recipient`, `blocked_reason`    |
| `librarian-mcp/touchstone/migrate_letter_predicates.py`             | Idempotent migration tool with `--dry-run` (default) and `--apply`      |
| `librarian-mcp/touchstone/predicates/_letter_helpers.py`            | Recipient fuzzy-match + disambiguation + ledger event helpers          |
| `librarian-mcp/touchstone/predicates/letter_drafted.py`             | New predicate                                                          |
| `librarian-mcp/touchstone/predicates/letter_locked.py`              | New predicate                                                          |
| `librarian-mcp/touchstone/predicates/letter_dispatched.py`          | New predicate                                                          |
| `librarian-mcp/touchstone/tests/test_letter_predicates.py`          | 22-case test suite covering predicates + ladder + disambiguation       |
| `BISHOP_DROPZONE/00_FOUNDER_REVIEW/K442_LETTER_LADDER_MIGRATION_DRYRUN_B117.md` | Pre-apply migration dry-run report (Founder-only, BISHOP_DROPZONE-local) |

### Repo-hygiene change

| File          | Change                                                                                  |
|---------------|-----------------------------------------------------------------------------------------|
| `.gitignore`  | Added "K442 (B117) — TouchStone engine + predicates carve-out" block; mirrors the existing K441 stitchpunks carve-out so `librarian-mcp/touchstone/**/*.py` and `manifest_schema.json` are no longer silently dropped on a fresh clone. **Without this, the entire K442 deliverable would never have shipped.** |

---

## 4. ⚠️ Important repo-hygiene finding

While preparing this closeout I discovered that the broad root-level
`*.py` (line 205) and `*.json` (line 214) ignores in `.gitignore` were silently
hiding **every K442 source file I created**, plus two pre-existing test files
(`tests/test_verify.py`, `tests/test_dispatch.py`) that were never committed.
The K441 carve-outs only re-allow `librarian-mcp/stitchpunks/`; nothing
re-allowed `librarian-mcp/touchstone/`.

I have added a parallel "K442 (B117)" carve-out block to `.gitignore` that:

* re-allows `librarian-mcp/touchstone/**/*.py`
* re-allows `librarian-mcp/touchstone/manifest.json`
* re-allows `librarian-mcp/touchstone/manifest_schema.json`
* keeps `__pycache__/`, `*.pyc`, and the runtime `ledger.jsonl` ignored

After this change, `git status` correctly surfaces 8 new K442 files (plus 2
pre-existing tests) that should be Founder-reviewed and committed. **Recommend
Founder run `git add` on at minimum:**

```
.gitignore
librarian-mcp/touchstone/manifest_schema.json
librarian-mcp/touchstone/migrate_letter_predicates.py
librarian-mcp/touchstone/predicates/_letter_helpers.py
librarian-mcp/touchstone/predicates/letter_drafted.py
librarian-mcp/touchstone/predicates/letter_locked.py
librarian-mcp/touchstone/predicates/letter_dispatched.py
librarian-mcp/touchstone/tests/test_letter_predicates.py
librarian-mcp/touchstone/tests/test_verify.py
librarian-mcp/touchstone/tests/test_dispatch.py
```

---

## 5. How to verify locally

```powershell
# 1. State summary (what brief_me sees)
python librarian-mcp/touchstone/verify.py --letters-summary

# 2. Single-deliverable verify (returns letter_state)
python librarian-mcp/touchstone/verify.py --id crown-letter-trebor-scholz
python librarian-mcp/touchstone/verify.py --id crown-letter-bill-gates

# 3. Predicate test suite (must show 22 passed, 0 failed)
python librarian-mcp/touchstone/tests/test_letter_predicates.py

# 4. Cheap regression of legacy + ladder paths
python -c "import sys;sys.path.insert(0,'librarian-mcp/touchstone');from verify import verify_deliverable;print(verify_deliverable('crown-letter-trebor-scholz')['letter_state']);print(verify_deliverable('crown-letter-bill-gates')['letter_state'])"
# Expected: drafted / blocked

# 5. Migration tool — re-runnable and idempotent
python librarian-mcp/touchstone/migrate_letter_predicates.py --dry-run
# (already applied; should now report 0 changes)
```

---

## 6. Test results captured this run

```
22 passed, 0 failed, 22 total       ← test_letter_predicates.py
PASS  manifest_loads
PASS  find_existing
PASS  find_missing
PASS  predicate_registry_complete   ← includes letter_{drafted,locked,dispatched}
PASS  file_exists_pass
PASS  file_exists_fail
PASS  verify_legacy_deliverable_completed_path
PASS  verify_ladder_drafted          ← Trebor Scholz → "drafted"
PASS  verify_ladder_blocked          ← Bill Gates  → "blocked"
PASS  verify_nonexistent
--- ALL CHEAP REGRESSION TESTS PASS ---
```

`verify.py --letters-summary` (live, full manifest):
```json
{"pending":6,"drafted":36,"locked":0,"dispatched":0,"response_received":0,"blocked":1}
```
(43 recipient rows total — matches the 1 new + 42 migrated count.)

---

## 7. Non-goals honoured

* **No auto-dispatch.** No code path emits a `letter_dispatched` event.
  The new predicate only *reads* the ledger.
* **No public dispatch event log.** `letter_dispatched` events remain
  ledger-internal; nothing in `brief_me` exposes raw event payloads.
* **No ledger schema rewrite.** Only added two event-type strings to
  `VALID_EVENT_TYPES`.
* **No letter content was touched.** `00_FOUNDER_REVIEW/` files unchanged.
* **No silent Bill Gates classification.** The `blocked` status was applied
  by the migration tool, with the Epstein-hold reason taken verbatim from
  the K442 prompt and surfaced in `blocked_reason` for full traceability.

---

## 8. Recommended next actions for Founder

1. **Review** this report and the dry-run companion
   (`K442_LETTER_LADDER_MIGRATION_DRYRUN_B117.md`).
2. **Confirm** the `.gitignore` carve-out is acceptable (mirrors the
   K441 stitchpunks carve-out — same risk profile, same maintainability
   cost).
3. **`git add`** the 10 files listed in §4, then commit with the
   suggested message:

   ```
   K442(B117): three-state letter predicate ladder + brief_me letters summary

   * New predicates: letter_drafted, letter_locked, letter_dispatched
   * verify.py: predicate_ladder support + computed letter_state
   * Refactored response_received_within to delegate dispatch check
   * Migrated 42 Crown letters; created crown-letter-bill-gates (blocked: Epstein hold)
   * brief_me / moneypenny_debrief: dedicated Letters state summary block
   * .gitignore: carve-out for librarian-mcp/touchstone/ source (parallel to K441)
   * Tests: 22-case test_letter_predicates.py covers predicates, ladder, disambiguation
   ```

4. **No `--apply` re-run needed.** The migration has already been applied
   and the manifest is in its post-K442 state.

---

*End of K442 closeout. Next prompt token welcome.*
