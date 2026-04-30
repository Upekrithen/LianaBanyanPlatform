"""
Component 1 — Pre-Registration Validator
KN026 / #2298 / #2299 / BP003

Validates that a pre-registration document conforms to the #2298 schema:
  - hypothesis (falsifiable)
  - falsification_criteria (list)
  - predicted_measurements (dict with per-bean predictions)
  - receipt_collection_protocol (string)
  - scenarios (list with labels A/B/C at minimum)
  - timestamp_iso (pre-run timestamp)
  - content_hash_lock (SHA-256 of body — locked before run begins)

Refuses to start a test if pre-reg is not locked (content_hash_lock missing or invalid).
Computes a fresh content_hash for the document on demand.

Toolsmith log: TS-NINETY-POD-TEST-INFRASTRUCTURE-KN026-BP003
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

_REQUIRED_FIELDS = [
    "hypothesis",
    "falsification_criteria",
    "predicted_measurements",
    "receipt_collection_protocol",
    "scenarios",
    "timestamp_iso",
]

_REQUIRED_PREDICTED_FIELDS = ["bean_predictions", "total_predicted_pp"]
_MIN_FALSIFICATION_CRITERIA = 1
_MIN_SCENARIOS = 2


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _canonical_json(obj: Any) -> str:
    return json.dumps(obj, sort_keys=True, ensure_ascii=False, separators=(",", ":"))


def compute_content_hash(prereg_doc: Dict[str, Any]) -> str:
    """
    Compute SHA-256 content-hash for a pre-reg document.

    Excludes 'content_hash_lock' field itself from hash computation
    so the hash is stable after locking.
    """
    body = {k: v for k, v in prereg_doc.items() if k != "content_hash_lock"}
    canonical = _canonical_json(body)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def validate_schema(prereg_doc: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validate that a pre-reg document conforms to #2298 schema.

    Returns (is_valid: bool, errors: List[str]).
    """
    errors: List[str] = []

    # Required top-level fields
    for field in _REQUIRED_FIELDS:
        if field not in prereg_doc:
            errors.append(f"Missing required field: '{field}'")

    # hypothesis must be a non-empty string
    hypothesis = prereg_doc.get("hypothesis", "")
    if not isinstance(hypothesis, str) or len(hypothesis.strip()) < 20:
        errors.append(
            "Field 'hypothesis' must be a non-empty falsifiable statement (min 20 chars)."
        )

    # falsification_criteria must be a non-empty list
    fc = prereg_doc.get("falsification_criteria", [])
    if not isinstance(fc, list) or len(fc) < _MIN_FALSIFICATION_CRITERIA:
        errors.append(
            f"Field 'falsification_criteria' must be a list with at least {_MIN_FALSIFICATION_CRITERIA} criterion."
        )

    # predicted_measurements must contain required sub-fields
    pm = prereg_doc.get("predicted_measurements", {})
    if isinstance(pm, dict):
        for pf in _REQUIRED_PREDICTED_FIELDS:
            if pf not in pm:
                errors.append(
                    f"Field 'predicted_measurements' missing sub-field: '{pf}'"
                )
    else:
        errors.append("Field 'predicted_measurements' must be a dict.")

    # scenarios must be a list with at least 2 entries
    scenarios = prereg_doc.get("scenarios", [])
    if not isinstance(scenarios, list) or len(scenarios) < _MIN_SCENARIOS:
        errors.append(
            f"Field 'scenarios' must be a list with at least {_MIN_SCENARIOS} scenario labels."
        )

    # receipt_collection_protocol must be a non-empty string
    rcp = prereg_doc.get("receipt_collection_protocol", "")
    if not isinstance(rcp, str) or len(rcp.strip()) < 10:
        errors.append(
            "Field 'receipt_collection_protocol' must be a non-empty string (min 10 chars)."
        )

    # timestamp_iso must be present
    ts = prereg_doc.get("timestamp_iso", "")
    if not isinstance(ts, str) or not ts:
        errors.append("Field 'timestamp_iso' must be a non-empty ISO timestamp string.")

    return (len(errors) == 0, errors)


def lock_pre_registration(prereg_doc: Dict[str, Any]) -> Dict[str, Any]:
    """
    Lock a pre-reg document by computing and embedding content_hash_lock.

    Returns a new dict with content_hash_lock set.
    Raises ValueError if document fails schema validation.
    """
    is_valid, errors = validate_schema(prereg_doc)
    if not is_valid:
        raise ValueError(f"Pre-reg document invalid ({len(errors)} errors): {errors}")

    locked = dict(prereg_doc)
    locked["timestamp_iso"] = prereg_doc.get("timestamp_iso") or _iso_now()
    locked["content_hash_lock"] = compute_content_hash(locked)
    return locked


def verify_lock(prereg_doc: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Verify that a locked pre-reg document's content_hash_lock is valid.

    Returns (is_valid: bool, message: str).
    """
    stored_hash = prereg_doc.get("content_hash_lock", "")
    if not stored_hash:
        return False, "No content_hash_lock present — document has not been locked."

    expected_hash = compute_content_hash(prereg_doc)
    if stored_hash != expected_hash:
        return (
            False,
            f"content_hash_lock mismatch. Stored: {stored_hash[:16]}... Expected: {expected_hash[:16]}... "
            "Pre-reg has been tampered with or edited after locking.",
        )

    return True, f"Pre-reg lock verified. Hash: {stored_hash[:16]}..."


def require_valid_lock(prereg_doc: Dict[str, Any]) -> None:
    """
    Gate function: raises RuntimeError if pre-reg is not locked or hash is invalid.

    Called by test orchestrators BEFORE starting any test run. Enforces #2298
    discipline — no test fires without a valid pre-registered prediction locked.
    """
    is_valid, msg = verify_lock(prereg_doc)
    if not is_valid:
        raise RuntimeError(
            f"[#2298] PRE-REGISTRATION GATE: Cannot start test. {msg}"
        )
