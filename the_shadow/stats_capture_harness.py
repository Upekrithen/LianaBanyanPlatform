"""
Stats-Capture Harness — Python Parallel — KN-S1 / BP018
=========================================================
Python mirror of TypeScript StatsCaptureHarness. Same telemetry schema;
same substrate path (~/.claude/state/test_telemetry/). Used by Shadow
E-Giant tests + any pytest-based K-prompt verifications.

Mirrors TypeScript harness discipline:
  - bookend_start on start()
  - interval snapshots at configurable cadence
  - bookend_end on end() with cost-accounting
  - anomaly detection on tick()
  - retention classifier on end()

FORK doctrine: harness writes to substrate; Knight working memory NOT load-bearing.
"""

from __future__ import annotations

import json
import os
import time
import threading
import platform
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Callable, TypeVar, Any

T = TypeVar("T")

# ─── Substrate paths ───────────────────────────────────────────────────────────

HOME = Path.home()
TELEMETRY_ROOT = HOME / ".claude" / "state" / "test_telemetry"
TELEMETRY_LIVE = TELEMETRY_ROOT / "live"
TELEMETRY_FAILED = TELEMETRY_ROOT / "failed"
TELEMETRY_ANOMALY = TELEMETRY_ROOT / "anomaly"
TELEMETRY_PROTECTED = TELEMETRY_ROOT / "protected"
TELEMETRY_ARCHIVE = TELEMETRY_ROOT / ".archive"


def ensure_telemetry_dirs(root: Path = TELEMETRY_ROOT) -> None:
    for d in [root, root / "live", root / "failed", root / "anomaly", root / "protected", root / ".archive"]:
        d.mkdir(parents=True, exist_ok=True)


# ─── Schema dataclass ──────────────────────────────────────────────────────────

@dataclass
class TelemetrySnapshot:
    test_id: str
    snapshot_type: str           # bookend_start | bookend_end | interval
    timestamp: str               # ISO-8601

    test_file: str
    outcome: str                 # in_flight | pass | fail | errored
    fork_doctrine_compliant: bool
    anomaly_flag: bool
    retention_class: str         # bookend | interval_pass | interval_fail | interval_anomaly | protected

    # K-prompt provenance
    k_prompt_source: Optional[str] = None
    k_prompt_section: Optional[str] = None

    # Knight session
    knight_session_id: Optional[str] = None
    knight_session_index: Optional[int] = None
    knight_session_total: Optional[int] = None

    # Test context
    test_name: Optional[str] = None
    phase: Optional[str] = None

    # Resources
    context_pct: Optional[float] = None
    context_used_tokens: Optional[int] = None
    context_cap_tokens: Optional[int] = None
    memory_mb: Optional[float] = None
    cpu_pct: Optional[float] = None

    # Assertions
    assertion_index: Optional[int] = None
    assertion_total: Optional[int] = None

    # Outcome detail
    error_details: Optional[str] = None
    commit_hash: Optional[str] = None

    # Marks + discipline
    bee_canon_marks: Optional[dict] = None
    cleaner_than_found: Optional[bool] = None

    # Anomaly
    anomaly_reason: Optional[str] = None

    # Cost-accounting
    vendor_api_tokens_input: Optional[int] = None
    vendor_api_tokens_output: Optional[int] = None
    vendor_api_provider: Optional[str] = None
    vendor_pricing_input_per_million: Optional[float] = None
    vendor_pricing_output_per_million: Optional[float] = None
    vendor_api_spend_usd: Optional[float] = None
    clock_time_ms: Optional[float] = None
    compute_cpu_seconds: Optional[float] = None
    counterfactual_cost_estimate_usd: Optional[float] = None
    counterfactual_estimation_method: Optional[str] = None
    estimated_savings_usd: Optional[float] = None
    estimated_savings_pct: Optional[float] = None
    colossus_paired_test_id: Optional[str] = None

    def to_dict(self) -> dict:
        return {k: v for k, v in asdict(self).items() if v is not None}


# ─── Snapshot writer ───────────────────────────────────────────────────────────

def write_snapshot(snapshot: TelemetrySnapshot, root: Path = TELEMETRY_ROOT) -> Path:
    ensure_telemetry_dirs(root)
    live_dir = root / "live"
    safe_ts = snapshot.timestamp.replace(":", "-").replace(".", "-")
    filename = f"{snapshot.test_id}__{snapshot.snapshot_type}__{safe_ts}.json"
    filepath = live_dir / filename
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(snapshot.to_dict(), f, indent=2)
    return filepath


# ─── Anomaly detection ─────────────────────────────────────────────────────────

def detect_anomalies(snapshot: dict, start_ts: float) -> tuple[bool, Optional[str]]:
    if (snapshot.get("context_pct") or 0) > 85:
        return True, f"context_pct {snapshot['context_pct']}% exceeds 85% threshold"
    runtime_ms = (time.time() - start_ts) * 1000
    if runtime_ms > 300_000 and snapshot.get("phase") and snapshot.get("phase") != "E":
        return True, f"phase stall: {snapshot['phase']} running for {int(runtime_ms / 1000)}s"
    return False, None


# ─── Retention classifier ──────────────────────────────────────────────────────

def classify_intervals(
    test_id: str,
    outcome: str,
    anomaly_flag: bool,
    root: Path = TELEMETRY_ROOT,
) -> None:
    live_dir = root / "live"
    failed_dir = root / "failed"
    anomaly_dir = root / "anomaly"

    if not live_dir.exists():
        return

    for f in live_dir.glob(f"{test_id}__interval__*.json"):
        if anomaly_flag:
            f.rename(anomaly_dir / f.name)
        elif outcome in ("fail", "errored"):
            f.rename(failed_dir / f.name)
        # pass + no anomaly → stays in live/


# ─── StatsCaptureHarness ───────────────────────────────────────────────────────

class StatsCaptureHarness:
    """
    Python parallel of TypeScript StatsCaptureHarness. Same telemetry schema;
    same substrate path. Used by Shadow E-Giant tests + pytest-based verifications.
    """

    def __init__(
        self,
        test_id: str,
        test_file: str,
        knight_session_id: Optional[str] = None,
        knight_session_index: Optional[int] = None,
        knight_session_total: Optional[int] = None,
        interval_seconds: float = 15.0,
        telemetry_root: Path = TELEMETRY_ROOT,
        k_prompt_source: Optional[str] = None,
        k_prompt_section: Optional[str] = None,
    ) -> None:
        self.test_id = test_id
        self.test_file = test_file
        self.knight_session_id = knight_session_id
        self.knight_session_index = knight_session_index
        self.knight_session_total = knight_session_total
        self.interval_seconds = interval_seconds
        self.telemetry_root = telemetry_root
        self.k_prompt_source = k_prompt_source
        self.k_prompt_section = k_prompt_section

        self._current: dict = {
            "test_id": test_id,
            "test_file": test_file,
            "outcome": "in_flight",
            "fork_doctrine_compliant": True,
            "anomaly_flag": False,
            "retention_class": "bookend",
        }
        self._start_ts: float = 0.0
        self._timer: Optional[threading.Timer] = None
        self._lock = threading.Lock()

    def start(self) -> Path:
        self._start_ts = time.time()
        snap = TelemetrySnapshot(
            test_id=self.test_id,
            snapshot_type="bookend_start",
            timestamp=_now_iso(),
            test_file=self.test_file,
            outcome="in_flight",
            fork_doctrine_compliant=True,
            anomaly_flag=False,
            retention_class="bookend",
            knight_session_id=self.knight_session_id,
            knight_session_index=self.knight_session_index,
            knight_session_total=self.knight_session_total,
            k_prompt_source=self.k_prompt_source,
            k_prompt_section=self.k_prompt_section,
            memory_mb=_memory_mb(),
            cpu_pct=_cpu_pct(),
        )
        path = write_snapshot(snap, self.telemetry_root)
        self._schedule_interval()
        return path

    def tick(self, state: dict) -> None:
        with self._lock:
            self._current.update(state)
            anomaly, reason = detect_anomalies(self._current, self._start_ts)
            if anomaly:
                self._current["anomaly_flag"] = True
                self._current["anomaly_reason"] = reason

    def end(
        self,
        outcome: str,
        *,
        error_details: Optional[str] = None,
        commit_hash: Optional[str] = None,
        vendor_api_tokens_input: int = 0,
        vendor_api_tokens_output: int = 0,
        vendor_api_provider: Optional[str] = None,
        vendor_pricing_input_per_million: float = 3.0,
        vendor_pricing_output_per_million: float = 15.0,
        colossus_paired_test_id: Optional[str] = None,
    ) -> Path:
        if self._timer:
            self._timer.cancel()
            self._timer = None

        clock_ms = (time.time() - self._start_ts) * 1000

        spend = (vendor_api_tokens_input / 1_000_000) * vendor_pricing_input_per_million + \
                (vendor_api_tokens_output / 1_000_000) * vendor_pricing_output_per_million
        counterfactual = spend * 3.5
        savings = counterfactual - spend
        savings_pct = (savings / counterfactual * 100) if counterfactual > 0 else 0.0

        with self._lock:
            current = dict(self._current)

        snap = TelemetrySnapshot(
            test_id=self.test_id,
            snapshot_type="bookend_end",
            timestamp=_now_iso(),
            test_file=self.test_file,
            outcome=outcome,
            fork_doctrine_compliant=current.get("fork_doctrine_compliant", True),
            anomaly_flag=current.get("anomaly_flag", False),
            retention_class="bookend",
            knight_session_id=self.knight_session_id,
            knight_session_index=self.knight_session_index,
            knight_session_total=self.knight_session_total,
            k_prompt_source=self.k_prompt_source,
            k_prompt_section=self.k_prompt_section,
            memory_mb=_memory_mb(),
            cpu_pct=_cpu_pct(),
            clock_time_ms=clock_ms,
            error_details=error_details,
            commit_hash=commit_hash,
            anomaly_reason=current.get("anomaly_reason"),
            vendor_api_tokens_input=vendor_api_tokens_input or None,
            vendor_api_tokens_output=vendor_api_tokens_output or None,
            vendor_api_provider=vendor_api_provider,
            vendor_pricing_input_per_million=vendor_pricing_input_per_million,
            vendor_pricing_output_per_million=vendor_pricing_output_per_million,
            vendor_api_spend_usd=spend if spend > 0 else None,
            counterfactual_cost_estimate_usd=counterfactual if counterfactual > 0 else None,
            counterfactual_estimation_method="marathon_3_4x_throughput_baseline" if counterfactual > 0 else None,
            estimated_savings_usd=savings if savings > 0 else None,
            estimated_savings_pct=savings_pct if savings > 0 else None,
            colossus_paired_test_id=colossus_paired_test_id,
        )
        path = write_snapshot(snap, self.telemetry_root)
        classify_intervals(self.test_id, outcome, snap.anomaly_flag, self.telemetry_root)
        return path

    def _schedule_interval(self) -> None:
        def emit() -> None:
            with self._lock:
                current = dict(self._current)
            snap = TelemetrySnapshot(
                test_id=self.test_id,
                snapshot_type="interval",
                timestamp=_now_iso(),
                test_file=self.test_file,
                outcome="in_flight",
                fork_doctrine_compliant=current.get("fork_doctrine_compliant", True),
                anomaly_flag=current.get("anomaly_flag", False),
                retention_class="interval_pass",
                memory_mb=_memory_mb(),
                cpu_pct=_cpu_pct(),
                knight_session_id=self.knight_session_id,
                knight_session_index=self.knight_session_index,
                knight_session_total=self.knight_session_total,
            )
            write_snapshot(snap, self.telemetry_root)
            # Re-schedule
            self._timer = threading.Timer(self.interval_seconds, emit)
            self._timer.daemon = True
            self._timer.start()

        self._timer = threading.Timer(self.interval_seconds, emit)
        self._timer.daemon = True
        self._timer.start()


# ─── Context manager helper ────────────────────────────────────────────────────

class stats_capture:
    """Context manager wrapper for StatsCaptureHarness."""

    def __init__(self, **kwargs: Any) -> None:
        self.harness = StatsCaptureHarness(**kwargs)
        self._outcome = "pass"
        self._error: Optional[str] = None

    def __enter__(self) -> StatsCaptureHarness:
        self.harness.start()
        return self.harness

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> bool:
        if exc_type is not None:
            self._outcome = "errored"
            self._error = str(exc_val)
        self.harness.end(self._outcome, error_details=self._error)
        return False


# ─── Internal helpers ──────────────────────────────────────────────────────────

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _memory_mb() -> float:
    try:
        import resource  # Unix only
        return resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024
    except ImportError:
        # Windows fallback
        try:
            import psutil
            return psutil.Process().memory_info().rss / 1024 / 1024
        except ImportError:
            return 0.0


def _cpu_pct() -> float:
    try:
        with open("/proc/loadavg") as f:
            avg = float(f.read().split()[0])
        import os as _os
        return round(avg / _os.cpu_count() * 100, 2)
    except Exception:
        return 0.0
