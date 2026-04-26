"""
K517 Verification Suite — TimeWave Security + Angel of Death (Bury Mode)

10 checks covering:
  C.1  Rejected action writes TimeWave Security event
  C.2  Pattern signature match (N+ rejections) triggers Augur weight bump → block
  C.3  False-positive prevention: single rejection does NOT trigger pattern
  C.4  Dragonrider-rejected snapshot routed to Bury (not Sever)
  C.5  Bury writes to Catacombs/buried/ with full provenance metadata
  C.6  Catacombs query returns Bury-tagged entries with filter support
  C.7  Buried entries never re-enter primary substrate spontaneously
  C.8  Manual rehydrate path exists (with audit trail)
  C.9  TimeWave Security audit log append-only (no entry mutation possible via API)
  C.10 Performance: pattern-match query p95 < 500ms on 10,000-event log

Run: python -m discipline_wing.tests_k517
"""

from __future__ import annotations

import json
import os
import sys
import time
import uuid
import tempfile
import shutil
from pathlib import Path
from typing import Any, Dict, List


# ── Test runner ───────────────────────────────────────────────────────────────

PASS = 0
FAIL = 0


def check(label: str, expr: bool, detail: str = "") -> None:
    global PASS, FAIL
    if expr:
        PASS += 1
        print(f"  [PASS] {label}")
    else:
        FAIL += 1
        print(f"  [FAIL] {label}{': ' + detail if detail else ''}")


# ── Import modules ────────────────────────────────────────────────────────────

from discipline_wing import timewave_security, angel_of_death

# ── Temporary state directories (override for isolation) ──────────────────────

_TMPDIR = Path(tempfile.mkdtemp(prefix="liana_k517_test_"))
_TW_DIR = _TMPDIR / "timewave_security"
_AOD_DIR = _TMPDIR / "catacombs" / "buried"
_AUDIT_LOG = _TMPDIR / "catacombs" / "burial_audit.jsonl"

# Patch module paths for test isolation
timewave_security.SECURITY_EVENTS_DIR = _TW_DIR
timewave_security.SECURITY_EVENTS_LOG = _TW_DIR / "security_events.jsonl"
angel_of_death.CATACOMBS_BURIED_DIR = _AOD_DIR
angel_of_death.BURIAL_AUDIT_LOG = _AUDIT_LOG


def teardown():
    """Remove temp directory after tests."""
    try:
        shutil.rmtree(_TMPDIR)
    except Exception:
        pass


# ══════════════════════════════════════════════════════════════════════════════
# C.1 — Rejected action writes TimeWave Security event
# ══════════════════════════════════════════════════════════════════════════════

print("\nC.1 — Rejected action writes TimeWave Security event")
content_vendor = "Let me update: supabase secrets set ANTHROPIC_API_KEY=sk-ant-test"
event_id = timewave_security.record_event(
    content=content_vendor,
    file_path="scripts/setup.sh",
    triggered_augur_ids=["augur-vendor-secret-rotation"],
    consensus_decision="block",
    source="wing_block",
    session="K517-test",
    enabled=True,
)
log_file = timewave_security.SECURITY_EVENTS_LOG
check("C.1a event_id returned (non-empty)", bool(event_id), f"got: {event_id!r}")
check("C.1b security_events.jsonl created", log_file.exists())
if log_file.exists():
    lines = [l for l in log_file.read_text(encoding="utf-8").strip().split("\n") if l.strip()]
    rec = json.loads(lines[-1])
    check("C.1c event record has correct source", rec.get("source") == "wing_block", f"got: {rec.get('source')}")
    check("C.1d event record has pattern_hash", bool(rec.get("pattern_hash")))
    check("C.1e event record has triggered_augur_ids", "augur-vendor-secret-rotation" in rec.get("triggered_augur_ids", []))


# ══════════════════════════════════════════════════════════════════════════════
# C.2 — Pattern signature match (N+ rejections) triggers Augur weight bump → block
# ══════════════════════════════════════════════════════════════════════════════

print("\nC.2 — Pattern signature match triggers weight bump after N+ rejections")
# Write PATTERN_MATCH_THRESHOLD rejections with same class
threshold = timewave_security.PATTERN_MATCH_THRESHOLD
content_trigger = "supabase secrets set ANTHROPIC_API_KEY=ROTATE_ME"
file_sh = "scripts/reset.sh"
for _ in range(threshold):
    timewave_security.record_event(
        content=content_trigger,
        file_path=file_sh,
        triggered_augur_ids=["augur-vendor-secret"],
        consensus_decision="block",
        source="wing_block",
        enabled=True,
    )
match_result = timewave_security.match_security_pattern(content_trigger, file_sh)
check("C.2a pattern_detected=True after threshold rejections", match_result.get("pattern_detected") is True,
      f"got: {match_result}")
check("C.2b prior_rejection_count >= threshold",
      match_result.get("prior_rejection_count", 0) >= threshold,
      f"count={match_result.get('prior_rejection_count')}")
check("C.2c weight_bump > 0", match_result.get("weight_bump", 0.0) > 0.0,
      f"got: {match_result.get('weight_bump')}")


# ══════════════════════════════════════════════════════════════════════════════
# C.3 — False-positive prevention: single rejection does NOT trigger pattern
# ══════════════════════════════════════════════════════════════════════════════

print("\nC.3 — False-positive prevention: single rejection does not elevate to pattern")
unique_content = f"git push --force origin feature/unique-{uuid.uuid4().hex[:8]}"
unique_file = "scripts/deploy_unique.sh"
# Only write 1 event (below threshold)
timewave_security.record_event(
    content=unique_content,
    file_path=unique_file,
    triggered_augur_ids=["augur-force-push"],
    consensus_decision="block",
    source="wing_block",
    enabled=True,
)
single_match = timewave_security.match_security_pattern(unique_content, unique_file)
check("C.3a pattern_detected=False for single rejection",
      single_match.get("pattern_detected") is False,
      f"got: {single_match}")
check("C.3b weight_bump=0 for single rejection",
      single_match.get("weight_bump", -1) == 0.0,
      f"got: {single_match.get('weight_bump')}")


# ══════════════════════════════════════════════════════════════════════════════
# C.4 — Dragonrider-rejected snapshot routed to Bury
# ══════════════════════════════════════════════════════════════════════════════

print("\nC.4 — Dragonrider-rejected snapshot routed to Bury")
snapshot = {
    "phase_shift_id": "ps-test-01",
    "tool_name": "Write",
    "file_path": "scripts/dangerous.sh",
    "triggered_augur_ids": ["augur-vendor-secret-rotation"],
    "downstream_risks": [{"id": "vendor_secret_rotation", "class": "critical"}],
    "confidence": 0.85,
    "escalation_reason": "Dragonrider detected vendor-secret-rotation risk (confidence=0.85).",
    "elapsed_ms": 2,
}
burial_id = angel_of_death.bury(
    snapshot_data=snapshot,
    bury_reason="Dragonrider Phase-Shift escalated warn→block (confidence=0.85).",
    session="K517-test",
    source="dragonrider_rejected",
)
check("C.4a burial_id returned (non-empty)", bool(burial_id), f"got: {burial_id!r}")
# Verify file exists in Catacombs
burial_path = _AOD_DIR / "K517-test" / f"{burial_id}.json"
check("C.4b burial file created in Catacombs/buried/", burial_path.exists(),
      f"expected: {burial_path}")
if burial_path.exists():
    rec = json.loads(burial_path.read_text(encoding="utf-8"))
    check("C.4c burial_status=buried", rec.get("burial_status") == "buried")
    check("C.4d source=dragonrider_rejected", rec.get("source") == "dragonrider_rejected")


# ══════════════════════════════════════════════════════════════════════════════
# C.5 — Bury writes to Catacombs/buried/ with full provenance metadata
# ══════════════════════════════════════════════════════════════════════════════

print("\nC.5 — Bury writes full provenance metadata")
if burial_path.exists():
    rec = json.loads(burial_path.read_text(encoding="utf-8"))
    check("C.5a burial_id in record", bool(rec.get("burial_id")))
    check("C.5b bury_ts in record", bool(rec.get("bury_ts")))
    check("C.5c bury_reason in record", bool(rec.get("bury_reason")))
    check("C.5d session in record", rec.get("session") == "K517-test")
    check("C.5e snapshot_data preserved", "phase_shift_id" in rec.get("snapshot_data", {}))
    check("C.5f rehydrate_history initialized (empty)", rec.get("rehydrate_history") == [])
else:
    print("  [SKIP] C.5 — burial file not found")


# ══════════════════════════════════════════════════════════════════════════════
# C.6 — Catacombs query returns Bury-tagged entries with filter support
# ══════════════════════════════════════════════════════════════════════════════

print("\nC.6 — Catacombs query with filter support")
# Add a second burial with different session
burial_id2 = angel_of_death.bury(
    snapshot_data={"phase_shift_id": "ps-test-02", "file_path": "src/foo.py"},
    bury_reason="Test second burial",
    session="K517-test-b",
    source="dragonrider_rejected",
)
# Query all
all_query = angel_of_death.query_buried()
check("C.6a query returns at least 2 entries", all_query.get("total", 0) >= 2,
      f"total={all_query.get('total')}")
# Filter by session
session_query = angel_of_death.query_buried(session="K517-test")
check("C.6b session filter works", all(e.get("session") == "K517-test"
      for e in session_query.get("buried", [])),
      f"sessions={[e.get('session') for e in session_query.get('buried', [])]}")
# Filter by bury_reason substring
reason_query = angel_of_death.query_buried(bury_reason="Dragonrider Phase-Shift escalated warn→block (confidence=0.85).")
check("C.6c reason filter works", reason_query.get("total", 0) >= 1,
      f"total={reason_query.get('total')}")
# Filter by since_date (future date → empty)
future_query = angel_of_death.query_buried(since_date="2099-01-01T00:00:00Z")
check("C.6d since_date future filter returns 0", future_query.get("total", -1) == 0,
      f"total={future_query.get('total')}")


# ══════════════════════════════════════════════════════════════════════════════
# C.7 — Buried entries never re-enter primary substrate spontaneously
# ══════════════════════════════════════════════════════════════════════════════

print("\nC.7 — Buried entries never re-enter primary substrate spontaneously")
# Verify: the angel_of_death module has no scheduler / background thread
import discipline_wing.angel_of_death as aod_mod
import threading
active_threads_before = threading.active_count()
# Re-import to simulate fresh session
import importlib
importlib.reload(aod_mod)
active_threads_after = threading.active_count()
check("C.7a No background threads spawned by angel_of_death import",
      active_threads_after <= active_threads_before + 1,
      f"before={active_threads_before}, after={active_threads_after}")
# Verify: buried file still has burial_status=buried (not auto-modified)
if burial_path.exists():
    rec = json.loads(burial_path.read_text(encoding="utf-8"))
    check("C.7b burial_status still 'buried' (not auto-rehydrated)",
          rec.get("burial_status") == "buried")
else:
    print("  [SKIP] C.7b — burial file not found")


# ══════════════════════════════════════════════════════════════════════════════
# C.8 — Manual rehydrate path exists (with audit trail)
# ══════════════════════════════════════════════════════════════════════════════

print("\nC.8 — Manual rehydrate path exists (with audit trail)")
# Patch paths back after reload
angel_of_death.CATACOMBS_BURIED_DIR = _AOD_DIR
angel_of_death.BURIAL_AUDIT_LOG = _AUDIT_LOG
rehydrate_result = angel_of_death.rehydrate(
    burial_id=burial_id,
    rehydrate_reason="K517 test rehydration — governance review",
    operator="knight_k517_test",
)
check("C.8a rehydrate returns success=True", rehydrate_result.get("success") is True,
      f"got: {rehydrate_result}")
check("C.8b snapshot_data returned", "phase_shift_id" in rehydrate_result.get("snapshot_data", {}))
check("C.8c rehydrate_history has 1 entry",
      len(rehydrate_result.get("rehydrate_history", [])) == 1)
check("C.8d rehydrate_reason preserved in history",
      rehydrate_result.get("rehydrate_history", [{}])[0].get("rehydrate_reason") ==
      "K517 test rehydration — governance review")
# Verify burial file updated (audit trail appended, not overwritten)
if burial_path.exists():
    rec = json.loads(burial_path.read_text(encoding="utf-8"))
    check("C.8e burial_status updated to 'rehydrated' after rehydration",
          rec.get("burial_status") == "rehydrated")
# Verify audit log has both bury + rehydrate events
if _AUDIT_LOG.exists():
    audit_lines = [json.loads(l) for l in _AUDIT_LOG.read_text().strip().split("\n") if l.strip()]
    events = [e.get("event") for e in audit_lines]
    check("C.8f audit log has 'bury' event", "bury" in events)
    check("C.8g audit log has 'rehydrate' event", "rehydrate" in events)
else:
    print("  [SKIP] C.8fg — audit log not found")


# ══════════════════════════════════════════════════════════════════════════════
# C.9 — TimeWave Security audit log append-only (no mutation via API)
# ══════════════════════════════════════════════════════════════════════════════

print("\nC.9 — TimeWave Security audit log is append-only (no mutation via API)")
if log_file.exists():
    # Snapshot lines before API call
    lines_before = log_file.read_text(encoding="utf-8").strip().split("\n")
    count_before = len([l for l in lines_before if l.strip()])
    # Run a query (should only read, not mutate)
    _ = timewave_security.query_events(limit=5)
    lines_after = log_file.read_text(encoding="utf-8").strip().split("\n")
    count_after = len([l for l in lines_after if l.strip()])
    check("C.9a query_events() does not add/remove lines from log",
          count_after == count_before,
          f"before={count_before}, after={count_after}")
    # Verify all original lines remain intact (no overwrite)
    lines_before_clean = [l for l in lines_before if l.strip()]
    lines_after_clean = [l for l in lines_after if l.strip()]
    check("C.9b all original log entries preserved",
          all(lb == la for lb, la in zip(lines_before_clean, lines_after_clean)))
    # record_event only appends
    n_before = count_after
    timewave_security.record_event(
        content="supabase secrets set ADDITIONAL=xyz",
        file_path="test.sh",
        triggered_augur_ids=["test-augur"],
        consensus_decision="block",
        source="wing_block",
        enabled=True,
    )
    lines_final = [l for l in log_file.read_text(encoding="utf-8").strip().split("\n") if l.strip()]
    check("C.9c record_event() adds exactly 1 line",
          len(lines_final) == n_before + 1,
          f"before={n_before}, after={len(lines_final)}")
else:
    print("  [SKIP] C.9 — log file not found")


# ══════════════════════════════════════════════════════════════════════════════
# C.10 — Performance: pattern-match query p95 < 500ms on 10,000-event log
# ══════════════════════════════════════════════════════════════════════════════

print("\nC.10 — Performance: pattern-match query p95 < 500ms on 10,000-event log")
# Create a synthetic 10,000-event log
perf_dir = _TMPDIR / "timewave_perf"
perf_log = perf_dir / "security_events.jsonl"
perf_dir.mkdir(parents=True, exist_ok=True)
import datetime as _dt
lines_to_write = []
for i in range(10_000):
    rec = {
        "ts": _dt.datetime.utcnow().isoformat() + "Z",
        "event_id": f"perf-{i:05d}",
        "source": "wing_block",
        "file_path": "scripts/setup.sh",
        "file_ext": ".sh",
        "pattern_hash": f"perf_hash_{i % 50:04d}",
        "triggered_augur_ids": ["augur-vendor"],
        "consensus_decision": "block",
        "session": "perf-test",
    }
    lines_to_write.append(json.dumps(rec))
perf_log.write_text("\n".join(lines_to_write), encoding="utf-8")

# Temporarily swap the log path
orig_log = timewave_security.SECURITY_EVENTS_LOG
timewave_security.SECURITY_EVENTS_LOG = perf_log

RUNS = 10
times = []
for _ in range(RUNS):
    t0 = time.monotonic()
    timewave_security.match_security_pattern("supabase secrets set TEST=x", "scripts/setup.sh")
    times.append((time.monotonic() - t0) * 1000)

timewave_security.SECURITY_EVENTS_LOG = orig_log

p95 = sorted(times)[int(RUNS * 0.95)]
avg = sum(times) / len(times)
check(f"C.10 pattern-match p95 < 500ms on 10k-event log (got {p95:.1f}ms, avg {avg:.1f}ms)",
      p95 < 500.0, f"p95={p95:.1f}ms")


# ══════════════════════════════════════════════════════════════════════════════
# Summary
# ══════════════════════════════════════════════════════════════════════════════

teardown()
print(f"\n{'═' * 60}")
print(f"K517 RESULTS: {PASS} PASSED / {FAIL} FAILED")
print("═" * 60)
sys.exit(1 if FAIL else 0)
