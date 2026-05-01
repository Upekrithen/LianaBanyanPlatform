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
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────
POLL_INTERVAL = 15        # seconds between scans
ACTIVE_SECS   = 45        # file modified within this window = "active session"
STALE_SECS    = 120       # not modified for this long after being active = "ended"

# ── Phase-E trigger config (KN067 BP005) ──────────────────────────────────────
# Detect git commit + git tag tool calls in active Knight/Bishop JSONL streams,
# fire dual-monitor capture on match. Bounded: 30s dedup window so commit+tag
# back-to-back = ONE capture (combined filename).
PHASE_E_DEDUP_WINDOW_SECS = 30
GIT_COMMIT_PATTERN = re.compile(r"^\s*git\s+commit\b", re.IGNORECASE)
GIT_TAG_PATTERN    = re.compile(r"^\s*git\s+tag\b",    re.IGNORECASE)
SHA_EXTRACT_PATTERN = re.compile(r"\b([0-9a-f]{7,40})\b")  # match short or full SHA
TAG_EXTRACT_PATTERN = re.compile(r"git\s+tag\s+(?:-a\s+)?(\S+)", re.IGNORECASE)

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


def _do_capture(capture_mod, event: str, agent: str, session_id: str, suffix: str = "") -> None:
    """Fire capture_both with an event label that includes the session_id prefix.

    Optional suffix appends additional tracing context (e.g., commit-sha or tag for Phase-E captures).
    """
    label = f"{event}_{agent}_{session_id}"
    if suffix:
        label = f"{label}_{suffix}"
    try:
        results = capture_mod.capture_both(label)
        for r in results:
            status = "ok" if r.get("success") else "stub"
            _log(f"  captured [{status}] {r['filename']} monitor={r.get('monitor_rect')}")
    except Exception as exc:
        _log(f"  capture error: {exc}")


# ── Phase-E trigger detection (KN067 BP005) ───────────────────────────────────

def _scan_phase_e_events(path: Path, last_offset: int) -> tuple[int, list[dict]]:
    """Tail-read JSONL from last_offset; return (new_offset, events).

    Each event is a dict: {"type": "commit" | "tag", "sha": str | None, "tag": str | None,
                            "command": str (raw command for forensic context)}.
    Tracks byte offset for next-poll efficiency (no full re-read).
    """
    events: list[dict] = []
    try:
        size = path.stat().st_size
        if size <= last_offset:
            # File hasn't grown since last poll (or rotated/truncated — treat as no new data)
            return last_offset, events

        with path.open("rb") as fh:
            fh.seek(last_offset)
            chunk = fh.read(size - last_offset)
        new_offset = size

        # Parse each newline-delimited JSON record in the new chunk
        text = chunk.decode("utf-8", errors="replace")
        for line in text.splitlines():
            if not line.strip():
                continue
            try:
                rec = json.loads(line)
            except Exception:
                continue
            # Look for tool_use blocks with Bash + git commit/tag commands
            content = rec.get("message", {}).get("content", []) if isinstance(rec.get("message"), dict) else rec.get("content", [])
            if not isinstance(content, list):
                continue
            for block in content:
                if not isinstance(block, dict):
                    continue
                if block.get("type") != "tool_use":
                    continue
                if block.get("name") not in ("Bash", "PowerShell"):
                    continue
                cmd = (block.get("input") or {}).get("command", "")
                if not isinstance(cmd, str):
                    continue
                # Match git commit
                if GIT_COMMIT_PATTERN.search(cmd):
                    events.append({"type": "commit", "sha": None, "tag": None, "command": cmd[:200]})
                # Match git tag
                if GIT_TAG_PATTERN.search(cmd):
                    tag_match = TAG_EXTRACT_PATTERN.search(cmd)
                    tag_name = tag_match.group(1) if tag_match else None
                    events.append({"type": "tag", "sha": None, "tag": tag_name, "command": cmd[:200]})
                # Try to extract SHA from any tool output adjacent to commit (best-effort)
                # (Many JSONL streams include tool_result with commit SHA; we capture the command-side only here)
        return new_offset, events
    except Exception as exc:
        _log(f"  phase_e scan error on {path.name[:36]}: {exc}")
        return last_offset, events


def _phase_e_label_suffix(event: dict) -> str:
    """Build a filename-safe suffix like 'PhaseE_commit_<sha>' or 'PhaseE_tag_<tagname>'."""
    parts = ["PhaseE", event["type"]]
    if event.get("tag"):
        # sanitize tag for filename
        safe = re.sub(r"[^A-Za-z0-9._-]", "_", event["tag"])[:60]
        parts.append(safe)
    elif event.get("sha"):
        parts.append(event["sha"][:7])
    return "_".join(parts)


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
        # KN067 BP005: Phase-E trigger state
        self.last_read_offset = 0      # byte offset for tail-reading new JSONL lines
        self.recent_phase_e: list[float] = []  # timestamps of recent Phase-E captures (dedup window)


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
                continue

            # ── KN067 BP005: Phase-E trigger detection ─────────────────────
            # On each poll, tail-read new JSONL lines and look for git commit/tag tool calls.
            # Fire dual-monitor capture on match (with 30s dedup window).
            if r.start_captured and not r.end_captured:
                new_offset, events = _scan_phase_e_events(path, r.last_read_offset)
                r.last_read_offset = new_offset
                # Prune recent_phase_e older than dedup window
                r.recent_phase_e = [t for t in r.recent_phase_e if (now - t) < PHASE_E_DEDUP_WINDOW_SECS]
                for event in events:
                    # Dedup: if any capture fired within window, skip this one
                    # (handles back-to-back commit + tag landing as ONE proof artifact)
                    if r.recent_phase_e:
                        _log(f"  phase_e dedup skip ({event['type']}) on {path.name[:36]}")
                        continue
                    suffix = _phase_e_label_suffix(event)
                    _log(f"Phase-E {event['type']} on {path.name[:36]}: cmd={event['command'][:60]!r}")
                    _do_capture(capture_mod, "PhaseE", r.agent, _short_id(path), suffix=suffix)
                    r.recent_phase_e.append(now)


if __name__ == "__main__":
    bishop_session_id = sys.argv[1] if len(sys.argv) > 1 else None
    try:
        run(bishop_session_id)
    except KeyboardInterrupt:
        _log("Watcher stopped (KeyboardInterrupt)")
    except Exception as exc:
        _log(f"Watcher fatal: {exc}")
