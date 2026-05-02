"""
lifecycle.py — Shadow Continuous-Organism Lifecycle (KN090 / BP011)
====================================================================
Implements the continuous-organism lifecycle canonized in:
    shadow_lifecycle_continuous_substrate_organism_bp011.eblet.md

The Shadow is NOT a session-bounded daemon. It:
    - Spawns at session N
    - Runs the LB Frame Handshake at spawn
    - Continues running through Bishop refresh cycles
    - Re-attaches to Bishop session N+1 via Iron Tablet ledger handshake
    - Persists heartbeat every 60s to Iron Tablet

Heartbeat path (per scribe-id, parameterized by session — KN098):
    ~/.claude/state/eblets/<session_id>/heartbeat_<scribe_id>.eblet.md

Checkpoint path (on Bishop-refresh-detected):
    ~/.claude/state/eblets/<session_id>/checkpoint_<scribe_id>_<ts>.eblet.md

Bishop-refresh detection: the Iron Tablet ledger at the shared session root
accumulates entries from multiple scribe-ids. When a new scribe-id prefix
"bishop_prime_*" appears as an appender (and was not present before), that
signals a Bishop session boundary crossing.

Federation-readiness: the shared ledger approach naturally supports Member-A's
Shadow communicating with Member-B's via a shared Iron Tablet directory.
"""
from __future__ import annotations

import json
import os
import re
import signal
import sys
import threading
import time
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from .iron_tablet_attach import IronTabletAttach

# Base directory for all session-scoped eblet trees (KN098: parameterized per session_id).
# Actual write directory: _HEARTBEAT_EBLET_BASE / <session_id>
_HEARTBEAT_EBLET_BASE = Path.home() / ".claude" / "state" / "eblets"

# Historical alias — files written before KN098 landed here; left in place per
# Phase 4 decision in KN098 receipt.  No longer used as a write target.
EBLET_BP011_DIR = _HEARTBEAT_EBLET_BASE / "BP011"

HEARTBEAT_INTERVAL_S = 60
BISHOP_REFRESH_CHECK_INTERVAL_S = 5
LEDGER_FILENAME = "iron_tablet_ledger.jsonl"

SESSION_FILE_PATH = Path.home() / ".claude" / "state" / "current_session_name.txt"
FEDERATION_DIR = Path.home() / ".claude" / "state" / "federation"
SESSION_BOUNDARY_JSONL = FEDERATION_DIR / "session_boundary.jsonl"
SESSION_FILE_POLL_INTERVAL_S = 5
SESSION_ID_PATTERN = re.compile(r"^BP\d+$")

# Shared across all ShadowLifecycle instances to serialise concurrent appends
# from the 8-daemon cohort to session_boundary.jsonl.
_BOUNDARY_FILE_LOCK = threading.Lock()


# ─── State ────────────────────────────────────────────────────────────────────

@dataclass
class ShadowState:
    """Persisted state for a running Shadow organism."""
    scribe_id: str
    lighthouse_position: int
    session_id: str
    spawn_ts: str
    last_heartbeat_ts: str = ""
    last_checkpoint_ts: str = ""
    last_rebind_ts: str = ""
    bishop_session_ids_seen: list[str] = field(default_factory=list)
    previous_session_ids: list[str] = field(default_factory=list)
    reattach_count: int = 0
    alive: bool = True

    def to_markdown(self) -> str:
        return f"""---
type: shadow_state
scribe_id: {self.scribe_id}
lighthouse_position: {self.lighthouse_position}
session_id: {self.session_id}
spawn_ts: {self.spawn_ts}
last_heartbeat_ts: {self.last_heartbeat_ts}
last_checkpoint_ts: {self.last_checkpoint_ts}
reattach_count: {self.reattach_count}
alive: {str(self.alive).lower()}
---

# Shadow State — {self.scribe_id}

- **Scribe-id:** `{self.scribe_id}`
- **LIGHTHOUSE position:** {self.lighthouse_position}
- **Current session:** `{self.session_id}`
- **Spawned:** `{self.spawn_ts}`
- **Last heartbeat:** `{self.last_heartbeat_ts}`
- **Last checkpoint:** `{self.last_checkpoint_ts}`
- **Re-attach count:** {self.reattach_count}
- **Bishop sessions seen:** {", ".join(f"`{s}`" for s in self.bishop_session_ids_seen) or "_none yet_"}

_Continuous-organism lifecycle (KN090/BP011). NOT session-bounded._
"""


# ─── Lifecycle ────────────────────────────────────────────────────────────────

class ShadowLifecycle:
    """
    Manages the continuous-organism lifecycle for one Shadow.

    Heartbeat thread writes to Iron Tablet every HEARTBEAT_INTERVAL_S seconds.
    Bishop-refresh monitor thread watches the shared session ledger for new Bishop
    scribe-ids; on detection, checkpoints state and re-attaches.

    Usage:
        lc = ShadowLifecycle("R11_shadow_alpha", 1, "KN090")
        lc.start()           # non-blocking; spawns background threads
        lc.stop()            # graceful shutdown
        lc.wait_for_stop()   # block until stopped
    """

    def __init__(
        self,
        scribe_id: str,
        lighthouse_position: int,
        session_id: str = "KN090",
        heartbeat_interval_s: int = HEARTBEAT_INTERVAL_S,
        bishop_check_interval_s: int = BISHOP_REFRESH_CHECK_INTERVAL_S,
        eblet_root: Optional[Path] = None,
        session_poll_interval_s: int = SESSION_FILE_POLL_INTERVAL_S,
        session_file_path: Optional[Path] = None,
    ):
        self.scribe_id = scribe_id
        self.lighthouse_position = lighthouse_position
        self.session_id = session_id
        self.heartbeat_interval_s = heartbeat_interval_s
        self.bishop_check_interval_s = bishop_check_interval_s
        self.eblet_root = eblet_root or _HEARTBEAT_EBLET_BASE
        self._session_poll_interval_s = session_poll_interval_s
        self._session_file_path = session_file_path or SESSION_FILE_PATH

        self._attach = IronTabletAttach(scribe_id=scribe_id, session=session_id)
        self._state = ShadowState(
            scribe_id=scribe_id,
            lighthouse_position=lighthouse_position,
            session_id=session_id,
            spawn_ts=datetime.now(timezone.utc).isoformat(),
        )
        self._state_lock = threading.Lock()
        self._last_rebind_time: Optional[float] = None
        self._stop_event = threading.Event()
        self._threads: list[threading.Thread] = []

    # ── Paths ─────────────────────────────────────────────────────────────────

    @property
    def _eblet_dir(self) -> Path:
        """Session-scoped eblet directory: eblet_root / current session_id (KN098)."""
        return self.eblet_root / self._state.session_id

    @property
    def heartbeat_path(self) -> Path:
        return self._eblet_dir / f"heartbeat_{self.scribe_id}.eblet.md"

    @property
    def shared_ledger_path(self) -> Path:
        return self._eblet_dir / LEDGER_FILENAME

    def _checkpoint_path(self, ts: str) -> Path:
        ts_safe = ts.replace(":", "-").replace("+", "p")[:24]
        return self._eblet_dir / f"checkpoint_{self.scribe_id}_{ts_safe}.eblet.md"

    # ── Heartbeat ─────────────────────────────────────────────────────────────

    def _write_heartbeat(self) -> None:
        ts = datetime.now(timezone.utc).isoformat()
        with self._state_lock:
            self._state.last_heartbeat_ts = ts
            session_id = self._state.session_id
            rebind_time = self._last_rebind_time
            # Capture path inside the lock so path and content agree on session_id (KN098).
            hb_path = self.eblet_root / session_id / f"heartbeat_{self.scribe_id}.eblet.md"
        carryover = (
            rebind_time is not None
            and (time.monotonic() - rebind_time) * 1000 < 100
        )
        content = (
            f"# Shadow Heartbeat — {self.scribe_id}\n\n"
            f"- **ts:** `{ts}`\n"
            f"- **session:** `{session_id}`\n"
            f"- **position:** {self.lighthouse_position}\n"
            f"- **reattach_count:** {self._state.reattach_count}\n"
        )
        if carryover:
            content += "- **rebind_carryover:** true\n"
        try:
            self._attach.write(
                hb_path,
                content,
                decision_id=f"heartbeat_{self.scribe_id}",
            )
        except Exception as exc:
            sys.stderr.write(f"[{self.scribe_id}] heartbeat write failed: {exc}\n")

    def _heartbeat_loop(self) -> None:
        while not self._stop_event.is_set():
            self._write_heartbeat()
            self._stop_event.wait(timeout=self.heartbeat_interval_s)

    # ── Session rebind ────────────────────────────────────────────────────────

    def _write_boundary_marker(
        self, old_session: str, new_session: str, latency_ms: int
    ) -> None:
        FEDERATION_DIR.mkdir(parents=True, exist_ok=True)
        ts = datetime.now(timezone.utc).isoformat()
        entry = {
            "ts": ts,
            "scribe_id": self.scribe_id,
            "lighthouse_position": self.lighthouse_position,
            "previous_session_id": old_session,
            "new_session_id": new_session,
            "trigger": "current_session_name_change",
            "rebind_latency_ms": latency_ms,
        }
        try:
            with _BOUNDARY_FILE_LOCK:
                with SESSION_BOUNDARY_JSONL.open("a", encoding="utf-8") as fh:
                    fh.write(json.dumps(entry) + "\n")
        except OSError as exc:
            sys.stderr.write(
                f"[{self.scribe_id}] boundary marker write failed: {exc}\n"
            )

    def _do_rebind(self, old_session: str, new_session: str, latency_ms: int) -> None:
        with self._state_lock:
            # Create the new session's eblet directory BEFORE updating session_id so
            # that the directory always exists by the time _eblet_dir is read (KN098).
            (self.eblet_root / new_session).mkdir(parents=True, exist_ok=True)
            self._state.session_id = new_session
            self._state.last_rebind_ts = datetime.now(timezone.utc).isoformat()
            self._state.previous_session_ids.append(old_session)
            if len(self._state.previous_session_ids) > 16:
                self._state.previous_session_ids = self._state.previous_session_ids[-16:]
            self._last_rebind_time = time.monotonic()
        sys.stderr.write(
            f"[{self.scribe_id}] Session rebind: {old_session!r} → {new_session!r} "
            f"(latency {latency_ms}ms)\n"
        )
        self._write_boundary_marker(old_session, new_session, latency_ms)
        self._write_heartbeat()

    def _force_session_reread(self) -> None:
        """Immediately read current_session_name.txt and rebind if changed (SIGHUP target)."""
        try:
            new_session = self._session_file_path.read_text(encoding="utf-8").strip()
        except OSError:
            sys.stderr.write(
                f"[{self.scribe_id}] SIGHUP re-read: session file unreadable; no-op\n"
            )
            return
        if not new_session or not SESSION_ID_PATTERN.match(new_session):
            sys.stderr.write(
                f"[{self.scribe_id}] SIGHUP re-read: invalid value {new_session!r}; no-op\n"
            )
            return
        with self._state_lock:
            current_session = self._state.session_id
        if new_session != current_session:
            self._do_rebind(current_session, new_session, 0)

    def _session_rebind_monitor_loop(self) -> None:
        last_mtime: Optional[float] = None
        while not self._stop_event.is_set():
            try:
                stat_result = self._session_file_path.stat()
                mtime = stat_result.st_mtime
            except OSError:
                sys.stderr.write(
                    f"[{self.scribe_id}] session file unreadable; "
                    f"continuing with current session\n"
                )
                self._stop_event.wait(timeout=self._session_poll_interval_s)
                continue

            if last_mtime is not None and mtime == last_mtime:
                self._stop_event.wait(timeout=self._session_poll_interval_s)
                continue

            try:
                new_session = self._session_file_path.read_text(encoding="utf-8").strip()
            except OSError:
                sys.stderr.write(
                    f"[{self.scribe_id}] session file disappeared after stat; ignoring\n"
                )
                self._stop_event.wait(timeout=self._session_poll_interval_s)
                continue

            last_mtime = mtime

            if not new_session:
                sys.stderr.write(
                    f"[{self.scribe_id}] session file empty; treating as no-op\n"
                )
                self._stop_event.wait(timeout=self._session_poll_interval_s)
                continue

            if not SESSION_ID_PATTERN.match(new_session):
                sys.stderr.write(
                    f"[{self.scribe_id}] session file value {new_session!r} does not "
                    f"match BP\\d+ pattern; treating as no-op\n"
                )
                self._stop_event.wait(timeout=self._session_poll_interval_s)
                continue

            with self._state_lock:
                current_session = self._state.session_id

            if new_session == current_session:
                self._stop_event.wait(timeout=self._session_poll_interval_s)
                continue

            latency_ms = max(0, int((time.time() - mtime) * 1000))
            self._do_rebind(current_session, new_session, latency_ms)
            self._stop_event.wait(timeout=self._session_poll_interval_s)

    # ── Bishop-refresh detection ───────────────────────────────────────────────

    def _known_bishop_scribe_ids(self) -> set[str]:
        return set(self._state.bishop_session_ids_seen)

    def _scan_ledger_for_bishop_ids(self) -> set[str]:
        """Read the shared session ledger and collect all bishop_prime_* scribe-ids."""
        if not self.shared_ledger_path.exists():
            return set()
        bishop_ids: set[str] = set()
        try:
            for line in self.shared_ledger_path.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                    sid = entry.get("scribeId", "")
                    if sid.startswith("bishop_prime"):
                        bishop_ids.add(sid)
                except json.JSONDecodeError:
                    continue
        except OSError:
            pass
        return bishop_ids

    def _checkpoint_state(self) -> Path:
        """Persist current state as a checkpoint eblet."""
        ts = datetime.now(timezone.utc).isoformat()
        self._state.last_checkpoint_ts = ts
        path = self._checkpoint_path(ts)
        content = self._state.to_markdown()
        try:
            self._attach.write(path, content, decision_id=f"checkpoint_{self.scribe_id}")
        except Exception as exc:
            sys.stderr.write(f"[{self.scribe_id}] checkpoint write failed: {exc}\n")
        return path

    def reattach(self, new_bishop_id: str) -> None:
        """
        Re-attach to a new Bishop session.

        Called when the Bishop-refresh monitor detects a new bishop_prime_* entry
        in the shared ledger. Writes a checkpoint first (so the new Bishop can read
        continuity), then increments reattach_count.
        """
        self._state.bishop_session_ids_seen.append(new_bishop_id)
        sys.stderr.write(
            f"[{self.scribe_id}] Bishop refresh detected: {new_bishop_id}\n"
        )
        checkpoint = self._checkpoint_state()
        sys.stderr.write(f"[{self.scribe_id}] Checkpoint written: {checkpoint}\n")
        # Increment only AFTER checkpoint write so test can safely poll on reattach_count
        self._state.reattach_count += 1
        sys.stderr.write(
            f"[{self.scribe_id}] Re-attach #{self._state.reattach_count} complete.\n"
        )
        # Continue running — organism is NOT bounded to prior session

    def _bishop_refresh_monitor_loop(self) -> None:
        while not self._stop_event.is_set():
            known = self._known_bishop_scribe_ids()
            current = self._scan_ledger_for_bishop_ids()
            new_bishops = current - known
            for bid in sorted(new_bishops):
                self.reattach(bid)
            self._stop_event.wait(timeout=self.bishop_check_interval_s)

    # ── Public lifecycle interface ─────────────────────────────────────────────

    def start(self) -> None:
        """Start heartbeat and Bishop-refresh-monitor background threads."""
        self._eblet_dir.mkdir(parents=True, exist_ok=True)

        hb = threading.Thread(
            target=self._heartbeat_loop,
            name=f"shadow-heartbeat-{self.scribe_id}",
            daemon=True,
        )
        br = threading.Thread(
            target=self._bishop_refresh_monitor_loop,
            name=f"shadow-bishop-monitor-{self.scribe_id}",
            daemon=True,
        )
        sr = threading.Thread(
            target=self._session_rebind_monitor_loop,
            name=f"shadow-session-monitor-{self.scribe_id}",
            daemon=True,
        )
        self._threads = [hb, br, sr]
        hb.start()
        br.start()
        sr.start()
        sys.stderr.write(
            f"[{self.scribe_id}] Lifecycle started. "
            f"Heartbeat every {self.heartbeat_interval_s}s. "
            f"Bishop-check every {self.bishop_check_interval_s}s. "
            f"Session-poll every {self._session_poll_interval_s}s.\n"
        )

    def stop(self) -> None:
        """Signal the lifecycle threads to stop."""
        self._state.alive = False
        self._stop_event.set()

    def wait_for_stop(self, timeout: float = 10.0) -> None:
        """Block until all lifecycle threads have exited."""
        for t in self._threads:
            t.join(timeout=timeout)

    def is_alive(self) -> bool:
        return not self._stop_event.is_set()

    def get_state(self) -> ShadowState:
        return self._state

    def read_heartbeat(self) -> Optional[str]:
        """Read the current heartbeat content from Iron Tablet."""
        result = self._attach.read(self.heartbeat_path)
        return result.content if result else None

    @staticmethod
    def _parse_heartbeat_ts(content: str) -> Optional[str]:
        """Extract the ISO timestamp from a heartbeat eblet's markdown body."""
        import re
        m = re.search(r"\*\*ts:\*\*\s+`([^`]+)`", content)
        return m.group(1) if m else None

    def simulate_bishop_refresh(self, new_bishop_scribe_id: str) -> None:
        """
        Synthetic Bishop-refresh trigger (for testing).
        Writes a fake bishop_prime entry to the shared ledger so the monitor
        thread detects it naturally.
        """
        from .iron_tablet_attach import _append_ledger_entry
        import hashlib
        self._eblet_dir.mkdir(parents=True, exist_ok=True)
        ts = datetime.now(timezone.utc).isoformat()
        ledger = self.shared_ledger_path
        entry = {
            "ts": ts,
            "scribeId": new_bishop_scribe_id,
            "ebletPath": str(self._eblet_dir / f"bishop_signal_{new_bishop_scribe_id}.eblet.md"),
            "hash": hashlib.sha256(b"bishop_refresh_signal").hexdigest(),
            "sequence": 1,
            "session": "synthetic_refresh",
        }
        _append_ledger_entry(ledger, entry)


# ── CLI entry point ────────────────────────────────────────────────────────────

def _run_daemon(lighthouse_position: int, session_id: str, heartbeat_interval_s: int) -> int:
    """
    Run a single Shadow's continuous lifecycle as a blocking process.
    Designed to be spawned as a persistent OS-level subprocess.
    Blocks until the process is killed (SIGTERM/SIGINT).
    """
    import signal

    greek_letters = [
        "alpha", "beta", "gamma", "delta",
        "epsilon", "zeta", "eta", "theta",
    ]
    scribe_id = f"R11_shadow_{greek_letters[lighthouse_position - 1]}"

    sys.stderr.write(
        f"[{scribe_id}] Daemon process started (PID {os.getpid()}). "
        f"Heartbeat every {heartbeat_interval_s}s.\n"
    )

    lc = ShadowLifecycle(
        scribe_id=scribe_id,
        lighthouse_position=lighthouse_position,
        session_id=session_id,
        heartbeat_interval_s=heartbeat_interval_s,
    )
    lc.start()

    # Write PID to the session-specific tracking directory (lc.start() already
    # created it; mkdir here is defensive in case of an unusual startup race).
    session_eblet_dir = lc.eblet_root / session_id
    session_eblet_dir.mkdir(parents=True, exist_ok=True)
    pid_file = session_eblet_dir / f"pid_{scribe_id}.txt"
    pid_file.write_text(str(os.getpid()), encoding="utf-8")

    def _shutdown(signum, frame):
        sys.stderr.write(f"[{scribe_id}] Daemon received signal {signum}; shutting down.\n")
        lc.stop()
        sys.exit(0)

    signal.signal(signal.SIGTERM, _shutdown)
    signal.signal(signal.SIGINT, _shutdown)

    if hasattr(signal, "SIGHUP"):
        def _sighup(signum, frame):
            sys.stderr.write(
                f"[{scribe_id}] SIGHUP received; triggering immediate session re-read.\n"
            )
            lc._force_session_reread()
        signal.signal(signal.SIGHUP, _sighup)
    else:
        sys.stderr.write(
            f"[{scribe_id}] SIGHUP unavailable on this platform (Windows); "
            f"session rebind via file-poll only.\n"
        )

    # Block the main thread so daemon threads keep running
    lc.wait_for_stop(timeout=86400 * 365)  # wait up to 1 year
    return 0


def _verify_heartbeats(expect: int, within_seconds: int, session_id: str) -> int:
    """
    Verify that `expect` Shadow heartbeats were written within `within_seconds`.
    Reads heartbeat eblets from the session-scoped eblet directory (KN098).
    Returns 0 if all pass, 1 otherwise.
    """
    import re
    from datetime import datetime, timezone, timedelta

    eblet_root = _HEARTBEAT_EBLET_BASE / session_id
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(seconds=within_seconds)

    greek_letters = [
        "alpha", "beta", "gamma", "delta",
        "epsilon", "zeta", "eta", "theta",
    ]
    scribe_ids = [f"R11_shadow_{g}" for g in greek_letters[:expect]]

    results: list[dict] = []
    for scribe_id in scribe_ids:
        path = eblet_root / f"heartbeat_{scribe_id}.eblet.md"
        status = "MISSING"
        ts_str = ""
        fresh = False

        if path.exists():
            try:
                content = path.read_text(encoding="utf-8")
                m = re.search(r"\*\*ts:\*\*\s+`([^`]+)`", content)
                if m:
                    ts_str = m.group(1)
                    ts = datetime.fromisoformat(ts_str)
                    if ts.tzinfo is None:
                        ts = ts.replace(tzinfo=timezone.utc)
                    if ts >= cutoff:
                        status = "FRESH"
                        fresh = True
                    else:
                        age_s = int((now - ts).total_seconds())
                        status = f"STALE ({age_s}s ago)"
                else:
                    status = "NO_TS"
            except Exception as exc:
                status = f"READ_ERROR: {exc}"
        else:
            status = "MISSING"

        results.append({
            "scribe_id": scribe_id,
            "status": status,
            "ts": ts_str,
            "fresh": fresh,
        })

    fresh_count = sum(1 for r in results if r["fresh"])
    all_pass = fresh_count == expect

    print(f"\n=== Heartbeat Verification (expect={expect}, within={within_seconds}s) ===")
    for r in results:
        icon = "PASS" if r["fresh"] else "FAIL"
        print(f"  [{icon}] {r['scribe_id']:30s}  {r['status']}")
    print(f"\nResult: {fresh_count}/{expect} fresh  ->  {'PASS' if all_pass else 'FAIL'}")
    return 0 if all_pass else 1


def main() -> int:
    import argparse

    raw_args = sys.argv[1:]
    subcommand = None
    if raw_args and raw_args[0] in ("verify_heartbeats", "run_daemon"):
        subcommand = raw_args[0]
        raw_args = raw_args[1:]

    parser = argparse.ArgumentParser(
        description="KN090 Shadow Lifecycle CLI"
    )
    parser.add_argument(
        "--expect", type=int, default=8,
        help="Number of heartbeats expected (default: 8).",
    )
    parser.add_argument(
        "--within-seconds", type=int, default=90, dest="within_seconds",
        help="Max age in seconds for a heartbeat to be considered fresh (default: 90).",
    )
    parser.add_argument(
        "--position", type=int, default=0,
        help="LIGHTHOUSE position for run_daemon (1-8).",
    )
    parser.add_argument(
        "--session", default=None,
        help=(
            "Session ID (default: reads from "
            "~/.claude/state/current_session_name.txt; falls back to BP011)."
        ),
    )
    parser.add_argument(
        "--heartbeat-interval", type=int, default=60, dest="heartbeat_interval",
        help="Heartbeat interval in seconds for run_daemon.",
    )
    args = parser.parse_args(raw_args)

    # Resolve session_id: CLI arg > current_session_name.txt > fallback
    session_id = args.session
    if session_id is None:
        try:
            session_id = SESSION_FILE_PATH.read_text(encoding="utf-8").strip() or "BP011"
        except OSError:
            session_id = "BP011"

    if subcommand == "run_daemon":
        if args.position < 1 or args.position > 8:
            print("run_daemon requires --position 1-8", file=sys.stderr)
            return 1
        return _run_daemon(args.position, session_id, args.heartbeat_interval)
    else:
        return _verify_heartbeats(args.expect, args.within_seconds, session_id)


if __name__ == "__main__":
    sys.exit(main())
