"""
Cursor Context-Budget Watcher — Component 1: Watcher Daemon + Persistence
KN012 / A&A #2293

Poll-based watcher for Cursor session context-budget.
Runs as a foreground or background process.  Writes threshold-crossing snapshots
to the Stone Tablet via Chronos signing (KN009 Component 4 bridge).
Also emits Herder Scribe observation events for Herder model training.

Stone Tablet: librarian-mcp/stitchpunks/chronos/chronicler_receipts/snapshot_receipts.jsonl
PID file:     librarian-mcp/stitchpunks/snapshot/.watcher.pid

Control:
  python snapshot_watcher.py start [--interval 30] [--threshold 10,20,30,...]
  python snapshot_watcher.py stop
  python snapshot_watcher.py status

Toolsmith log: TS-CURSOR-CONTEXT-BUDGET-WATCHER-KN012-BP002
"""

from __future__ import annotations

import hashlib
import json
import os
import signal
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

# ── Paths ─────────────────────────────────────────────────────────────────────

_HERE = Path(__file__).parent
_CHRONOS_RECEIPTS_DIR = _HERE.parent / "chronos" / "chronicler_receipts"
_TABLET_PATH = _CHRONOS_RECEIPTS_DIR / "snapshot_receipts.jsonl"
_PID_PATH = _HERE / ".watcher.pid"
_STATE_PATH = _HERE / ".threshold_state.json"
_CONFIG_PATH = _HERE / "watcher_config.json"

DEFAULT_POLL_INTERVAL_S = 30.0
DEFAULT_MAX_CONTEXT_BYTES = 640_000


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _compute_hash(body: Dict[str, Any]) -> str:
    canonical = json.dumps(body, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def _ensure_dirs() -> None:
    _CHRONOS_RECEIPTS_DIR.mkdir(parents=True, exist_ok=True)


def _fsync_append(path: Path, record: Dict[str, Any]) -> None:
    """Append JSONL record — Stone Tablet: fsync after write."""
    line = json.dumps(record, ensure_ascii=False) + "\n"
    with path.open("a", encoding="utf-8", buffering=1) as fh:
        fh.write(line)
        fh.flush()
        os.fsync(fh.fileno())


def _load_config() -> Dict[str, Any]:
    """Load watcher config; fall back to defaults if missing."""
    defaults: Dict[str, Any] = {
        "poll_interval_s": DEFAULT_POLL_INTERVAL_S,
        "max_context_bytes": DEFAULT_MAX_CONTEXT_BYTES,
        "thresholds": [10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99],
        "tolerance_pp": 2.0,
        "cooldown_s": 300.0,
        "bean_id": "manual",
        "session_id": "manual",
    }
    if _CONFIG_PATH.exists():
        try:
            with _CONFIG_PATH.open(encoding="utf-8") as fh:
                user_cfg = json.load(fh)
            defaults.update(user_cfg)
        except Exception:
            pass
    return defaults


def write_config(updates: Dict[str, Any]) -> None:
    """Persist watcher config updates."""
    cfg = _load_config()
    cfg.update(updates)
    tmp = _CONFIG_PATH.with_suffix(".tmp")
    with tmp.open("w", encoding="utf-8") as fh:
        json.dump(cfg, fh, indent=2)
    os.replace(str(tmp), str(_CONFIG_PATH))


# ── Snapshot persistence ──────────────────────────────────────────────────────

def write_snapshot(
    cursor_state: Dict[str, Any],
    threshold_triggered: float,
    direction: str,
    bean_id: str = "manual",
    session_tag: str = "manual",
    tablet_path: Path = _TABLET_PATH,
) -> Dict[str, Any]:
    """
    Build, sign, and persist a threshold-crossing snapshot.
    Returns the full snapshot record.
    """
    _ensure_dirs()
    snap_body: Dict[str, Any] = {
        "type": "context_budget_snapshot",
        "threshold_triggered": threshold_triggered,
        "direction": direction,
        "context_budget_percent": cursor_state.get("context_budget_percent"),
        "active_files": cursor_state.get("active_files", []),
        "tool_call_count": cursor_state.get("tool_call_count", 0),
        "session_id": cursor_state.get("session_id", session_tag),
        "bean_id": bean_id,
        "transcript_size_bytes": cursor_state.get("transcript_size_bytes"),
        "max_context_bytes": cursor_state.get("max_context_bytes"),
        "source": cursor_state.get("source", "unavailable"),
        "snapped_at": _iso_now(),
    }

    chronicler_hash = _compute_hash(snap_body)
    snapshot_id = f"SNAP-{session_tag}-{int(threshold_triggered):03d}-{chronicler_hash[:8]}"

    full_record: Dict[str, Any] = {
        **snap_body,
        "snapshot_id": snapshot_id,
        "chronicler_hash": chronicler_hash,
    }
    _fsync_append(tablet_path, full_record)
    return full_record


def load_snapshots(tablet_path: Path = _TABLET_PATH) -> List[Dict[str, Any]]:
    """Load all snapshots from the Stone Tablet."""
    if not tablet_path.exists():
        return []
    results = []
    with tablet_path.open(encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                results.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return results


# ── PID management ────────────────────────────────────────────────────────────

def _write_pid(pid: int) -> None:
    _PID_PATH.write_text(str(pid), encoding="utf-8")


def _read_pid() -> Optional[int]:
    if not _PID_PATH.exists():
        return None
    try:
        return int(_PID_PATH.read_text(encoding="utf-8").strip())
    except Exception:
        return None


def _clear_pid() -> None:
    _PID_PATH.unlink(missing_ok=True)


def _is_pid_running(pid: int) -> bool:
    """Cross-platform check if a PID is running."""
    try:
        if sys.platform == "win32":
            import ctypes
            handle = ctypes.windll.kernel32.OpenProcess(0x1000, False, pid)
            if handle:
                ctypes.windll.kernel32.CloseHandle(handle)
                return True
            return False
        else:
            os.kill(pid, 0)
            return True
    except (ProcessLookupError, PermissionError, OSError):
        return False


# ── Watcher loop ──────────────────────────────────────────────────────────────

def run_watch_loop(
    poll_interval_s: Optional[float] = None,
    tablet_path: Path = _TABLET_PATH,
    stop_event: Optional[Any] = None,
) -> None:
    """
    Main polling loop.  Runs until stop_event is set (for tests) or Ctrl-C.
    stop_event: a threading.Event or similar with .is_set() method.
    """
    from cursor_state import extract_cursor_state
    from threshold_engine import ThresholdEngine

    cfg = _load_config()
    interval = poll_interval_s if poll_interval_s is not None else cfg["poll_interval_s"]
    engine = ThresholdEngine(
        thresholds=cfg["thresholds"],
        tolerance_pp=cfg["tolerance_pp"],
        cooldown_s=cfg["cooldown_s"],
        state_path=_STATE_PATH,
    )

    _write_pid(os.getpid())
    print(f"[Herder Watcher] PID={os.getpid()} polling every {interval}s", flush=True)

    try:
        while True:
            if stop_event and stop_event.is_set():
                break

            state = extract_cursor_state(max_context_bytes=cfg["max_context_bytes"])
            pct = state.get("context_budget_percent")

            if pct is not None:
                crossings = engine.update(pct)
                for threshold, direction in crossings:
                    snap = write_snapshot(
                        cursor_state=state,
                        threshold_triggered=threshold,
                        direction=direction,
                        bean_id=cfg.get("bean_id", "manual"),
                        session_tag=cfg.get("session_id", "manual"),
                        tablet_path=tablet_path,
                    )
                    print(
                        f"[Herder Watcher] SNAPSHOT threshold={threshold}% "
                        f"actual={pct:.1f}% id={snap['snapshot_id']}",
                        flush=True,
                    )

            time.sleep(interval)
    except KeyboardInterrupt:
        print("[Herder Watcher] Stopped by KeyboardInterrupt", flush=True)
    finally:
        _clear_pid()
        print("[Herder Watcher] PID file cleared", flush=True)


# ── CLI ───────────────────────────────────────────────────────────────────────

def _cmd_start(args: List[str]) -> None:
    """Start the watcher in the foreground (for background: pipe to nohup/bg)."""
    cfg = _load_config()
    interval = DEFAULT_POLL_INTERVAL_S

    for arg in args:
        if arg.startswith("--interval="):
            try:
                interval = float(arg.split("=", 1)[1])
            except ValueError:
                pass
        elif arg.startswith("--threshold="):
            try:
                thresholds = [float(t) for t in arg.split("=", 1)[1].split(",")]
                cfg["thresholds"] = thresholds
                write_config(cfg)
            except ValueError:
                pass
        elif arg.startswith("--bean="):
            cfg["bean_id"] = arg.split("=", 1)[1]
            write_config(cfg)
        elif arg.startswith("--session="):
            cfg["session_id"] = arg.split("=", 1)[1]
            write_config(cfg)

    run_watch_loop(poll_interval_s=interval)


def _cmd_stop() -> None:
    """Stop the running watcher by sending SIGTERM to its PID."""
    pid = _read_pid()
    if pid is None:
        print("[Herder Watcher] Not running (no PID file)")
        return
    if not _is_pid_running(pid):
        print(f"[Herder Watcher] PID {pid} not running — clearing stale PID")
        _clear_pid()
        return
    try:
        if sys.platform == "win32":
            import ctypes
            ctypes.windll.kernel32.TerminateProcess(
                ctypes.windll.kernel32.OpenProcess(1, False, pid), 0
            )
        else:
            os.kill(pid, signal.SIGTERM)
        print(f"[Herder Watcher] Sent stop signal to PID {pid}")
        _clear_pid()
    except Exception as e:
        print(f"[Herder Watcher] Stop error: {e}")


def _cmd_status() -> None:
    """Print current watcher status."""
    pid = _read_pid()
    running = pid is not None and _is_pid_running(pid)
    cfg = _load_config()

    snaps = load_snapshots()
    status: Dict[str, Any] = {
        "running": running,
        "pid": pid,
        "config": cfg,
        "total_snapshots": len(snaps),
        "recent_snapshot": snaps[-1] if snaps else None,
    }
    print(json.dumps(status, indent=2))


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "status"
    rest = sys.argv[2:]
    if cmd == "start":
        _cmd_start(rest)
    elif cmd == "stop":
        _cmd_stop()
    else:
        _cmd_status()
