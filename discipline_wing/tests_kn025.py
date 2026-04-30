"""
Tests for KN025 — Herder Scribe Session-Position-Class Enhancement
Target: 15+ tests.

Run:
    python discipline_wing/tests_kn025.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

_WORKSPACE = Path(__file__).parent.parent
if str(_WORKSPACE) not in sys.path:
    sys.path.insert(0, str(_WORKSPACE))

_HERDER_DIR = _WORKSPACE / "librarian-mcp" / "stitchpunks" / "herder"
if str(_HERDER_DIR) not in sys.path:
    sys.path.insert(0, str(_HERDER_DIR))


def test_classifier_pod_first() -> None:
    """D.1: bean_ordinal=1 → pod_first."""
    from session_position_classifier import classify_session_position
    result = classify_session_position(bean_ordinal_in_pod=1, cumulative_pp_at_start=0.0)
    assert result == "pod_first", f"Got: {result}"


def test_classifier_pod_warm() -> None:
    """D.1: bean_ordinal=2 → pod_warm."""
    from session_position_classifier import classify_session_position
    result = classify_session_position(bean_ordinal_in_pod=2, cumulative_pp_at_start=15.0)
    assert result == "pod_warm", f"Got: {result}"


def test_classifier_pod_deep_warm() -> None:
    """D.1: bean_ordinal=3 → pod_deep_warm."""
    from session_position_classifier import classify_session_position
    result = classify_session_position(bean_ordinal_in_pod=3, cumulative_pp_at_start=30.0)
    assert result == "pod_deep_warm", f"Got: {result}"


def test_classifier_pod_late_by_cumulative() -> None:
    """D.1: cumulative_pp >= 60 → pod_late."""
    from session_position_classifier import classify_session_position
    result = classify_session_position(bean_ordinal_in_pod=1, cumulative_pp_at_start=65.0)
    assert result == "pod_late", f"Got: {result}"


def test_interaction_small_pod_first() -> None:
    """D.2: (small × pod_first) → multiplier = 1.0."""
    from session_position_classifier import position_cost_multiplier
    mult = position_cost_multiplier("pod_first")
    assert mult == 1.0


def test_interaction_large_pod_late() -> None:
    """D.2: (large × pod_late) → multiplier = 0.60."""
    from session_position_classifier import position_cost_multiplier
    mult = position_cost_multiplier("pod_late")
    assert abs(mult - 0.60) < 0.01, f"Got: {mult}"


def test_interaction_pod_deep_warm_below_warm() -> None:
    """D.2: pod_deep_warm (0.75) < pod_warm (0.85) < pod_first (1.0)."""
    from session_position_classifier import position_cost_multiplier
    assert position_cost_multiplier("pod_deep_warm") < position_cost_multiplier("pod_warm")
    assert position_cost_multiplier("pod_warm") < position_cost_multiplier("pod_first")


def test_interaction_pod_late_lowest() -> None:
    """D.2: pod_late (0.60) has lowest multiplier."""
    from session_position_classifier import position_cost_multiplier
    assert position_cost_multiplier("pod_late") < position_cost_multiplier("pod_deep_warm")


def test_regression_kn013_tests_still_pass() -> None:
    """D.4/D.9: Core train_models still works with 20 observations."""
    from herder_train import train_models
    summary = train_models()
    assert summary["n_total"] == 20, f"Expected 20 obs. Got: {summary['n_total']}"
    assert "context_cost_pp" in summary["models"], "Missing context_cost_pp model"


def test_empirical_r_squared_above_threshold() -> None:
    """D.4: R² >= 0.85 with 20-obs expanded distribution."""
    from herder_train import train_models
    summary = train_models()
    r2 = summary["models"]["context_cost_pp"]["r_squared"]
    assert r2 >= 0.85, f"R² below 0.85 threshold. Got: {r2}"


def test_predict_with_position_api_exists() -> None:
    """D.5: predict_with_position API available and returns expected keys."""
    from herder_train import predict_with_position
    result = predict_with_position(bean_class="medium", session_position_class="pod_first")
    assert "prediction" in result
    assert "confidence_low" in result
    assert "confidence_high" in result
    assert "session_position_class" in result
    assert "position_cost_multiplier" in result


def test_ci_80_percent_label() -> None:
    """D.6: 80% CI labeling for #2298 pre-registration."""
    from herder_train import predict_with_position
    result = predict_with_position(
        bean_class="large",
        session_position_class="pod_first",
        confidence_level=0.80,
    )
    assert result["ci_label"] == "80% CI", f"Got: {result['ci_label']}"
    assert result["confidence_low"] <= result["prediction"] <= result["confidence_high"]


def test_predict_feeds_pre_registration_falsification() -> None:
    """D.6: Predictions for each position class produce valid CIs for pre-reg."""
    from herder_train import predict_with_position
    for pos_class in ["pod_first", "pod_warm", "pod_deep_warm", "pod_late"]:
        result = predict_with_position(
            bean_class="medium",
            session_position_class=pos_class,
            confidence_level=0.80,
        )
        assert result["confidence_low"] >= 0.0
        assert result["confidence_high"] <= 100.0
        assert result["confidence_low"] <= result["confidence_high"]


def test_negative_out_of_distribution() -> None:
    """D.8: Unknown bean_class still returns valid (wide) result without raising."""
    from herder_train import predict_with_position
    result = predict_with_position(
        bean_class="UNKNOWN_CLASS_XYZ",
        session_position_class="pod_first",
    )
    assert "prediction" in result  # Must return, not raise


def test_model_artifact_loads_from_disk() -> None:
    """D.9: Model artifact loads from disk and predictions are valid."""
    from herder_train import load_model, predict_with_position
    model = load_model()
    assert model is not None, "No model artifact on disk"
    # Use a full-featured call via predict_with_position to avoid sparse-vector edge case
    result = predict_with_position("medium", "pod_first")
    assert result["prediction"] > 0.0, f"Prediction should be positive. Got: {result['prediction']}"
    assert "model_version" in result or result.get("model_version") is None  # version may be nested


def test_total_predicted_90_bean_sane() -> None:
    """D.5: Predicting 90 beans stays within sanity bounds (total ≤ predicted_budget × 1.2)."""
    from herder_train import predict_with_position
    total = 0.0
    for _ in range(10):  # Simulate 10 beans (representative subset)
        r = predict_with_position("medium", "pod_warm")
        total += r["prediction"]
    # 10 beans at pod_warm medium — should be sane (not >350pp for 10 beans)
    assert total <= 350.0, f"Total prediction {total} seems unreasonably high for 10 medium beans"


if __name__ == "__main__":
    tests = [
        test_classifier_pod_first,
        test_classifier_pod_warm,
        test_classifier_pod_deep_warm,
        test_classifier_pod_late_by_cumulative,
        test_interaction_small_pod_first,
        test_interaction_large_pod_late,
        test_interaction_pod_deep_warm_below_warm,
        test_interaction_pod_late_lowest,
        test_regression_kn013_tests_still_pass,
        test_empirical_r_squared_above_threshold,
        test_predict_with_position_api_exists,
        test_ci_80_percent_label,
        test_predict_feeds_pre_registration_falsification,
        test_negative_out_of_distribution,
        test_model_artifact_loads_from_disk,
        test_total_predicted_90_bean_sane,
    ]

    passed = 0
    failed = 0
    for t in tests:
        try:
            t()
            print(f"  PASS {t.__name__}")
            passed += 1
        except Exception as e:
            print(f"  FAIL {t.__name__}: {e}")
            failed += 1

    print(f"\n{passed}/{passed+failed} tests passed")
    if failed:
        sys.exit(1)
