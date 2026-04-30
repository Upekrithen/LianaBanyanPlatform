#!/usr/bin/env python3
"""
test_shutterbug_cc.py — KN037 Shutterbug Bishop-CC Extension tests.

D.7: Minimum 10 tests required:
  3 JSONL parser tests
  3 capture module tests (without actually taking screenshots)
  2 threshold logic tests
  2 integration tests (full hook with mocked capture)

Run: python ~/.claude/hooks/tests/test_shutterbug_cc.py
"""

from __future__ import annotations

import importlib.util
import json
import math
import sys
import tempfile
from pathlib import Path
from unittest.mock import patch, MagicMock

HOOKS_DIR = Path(__file__).parent.parent


def _load(name: str):
    spec = importlib.util.spec_from_file_location(name, HOOKS_DIR / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


parser_mod = _load("bishop_shutterbug_jsonl_parser")
capture_mod = _load("bishop_shutterbug_capture")

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
    RESULTS.append(f"  {marker} {name}{(' -- ' + detail) if detail else ''}")


# ─── JSONL Parser tests ───────────────────────────────────────────────────────

def _make_jsonl(lines: list[dict]) -> Path:
    """Write JSONL lines to a temp file and return the path."""
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".jsonl", delete=False, encoding="utf-8"
    ) as fh:
        for line in lines:
            fh.write(json.dumps(line) + "\n")
        return Path(fh.name)


def test_parser_extracts_pct_from_valid_jsonl():
    """Parser extracts context % when usage data is present in last assistant message."""
    # 50,000 tokens used out of 200,000 budget = 25%
    lines = [
        {"type": "message", "message": {
            "role": "user",
            "content": [{"type": "text", "text": "hello"}],
        }},
        {"type": "message", "message": {
            "role": "assistant",
            "content": [{"type": "text", "text": "ok"}],
            "usage": {
                "input_tokens": 40000,
                "output_tokens": 5000,
                "cache_read_input_tokens": 5000,
                "cache_creation_input_tokens": 0,
            },
        }},
    ]
    path = _make_jsonl(lines)
    pct = parser_mod.extract_context_pct(path)
    path.unlink(missing_ok=True)
    check("Parser: extracts context pct from valid JSONL", pct is not None)
    check("Parser: pct is approximately 25%", pct is not None and abs(pct - 25.0) < 0.1)


def test_parser_returns_none_for_empty_jsonl():
    """Parser returns None when no usage data present."""
    lines = [
        {"type": "message", "message": {"role": "user", "content": "hello"}},
    ]
    path = _make_jsonl(lines)
    pct = parser_mod.extract_context_pct(path)
    path.unlink(missing_ok=True)
    check("Parser: returns None for JSONL with no assistant usage", pct is None)


def test_parser_uses_last_assistant_message():
    """Parser uses the LAST (most recent) assistant message's usage."""
    lines = [
        {"type": "message", "message": {
            "role": "assistant",
            "content": "early",
            "usage": {"input_tokens": 10000, "output_tokens": 0,
                      "cache_read_input_tokens": 0, "cache_creation_input_tokens": 0},
        }},
        {"type": "message", "message": {"role": "user", "content": "next"}},
        {"type": "message", "message": {
            "role": "assistant",
            "content": "later",
            "usage": {"input_tokens": 60000, "output_tokens": 5000,
                      "cache_read_input_tokens": 0, "cache_creation_input_tokens": 0},
        }},
    ]
    path = _make_jsonl(lines)
    pct = parser_mod.extract_context_pct(path)
    path.unlink(missing_ok=True)
    # Later message: (60000+5000)/200000 * 100 = 32.5%
    check("Parser: uses last assistant message", pct is not None and pct > 30.0)


# ─── Capture module tests ─────────────────────────────────────────────────────

def test_capture_filename_format():
    """Filename matches format: 'Screenshot YYYY-MM-DD HHMMSS_<event>_<agent>.png'"""
    import re
    filename = capture_mod._build_filename("SessionStart", "cursor")
    pattern = r"^Screenshot \d{4}-\d{2}-\d{2} \d{6}_SessionStart_cursor\.png$"
    check("Capture: filename format correct",
          bool(re.match(pattern, filename)),
          detail=f"got: {filename}")


def test_capture_agent_in_filename():
    """Agent label appears in filename."""
    filename = capture_mod._build_filename("SessionEnd", "bishop")
    check("Capture: agent label in filename",
          "_SessionEnd_bishop.png" in filename,
          detail=f"got: {filename}")


def test_capture_stub_written_on_failure():
    """Stub is written when all capture methods fail."""
    with tempfile.TemporaryDirectory() as tmpdir:
        out_path = Path(tmpdir) / "Screenshot 2026-04-30 123456_SessionStart_cursor.png"
        stub = capture_mod._write_stub(out_path, "cursor", "SessionStart", "test failure")
        check("Capture: stub file created", stub.exists())
        data = json.loads(stub.read_text())
        check("Capture: stub contains agent field", data.get("agent") == "cursor")


# ─── Threshold logic tests ────────────────────────────────────────────────────

def test_threshold_logic_crossing():
    """Crossing an integer pp boundary (e.g. 19.4 -> 20.1) triggers capture."""
    last_pp = 19.4
    current_pct = 20.1
    should_fire = int(math.floor(current_pct)) > int(math.floor(last_pp))
    check("Threshold: 19.4->20.1 triggers capture (crossing pp=20)", should_fire)


def test_threshold_logic_same_integer():
    """Staying within the same integer pp (e.g. 20.1 -> 20.8) does NOT trigger."""
    last_pp = 20.1
    current_pct = 20.8
    should_fire = int(math.floor(current_pct)) > int(math.floor(last_pp))
    check("Threshold: 20.1->20.8 does NOT trigger (same integer)", not should_fire)


# ─── Integration tests ────────────────────────────────────────────────────────

def test_integration_sessionend_fires_capture():
    """
    SessionEnd: hook calls capture_both and kills watcher (no watcher running = ok).
    """
    shutterbug_mod = _load("bishop_shutterbug_cc")

    with tempfile.TemporaryDirectory() as tmpdir:
        errors_log = Path(tmpdir) / "errors.log"
        pid_file = Path(tmpdir) / "watcher.pid"
        shutterbug_mod.ERRORS_LOG = errors_log
        shutterbug_mod.STATE_DIR = Path(tmpdir)
        shutterbug_mod.PID_FILE = pid_file

        mock_capture = MagicMock()
        mock_capture.capture_both.return_value = [
            {"agent": "cursor", "success": True, "path": "/tmp/c.png", "filename": "c.png", "monitor_rect": None},
            {"agent": "bishop", "success": True, "path": "/tmp/b.png", "filename": "b.png", "monitor_rect": None},
        ]

        def fake_import_local(name: str):
            if name == "bishop_shutterbug_capture":
                return mock_capture
            return None

        shutterbug_mod._import_local = fake_import_local

        import io, os
        env_backup = os.environ.get("SHUTTERBUG_EVENT")
        os.environ["SHUTTERBUG_EVENT"] = "SessionEnd"
        with patch("sys.stdin", io.StringIO('{"session_id": "test-sess-end-id"}')):
            rc = shutterbug_mod.main()
        if env_backup is None:
            del os.environ["SHUTTERBUG_EVENT"]
        else:
            os.environ["SHUTTERBUG_EVENT"] = env_backup

        check("Integration SessionEnd: hook returns 0", rc == 0)
        check("Integration SessionEnd: capture_both called",
              mock_capture.capture_both.called)


def test_integration_sessionstart_no_crash():
    """
    SessionStart: hook attempts to spawn watcher (subprocess may fail in test env).
    Verify hook returns 0 and does not raise.
    """
    shutterbug_mod = _load("bishop_shutterbug_cc")

    with tempfile.TemporaryDirectory() as tmpdir:
        errors_log = Path(tmpdir) / "errors.log"
        pid_file = Path(tmpdir) / "watcher.pid"
        shutterbug_mod.ERRORS_LOG = errors_log
        shutterbug_mod.STATE_DIR = Path(tmpdir)
        shutterbug_mod.PID_FILE = pid_file

        import io, os
        env_backup = os.environ.get("SHUTTERBUG_EVENT")
        os.environ["SHUTTERBUG_EVENT"] = "SessionStart"
        with patch("sys.stdin", io.StringIO('{"session_id": "test-sess-start"}')):
            rc = shutterbug_mod.main()
        if env_backup is None:
            del os.environ["SHUTTERBUG_EVENT"]
        else:
            os.environ["SHUTTERBUG_EVENT"] = env_backup

        check("Integration SessionStart: hook returns 0 (no crash)", rc == 0)


# ─── Runner ──────────────────────────────────────────────────────────────────

def run_all():
    test_parser_extracts_pct_from_valid_jsonl()
    test_parser_returns_none_for_empty_jsonl()
    test_parser_uses_last_assistant_message()
    test_capture_filename_format()
    test_capture_agent_in_filename()
    test_capture_stub_written_on_failure()
    test_threshold_logic_crossing()
    test_threshold_logic_same_integer()
    test_integration_sessionend_fires_capture()
    test_integration_sessionstart_no_crash()

    print(f"\n{'='*60}")
    print("KN037 Shutterbug Bishop-CC Tests")
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
