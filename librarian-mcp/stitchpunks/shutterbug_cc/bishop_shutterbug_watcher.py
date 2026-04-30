#!/usr/bin/env python3
"""
bishop_shutterbug_watcher.py — KN037 Shutterbug persistent background watcher daemon.

Spawned as a detached subprocess by bishop_shutterbug_cc.py at Bishop SessionStart.
Killed by bishop_shutterbug_cc.py at Bishop SessionEnd.

Watches two session directories simultaneously:
  BISHOP_DIR : ~/.claude/projects/C--Users-Administrator-Documents/*.jsonl
               (Bishop CC sessions — flat JSONL files)
  KNIGHT_DIR : ~/.cursor/projects/c-.../agent-transcripts/<uuid>/<uuid>.jsonl
               (Knight/Cursor sessions — one subfolder per session)

Detection logic (polling every POLL_INTERVAL seconds):
  NEW file/folder seen    → "SessionStart" capture_both() for that agent
  File goes stale (not modified for STALE_SECS) after being active → "SessionEnd" capture_both()
  "Active" = modified within the last ACTIVE_SECS seconds

On spawn: immediately captures Bishop's own current session start (the session that
just launched the daemon). Knight sessions that were already running before the daemon
started are treated as "already active" — their end will be captured when they go stale.

Output: BeanSprouts root (loose PNGs). Filenames include session UUID prefix for tracing:
  "Screenshot 2026-04-30 150832_SessionStart_cursor_ee8e81b7.png"
  "Screenshot 2026-04-30 160045_SessionEnd_cursor_ee8e81b7.png"
  "Screenshot 2026-04-30 150832_SessionStart_bishop_d7e6967b.png"

PID file: ~/.claude/state/shutterbug/watcher.pid (so SessionEnd hook can kill it)
Log:      ~/.claude/state/shutterbug/watcher.log
"""

from __future__ import annotations

import importlib.util
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────
POLL_INTERVAL = 15        # seconds between scans
ACTIVE_SECS   = 45        # file modified within this window = "active session"
STALE_SECS    = 120       # not modified for this long after being active = "ended"

BISHOP_DIR = Path(r"C:\Users\Administrator\.claude\projects\C--Users-Administrator-Documents")
KNIGHT_DIR = Path(r"C:\Users\Administrator\.cursor\projects\c-Users-Administrator-Documents-LianaBanyanPlatform\agent-transcripts")
STATE_DIR  = Path(r"C:\Users\Administrator\.claude\state\shutterbug")
PID_FILE   = STATE_DIR / "watcher.pid"
LOG_FILE   = STATE_DIR / "watcher.log"

HOOKS_DIR  = Path(__file__).parent


# ── Helpers ───────────────────────────────────────────────────────────────────

def _now() -> float:
    return time.time()


def _iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _log(msg: str) -> None:
    try:
        with LOG_FILE.open("a", encoding="utf-8") as fh:
            fh.write(f"[{_iso()}] {msg}\n")
    except Exception:
        pass


def _load_capture_mod():
    spec = importlib.util.spec_from_file_location(
        "bishop_shutterbug_capture", HOOKS_DIR / "bishop_shutterbug_capture.py"
    )
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _short_id(path: Path) -> str:
    """First 8 chars of the stem UUID for filename labeling."""
    return path.stem[:8]


def _do_capture(capture_mod, event: str, agent: str, session_id: str) -> None:
    """Fire capture_both with an event label that includes the session_id prefix."""
    label = f"{event}_{agent}_{session_id}"
    try:
        results = capture_mod.capture_both(label)
        for r in results:
            status = "ok" if r.get("success") else "stub"
            _log(f"  captured [{status}] {r['filename']} monitor={r.get('monitor_rect')}")
    except Exception as exc:
        _log(f"  capture error: {exc}")


# ── Session file discovery ─────────────────────────────────────────────────────

def _scan_bishop(now: float) -> dict[Path, float]:
    """
    Scan BISHOP_DIR for active JSONL files.
    Returns {path: mtime} for files modified within ACTIVE_SECS.
    """
    result: dict[Path, float] = {}
    if not BISHOP_DIR.is_dir():
        return result
    for p in BISHOP_DIR.iterdir():
        if p.is_file() and p.suffix == ".jsonl":
            try:
                mtime = p.stat().st_mtime
                result[p] = mtime
            except Exception:
                pass
    return result


def _scan_knight(now: float) -> dict[Path, float]:
    """
    Scan KNIGHT_DIR subfolders for JSONL files.
    Each subfolder is a UUID; inside is a JSONL with the same UUID name.
    Returns {path: mtime}.
    """
    result: dict[Path, float] = {}
    if not KNIGHT_DIR.is_dir():
        return result
    for folder in KNIGHT_DIR.iterdir():
        if not folder.is_dir():
            continue
        jsonl = folder / f"{folder.name}.jsonl"
        if jsonl.is_file():
            try:
                result[jsonl] = jsonl.stat().st_mtime
            except Exception:
                pass
    return result


# ── Watcher state ─────────────────────────────────────────────────────────────

class SessionRecord:
    """Track the lifecycle of one session JSONL."""
    def __init__(self, path: Path, agent: str, mtime: float, seen_at: float):
        self.path = path
        self.agent = agent
        self.mtime = mtime           # last known mtime
        self.seen_at = seen_at       # when daemon first saw this file
        self.start_captured = False  # have we fired SessionStart yet?
        self.end_captured = False    # have we fired SessionEnd yet?
        self.last_active_at = seen_at  # last time file was "active"


# ── Main loop ─────────────────────────────────────────────────────────────────

def run(bishop_session_id: str | None = None) -> None:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    PID_FILE.write_text(str(os.getpid()), encoding="utf-8")
    _log(f"Watcher started pid={os.getpid()} bishop_session={bishop_session_id}")

    capture_mod = _load_capture_mod()

    # Immediately capture Bishop's own session start
    if bishop_session_id:
        _log(f"Firing SessionStart for Bishop session {bishop_session_id[:8]}")
        _do_capture(capture_mod, "SessionStart", "bishop_session", bishop_session_id[:8])

    # State: path -> SessionRecord
    tracked: dict[Path, SessionRecord] = {}

    # Bootstrap: files already existing before daemon started are "known but pre-existing"
    # We DON'T fire SessionStart for them (already running), but we WILL fire SessionEnd.
    now = _now()
    for path, mtime in {**_scan_bishop(now), **_scan_knight(now)}.items():
        agent = "bishop" if BISHOP_DIR in path.parents else "knight"
        r = SessionRecord(path, agent, mtime, now)
        r.start_captured = True   # don't re-fire start for pre-existing sessions
        r.last_active_at = mtime  # use actual mtime, not now
        tracked[path] = r

    _log(f"Bootstrap: {len(tracked)} pre-existing sessions tracked")

    while True:
        time.sleep(POLL_INTERVAL)
        now = _now()

        # Scan both dirs
        current: dict[Path, float] = {
            **_scan_bishop(now),
            **_scan_knight(now),
        }

        # ── New sessions ──────────────────────────────────────────────────────
        for path, mtime in current.items():
            if path not in tracked:
                agent = "bishop" if BISHOP_DIR in path.parents else "knight"
                r = SessionRecord(path, agent, mtime, now)
                tracked[path] = r
                _log(f"New {agent} session: {path.name[:36]}")
                _do_capture(capture_mod, "SessionStart", agent, _short_id(path))
                r.start_captured = True
                r.last_active_at = now

        # ── Update mtimes + detect end ────────────────────────────────────────
        for path, r in list(tracked.items()):
            if r.end_captured:
                continue

            current_mtime = current.get(path)
            if current_mtime is None:
                # File disappeared entirely — treat as ended immediately
                if r.start_captured:
                    _log(f"Session vanished (end): {path.name[:36]}")
                    _do_capture(capture_mod, "SessionEnd", r.agent, _short_id(path))
                    r.end_captured = True
                continue

            if current_mtime != r.mtime:
                # File is still being written → active
                r.mtime = current_mtime
                r.last_active_at = now

            # Check staleness
            idle = now - r.last_active_at
            if idle >= STALE_SECS and r.start_captured:
                _log(f"Session stale {idle:.0f}s (end): {path.name[:36]}")
                _do_capture(capture_mod, "SessionEnd", r.agent, _short_id(path))
                r.end_captured = True


if __name__ == "__main__":
    bishop_session_id = sys.argv[1] if len(sys.argv) > 1 else None
    try:
        run(bishop_session_id)
    except KeyboardInterrupt:
        _log("Watcher stopped (KeyboardInterrupt)")
    except Exception as exc:
        _log(f"Watcher fatal: {exc}")
