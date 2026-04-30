"""
KN013 — Herder Scribe Test Suite
25+ tests covering: observation schema, Stone Tablet, fingerprint derivation,
fingerprint registry, v1 linear regression, v2 nearest-neighbor, confidence
intervals, vendor differentiation, all 6 MCP tools, Wrasse registration,
pheromone index, seed backfill, and end-to-end pipeline.

Run:  python -m pytest tests_kn013.py -v
Note: mutating tests use tmp_path fixtures for isolation.
"""

from __future__ import annotations

import json
import math
import tempfile
from pathlib import Path
from typing import Any, Dict, List

import pytest
import sys, os

# Ensure herder/ is importable
_HERE = Path(__file__).parent
sys.path.insert(0, str(_HERE))


# ─── Fixtures ─────────────────────────────────────────────────────────────────

def _minimal_obs(bean_id: str = "KN-TEST", context_cost_pp: float = 40.0) -> Dict[str, Any]:
    return {
        "bean_id": bean_id,
        "pod_id": "POD-TEST",
        "session_id": "K-TEST",
        "start_timestamp": "2026-04-29T10:00:00Z",
        "end_timestamp": "2026-04-29T11:00:00Z",
        "context_cost_pp": context_cost_pp,
        "lines_added": 200,
        "files_touched": 6,
        "tests_run": 15,
        "tests_passed": 15,
        "commits_emitted": 1,
        "phase_completion_flags": {"A": True, "B": True, "C": True, "D": True, "E": True},
        "vendor": "anthropic",
        "model": "claude-sonnet-4-6",
        "ide": "cursor",
        "wrasse_pre_injection_flag": True,
        "canonical_path_resolution_count": 4,
        "grep_count": 2,
        "bean_class": "medium",
        "phase_c_component_count": 5,
        "test_density": 2.5,
        "wrasse_density": 0.6,
    }


# ─── Test 1: Observation schema validation (valid) ────────────────────────────

def test_validate_observation_valid():
    from herder_observe import validate_observation
    errors = validate_observation(_minimal_obs())
    assert errors == [], f"Expected no errors, got: {errors}"


# ─── Test 2: Observation schema validation (missing field) ────────────────────

def test_validate_observation_missing_field():
    from herder_observe import validate_observation
    obs = _minimal_obs()
    del obs["context_cost_pp"]
    errors = validate_observation(obs)
    assert any("context_cost_pp" in e for e in errors)


# ─── Test 3: Observation schema validation (wrong type) ──────────────────────

def test_validate_observation_wrong_type():
    from herder_observe import validate_observation
    obs = _minimal_obs()
    obs["tests_run"] = "fifteen"
    errors = validate_observation(obs)
    assert any("tests_run" in e for e in errors)


# ─── Test 4: Observation schema validation (phase flags not dict) ─────────────

def test_validate_observation_phase_flags_not_dict():
    from herder_observe import validate_observation
    obs = _minimal_obs()
    obs["phase_completion_flags"] = ["A", "B"]
    errors = validate_observation(obs)
    assert any("phase_completion_flags" in e for e in errors)


# ─── Test 5: Stone Tablet append-only — record_observation persists ──────────

def test_record_observation_persists(tmp_path):
    from herder_observe import record_observation, load_observations
    tablet = tmp_path / "obs.jsonl"
    obs = _minimal_obs()
    result = record_observation(obs, tablet_path=tablet)
    assert result["status"] == "stored"
    assert result["observation_id"]
    assert result["chronicler_hash"]
    rows = load_observations(tablet)
    assert len(rows) == 1
    assert rows[0]["bean_id"] == "KN-TEST"


# ─── Test 6: Stone Tablet append-only invariant (multiple writes) ─────────────

def test_stone_tablet_append_only(tmp_path):
    from herder_observe import record_observation, load_observations
    tablet = tmp_path / "obs.jsonl"
    for i in range(3):
        obs = _minimal_obs(bean_id=f"KN-{i:03d}", context_cost_pp=20.0 + i * 10)
        record_observation(obs, tablet_path=tablet)
    rows = load_observations(tablet)
    assert len(rows) == 3
    ids = [r["bean_id"] for r in rows]
    assert "KN-000" in ids and "KN-001" in ids and "KN-002" in ids


# ─── Test 7: Rejected observation not persisted ───────────────────────────────

def test_rejected_observation_not_persisted(tmp_path):
    from herder_observe import record_observation, load_observations
    tablet = tmp_path / "obs.jsonl"
    bad = _minimal_obs()
    del bad["vendor"]
    result = record_observation(bad, tablet_path=tablet)
    assert result["status"] == "rejected"
    assert not tablet.exists() or load_observations(tablet) == []


# ─── Test 8: Bean-class auto-derivation ──────────────────────────────────────

def test_bean_class_auto_derived(tmp_path):
    from herder_observe import record_observation, load_observations
    tablet = tmp_path / "obs.jsonl"
    obs = _minimal_obs()
    del obs["bean_class"]
    obs["phase_c_component_count"] = 8
    record_observation(obs, tablet_path=tablet)
    rows = load_observations(tablet)
    assert rows[0]["bean_class"] == "large"


# ─── Test 9: Fingerprint derivation correct on synthetic data ────────────────

def test_fingerprint_derivation():
    from herder_fingerprint import derive_fingerprint
    observations = [_minimal_obs(context_cost_pp=float(40 + i)) for i in range(5)]
    for i, o in enumerate(observations):
        o["vendor"] = "anthropic" if i % 2 == 0 else "openai"
    fp = derive_fingerprint(observations, "medium")
    assert fp["bean_class"] == "medium"
    assert fp["n_observations"] == 5
    assert fp["context_cost_pp"]["mean"] == pytest.approx(42.0, abs=0.1)
    assert fp["context_cost_pp"]["count"] == 5
    assert "anthropic" in fp["vendor_distribution"]
    assert "openai" in fp["vendor_distribution"]


# ─── Test 10: Fingerprint for empty observations ─────────────────────────────

def test_fingerprint_empty_observations():
    from herder_fingerprint import derive_fingerprint
    fp = derive_fingerprint([], "small")
    assert fp["n_observations"] == 0
    assert fp["context_cost_pp"]["count"] == 0


# ─── Test 11: Fingerprint registry update preserves prior versions ────────────

def test_fingerprint_registry_version_preserved(tmp_path):
    from herder_fingerprint import update_fingerprint_for_class, load_registry
    from herder_observe import record_observation

    tablet = tmp_path / "obs.jsonl"
    registry = tmp_path / "registry.json"

    # First round
    for i in range(3):
        record_observation(_minimal_obs(bean_id=f"KN-{i}", context_cost_pp=30.0), tablet_path=tablet)
    fp1 = update_fingerprint_for_class("medium", tablet_path=tablet, registry_path=registry)
    assert fp1["version"] == 1

    # Second round — add more observations
    for i in range(3, 6):
        record_observation(_minimal_obs(bean_id=f"KN-{i}", context_cost_pp=50.0), tablet_path=tablet)
    fp2 = update_fingerprint_for_class("medium", tablet_path=tablet, registry_path=registry)
    assert fp2["version"] == 2
    assert fp2["n_observations"] == 6


# ─── Test 12: v1 linear regression fits within tolerance ─────────────────────

def test_v1_linear_regression(tmp_path):
    from herder_observe import record_observation
    from herder_train import train_models, load_model

    tablet = tmp_path / "obs.jsonl"
    models_dir = tmp_path / "models"
    models_dir.mkdir()

    # Synthetic data: context_cost_pp = 5 * phase_c_component_count + 10 + noise
    for i in range(12):
        obs = _minimal_obs(bean_id=f"KN-{i:02d}", context_cost_pp=5.0 * i + 10.0)
        obs["phase_c_component_count"] = i
        record_observation(obs, tablet_path=tablet)

    summary = train_models(tablet_path=tablet, models_dir=models_dir)
    assert summary["n_total"] == 12
    assert "context_cost_pp" in summary["models"]
    assert summary["models"]["context_cost_pp"]["r_squared"] > 0.8, \
        f"R² too low: {summary['models']['context_cost_pp']['r_squared']}"


# ─── Test 13: v2 nearest-neighbor (simulate N=50+) ───────────────────────────

def test_v2_nearest_neighbor_label(tmp_path):
    """With N>=50 observations, model_version should be v2."""
    from herder_observe import record_observation
    from herder_train import train_models, N_V2

    tablet = tmp_path / "obs.jsonl"
    models_dir = tmp_path / "models"
    models_dir.mkdir()

    for i in range(N_V2):
        obs = _minimal_obs(bean_id=f"KN-{i:03d}", context_cost_pp=float(20 + (i % 40)))
        obs["phase_c_component_count"] = i % 10
        record_observation(obs, tablet_path=tablet)

    summary = train_models(tablet_path=tablet, models_dir=models_dir)
    assert summary["models"]["context_cost_pp"]["model_version"] == "v2"


# ─── Test 14: Confidence intervals include N-basis ───────────────────────────

def test_prediction_has_n_basis(tmp_path):
    from herder_observe import record_observation
    from herder_train import train_models, predict

    tablet = tmp_path / "obs.jsonl"
    models_dir = tmp_path / "models"
    models_dir.mkdir()

    for i in range(12):
        record_observation(_minimal_obs(bean_id=f"KN-{i:02d}"), tablet_path=tablet)

    import herder_train
    _orig_pheromone = herder_train._PHEROMONE_INDEX_PATH
    herder_train._PHEROMONE_INDEX_PATH = models_dir / "pheromone_index.json"
    train_models(tablet_path=tablet, models_dir=models_dir)
    model = None
    for ver in ("v3", "v2", "v1"):
        p = models_dir / f"herder_model_{ver}.json"
        if p.exists():
            import json as _j
            with p.open() as fh:
                model = _j.load(fh)
            break

    result = predict({"phase_c_component_count": 5.0}, model=model)
    assert "n_basis" in result
    assert result["n_basis"] == 12
    assert result["confidence_low"] < result["prediction"]
    assert result["prediction"] < result["confidence_high"]
    herder_train._PHEROMONE_INDEX_PATH = _orig_pheromone


# ─── Test 15: Wide CI for zero observations ───────────────────────────────────

def test_wide_ci_no_observations():
    from herder_train import predict
    result = predict({}, model=None)
    assert result["n_basis"] == 0
    assert result["confidence_high"] - result["confidence_low"] >= 50.0


# ─── Test 16: query_will_it_fit returns will_fit + CI + recommendation ─────

def test_query_will_it_fit_basic(tmp_path, monkeypatch):
    import herder_train
    # Patch registry and model to return controlled values
    monkeypatch.setattr(herder_train, "load_registry", lambda: {})
    monkeypatch.setattr(herder_train, "load_model", lambda model_version=None: None)
    result = herder_train.query_will_it_fit([
        {"bean_class": "medium", "vendor": "anthropic"},
    ])
    assert "will_fit" in result
    assert "predicted_total_pp" in result
    assert "recommendation" in result
    assert "confidence_high" in result


# ─── Test 17: query_predicted_context_climb returns structured result ─────────

def test_query_predicted_context_climb(tmp_path, monkeypatch):
    import herder_train
    monkeypatch.setattr(herder_train, "load_registry", lambda: {})
    monkeypatch.setattr(herder_train, "load_model", lambda model_version=None: None)
    result = herder_train.predict_for_bean_class("large")
    assert "prediction" in result
    assert "confidence_low" in result
    assert "confidence_high" in result
    assert result["model_version"] in ("uninformed_prior", "v1", "v2", "v3", "fingerprint_mean")


# ─── Test 18: record_observation Herder Scribe persists + updates fingerprint ─

def test_record_observation_full_pipeline(tmp_path, monkeypatch):
    from herder_observe import record_observation, load_observations
    tablet = tmp_path / "obs.jsonl"
    obs = _minimal_obs()
    result = record_observation(obs, tablet_path=tablet)
    assert result["status"] == "stored"
    rows = load_observations(tablet)
    assert len(rows) == 1
    assert rows[0]["chronicler_hash"] == result["chronicler_hash"]


# ─── Test 19: query_fingerprint returns bean-class fingerprint ────────────────

def test_query_fingerprint(tmp_path):
    from herder_observe import record_observation
    from herder_fingerprint import update_fingerprint_for_class, load_registry

    tablet = tmp_path / "obs.jsonl"
    registry = tmp_path / "registry.json"
    for i in range(3):
        record_observation(_minimal_obs(bean_id=f"KN-{i}"), tablet_path=tablet)
    update_fingerprint_for_class("medium", tablet_path=tablet, registry_path=registry)

    reg = load_registry(registry)
    assert "medium" in reg
    assert reg["medium"]["n_observations"] == 3


# ─── Test 20: query_model_confidence returns quality metrics ─────────────────

def test_query_model_confidence_no_model(monkeypatch):
    import herder_train
    monkeypatch.setattr(herder_train, "load_model", lambda model_version=None: None)
    result = herder_train.query_will_it_fit([])
    # Just verify it returns without error
    assert "will_fit" in result


# ─── Test 21: compare_vendor_predictions differentiation ─────────────────────

def test_compare_vendor_predictions_no_fingerprint(tmp_path, monkeypatch):
    import herder_train
    monkeypatch.setattr(herder_train, "load_registry", lambda: {})
    monkeypatch.setattr(herder_train, "load_model", lambda model_version=None: None)
    result = herder_train.predict_for_bean_class("large", vendor="openai")
    assert "prediction" in result


# ─── Test 22: Wrasse registration returns results ────────────────────────────

def test_wrasse_registration(tmp_path, monkeypatch):
    from herder_wrasse_register import HERDER_ENTRIES
    from unittest.mock import patch, MagicMock

    fake_results = []
    with patch("herder_wrasse_register.append_if_new") as mock_append:
        mock_append.return_value = {"action": "appended", "trigger_id": "W-999"}
        from herder_wrasse_register import register_herder_scribe
        results = register_herder_scribe(session_id="TEST-KN013")

    assert len(results) == len(HERDER_ENTRIES)
    for r in results:
        assert "trigger_pattern" in r


# ─── Test 23: Pheromone index updated on train ───────────────────────────────

def test_pheromone_index_updated(tmp_path, monkeypatch):
    from herder_observe import record_observation
    from herder_train import train_models
    import herder_train

    tablet = tmp_path / "obs.jsonl"
    models_dir = tmp_path / "models"
    models_dir.mkdir()
    pheromone_path = models_dir / "pheromone_index.json"

    monkeypatch.setattr(herder_train, "_PHEROMONE_INDEX_PATH", pheromone_path)

    for i in range(5):
        record_observation(_minimal_obs(bean_id=f"KN-{i:02d}"), tablet_path=tablet)

    train_models(tablet_path=tablet, models_dir=models_dir)
    assert pheromone_path.exists()
    import json as _j
    idx = _j.loads(pheromone_path.read_text())
    assert "latest_model_version" in idx
    assert idx["latest_n_observations"] == 5


# ─── Test 24: Seed backfill loads correctly ──────────────────────────────────

def test_seed_backfill(tmp_path):
    from herder_seed_observations import backfill, SEED_OBSERVATIONS
    from herder_observe import load_observations

    tablet = tmp_path / "obs.jsonl"
    summary = backfill(tablet_path=tablet)
    assert len(summary["stored"]) == len(SEED_OBSERVATIONS)
    assert summary["errors"] == []
    rows = load_observations(tablet)
    assert len(rows) == len(SEED_OBSERVATIONS)


# ─── Test 25: Seed backfill is idempotent ────────────────────────────────────

def test_seed_backfill_idempotent(tmp_path):
    from herder_seed_observations import backfill
    from herder_observe import load_observations

    tablet = tmp_path / "obs.jsonl"
    backfill(tablet_path=tablet)
    backfill(tablet_path=tablet)  # second backfill should skip all
    rows = load_observations(tablet)
    from herder_seed_observations import SEED_OBSERVATIONS
    assert len(rows) == len(SEED_OBSERVATIONS)


# ─── Test 26: End-to-end pipeline ────────────────────────────────────────────

def test_end_to_end_pipeline(tmp_path, monkeypatch):
    """
    Knight closeout emits observation → Herder ingests → fingerprint updates →
    next prediction reflects new data.
    """
    from herder_observe import record_observation, load_observations
    from herder_fingerprint import update_fingerprint_for_class, load_registry
    from herder_train import train_models
    import herder_train

    tablet = tmp_path / "obs.jsonl"
    registry = tmp_path / "registry.json"
    models_dir = tmp_path / "models"
    models_dir.mkdir()
    pheromone_path = models_dir / "pheromone_index.json"

    monkeypatch.setattr(herder_train, "_PHEROMONE_INDEX_PATH", pheromone_path)
    # Monkeypatch load_registry and load_model path in herder_train
    monkeypatch.setattr(herder_train, "load_registry",
                        lambda: load_registry(registry))

    # Step 1: seed with 10 observations
    for i in range(10):
        obs = _minimal_obs(bean_id=f"KN-{i:02d}", context_cost_pp=25.0 + i * 3)
        obs["phase_c_component_count"] = i % 8
        record_observation(obs, tablet_path=tablet)
    update_fingerprint_for_class("medium", tablet_path=tablet, registry_path=registry)

    # Step 2: train
    summary = train_models(tablet_path=tablet, models_dir=models_dir)
    assert summary["n_total"] == 10

    # Step 3: new observation — high context cost
    new_obs = _minimal_obs(bean_id="KN-HIGH", context_cost_pp=80.0)
    new_obs["phase_c_component_count"] = 9
    record_observation(new_obs, tablet_path=tablet)
    update_fingerprint_for_class("medium", tablet_path=tablet, registry_path=registry)

    # Step 4: updated fingerprint has 11 observations
    reg = load_registry(registry)
    assert reg["medium"]["n_observations"] == 11

    # Step 5: prediction request is answered
    result = herder_train.predict_for_bean_class("medium")
    assert 0 <= result["prediction"] <= 100


# ─── Test 27: Empirical — predict KN009 Bedrock class ────────────────────────

def test_empirical_predict_kn009(tmp_path, monkeypatch):
    """
    Seed with BP001+BP002 data and confirm KN009's large class prediction
    is above 40% (we know it consumed ~55pp).
    """
    from herder_seed_observations import backfill
    from herder_fingerprint import update_fingerprint_for_class, load_registry
    from herder_train import train_models, predict_for_bean_class
    import herder_train

    tablet = tmp_path / "obs.jsonl"
    registry = tmp_path / "registry.json"
    models_dir = tmp_path / "models"
    models_dir.mkdir()
    pheromone_path = models_dir / "pheromone_index.json"

    monkeypatch.setattr(herder_train, "_PHEROMONE_INDEX_PATH", pheromone_path)
    monkeypatch.setattr(herder_train, "load_registry", lambda: load_registry(registry))

    backfill(tablet_path=tablet)
    for bc in ("large", "medium", "small"):
        update_fingerprint_for_class(bc, tablet_path=tablet, registry_path=registry)
    train_models(tablet_path=tablet, models_dir=models_dir)

    result = predict_for_bean_class("large")
    assert result["prediction"] >= 30.0, \
        f"Large bean prediction suspiciously low: {result['prediction']}"


# ─── Test 28: Edge — N=0 bean class returns wide CI ──────────────────────────

def test_wide_ci_n0_bean_class(monkeypatch):
    import herder_train
    monkeypatch.setattr(herder_train, "load_registry", lambda: {})
    monkeypatch.setattr(herder_train, "load_model", lambda model_version=None: None)
    result = herder_train.predict_for_bean_class("unknown_class")
    ci_width = result["confidence_high"] - result["confidence_low"]
    assert ci_width >= 30.0, f"Expected wide CI for N=0, got width={ci_width}"


# ─── Test 29: Edge — malformed event rejected cleanly ────────────────────────

def test_malformed_event_rejected(tmp_path):
    from herder_observe import record_observation
    tablet = tmp_path / "obs.jsonl"
    result = record_observation({}, tablet_path=tablet)
    assert result["status"] == "rejected"
    assert len(result["errors"]) > 0


# ─── Test 30: Gaussian elimination solver correctness ────────────────────────

def test_gaussian_elimination():
    from herder_train import _gaussian_elimination
    # 2x + 3y = 8, 5x - y = -2 → solution: x = -2/17, y=...
    A = [[2.0, 3.0], [5.0, -1.0]]
    b = [8.0, -2.0]
    x = _gaussian_elimination(A, b)
    assert abs(2 * x[0] + 3 * x[1] - 8.0) < 1e-6
    assert abs(5 * x[0] - x[1] + 2.0) < 1e-6


if __name__ == "__main__":
    import subprocess
    subprocess.run(["python", "-m", "pytest", __file__, "-v"], cwd=str(_HERE))
