"""
Cursor Context-Budget Watcher — Component 2: Threshold Engine
KN012 / A&A #2293

Detects threshold crossings in context-budget % readings.
Deduplicates within-threshold to prevent snapshot spam.

Configuration:
  - thresholds: list of % values to snapshot at (default: 10,20,...,90,95,99)
  - tolerance_pp: how close to a threshold triggers it (default: 2.0 pp)
  - cooldown_s: minimum seconds between snapshots for same threshold (default: 300s)

Threshold state is in-memory per watcher session + persisted to state file.

Toolsmith log: TS-CURSOR-CONTEXT-BUDGET-WATCHER-KN012-BP002
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

DEFAULT_THRESHOLDS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99]
DEFAULT_TOLERANCE_PP = 2.0
DEFAULT_COOLDOWN_S = 300.0


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


class ThresholdEngine:
    """
    Stateful threshold-crossing detector.

    Usage:
        engine = ThresholdEngine()
        crossings = engine.update(context_pct)
        for threshold, direction in crossings:
            take_snapshot(threshold)
    """

    def __init__(
        self,
        thresholds: Optional[List[float]] = None,
        tolerance_pp: float = DEFAULT_TOLERANCE_PP,
        cooldown_s: float = DEFAULT_COOLDOWN_S,
        state_path: Optional[Path] = None,
    ) -> None:
        self.thresholds: List[float] = sorted(thresholds or DEFAULT_THRESHOLDS)
        self.tolerance_pp = tolerance_pp
        self.cooldown_s = cooldown_s
        self.state_path = state_path

        # Track which thresholds have been crossed this session
        self._crossed: Set[float] = set()
        # Last snapshot time per threshold
        self._last_snap: Dict[float, float] = {}
        # Previous context percent (for direction)
        self._prev_pct: Optional[float] = None

        if state_path and state_path.exists():
            self._load_state()

    def _load_state(self) -> None:
        try:
            with self.state_path.open(encoding="utf-8") as fh:  # type: ignore[union-attr]
                data = json.load(fh)
            self._crossed = set(data.get("crossed", []))
            self._last_snap = {float(k): float(v) for k, v in data.get("last_snap", {}).items()}
            self._prev_pct = data.get("prev_pct")
        except Exception:
            pass

    def _save_state(self) -> None:
        if not self.state_path:
            return
        try:
            self.state_path.parent.mkdir(parents=True, exist_ok=True)
            data = {
                "crossed": list(self._crossed),
                "last_snap": self._last_snap,
                "prev_pct": self._prev_pct,
                "saved_at": _iso_now(),
            }
            tmp = self.state_path.with_suffix(".tmp")
            with tmp.open("w", encoding="utf-8") as fh:
                json.dump(data, fh, indent=2)
            os.replace(str(tmp), str(self.state_path))
        except Exception:
            pass

    def update(self, context_pct: float) -> List[Tuple[float, str]]:
        """
        Update with a new context-budget reading.

        Returns list of (threshold, direction) tuples for thresholds crossed.
        direction = "crossing_up" | "reset"

        Deduplication: same threshold not re-triggered within cooldown_s,
        unless context dropped below it and crossed again (reset + re-cross).
        """
        import time
        now = time.monotonic()
        crossings: List[Tuple[float, str]] = []

        for thresh in self.thresholds:
            # Crossed up: context_pct is within tolerance above threshold
            near_or_above = context_pct >= thresh - self.tolerance_pp

            if near_or_above:
                if thresh not in self._crossed:
                    # Fresh crossing
                    self._crossed.add(thresh)
                    self._last_snap[thresh] = now
                    crossings.append((thresh, "crossing_up"))
                elif (now - self._last_snap.get(thresh, 0)) >= self.cooldown_s:
                    # Re-snap after cooldown (for long-running sessions staying near threshold)
                    self._last_snap[thresh] = now
                    crossings.append((thresh, "re_snap"))
            else:
                # Fell below threshold — reset so it can trigger again if context climbs back
                if thresh in self._crossed and self._prev_pct is not None:
                    if self._prev_pct >= thresh and context_pct < thresh - self.tolerance_pp:
                        self._crossed.discard(thresh)

        self._prev_pct = context_pct
        self._save_state()
        return crossings

    def reset_session(self) -> None:
        """Clear all crossed thresholds for a new session."""
        self._crossed.clear()
        self._last_snap.clear()
        self._prev_pct = None
        self._save_state()

    def status(self) -> Dict[str, Any]:
        return {
            "thresholds": self.thresholds,
            "crossed_this_session": sorted(self._crossed),
            "prev_context_pct": self._prev_pct,
            "tolerance_pp": self.tolerance_pp,
            "cooldown_s": self.cooldown_s,
        }
