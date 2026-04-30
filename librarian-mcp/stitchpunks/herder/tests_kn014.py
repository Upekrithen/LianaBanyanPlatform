"""
KN014 — Herder Scribe Test Isolation Patch — Test Suite
3 tests covering the observations_source isolation parameter introduced in KN014.

Run:  python -m pytest tests_kn014.py -v
"""

from __future__ import annotations

from pathlib import Path
import sys

_HERE = Path(__file__).parent
sys.path.insert(0, str(_HERE))


# ─── Test 1: test_wide_ci_no_observations passes after KN014 patch ────────────

def test_wide_ci_no_observations_isolated():
    """
    Confirms that test_wide_ci_no_observations behavior is disk-independent.
    Passing observations_source=[] must always return uninformed prior regardless
    of what models exist on disk from prior seed runs.
    """
    from herder_train import predict
    result = predict({}, model=None, observations_source=[])
    assert result["n_basis"] == 0, f"Expected n_basis=0, got {result['n_basis']}"
    ci_width = result["confidence_high"] - result["confidence_low"]
    assert ci_width >= 50.0, f"Expected CI width >= 50pp, got {ci_width}"
    assert result["model_version"] == "uninformed_prior"


# ─── Test 2: test_predict_with_explicit_empty_source — parameter wiring ──────

def test_predict_with_explicit_empty_source():
    """
    Confirms the observations_source=[] parameter wires correctly:
    - Returns uninformed prior dict shape
    - n_basis == 0
    - prediction == 50.0 (center of uninformed prior)
    - confidence_low == 0.0, confidence_high == 100.0
    - note field present
    """
    from herder_train import predict
    result = predict(
        {"phase_c_component_count": 5.0, "test_density": 2.0},
        model=None,
        observations_source=[],
    )
    assert result["prediction"] == 50.0, f"Expected 50.0, got {result['prediction']}"
    assert result["confidence_low"] == 0.0
    assert result["confidence_high"] == 100.0
    assert result["n_basis"] == 0
    assert result["model_version"] == "uninformed_prior"
    assert "note" in result


# ─── Test 3: backward compatibility — existing callers unaffected ─────────────

def test_backward_compatibility_no_observations_source(tmp_path):
    """
    Confirms that callers omitting observations_source get disk-loading behavior
    (backward compatible).  Trains a small model into tmp, loads it, and verifies
    predict() without observations_source uses the model (n_basis > 0).
    """
    from herder_observe import record_observation
    from herder_train import train_models, predict
    import herder_train

    tablet = tmp_path / "obs.jsonl"
    models_dir = tmp_path / "models"
    models_dir.mkdir()

    # Record 12 observations and train
    def _obs(i: int):
        return {
            "bean_id": f"KN-{i:02d}",
            "pod_id": "POD-TEST",
            "session_id": "K-TEST",
            "start_timestamp": "2026-04-30T10:00:00Z",
            "end_timestamp": "2026-04-30T11:00:00Z",
            "context_cost_pp": float(30 + i),
            "lines_added": 100,
            "files_touched": 3,
            "tests_run": 5,
            "tests_passed": 5,
            "commits_emitted": 1,
            "phase_completion_flags": {"A": True, "B": True, "C": True, "D": True, "E": True},
            "vendor": "anthropic",
            "model": "claude-sonnet-4-6",
            "ide": "cursor",
            "wrasse_pre_injection_flag": True,
            "canonical_path_resolution_count": 2,
            "grep_count": 1,
            "bean_class": "medium",
            "phase_c_component_count": i % 6,
            "test_density": 1.0,
            "wrasse_density": 0.5,
        }

    for i in range(12):
        record_observation(_obs(i), tablet_path=tablet)

    orig_pheromone = herder_train._PHEROMONE_INDEX_PATH
    herder_train._PHEROMONE_INDEX_PATH = models_dir / "pheromone_index.json"
    try:
        train_models(tablet_path=tablet, models_dir=models_dir)
        # Load the model manually and pass explicitly (simulates existing caller pattern)
        import json
        model = None
        for ver in ("v3", "v2", "v1"):
            p = models_dir / f"herder_model_{ver}.json"
            if p.exists():
                with p.open() as fh:
                    model = json.load(fh)
                break

        assert model is not None, "Model should have been trained"
        result = predict({"phase_c_component_count": 4.0}, model=model)
        # Should use the trained model (n_basis == 12), not uninformed prior
        assert result["n_basis"] == 12, f"Expected n_basis=12, got {result['n_basis']}"
        assert result["model_version"] != "uninformed_prior"
    finally:
        herder_train._PHEROMONE_INDEX_PATH = orig_pheromone


if __name__ == "__main__":
    import subprocess
    subprocess.run(["python", "-m", "pytest", __file__, "-v"], cwd=str(_HERE))
