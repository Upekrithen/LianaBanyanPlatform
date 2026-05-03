"""
Pytest Plugin Wrapper for Stats-Capture Harness — KN-S1 / BP018
================================================================
Provides:
  - pytest fixture `stats_harness` for per-test harness setup/teardown
  - Auto-naming: test_id derived from pytest's request.node.nodeid
  - Auto-session injection: KNIGHT_SESSION_ID env var propagated
  - conftest.py registration: import this module in conftest to activate

Usage in test files:
  def test_something(stats_harness):
      harness = stats_harness()
      harness.tick({"assertion_index": 1})
      # assertions...
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Optional, Callable
import pytest

from the_shadow.stats_capture_harness import StatsCaptureHarness, TELEMETRY_ROOT


@pytest.fixture
def stats_harness(request: pytest.FixtureRequest):
    """
    Factory fixture: call stats_harness() to get a started harness.
    Automatically ends the harness on test teardown.
    """
    created_harnesses: list[StatsCaptureHarness] = []

    def factory(
        *,
        k_prompt_source: Optional[str] = None,
        k_prompt_section: Optional[str] = None,
        interval_seconds: float = 1.0,
        telemetry_root: Path = TELEMETRY_ROOT,
    ) -> StatsCaptureHarness:
        # Derive test_id from pytest node ID
        test_id = request.node.nodeid.replace("/", "_").replace("\\", "_").replace("::", "__").replace(".", "_")
        knight_session_id = os.environ.get("KNIGHT_SESSION_ID")
        knight_session_index = int(os.environ.get("KNIGHT_SESSION_INDEX", "1"))
        knight_session_total = int(os.environ.get("KNIGHT_SESSION_TOTAL", "1"))

        h = StatsCaptureHarness(
            test_id=test_id,
            test_file=str(request.fspath),
            knight_session_id=knight_session_id,
            knight_session_index=knight_session_index,
            knight_session_total=knight_session_total,
            interval_seconds=interval_seconds,
            telemetry_root=telemetry_root,
            k_prompt_source=k_prompt_source,
            k_prompt_section=k_prompt_section,
        )
        h.start()
        created_harnesses.append(h)
        return h

    yield factory

    # Teardown: end any harnesses not explicitly ended
    for h in created_harnesses:
        outcome = "pass" if not request.node.rep_call.failed else "fail" if hasattr(request.node, "rep_call") else "pass"
        try:
            h.end(outcome)
        except Exception:
            pass
