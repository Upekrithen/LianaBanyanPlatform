#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
tests_kn058_deadline_source.py — KN058 Vine Receipt Deadline-Source Refresh tests.

Verifies:
  T1  canonical_values.yaml is the source of truth (INDL-9 → 2026-05-07)
  T2  _load_canonical_deadlines() returns YAML values, not hardcoded fallback
  T3  Hardcoded fallback fires when YAML path is unreachable
  T4  Hardcoded fallback date is also corrected (2026-05-07, not 2026-04-30)
  T5  format_deadlines() surfaces INDL-9 deadline correctly when in window
  T6  get_deadlines_within_window() excludes expired deadlines

Run: python librarian-mcp/stitchpunks/vine_transfer/tests_kn058_deadline_source.py
"""
from __future__ import annotations

import io
import sys
import time
import types
from pathlib import Path
from unittest import mock

# Force UTF-8 stdout so emoji in format_deadlines() doesn't crash on Windows cp1252
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
else:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# ── Bootstrap sys.path ────────────────────────────────────────────────────────
_VINE_DIR = Path(__file__).parent
_STITCHPUNKS = _VINE_DIR.parent
sys.path.insert(0, str(_STITCHPUNKS))
sys.path.insert(0, str(_STITCHPUNKS.parent.parent))  # workspace root

from vine_transfer.deadline_checker import (  # noqa: E402
    _load_canonical_deadlines,
    _HARDCODED_DEADLINES,
    _CANONICAL_YAML,
    get_deadlines_within_window,
    format_deadlines,
    check_deadlines,
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


# ── T1: canonical_values.yaml contains 2026-05-07 INDL-9 date ────────────────
def test_t1_yaml_contains_correct_date():
    assert _CANONICAL_YAML.exists(), "canonical_values.yaml must exist"
    text = _CANONICAL_YAML.read_text(encoding="utf-8")
    check(
        "T1 YAML contains 2026-05-07 INDL-9 date",
        "2026-05-07" in text,
        f"YAML path: {_CANONICAL_YAML}",
    )
    # The description may mention the historical date as context; check only the iso field
    deadlines_block = _extract_deadlines_block(text)
    iso_lines = [l for l in deadlines_block.splitlines() if "_iso:" in l]
    check(
        "T1b No *_iso field in deadlines section contains old 2026-04-30 date",
        all("2026-04-30" not in l for l in iso_lines),
        f"ISO lines: {iso_lines}",
    )


def _extract_deadlines_block(text: str) -> str:
    """Extract only the deadlines: YAML block for targeted assertion."""
    in_block = False
    lines = []
    for line in text.splitlines():
        if line.strip() == "deadlines:":
            in_block = True
            continue
        if in_block:
            if line and not line.startswith(" ") and not line.startswith("\t"):
                break
            lines.append(line)
    return "\n".join(lines)


# ── T2: _load_canonical_deadlines() returns YAML values ──────────────────────
def test_t2_load_returns_yaml_values():
    deadlines = _load_canonical_deadlines()
    indl9 = next(
        (d for d in deadlines if "indl" in d["description"].lower() or "INDL" in d["description"]),
        None,
    )
    check(
        "T2 _load_canonical_deadlines returns INDL-9 entry",
        indl9 is not None,
        f"Got: {[d['description'] for d in deadlines]}",
    )
    if indl9:
        check(
            "T2b INDL-9 deadline_iso is 2026-05-07",
            "2026-05-07" in indl9["deadline_iso"],
            f"Got: {indl9['deadline_iso']}",
        )
        check(
            "T2c source is canonical_values_yaml (not hardcoded_fallback)",
            indl9["source"] == "canonical_values_yaml",
            f"Got: {indl9['source']}",
        )


# ── T3: hardcoded fallback fires when YAML is missing ────────────────────────
def test_t3_fallback_when_yaml_missing():
    with mock.patch(
        "vine_transfer.deadline_checker._CANONICAL_YAML",
        Path("/nonexistent/path/canonical_values.yaml"),
    ):
        deadlines = _load_canonical_deadlines()
    sources = {d["source"] for d in deadlines}
    check(
        "T3 fallback returns hardcoded_fallback when YAML missing",
        "hardcoded_fallback" in sources,
        f"Sources: {sources}",
    )


# ── T4: hardcoded fallback dates are corrected (not 2026-04-30) ──────────────
def test_t4_hardcoded_fallback_corrected():
    for d in _HARDCODED_DEADLINES:
        if "indl" in d["description"].lower() or "INDL" in d["description"]:
            check(
                "T4 Hardcoded fallback INDL-9 date is 2026-05-07",
                "2026-05-07" in d["deadline_iso"],
                f"Got: {d['deadline_iso']}",
            )
            check(
                "T4b Hardcoded fallback INDL-9 date is NOT 2026-04-30",
                "2026-04-30" not in d["deadline_iso"],
                f"Got: {d['deadline_iso']}",
            )
            return
    check("T4 Hardcoded fallback contains INDL-9 entry", False, "No INDL-9 in fallback")


# ── T5: format_deadlines surfaces correct deadline text ──────────────────────
def test_t5_format_deadlines():
    # Create a fake deadline within the window
    fake_ts = time.time() + 3 * 86400  # 3 days from now
    deadlines = [{"description": "INDL-9 Geneva submission deadline", "deadline_ts": fake_ts, "source": "test"}]
    formatted = format_deadlines(deadlines)
    check(
        "T5 format_deadlines includes INDL-9 label",
        "INDL-9" in formatted,
        f"Got: {formatted[:120]}",
    )
    check(
        "T5b format_deadlines shows 1 item count",
        "1 item" in formatted,
        f"Got: {formatted[:80]}",
    )


# ── T6: get_deadlines_within_window excludes past dates ──────────────────────
def test_t6_excludes_expired():
    # Patch _load_canonical_deadlines to return a past deadline
    past_deadline = [{"description": "Past event", "deadline_iso": "2020-01-01T00:00:00Z", "source": "test"}]
    with mock.patch("vine_transfer.deadline_checker._load_canonical_deadlines", return_value=past_deadline):
        result = get_deadlines_within_window(window_days=7, chronicler_dir=Path("/nonexistent"))
    check(
        "T6 expired deadlines are excluded from window",
        all(d["description"] != "Past event" for d in result),
        f"Got {len(result)} deadlines",
    )


# ── Runner ────────────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("KN058 — Vine Receipt Deadline-Source Refresh Tests")
    print("=" * 60)

    test_t1_yaml_contains_correct_date()
    test_t2_load_returns_yaml_values()
    test_t3_fallback_when_yaml_missing()
    test_t4_hardcoded_fallback_corrected()
    test_t5_format_deadlines()
    test_t6_excludes_expired()

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
