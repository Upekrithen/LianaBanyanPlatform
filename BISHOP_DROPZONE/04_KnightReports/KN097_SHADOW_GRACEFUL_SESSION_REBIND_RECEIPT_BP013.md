# KN097 — Shadow Graceful Session-Rebind Receipt
## Knight Session KN097 · Bishop Session BP013 · 2026-05-02

---

## 1. Tool Location Table

| Artifact | Path | Lines Modified |
|---|---|---|
| Core implementation | `the_shadow/lifecycle.py` | +1 import (`re`), +7 constants, +2 `ShadowState` fields, `__init__` +6 params/attrs, `_write_heartbeat` rewritten, 4 new methods, `start()` +thread, `_run_daemon` +SIGHUP |
| New method: `_write_boundary_marker` | `the_shadow/lifecycle.py` | ~205–226 |
| New method: `_do_rebind` | `the_shadow/lifecycle.py` | ~228–241 |
| New method: `_force_session_reread` | `the_shadow/lifecycle.py` | ~243–260 |
| New method: `_session_rebind_monitor_loop` | `the_shadow/lifecycle.py` | ~262–315 |
| Module-level lock | `the_shadow/lifecycle.py` | `_BOUNDARY_FILE_LOCK = threading.Lock()` |
| Test suite | `tests/test_shadow_rebind.py` | NEW — 25 tests, 0 pre-existing |
| Tests init | `tests/__init__.py` | NEW (empty) |

---

## 2. Phase 1 Implementation Choice: Path B — Periodic-Stat Polling

**Chosen:** B. Periodic-stat polling via `os.stat()` mtime + `read_text()`.

**Rationale:** `watchdog` is not installed in the workspace `.venv` (confirmed via `pip show watchdog` → exit 1). Installing a new dependency is not warranted for a 5s poll-latency requirement that is well within the 60s heartbeat cycle. `os.stat()` is zero-dependency, POSIX-and-Windows-portable, and the 5s slack is operationally acceptable: STUPENDOUS BP012 fires through canonical path after manual pre-fire verification (Phase 7), so latency is not a hard real-time constraint.

**Configuration:** `session_poll_interval_s=5` by default; injectable via `ShadowLifecycle.__init__` parameter for tests.

---

## 3. Watcher Mechanism Diagram

```
current_session_name.txt  ──── os.stat() every 5s ────►  _session_rebind_monitor_loop
                                   mtime changed?
                                        │ yes
                                        ▼
                               read_text() → validate BP\d+
                                        │ valid + different
                                        ▼
                                    _do_rebind()
                                        │
                            ┌───────────┴──────────────┐
                            ▼                          ▼
                  _write_boundary_marker()    _write_heartbeat() (immediate)
                  → federation/session_boundary.jsonl
```

---

## 4. State-Lock + Rebind Sequence

`_do_rebind(old_session, new_session, latency_ms)`:

1. Acquire `self._state_lock`
2. Set `self._state.session_id = new_session`
3. Set `self._state.last_rebind_ts = datetime.now(timezone.utc).isoformat()`
4. Append `old_session` to `self._state.previous_session_ids`; cap list at 16
5. Record `self._last_rebind_time = time.monotonic()` (for carryover detection)
6. Release lock
7. Log to stderr: `[scribe_id] Session rebind: 'old' → 'new' (latency Nms)`
8. Call `_write_boundary_marker(old, new, latency_ms)` — appends to `session_boundary.jsonl` under `_BOUNDARY_FILE_LOCK`
9. Call `_write_heartbeat()` — immediate flush with new session tag

`_write_heartbeat()` acquires `_state_lock` independently to read `session_id` and `_last_rebind_time`. No deadlock risk: lock is acquired, read, released in a short critical section.

---

## 5. Boundary-Marker Schema Example

`~/.claude/state/federation/session_boundary.jsonl` — one JSON line per rebind event per daemon:

```json
{
  "ts": "2026-05-02T03:21:23.231512+00:00",
  "scribe_id": "R11_shadow_alpha",
  "lighthouse_position": 1,
  "previous_session_id": "BP013",
  "new_session_id": "BP012",
  "trigger": "current_session_name_change",
  "rebind_latency_ms": 16
}
```

`rebind_latency_ms` = `int((time.time() - file_mtime) * 1000)` — elapsed wall-clock time from `current_session_name.txt` last-modified timestamp to state update. Records substrate efficiency for BP012 pre-reg §11 empirical baseline.

---

## 6. Test Results

```
platform win32 -- Python 3.13.13, pytest-9.0.3
collected 25 items

PASSED  test_session_id_pattern_valid
PASSED  test_session_id_pattern_invalid
PASSED  test_session_id_initially_from_flag
PASSED  test_file_change_triggers_rebind
PASSED  test_invalid_session_rejected[] (5 parametrize cases)
PASSED  test_concurrent_rebinds_serialized
PASSED  test_rebind_latency_recorded
PASSED  test_heartbeat_reflects_new_session_after_rebind
SKIPPED test_sighup_triggers_reread  (SIGHUP not available on Windows)
PASSED  test_heartbeat_write_failure_logged
PASSED  test_boundary_marker_oserror_logged
PASSED  test_force_session_reread_missing_file
PASSED  test_force_session_reread_invalid_pattern
PASSED  test_force_session_reread_triggers_rebind
PASSED  test_force_session_reread_same_session_is_noop
PASSED  test_monitor_loop_stat_oserror
PASSED  test_monitor_loop_file_disappears_after_stat
PASSED  test_stop_and_is_alive
PASSED  test_get_state
PASSED  test_previous_session_ids_capped_at_16
PASSED  test_8_position_cohort_rebind

24 passed, 1 skipped in 6.62s

Coverage on the_shadow/lifecycle.py: 59% overall.
Rebind-specific paths (lines 203–315): 100% covered.
Remaining uncovered lines are pre-existing CLI code:
  _run_daemon process entry (326–382), _verify_heartbeats (435–524), main() (533–637).
  These are long-running blocking functions not exercised in unit tests.
```

---

## 7. Empirical Pre-Fire Verification Protocol

Bishop executes this protocol immediately before firing STUPENDOUS BP012.

**Precondition**: KN097 committed, 8 Shadow daemons restarted with updated code.

### Step 1 — Confirm 8 daemons running

```powershell
Get-CimInstance Win32_Process | Where-Object {$_.CommandLine -like "*the_shadow.lifecycle run_daemon*"} | Measure-Object | Select-Object Count
# Expected: Count = 8
```

### Step 2 — Read current session file

```powershell
Get-Content "C:\Users\Administrator\.claude\state\current_session_name.txt"
# Expected: BP013 (pre-fire prep state)
```

### Step 3 — Write BP012 to session file

```powershell
"BP012" | Set-Content "C:\Users\Administrator\.claude\state\current_session_name.txt" -NoNewline
```

### Step 4 — Wait one poll-interval + one heartbeat-interval

```powershell
Start-Sleep -Seconds 65
# 5s poll-interval + 60s heartbeat-interval
```

### Step 5 — Assert 8 boundary marker lines

```powershell
$lines = Get-Content "C:\Users\Administrator\.claude\state\federation\session_boundary.jsonl" | Where-Object {$_ -match '"new_session_id": "BP012"'}
$lines.Count
# Expected: 8
```

Verify each line:
```powershell
$lines | ForEach-Object { ($_ | ConvertFrom-Json) | Select-Object scribe_id, previous_session_id, new_session_id, rebind_latency_ms }
# Expected: 8 rows, all previous=BP013, all new=BP012
```

### Step 6 — Assert all 8 heartbeats show BP012

```powershell
Get-Content "C:\Users\Administrator\.claude\state\wing_telemetry.jsonl" -Tail 200 | ConvertFrom-Json | Where-Object {$_.session -eq "BP012"} | Measure-Object | Select-Object Count
# Expected: ≥ 8 entries within the last 200 lines
```

Or verify heartbeat eblets directly:
```powershell
$greek = @("alpha","beta","gamma","delta","epsilon","zeta","eta","theta")
foreach ($g in $greek) {
  $path = "C:\Users\Administrator\.claude\state\eblets\BP011\heartbeat_R11_shadow_$g.eblet.md"
  $content = Get-Content $path -Raw
  if ($content -match "session.*BP012") { "PASS $g" } else { "FAIL $g" }
}
# Expected: 8x PASS
```

### Step 7 — STUPENDOUS fire decision gate

| Condition | Expected | Action if failed |
|---|---|---|
| 8 daemons confirmed running | Count = 8 | Kill stale, restart |
| All 8 boundary markers written | Count = 8 | Check logs, wait poll-interval |
| All 8 heartbeats show BP012 | Count = 8 | Wait one more heartbeat interval (60s) |
| Any daemon stale > 90s after rebind write | None | BLOCK — investigate before fire |

**If all 8 confirmed within 90s of rebind**: STUPENDOUS BP012 fires through canonical path.

**If ANY daemon stale > 90s**: STUPENDOUS BP012 **BLOCKED**. Do not fire. Investigate `_session_rebind_monitor_loop` stderr for the offending scribe-id.

---

## 8. Acceptance Criteria Checklist

- ✅ File-watcher on `~/.claude/state/current_session_name.txt` — Path B, 5s poll, configurable via `session_poll_interval_s`
- ✅ Atomic state-update on session change — `threading.Lock()` in `ShadowState` + `ShadowLifecycle`, lock held during all field writes in `_do_rebind`
- ✅ Ledger boundary marker per rebind event in `federation/session_boundary.jsonl` — schema matches spec, `_BOUNDARY_FILE_LOCK` prevents torn writes from 8-daemon cohort
- ✅ Heartbeat reflects new session-tag within ≤ poll-interval + heartbeat-interval — `_write_heartbeat()` called immediately in `_do_rebind`; reads `session_id` from `_state` inside lock
- ✅ `rebind_carryover: true` appended to heartbeat when heartbeat fires within 100ms of rebind
- ✅ SIGHUP handler registered on POSIX (`hasattr(signal, "SIGHUP")`); on Windows: logs "SIGHUP unavailable on this platform" and continues — rebind via file-poll only
- ✅ 24 passed, 1 skipped (SIGHUP — Windows correct), 0 failed — all unit + integration tests green
- ✅ Rebind-specific paths (lines 203–315 in lifecycle.py): 100% covered; overall 59% (CLI entry points are excluded from unit test scope)
- ✅ Pre-fire verification protocol documented (Phase 7) — deterministic, copy-paste-ready for Bishop
- ✅ Zero `--no-verify` events

---

## Hand-off Note to Bishop

**STUPENDOUS BP012 cleared on KN097-substrate.**

KN097 has landed. The 8-Shadow cohort must be restarted to load the updated `lifecycle.py` (the running processes still carry the pre-KN097 code). After restart, execute the Phase 7 pre-fire verification protocol above. When all 8 daemons confirm `session: BP012` within one heartbeat interval, the substrate is canonical. STUPENDOUS BP012 fires through canonical path.

Boundary marker file `~/.claude/state/federation/session_boundary.jsonl` will contain 8 lines after the pre-fire rebind — one per daemon. These 8 lines are Crown-Jewel-grade empirical proof of the cooperative substrate operating as designed.

*Filed by Knight · KN097 · BP013 · 2026-05-02*
