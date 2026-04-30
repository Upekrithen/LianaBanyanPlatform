#!/usr/bin/env python3
"""
test_catechist_integration.py — KN036 Integration tests (3 session classes).

D.7: Integration tests cover:
  - PASS session (all rules pass)
  - WARN session (some rules warn, none fail)
  - FAIL session (at least one rule fails)
Plus:
  - Grader aggregation logic
  - Vine receipt section generation
  - Grade JSON write / read round-trip
  - INSUFFICIENT_DATA guard (D.8)

Run: python ~/.claude/hooks/tests/test_catechist_integration.py
"""

from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
from pathlib import Path

HOOKS_DIR = Path(__file__).parent.parent


def _load(name: str):
    spec = importlib.util.spec_from_file_location(name, HOOKS_DIR / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


rules_mod = _load("bishop_catechist_rules")
grader_mod = _load("bishop_catechist_grader")
vine_mod = _load("bishop_catechist_vine_extender")


PASS_COUNT = 0
FAIL_COUNT = 0
RESULTS: list[str] = []


def check(name: str, condition: bool, detail: str = "") -> None:
    global PASS_COUNT, FAIL_COUNT
    if condition:
        PASS_COUNT += 1
    else:
        FAIL_COUNT += 1
    marker = "[PASS]" if condition else "[FAIL]"
    RESULTS.append(f"  {marker} {name}{(' — ' + detail) if detail else ''}")


# ─── Helper fixtures ──────────────────────────────────────────────────────────

def _make_pass_results(n: int = 10) -> list[dict]:
    return [{"rule_id": f"R{i:02d}_test", "status": "PASS", "evidence": "ok"} for i in range(1, n+1)]


def _make_warn_results(n: int = 10) -> list[dict]:
    results = _make_pass_results(n)
    results[2]["status"] = "WARN"
    results[2]["evidence"] = "drift not surfaced"
    return results


def _make_fail_results(n: int = 10) -> list[dict]:
    results = _make_warn_results(n)
    results[5]["status"] = "FAIL"
    results[5]["evidence"] = "--no-verify used"
    return results


# ─── Integration Test 1: PASS session ────────────────────────────────────────

def test_integration_pass_session():
    rule_results = _make_pass_results()
    grade = grader_mod.aggregate(
        rule_results=rule_results,
        session_id="test-pass-session-id",
        session_name="TEST_PASS",
        checked_at_turn=10,
        insufficient_data=False,
        session_jsonl="/dev/null",
    )
    check("Integration PASS: grade is PASS when all rules pass", grade["grade"] == "PASS")
    check("Integration PASS: passed count = 10", grade["passed"] == 10)
    check("Integration PASS: warned count = 0", grade["warned"] == 0)
    check("Integration PASS: failed count = 0", grade["failed"] == 0)
    check("Integration PASS: chronos_signed = True", grade["chronos_signed"] is True)
    check("Integration PASS: chronos_signature starts with 'catechist-v1:'",
          grade["chronos_signature"].startswith("catechist-v1:"))


# ─── Integration Test 2: WARN session ────────────────────────────────────────

def test_integration_warn_session():
    rule_results = _make_warn_results()
    grade = grader_mod.aggregate(
        rule_results=rule_results,
        session_id="test-warn-session-id",
        session_name="TEST_WARN",
        checked_at_turn=8,
        insufficient_data=False,
        session_jsonl="/dev/null",
    )
    check("Integration WARN: grade is WARN when some WARN, no FAIL", grade["grade"] == "WARN")
    check("Integration WARN: warned count > 0", grade["warned"] > 0)
    check("Integration WARN: failed count = 0", grade["failed"] == 0)


# ─── Integration Test 3: FAIL session ────────────────────────────────────────

def test_integration_fail_session():
    rule_results = _make_fail_results()
    grade = grader_mod.aggregate(
        rule_results=rule_results,
        session_id="test-fail-session-id",
        session_name="TEST_FAIL",
        checked_at_turn=10,
        insufficient_data=False,
        session_jsonl="/dev/null",
    )
    check("Integration FAIL: grade is FAIL when any FAIL", grade["grade"] == "FAIL")
    check("Integration FAIL: failed count > 0", grade["failed"] > 0)


# ─── Grader: INSUFFICIENT_DATA guard (D.8) ───────────────────────────────────

def test_insufficient_data_guard():
    grade = grader_mod.aggregate(
        rule_results=[],
        session_id="test-id",
        session_name="TEST",
        checked_at_turn=1,
        insufficient_data=True,
        session_jsonl="/dev/null",
    )
    check("D.8 guard: grade is INSUFFICIENT_DATA", grade["grade"] == "INSUFFICIENT_DATA")


# ─── Grade JSON round-trip ────────────────────────────────────────────────────

def test_grade_json_round_trip():
    with tempfile.TemporaryDirectory() as tmpdir:
        # Temporarily patch STATE_DIR
        orig_state = grader_mod.STATE_DIR
        grader_mod.STATE_DIR = Path(tmpdir)

        rule_results = _make_pass_results()
        grade = grader_mod.aggregate(
            rule_results=rule_results,
            session_id="roundtrip-id-abc",
            session_name="ROUNDTRIP",
            checked_at_turn=10,
            insufficient_data=False,
            session_jsonl="/dev/null",
        )
        out_path = grader_mod.write_grade(grade, "roundtrip-id-abc", "ROUNDTRIP")

        grader_mod.STATE_DIR = orig_state  # restore

        if out_path is None:
            check("Grade JSON round-trip: file written", False, "write_grade returned None")
            return
        check("Grade JSON round-trip: file exists", out_path.exists())
        loaded = json.loads(out_path.read_text())
        check("Grade JSON round-trip: grade preserved", loaded["grade"] == grade["grade"])
        check("Grade JSON round-trip: session_id preserved", loaded["session_id"] == grade["session_id"])


# ─── Vine receipt section ─────────────────────────────────────────────────────

def test_vine_receipt_section():
    rule_results = _make_warn_results()
    grade = grader_mod.aggregate(
        rule_results=rule_results,
        session_id="vine-test-id",
        session_name="VINE_TEST",
        checked_at_turn=7,
        insufficient_data=False,
        session_jsonl="/dev/null",
    )
    section = vine_mod.build_receipt_section(grade)
    check("Vine receipt: contains Section 6 header",
          "Section 6 — Catechist Discipline Grade" in section)
    check("Vine receipt: contains WARN emoji or grade text",
          "WARN" in section)
    check("Vine receipt: contains rule table header",
          "| Rule |" in section)
    check("Vine receipt: non-empty", len(section) > 100)


# ─── Runner ──────────────────────────────────────────────────────────────────

def run_all():
    test_integration_pass_session()
    test_integration_warn_session()
    test_integration_fail_session()
    test_insufficient_data_guard()
    test_grade_json_round_trip()
    test_vine_receipt_section()

    print(f"\n{'='*60}")
    print("KN036 Integration Tests")
    print(f"{'='*60}")
    for line in RESULTS:
        print(line)
    print(f"{'='*60}")
    total = PASS_COUNT + FAIL_COUNT
    print(f"RESULT: {PASS_COUNT}/{total} PASS")
    if FAIL_COUNT > 0:
        print(f"  {FAIL_COUNT} FAILED")
        sys.exit(1)
    else:
        print("  ALL PASS")


if __name__ == "__main__":
    run_all()
