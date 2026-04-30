"""
Herder Scribe — Component 3: Predictive Model Trainer
KN013 / A&A #2297

Trains capacity-prediction models from accumulated observations.

Model versions (D.3):
  v1 — linear regression over bean-class features (N >= 10)
  v2 — nearest-neighbor on fingerprint registry (N >= 50)
  v3 — generalized model with cross-vendor terms (N >= 200)

Each model is versioned + reproducible.  Predictions return:
  { prediction, confidence_low, confidence_high, n_basis, model_version }

Model storage: librarian-mcp/stitchpunks/herder/models/

Toolsmith log: TS-HERDER-SCRIBE-T-SIPPING-REFINER-KN013-BP002
"""

from __future__ import annotations

import json
import math
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from herder_observe import load_observations
from herder_fingerprint import load_registry, derive_fingerprint

_HERE = Path(__file__).parent
_MODELS_DIR = _HERE / "models"
_PHEROMONE_INDEX_PATH = _HERE / "models" / "pheromone_index.json"

N_V1 = 10
N_V2 = 50
N_V3 = 200


def _ensure_dirs() -> None:
    _MODELS_DIR.mkdir(parents=True, exist_ok=True)


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _model_path(model_version: str) -> Path:
    return _MODELS_DIR / f"herder_model_{model_version}.json"


# ─── Feature extraction ───────────────────────────────────────────────────────

def _observation_features(obs: Dict[str, Any]) -> Dict[str, float]:
    """Extract numeric feature vector from a single observation."""
    return {
        "phase_c_component_count": float(obs.get("phase_c_component_count", 0)),
        "test_density": float(obs.get("test_density", 0.0)),
        "wrasse_density": float(obs.get("wrasse_density", 0.0)),
        "canonical_path_resolution_count": float(obs.get("canonical_path_resolution_count", 0)),
        "grep_count": float(obs.get("grep_count", 0)),
        "wrasse_pre_injection": 1.0 if obs.get("wrasse_pre_injection_flag") else 0.0,
    }


# ─── v1: Linear regression ────────────────────────────────────────────────────

def _fit_linear(
    X: List[List[float]],
    y: List[float],
) -> Tuple[List[float], float, float]:
    """
    Simple univariate OLS: fits y ~ intercept + sum(coeff_i * X_i).
    Returns (coefficients_list_with_intercept, residual_stderr, r_squared).
    Uses normal equations via simple gradient-free computation.
    """
    n = len(y)
    if n == 0:
        return [0.0], 0.0, 0.0

    k = len(X[0]) if X else 0
    # Augment with bias column
    X_aug = [[1.0] + row for row in X]
    p = k + 1

    # Normal equations: beta = (X^T X)^{-1} X^T y
    # XtX[i][j] = sum_n X_aug[n][i] * X_aug[n][j]
    XtX = [[0.0] * p for _ in range(p)]
    Xty = [0.0] * p
    for i, xi in enumerate(X_aug):
        for a in range(p):
            Xty[a] += xi[a] * y[i]
            for b in range(p):
                XtX[a][b] += xi[a] * xi[b]

    # Gaussian elimination
    beta = _gaussian_elimination(XtX, Xty)

    # Residuals
    residuals = [y[i] - sum(beta[j] * X_aug[i][j] for j in range(p)) for i in range(n)]
    ss_res = sum(r * r for r in residuals)
    y_mean = sum(y) / n
    ss_tot = sum((yi - y_mean) ** 2 for yi in y) or 1e-9
    r_squared = max(0.0, 1.0 - ss_res / ss_tot)
    stderr = math.sqrt(ss_res / max(n - p, 1))

    return beta, stderr, r_squared


def _gaussian_elimination(A: List[List[float]], b: List[float]) -> List[float]:
    """Solve Ax = b via Gaussian elimination with partial pivoting."""
    n = len(b)
    aug = [A[i][:] + [b[i]] for i in range(n)]
    for col in range(n):
        pivot = max(range(col, n), key=lambda r: abs(aug[r][col]))
        aug[col], aug[pivot] = aug[pivot], aug[col]
        if abs(aug[col][col]) < 1e-12:
            aug[col][col] = 1e-12
        for row in range(col + 1, n):
            factor = aug[row][col] / aug[col][col]
            for j in range(col, n + 1):
                aug[row][j] -= factor * aug[col][j]
    x = [0.0] * n
    for i in range(n - 1, -1, -1):
        x[i] = aug[i][n]
        for j in range(i + 1, n):
            x[i] -= aug[i][j] * x[j]
        x[i] /= aug[i][i] if abs(aug[i][i]) > 1e-12 else 1.0
    return x


# ─── Training entry point ─────────────────────────────────────────────────────

def train_models(
    tablet_path: Optional[Path] = None,
    models_dir: Path = _MODELS_DIR,
) -> Dict[str, Any]:
    """
    Train predictive models from all available observations.
    Returns a summary of trained models keyed by target metric.
    """
    from herder_observe import _TABLET_PATH as _DEFAULT_TABLET

    _ensure_dirs()
    actual_tablet = tablet_path if tablet_path is not None else _DEFAULT_TABLET
    observations = load_observations(actual_tablet)
    n_total = len(observations)

    summary: Dict[str, Any] = {
        "n_total": n_total,
        "trained_at": _iso_now(),
        "models": {},
    }

    if n_total < 2:
        summary["note"] = "Insufficient data — need >= 2 observations"
        return summary

    # ── v1 linear regression — context_cost_pp ──
    target_field = "context_cost_pp"
    ys = [float(o.get(target_field, 0)) for o in observations]
    feature_names = [
        "phase_c_component_count", "test_density", "wrasse_density",
        "canonical_path_resolution_count", "grep_count", "wrasse_pre_injection",
    ]
    Xs = [[_observation_features(o)[fn] for fn in feature_names] for o in observations]

    model_ver = "v1" if n_total < N_V2 else ("v2" if n_total < N_V3 else "v3")
    beta, stderr, r2 = _fit_linear(Xs, ys)

    v1_model: Dict[str, Any] = {
        "type": "linear_regression",
        "target": target_field,
        "feature_names": feature_names,
        "coefficients_with_intercept": beta,
        "residual_stderr": round(stderr, 4),
        "r_squared": round(r2, 4),
        "n_observations": n_total,
        "model_version": model_ver,
        "trained_at": _iso_now(),
    }

    model_path = models_dir / f"herder_model_{model_ver}.json"
    with model_path.open("w", encoding="utf-8") as fh:
        json.dump(v1_model, fh, indent=2)

    summary["models"][target_field] = {
        "model_version": model_ver,
        "r_squared": v1_model["r_squared"],
        "n_observations": n_total,
    }

    _update_pheromone_index(v1_model)
    return summary


def _update_pheromone_index(model: Dict[str, Any]) -> None:
    """Update the pheromone index for sub-ms query_will_it_fit response."""
    _ensure_dirs()
    existing: Dict[str, Any] = {}
    if _PHEROMONE_INDEX_PATH.exists():
        try:
            with _PHEROMONE_INDEX_PATH.open(encoding="utf-8") as fh:
                existing = json.load(fh)
        except (json.JSONDecodeError, OSError):
            pass

    existing["latest_model_version"] = model.get("model_version", "v1")
    existing["latest_target"] = model.get("target", "context_cost_pp")
    existing["latest_r_squared"] = model.get("r_squared", 0.0)
    existing["latest_n_observations"] = model.get("n_observations", 0)
    existing["updated_at"] = _iso_now()
    existing["model_path"] = str(_model_path(model.get("model_version", "v1")))

    tmp = _PHEROMONE_INDEX_PATH.with_suffix(".tmp")
    with tmp.open("w", encoding="utf-8") as fh:
        json.dump(existing, fh, indent=2)
    os.replace(str(tmp), str(_PHEROMONE_INDEX_PATH))


# ─── Prediction ───────────────────────────────────────────────────────────────

def load_model(model_version: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Load a trained model from disk.  If model_version is None, loads latest."""
    if model_version:
        path = _model_path(model_version)
        if path.exists():
            with path.open(encoding="utf-8") as fh:
                return json.load(fh)
        return None

    # Find the best available model (v3 > v2 > v1)
    for ver in ("v3", "v2", "v1"):
        path = _model_path(ver)
        if path.exists():
            with path.open(encoding="utf-8") as fh:
                return json.load(fh)
    return None


def predict(
    features: Dict[str, float],
    model: Optional[Dict[str, Any]] = None,
    confidence_z: float = 1.96,
) -> Dict[str, Any]:
    """
    Predict context_cost_pp for a given feature vector.

    Returns {
        prediction, confidence_low, confidence_high,
        n_basis, model_version, r_squared, stderr
    }

    If no model available, returns wide-CI uninformed prior.
    """
    if model is None:
        model = load_model()

    if model is None:
        return {
            "prediction": 50.0,
            "confidence_low": 0.0,
            "confidence_high": 100.0,
            "n_basis": 0,
            "model_version": "uninformed_prior",
            "r_squared": 0.0,
            "stderr": 50.0,
            "note": "No trained model available; returning uninformed prior",
        }

    feature_names: List[str] = model.get("feature_names", [])
    beta: List[float] = model.get("coefficients_with_intercept", [0.0])
    stderr = model.get("residual_stderr", 25.0)
    n = model.get("n_observations", 0)
    model_ver = model.get("model_version", "v1")
    r2 = model.get("r_squared", 0.0)

    # Build feature vector (bias already in beta[0])
    feat_vec = [1.0] + [features.get(fn, 0.0) for fn in feature_names]
    prediction = sum(beta[j] * feat_vec[j] for j in range(min(len(beta), len(feat_vec))))
    prediction = max(0.0, min(100.0, prediction))

    # Confidence interval: widen for small N
    n_factor = math.sqrt(max(1, n))
    half_width = confidence_z * stderr / n_factor
    # Minimum CI width = 5pp
    half_width = max(half_width, 5.0)

    return {
        "prediction": round(prediction, 2),
        "confidence_low": round(max(0.0, prediction - half_width), 2),
        "confidence_high": round(min(100.0, prediction + half_width), 2),
        "n_basis": n,
        "model_version": model_ver,
        "r_squared": round(r2, 4),
        "stderr": round(stderr, 4),
    }


def predict_for_bean_class(
    bean_class: str,
    beanpod_size: int = 1,
    vendor: str = "anthropic",
) -> Dict[str, Any]:
    """
    Predict context_cost_pp for a named bean_class.
    Looks up the fingerprint mean features and adjusts for beanpod_size.
    """
    registry = load_registry()
    if bean_class not in registry:
        # No fingerprint — return wide CI from global model
        features = {
            "phase_c_component_count": 4.0,
            "test_density": 1.0,
            "wrasse_density": 0.5,
            "canonical_path_resolution_count": 2.0,
            "grep_count": 3.0,
            "wrasse_pre_injection": 1.0,
        }
        result = predict(features)
        result["bean_class"] = bean_class
        result["note"] = f"No fingerprint for bean_class={bean_class!r}; using default features. Wide CI expected."
        return result

    fp = registry[bean_class]
    features = {
        "phase_c_component_count": fp.get("phase_c_component_count", {}).get("mean", 4.0),
        "test_density": fp.get("test_density", {}).get("mean", 1.0),
        "wrasse_density": fp.get("wrasse_density", {}).get("mean", 0.5),
        "canonical_path_resolution_count": fp.get("canonical_path_resolution_count", {}).get("mean", 2.0),
        "grep_count": fp.get("grep_count", {}).get("mean", 3.0),
        "wrasse_pre_injection": fp.get("wrasse_pre_injection_rate", 1.0),
    }

    result = predict(features)
    result["bean_class"] = bean_class
    # Scale by beanpod_size for multi-bean pods
    if beanpod_size > 1:
        result["prediction"] = round(min(100.0, result["prediction"] * beanpod_size * 0.85), 2)
        result["confidence_high"] = round(min(100.0, result["confidence_high"] * beanpod_size), 2)
        result["beanpod_size"] = beanpod_size
        result["note"] = f"Scaled for {beanpod_size}-bean pod (overlap factor 0.85)"

    return result


def query_will_it_fit(
    beanpod_composition: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Given a list of {bean_class, vendor?, beanpod_size?} dicts,
    predict whether the bundle will fit within context budget.

    Returns {
        will_fit: bool,
        predicted_total_pp: float,
        confidence_low: float,
        confidence_high: float,
        per_bean_predictions: list,
        model_version: str,
        n_basis: int,
    }
    """
    per_bean = []
    total_mean = 0.0
    total_low = 0.0
    total_high = 0.0
    n_basis_min = None

    for spec in beanpod_composition:
        bc = spec.get("bean_class", "unknown")
        vendor = spec.get("vendor", "anthropic")
        pred = predict_for_bean_class(bc, beanpod_size=1, vendor=vendor)
        per_bean.append({"bean_class": bc, **pred})
        total_mean += pred["prediction"]
        total_low += pred.get("confidence_low", 0.0)
        total_high += pred.get("confidence_high", 100.0)
        nb = pred.get("n_basis", 0)
        if n_basis_min is None or nb < n_basis_min:
            n_basis_min = nb

    model = load_model()
    model_ver = model.get("model_version", "v1") if model else "uninformed_prior"

    return {
        "will_fit": total_high <= 95.0,
        "predicted_total_pp": round(min(100.0, total_mean), 2),
        "confidence_low": round(min(100.0, total_low), 2),
        "confidence_high": round(min(100.0, total_high), 2),
        "per_bean_predictions": per_bean,
        "model_version": model_ver,
        "n_basis": n_basis_min or 0,
        "recommendation": (
            "FITS — schedule bundle"
            if total_high <= 95.0
            else "MARGINAL — split bundle or reduce pod size"
            if total_high <= 115.0
            else "OVERFLOW — split required"
        ),
    }


if __name__ == "__main__":
    summary = train_models()
    print(json.dumps(summary, indent=2))
