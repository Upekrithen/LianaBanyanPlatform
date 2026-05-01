#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
tests_kn059_bp_auto_increment.py — KN059 Catechist R02 + Vine Receipt BP-Number tests.

Verifies:
  T1  Auto-detect highest BP*.docx returns correct next number
  T2  Catechist R02 PASSES when Bishop announces BP-number (auto-detect path)
  T3  Catechist R02 PASSES when Bishop explicitly asks (legacy path — unchanged)
  T4  Vine Receipt / codecopy summary includes next_bp_number field
  T5  Founder-correction (opt-out) still satisfies R02
  T6  Catechist R02 WARNS when neither path detected (not FAIL — may be clean session)
  T7  compute_next_bp_number returns None when no BP*.docx files present
  T8  BP*.docx takes priority over BishopClaudeCode*.txt when both exist

Run: python librarian-mcp/stitchpunks/catechist/tests_kn059_bp_auto_increment.py
"""
from __future__ import annotations

import io
import sys
import tempfile
from pathlib import Path
from unittest import mock

# Force UTF-8 stdout
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
else:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# ── Bootstrap sys.path ────────────────────────────────────────────────────────
_CATECHIST_DIR = Path(__file__).parent
_STITCHPUNKS = _CATECHIST_DIR.parent
sys.path.insert(0, str(_STITCHPUNKS))
sys.path.insert(0, str(_STITCHPUNKS.parent.parent))  # workspace root

from catechist.bishop_catechist_rules import (  # noqa: E402
    rule_02_codecopy_ask_second,
    _BP_AUTODETECT_PATTERNS,
    _CODECOPY_ASK_PATTERNS,
)
from vine_transfer.codecopy_detector import (  # noqa: E402
    compute_next_bp_number,
    get_codecopy_summary,
    detect_latest_codecopy,
    BP_DOCX_PATTERN,
    LEGACY_PATTERN,
)

# ── Tiny test harness ─────────────────────────────────────────────────────────
PASS_COUNT = 0
FAIL_COUNT = 0
RESULTS: list[str] = []


def check(name: str, condition: bool, detail: str = "") -> None:
    global PASS_COUNT, FAIL_COUNT
    if condition:
        PASS_COUNT += 1
        RESULTS.append(f"  [PASS] {name}{(' — ' + detail) if detail else ''}")
    else:
        FAIL_COUNT += 1
        RESULTS.append(f"  [FAIL] {name}{(' — ' + detail) if detail else ''}")


# ── Helpers ────────────────────────────────────────────────────────────────────
def _asst(text: str) -> dict:
    return {"role": "assistant", "content": [{"type": "text", "text": text}]}


def _user(text: str) -> dict:
    return {"role": "user", "content": [{"type": "text", "text": text}]}


def _tool_turn(tool_name: str) -> dict:
    return {"role": "assistant", "content": [{"type": "tool_use", "name": tool_name}]}


def _make_temp_dir_with_files(files: list[str]) -> Path:
    """Create a temp dir, touch each filename, return the dir path."""
    tmp = Path(tempfile.mkdtemp())
    for name in files:
        (tmp / name).write_bytes(b"placeholder")
    return tmp


# ── T1: compute_next_bp_number returns highest + 1 ───────────────────────────
def test_t1_compute_next_bp_number():
    tmp = _make_temp_dir_with_files(["BP004.docx", "BP005.docx", "BP003.docx"])
    try:
        result = compute_next_bp_number(tmp)
        check(
            "T1 compute_next_bp_number returns 6 when highest is BP005",
            result == 6,
            f"Got: {result}",
        )
    finally:
        import shutil
        shutil.rmtree(tmp, ignore_errors=True)


# ── T2: R02 PASSES on auto-detect+announce path ──────────────────────────────
def test_t2_r02_passes_on_auto_announce():
    # Simulate Bishop saying "This session opens as BP006" in first response
    turns = [
        _tool_turn("mcp__librarian__brief_me"),
        _asst("brief_me returned. This session opens as BP006. Prior session was BP005."),
    ]
    result = rule_02_codecopy_ask_second(turns)
    check(
        "T2 R02 PASS when Bishop announces 'BP006' (auto-detect path)",
        result["status"] == "PASS",
        f"Status: {result['status']} | Evidence: {result['evidence'][:80]}",
    )
    check(
        "T2b evidence mentions auto-detect or BP005 path",
        "BP005" in result["evidence"] or "auto-detect" in result["evidence"].lower() or "auto" in result["evidence"].lower(),
        f"Evidence: {result['evidence'][:100]}",
    )

    # Also test with "next BP number" phrasing
    turns2 = [
        _tool_turn("mcp__librarian__brief_me"),
        _asst("Context loaded. Next BP number is BP007 based on auto-detection of highest BP*.docx."),
    ]
    result2 = rule_02_codecopy_ask_second(turns2)
    check(
        "T2c R02 PASS on 'next BP number' phrasing",
        result2["status"] == "PASS",
        f"Status: {result2['status']}",
    )

    # "highest BP005" phrasing
    turns3 = [
        _tool_turn("mcp__librarian__brief_me"),
        _asst("Auto-detected: highest BP005.docx in LianaBanyanKNIGHT. Next session will be BP006."),
    ]
    result3 = rule_02_codecopy_ask_second(turns3)
    check(
        "T2d R02 PASS on 'highest BP005' phrasing",
        result3["status"] == "PASS",
        f"Status: {result3['status']}",
    )


# ── T3: R02 PASSES on legacy explicit-ask path ───────────────────────────────
def test_t3_r02_passes_on_explicit_ask():
    turns = [
        _tool_turn("mcp__librarian__brief_me"),
        _asst("What is your BishopClaudeCode number for the prior session transcript?"),
    ]
    result = rule_02_codecopy_ask_second(turns)
    check(
        "T3 R02 PASS on legacy BishopClaudeCode ask",
        result["status"] == "PASS",
        f"Status: {result['status']}",
    )

    turns2 = [
        _tool_turn("mcp__librarian__brief_me"),
        _asst("Please share the codecopy number for the prior session."),
    ]
    result2 = rule_02_codecopy_ask_second(turns2)
    check(
        "T3b R02 PASS on 'codecopy number' explicit ask",
        result2["status"] == "PASS",
        f"Status: {result2['status']}",
    )


# ── T4: codecopy summary includes next_bp_number ─────────────────────────────
def test_t4_vine_receipt_next_bp_field():
    tmp = _make_temp_dir_with_files(["BP004.docx", "BP005.docx"])
    try:
        summary = get_codecopy_summary(directory=tmp)
        check(
            "T4 get_codecopy_summary includes next_bp_number key",
            "next_bp_number" in summary,
            f"Keys: {list(summary.keys())}",
        )
        check(
            "T4b next_bp_number is 6 (highest BP005 + 1)",
            summary.get("next_bp_number") == 6,
            f"Got: {summary.get('next_bp_number')}",
        )
        check(
            "T4c detected file is BP005.docx",
            summary.get("file_name", "").upper().startswith("BP005"),
            f"Got: {summary.get('file_name')}",
        )
    finally:
        import shutil
        shutil.rmtree(tmp, ignore_errors=True)


# ── T5: Founder opt-out still satisfies R02 ──────────────────────────────────
def test_t5_founder_correction_opt_out():
    turns = [
        _tool_turn("mcp__librarian__brief_me"),
        _asst("Would you like to share the codecopy number?"),
        _user("no codecopy, skip it"),
        _asst("Understood, skipping codecopy."),
    ]
    result = rule_02_codecopy_ask_second(turns)
    check(
        "T5 R02 PASS when Founder says 'no codecopy'",
        result["status"] == "PASS",
        f"Status: {result['status']} | Evidence: {result['evidence'][:80]}",
    )


# ── T6: R02 WARNS (not FAILS) when neither path detected ─────────────────────
def test_t6_r02_warns_when_neither_detected():
    turns = [
        _tool_turn("mcp__librarian__brief_me"),
        _asst("I see the drift report. Let me proceed with queue work."),
    ]
    result = rule_02_codecopy_ask_second(turns)
    check(
        "T6 R02 WARN (not FAIL) when no BP-announce or codecopy ask",
        result["status"] == "WARN",
        f"Status: {result['status']} | Evidence: {result['evidence'][:80]}",
    )


# ── T7: compute_next_bp_number returns None when no BP*.docx ─────────────────
def test_t7_compute_returns_none_when_empty():
    tmp = _make_temp_dir_with_files(["someotherfile.txt", "BishopClaudeCode077.txt"])
    try:
        result = compute_next_bp_number(tmp)
        check(
            "T7 compute_next_bp_number returns None when no BP*.docx present",
            result is None,
            f"Got: {result}",
        )
    finally:
        import shutil
        shutil.rmtree(tmp, ignore_errors=True)


# ── T8: BP*.docx takes priority over BishopClaudeCode*.txt ───────────────────
def test_t8_bp_docx_priority():
    # Both formats present — BP*.docx should win
    tmp = _make_temp_dir_with_files(["BP005.docx", "BishopClaudeCode099.txt"])
    try:
        path, status = detect_latest_codecopy(tmp)
        check(
            "T8 detect_latest_codecopy returns BP*.docx over legacy .txt",
            path is not None and BP_DOCX_PATTERN.match(path.name) is not None,
            f"Got: {path.name if path else None}",
        )
        check(
            "T8b status is 'found'",
            status == "found",
            f"Got: {status}",
        )
    finally:
        import shutil
        shutil.rmtree(tmp, ignore_errors=True)


# ── Runner ────────────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("KN059 — Catechist R02 + Vine Receipt BP-Number Auto-Increment Tests")
    print("=" * 60)

    test_t1_compute_next_bp_number()
    test_t2_r02_passes_on_auto_announce()
    test_t3_r02_passes_on_explicit_ask()
    test_t4_vine_receipt_next_bp_field()
    test_t5_founder_correction_opt_out()
    test_t6_r02_warns_when_neither_detected()
    test_t7_compute_returns_none_when_empty()
    test_t8_bp_docx_priority()

    print()
    for r in RESULTS:
        print(r)
    print()
    total = PASS_COUNT + FAIL_COUNT
    print(f"Results: {PASS_COUNT}/{total} passed")
    if FAIL_COUNT:
        print(f"FAIL — {FAIL_COUNT} test(s) failed")
        sys.exit(1)
    else:
        print("ALL PASS")
        sys.exit(0)


if __name__ == "__main__":
    main()
