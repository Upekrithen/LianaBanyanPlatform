"""
Shutterbug Scribe MVP — KN028 / A&A #2304 / BP003

Auto-screenshot at every KN012 context-budget threshold crossing.
Observer pattern on snapshot_receipts.jsonl — non-breaking integration
with KN012 Cursor Context-Budget Watcher.

Architecture:
  - ShutterbugObserver: tails snapshot_receipts.jsonl for new entries
  - On new threshold-crossing snapshot: fires screenshot_engine.take_screenshot()
  - Writes capture manifest per session: shutterbug/sessions/<session_id>_manifest.jsonl
  - Runs as background thread (start/stop API)

Integration with KN012:
  Non-breaking observer on Stone Tablet JSONL. No modification to KN012 code.
  (Upgrade path: KN012 _snapshot_hooks list extension for zero-latency integration.)

Stone Tablet: manifest writes are fsync-appended.
Output:
  Screenshots: ~/Pictures/BeanSprouts/<session_id>/
  Manifest:    shutterbug/sessions/<session_id>_manifest.jsonl

Toolsmith log: TS-SHUTTERBUG-SCRIBE-KN028-BP003
"""

from __future__ import annotations

import json
import os
import sys
import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

from .screenshot_engine import take_screenshot, list_session_captures

_HERE = Path(__file__).parent
_SESSIONS_DIR = _HERE / "sessions"
_SNAPSHOT_TABLET = (
    Path(__file__).parent.parent / "chronos" / "chronicler_receipts" / "snapshot_receipts.jsonl"
)


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


# ── Manifest writer (Stone Tablet fsync) ─────────────────────────────────────

def _get_manifest_path(session_id: str) -> Path:
    _SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
    safe = session_id.replace("/", "_").replace("\\", "_").replace(":", "-")
    return _SESSIONS_DIR / f"{safe}_manifest.jsonl"


def _append_manifest(session_id: str, record: Dict[str, Any]) -> None:
    """Stone Tablet: fsync-append a capture record to the session manifest."""
    path = _get_manifest_path(session_id)
    record.setdefault("wall_time_iso", _iso_now())
    line = json.dumps(record, ensure_ascii=False) + "\n"
    try:
        with path.open("a", encoding="utf-8", buffering=1) as fh:
            fh.write(line)
            fh.flush()
            os.fsync(fh.fileno())
    except Exception as exc:
        print(f"[Shutterbug/Manifest] Write error: {exc}", file=sys.stderr)


def load_manifest(session_id: str) -> List[Dict[str, Any]]:
    """Load all manifest records for a session."""
    path = _get_manifest_path(session_id)
    if not path.exists():
        return []
    records = []
    with path.open(encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                try:
                    records.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
    return records


# ── Snapshot tablet reader (KN012 integration) ────────────────────────────────

def _load_snapshot_ids(tablet_path: Path) -> Set[str]:
    """Load all snapshot_ids already seen from the tablet."""
    seen: Set[str] = set()
    if not tablet_path.exists():
        return seen
    try:
        with tablet_path.open(encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    record = json.loads(line)
                    sid = record.get("snapshot_id") or record.get("chronicler_hash")
                    if sid:
                        seen.add(sid)
                except json.JSONDecodeError:
                    continue
    except Exception:
        pass
    return seen


def _read_new_snapshots(
    tablet_path: Path, seen_ids: Set[str]
) -> tuple[List[Dict[str, Any]], Set[str]]:
    """Read snapshots from tablet not yet seen. Returns (new_records, updated_seen)."""
    new_records: List[Dict[str, Any]] = []
    if not tablet_path.exists():
        return new_records, seen_ids

    try:
        with tablet_path.open(encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    record = json.loads(line)
                    sid = record.get("snapshot_id") or record.get("chronicler_hash")
                    if sid and sid not in seen_ids:
                        seen_ids = seen_ids | {sid}
                        new_records.append(record)
                except json.JSONDecodeError:
                    continue
    except Exception:
        pass

    return new_records, seen_ids


# ── ShutterbugObserver ────────────────────────────────────────────────────────

class ShutterbugObserver:
    """
    Observer that watches snapshot_receipts.jsonl for new KN012 threshold
    crossings and fires a screenshot for each.

    Runs as a background thread. Non-blocking start/stop.
    Guaranteed non-raising — screenshot failures are logged, not propagated.

    Usage:
        obs = ShutterbugObserver(session_id="BP003-K", bean_id="KN027")
        obs.start()
        # ... bean executes ...
        obs.set_bean("KN028")
        # ... another bean ...
        captures = obs.stop()
    """

    def __init__(
        self,
        session_id: str,
        bean_id: str = "",
        poll_interval_s: float = 5.0,
        tablet_path: Optional[Path] = None,
    ) -> None:
        self.session_id = session_id
        self.bean_id = bean_id
        self.poll_interval_s = poll_interval_s
        self.tablet_path = tablet_path or _SNAPSHOT_TABLET
        self._stop_event = threading.Event()
        self._thread: Optional[threading.Thread] = None
        self._seen_ids: Set[str] = set()
        self._capture_count: int = 0
        self._lock = threading.Lock()

    def set_bean(self, bean_id: str) -> None:
        """Update current bean context (thread-safe)."""
        with self._lock:
            self.bean_id = bean_id

    def start(self) -> None:
        """Start the observer background thread."""
        # Seed seen_ids from current tablet state (don't re-fire old snapshots)
        self._seen_ids = _load_snapshot_ids(self.tablet_path)
        self._stop_event.clear()
        self._thread = threading.Thread(
            target=self._observe_loop,
            name=f"shutterbug-{self.session_id}",
            daemon=True,
        )
        self._thread.start()
        print(
            f"[Shutterbug] Observer started session={self.session_id} "
            f"poll={self.poll_interval_s}s seeded={len(self._seen_ids)} existing snapshots",
            flush=True,
        )

    def stop(self, timeout_s: float = 10.0) -> List[Dict[str, Any]]:
        """Stop the observer. Returns all manifest records for the session."""
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=timeout_s)
        print(
            f"[Shutterbug] Observer stopped session={self.session_id} "
            f"captures={self._capture_count}",
            flush=True,
        )
        return load_manifest(self.session_id)

    def capture_now(
        self,
        threshold: float = 0.0,
        context_pct: float = 0.0,
        label: str = "manual",
    ) -> Dict[str, Any]:
        """Manually trigger a screenshot capture (useful for bean boundaries)."""
        with self._lock:
            bean = self.bean_id
        result = take_screenshot(
            session_id=self.session_id,
            threshold=threshold,
            context_pct=context_pct,
            bean_id=bean,
            extra_metadata={"trigger": label},
        )
        manifest_record = {**result, "trigger": label}
        _append_manifest(self.session_id, manifest_record)
        with self._lock:
            self._capture_count += 1
        print(
            f"[Shutterbug] Manual capture: {label} ctx={context_pct}% "
            f"captured={result['captured']} path={result['path']}",
            flush=True,
        )
        return result

    def _observe_loop(self) -> None:
        """Background polling loop — watches tablet for new threshold crossings."""
        while not self._stop_event.is_set():
            try:
                new_snaps, self._seen_ids = _read_new_snapshots(
                    self.tablet_path, self._seen_ids
                )
                for snap in new_snaps:
                    self._handle_snapshot(snap)
            except Exception as exc:
                print(f"[Shutterbug] Observe loop error: {exc}", file=sys.stderr)

            self._stop_event.wait(timeout=self.poll_interval_s)

    def _handle_snapshot(self, snap: Dict[str, Any]) -> None:
        """Fire a screenshot for a new threshold-crossing snapshot."""
        threshold = snap.get("threshold_triggered", 0.0)
        context_pct = snap.get("context_budget_percent") or 0.0
        snapshot_id = snap.get("snapshot_id", "unknown")

        with self._lock:
            bean = self.bean_id

        try:
            result = take_screenshot(
                session_id=self.session_id,
                threshold=threshold,
                context_pct=context_pct,
                bean_id=bean,
                extra_metadata={
                    "trigger": "kn012_threshold",
                    "snapshot_id": snapshot_id,
                    "kn012_session_id": snap.get("session_id", ""),
                },
            )
            manifest_record = {
                **result,
                "trigger": "kn012_threshold",
                "snapshot_id": snapshot_id,
            }
            _append_manifest(self.session_id, manifest_record)
            with self._lock:
                self._capture_count += 1
            print(
                f"[Shutterbug] Captured threshold={threshold}% ctx={context_pct}% "
                f"captured={result['captured']} snap={snapshot_id}",
                flush=True,
            )
        except Exception as exc:
            print(f"[Shutterbug] Capture error for snap {snapshot_id}: {exc}", file=sys.stderr)


# ── Module-level observer registry ────────────────────────────────────────────

_active_observers: Dict[str, ShutterbugObserver] = {}


def get_session_observer(
    session_id: str,
    bean_id: str = "",
    poll_interval_s: float = 5.0,
    create: bool = True,
) -> Optional[ShutterbugObserver]:
    """Retrieve or create a ShutterbugObserver for a session."""
    if session_id not in _active_observers:
        if not create:
            return None
        _active_observers[session_id] = ShutterbugObserver(
            session_id=session_id,
            bean_id=bean_id,
            poll_interval_s=poll_interval_s,
        )
    return _active_observers[session_id]


def stop_session_observer(session_id: str) -> List[Dict[str, Any]]:
    """Stop and remove observer for a session. Returns manifest."""
    obs = _active_observers.pop(session_id, None)
    if obs:
        return obs.stop()
    return load_manifest(session_id)
