#!/usr/bin/env python3
"""
tests_kn041.py — KN041 Catechist R01 ToolSearch-Whitelist tests.

4 tests (minimum per KN041 Phase D):
  T01 toolsearch_briefme_pattern_passes_r01
  T02 toolsearch_other_pattern_still_fails_r01
  T03 brief_me_first_directly_still_passes
  T04 arbitrary_first_tool_still_fails

All tests check rule_01_brief_me_first ONLY; no other rules affected.
"""
from __future__ import annotations

import sys
import os

_HERE = os.path.dirname(__file__)
_REPO = os.path.abspath(os.path.join(_HERE, "..", "..", ".."))
if _REPO not in sys.path:
    sys.path.insert(0, _REPO)

from librarian_mcp.stitchpunks.catechist.bishop_catechist_rules import rule_01_brief_me_first  # noqa: E402


def _make_tool_turn(tool_name: str, tool_input: dict | None = None) -> dict:
    """Create an assistant turn with a single tool_use block."""
    return {
        "role": "assistant",
        "content": [
            {
                "type": "tool_use",
                "name": tool_name,
                "input": tool_input or {},
            }
        ],
    }


# ---------------------------------------------------------------------------
# T01 — ToolSearch loading brief_me schema, then brief_me → PASS
# ---------------------------------------------------------------------------

def test_toolsearch_briefme_pattern_passes_r01() -> None:
    turns = [
        _make_tool_turn("ToolSearch", {"query": "select:mcp__librarian__brief_me"}),
        _make_tool_turn("mcp__librarian__brief_me", {"task": "KN041 catechist test"}),
    ]
    result = rule_01_brief_me_first(turns)
    assert result["status"] == "PASS", (
        f"T01 FAILED: expected PASS got {result['status']!r} — {result['evidence']}"
    )
    assert "deferred-tool harness pattern" in result["evidence"], (
        f"T01 FAILED: evidence should mention deferred-tool pattern — {result['evidence']}"
    )
    print("T01 PASS — ToolSearch+brief_me pattern grades PASS")


# ---------------------------------------------------------------------------
# T02 — ToolSearch loading non-brief_me tool, then brief_me → FAIL
# ---------------------------------------------------------------------------

def test_toolsearch_other_pattern_still_fails_r01() -> None:
    turns = [
        _make_tool_turn("ToolSearch", {"query": "select:mcp__librarian__get_schema"}),
        _make_tool_turn("mcp__librarian__brief_me", {"task": "should fail"}),
    ]
    result = rule_01_brief_me_first(turns)
    assert result["status"] == "FAIL", (
        f"T02 FAILED: expected FAIL got {result['status']!r} — {result['evidence']}"
    )
    print("T02 PASS — ToolSearch(non-brief_me) still fails R01")


# ---------------------------------------------------------------------------
# T03 — Direct brief_me as first tool → PASS (no regression)
# ---------------------------------------------------------------------------

def test_brief_me_first_directly_still_passes() -> None:
    turns = [
        _make_tool_turn("mcp__librarian__brief_me", {"task": "direct first"}),
    ]
    result = rule_01_brief_me_first(turns)
    assert result["status"] == "PASS", (
        f"T03 FAILED: expected PASS got {result['status']!r} — {result['evidence']}"
    )
    print("T03 PASS — direct brief_me-first still PASS (no regression)")


# ---------------------------------------------------------------------------
# T04 — Arbitrary first tool (Bash, Read, etc.) → FAIL
# ---------------------------------------------------------------------------

def test_arbitrary_first_tool_still_fails() -> None:
    for first_tool in ("Bash", "Read", "Write", "mcp__other__something"):
        turns = [
            _make_tool_turn(first_tool, {}),
            _make_tool_turn("mcp__librarian__brief_me", {"task": "too late"}),
        ]
        result = rule_01_brief_me_first(turns)
        assert result["status"] == "FAIL", (
            f"T04 FAILED for tool '{first_tool}': expected FAIL got {result['status']!r}"
        )
    print("T04 PASS — arbitrary first tool (Bash/Read/Write/mcp_other) still fails R01")


# ---------------------------------------------------------------------------
# T05 — ToolSearch with brief_me pattern but NO following brief_me → FAIL
# ---------------------------------------------------------------------------

def test_toolsearch_briefme_without_followup_fails() -> None:
    """ToolSearch loads brief_me schema but doesn't follow with brief_me call."""
    turns = [
        _make_tool_turn("ToolSearch", {"query": "select:mcp__librarian__brief_me"}),
        _make_tool_turn("Write", {"file_path": "foo.md", "content": "bar"}),
    ]
    result = rule_01_brief_me_first(turns)
    assert result["status"] == "FAIL", (
        f"T05 FAILED: expected FAIL got {result['status']!r} — {result['evidence']}"
    )
    print("T05 PASS — ToolSearch(brief_me) without brief_me followup fails R01")


# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    try:
        test_toolsearch_briefme_pattern_passes_r01()
        test_toolsearch_other_pattern_still_fails_r01()
        test_brief_me_first_directly_still_passes()
        test_arbitrary_first_tool_still_fails()
        test_toolsearch_briefme_without_followup_fails()
        print("\nAll KN041 tests PASSED (5/5)")
        sys.exit(0)
    except AssertionError as e:
        print(f"\nTEST FAILURE: {e}", file=sys.stderr)
        sys.exit(1)
