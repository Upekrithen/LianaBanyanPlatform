#!/usr/bin/env python3
"""
tests_kn044.py — KN044 Furnace Eblet-QR-Scan API

8 tests (minimum per KN044 Phase D):
  T01 valid_scan_returns_canonical_resolution
  T02 invalid_hash_returns_soft_deflect
  T03 battery_dispatch_register_entry_created
  T04 furnace_every_click_composition
  T05 slow_blade_rate_limit_composition
  T06 marked_exception_lb_source_eblet
  T07 graceful_when_ip_ledger_unavailable
  T08 regression_furnace_every_click_existing
"""
from __future__ import annotations

import json
import os
import sys
import tempfile
import time
from pathlib import Path
from unittest.mock import patch

_HERE = os.path.dirname(__file__)
_REPO = os.path.abspath(os.path.join(_HERE, ".."))
if _REPO not in sys.path:
    sys.path.insert(0, _REPO)

import discipline_wing.furnace_eblet_qr_scan as furnace


# ── Helpers ────────────────────────────────────────────────────────────────────

def _make_ledger(tmpdir: str, entries: list[dict]) -> Path:
    """Write a mock IP Ledger JSONL to a temp file."""
    path = Path(tmpdir) / "ip_ledger.jsonl"
    with open(path, "w", encoding="utf-8") as f:
        for entry in entries:
            f.write(json.dumps(entry) + "\n")
    return path


def _make_lb_entry(tablet_id: str = "LB-CAT.M-0001-T0001",
                   current_hash: str = "abc123deadbeef" * 3 + "00") -> dict:
    return {
        "miner_serial": "LB-CAT.M-0001",
        "event_type": "mine_tablet",
        "tablet_id": tablet_id,
        "source_file": f"C:\\Users\\test\\memory\\{tablet_id}.md",
        "current_hash": current_hash,
        "prior_hash": "GENESIS",
        "timestamp": "2026-04-30T00:00:00Z",
    }


def _reset_slow_blade() -> None:
    """Clear Slow Blade token buckets between tests."""
    furnace._SLOW_BLADE_BUCKETS.clear()


# ── T01 — valid_scan_returns_canonical_resolution ─────────────────────────────

def test_valid_scan_returns_canonical_resolution() -> None:
    """A valid scan (correct hash, known tablet) returns verified=True + canonical path."""
    tablet_id = "LB-CAT.M-0001-T0001"
    good_hash = "a" * 64
    entry = _make_lb_entry(tablet_id, good_hash)

    _reset_slow_blade()
    with tempfile.TemporaryDirectory() as tmpdir:
        ledger_path = _make_ledger(tmpdir, [entry])
        dispatch_path = Path(tmpdir) / "battery_dispatch.jsonl"

        with patch.object(furnace, "BATTERY_DISPATCH_PATH", dispatch_path):
            result = furnace.scan_eblet(
                eblet_id=tablet_id,
                expected_anchor_hash=good_hash,
                scanner_metadata={"client_id": "test-scanner"},
                ledger_path=ledger_path,
            )

    assert result["verified"] is True, f"T01 FAILED: expected verified=True, got {result}"
    assert "canonical_resolution" in result, "T01 FAILED: missing canonical_resolution"
    assert result["canonical_resolution"], "T01 FAILED: empty canonical_resolution"
    assert "battery_dispatch_id" in result, "T01 FAILED: missing battery_dispatch_id"
    print(f"T01 PASS — valid scan returns canonical_resolution: {result['canonical_resolution'][:60]}...")


# ── T02 — invalid_hash_returns_soft_deflect ───────────────────────────────────

def test_invalid_hash_returns_soft_deflect() -> None:
    """An incorrect expected_anchor_hash returns verified=False + soft_deflect_url."""
    tablet_id = "LB-CAT.M-0001-T0002"
    real_hash = "b" * 64
    wrong_hash = "c" * 64
    entry = _make_lb_entry(tablet_id, real_hash)

    _reset_slow_blade()
    with tempfile.TemporaryDirectory() as tmpdir:
        ledger_path = _make_ledger(tmpdir, [entry])
        dispatch_path = Path(tmpdir) / "battery_dispatch.jsonl"

        with patch.object(furnace, "BATTERY_DISPATCH_PATH", dispatch_path):
            result = furnace.scan_eblet(
                eblet_id=tablet_id,
                expected_anchor_hash=wrong_hash,
                scanner_metadata={"client_id": "test-scanner"},
                ledger_path=ledger_path,
            )

    assert result["verified"] is False, f"T02 FAILED: expected verified=False, got {result}"
    assert "soft_deflect_url" in result, "T02 FAILED: missing soft_deflect_url"
    assert result["soft_deflect_url"], "T02 FAILED: empty soft_deflect_url"
    assert "reason" in result, "T02 FAILED: missing reason"
    print(f"T02 PASS — invalid hash returns soft_deflect_url: {result['soft_deflect_url'][:60]}...")


# ── T03 — battery_dispatch_register_entry_created ────────────────────────────

def test_battery_dispatch_register_entry_created() -> None:
    """Every scan (success and failure) creates an entry in the Battery-dispatch register."""
    tablet_id = "LB-CAT.M-0001-T0003"
    good_hash = "d" * 64
    entry = _make_lb_entry(tablet_id, good_hash)

    _reset_slow_blade()
    with tempfile.TemporaryDirectory() as tmpdir:
        ledger_path = _make_ledger(tmpdir, [entry])
        dispatch_path = Path(tmpdir) / "battery_dispatch.jsonl"

        with patch.object(furnace, "BATTERY_DISPATCH_PATH", dispatch_path):
            # Successful scan
            r1 = furnace.scan_eblet(
                eblet_id=tablet_id,
                expected_anchor_hash=good_hash,
                scanner_metadata={"client_id": "t03-scanner"},
                ledger_path=ledger_path,
            )
            # Failed scan (wrong hash)
            r2 = furnace.scan_eblet(
                eblet_id=tablet_id,
                expected_anchor_hash="wrong" * 10 + "00000000000000",
                scanner_metadata={"client_id": "t03-scanner"},
                ledger_path=ledger_path,
            )

        assert dispatch_path.exists(), "T03 FAILED: Battery-dispatch register not created"
        lines = [json.loads(l) for l in dispatch_path.read_text().strip().splitlines()]
        assert len(lines) >= 2, f"T03 FAILED: expected ≥2 dispatch entries, got {len(lines)}"
        events = {l["event"] for l in lines}
        assert "scan_verified" in events, "T03 FAILED: no scan_verified entry"
        assert "hash_mismatch" in events, "T03 FAILED: no hash_mismatch entry"

    print(f"T03 PASS — Battery-dispatch register logged {len(lines)} entries (success + failure)")


# ── T04 — furnace_every_click_composition ─────────────────────────────────────

def test_furnace_every_click_composition() -> None:
    """R2 closure: batch scan logs all requests; partial failures don't abort batch."""
    tablets = [
        _make_lb_entry(f"LB-CAT.M-0001-T{i:04d}", f"{chr(97+i)}" * 64)
        for i in range(3)
    ]
    good_requests = [
        {
            "eblet_id": f"LB-CAT.M-0001-T{i:04d}",
            "expected_anchor_hash": f"{chr(97+i)}" * 64,
            "scanner_metadata": {"client_id": "t04-batch"},
        }
        for i in range(3)
    ]
    # Add one bad request (wrong hash)
    bad_request = {
        "eblet_id": "LB-CAT.M-0001-T0000",
        "expected_anchor_hash": "wrong" * 14 + "0000",
        "scanner_metadata": {"client_id": "t04-batch"},
    }

    _reset_slow_blade()
    with tempfile.TemporaryDirectory() as tmpdir:
        ledger_path = _make_ledger(tmpdir, tablets)
        dispatch_path = Path(tmpdir) / "battery_dispatch.jsonl"

        with patch.object(furnace, "BATTERY_DISPATCH_PATH", dispatch_path):
            results = furnace.scan_eblet_batch(
                requests=good_requests + [bad_request],
                ledger_path=ledger_path,
            )

    assert len(results) == 4, f"T04 FAILED: expected 4 results, got {len(results)}"
    verified = [r for r in results if r["verified"]]
    failed = [r for r in results if not r["verified"]]
    assert len(verified) == 3, f"T04 FAILED: expected 3 verified, got {len(verified)}"
    assert len(failed) == 1, f"T04 FAILED: expected 1 failed, got {len(failed)}"
    print(f"T04 PASS — R2 closure batch: {len(verified)} verified, {len(failed)} failed, all logged")


# ── T05 — slow_blade_rate_limit_composition ───────────────────────────────────

def test_slow_blade_rate_limit_composition() -> None:
    """
    Slow Blade token bucket rate-limits high-frequency client.
    Hammering with 20 requests from same client with near-zero bucket should
    eventually return rate_limited errors.
    """
    tablet_id = "LB-CAT.M-0001-T0005"
    good_hash = "e" * 64
    entry = _make_lb_entry(tablet_id, good_hash)

    _reset_slow_blade()
    # Force a tiny bucket
    original_capacity = furnace._SLOW_BLADE_CAPACITY
    original_refill = furnace._SLOW_BLADE_REFILL_RATE
    furnace._SLOW_BLADE_CAPACITY = 3
    furnace._SLOW_BLADE_REFILL_RATE = 0.01  # near-zero refill

    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            ledger_path = _make_ledger(tmpdir, [entry])
            dispatch_path = Path(tmpdir) / "battery_dispatch.jsonl"

            results = []
            with patch.object(furnace, "BATTERY_DISPATCH_PATH", dispatch_path):
                for i in range(20):
                    r = furnace.scan_eblet(
                        eblet_id=tablet_id,
                        expected_anchor_hash=good_hash,
                        scanner_metadata={"client_id": "bot-hammer"},
                        ledger_path=ledger_path,
                    )
                    results.append(r)

        rate_limited = [r for r in results if r.get("reason") == "rate_limited"]
        assert len(rate_limited) > 0, "T05 FAILED: no requests were rate-limited after burst"
    finally:
        furnace._SLOW_BLADE_CAPACITY = original_capacity
        furnace._SLOW_BLADE_REFILL_RATE = original_refill
        _reset_slow_blade()

    print(f"T05 PASS — Slow Blade blocked {len(rate_limited)}/20 bot-class requests")


# ── T06 — marked_exception_lb_source_eblet ───────────────────────────────────

def test_marked_exception_lb_source_eblet() -> None:
    """
    LB-source Eblet (tablet_id starts with 'LB-') ALWAYS routes to Canon/Lore/Rules
    path regardless of scanner_metadata routing hints (Marked Exception enforcement).
    """
    tablet_id = "LB-CAT.M-0001-T0006"
    good_hash = "f" * 64
    entry = _make_lb_entry(tablet_id, good_hash)

    _reset_slow_blade()
    with tempfile.TemporaryDirectory() as tmpdir:
        ledger_path = _make_ledger(tmpdir, [entry])
        dispatch_path = Path(tmpdir) / "battery_dispatch.jsonl"

        with patch.object(furnace, "BATTERY_DISPATCH_PATH", dispatch_path):
            result = furnace.scan_eblet(
                eblet_id=tablet_id,
                expected_anchor_hash=good_hash,
                scanner_metadata={
                    "client_id": "custom-router",
                    "preferred_route": "some-custom-path",  # Must be IGNORED
                },
                ledger_path=ledger_path,
            )

    assert result["verified"] is True, f"T06 FAILED: LB-source scan should succeed"
    assert result["marked_exception_applied"] is True, (
        "T06 FAILED: marked_exception_applied must be True for LB-source Eblet"
    )
    assert "Canon" in result["canonical_resolution"] or "Layer_1" in result["canonical_resolution"], (
        f"T06 FAILED: canonical_resolution must point to Canon/Layer_1, got: {result['canonical_resolution']}"
    )
    # Verify the preferred_route from scanner_metadata was not applied
    assert "some-custom-path" not in result["canonical_resolution"], (
        "T06 FAILED: scanner_metadata routing hint leaked into canonical_resolution (Marked Exception violated)"
    )
    print(f"T06 PASS — Marked Exception enforced: {result['canonical_resolution'][:60]}...")


# ── T07 — graceful_when_ip_ledger_unavailable ─────────────────────────────────

def test_graceful_when_ip_ledger_unavailable() -> None:
    """When IP Ledger file is missing, returns verified=False with clear reason, no crash."""
    _reset_slow_blade()
    with tempfile.TemporaryDirectory() as tmpdir:
        nonexistent_ledger = Path(tmpdir) / "does_not_exist.jsonl"
        dispatch_path = Path(tmpdir) / "battery_dispatch.jsonl"

        with patch.object(furnace, "BATTERY_DISPATCH_PATH", dispatch_path):
            result = furnace.scan_eblet(
                eblet_id="LB-CAT.M-0001-T0007",
                expected_anchor_hash="a" * 64,
                scanner_metadata={"client_id": "t07-scanner"},
                ledger_path=nonexistent_ledger,
            )

    assert result["verified"] is False, "T07 FAILED: should be unverified when ledger unavailable"
    assert "reason" in result, "T07 FAILED: missing reason field"
    assert "ip_ledger" in result["reason"].lower() or "unavailable" in result["reason"].lower(), (
        f"T07 FAILED: reason should indicate ledger unavailability, got: {result['reason']}"
    )
    print(f"T07 PASS — graceful ledger-unavailable response: reason={result['reason']!r}")


# ── T08 — regression_furnace_every_click_existing ────────────────────────────

def test_regression_furnace_every_click_existing() -> None:
    """
    Regression: the KN044 module can be imported without breaking existing
    discipline_wing imports. The scan API doesn't interfere with badge/stamp paths.
    """
    # Import the existing discipline_wing stack
    from discipline_wing.eblet_router import is_eblet_path
    from discipline_wing.engine import evaluate

    # is_eblet_path must still work
    assert is_eblet_path("~/.claude/state/eblets/B134/foo.eblet.md") is True
    assert is_eblet_path("platform/src/App.tsx") is False

    # evaluate must still accept normal tool calls without error
    result = evaluate({
        "tool_name": "Write",
        "tool_input": {
            "file_path": "/tmp/regression_kn044_test.txt",
            "content": "regression test content",
        }
    })
    assert result.decision in ("allow", "warn", "block"), (
        f"T08 FAILED: unexpected evaluate decision: {result.decision}"
    )

    print(f"T08 PASS — regression: existing discipline_wing imports unaffected by KN044 (engine decision={result.decision!r})")


# ── Runner ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    failures: list[str] = []
    tests = [
        test_valid_scan_returns_canonical_resolution,
        test_invalid_hash_returns_soft_deflect,
        test_battery_dispatch_register_entry_created,
        test_furnace_every_click_composition,
        test_slow_blade_rate_limit_composition,
        test_marked_exception_lb_source_eblet,
        test_graceful_when_ip_ledger_unavailable,
        test_regression_furnace_every_click_existing,
    ]
    for t in tests:
        try:
            t()
        except AssertionError as e:
            print(f"FAIL [{t.__name__}]: {e}", file=sys.stderr)
            failures.append(t.__name__)
        except Exception as e:
            import traceback
            print(f"ERROR [{t.__name__}]: {e}", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            failures.append(t.__name__)

    if failures:
        print(f"\n{len(failures)}/{len(tests)} tests FAILED: {failures}", file=sys.stderr)
        sys.exit(1)
    else:
        print(f"\nAll {len(tests)} KN044 tests PASSED")
        sys.exit(0)
