#!/usr/bin/env python3
"""
test_catechist_rules.py — KN036 Rule evaluator tests (10 rules × 1 primary + edge cases).

D.7: Minimum 13 tests required (10 rule evaluators + 3 integration: PASS/WARN/FAIL sessions).
This file covers the 10 rule evaluators (one test each + edge cases = 14 tests total here).
Integration tests live in test_catechist_integration.py.

Run: python -m pytest ~/.claude/hooks/tests/test_catechist_rules.py -v
OR:  python ~/.claude/hooks/tests/test_catechist_rules.py
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

HOOKS_DIR = Path(__file__).parent.parent

def _load(name: str):
    spec = importlib.util.spec_from_file_location(name, HOOKS_DIR / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

rules = _load("bishop_catechist_rules")


def _tool_turn(tool_name: str) -> dict:
    return {"role": "assistant", "content": [{"type": "tool_use", "name": tool_name}]}


def _user(text: str) -> dict:
    return {"role": "user", "content": [{"type": "text", "text": text}]}


def _asst(text: str) -> dict:
    return {"role": "assistant", "content": [{"type": "text", "text": text}]}


# ─── Tests ──────────────────────────────────────────────────────────────────

PASS_COUNT = 0
FAIL_COUNT = 0
RESULTS: list[str] = []


def check(name: str, condition: bool, detail: str = "") -> None:
    global PASS_COUNT, FAIL_COUNT
    status = "PASS" if condition else "FAIL"
    if condition:
        PASS_COUNT += 1
    else:
        FAIL_COUNT += 1
    marker = "[PASS]" if condition else "[FAIL]"
    RESULTS.append(f"  {marker} {name}{(' — ' + detail) if detail else ''}")


# ─── Rule 1 ─────────────────────────────────────────────────────────────────

def test_rule01_pass():
    turns = [_tool_turn("mcp__librarian__brief_me"), _user("hello")]
    r = rules.rule_01_brief_me_first(turns)
    check("R01 PASS when brief_me is first tool call", r["status"] == "PASS")

def test_rule01_fail():
    turns = [_tool_turn("Read"), _user("hello")]
    r = rules.rule_01_brief_me_first(turns)
    check("R01 FAIL when first tool is not brief_me", r["status"] == "FAIL")

def test_rule01_warn_no_tools():
    turns = [_user("hello")]
    r = rules.rule_01_brief_me_first(turns)
    check("R01 WARN when no tool calls", r["status"] == "WARN")


# ─── Rule 2 ─────────────────────────────────────────────────────────────────

def test_rule02_pass():
    turns = [_asst("What is your codecopy number?"), _user("077")]
    r = rules.rule_02_codecopy_ask_second(turns)
    check("R02 PASS when codecopy ask detected", r["status"] == "PASS")

def test_rule02_warn_no_ask():
    turns = [_asst("Here is the plan."), _user("proceed")]
    r = rules.rule_02_codecopy_ask_second(turns)
    check("R02 WARN when no codecopy ask", r["status"] == "WARN")

def test_rule02_pass_explicit_skip():
    turns = [_user("no codecopy today, skip it"), _asst("Understood.")]
    r = rules.rule_02_codecopy_ask_second(turns)
    check("R02 PASS when Founder explicitly skips codecopy", r["status"] == "PASS")


# ─── Rule 3 ─────────────────────────────────────────────────────────────────

def test_rule03_pass():
    turns = [_asst("Surfacing drift findings before queue work."), _user("ok")]
    r = rules.rule_03_drift_surfaced(turns)
    check("R03 PASS when drift mentioned", r["status"] == "PASS")

def test_rule03_warn():
    turns = [_asst("Let us begin the task."), _user("ok")]
    r = rules.rule_03_drift_surfaced(turns)
    check("R03 WARN when no drift mention", r["status"] == "WARN")


# ─── Rule 4 ─────────────────────────────────────────────────────────────────

def test_rule04_pass():
    turns = [_asst("WRASSE PRE-INJECTION block absorbed."), _user("ok")]
    r = rules.rule_04_wrasse_absorbed(turns)
    check("R04 PASS when WRASSE PRE-INJECTION detected", r["status"] == "PASS")

def test_rule04_warn():
    turns = [_asst("Starting session."), _user("ok")]
    r = rules.rule_04_wrasse_absorbed(turns)
    check("R04 WARN when no WRASSE mention", r["status"] == "WARN")


# ─── Rule 5 ─────────────────────────────────────────────────────────────────

def test_rule05_pass():
    turns = [_tool_turn("mcp__librarian__brief_me"), _user("hello")]
    r = rules.rule_05_augur_fresh(turns)
    check("R05 PASS when brief_me tool call present", r["status"] == "PASS")

def test_rule05_warn():
    turns = [_user("hello"), _asst("OK")]
    r = rules.rule_05_augur_fresh(turns)
    check("R05 WARN when no Augur calls", r["status"] == "WARN")


# ─── Rule 6 ─────────────────────────────────────────────────────────────────

def test_rule06_pass():
    turns = [_asst("git commit -m 'feat: something'")]
    r = rules.rule_06_no_verify_absent(turns)
    check("R06 PASS when --no-verify absent", r["status"] == "PASS")

def test_rule06_fail():
    turns = [_asst("git commit --no-verify -m 'skip'")]
    r = rules.rule_06_no_verify_absent(turns)
    check("R06 FAIL when --no-verify present", r["status"] == "FAIL")


# ─── Rule 7 ─────────────────────────────────────────────────────────────────

def test_rule07_pass():
    turns = [_asst("Tag-on-close: v-catechist-scribe-mvp-KN036")]
    r = rules.rule_07_tag_convention(turns)
    check("R07 PASS when valid tag-on-close present", r["status"] == "PASS")

def test_rule07_warn():
    turns = [_asst("Working on the task.")]
    r = rules.rule_07_tag_convention(turns)
    check("R07 WARN when no tag visible yet", r["status"] == "WARN")


# ─── Rule 8 ─────────────────────────────────────────────────────────────────

def test_rule08_pass():
    turns = [_asst("Let us proceed with the implementation.")]
    r = rules.rule_08_no_counsel_gate(turns)
    check("R08 PASS when no counsel-gate language", r["status"] == "PASS")

def test_rule08_fail():
    turns = [_asst("We need to wait for counsel before we proceed.")]
    r = rules.rule_08_no_counsel_gate(turns)
    check("R08 FAIL when counsel-gate language present", r["status"] == "FAIL")


# ─── Rule 9 ─────────────────────────────────────────────────────────────────

def test_rule09_pass():
    turns = [_asst("Here is the implementation.")]
    r = rules.rule_09_no_prose_timing_pressure(turns)
    check("R09 PASS when no prose-timing pressure", r["status"] == "PASS")

def test_rule09_fail():
    turns = [_asst("I will pre-draft prose before Founder approval.")]
    r = rules.rule_09_no_prose_timing_pressure(turns)
    check("R09 FAIL when prose-timing pressure present", r["status"] == "FAIL")


# ─── Rule 10 ────────────────────────────────────────────────────────────────

def test_rule10_pass():
    turns = [_asst("The implementation looks correct based on the test results.")]
    r = rules.rule_10_empirical_praise_only(turns)
    check("R10 PASS when empirically grounded language", r["status"] == "PASS")

def test_rule10_warn():
    turns = [_asst("This is absolutely brilliant! What an amazing idea!")]
    r = rules.rule_10_empirical_praise_only(turns)
    check("R10 WARN when hollow/hyperbolic praise detected", r["status"] == "WARN")


# ─── Runner ──────────────────────────────────────────────────────────────────

def run_all():
    test_rule01_pass()
    test_rule01_fail()
    test_rule01_warn_no_tools()
    test_rule02_pass()
    test_rule02_warn_no_ask()
    test_rule02_pass_explicit_skip()
    test_rule03_pass()
    test_rule03_warn()
    test_rule04_pass()
    test_rule04_warn()
    test_rule05_pass()
    test_rule05_warn()
    test_rule06_pass()
    test_rule06_fail()
    test_rule07_pass()
    test_rule07_warn()
    test_rule08_pass()
    test_rule08_fail()
    test_rule09_pass()
    test_rule09_fail()
    test_rule10_pass()
    test_rule10_warn()

    print(f"\n{'='*60}")
    print("KN036 Rule Evaluator Tests")
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
