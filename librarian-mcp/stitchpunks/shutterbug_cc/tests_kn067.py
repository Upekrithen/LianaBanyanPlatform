#!/usr/bin/env python3
"""tests_kn067.py — KN067 Shutterbug Phase-E Trigger tests.

Exercises the new Phase-E pattern detection + dedup + filename-enrichment
added to bishop_shutterbug_watcher.py per BP005 Pod AB.

Run: python tests_kn067.py
"""
from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
from pathlib import Path

HOOKS_DIR = Path(__file__).parent
WATCHER_PATH = HOOKS_DIR / "bishop_shutterbug_watcher.py"

# Load watcher as a module (without running its main loop)
spec = importlib.util.spec_from_file_location("bishop_shutterbug_watcher", WATCHER_PATH)
watcher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(watcher)

PASS = "[PASS]"
FAIL = "[FAIL]"

results: list[tuple[str, str, str]] = []


def _check(name: str, ok: bool, detail: str = "") -> None:
    results.append((name, PASS if ok else FAIL, detail))


# ── T01: git commit pattern matches ──────────────────────────────────────────

def test_t01_commit_pattern_matches() -> None:
    cases = [
        "git commit -m 'foo'",
        "  git commit",
        "git commit -m \"feat: KN067\"",
        "git commit --amend",
    ]
    all_match = all(watcher.GIT_COMMIT_PATTERN.search(c) for c in cases)
    _check("T01 git_commit_pattern_matches", all_match, f"matched {sum(1 for c in cases if watcher.GIT_COMMIT_PATTERN.search(c))}/{len(cases)}")
    # Negative
    neg_cases = ["git status", "git push", "git diff", "ls"]
    no_false_pos = all(not watcher.GIT_COMMIT_PATTERN.search(c) for c in neg_cases)
    _check("T01b git_commit_no_false_positive", no_false_pos)


def test_t02_tag_pattern_matches() -> None:
    cases = [
        "git tag v-foo-bar",
        "git tag -a v-baz <sha>",
        "  git tag",
    ]
    all_match = all(watcher.GIT_TAG_PATTERN.search(c) for c in cases)
    _check("T02 git_tag_pattern_matches", all_match)
    # Tag extraction
    extracted = watcher.TAG_EXTRACT_PATTERN.search("git tag -a v-shutterbug-phase-e-trigger-KN067")
    tag_ok = extracted and extracted.group(1) == "v-shutterbug-phase-e-trigger-KN067"
    _check("T02b tag_name_extraction", bool(tag_ok), f"extracted={extracted.group(1) if extracted else None}")


def test_t03_dedup_window_logic() -> None:
    """Simulate dedup: two events within 30s window → only first should fire (others skipped)."""
    from bishop_shutterbug_watcher import PHASE_E_DEDUP_WINDOW_SECS, SessionRecord
    r = SessionRecord(Path("/tmp/fake.jsonl"), "knight", 0.0, 0.0)
    now = 1000.0
    r.recent_phase_e.append(now)  # First capture fired
    # Within window
    r.recent_phase_e_pruned = [t for t in r.recent_phase_e if (now + 10 - t) < PHASE_E_DEDUP_WINDOW_SECS]
    _check("T03 dedup_within_window", len(r.recent_phase_e_pruned) == 1, f"recent={r.recent_phase_e_pruned}")
    # Outside window
    later = now + PHASE_E_DEDUP_WINDOW_SECS + 5
    r.recent_phase_e_pruned = [t for t in r.recent_phase_e if (later - t) < PHASE_E_DEDUP_WINDOW_SECS]
    _check("T03b dedup_window_expires", len(r.recent_phase_e_pruned) == 0, "no pre-existing capture in window")


def test_t04_filename_suffix_with_tag() -> None:
    suffix = watcher._phase_e_label_suffix({"type": "tag", "sha": None, "tag": "v-shutterbug-phase-e-trigger-KN067", "command": ""})
    expected_substr = "PhaseE_tag_v-shutterbug-phase-e-trigger-KN067"
    _check("T04 filename_suffix_with_tag", expected_substr in suffix, f"got={suffix!r}")


def test_t04b_filename_suffix_with_sha() -> None:
    suffix = watcher._phase_e_label_suffix({"type": "commit", "sha": "0696f31abcdef", "tag": None, "command": ""})
    expected_substr = "PhaseE_commit_0696f31"
    _check("T04b filename_suffix_with_sha", expected_substr in suffix, f"got={suffix!r}")


def test_t04c_filename_suffix_sanitization() -> None:
    """Tag with unsafe chars should be sanitized to filename-safe."""
    suffix = watcher._phase_e_label_suffix({"type": "tag", "sha": None, "tag": "v-foo/bar:baz weird*", "command": ""})
    has_no_unsafe = "/" not in suffix and ":" not in suffix and "*" not in suffix and " " not in suffix
    _check("T04c filename_suffix_sanitization", has_no_unsafe, f"got={suffix!r}")


def test_t05_scan_phase_e_synthetic_jsonl() -> None:
    """Write a synthetic JSONL with a git-commit tool_use; verify _scan_phase_e_events finds it."""
    tmp = Path(tempfile.gettempdir()) / "kn067_test_synthetic.jsonl"
    record = {
        "type": "assistant",
        "message": {
            "content": [
                {
                    "type": "tool_use",
                    "name": "Bash",
                    "input": {"command": "git commit -m 'feat(test/KN067): synthetic test'"},
                }
            ]
        },
    }
    tmp.write_text(json.dumps(record) + "\n", encoding="utf-8")
    new_offset, events = watcher._scan_phase_e_events(tmp, 0)
    found_commit = any(e["type"] == "commit" for e in events)
    _check("T05 scan_finds_commit_in_synthetic_jsonl", found_commit, f"events={events}")
    _check("T05b new_offset_advances", new_offset > 0, f"new_offset={new_offset}")
    tmp.unlink(missing_ok=True)


def test_t06_scan_finds_tag() -> None:
    tmp = Path(tempfile.gettempdir()) / "kn067_test_tag.jsonl"
    record = {
        "type": "assistant",
        "message": {
            "content": [
                {
                    "type": "tool_use",
                    "name": "Bash",
                    "input": {"command": "git tag -a v-shutterbug-phase-e-trigger-KN067 abc123"},
                }
            ]
        },
    }
    tmp.write_text(json.dumps(record) + "\n", encoding="utf-8")
    _, events = watcher._scan_phase_e_events(tmp, 0)
    found_tag = any(e["type"] == "tag" and e.get("tag") == "v-shutterbug-phase-e-trigger-KN067" for e in events)
    _check("T06 scan_finds_tag_with_extracted_name", found_tag, f"events={events}")
    tmp.unlink(missing_ok=True)


def test_t07_scan_handles_missing_file() -> None:
    """Graceful when JSONL doesn't exist."""
    bogus = Path(tempfile.gettempdir()) / "kn067_does_not_exist.jsonl"
    bogus.unlink(missing_ok=True)
    new_offset, events = watcher._scan_phase_e_events(bogus, 0)
    _check("T07 graceful_missing_file", events == [] and new_offset == 0, f"offset={new_offset} events={events}")


def test_t08_scan_no_false_positive_on_status() -> None:
    """git status should NOT trigger Phase-E."""
    tmp = Path(tempfile.gettempdir()) / "kn067_test_status.jsonl"
    record = {
        "type": "assistant",
        "message": {
            "content": [
                {"type": "tool_use", "name": "Bash", "input": {"command": "git status --short"}}
            ]
        },
    }
    tmp.write_text(json.dumps(record) + "\n", encoding="utf-8")
    _, events = watcher._scan_phase_e_events(tmp, 0)
    _check("T08 no_false_positive_on_status", events == [], f"events={events}")
    tmp.unlink(missing_ok=True)


def test_t09_session_record_has_phase_e_state() -> None:
    """SessionRecord must have the new Phase-E state fields per KN067."""
    r = watcher.SessionRecord(Path("/tmp/x.jsonl"), "bishop", 0.0, 0.0)
    _check("T09 session_record_last_read_offset", hasattr(r, "last_read_offset") and r.last_read_offset == 0)
    _check("T09b session_record_recent_phase_e", hasattr(r, "recent_phase_e") and r.recent_phase_e == [])


def test_t10_bookend_constants_unchanged() -> None:
    """Regression: bookend constants (POLL_INTERVAL, ACTIVE_SECS, STALE_SECS) unchanged."""
    _check("T10 poll_interval_unchanged", watcher.POLL_INTERVAL == 15)
    _check("T10b active_secs_unchanged", watcher.ACTIVE_SECS == 45)
    _check("T10c stale_secs_unchanged", watcher.STALE_SECS == 120)


# ── Run all ───────────────────────────────────────────────────────────────────

def main() -> int:
    test_t01_commit_pattern_matches()
    test_t02_tag_pattern_matches()
    test_t03_dedup_window_logic()
    test_t04_filename_suffix_with_tag()
    test_t04b_filename_suffix_with_sha()
    test_t04c_filename_suffix_sanitization()
    test_t05_scan_phase_e_synthetic_jsonl()
    test_t06_scan_finds_tag()
    test_t07_scan_handles_missing_file()
    test_t08_scan_no_false_positive_on_status()
    test_t09_session_record_has_phase_e_state()
    test_t10_bookend_constants_unchanged()

    pass_count = sum(1 for _, status, _ in results if status == PASS)
    fail_count = sum(1 for _, status, _ in results if status == FAIL)
    print(f"\n=== KN067 Shutterbug Phase-E Trigger Tests ===")
    for name, status, detail in results:
        line = f"{status} {name}"
        if detail:
            line += f" -- {detail}"
        print(line)
    print(f"\nTOTAL: {pass_count} PASS / {fail_count} FAIL")
    return 0 if fail_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
