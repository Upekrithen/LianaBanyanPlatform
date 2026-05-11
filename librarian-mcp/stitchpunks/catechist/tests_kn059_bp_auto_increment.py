#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
tests_kn059_bp_auto_increment.py — KN059 + SR-017 Catechist R02 + Vine Receipt BP-Number tests.

Verifies (KN059 original):
  T2  Catechist R02 PASSES when Bishop announces BP-number (auto-detect path)
  T3  Catechist R02 PASSES when Bishop explicitly asks (legacy path — unchanged)
  T5  Founder-correction (opt-out) still satisfies R02
  T6  Catechist R02 WARNS when neither path detected (not FAIL — may be clean session)
  T8  BP*.docx takes priority over BishopClaudeCode*.txt for file detection

SR-017 G-Gate tests (BP037 ratified):
  T1/G2  bishop_next_bp.txt present → Vine reports correct value (priority 1)
  T4     get_codecopy_summary includes next_bp_display + next_bp_source fields
  T7/G5  all sources missing → returns None + display = "UNKNOWN — ASK FOUNDER"
  G3     txt absent → falls back to Coffee header <!-- NEXT_BP: BPNNN --> (priority 2)
  G4     txt + header absent → falls back to Coffee filename (priority 3)
  G6     conflict (txt ≠ Coffee header) → Coffee wins, conflict_drift surfaced

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
    compute_next_bp_full,
    compute_next_bp_from_txt,
    compute_next_bp_from_coffee_header,
    compute_next_bp_from_coffee_filename,
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


# ── T1 / G2: bishop_next_bp.txt present → use it (SR-017 Priority 1) ─────────
def test_t1_compute_next_bp_number():
    """G2: bishop_next_bp.txt present → Vine reports correct value (not docx-derived)."""
    import tempfile, shutil
    tmp_coffee = Path(tempfile.mkdtemp())
    tmp_txt = Path(tempfile.mkdtemp()) / "bishop_next_bp.txt"
    tmp_txt.write_text("BP006\n", encoding="utf-8")
    try:
        result = compute_next_bp_number(txt_path=tmp_txt, coffee_dir=tmp_coffee)
        check(
            "T1/G2 bishop_next_bp.txt present → returns 6",
            result == 6,
            f"Got: {result}",
        )
        full = compute_next_bp_full(txt_path=tmp_txt, coffee_dir=tmp_coffee)
        check(
            "T1/G2 source is bishop_next_bp_txt",
            full["source"] == "bishop_next_bp_txt",
            f"Got: {full['source']}",
        )
        check(
            "T1/G2 display is 'BP006'",
            full["display"] == "BP006",
            f"Got: {full['display']}",
        )
    finally:
        shutil.rmtree(str(tmp_txt.parent), ignore_errors=True)
        shutil.rmtree(str(tmp_coffee), ignore_errors=True)


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


# ── T4: codecopy summary includes next_bp fields (SR-017) ────────────────────
def test_t4_vine_receipt_next_bp_field():
    """T4: get_codecopy_summary includes all SR-017 next-BP fields."""
    import tempfile, shutil
    tmp_codecopy = _make_temp_dir_with_files(["BP004.docx", "BP005.docx"])
    tmp_coffee = Path(tempfile.mkdtemp())
    tmp_txt = Path(tempfile.mkdtemp()) / "bishop_next_bp.txt"
    tmp_txt.write_text("BP006\n", encoding="utf-8")
    try:
        summary = get_codecopy_summary(
            directory=tmp_codecopy, txt_path=tmp_txt, coffee_dir=tmp_coffee
        )
        check(
            "T4 get_codecopy_summary includes next_bp_number key",
            "next_bp_number" in summary,
            f"Keys: {list(summary.keys())}",
        )
        check(
            "T4 get_codecopy_summary includes next_bp_display key",
            "next_bp_display" in summary,
            f"Keys: {list(summary.keys())}",
        )
        check(
            "T4b next_bp_number is 6 (from bishop_next_bp.txt, not docx)",
            summary.get("next_bp_number") == 6,
            f"Got: {summary.get('next_bp_number')}",
        )
        check(
            "T4b next_bp_display is 'BP006'",
            summary.get("next_bp_display") == "BP006",
            f"Got: {summary.get('next_bp_display')}",
        )
        check(
            "T4c detected file is BP005.docx",
            summary.get("file_name", "").upper().startswith("BP005"),
            f"Got: {summary.get('file_name')}",
        )
    finally:
        import shutil as _shutil
        _shutil.rmtree(tmp_codecopy, ignore_errors=True)
        _shutil.rmtree(str(tmp_txt.parent), ignore_errors=True)
        _shutil.rmtree(str(tmp_coffee), ignore_errors=True)


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


# ── T7 / G5: genesis — all sources missing → None / UNKNOWN ──────────────────
def test_t7_compute_returns_none_when_empty():
    """G5: all three sources missing → returns None, display = UNKNOWN — ASK FOUNDER."""
    import tempfile, shutil
    tmp_empty = Path(tempfile.mkdtemp())
    tmp_no_txt = tmp_empty / "nonexistent_next_bp.txt"  # intentionally absent
    try:
        result = compute_next_bp_number(coffee_dir=tmp_empty, txt_path=tmp_no_txt)
        check(
            "T7/G5 all sources missing → compute_next_bp_number returns None",
            result is None,
            f"Got: {result}",
        )
        full = compute_next_bp_full(coffee_dir=tmp_empty, txt_path=tmp_no_txt)
        check(
            "T7/G5 display = 'UNKNOWN — ASK FOUNDER'",
            full["display"] == "UNKNOWN — ASK FOUNDER",
            f"Got: {full['display']}",
        )
        check(
            "T7/G5 source = 'none'",
            full["source"] == "none",
            f"Got: {full['source']}",
        )
    finally:
        shutil.rmtree(str(tmp_empty), ignore_errors=True)


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


# ── G3: txt removed → falls back to Coffee header ────────────────────────────
def test_g3_coffee_header_fallback():
    """G3: bishop_next_bp.txt absent → falls back to Coffee header <!-- NEXT_BP: BPNNN -->."""
    import tempfile, shutil
    tmp_coffee = Path(tempfile.mkdtemp())
    # Create a versioned coffee file with line 2 header
    coffee_file = tmp_coffee / "bishop_coffee.md.bp036_milestone_handoff_to_bp037"
    coffee_file.write_text(
        "# Bishop Coffee BP036 → BP037\n<!-- NEXT_BP: BP037 -->\nsome content\n",
        encoding="utf-8",
    )
    tmp_no_txt = tmp_coffee / "nonexistent_next_bp.txt"  # intentionally absent
    try:
        result = compute_next_bp_number(coffee_dir=tmp_coffee, txt_path=tmp_no_txt)
        check(
            "G3 txt absent → falls back to Coffee header → returns 37",
            result == 37,
            f"Got: {result}",
        )
        full = compute_next_bp_full(coffee_dir=tmp_coffee, txt_path=tmp_no_txt)
        check(
            "G3 source is coffee_header",
            full["source"] == "coffee_header",
            f"Got: {full['source']}",
        )
        check(
            "G3 display is 'BP037'",
            full["display"] == "BP037",
            f"Got: {full['display']}",
        )
    finally:
        shutil.rmtree(str(tmp_coffee), ignore_errors=True)


# ── G4: txt + header removed → falls back to Coffee filename ─────────────────
def test_g4_coffee_filename_fallback():
    """G4: txt absent + Coffee has no line-2 header → falls back to Coffee filename."""
    import tempfile, shutil
    tmp_coffee = Path(tempfile.mkdtemp())
    # Create a versioned coffee file WITHOUT the line-2 header
    coffee_file = tmp_coffee / "bishop_coffee.md.bp036_milestone_handoff_to_bp037"
    coffee_file.write_text(
        "# Bishop Coffee BP036 → BP037\nNo header on line 2.\nsome content\n",
        encoding="utf-8",
    )
    tmp_no_txt = tmp_coffee / "nonexistent_next_bp.txt"  # absent
    try:
        result = compute_next_bp_number(coffee_dir=tmp_coffee, txt_path=tmp_no_txt)
        check(
            "G4 txt absent + no header → parses Coffee filename → returns 37",
            result == 37,
            f"Got: {result}",
        )
        full = compute_next_bp_full(coffee_dir=tmp_coffee, txt_path=tmp_no_txt)
        check(
            "G4 source is coffee_filename",
            full["source"] == "coffee_filename",
            f"Got: {full['source']}",
        )
    finally:
        shutil.rmtree(str(tmp_coffee), ignore_errors=True)


# ── G6: conflict (txt ≠ Coffee header) → Coffee wins, drift surfaced ─────────
def test_g6_conflict_coffee_wins():
    """G6: txt says BP040, Coffee header says BP041 → Coffee wins, conflict_drift set."""
    import tempfile, shutil
    tmp_coffee = Path(tempfile.mkdtemp())
    coffee_file = tmp_coffee / "bishop_coffee.md.bp040_handoff_to_bp041"
    coffee_file.write_text(
        "# Bishop Coffee BP040 → BP041\n<!-- NEXT_BP: BP041 -->\nsome content\n",
        encoding="utf-8",
    )
    tmp_txt = Path(tempfile.mkdtemp()) / "bishop_next_bp.txt"
    tmp_txt.write_text("BP040\n", encoding="utf-8")  # disagrees with Coffee header
    try:
        full = compute_next_bp_full(coffee_dir=tmp_coffee, txt_path=tmp_txt)
        check(
            "G6 conflict → Coffee wins → value = 41",
            full["value"] == 41,
            f"Got: {full['value']}",
        )
        check(
            "G6 source is coffee_header_conflict_resolution",
            full["source"] == "coffee_header_conflict_resolution",
            f"Got: {full['source']}",
        )
        check(
            "G6 conflict_drift is not None",
            full["conflict_drift"] is not None,
            f"Got: {full['conflict_drift']}",
        )
        check(
            "G6 conflict_drift.txt_says = 'BP040'",
            full["conflict_drift"]["txt_says"] == "BP040",
            f"Got: {full['conflict_drift'].get('txt_says')}",
        )
        check(
            "G6 conflict_drift.coffee_says = 'BP041'",
            full["conflict_drift"]["coffee_says"] == "BP041",
            f"Got: {full['conflict_drift'].get('coffee_says')}",
        )
        check(
            "G6 display is 'BP041'",
            full["display"] == "BP041",
            f"Got: {full['display']}",
        )
    finally:
        import shutil as _shutil
        _shutil.rmtree(str(tmp_txt.parent), ignore_errors=True)
        _shutil.rmtree(str(tmp_coffee), ignore_errors=True)


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
    # SR-017 G-Gates
    test_g3_coffee_header_fallback()
    test_g4_coffee_filename_fallback()
    test_g6_conflict_coffee_wins()

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
