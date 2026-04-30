"""
Component 7 — Test Orchestrator (δ-mode, cross-session)
KN026 / #2299 / BP003

Drives the δ test: 90-Pod queue with cross-session checkpoint reload.
On each SessionStart-hook fire, resumes from last pod checkpoint.

δ-mode uses pod_checkpointer to persist state across Bishop session boundaries.
Each new session:
  1. Load cross-session summary from pod_checkpointer
  2. Determine which pods remain
  3. Continue from where previous session left off
  4. Save new pod checkpoints
  5. If all pods done → generate final reconciliation

Toolsmith log: TS-NINETY-POD-TEST-INFRASTRUCTURE-KN026-BP003
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional

from .pre_registration_validator import require_valid_lock
from .bean_instrumentation import BeanInstrumentationRecord
from .degradation_policy import check_bean_boundary, DegradationDecision
from .pod_checkpointer import (
    save_pod_checkpoint,
    load_pod_checkpoint,
    build_cross_session_summary,
)
from .chronos_test_signer import sign_pre_registration, sign_reconciliation, sign_test_artifact
from .reconciliation_reporter import generate_reconciliation_report


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


class DeltaOrchestrator:
    """
    Orchestrates δ-mode (cross-session) 90-Pod test.

    On each SessionStart: call resume_session() to continue from checkpoint.
    On test completion: call finalize() to produce signed reconciliation.

    Usage:
        orch = DeltaOrchestrator(prereg_doc, full_pod_queue, session_id="K581")
        # Each session:
        result = orch.resume_session(bean_executor)
        if result.get("test_complete"):
            print("All pods done!")
    """

    TEST_MODE = "delta"

    def __init__(
        self,
        prereg_doc: Dict[str, Any],
        full_pod_queue: List[Dict[str, Any]],  # All pods across all sessions
        base_session_id: str = "",
        safety_margin: float = 5.0,
    ) -> None:
        """
        Args:
            prereg_doc: locked #2298 pre-registration document.
            full_pod_queue: ordered list of pod specs:
                [{pod_id, beans: [{bean_id, bean_class, predicted_pp, session_position_class}]}]
            base_session_id: shared session identifier across all δ sub-sessions.
            safety_margin: degradation policy buffer.
        """
        self.prereg_doc = prereg_doc
        self.full_pod_queue = full_pod_queue
        self.base_session_id = base_session_id
        self.safety_margin = safety_margin
        self.run_log: List[str] = []
        self.test_run_id = (
            f"delta_{base_session_id}_{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S')}"
        )

    def _log(self, msg: str) -> None:
        self.run_log.append(f"[{_iso_now()}] {msg}")

    def resume_session(
        self,
        bean_executor: Callable[[Dict[str, Any], float], Dict[str, Any]],
        current_context_pct: float = 0.0,
        current_sub_session_id: str = "",
    ) -> Dict[str, Any]:
        """
        Resume δ test from last pod checkpoint for the current session.

        Returns:
            {"test_complete": bool, "pods_completed": int, "beans_landed": list,
             "signed_receipts": list}
        """
        require_valid_lock(self.prereg_doc)
        session_id = current_sub_session_id or self.base_session_id

        # Load what has been completed in prior sessions
        summary = build_cross_session_summary(self.TEST_MODE, self.base_session_id)
        completed_pod_ids = set(summary.get("pod_ids", []))
        all_beans_landed: List[Dict[str, Any]] = []
        signed_receipts: List[Dict[str, Any]] = []

        # Collect prior beans from checkpoints
        for cp in summary.get("checkpoints", []):
            for bid in cp.get("beans_landed", []):
                all_beans_landed.append({
                    "bean_id": bid,
                    "pod_id": cp["pod_id"],
                    "measured_pp": None,  # Historical; from prior sessions
                })

        context_pct = current_context_pct

        # Run remaining pods
        for pod_spec in self.full_pod_queue:
            pod_id = pod_spec["pod_id"]
            if pod_id in completed_pod_ids:
                self._log(f"Pod {pod_id} already completed — skipping.")
                continue

            pod_beans_landed: List[str] = []
            pod_deferrals: List[str] = []

            for bean_spec in pod_spec.get("beans", []):
                bean_id = bean_spec["bean_id"]
                predicted_pp = float(bean_spec.get("predicted_pp", 10.0))

                policy = check_bean_boundary(
                    current_context_pct=context_pct,
                    predicted_next_pp=predicted_pp,
                    bean_id=bean_id,
                    pod_id=pod_id,
                    safety_margin=self.safety_margin,
                )

                if policy.decision == DegradationDecision.HARD_STOP:
                    self._log(f"HARD STOP at {bean_id}: {policy.message}")
                    # Save checkpoint for this pod (partial) and stop session
                    save_pod_checkpoint(
                        pod_id=pod_id + "_partial",
                        context_pct=context_pct,
                        beans_landed=pod_beans_landed,
                        deferrals=pod_deferrals,
                        cumulative_cost_pp=context_pct,
                        test_mode=self.TEST_MODE,
                        session_id=self.base_session_id,
                    )
                    return {
                        "test_complete": False,
                        "pods_completed": len(completed_pod_ids),
                        "beans_landed": all_beans_landed,
                        "signed_receipts": signed_receipts,
                        "stopped_reason": "hard_stop",
                        "stopped_at_bean": bean_id,
                    }

                record = BeanInstrumentationRecord(
                    bean_id=bean_id,
                    bean_class=bean_spec.get("bean_class", "medium"),
                    session_position_class=bean_spec.get("session_position_class", "pod_first"),
                    predicted_pp=predicted_pp,
                    session_id=session_id,
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
                receipt = record.emit_l1_receipt()
                if receipt:
                    signed_receipts.append(receipt)

                context_pct = new_context_pct
                pod_beans_landed.append(bean_id)
                all_beans_landed.append({
                    "bean_id": bean_id,
                    "pod_id": pod_id,
                    "measured_pp": record.measured_cost_pp,
                    "predicted_pp": predicted_pp,
                })
                self._log(f"Bean {bean_id}: {record.measured_cost_pp:.1f}pp. Context {context_pct:.1f}%")

            # Pod complete — checkpoint
            save_pod_checkpoint(
                pod_id=pod_id,
                context_pct=context_pct,
                beans_landed=pod_beans_landed,
                deferrals=pod_deferrals,
                cumulative_cost_pp=context_pct,
                test_mode=self.TEST_MODE,
                session_id=self.base_session_id,
            )
            self._log(f"Pod {pod_id} completed and checkpointed.")

        # All pods done — generate reconciliation
        recon = generate_reconciliation_report(
            prereg_doc=self.prereg_doc,
            beans_landed=all_beans_landed,
            deferrals=[],
            test_mode=self.TEST_MODE,
            test_run_id=self.test_run_id,
            session_id=self.base_session_id,
        )
        signed_recon = sign_reconciliation(recon, self.test_run_id, self.base_session_id)
        signed_receipts.append(signed_recon)

        return {
            "test_complete": True,
            "pods_completed": len(self.full_pod_queue),
            "beans_landed": all_beans_landed,
            "signed_receipts": signed_receipts,
            "reconciliation": signed_recon,
        }
