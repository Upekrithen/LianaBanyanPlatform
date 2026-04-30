"""
Chandelier Runner L1 — Per-primitive empirical measurement (KN009 / #2291)

Level-1 receipt: one primitive measured against a baseline.

Every L1 receipt declares:
  - primitive_id  : canonical primitive identifier
  - metric        : what is being measured
  - baseline      : behavior WITHOUT the primitive (score + description)
  - treatment     : behavior WITH the primitive (score + description)
  - delta         : treatment.score - baseline.score
  - cost          : optional {tokens, latency_ms, notes}
  - trade_offs    : where this primitive underperforms baseline
  - harness_id    : identifier for the measurement harness (Reproducibility Pack #2326)

Receipts are signed and stored via chronos_chandelier_bridge.sign_and_store().

Toolsmith log: TS-CHANDELIER-EMPIRICAL-MEASUREMENT-KN009-BP002
"""

from __future__ import annotations

import hashlib
import time
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional

from .chronos_chandelier_bridge import sign_and_store, ReceiptIndex


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _short_id(seed: str) -> str:
    """8-char hex receipt ID derived from seed + timestamp."""
    h = hashlib.sha256((seed + _iso_now()).encode()).hexdigest()
    return h[:8]


# ── L1 receipt builder ─────────────────────────────────────────────────────────

def build_l1_receipt(
    primitive_id: str,
    metric: str,
    baseline_score: float,
    baseline_description: str,
    treatment_score: float,
    treatment_description: str,
    session_id: str = "",
    cost: Optional[Dict[str, Any]] = None,
    trade_offs: str = "",
    harness_id: str = "reproducibility_pack_2326",
    notes: str = "",
) -> Dict[str, Any]:
    """
    Build a Level-1 receipt dict (not yet signed/stored).

    Parameters
    ----------
    primitive_id         : canonical ID (e.g. "cathedral_effect", "wrasse_scribe")
    metric               : what is measured (e.g. "hot_accuracy_pct")
    baseline_score       : numeric score WITHOUT the primitive
    baseline_description : text description of baseline condition
    treatment_score      : numeric score WITH the primitive
    treatment_description: text description of treatment condition
    session_id           : K/KN session identifier
    cost                 : optional {tokens, latency_ms, ...}
    trade_offs           : honest description of where primitive underperforms
    harness_id           : measurement harness identifier
    notes                : free-form notes

    Returns
    -------
    Unsigned L1 receipt dict (call sign_and_store() to persist).
    """
    delta = round(treatment_score - baseline_score, 6)

    receipt_body: Dict[str, Any] = {
        "receipt_id": f"rc_{_short_id(primitive_id + metric)}",
        "receipt_class": "L1",
        "primitive_ids": [primitive_id],
        "session_id": session_id,
        "timestamp": _iso_now(),
        "metric": metric,
        "baseline": {
            "description": baseline_description,
            "score": baseline_score,
        },
        "treatment": {
            "description": treatment_description,
            "score": treatment_score,
        },
        "delta": delta,
        "harness_id": harness_id,
        "trade_offs": trade_offs,
        "toolsmith_log": "TS-CHANDELIER-EMPIRICAL-MEASUREMENT-KN009-BP002",
    }
    if cost is not None:
        receipt_body["cost"] = cost
    if notes:
        receipt_body["notes"] = notes

    return receipt_body


def run_l1(
    primitive_id: str,
    metric: str,
    baseline_score: float,
    baseline_description: str,
    treatment_score: float,
    treatment_description: str,
    session_id: str = "",
    cost: Optional[Dict[str, Any]] = None,
    trade_offs: str = "",
    harness_id: str = "reproducibility_pack_2326",
    notes: str = "",
    index: Optional[ReceiptIndex] = None,
) -> Dict[str, Any]:
    """
    Build, sign, and store a Level-1 receipt.

    Returns the signed receipt.
    If index is provided, the signed receipt is also ingested into it.
    """
    receipt_body = build_l1_receipt(
        primitive_id=primitive_id,
        metric=metric,
        baseline_score=baseline_score,
        baseline_description=baseline_description,
        treatment_score=treatment_score,
        treatment_description=treatment_description,
        session_id=session_id,
        cost=cost,
        trade_offs=trade_offs,
        harness_id=harness_id,
        notes=notes,
    )
    signed = sign_and_store(receipt_body, session_id=session_id)
    if index is not None:
        index.add(signed)
    return signed


# ── Harness runner ─────────────────────────────────────────────────────────────

def run_l1_from_harness(
    primitive_id: str,
    metric: str,
    baseline_fn: Callable[[], float],
    treatment_fn: Callable[[], float],
    baseline_description: str = "Baseline condition (primitive absent)",
    treatment_description: str = "Treatment condition (primitive present)",
    session_id: str = "",
    cost_fn: Optional[Callable[[], Dict[str, Any]]] = None,
    trade_offs: str = "",
    harness_id: str = "reproducibility_pack_2326",
    notes: str = "",
    index: Optional[ReceiptIndex] = None,
) -> Dict[str, Any]:
    """
    Run L1 measurement from callable harness functions.

    baseline_fn()  → float score WITHOUT the primitive
    treatment_fn() → float score WITH the primitive

    Measures wall-clock time for each condition and injects into cost if provided.
    """
    t0 = time.perf_counter()
    baseline_score = baseline_fn()
    t1 = time.perf_counter()
    treatment_score = treatment_fn()
    t2 = time.perf_counter()

    cost: Optional[Dict[str, Any]] = None
    if cost_fn is not None:
        cost = cost_fn()
    else:
        cost = {
            "baseline_elapsed_ms": round((t1 - t0) * 1000, 1),
            "treatment_elapsed_ms": round((t2 - t1) * 1000, 1),
        }

    return run_l1(
        primitive_id=primitive_id,
        metric=metric,
        baseline_score=baseline_score,
        baseline_description=baseline_description,
        treatment_score=treatment_score,
        treatment_description=treatment_description,
        session_id=session_id,
        cost=cost,
        trade_offs=trade_offs,
        harness_id=harness_id,
        notes=notes,
        index=index,
    )


# ── Batch L1 runner ────────────────────────────────────────────────────────────

def run_l1_batch(
    primitives: List[Dict[str, Any]],
    session_id: str = "",
    index: Optional[ReceiptIndex] = None,
) -> List[Dict[str, Any]]:
    """
    Run multiple L1 measurements from a specification list.

    Each element in primitives must be a dict with keys matching run_l1 parameters:
      primitive_id, metric, baseline_score, baseline_description,
      treatment_score, treatment_description
    Optional: cost, trade_offs, harness_id, notes

    Returns list of signed receipts.
    """
    results = []
    for spec in primitives:
        signed = run_l1(
            primitive_id=spec["primitive_id"],
            metric=spec["metric"],
            baseline_score=spec["baseline_score"],
            baseline_description=spec.get("baseline_description", "baseline"),
            treatment_score=spec["treatment_score"],
            treatment_description=spec.get("treatment_description", "treatment"),
            session_id=session_id,
            cost=spec.get("cost"),
            trade_offs=spec.get("trade_offs", ""),
            harness_id=spec.get("harness_id", "reproducibility_pack_2326"),
            notes=spec.get("notes", ""),
            index=index,
        )
        results.append(signed)
    return results
