"""
Tests for KN026 — 90-Pod Test Infrastructure
Target: 35+ tests across 10 components + integration.

Run:
    python discipline_wing/tests_kn026.py
"""

from __future__ import annotations

import json
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

_WORKSPACE = Path(__file__).parent.parent
if str(_WORKSPACE) not in sys.path:
    sys.path.insert(0, str(_WORKSPACE))

_RD_BATTERY = _WORKSPACE / "librarian-mcp" / "stitchpunks" / "rd_battery"
if str(_RD_BATTERY.parent) not in sys.path:
    sys.path.insert(0, str(_RD_BATTERY.parent))


# ── Fixtures ──────────────────────────────────────────────────────────────────

def _make_valid_prereg(hypothesis: str = "Context cost stays within 15pp per medium bean across 3 pods.") -> Dict[str, Any]:
    return {
        "hypothesis": hypothesis,
        "falsification_criteria": [
            "Any single bean exceeds 25pp",
            "Aggregate climb > 120pp for 9 beans",
        ],
        "predicted_measurements": {
            "bean_predictions": {"KN001": 10.0, "KN002": 12.0},
            "total_predicted_pp": 90.0,
        },
        "receipt_collection_protocol": "Cursor context% screenshot before and after each bean execution.",
        "scenarios": ["A: confirmed", "B: partial", "C: falsified"],
        "timestamp_iso": "2026-04-30T10:00:00Z",
    }


def _make_bean_queue(n: int = 9, start_context: float = 0.0) -> List[Dict[str, Any]]:
    pods = ["pod_G", "pod_H", "pod_I"]
    pos_classes = ["pod_first", "pod_warm", "pod_deep_warm"]
    beans = []
    for i in range(n):
        beans.append({
            "bean_id": f"KN{100 + i:03d}",
            "bean_class": "medium",
            "pod_id": pods[(i // 3) % len(pods)],
            "session_position_class": pos_classes[i % 3],
            "predicted_pp": 10.0,
        })
    return beans


def _simulate_bean(bean_spec: Dict[str, Any], context_before: float) -> Dict[str, Any]:
    """Simulates a bean execution: adds ~10pp."""
    return {
        "context_pct_after": context_before + 10.0,
        "files_changed": 5,
        "insertions": 100,
        "tests_passed": 15,
        "tests_total": 15,
    }


# ── Component 1: Pre-Registration Validator ─────────────────────────────────

def test_prereg_validator_accepts_valid_doc() -> None:
    from rd_battery.pre_registration_validator import validate_schema
    doc = _make_valid_prereg()
    is_valid, errors = validate_schema(doc)
    assert is_valid, f"Expected valid. Errors: {errors}"


def test_prereg_validator_rejects_missing_hypothesis() -> None:
    from rd_battery.pre_registration_validator import validate_schema
    doc = _make_valid_prereg()
    del doc["hypothesis"]
    is_valid, errors = validate_schema(doc)
    assert not is_valid
    assert any("hypothesis" in e for e in errors)


def test_prereg_validator_rejects_empty_falsification() -> None:
    from rd_battery.pre_registration_validator import validate_schema
    doc = _make_valid_prereg()
    doc["falsification_criteria"] = []
    is_valid, errors = validate_schema(doc)
    assert not is_valid
    assert any("falsification" in e for e in errors)


def test_prereg_lock_computes_hash() -> None:
    from rd_battery.pre_registration_validator import lock_pre_registration
    doc = _make_valid_prereg()
    locked = lock_pre_registration(doc)
    assert "content_hash_lock" in locked
    assert len(locked["content_hash_lock"]) == 64  # SHA-256 hex


def test_prereg_lock_verify_passes() -> None:
    from rd_battery.pre_registration_validator import lock_pre_registration, verify_lock
    locked = lock_pre_registration(_make_valid_prereg())
    is_valid, msg = verify_lock(locked)
    assert is_valid, msg


def test_prereg_lock_verify_fails_on_tamper() -> None:
    from rd_battery.pre_registration_validator import lock_pre_registration, verify_lock
    locked = lock_pre_registration(_make_valid_prereg())
    tampered = dict(locked)
    tampered["hypothesis"] = "Tampered hypothesis!"
    is_valid, msg = verify_lock(tampered)
    assert not is_valid
    assert "tampered" in msg.lower() or "mismatch" in msg.lower()


def test_require_valid_lock_raises_without_lock() -> None:
    from rd_battery.pre_registration_validator import require_valid_lock
    doc = _make_valid_prereg()  # Not locked
    try:
        require_valid_lock(doc)
        assert False, "Should have raised RuntimeError"
    except RuntimeError as e:
        assert "#2298" in str(e) or "GATE" in str(e)


# ── Component 2: Bean Instrumentation ─────────────────────────────────────

def test_bean_snapshot_before_after() -> None:
    from rd_battery.bean_instrumentation import BeanInstrumentationRecord
    rec = BeanInstrumentationRecord(
        bean_id="KN100", bean_class="medium", session_position_class="pod_first",
        predicted_pp=10.0, session_id="K580", test_mode="gamma"
    )
    rec.snapshot_before(context_pct=30.0)
    rec.snapshot_after(context_pct=42.0, files_changed=5, insertions=200, tests_passed=20, tests_total=20)
    assert rec.measured_cost_pp == 12.0
    assert rec.prediction_error == 2.0  # 12 - 10


def test_bean_emit_l1_receipt() -> None:
    from rd_battery.bean_instrumentation import BeanInstrumentationRecord
    rec = BeanInstrumentationRecord(
        bean_id="KN101", bean_class="small", session_position_class="pod_warm",
        predicted_pp=5.0, session_id="K580", test_mode="gamma"
    )
    rec.snapshot_before(context_pct=10.0)
    rec.snapshot_after(context_pct=16.0)
    receipt = rec.emit_l1_receipt()
    assert receipt is not None
    assert receipt.get("receipt_class") == "L1"
    assert "KN101" in receipt.get("primitive_ids", [])
    assert "chronos_signature" in receipt


def test_bean_missing_snapshot_returns_none() -> None:
    from rd_battery.bean_instrumentation import BeanInstrumentationRecord
    rec = BeanInstrumentationRecord(
        bean_id="KN102", bean_class="large", session_position_class="pod_late",
        predicted_pp=20.0, session_id="K580", test_mode="gamma"
    )
    # No snapshots taken
    assert rec.measured_cost_pp is None
    assert rec.emit_l1_receipt() is None


# ── Component 3: Degradation Policy ─────────────────────────────────────────

def test_degradation_continue_when_safe() -> None:
    from rd_battery.degradation_policy import check_bean_boundary, DegradationDecision
    result = check_bean_boundary(
        current_context_pct=30.0,
        predicted_next_pp=10.0,
        safety_margin=5.0,
    )
    assert result.decision == DegradationDecision.CONTINUE
    assert result.projected_after_pp == 45.0


def test_degradation_surface_when_approaching() -> None:
    from rd_battery.degradation_policy import check_bean_boundary, DegradationDecision
    result = check_bean_boundary(
        current_context_pct=80.0,
        predicted_next_pp=8.0,
        safety_margin=5.0,
    )
    assert result.decision == DegradationDecision.SURFACE_OPERATOR
    assert result.operator_prompt is not None
    assert "OPERATOR" in result.operator_prompt


def test_degradation_hard_stop_at_ceiling() -> None:
    from rd_battery.degradation_policy import check_bean_boundary, DegradationDecision
    result = check_bean_boundary(
        current_context_pct=91.0,
        predicted_next_pp=5.0,
    )
    assert result.decision == DegradationDecision.HARD_STOP


def test_degradation_operator_decision_validates() -> None:
    from rd_battery.degradation_policy import assert_operator_decided
    assert_operator_decided("defer", "KN100")
    assert_operator_decided("push_through", "KN100")
    try:
        assert_operator_decided("continue", "KN100")
        assert False, "Should have raised"
    except ValueError:
        pass


# ── Component 4: Pod Checkpointer ─────────────────────────────────────────

def test_pod_checkpoint_save_load() -> None:
    from rd_battery.pod_checkpointer import save_pod_checkpoint, load_pod_checkpoint
    with tempfile.TemporaryDirectory() as tmpdir:
        import rd_battery.pod_checkpointer as pc
        orig_dir = pc._CHECKPOINTS_DIR
        pc._CHECKPOINTS_DIR = Path(tmpdir)
        try:
            path = save_pod_checkpoint(
                pod_id="pod_G",
                context_pct=32.0,
                beans_landed=["KN100", "KN101"],
                deferrals=[],
                cumulative_cost_pp=32.0,
                test_mode="gamma",
                session_id="K580_test",
            )
            assert path.exists()
            cp = load_pod_checkpoint("pod_G", "gamma", "K580_test")
            assert cp is not None
            assert cp["context_pct_at_pod_end"] == 32.0
            assert cp["beans_landed"] == ["KN100", "KN101"]
        finally:
            pc._CHECKPOINTS_DIR = orig_dir


def test_pod_checkpoint_cross_session_summary() -> None:
    from rd_battery.pod_checkpointer import (
        save_pod_checkpoint, build_cross_session_summary
    )
    import rd_battery.pod_checkpointer as pc
    with tempfile.TemporaryDirectory() as tmpdir:
        orig_dir = pc._CHECKPOINTS_DIR
        pc._CHECKPOINTS_DIR = Path(tmpdir)
        try:
            save_pod_checkpoint("pod_G", 30.0, ["KN100", "KN101", "KN102"], [],
                                30.0, "delta", "SID001")
            save_pod_checkpoint("pod_H", 60.0, ["KN103", "KN104", "KN105"], [],
                                60.0, "delta", "SID001")
            summary = build_cross_session_summary("delta", "SID001")
            assert summary["pods_completed"] == 2
            assert summary["total_beans_landed"] == 6
        finally:
            pc._CHECKPOINTS_DIR = orig_dir


# ── Component 5: Chronos Test Signer ────────────────────────────────────────

def test_chronos_signer_pre_reg() -> None:
    from rd_battery.pre_registration_validator import lock_pre_registration
    from rd_battery.chronos_test_signer import sign_pre_registration, sign_test_artifact
    locked = lock_pre_registration(_make_valid_prereg())
    signed = sign_pre_registration(locked, test_run_id="gamma_K580_test", session_id="K580")
    assert "chronos_signature" in signed
    assert signed.get("receipt_class") == "L0"


def test_chronos_signer_raises_unknown_type() -> None:
    from rd_battery.chronos_test_signer import sign_test_artifact
    try:
        sign_test_artifact("unknown_type", {}, "run001")
        assert False, "Should have raised"
    except ValueError as e:
        assert "unknown_type" in str(e)


def test_chronos_signer_reconciliation() -> None:
    from rd_battery.chronos_test_signer import sign_reconciliation
    signed = sign_reconciliation({"result": "ok"}, "gamma_K580_test", "K580")
    assert signed.get("receipt_class") == "L3"
    assert "chronos_signature" in signed


# ── Component 9: Reconciliation Reporter ───────────────────────────────────

def test_reconciliation_scenario_A() -> None:
    from rd_battery.reconciliation_reporter import generate_reconciliation_report
    from rd_battery.pre_registration_validator import lock_pre_registration
    prereg = lock_pre_registration(_make_valid_prereg())
    beans = [
        {"bean_id": f"KN{i}", "pod_id": "pod_G", "predicted_pp": 10.0, "measured_pp": 10.5}
        for i in range(9)
    ]
    report = generate_reconciliation_report(
        prereg_doc=prereg,
        beans_landed=beans,
        deferrals=[],
        test_mode="gamma",
        test_run_id="gamma_K580_test",
    )
    verdict = report["scenario_verdict"]
    # 9 beans at 10pp predicted, 10.5pp measured → 5% error → Scenario A
    assert verdict["verdict"] == "A"
    assert not verdict["hypothesis_falsified"]


def test_reconciliation_scenario_C() -> None:
    from rd_battery.reconciliation_reporter import generate_reconciliation_report
    from rd_battery.pre_registration_validator import lock_pre_registration
    prereg = lock_pre_registration(_make_valid_prereg())
    beans = [
        {"bean_id": f"KN{i}", "pod_id": "pod_G", "predicted_pp": 10.0, "measured_pp": 22.0}
        for i in range(9)
    ]
    report = generate_reconciliation_report(
        prereg_doc=prereg,
        beans_landed=beans,
        deferrals=[],
        test_mode="gamma",
        test_run_id="gamma_K580_test",
    )
    verdict = report["scenario_verdict"]
    assert verdict["verdict"] == "C"
    assert verdict["hypothesis_falsified"]


def test_reconciliation_paper_scaffold_present() -> None:
    from rd_battery.reconciliation_reporter import generate_reconciliation_report
    from rd_battery.pre_registration_validator import lock_pre_registration
    prereg = lock_pre_registration(_make_valid_prereg())
    beans = [{"bean_id": "KN100", "pod_id": "pod_G", "predicted_pp": 10.0, "measured_pp": 11.0}]
    report = generate_reconciliation_report(prereg, beans, [], "gamma", "run001")
    assert "paper_part_2_scaffold" in report
    assert "Scenario Verdict" in report["paper_part_2_scaffold"]


def test_reconciliation_pre_reg_hash_referenced() -> None:
    from rd_battery.reconciliation_reporter import generate_reconciliation_report
    from rd_battery.pre_registration_validator import lock_pre_registration
    prereg = lock_pre_registration(_make_valid_prereg())
    report = generate_reconciliation_report(prereg, [], [], "gamma", "run001")
    assert report["pre_reg_content_hash"] == prereg["content_hash_lock"]


# ── Component 10: Participant Export ────────────────────────────────────────

def test_participant_export_creates_kit() -> None:
    from rd_battery.participant_export import export_participant_kit, list_participant_kits
    from rd_battery.pre_registration_validator import lock_pre_registration
    import rd_battery.participant_export as pe
    with tempfile.TemporaryDirectory() as tmpdir:
        orig_dir = pe._KITS_DIR
        pe._KITS_DIR = Path(tmpdir)
        try:
            locked = lock_pre_registration(_make_valid_prereg())
            kit_dir = export_participant_kit(
                prereg_doc=locked,
                bean_queue=_make_bean_queue(3),
                test_run_id="gamma_K580_test",
                test_mode="gamma",
            )
            assert (kit_dir / "pre_registration.json").exists()
            assert (kit_dir / "methodology.md").exists()
            assert (kit_dir / "bean_queue.json").exists()
            assert (kit_dir / "receipt_submission_template.json").exists()
            assert (kit_dir / "README_reproducibility.md").exists()
        finally:
            pe._KITS_DIR = orig_dir


def test_participant_export_receipt_template_has_hash() -> None:
    from rd_battery.participant_export import export_participant_kit
    from rd_battery.pre_registration_validator import lock_pre_registration
    import rd_battery.participant_export as pe
    with tempfile.TemporaryDirectory() as tmpdir:
        orig_dir = pe._KITS_DIR
        pe._KITS_DIR = Path(tmpdir)
        try:
            locked = lock_pre_registration(_make_valid_prereg())
            kit_dir = export_participant_kit(locked, [], "gamma_K580_test_2")
            template = json.loads(
                (kit_dir / "receipt_submission_template.json").read_text("utf-8")
            )
            assert template["pre_reg_content_hash"] == locked["content_hash_lock"]
        finally:
            pe._KITS_DIR = orig_dir


# ── Integration: γ test on synthetic 9-bean queue ───────────────────────────

def test_gamma_integration_9_beans() -> None:
    """D.11: Full γ test run on synthetic 9-bean queue."""
    from rd_battery.pre_registration_validator import lock_pre_registration
    from rd_battery.test_orchestrator_gamma import GammaOrchestrator

    prereg = lock_pre_registration(_make_valid_prereg())
    queue = _make_bean_queue(9)

    orch = GammaOrchestrator(
        prereg_doc=prereg,
        bean_queue=queue,
        session_id="K580_gamma_test",
    )
    signed_recon = orch.run(bean_executor=_simulate_bean)
    assert "chronos_signature" in signed_recon
    assert len(orch.beans_landed) == 9


def test_gamma_integration_scenario_verdict_present() -> None:
    """D.12: γ reconciliation contains scenario verdict."""
    from rd_battery.pre_registration_validator import lock_pre_registration
    from rd_battery.test_orchestrator_gamma import GammaOrchestrator

    prereg = lock_pre_registration(_make_valid_prereg())
    orch = GammaOrchestrator(prereg, _make_bean_queue(9), session_id="K580_v2")
    signed_recon = orch.run(bean_executor=_simulate_bean)
    body = signed_recon.get("artifact_body", {})
    assert "scenario_verdict" in body


def test_gamma_gates_on_missing_lock() -> None:
    """D.13: γ orchestrator refuses to start without locked pre-reg."""
    from rd_battery.test_orchestrator_gamma import GammaOrchestrator

    prereg = _make_valid_prereg()  # NOT locked
    orch = GammaOrchestrator(prereg, _make_bean_queue(3), session_id="K580_gate")
    try:
        orch.run(bean_executor=_simulate_bean)
        assert False, "Should have raised RuntimeError"
    except RuntimeError as e:
        assert "#2298" in str(e) or "GATE" in str(e) or "locked" in str(e).lower()


def test_gamma_pod_checkpoints_written() -> None:
    """D.14: γ writes pod checkpoints at each pod boundary."""
    from rd_battery.pre_registration_validator import lock_pre_registration
    from rd_battery.test_orchestrator_gamma import GammaOrchestrator
    import rd_battery.pod_checkpointer as pc

    with tempfile.TemporaryDirectory() as tmpdir:
        orig_dir = pc._CHECKPOINTS_DIR
        pc._CHECKPOINTS_DIR = Path(tmpdir)
        try:
            prereg = lock_pre_registration(_make_valid_prereg())
            orch = GammaOrchestrator(prereg, _make_bean_queue(9), session_id="K580_cp")
            orch.run(bean_executor=_simulate_bean)
            from rd_battery.pod_checkpointer import list_checkpoints
            pod_ids = list_checkpoints("gamma", "K580_cp")
            assert len(pod_ids) >= 1, f"Expected at least 1 pod checkpoint. Got: {pod_ids}"
        finally:
            pc._CHECKPOINTS_DIR = orig_dir


def test_gamma_integration_bean_receipt_count() -> None:
    """D.15: γ test emits expected count of Level-1 receipts."""
    from rd_battery.pre_registration_validator import lock_pre_registration
    from rd_battery.test_orchestrator_gamma import GammaOrchestrator

    prereg = lock_pre_registration(_make_valid_prereg())
    orch = GammaOrchestrator(prereg, _make_bean_queue(9), session_id="K580_receipt_count")
    orch.run(bean_executor=_simulate_bean)
    assert len(orch.beans_landed) == 9
    assert all("receipt_id" in b for b in orch.beans_landed)


# ── Integration: δ test (cross-session synthetic) ──────────────────────────

def test_delta_integration_3_pods() -> None:
    """D.16: δ test completes 3 pods in single synthesized run."""
    from rd_battery.pre_registration_validator import lock_pre_registration
    from rd_battery.test_orchestrator_delta import DeltaOrchestrator
    import rd_battery.pod_checkpointer as pc

    pod_queue = [
        {"pod_id": f"pod_{L}", "beans": [
            {"bean_id": f"KN{L}{i}", "bean_class": "medium",
             "session_position_class": "pod_first", "predicted_pp": 10.0}
            for i in range(3)
        ]}
        for L in ["A", "B", "C"]
    ]

    with tempfile.TemporaryDirectory() as tmpdir:
        orig_dir = pc._CHECKPOINTS_DIR
        pc._CHECKPOINTS_DIR = Path(tmpdir)
        try:
            prereg = lock_pre_registration(_make_valid_prereg())
            orch = DeltaOrchestrator(prereg, pod_queue, base_session_id="delta_SID001")
            result = orch.resume_session(_simulate_bean, current_context_pct=0.0)
            assert result["test_complete"]
            assert result["pods_completed"] == 3
        finally:
            pc._CHECKPOINTS_DIR = orig_dir


# ── Integration: ε test (scaled-down wall-clock) ────────────────────────────

def test_epsilon_integration_scaled_down() -> None:
    """D.21: ε test with 5-second budget (scaled-down)."""
    from rd_battery.pre_registration_validator import lock_pre_registration
    from rd_battery.test_orchestrator_epsilon import EpsilonOrchestrator

    prereg = lock_pre_registration(_make_valid_prereg())
    queue = _make_bean_queue(20)

    orch = EpsilonOrchestrator(
        prereg_doc=prereg,
        bean_queue=queue,
        session_id="K580_eps",
        wall_clock_seconds=0.5,  # 500ms limit for test
    )

    def fast_executor(spec: Dict, ctx: float) -> Dict:
        return {"context_pct_after": ctx + 10.0}

    signed_recon = orch.run(fast_executor, starting_context_pct=0.0)
    assert "chronos_signature" in signed_recon
    body = signed_recon.get("artifact_body", {})
    assert "epsilon_metrics" in body
    assert body["epsilon_metrics"]["pp_per_minute"] >= 0.0


# ── Reproducibility ───────────────────────────────────────────────────────

def test_reproducibility_same_seed_same_hash() -> None:
    """D.34: Same pre-reg body produces same content_hash_lock."""
    from rd_battery.pre_registration_validator import lock_pre_registration
    doc1 = _make_valid_prereg("Same hypothesis for reproducibility test across runs.")
    doc2 = _make_valid_prereg("Same hypothesis for reproducibility test across runs.")
    doc1["timestamp_iso"] = "2026-04-30T10:00:00Z"
    doc2["timestamp_iso"] = "2026-04-30T10:00:00Z"
    locked1 = lock_pre_registration(doc1)
    locked2 = lock_pre_registration(doc2)
    assert locked1["content_hash_lock"] == locked2["content_hash_lock"]


if __name__ == "__main__":
    tests = [
        # Component 1
        test_prereg_validator_accepts_valid_doc,
        test_prereg_validator_rejects_missing_hypothesis,
        test_prereg_validator_rejects_empty_falsification,
        test_prereg_lock_computes_hash,
        test_prereg_lock_verify_passes,
        test_prereg_lock_verify_fails_on_tamper,
        test_require_valid_lock_raises_without_lock,
        # Component 2
        test_bean_snapshot_before_after,
        test_bean_emit_l1_receipt,
        test_bean_missing_snapshot_returns_none,
        # Component 3
        test_degradation_continue_when_safe,
        test_degradation_surface_when_approaching,
        test_degradation_hard_stop_at_ceiling,
        test_degradation_operator_decision_validates,
        # Component 4
        test_pod_checkpoint_save_load,
        test_pod_checkpoint_cross_session_summary,
        # Component 5
        test_chronos_signer_pre_reg,
        test_chronos_signer_raises_unknown_type,
        test_chronos_signer_reconciliation,
        # Component 9
        test_reconciliation_scenario_A,
        test_reconciliation_scenario_C,
        test_reconciliation_paper_scaffold_present,
        test_reconciliation_pre_reg_hash_referenced,
        # Component 10
        test_participant_export_creates_kit,
        test_participant_export_receipt_template_has_hash,
        # Integration γ
        test_gamma_integration_9_beans,
        test_gamma_integration_scenario_verdict_present,
        test_gamma_gates_on_missing_lock,
        test_gamma_pod_checkpoints_written,
        test_gamma_integration_bean_receipt_count,
        # Integration δ
        test_delta_integration_3_pods,
        # Integration ε
        test_epsilon_integration_scaled_down,
        # Reproducibility
        test_reproducibility_same_seed_same_hash,
    ]

    passed = 0
    failed = 0
    for t in tests:
        try:
            t()
            print(f"  PASS {t.__name__}")
            passed += 1
        except Exception as e:
            import traceback
            print(f"  FAIL {t.__name__}: {e}")
            failed += 1

    print(f"\n{passed}/{passed+failed} tests passed")
    if failed:
        sys.exit(1)
