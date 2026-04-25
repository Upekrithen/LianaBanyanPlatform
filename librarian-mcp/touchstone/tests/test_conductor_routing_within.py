"""
Tests for conductor_routing_within Touchstone predicate
K446a · Phase 2.3 · Innovation #2277

Three test cases:
  1. Within budget — PASS
  2. At budget edge — PASS (boundary inclusive)
  3. Over budget — FAIL

All tests use observed_latency_ms (explicit) to avoid dependency on
scribe_Conductor.jsonl state in CI.

Run:
    cd librarian-mcp
    python -m pytest touchstone/tests/test_conductor_routing_within.py -v
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from touchstone.predicates.conductor_routing_within import check


def test_within_budget():
    """Routing completes in 20ms against 50ms budget — should PASS."""
    result = check({"max_latency_ms": 50, "observed_latency_ms": 20})
    assert result["passed"] is True
    assert result["observed"] == 20.0
    assert "within" in result["message"]


def test_at_budget_edge():
    """Routing completes in exactly 50ms against 50ms budget — should PASS (inclusive)."""
    result = check({"max_latency_ms": 50, "observed_latency_ms": 50})
    assert result["passed"] is True
    assert result["observed"] == 50.0
    assert "within" in result["message"]


def test_over_budget():
    """Routing takes 120ms against 50ms budget — should FAIL."""
    result = check({"max_latency_ms": 50, "observed_latency_ms": 120})
    assert result["passed"] is False
    assert result["observed"] == 120.0
    assert "EXCEEDS" in result["message"]


def test_missing_max_latency_ms():
    """Missing required arg returns FAIL with descriptive message."""
    result = check({"observed_latency_ms": 20})
    assert result["passed"] is False
    assert "max_latency_ms" in result["message"]


def test_invalid_max_latency_ms():
    """Non-integer max_latency_ms returns FAIL with descriptive message."""
    result = check({"max_latency_ms": "not-a-number", "observed_latency_ms": 20})
    assert result["passed"] is False
    assert "Invalid" in result["message"]
