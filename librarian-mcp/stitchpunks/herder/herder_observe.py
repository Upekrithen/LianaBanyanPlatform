"""
Herder Scribe — Component 1: Observation Event Ingestion
KN013 / A&A #2297

Accepts observation events from Knight bean closeouts (Phase E hook).
Validates against schema D.2, persists to Stone Tablet (append-only JSONL).
Every event is signed via Chronos Chronicler (KN009 Component 6).

Stone Tablet path:
  librarian-mcp/stitchpunks/herder/observations/herder_observations.jsonl

Toolsmith log: TS-HERDER-SCRIBE-T-SIPPING-REFINER-KN013-BP002
"""

from __future__ import annotations

import hashlib
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

_HERE = Path(__file__).parent
_OBSERVATIONS_DIR = _HERE / "observations"
_TABLET_PATH = _OBSERVATIONS_DIR / "herder_observations.jsonl"

REQUIRED_FIELDS: List[str] = [
    "bean_id",
    "pod_id",
    "session_id",
    "start_timestamp",
    "end_timestamp",
    "context_cost_pp",
    "lines_added",
    "files_touched",
    "tests_run",
    "tests_passed",
    "commits_emitted",
    "phase_completion_flags",
    "vendor",
    "model",
    "ide",
    "wrasse_pre_injection_flag",
    "canonical_path_resolution_count",
    "grep_count",
]

OPTIONAL_FIELDS: List[str] = [
    "bean_class",
    "phase_c_component_count",
    "test_density",
    "wrasse_density",
    "seed",
    "notes",
]


def _ensure_dirs() -> None:
    _OBSERVATIONS_DIR.mkdir(parents=True, exist_ok=True)


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _canonical_json(obj: Any) -> str:
    return json.dumps(obj, sort_keys=True, ensure_ascii=False, separators=(",", ":"))


def _compute_hash(body: Dict[str, Any]) -> str:
    canonical = _canonical_json(body)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def _fsync_append(path: Path, record: Dict[str, Any]) -> None:
    """Append a JSONL record — Stone Tablet: fsync after every write."""
    line = json.dumps(record, ensure_ascii=False) + "\n"
    with path.open("a", encoding="utf-8", buffering=1) as fh:
        fh.write(line)
        fh.flush()
        os.fsync(fh.fileno())


def validate_observation(event: Dict[str, Any]) -> List[str]:
    """
    Return list of validation errors.  Empty list = valid.
    Validates required fields are present and have correct types.
    """
    errors: List[str] = []
    for field in REQUIRED_FIELDS:
        if field not in event:
            errors.append(f"Missing required field: {field}")
    if errors:
        return errors

    # Type checks for critical numeric fields
    for num_field in ("context_cost_pp", "lines_added", "files_touched",
                      "tests_run", "tests_passed", "commits_emitted",
                      "canonical_path_resolution_count", "grep_count"):
        val = event.get(num_field)
        if val is not None and not isinstance(val, (int, float)):
            errors.append(f"Field {num_field} must be numeric, got {type(val).__name__}")

    # phase_completion_flags must be a dict
    flags = event.get("phase_completion_flags")
    if flags is not None and not isinstance(flags, dict):
        errors.append("phase_completion_flags must be a dict")

    # wrasse_pre_injection_flag must be bool
    wpif = event.get("wrasse_pre_injection_flag")
    if wpif is not None and not isinstance(wpif, bool):
        errors.append("wrasse_pre_injection_flag must be bool")

    # Timestamps must be strings
    for ts_field in ("start_timestamp", "end_timestamp"):
        val = event.get(ts_field)
        if val is not None and not isinstance(val, str):
            errors.append(f"{ts_field} must be ISO string, got {type(val).__name__}")

    return errors


def record_observation(
    event: Dict[str, Any],
    tablet_path: Path = _TABLET_PATH,
) -> Dict[str, Any]:
    """
    Validate, sign via Chronos-style hash, and persist an observation event.

    Returns {
        "status": "stored" | "rejected",
        "observation_id": str,
        "chronicler_hash": str,
        "errors": list[str],
    }
    """
    _ensure_dirs()

    errors = validate_observation(event)
    if errors:
        return {"status": "rejected", "observation_id": "", "chronicler_hash": "", "errors": errors}

    # Derive bean_class if not provided
    if "bean_class" not in event:
        phase_c = event.get("phase_c_component_count", 0)
        test_density = event.get("test_density", 0.0)
        wrasse_density = event.get("wrasse_density", 0.0)
        # Simple classification heuristic: large/medium/small by component count
        if phase_c >= 7:
            event["bean_class"] = "large"
        elif phase_c >= 4:
            event["bean_class"] = "medium"
        else:
            event["bean_class"] = "small"

    # Build the receipt body (excludes chronicler fields to compute clean hash)
    receipt_body: Dict[str, Any] = {
        "type": "herder_observation",
        "bean_id": event["bean_id"],
        "pod_id": event["pod_id"],
        "session_id": event["session_id"],
        "bean_class": event.get("bean_class", "unknown"),
        "start_timestamp": event["start_timestamp"],
        "end_timestamp": event["end_timestamp"],
        "context_cost_pp": event["context_cost_pp"],
        "lines_added": event["lines_added"],
        "files_touched": event["files_touched"],
        "tests_run": event["tests_run"],
        "tests_passed": event["tests_passed"],
        "commits_emitted": event["commits_emitted"],
        "phase_completion_flags": event["phase_completion_flags"],
        "vendor": event["vendor"],
        "model": event["model"],
        "ide": event["ide"],
        "wrasse_pre_injection_flag": event["wrasse_pre_injection_flag"],
        "canonical_path_resolution_count": event["canonical_path_resolution_count"],
        "grep_count": event["grep_count"],
        "phase_c_component_count": event.get("phase_c_component_count", 0),
        "test_density": event.get("test_density", 0.0),
        "wrasse_density": event.get("wrasse_density", 0.0),
    }
    # Include optional notes / seed flag
    for opt in ("notes", "seed"):
        if opt in event:
            receipt_body[opt] = event[opt]

    chronicler_hash = _compute_hash(receipt_body)
    observed_at = _iso_now()
    observation_id = f"H-{event['session_id']}-{event['bean_id']}-{chronicler_hash[:8]}"

    full_record: Dict[str, Any] = {
        **receipt_body,
        "observation_id": observation_id,
        "observed_at": observed_at,
        "chronicler_hash": chronicler_hash,
    }

    _fsync_append(tablet_path, full_record)

    return {
        "status": "stored",
        "observation_id": observation_id,
        "chronicler_hash": chronicler_hash,
        "errors": [],
    }


def load_observations(
    tablet_path: Path = _TABLET_PATH,
) -> List[Dict[str, Any]]:
    """Load all observations from the Stone Tablet. Returns list sorted by observed_at."""
    if not tablet_path.exists():
        return []
    results = []
    with tablet_path.open(encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                results.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    results.sort(key=lambda r: r.get("observed_at", ""))
    return results


def load_observations_for_class(
    bean_class: str,
    tablet_path: Path = _TABLET_PATH,
) -> List[Dict[str, Any]]:
    """Return observations for a specific bean_class."""
    return [o for o in load_observations(tablet_path) if o.get("bean_class") == bean_class]


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Herder Scribe Observation Ingestion")
    parser.add_argument("event_json", help="Observation event as JSON string")
    args = parser.parse_args()

    event = json.loads(args.event_json)
    result = record_observation(event)
    print(json.dumps(result, indent=2))
