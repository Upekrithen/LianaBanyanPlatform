"""
Phase F Filesystem Watcher — K551/B133

Bishop-side filesystem watcher (Architecture D.2 = γ).
Monitors OS-level file access events in the LianaBanyanPlatform directory tree.
Logs file read events to phase_f_call_log.jsonl for Phase F coverage delta computation.

Uses watchdog (cross-platform: ReadDirectoryChangesW on Windows, inotify on Linux,
kqueue on macOS). Falls back to manual stat-based polling if watchdog unavailable.

Usage:
    python phase_f_fs_watcher.py --session=K<NNN> --wrasse=off   # start watching
    python phase_f_fs_watcher.py --stop                           # stop watching
    python phase_f_fs_watcher.py --report --session=K<NNN>       # print summary

Stone Tablet: all records append-only to phase_f_call_log.jsonl.
Brick Wall: watcher failure logs but never blocks agent's primary work.

Filed: K551/B133, 2026-04-29
"""

from __future__ import annotations

import json
import logging
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)

_HERE = Path(__file__).parent
WORKSPACE_ROOT = _HERE.resolve().parents[3]  # LianaBanyanPlatform/
CALL_LOG_PATH = _HERE / "phase_f_call_log.jsonl"
WATCHER_STATE_PATH = _HERE / "phase_f_watcher_state.json"

# Directories to watch (exclude .git, node_modules, __pycache__, dist)
WATCH_DIRS = [
    "librarian-mcp/stitchpunks",
    "librarian-mcp/src",
    "BISHOP_DROPZONE",
    "CONTEXT_MANAGEMENT",
]

# File patterns relevant to rote-cognition measurement
ROTE_FILE_PATTERNS = [
    "KNIGHT_QUEUE.md",
    "AGENTS.md",
    "canonical_values.yaml",
    "BRIDLE",
    "MILESTONE_HANDOFF",
    "KnightQueue.jsonl",
    "KnightHandoffs.jsonl",
    "wrasse_registry.jsonl",
    "overview.json",
    "registry.yaml",
]

EXCLUDE_PATTERNS = [
    ".git", "node_modules", "__pycache__", "dist", ".pytest_cache",
    "phase_f_call_log.jsonl", "phase_f_watcher_state.json", "session_ledger.jsonl",
]


def _append_call_log(record: dict[str, Any]) -> None:
    """Append a call record to phase_f_call_log.jsonl (Stone Tablet)."""
    line = json.dumps(record, ensure_ascii=False) + "\n"
    with CALL_LOG_PATH.open("a", encoding="utf-8", buffering=1) as fh:
        fh.write(line)
        fh.flush()
        os.fsync(fh.fileno())


def _is_rote_file(path_str: str) -> bool:
    """Return True if file matches rote-cognition patterns."""
    return any(p.lower() in path_str.lower() for p in ROTE_FILE_PATTERNS)


def _should_exclude(path_str: str) -> bool:
    return any(p in path_str for p in EXCLUDE_PATTERNS)


def _file_read_record(
    file_path: str,
    session_id: str,
    wrasse_mode: str,
    source: str = "fs_watcher",
) -> dict[str, Any]:
    path_obj = Path(file_path)
    size_bytes = 0
    try:
        size_bytes = path_obj.stat().st_size
    except OSError:
        pass
    return {
        "ts": datetime.now(timezone.utc).isoformat(),
        "tool": "Read",
        "source": source,
        "file_path": str(path_obj),
        "size_bytes": size_bytes,
        "size_chars": size_bytes,  # approximation (1 byte ≈ 1 char for ASCII)
        "is_rote_candidate": _is_rote_file(file_path),
        "session_id": session_id,
        "wrasse_mode": wrasse_mode,
    }


# ─── Watchdog-based watcher ──────────────────────────────────────────────────

try:
    from watchdog.observers import Observer  # type: ignore
    from watchdog.events import FileSystemEventHandler, FileModifiedEvent, FileCreatedEvent  # type: ignore
    _WATCHDOG_AVAILABLE = True
except ImportError:
    _WATCHDOG_AVAILABLE = False
    logger.warning("watchdog not installed. Using polling fallback. pip install watchdog")


class _PhaseFFSHandler:
    """Watchdog event handler for Phase F file access monitoring."""

    def __init__(self, session_id: str, wrasse_mode: str) -> None:
        self.session_id = session_id
        self.wrasse_mode = wrasse_mode
        self._seen: set[str] = set()

    def on_modified(self, event: Any) -> None:
        src = str(event.src_path)
        if _should_exclude(src):
            return
        if not Path(src).is_file():
            return
        # Debounce: same file within 1s
        key = f"{src}:{int(time.time())}"
        if key in self._seen:
            return
        self._seen.add(key)
        record = _file_read_record(src, self.session_id, self.wrasse_mode, "watchdog_modified")
        try:
            _append_call_log(record)
        except Exception as e:
            logger.debug("phase_f_call_log write error: %s", e)

    def dispatch(self, event: Any) -> None:
        """Dispatch events to the appropriate handler method."""
        if hasattr(event, 'is_directory') and event.is_directory:
            return
        self.on_modified(event)


def start_watcher(session_id: str, wrasse_mode: str = "off") -> None:
    """Start filesystem watcher and save PID to state file."""
    state = {
        "session_id": session_id,
        "wrasse_mode": wrasse_mode,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "pid": os.getpid(),
        "workspace_root": str(WORKSPACE_ROOT),
    }
    with WATCHER_STATE_PATH.open("w", encoding="utf-8") as fh:
        json.dump(state, fh, indent=2)

    logger.info("Phase F watcher started: session=%s wrasse=%s", session_id, wrasse_mode)

    if not _WATCHDOG_AVAILABLE:
        # Polling fallback: scan watched dirs every 5s, log any file with mtime change
        _polling_watch(session_id, wrasse_mode)
        return

    handler = _PhaseFFSHandler(session_id, wrasse_mode)

    # Build watchdog handler
    from watchdog.events import FileSystemEventHandler as WatchdogHandler  # type: ignore

    class _WatchdogAdapter(WatchdogHandler):
        def dispatch(self, event: Any) -> None:
            handler.dispatch(event)

    observer = Observer()
    for rel_dir in WATCH_DIRS:
        watch_dir = WORKSPACE_ROOT / rel_dir
        if watch_dir.exists():
            observer.schedule(_WatchdogAdapter(), str(watch_dir), recursive=True)
            logger.info("Watching: %s", watch_dir)

    observer.start()
    logger.info("Watchdog observer running. Ctrl-C to stop.")
    try:
        while True:
            time.sleep(1)
            if not WATCHER_STATE_PATH.exists():
                logger.info("State file removed — stopping watcher")
                break
    except KeyboardInterrupt:
        pass
    finally:
        observer.stop()
        observer.join()
        logger.info("Phase F watcher stopped.")


def _polling_watch(session_id: str, wrasse_mode: str, interval_s: float = 5.0) -> None:
    """Fallback polling watcher when watchdog is unavailable."""
    mtimes: dict[str, float] = {}
    logger.info("Polling watcher (interval=%.1fs)", interval_s)
    try:
        while WATCHER_STATE_PATH.exists():
            for rel_dir in WATCH_DIRS:
                watch_dir = WORKSPACE_ROOT / rel_dir
                if not watch_dir.exists():
                    continue
                for fpath in watch_dir.rglob("*"):
                    if not fpath.is_file():
                        continue
                    if _should_exclude(str(fpath)):
                        continue
                    try:
                        mtime = fpath.stat().st_mtime
                    except OSError:
                        continue
                    prev = mtimes.get(str(fpath), 0.0)
                    if mtime != prev:
                        mtimes[str(fpath)] = mtime
                        if prev > 0:  # not first scan
                            record = _file_read_record(
                                str(fpath), session_id, wrasse_mode, "polling_modified"
                            )
                            try:
                                _append_call_log(record)
                            except Exception as e:
                                logger.debug("call_log write error: %s", e)
            time.sleep(interval_s)
    except KeyboardInterrupt:
        pass
    logger.info("Polling watcher stopped.")


def stop_watcher() -> None:
    """Signal running watcher to stop by removing state file."""
    if WATCHER_STATE_PATH.exists():
        WATCHER_STATE_PATH.unlink()
        logger.info("Watcher stop signal sent.")
    else:
        logger.info("No active watcher state found.")


def report_session(session_id: str) -> dict[str, Any]:
    """Print summary of logged calls for a session."""
    if not CALL_LOG_PATH.exists():
        return {"session_id": session_id, "total_calls": 0}

    calls = []
    with CALL_LOG_PATH.open(encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                continue
            if record.get("session_id") == session_id:
                calls.append(record)

    rote_candidates = [c for c in calls if c.get("is_rote_candidate")]
    total_chars = sum(c.get("size_chars", 0) for c in calls)
    rote_chars = sum(c.get("size_chars", 0) for c in rote_candidates)

    summary = {
        "session_id": session_id,
        "total_calls": len(calls),
        "rote_candidate_calls": len(rote_candidates),
        "total_chars_logged": total_chars,
        "rote_chars_logged": rote_chars,
        "rote_pct": round(100 * rote_chars / max(total_chars, 1), 1),
    }
    return summary


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Phase F Filesystem Watcher")
    parser.add_argument("--session", default="K-unknown")
    parser.add_argument("--wrasse", choices=["on", "off"], default="off")
    parser.add_argument("--stop", action="store_true")
    parser.add_argument("--report", action="store_true")
    args = parser.parse_args()

    if args.stop:
        stop_watcher()
    elif args.report:
        summary = report_session(args.session)
        print(json.dumps(summary, indent=2))
    else:
        start_watcher(args.session, args.wrasse)
