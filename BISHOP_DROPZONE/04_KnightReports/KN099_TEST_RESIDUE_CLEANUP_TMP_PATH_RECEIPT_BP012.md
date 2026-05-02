# KN099 Receipt — Test-Residue Cleanup (tmp_path in pytest fixtures)
## Closes BP012 finding A2 (test-residue contamination of session_boundary.jsonl)

**Session:** KN099  
**Origin:** BP012 halt receipt §13 finding A2  
**Date:** 2026-05-02  
**Tier:** Sonnet 4.6  
**Fires before:** STUPENDOUS BP015 corrected fire (per BP015 supersede pre-reg §8)

---

## §1 — Phase 1: Files Audited / Prod-Write Count

### Files audited

| File | Prod-path writes found |
|---|---|
| `tests/test_shadow_rebind.py` | **1** — `test_previous_session_ids_capped_at_16` |
| `tests/test_heartbeat_eblet_dir.py` | 0 |

### Audit methodology

Grepped `tests/` for:
- `SESSION_BOUNDARY_JSONL`, `FEDERATION_DIR`, `~/.claude/state/`, `_do_rebind`, `_write_boundary_marker`

### Root cause

`test_previous_session_ids_capped_at_16` called `lc._do_rebind(f"BP{i:03d}", f"BP{i + 1:03d}", 0)` 20 times in a loop **without** patching `SESSION_BOUNDARY_JSONL` or `FEDERATION_DIR`. The `_write_boundary_marker` method uses these module-level constants directly, writing to the production ledger at `~/.claude/state/federation/session_boundary.jsonl`.

All other tests in both files that trigger `_write_boundary_marker` already use `with patch("the_shadow.lifecycle.SESSION_BOUNDARY_JSONL", ...)` context managers — the `test_previous_session_ids_capped_at_16` test was the sole unpatched outlier.

---

## §2 — Phase 2: Fixtures Refactored / Parameterization Mechanism

### Approach chosen: `monkeypatch.setattr` via autouse conftest fixture

**Mechanism:** The `monkeypatch` pytest fixture reverts all `setattr` patches automatically after each test, providing function-scoped isolation with zero test-code boilerplate.

### Files created/modified

#### `tests/conftest.py` _(NEW)_

Added `_isolate_prod_paths(monkeypatch, tmp_path)` as an **`autouse=True`** fixture. Applied to every test in `tests/` automatically. Patches three module-level constants in `the_shadow.lifecycle`:

```
FEDERATION_DIR         → tmp_path / "federation"
SESSION_BOUNDARY_JSONL → tmp_path / "federation" / "session_boundary.jsonl"
SESSION_FILE_PATH      → tmp_path / "current_session_name.txt"
```

This is defense-in-depth: any future test that calls `_do_rebind` or `_write_boundary_marker` without an explicit patch is still isolated.

#### `tests/test_shadow_rebind.py` — `test_previous_session_ids_capped_at_16` _(MODIFIED)_

Added explicit `tmp_path` and `monkeypatch` parameters. Added explicit `monkeypatch.setattr` for `FEDERATION_DIR` and `SESSION_BOUNDARY_JSONL` — both as documentary layer and as second-layer defence if conftest isolation were ever removed.

**Why double-layer?** The autouse conftest covers it globally; the explicit in-test patch documents the specific dependency and makes the isolation intent visible at the call site.

---

## §3 — Phase 3: Cleanup Operation

### Discovery discrepancy vs. BP012 receipt

BP012 identified "5 contaminating lines" (BP016→BP017→...→BP020) because the ledger was examined at a point when only lines 17–21 matched the filter. By the time KN099 executed, **11 additional pytest runs** had each deposited 20 more lines, bringing the total contamination to **220 lines** (11 runs × 20 lines/run).

### Contamination filter used

```
scribe_id == "R11_shadow_alpha" AND rebind_latency_ms == 0
```

This precisely matches only test-synthetic entries:
- All 220 contaminating lines: `R11_shadow_alpha`, `latency=0`, synthetic BP000→BP020 sequences
- Zero legitimate entries matched (all legitimate R11_shadow_alpha lines have `latency > 0`)

### Backup

```
~/.claude/state/federation/session_boundary.jsonl.bak_pre_KN099
SHA-256: 54f6bc40764dbc0b3eee337044ff7daf5c69536d0930b94c575a615d31e0b886
```

### Line counts

| Metric | Count |
|---|---|
| Pre-clean lines | 234 |
| Lines removed (contaminating) | 220 |
| Lines kept (legitimate) | 14 |
| Post-clean lines | 14 |

### Verification: KN097 Phase 7 cohort rebind (8 lines BP013→BP012) PRESERVED ✓

```
R11_shadow_alpha   latency=1161ms  BP013→BP012
R11_shadow_beta    latency=1209ms  BP013→BP012
R11_shadow_delta   latency=1225ms  BP013→BP012
R11_shadow_gamma   latency=1225ms  BP013→BP012
R11_shadow_epsilon latency=1256ms  BP013→BP012
R11_shadow_zeta    latency=1256ms  BP013→BP012
R11_shadow_theta   latency=1271ms  BP013→BP012
R11_shadow_eta     latency=1271ms  BP013→BP012
```

### Additional legitimate lines preserved (KN098 Phase 5 cohort, BP012→BP015, 6 lines)

```
R11_shadow_alpha   latency=1644ms  BP012→BP015
R11_shadow_zeta    latency=1771ms  BP012→BP015
R11_shadow_delta   latency=1771ms  BP012→BP015
R11_shadow_theta   latency=1771ms  BP012→BP015
R11_shadow_epsilon latency=1819ms  BP012→BP015
R11_shadow_gamma   latency=2025ms  BP012→BP015
```

Note: beta (pos 2) and eta (pos 7) are absent from the BP012→BP015 cohort — consistent with these two positions not being active during that real-system rebind event.

---

## §4 — Phase 4: Isolation Verification Log

**Method:** Python script `kn099_phase4_verify.py` snapshots prod ledger SHA-256 + mtime before invoking `pytest tests/`, then asserts equality after.

```
[BEFORE] mtime=1777722805.482711  sha256=6750c80e235d305e...  lines=14
--- pytest exit code: 0 ---
[AFTER]  mtime=1777722805.482711  sha256=6750c80e235d305e...  lines=14

PASS — prod ledger UNCHANGED across pytest run.
  SHA-256: 6750c80e235d305e2282743b1fdba9d76c84a7a086f720615480effabf6515df
  mtime:   1777722805.482711
  lines:   14
```

**Pytest result:** 33 passed, 1 skipped (SIGHUP unavailable on Windows — expected)

---

## §5 — Phase 5: New Tests

### File added: `tests/test_prod_ledger_isolation.py`

#### `test_fixture_isolates_boundary_writes`

- **Setup:** snapshot prod ledger hash
- **Body:** instantiate `ShadowLifecycle`, call `_do_rebind` 5 times with `latency_ms=0` (the exact scenario that caused the KN097 contamination)
- **Teardown:** assert prod ledger hash unchanged
- **Bonus assertion:** verifies that the 5 markers went to the `tmp_path` ledger instead

#### `test_no_alpha_zero_latency_in_prod_ledger`

- Reads the prod ledger and asserts zero `R11_shadow_alpha + rebind_latency_ms==0` entries
- Self-documenting regression gate: if a future test run contaminates the ledger, this test will fail on the next run, immediately surfacing the problem

**Both tests pass:** `2 passed in 0.05s`

---

## §6 — Pre-Fire Verification Protocol for Bishop (Phase 7-bis steps for BP015 supersede §8)

Before Bishop fires BP015 corrected:

1. **Pull latest from `main`** — KN099 commit must be visible
2. **Verify prod ledger line count:** `python -c "from pathlib import Path; print(len(Path.home().joinpath('.claude/state/federation/session_boundary.jsonl').read_text().splitlines()))"` — must return `14` (or any number > 0 if legitimate prod events have since added lines; must NOT include the BP000→BP020 synthetic pattern)
3. **Run full pytest:** `python -m pytest tests/ -v` — must be 33 passed, 1 skipped (SIGHUP skip is Windows-expected)
4. **Run Phase 4 verify script:** `python kn099_phase4_verify.py` — must print `PASS — prod ledger UNCHANGED across pytest run`
5. **Check tag:** `git tag | Select-String v-test-residue-cleanup-KN099` — must exist
6. **Confirm backup exists:** `Test-Path "$HOME\.claude\state\federation\session_boundary.jsonl.bak_pre_KN099"` — must be `True`

---

## §7 — Surfaced Gaps (No-Unasked-Scope)

No additional tests writing to prod paths beyond the boundary-marker case were found in `tests/`. The audit of `tests/test_heartbeat_eblet_dir.py` found all writes go to `tmp_path`-based directories.

Potential gap noted for follow-up (NOT expanded here): `kn099_cleanup.py` and `kn099_phase4_verify.py` are utility scripts at the workspace root. They are not production code; they can be cleaned up or moved to a `scripts/` subdirectory in a future session.

---

## §8 — Acceptance Criteria Verification

| Criterion | Status |
|---|---|
| All `tests/` files that previously wrote to prod paths now use `tmp_path` | ✅ `conftest.py` autouse + explicit in `test_previous_session_ids_capped_at_16` |
| Existing 220 contaminating lines removed from `session_boundary.jsonl` | ✅ 234 → 14 lines |
| Backup created at `session_boundary.jsonl.bak_pre_KN099` | ✅ SHA-256 verified |
| 8 BP013→BP012 cohort-rebind lines preserved | ✅ All 8 in retained 14 |
| Full pytest suite green (34 from KN097+KN098+KN099) | ✅ 33 passed, 1 skipped |
| Empirical Phase 4 verification: mtime + hash unchanged | ✅ Confirmed |
| Receipt filed at `04_KnightReports/KN099_*_RECEIPT_BP012.md` | ✅ This file |
| Commit tagged `v-test-residue-cleanup-KN099` | ✅ (see commit below) |
| No `--no-verify` | ✅ KN-lineage discipline holds |

---

*KN099 complete. FOR THE KEEP!*
