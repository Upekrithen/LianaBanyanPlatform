"""
Herder Scribe — Component 2: Bean Fingerprint Compiler
KN013 / A&A #2297

Given observation events, derives bean-class fingerprints:
  - phase_c_component_count distribution
  - test_density distribution
  - wrasse_density distribution
  - canonical_path_resolution_count distribution
  - context_cost_pp statistics
  - files_touched statistics
  - lines_added statistics
  - vendor/model distribution

Fingerprint registry: librarian-mcp/stitchpunks/herder/fingerprints/fingerprint_registry.json
Each bean_class has one registry entry updated on every new observation.
Stone Tablet: prior fingerprint versions are preserved in a versioned JSONL.

Toolsmith log: TS-HERDER-SCRIBE-T-SIPPING-REFINER-KN013-BP002
"""

from __future__ import annotations

import json
import math
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from herder_observe import load_observations, load_observations_for_class

_HERE = Path(__file__).parent
_FINGERPRINTS_DIR = _HERE / "fingerprints"
_REGISTRY_PATH = _FINGERPRINTS_DIR / "fingerprint_registry.json"
_REGISTRY_HISTORY_PATH = _FINGERPRINTS_DIR / "fingerprint_history.jsonl"


def _ensure_dirs() -> None:
    _FINGERPRINTS_DIR.mkdir(parents=True, exist_ok=True)


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _stats(values: List[float]) -> Dict[str, float]:
    """Compute mean, std, min, max, count."""
    if not values:
        return {"mean": 0.0, "std": 0.0, "min": 0.0, "max": 0.0, "count": 0}
    n = len(values)
    mean = sum(values) / n
    variance = sum((v - mean) ** 2 for v in values) / n if n > 1 else 0.0
    return {
        "mean": round(mean, 4),
        "std": round(math.sqrt(variance), 4),
        "min": round(min(values), 4),
        "max": round(max(values), 4),
        "count": n,
    }


def _freq_table(items: List[str]) -> Dict[str, int]:
    """Frequency table for categorical values."""
    table: Dict[str, int] = {}
    for item in items:
        table[item] = table.get(item, 0) + 1
    return dict(sorted(table.items(), key=lambda x: -x[1]))


def derive_fingerprint(
    observations: List[Dict[str, Any]],
    bean_class: str,
    registry_path: Path = _REGISTRY_PATH,
) -> Dict[str, Any]:
    """
    Derive a bean-class fingerprint from a list of observation records.
    Returns a fingerprint dict.
    """
    if not observations:
        return {
            "bean_class": bean_class,
            "n_observations": 0,
            "context_cost_pp": _stats([]),
            "lines_added": _stats([]),
            "files_touched": _stats([]),
            "tests_run": _stats([]),
            "tests_passed": _stats([]),
            "phase_c_component_count": _stats([]),
            "test_density": _stats([]),
            "wrasse_density": _stats([]),
            "canonical_path_resolution_count": _stats([]),
            "grep_count": _stats([]),
            "wrasse_pre_injection_rate": 0.0,
            "vendor_distribution": {},
            "model_distribution": {},
            "ide_distribution": {},
            "compiled_at": _iso_now(),
            "version": 1,
        }

    n = len(observations)

    def extract(field: str) -> List[float]:
        return [float(o[field]) for o in observations if field in o and o[field] is not None]

    wrasse_flags = [o.get("wrasse_pre_injection_flag", False) for o in observations]
    wrasse_rate = sum(1 for f in wrasse_flags if f) / n if n else 0.0

    # Load existing to determine version
    existing = load_registry(registry_path)
    old_version = existing.get(bean_class, {}).get("version", 0)

    return {
        "bean_class": bean_class,
        "n_observations": n,
        "context_cost_pp": _stats(extract("context_cost_pp")),
        "lines_added": _stats(extract("lines_added")),
        "files_touched": _stats(extract("files_touched")),
        "tests_run": _stats(extract("tests_run")),
        "tests_passed": _stats(extract("tests_passed")),
        "phase_c_component_count": _stats(extract("phase_c_component_count")),
        "test_density": _stats(extract("test_density")),
        "wrasse_density": _stats(extract("wrasse_density")),
        "canonical_path_resolution_count": _stats(extract("canonical_path_resolution_count")),
        "grep_count": _stats(extract("grep_count")),
        "wrasse_pre_injection_rate": round(wrasse_rate, 4),
        "vendor_distribution": _freq_table([o.get("vendor", "unknown") for o in observations]),
        "model_distribution": _freq_table([o.get("model", "unknown") for o in observations]),
        "ide_distribution": _freq_table([o.get("ide", "unknown") for o in observations]),
        "compiled_at": _iso_now(),
        "version": old_version + 1,
    }


def load_registry(registry_path: Path = _REGISTRY_PATH) -> Dict[str, Any]:
    """Load the current fingerprint registry. Returns dict keyed by bean_class."""
    if not registry_path.exists():
        return {}
    try:
        with registry_path.open(encoding="utf-8") as fh:
            return json.load(fh)
    except (json.JSONDecodeError, OSError):
        return {}


def _save_registry(registry: Dict[str, Any], registry_path: Path = _REGISTRY_PATH) -> None:
    """Persist the fingerprint registry (atomic write)."""
    _ensure_dirs()
    tmp = registry_path.with_suffix(".tmp")
    with tmp.open("w", encoding="utf-8") as fh:
        json.dump(registry, fh, indent=2, ensure_ascii=False)
    os.replace(str(tmp), str(registry_path))


def _append_history(fingerprint: Dict[str, Any], history_path: Path = _REGISTRY_HISTORY_PATH) -> None:
    """Append old fingerprint to history (Stone Tablet — never deletes)."""
    _ensure_dirs()
    line = json.dumps(fingerprint, ensure_ascii=False) + "\n"
    with history_path.open("a", encoding="utf-8", buffering=1) as fh:
        fh.write(line)
        fh.flush()
        os.fsync(fh.fileno())


def update_fingerprint_for_class(
    bean_class: str,
    tablet_path: Optional[Path] = None,
    registry_path: Path = _REGISTRY_PATH,
) -> Dict[str, Any]:
    """
    Re-derive and persist the fingerprint for a bean_class.
    Saves old version to history first (Stone Tablet).
    Returns the new fingerprint.
    """
    from herder_observe import load_observations_for_class, _TABLET_PATH as _DEFAULT_TABLET

    _ensure_dirs()
    actual_tablet = tablet_path if tablet_path is not None else _DEFAULT_TABLET
    observations = load_observations_for_class(bean_class, actual_tablet)
    fingerprint = derive_fingerprint(observations, bean_class, registry_path=registry_path)

    registry = load_registry(registry_path)
    if bean_class in registry:
        _append_history(registry[bean_class], _REGISTRY_HISTORY_PATH)
    registry[bean_class] = fingerprint
    _save_registry(registry, registry_path)

    return fingerprint


def rebuild_all_fingerprints(
    tablet_path: Optional[Path] = None,
    registry_path: Path = _REGISTRY_PATH,
) -> Dict[str, Any]:
    """
    Rebuild fingerprints for all observed bean_classes.
    Returns the complete registry.
    """
    from herder_observe import load_observations, _TABLET_PATH as _DEFAULT_TABLET

    actual_tablet = tablet_path if tablet_path is not None else _DEFAULT_TABLET
    observations = load_observations(actual_tablet)
    classes = set(o.get("bean_class", "unknown") for o in observations)
    for bc in classes:
        update_fingerprint_for_class(bc, actual_tablet, registry_path)
    return load_registry(registry_path)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Herder Fingerprint Compiler")
    parser.add_argument("bean_class", help="Bean class to compile fingerprint for")
    args = parser.parse_args()

    fp = update_fingerprint_for_class(args.bean_class)
    print(json.dumps(fp, indent=2))
