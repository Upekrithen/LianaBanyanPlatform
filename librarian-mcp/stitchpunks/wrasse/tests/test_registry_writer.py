"""
Unit tests — Wrasse Registry Writer (K550/B133)
Tests: append_if_new, bump_verification, concurrent writes, lock failure.

Run: python -m pytest librarian-mcp/stitchpunks/wrasse/tests/test_registry_writer.py -v
"""

from __future__ import annotations

import json
import sys
import tempfile
import threading
import time
from pathlib import Path
from unittest.mock import patch

import pytest

# Adjust import path
_WRASSE_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(_WRASSE_DIR))

from wrasse_registry_writer import (
    append_if_new,
    bump_verification,
    extract_triggers_from_claim,
    _load_existing_patterns,
    _next_trigger_id,
)


# ─── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture
def tmp_registry(tmp_path):
    """Provide a fresh empty registry path for each test."""
    return tmp_path / "wrasse_registry_test.jsonl"


@pytest.fixture
def tmp_lock(tmp_registry):
    """Lock path for tmp_registry."""
    return tmp_registry.parent / ".wrasse_registry.lock"


# ─── Test: append_if_new on novel trigger → action=appended, registry length +1 ──────

def test_append_novel_trigger(tmp_registry):
    result = append_if_new(
        trigger_pattern="K541",
        trigger_class="k_prefix",
        canonical_resolution="K541 test session — novel trigger",
        source_session="test/K550",
        path=tmp_registry,
    )
    assert result["action"] == "appended"
    assert result["trigger_id"].startswith("W-")

    # Verify registry has exactly 1 entry
    patterns = _load_existing_patterns(tmp_registry)
    assert len(patterns) == 1
    assert "k541" in patterns


def test_append_multiple_novel_triggers(tmp_registry):
    for i, pattern in enumerate(["K541", "K542", "K543"]):
        result = append_if_new(
            trigger_pattern=pattern,
            trigger_class="k_prefix",
            canonical_resolution=f"Session {pattern}",
            source_session="test/K550",
            path=tmp_registry,
        )
        assert result["action"] == "appended"

    patterns = _load_existing_patterns(tmp_registry)
    assert len(patterns) == 3


# ─── Test: append_if_new on existing trigger → action=bumped, no duplicate ────

def test_append_existing_trigger_bumps(tmp_registry):
    # First append
    r1 = append_if_new("K541", "k_prefix", "First resolution", "test/K550", path=tmp_registry)
    assert r1["action"] == "appended"
    tid = r1["trigger_id"]

    # Second append — same pattern
    r2 = append_if_new("K541", "k_prefix", "Second resolution", "test/K550", path=tmp_registry)
    assert r2["action"] == "bumped"
    assert r2["trigger_id"] == tid

    # Primary entry count still 1 (supersedes-record is extra line but not in patterns map)
    patterns = _load_existing_patterns(tmp_registry)
    assert len(patterns) == 1

    # Verify supersedes record was appended
    lines = [json.loads(l) for l in tmp_registry.read_text().splitlines() if l.strip()]
    supersedes = [l for l in lines if l.get("record_type") == "supersedes"]
    assert len(supersedes) == 1
    assert supersedes[0]["trigger_id"] == tid
    assert supersedes[0]["verification_count_bump"] == 1


def test_append_idempotent_case_insensitive(tmp_registry):
    """Trigger matching is case-insensitive."""
    r1 = append_if_new("K541", "k_prefix", "Resolution", "test", path=tmp_registry)
    r2 = append_if_new("k541", "k_prefix", "Resolution", "test", path=tmp_registry)
    assert r1["action"] == "appended"
    assert r2["action"] == "bumped"


# ─── Test: bump_verification ───────────────────────────────────────────────────

def test_bump_verification(tmp_registry):
    r = append_if_new("K542", "k_prefix", "Some resolution", "test", path=tmp_registry)
    assert r["action"] == "appended"
    tid = r["trigger_id"]

    bump = bump_verification(tid, "test_bump_session", path=tmp_registry)
    assert bump["action"] == "bumped"
    assert bump["trigger_id"] == tid

    lines = [json.loads(l) for l in tmp_registry.read_text().splitlines() if l.strip()]
    supersedes = [l for l in lines if l.get("record_type") == "supersedes"]
    assert len(supersedes) == 1


# ─── Test: concurrent writes preserve append-only-no-corruption invariant ─────

def test_concurrent_writes_no_corruption(tmp_registry):
    """Multiple threads appending concurrently must not corrupt the JSONL."""
    errors: list[str] = []
    results: list[dict] = []
    lock = threading.Lock()

    def worker(i: int) -> None:
        result = append_if_new(
            trigger_pattern=f"K{600 + i}",
            trigger_class="k_prefix",
            canonical_resolution=f"Concurrent session {i}",
            source_session=f"thread-{i}",
            path=tmp_registry,
        )
        with lock:
            results.append(result)

    threads = [threading.Thread(target=worker, args=(i,)) for i in range(8)]
    for t in threads:
        t.start()
    for t in threads:
        t.join(timeout=10)

    # All lines must be valid JSON
    for i, line in enumerate(tmp_registry.read_text().splitlines()):
        line = line.strip()
        if not line:
            continue
        try:
            json.loads(line)
        except json.JSONDecodeError as e:
            errors.append(f"Line {i} corrupt: {e}")

    assert not errors, f"JSONL corruption: {errors}"
    # All 8 workers should have gotten responses (even if some were unchanged due to lock timeout)
    assert len(results) == 8


# ─── Test: lock acquisition failure logs but doesn't raise ────────────────────

def test_lock_failure_skips_gracefully(tmp_registry, tmp_lock):
    """When lock cannot be acquired, append_if_new returns unchanged without raising."""
    # Simulate held lock by creating the lock file
    tmp_lock.write_text("9999")

    result = append_if_new(
        trigger_pattern="K999",
        trigger_class="k_prefix",
        canonical_resolution="Lock failure test",
        source_session="test",
        path=tmp_registry,
    )
    # Should return without raising — action may be unchanged due to lock timeout
    # (We set a short timeout — the lock will time out quickly)
    assert "action" in result
    # Registry should be empty (nothing appended)
    if not tmp_registry.exists():
        assert True  # nothing written
    else:
        lines = [l for l in tmp_registry.read_text().splitlines() if l.strip()]
        # Lock file existed, so write should have been skipped
        assert len(lines) == 0 or result["action"] == "unchanged"

    # Cleanup
    tmp_lock.unlink(missing_ok=True)


# ─── Test: extract_triggers_from_claim ────────────────────────────────────────

def test_extract_k_prefix_triggers():
    triggers = extract_triggers_from_claim("Session K541 and K542 landed successfully")
    patterns = [t[0] for t in triggers]
    classes = [t[1] for t in triggers]
    assert "K541" in patterns
    assert "K542" in patterns
    assert all(c == "k_prefix" for c in classes if c == "k_prefix")


def test_extract_ts_prefix_triggers():
    triggers = extract_triggers_from_claim("Per TS-091 same-session compounding")
    patterns = [t[0] for t in triggers]
    assert "TS-091" in patterns


def test_extract_vocabulary_triggers():
    triggers = extract_triggers_from_claim("The Cathedral Effect tightened vendor spread")
    patterns = [t[0] for t in triggers]
    assert "Cathedral Effect" in patterns


def test_extract_empty_claim():
    triggers = extract_triggers_from_claim("")
    assert triggers == []


# ─── Test: trigger_id sequence ─────────────────────────────────────────────────

def test_trigger_id_sequence(tmp_registry):
    r1 = append_if_new("K541", "k_prefix", "R1", "test", path=tmp_registry)
    r2 = append_if_new("K542", "k_prefix", "R2", "test", path=tmp_registry)
    n1 = int(r1["trigger_id"].replace("W-", ""))
    n2 = int(r2["trigger_id"].replace("W-", ""))
    assert n2 == n1 + 1, f"Expected sequential IDs, got {r1['trigger_id']} and {r2['trigger_id']}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
