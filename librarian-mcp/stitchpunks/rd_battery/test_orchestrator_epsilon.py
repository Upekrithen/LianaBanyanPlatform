"""
Component 8 — Test Orchestrator (ε-mode, wall-clock)
KN026 / #2299 / BP003

Drives the ε test: 1-hour wall-clock budget; fires beans until time runs out.
Measures context % climb vs wall time to derive the 0→90% climb rate.

ε-mode metrics:
  - pp_per_minute: context percentage points per minute
  - minutes_to_90pct: extrapolated time to reach 90% context
  - actual_climb_at_cutoff: context% at wall-clock deadline

Toolsmith log: TS-NINETY-POD-TEST-INFRASTRUCTURE-KN026-BP003
"""

from __future__ import annotations

import time
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional

from .pre_registration_validator import require_valid_lock
from .bean_instrumentation import BeanInstrumentationRecord
from .degradation_policy import check_bean_boundary, DegradationDecision
from .pod_checkpointer import save_pod_checkpoint
from .chronos_test_signer import sign_pre_registration, sign_reconciliation
from .reconciliation_reporter import generate_reconciliation_report

_DEFAULT_WALL_CLOCK_SECONDS = 3600  # 1 hour
_SCALED_DOWN_SECONDS = 60           # For test runs (1-minute scale-down)


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


class EpsilonOrchestrator:
    """
    Orchestrates ε-mode (wall-clock) context-climb test.

    Fires beans until wall-clock budget exhausted OR context hits 90%.
    Produces final climb receipt: actual pp gained vs wall time elapsed.

    Usage:
        orch = EpsilonOrchestrator(prereg_doc, bean_queue, session_id="K582",
                                    wall_clock_seconds=3600)
        result = orch.run(bean_executor)
    """

    TEST_MODE = "epsilon"

    def __init__(
        self,
        prereg_doc: Dict[str, Any],
        bean_queue: List[Dict[str, Any]],
        session_id: str = "",
        wall_clock_seconds: float = _DEFAULT_WALL_CLOCK_SECONDS,
        safety_margin: float = 5.0,
    ) -> None:
        self.prereg_doc = prereg_doc
        self.bean_queue = bean_queue
        self.session_id = session_id
        self.wall_clock_seconds = wall_clock_seconds
        self.safety_margin = safety_margin
        self.run_log: List[str] = []
        self.test_run_id = (
            f"epsilon_{session_id}_{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S')}"
        )

    def _log(self, msg: str) -> None:
        self.run_log.append(f"[{_iso_now()}] {msg}")

    def run(
        self,
        bean_executor: Callable[[Dict[str, Any], float], Dict[str, Any]],
        starting_context_pct: float = 0.0,
    ) -> Dict[str, Any]:
        """
        Execute ε test until wall-clock deadline or 90% context.

        Returns signed reconciliation dict with ε-specific metrics.
        """
        require_valid_lock(self.prereg_doc)
        signed_prereg = sign_pre_registration(
            self.prereg_doc, self.test_run_id, self.session_id
        )
        self._log(f"Epsilon test started. Budget: {self.wall_clock_seconds:.0f}s")

        context_pct = starting_context_pct
        beans_landed: List[Dict[str, Any]] = []
        start_time = time.monotonic()
        current_pod_id: Optional[str] = None

        for bean_spec in self.bean_queue:
            elapsed = time.monotonic() - start_time
            if elapsed >= self.wall_clock_seconds:
                self._log(f"Wall-clock budget exhausted at {elapsed:.1f}s.")
                break

            bean_id = bean_spec["bean_id"]
            pod_id = bean_spec.get("pod_id", "pod_eps")
            predicted_pp = float(bean_spec.get("predicted_pp", 10.0))

            # Pod boundary
            if pod_id != current_pod_id:
                if current_pod_id is not None:
                    save_pod_checkpoint(
                        pod_id=current_pod_id,
                        context_pct=context_pct,
                        beans_landed=[b["bean_id"] for b in beans_landed if b.get("pod_id") == current_pod_id],
                        deferrals=[],
                        cumulative_cost_pp=context_pct,
                        test_mode=self.TEST_MODE,
                        session_id=self.session_id,
                    )
                current_pod_id = pod_id

            policy = check_bean_boundary(
                current_context_pct=context_pct,
                predicted_next_pp=predicted_pp,
                bean_id=bean_id,
                pod_id=pod_id,
                safety_margin=self.safety_margin,
            )

            if policy.decision == DegradationDecision.HARD_STOP:
                self._log(f"HARD STOP at {bean_id}: {policy.message}")
                break

            record = BeanInstrumentationRecord(
                bean_id=bean_id,
                bean_class=bean_spec.get("bean_class", "medium"),
                session_position_class=bean_spec.get("session_position_class", "pod_first"),
                predicted_pp=predicted_pp,
                session_id=self.session_id,
                test_mode=self.TEST_MODE,
            )
            record.snapshot_before(context_pct)
            result = bean_executor(bean_spec, context_pct)
            new_context_pct = result.get("context_pct_after", context_pct + predicted_pp)
            record.snapshot_after(
                context_pct=new_context_pct,
                files_changed=result.get("files_changed", 0),
                insertions=result.get("insertions", 0),
                tests_passed=result.get("tests_passed", 0),
                tests_total=result.get("tests_total", 0),
            )
            record.emit_l1_receipt()
            context_pct = new_context_pct

            beans_landed.append({
                "bean_id": bean_id,
                "pod_id": pod_id,
                "measured_pp": record.measured_cost_pp,
                "predicted_pp": predicted_pp,
                "elapsed_s": elapsed,
            })
            self._log(
                f"Bean {bean_id}: +{record.measured_cost_pp:.1f}pp. "
                f"Context {context_pct:.1f}%. Elapsed {elapsed:.0f}s"
            )

        # Close last pod
        if current_pod_id:
            save_pod_checkpoint(
                pod_id=current_pod_id,
                context_pct=context_pct,
                beans_landed=[b["bean_id"] for b in beans_landed if b.get("pod_id") == current_pod_id],
                deferrals=[],
                cumulative_cost_pp=context_pct,
                test_mode=self.TEST_MODE,
                session_id=self.session_id,
            )

        total_elapsed = time.monotonic() - start_time
        elapsed_minutes = total_elapsed / 60.0
        pp_per_minute = (context_pct - starting_context_pct) / max(elapsed_minutes, 0.01)
        minutes_to_90 = (90.0 - starting_context_pct) / max(pp_per_minute, 0.01)

        epsilon_metrics = {
            "pp_per_minute": round(pp_per_minute, 3),
            "minutes_to_90pct_extrapolated": round(minutes_to_90, 1),
            "actual_climb_pp": round(context_pct - starting_context_pct, 2),
            "starting_context_pct": starting_context_pct,
            "final_context_pct": context_pct,
            "wall_clock_elapsed_s": round(total_elapsed, 2),
            "beans_executed": len(beans_landed),
        }
        self._log(f"Epsilon metrics: {epsilon_metrics}")

        reconciliation = generate_reconciliation_report(
            prereg_doc=self.prereg_doc,
            beans_landed=beans_landed,
            deferrals=[],
            test_mode=self.TEST_MODE,
            test_run_id=self.test_run_id,
            session_id=self.session_id,
            extra={"epsilon_metrics": epsilon_metrics},
        )
        signed_recon = sign_reconciliation(reconciliation, self.test_run_id, self.session_id)
        return signed_recon
