"""
Component 6 — Test Orchestrator (γ-mode, single-session)
KN026 / #2299 / BP003

Drives the γ test:
  1. Load + verify pre-registration (gates on valid lock)
  2. Sign pre-reg via Chronos
  3. For each bean in queue (up to 90):
     a. Check degradation policy
     b. Snapshot before
     c. [Execute bean — caller-supplied callback or simulator]
     d. Snapshot after
     e. Emit L1 receipt
     f. Save incremental state
  4. Pod-boundary checkpoint at each pod end
  5. Final reconciliation signed + stored

γ-mode: single Bishop CC 1M Opus 4.7 session; all beans in one context window.

Toolsmith log: TS-NINETY-POD-TEST-INFRASTRUCTURE-KN026-BP003
"""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional

from .pre_registration_validator import require_valid_lock
from .bean_instrumentation import BeanInstrumentationRecord
from .degradation_policy import check_bean_boundary, DegradationDecision
from .pod_checkpointer import save_pod_checkpoint
from .chronos_test_signer import sign_pre_registration, sign_reconciliation
from .reconciliation_reporter import generate_reconciliation_report


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


class GammaOrchestrator:
    """
    Orchestrates γ-mode (single-session) 90-bean test.

    Usage:
        orch = GammaOrchestrator(prereg_doc, bean_queue, session_id="K580")
        orch.run(bean_executor=simulate_bean)

    bean_executor:
        Callable[[bean_spec, context_pct_before], Dict[str, Any]]
        Returns: {"context_pct_after": float, "files_changed": int, "insertions": int,
                  "tests_passed": int, "tests_total": int}
    """

    TEST_MODE = "gamma"

    def __init__(
        self,
        prereg_doc: Dict[str, Any],
        bean_queue: List[Dict[str, Any]],
        session_id: str = "",
        safety_margin: float = 5.0,
        context_pct_reader: Optional[Callable[[], float]] = None,
    ) -> None:
        """
        Args:
            prereg_doc: locked #2298 pre-registration document.
            bean_queue: list of bean spec dicts, each with:
                - bean_id: str
                - bean_class: str
                - pod_id: str
                - session_position_class: str
                - predicted_pp: float
            session_id: Bishop/Knight session identifier.
            safety_margin: pp buffer for degradation policy (default 5pp).
            context_pct_reader: callable that returns live context %. If None,
                uses values from bean executor results only.
        """
        self.prereg_doc = prereg_doc
        self.bean_queue = bean_queue
        self.session_id = session_id
        self.safety_margin = safety_margin
        self.context_pct_reader = context_pct_reader

        self.beans_landed: List[Dict[str, Any]] = []
        self.deferrals: List[str] = []
        self.pod_beans: Dict[str, List[str]] = {}  # pod_id → list of bean_ids landed
        self.current_context_pct: float = 0.0
        self.run_log: List[str] = []
        self.test_run_id: str = ""

    def _log(self, msg: str) -> None:
        ts = _iso_now()
        entry = f"[{ts}] {msg}"
        self.run_log.append(entry)

    def run(
        self,
        bean_executor: Callable[[Dict[str, Any], float], Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Execute the γ test end-to-end.

        Returns: final reconciliation dict (signed).
        """
        # Gate: validate + sign pre-reg
        require_valid_lock(self.prereg_doc)
        self.test_run_id = (
            f"gamma_{self.session_id}_{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S')}"
        )
        self._log(f"Gamma test started. test_run_id={self.test_run_id}")
        signed_prereg = sign_pre_registration(
            self.prereg_doc, self.test_run_id, self.session_id
        )
        self._log(f"Pre-reg signed: {signed_prereg.get('receipt_id','?')}")

        current_pod_id: Optional[str] = None

        for idx, bean_spec in enumerate(self.bean_queue):
            bean_id = bean_spec["bean_id"]
            pod_id = bean_spec.get("pod_id", f"pod_{idx // 3 + 1}")
            predicted_pp = float(bean_spec.get("predicted_pp", 10.0))

            # Pod boundary
            if pod_id != current_pod_id:
                if current_pod_id is not None:
                    self._close_pod(current_pod_id)
                current_pod_id = pod_id
                self.pod_beans[pod_id] = []
                self._log(f"Pod boundary → {pod_id}")

            # Degradation policy check
            policy = check_bean_boundary(
                current_context_pct=self.current_context_pct,
                predicted_next_pp=predicted_pp,
                bean_id=bean_id,
                pod_id=pod_id,
                safety_margin=self.safety_margin,
            )

            if policy.decision == DegradationDecision.HARD_STOP:
                self._log(f"HARD STOP at bean {bean_id}: {policy.message}")
                break
            elif policy.decision == DegradationDecision.SURFACE_OPERATOR:
                self._log(f"SURFACE_OPERATOR at bean {bean_id}: {policy.message}")
                # In γ-mode, surface and continue per default (operator must pre-confirm BP005)
                # For live fire: pause here and require explicit operator decision
                self.deferrals.append(f"{bean_id}:surface_operator")

            # Instrument bean
            record = BeanInstrumentationRecord(
                bean_id=bean_id,
                bean_class=bean_spec.get("bean_class", "medium"),
                session_position_class=bean_spec.get("session_position_class", "pod_first"),
                predicted_pp=predicted_pp,
                session_id=self.session_id,
                test_mode=self.TEST_MODE,
            )
            record.snapshot_before(self.current_context_pct)

            # Execute bean
            result = bean_executor(bean_spec, self.current_context_pct)

            new_context_pct = result.get("context_pct_after", self.current_context_pct + predicted_pp)
            record.snapshot_after(
                context_pct=new_context_pct,
                files_changed=result.get("files_changed", 0),
                insertions=result.get("insertions", 0),
                tests_passed=result.get("tests_passed", 0),
                tests_total=result.get("tests_total", 0),
            )

            # Emit L1 receipt
            receipt = record.emit_l1_receipt()
            self.current_context_pct = new_context_pct

            bean_result = {
                "bean_id": bean_id,
                "pod_id": pod_id,
                "bean_class": bean_spec.get("bean_class", "medium"),
                "predicted_pp": predicted_pp,
                "measured_pp": record.measured_cost_pp,
                "prediction_error_pp": record.prediction_error,
                "receipt_id": receipt.get("receipt_id") if receipt else None,
                "context_pct_after": new_context_pct,
            }
            self.beans_landed.append(bean_result)
            self.pod_beans.setdefault(pod_id, []).append(bean_id)
            self._log(
                f"Bean {bean_id} landed: {record.measured_cost_pp:.1f}pp "
                f"(predicted {predicted_pp:.1f}pp). Context: {new_context_pct:.1f}%"
            )

        # Close last pod
        if current_pod_id:
            self._close_pod(current_pod_id)

        # Final reconciliation
        reconciliation = generate_reconciliation_report(
            prereg_doc=self.prereg_doc,
            beans_landed=self.beans_landed,
            deferrals=self.deferrals,
            test_mode=self.TEST_MODE,
            test_run_id=self.test_run_id,
            session_id=self.session_id,
        )
        signed_recon = sign_reconciliation(reconciliation, self.test_run_id, self.session_id)
        self._log(f"Reconciliation signed: {signed_recon.get('receipt_id','?')}")
        return signed_recon

    def _close_pod(self, pod_id: str) -> None:
        beans_in_pod = self.pod_beans.get(pod_id, [])
        save_pod_checkpoint(
            pod_id=pod_id,
            context_pct=self.current_context_pct,
            beans_landed=beans_in_pod,
            deferrals=[d for d in self.deferrals if d.startswith("pod")],
            cumulative_cost_pp=self.current_context_pct,
            test_mode=self.TEST_MODE,
            session_id=self.session_id,
        )
        self._log(
            f"Pod {pod_id} closed: {len(beans_in_pod)} beans, "
            f"context {self.current_context_pct:.1f}%"
        )
