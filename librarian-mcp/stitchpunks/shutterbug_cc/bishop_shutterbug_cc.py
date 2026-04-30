#!/usr/bin/env python3
"""
bishop_shutterbug_cc.py — KN037 Shutterbug session-boundary controller.

SessionStart : spawns bishop_shutterbug_watcher.py as a detached background daemon.
               Watcher immediately captures both monitors for Bishop's session start,
               then polls for all subsequent session boundaries (Bishop + Knight).

SessionEnd   : kills the watcher daemon (via PID file), then fires one final
               capture_both("SessionEnd_bishop") for Bishop's own closing state.

Wired in ~/.claude/settings.json:
  SessionStart hooks → this script (with SHUTTERBUG_EVENT=SessionStart)
  SessionEnd   hooks → this script (with SHUTTERBUG_EVENT=SessionEnd)

The watcher handles:
  - Bishop CC sessions:   ~/.claude/projects/C--Users-Administrator-Documents/*.jsonl
  - Knight/Cursor sessions: ~/.cursor/projects/.../agent-transcripts/<uuid>/<uuid>.jsonl

Screenshot filenames: "Screenshot YYYY-MM-DD HHMMSS_<event>_<agent>_<uuid8>.png"
All loose PNGs swept to BeanSprouts/NNN/ by bishop_screenshot_sweep.py at SessionEnd.

D.5: Errors logged to errors.log; never blocks hook events.
"""

from __future__ import annotations

import json
import os
import signal
import subprocess
import sys
import traceback
from pathlib import Path

HOOKS_DIR  = Path(__file__).parent
STATE_DIR  = Path(r"C:\Users\Administrator\.claude\state\shutterbug")
PID_FILE   = STATE_DIR / "watcher.pid"
ERRORS_LOG = STATE_DIR / "errors.log"
WATCHER    = HOOKS_DIR / "bishop_shutterbug_watcher.py"


def _log_error(msg: str) -> None:
    try:
        STATE_DIR.mkdir(parents=True, exist_ok=True)
        with ERRORS_LOG.open("a", encoding="utf-8") as fh:
            from datetime import datetime, timezone
            fh.write(f"[{datetime.now(timezone.utc).isoformat()}] {msg}\n")
    except Exception:
        pass


def _import_local(name: str):
    import importlib.util
    spec = importlib.util.spec_from_file_location(name, HOOKS_DIR / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _read_pid() -> int | None:
    try:
        if PID_FILE.is_file():
            return int(PID_FILE.read_text().strip())
    except Exception:
        pass
    return None


def _kill_watcher() -> None:
    """Kill the background watcher daemon if it is running."""
    pid = _read_pid()
    if pid is None:
        return
    try:
        # Windows: taskkill
        subprocess.run(
            ["taskkill", "/PID", str(pid), "/F"],
            capture_output=True, timeout=5,
        )
    except Exception:
        pass
    try:
        PID_FILE.unlink(missing_ok=True)
    except Exception:
        pass


def _spawn_watcher(session_id: str) -> None:
    """Spawn the watcher daemon as a detached background process."""
    try:
        STATE_DIR.mkdir(parents=True, exist_ok=True)
        # Kill any leftover watcher from a previous session
        _kill_watcher()

        proc = subprocess.Popen(
            [sys.executable, str(WATCHER), session_id],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP,
        )
        PID_FILE.write_text(str(proc.pid), encoding="utf-8")
    except Exception as exc:
        _log_error(f"Failed to spawn watcher: {exc}\n{traceback.format_exc()}")


def main() -> int:
    try:
        raw = sys.stdin.read()
        try:
            payload = json.loads(raw) if raw.strip() else {}
        except json.JSONDecodeError:
            payload = {}

        event = os.environ.get("SHUTTERBUG_EVENT", "")
        session_id = (
            payload.get("session_id")
            or payload.get("sessionId")
            or "unknown"
        )

        if event == "SessionStart":
            _spawn_watcher(session_id)

        elif event == "SessionEnd":
            # Kill the watcher first
            _kill_watcher()
            # Fire one final capture for Bishop's closing state
            try:
                cap = _import_local("bishop_shutterbug_capture")
                cap.capture_both(f"SessionEnd_bishop_{session_id[:8]}")
            except Exception as exc:
                _log_error(f"SessionEnd final capture failed: {exc}")

        else:
            _log_error(f"SHUTTERBUG_EVENT not set or unrecognised: '{event}'")

        return 0

    except Exception as exc:
        try:
            _log_error(f"Fatal: {type(exc).__name__}: {exc}\n{traceback.format_exc()}")
        except Exception:
            pass
        return 0


if __name__ == "__main__":
    sys.exit(main())
