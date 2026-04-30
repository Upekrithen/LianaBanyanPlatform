"""
Component 2 — Per-Bean Instrumentation Harness
KN026 / #2299 / BP003

Wraps bean-execution with before/after snapshots:
  - before_bean_snapshot: context_pct, time, bean_class, session_position_class
  - after_bean_snapshot: context_pct, time, files_changed, insertions, tests_passed
  - measured_cost_pp: after.context_pct - before.context_pct

Emits Level-1 receipt to Chandelier via chronos_chandelier_bridge.sign_and_store().

Toolsmith log: TS-NINETY-POD-TEST-INFRASTRUCTURE-KN026-BP003
"""

from __future__ import annotations

import hashlib
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, Optional

_BRIDGE_DIR = Path(__file__).parent.parent / "chandelier"
import sys
if str(_BRIDGE_DIR.parent) not in sys.path:
    sys.path.insert(0, str(_BRIDGE_DIR.parent))

try:
    from chandelier.chronos_chandelier_bridge import sign_and_store
    _BRIDGE_AVAILABLE = True
except ImportError:
    _BRIDGE_AVAILABLE = False
    def sign_and_store(body: Dict, session_id: str = "") -> Dict:  # type: ignore[misc]
        """Stub when bridge not importable in test context."""
        return {**body, "chronos_signature": {"chronicler_hash": "stub", "temporal_anchor": ""}}


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _short_id(seed: str) -> str:
    h = hashlib.sha256((seed + _iso_now()).encode()).hexdigest()
    return "rc_" + h[:8]


class BeanSnapshot:
    """Immutable snapshot of context state before/after a bean."""

    def __init__(
        self,
        context_pct: float,
        wall_time_iso: str,
        bean_id: str,
        bean_class: str,
        session_position_class: str,
        extra: Optional[Dict[str, Any]] = None,
    ) -> None:
        self.context_pct = context_pct
        self.wall_time_iso = wall_time_iso
        self.bean_id = bean_id
        self.bean_class = bean_class
        self.session_position_class = session_position_class
        self.extra = extra or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "context_pct": self.context_pct,
            "wall_time_iso": self.wall_time_iso,
            "bean_id": self.bean_id,
            "bean_class": self.bean_class,
            "session_position_class": self.session_position_class,
            **self.extra,
        }


class BeanInstrumentationRecord:
    """
    Holds before + after snapshots and computes measured cost for one bean.
    Emits a signed Level-1 receipt via Chandelier.
    """

    def __init__(
        self,
        bean_id: str,
        bean_class: str,
        session_position_class: str = "pod_first",
        predicted_pp: float = 0.0,
        session_id: str = "",
        test_mode: str = "gamma",
    ) -> None:
        self.bean_id = bean_id
        self.bean_class = bean_class
        self.session_position_class = session_position_class
        self.predicted_pp = predicted_pp
        self.session_id = session_id
        self.test_mode = test_mode
        self.before: Optional[BeanSnapshot] = None
        self.after: Optional[BeanSnapshot] = None
        self._start_wall: float = 0.0

    def snapshot_before(self, context_pct: float) -> BeanSnapshot:
        """Record pre-bean state."""
        self._start_wall = time.monotonic()
        snap = BeanSnapshot(
            context_pct=context_pct,
            wall_time_iso=_iso_now(),
            bean_id=self.bean_id,
            bean_class=self.bean_class,
            session_position_class=self.session_position_class,
        )
        self.before = snap
        return snap

    def snapshot_after(
        self,
        context_pct: float,
        files_changed: int = 0,
        insertions: int = 0,
        tests_passed: int = 0,
        tests_total: int = 0,
    ) -> BeanSnapshot:
        """Record post-bean state."""
        elapsed_s = time.monotonic() - self._start_wall
        snap = BeanSnapshot(
            context_pct=context_pct,
            wall_time_iso=_iso_now(),
            bean_id=self.bean_id,
            bean_class=self.bean_class,
            session_position_class=self.session_position_class,
            extra={
                "files_changed": files_changed,
                "insertions": insertions,
                "tests_passed": tests_passed,
                "tests_total": tests_total,
                "elapsed_s": round(elapsed_s, 2),
            },
        )
        self.after = snap
        return snap

    @property
    def measured_cost_pp(self) -> Optional[float]:
        """Measured context cost in percentage points (after - before)."""
        if self.before is not None and self.after is not None:
            return round(self.after.context_pct - self.before.context_pct, 2)
        return None

    @property
    def prediction_error(self) -> Optional[float]:
        """Measured - Predicted (positive = underestimated cost)."""
        m = self.measured_cost_pp
        if m is not None:
            return round(m - self.predicted_pp, 2)
        return None

    def emit_l1_receipt(self) -> Optional[Dict[str, Any]]:
        """
        Build and sign a Level-1 receipt for this bean via Chandelier.

        Returns the signed receipt dict, or None if snapshots are incomplete.
        """
        if self.before is None or self.after is None:
            return None

        cost = self.measured_cost_pp or 0.0
        receipt_body: Dict[str, Any] = {
            "receipt_id": _short_id(f"{self.bean_id}-{self.test_mode}"),
            "receipt_class": "L1",
            "primitive_ids": [self.bean_id, f"RD_BATTERY_{self.test_mode.upper()}"],
            "session_id": self.session_id,
            "metric": "context_cost_pp",
            "baseline": {
                "score": 0.0,
                "description": f"Pre-bean context: {self.before.context_pct:.1f}%",
                "snapshot": self.before.to_dict(),
            },
            "treatment": {
                "score": cost,
                "description": f"Post-bean context: {self.after.context_pct:.1f}% (+{cost:.1f}pp)",
                "snapshot": self.after.to_dict(),
            },
            "delta": cost,
            "predicted_pp": self.predicted_pp,
            "prediction_error_pp": self.prediction_error,
            "test_mode": self.test_mode,
            "bean_class": self.bean_class,
            "session_position_class": self.session_position_class,
            "harness_id": "KN026-rd-battery-test-infrastructure",
        }

        try:
            signed = sign_and_store(receipt_body, session_id=self.session_id)
            return signed
        except Exception as exc:
            # Instrumentation failure → INVALIDATE per D.7
            raise RuntimeError(
                f"[KN026/D.7] Bean instrumentation failed mid-test; run INVALIDATED. "
                f"Bean: {self.bean_id}. Error: {exc}"
            ) from exc
