# KN098 Receipt — Heartbeat-Eblet Directory Parameterization
**Session:** KN098 (Knight)
**Origin:** BP012 halt receipt §13 finding A.bonus
**Date:** 2026-05-02
**Tag:** `v-heartbeat-eblet-dir-param-KN098`
**Commit discipline:** 66th consecutive clean (no --no-verify)

---

## 1. Files Modified + Diff Summary

### `the_shadow/lifecycle.py`

| Change | Detail |
|---|---|
| Module docstring heartbeat/checkpoint path examples | Replaced `BP011` with `<session_id>` |
| `EBLET_BP011_DIR` constant | Kept as historical alias (no longer a write target); introduced `_HEARTBEAT_EBLET_BASE` |
| `__init__` default `eblet_root` | Was `EBLET_BP011_DIR`; now `_HEARTBEAT_EBLET_BASE` |
| New `_eblet_dir` property | Returns `self.eblet_root / self._state.session_id` |
| `heartbeat_path` property | Now uses `self._eblet_dir` |
| `shared_ledger_path` property | Now uses `self._eblet_dir` |
| `_checkpoint_path()` | Now uses `self._eblet_dir` |
| `_write_heartbeat()` | Captures `hb_path` inside `_state_lock` (path + content agree on same session_id) |
| `_do_rebind()` | `mkdir` new session dir BEFORE `_state.session_id = new_session`, inside `_state_lock` |
| `start()` | Uses `self._eblet_dir.mkdir(...)` instead of `self.eblet_root.mkdir(...)` |
| `simulate_bishop_refresh()` | Uses `self._eblet_dir` |
| `_scan_ledger_for_bishop_ids` docstring | "shared BP011 ledger" → "shared session ledger" |
| Bishop-refresh monitor class docstring | "shared BP011 ledger" → "shared session ledger" |
| `_run_daemon()` PID file | Was `EBLET_BP011_DIR / f"pid_..."`, now `lc.eblet_root / session_id / f"pid_..."` |
| `_verify_heartbeats()` | Added `session_id` parameter; derives dir from `_HEARTBEAT_EBLET_BASE / session_id` |
| `main()` session resolution | `--session` default changed to `None`; auto-reads `current_session_name.txt`; falls back to `BP011` |

### `tests/test_shadow_rebind.py`

| Change | Detail |
|---|---|
| `tmp_eblet_root` fixture | Changed `d = tmp_path / "eblets" / "BP011"` → `d = tmp_path / "eblets"` (base dir, no session subdir) |

### `tests/test_heartbeat_eblet_dir.py` _(new file)_

See §2.

---

## 2. Tests Added + Green Count

**New file:** `tests/test_heartbeat_eblet_dir.py`

| Test | Covers |
|---|---|
| `test_heartbeat_path_uses_session_directory` | `heartbeat_path` property points into session-scoped subdir |
| `test_heartbeat_write_lands_in_session_directory` | Real write for BP015 → file exists in `BP015/`; no `BP011/` created |
| `test_start_creates_session_directory` | `start()` mkdirs session-scoped directory |
| `test_rebind_creates_new_session_directories` | Rebind chain BP013→BP012→BP015 creates three distinct dirs |
| `test_rebind_dir_exists_before_next_heartbeat` | `_do_rebind` mkdir is atomic with session_id update |
| `test_concurrent_8_daemon_writes_no_race` | 8 daemons shared BP015 dir, no race — all 8 files written |
| `test_concurrent_8_daemon_writes_distinct_sessions` | 8 daemons, 8 sessions — no cross-contamination |

**Full test run result:**
```
31 passed, 1 skipped in 7.42s
```
- 24 from KN097 still passing (regression clean)
- 7 new KN098 tests all green
- 1 skip: `test_sighup_triggers_reread` (SIGHUP unavailable on Windows — known platform skip)

---

## 3. Empirical Verification Log (Phase 6)

### Setup

```powershell
# Record BP011 file count before restart
$bp011_before = (Get-ChildItem "$HOME\.claude\state\eblets\BP011" -File).Count
# Result: BP011 files before: 53

# Flip session file to BP015
Set-Content "$HOME\.claude\state\current_session_name.txt" "BP015"
```

### Start 8 Daemons

```powershell
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform"
for ($i = 1; $i -le 8; $i++) {
    $proc = Start-Process -FilePath "python" `
        -ArgumentList "-m the_shadow.lifecycle run_daemon --position $i --heartbeat-interval 10" `
        -PassThru -WindowStyle Hidden
}
# PIDs: 41556, 18796, 26836, 33048, 29372, 41520, 36660, 28032
```

### Wait 25 seconds, then verify

```powershell
python -m the_shadow.lifecycle verify_heartbeats --expect 8 --within-seconds 30
```

**Output:**
```
=== Heartbeat Verification (expect=8, within=30s) ===
  [PASS] R11_shadow_alpha                FRESH
  [PASS] R11_shadow_beta                 FRESH
  [PASS] R11_shadow_gamma                FRESH
  [PASS] R11_shadow_delta                FRESH
  [PASS] R11_shadow_epsilon              FRESH
  [PASS] R11_shadow_zeta                 FRESH
  [PASS] R11_shadow_eta                  FRESH
  [PASS] R11_shadow_theta                FRESH

Result: 8/8 fresh  ->  PASS
```

### Verify file locations

```powershell
Get-ChildItem "$HOME\.claude\state\eblets\BP015" -Recurse | Select-Object Name
```

**Output:**
```
heartbeat_R11_shadow_alpha.eblet.md    (6:38:02 AM)
heartbeat_R11_shadow_beta.eblet.md     (6:38:02 AM)
heartbeat_R11_shadow_delta.eblet.md    (6:38:02 AM)
heartbeat_R11_shadow_epsilon.eblet.md  (6:38:02 AM)
heartbeat_R11_shadow_eta.eblet.md      (6:38:02 AM)
heartbeat_R11_shadow_gamma.eblet.md    (6:38:02 AM)
heartbeat_R11_shadow_theta.eblet.md    (6:38:02 AM)
heartbeat_R11_shadow_zeta.eblet.md     (6:38:02 AM)
iron_tablet_ledger.jsonl
pid_R11_shadow_alpha.txt               (6:37:22 AM)
pid_R11_shadow_beta.txt                ...
(+ 6 more pid files)
```

### Assert BP011 unchanged

```powershell
$bp011_after = (Get-ChildItem "$HOME\.claude\state\eblets\BP011" -File).Count
# BP011 files after: 53
# PASS: BP011 count unchanged (53)
```

**Phase 6 verdict:** PASS — 8/8 daemons → `BP015/`, zero new writes to `BP011/`.

---

## 4. Phase 4 Decision Rationale — Leave BP011 in Place

**Decision: Leave in place as historical artifact.**

Rationale:
- The 53 files in `~/.claude/state/eblets/BP011/` are valid Iron Tablet substrate records from KN090–KN097. Deleting or archiving them would destroy provenance for that epoch.
- They are read-only archaeological record — no daemon writes to `BP011/` after KN098.
- Future sessions (BP015, BP016, …) each get their own directory; BP011/ silently ages out.
- An `_archive/BP011_pre_KN098/` move would be renaming substrate without an operational need — unnecessary churn per no-unasked-scope discipline.

**No migration action required.** Bishop should note this in any BP015 state summary.

---

## 5. Pre-Fire Verification Protocol for Bishop (Phase 7-bis)

Per BP015 supersede pre-reg §8, before firing the BP015 corrected supersede:

1. Confirm `current_session_name.txt` reads `BP015`
2. Confirm `~/.claude/state/eblets/BP015/` contains 8 fresh heartbeat files (within 90s)
3. Run: `python -m the_shadow.lifecycle verify_heartbeats --expect 8 --within-seconds 90`
   - Expected: `8/8 fresh -> PASS`
4. Confirm `~/.claude/state/eblets/BP011/` file count has not grown beyond 53
5. If all four checks pass → proceed with BP015 supersede fire

---

## 6. Surfaced Gaps

None surfaced during KN098 implementation. The `RuntimeWarning` about `the_shadow.lifecycle` double-import is a pre-existing Python runpy quirk when calling `python -m the_shadow.lifecycle`; it does not affect functionality and is not introduced by KN098.

---

## Acceptance Criteria — Final Status

| Criterion | Status |
|---|---|
| Hardcoded `BP011` references in lifecycle.py removed from write path | ✅ |
| Heartbeat eblet directory derives from `_state.session_id` at write time | ✅ |
| Directory creation is atomic with session_id update (lock-protected) | ✅ |
| All existing tests still pass (24+ from KN097) | ✅ 24 pass |
| New tests added: per-session-dir routing, rebind dir-flip, concurrent multi-daemon | ✅ 7 new |
| Empirical Phase 6 verification PASSES (8/8 → `BP015/`) | ✅ |
| Receipt filed at `04_KnightReports/KN098_*_RECEIPT_BP012.md` | ✅ |
| Commit tagged `v-heartbeat-eblet-dir-param-KN098` | ✅ (see commit) |
| No `--no-verify` | ✅ 66th consecutive clean |

---

*KN098 complete. Ping Bishop. FOR THE KEEP!*
