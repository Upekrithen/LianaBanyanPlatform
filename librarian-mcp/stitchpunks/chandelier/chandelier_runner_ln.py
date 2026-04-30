"""
Chandelier Runner LN — Per-combination synergy measurement (KN009 / #2291)

Level-N receipts (N ≥ 2): k-of-N primitive combinations measured for synergy.

Every LN receipt (N ≥ 2) declares:
  - primitive_ids      : sorted list of N primitive IDs
  - metric             : what is being measured
  - individual_deltas  : L1 delta for each constituent (must be pre-measured)
  - combined_score     : score when ALL N primitives active together
  - baseline_score     : score when NONE of the N primitives active
  - combined_delta     : combined_score - baseline_score
  - synergy_delta      : combined_delta - sum(individual_deltas)
                         positive  = synergy exists
                         zero      = purely additive
                         negative  = interference
  - decomposition      : Shapley-style fraction of combined_delta per primitive

The Shapley-style decomposition uses a fast approximation:
  weight_i = individual_delta_i / sum(individual_deltas)  if sum > 0
  else      = 1/N  (equal split)

For exact Shapley on L3+ we enumerate marginal contributions over all orderings.
The exact method is opt-in via use_exact_shapley=True; the fast approximation
is the default (sufficient for L1-L12 diagnostic use).

Toolsmith log: TS-CHANDELIER-EMPIRICAL-MEASUREMENT-KN009-BP002
"""

from __future__ import annotations

import hashlib
import itertools
import math
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional, Tuple

from .chronos_chandelier_bridge import sign_and_store, ReceiptIndex


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _short_id(seed: str) -> str:
    h = hashlib.sha256((seed + _iso_now()).encode()).hexdigest()
    return h[:8]


# ── Shapley decomposition ──────────────────────────────────────────────────────

def _fast_decomposition(
    individual_deltas: Dict[str, float],
) -> Dict[str, float]:
    """
    Fast proportional decomposition (O(N)).
    weight_i = delta_i / sum(deltas) if sum > 0 else 1/N.
    Returns fraction (sum = 1.0) per primitive.
    """
    total = sum(individual_deltas.values())
    n = len(individual_deltas)
    if total == 0 or n == 0:
        return {k: round(1.0 / n, 6) for k in individual_deltas} if n else {}
    return {k: round(v / total, 6) for k, v in individual_deltas.items()}


def _exact_shapley_decomposition(
    primitive_ids: List[str],
    score_fn: Callable[[List[str]], float],
    baseline_score: float,
) -> Dict[str, float]:
    """
    Exact Shapley value decomposition (O(N! * 2^N) — only practical for N ≤ 8).

    score_fn(subset) → float: should return the combined score for that subset.
    Shapley value φ_i = average marginal contribution of i across all orderings.

    Returns fraction of combined_delta per primitive (may not sum exactly to 1
    due to floating point; callers should normalise if needed).
    """
    n = len(primitive_ids)
    if n > 8:
        raise ValueError(f"Exact Shapley impractical for N={n} > 8; use fast approximation.")

    shapley: Dict[str, float] = {pid: 0.0 for pid in primitive_ids}

    for ordering in itertools.permutations(primitive_ids):
        for i, pid in enumerate(ordering):
            subset_without = list(ordering[:i])
            subset_with = list(ordering[:i+1])
            marginal = score_fn(subset_with) - score_fn(subset_without)
            shapley[pid] += marginal

    n_fact = math.factorial(n)
    return {pid: round(v / n_fact, 6) for pid, v in shapley.items()}


# ── LN receipt builder ─────────────────────────────────────────────────────────

def build_ln_receipt(
    primitive_ids: List[str],
    metric: str,
    baseline_score: float,
    baseline_description: str,
    combined_score: float,
    combined_description: str,
    individual_deltas: Dict[str, float],
    session_id: str = "",
    cost: Optional[Dict[str, Any]] = None,
    trade_offs: str = "",
    harness_id: str = "reproducibility_pack_2326",
    notes: str = "",
    use_exact_shapley: bool = False,
    score_fn_for_shapley: Optional[Callable[[List[str]], float]] = None,
) -> Dict[str, Any]:
    """
    Build a Level-N receipt dict (N = len(primitive_ids), N ≥ 2).

    Parameters
    ----------
    primitive_ids       : list of N primitives in this combination
    metric              : metric name
    baseline_score      : score when NONE of the N primitives are active
    baseline_description: description of baseline condition
    combined_score      : score when ALL N primitives are active together
    combined_description: description of combined treatment condition
    individual_deltas   : {primitive_id: L1_delta} for each constituent
                          Must be pre-measured (from L1 receipts).
    session_id          : K/KN session
    cost                : optional cost metadata
    trade_offs          : honest trade-off notes
    harness_id          : measurement harness identifier
    notes               : free-form notes
    use_exact_shapley   : if True, uses exact Shapley (requires score_fn_for_shapley; N ≤ 8)
    score_fn_for_shapley: callable(subset) → float, required for exact Shapley

    Returns
    -------
    Unsigned LN receipt dict (call sign_and_store() to persist).
    """
    n = len(primitive_ids)
    if n < 2:
        raise ValueError("LN runner requires N ≥ 2 primitives. Use L1 runner for single primitives.")

    sorted_ids = sorted(str(p) for p in primitive_ids)
    level_class = f"L{n}"

    combined_delta = round(combined_score - baseline_score, 6)
    individual_sum = sum(individual_deltas.get(pid, 0.0) for pid in sorted_ids)
    synergy_delta = round(combined_delta - individual_sum, 6)

    if use_exact_shapley and score_fn_for_shapley is not None:
        decomposition = _exact_shapley_decomposition(
            sorted_ids, score_fn_for_shapley, baseline_score
        )
    else:
        per_primitive_deltas = {pid: individual_deltas.get(pid, 0.0) for pid in sorted_ids}
        decomposition = _fast_decomposition(per_primitive_deltas)

    receipt_body: Dict[str, Any] = {
        "receipt_id": f"rc_{_short_id(''.join(sorted_ids) + metric)}",
        "receipt_class": level_class,
        "primitive_ids": sorted_ids,
        "session_id": session_id,
        "timestamp": _iso_now(),
        "metric": metric,
        "baseline": {
            "description": baseline_description,
            "score": baseline_score,
        },
        "treatment": {
            "description": combined_description,
            "score": combined_score,
        },
        "delta": combined_delta,
        "individual_deltas": {pid: individual_deltas.get(pid, 0.0) for pid in sorted_ids},
        "individual_sum": round(individual_sum, 6),
        "synergy_delta": synergy_delta,
        "synergy_type": (
            "positive" if synergy_delta > 1e-9 else
            "negative" if synergy_delta < -1e-9 else
            "additive"
        ),
        "decomposition": decomposition,
        "harness_id": harness_id,
        "trade_offs": trade_offs,
        "toolsmith_log": "TS-CHANDELIER-EMPIRICAL-MEASUREMENT-KN009-BP002",
    }
    if cost is not None:
        receipt_body["cost"] = cost
    if notes:
        receipt_body["notes"] = notes

    return receipt_body


def run_ln(
    primitive_ids: List[str],
    metric: str,
    baseline_score: float,
    baseline_description: str,
    combined_score: float,
    combined_description: str,
    individual_deltas: Dict[str, float],
    session_id: str = "",
    cost: Optional[Dict[str, Any]] = None,
    trade_offs: str = "",
    harness_id: str = "reproducibility_pack_2326",
    notes: str = "",
    use_exact_shapley: bool = False,
    score_fn_for_shapley: Optional[Callable[[List[str]], float]] = None,
    index: Optional[ReceiptIndex] = None,
) -> Dict[str, Any]:
    """
    Build, sign, and store a Level-N receipt (N ≥ 2).
    Returns the signed receipt.
    """
    receipt_body = build_ln_receipt(
        primitive_ids=primitive_ids,
        metric=metric,
        baseline_score=baseline_score,
        baseline_description=baseline_description,
        combined_score=combined_score,
        combined_description=combined_description,
        individual_deltas=individual_deltas,
        session_id=session_id,
        cost=cost,
        trade_offs=trade_offs,
        harness_id=harness_id,
        notes=notes,
        use_exact_shapley=use_exact_shapley,
        score_fn_for_shapley=score_fn_for_shapley,
    )
    signed = sign_and_store(receipt_body, session_id=session_id)
    if index is not None:
        index.add(signed)
    return signed


# ── Combinatorial batch runner ─────────────────────────────────────────────────

def run_ln_batch(
    combinations: List[Dict[str, Any]],
    session_id: str = "",
    index: Optional[ReceiptIndex] = None,
) -> List[Dict[str, Any]]:
    """
    Run multiple LN measurements from a specification list.

    Each element must contain: primitive_ids, metric, baseline_score,
    combined_score, individual_deltas.
    Optional: baseline_description, combined_description, cost, trade_offs,
              harness_id, notes, use_exact_shapley, score_fn_for_shapley.

    Returns list of signed receipts.
    """
    results = []
    for spec in combinations:
        signed = run_ln(
            primitive_ids=spec["primitive_ids"],
            metric=spec["metric"],
            baseline_score=spec["baseline_score"],
            baseline_description=spec.get("baseline_description", "baseline (no primitives active)"),
            combined_score=spec["combined_score"],
            combined_description=spec.get("combined_description", "combined treatment"),
            individual_deltas=spec["individual_deltas"],
            session_id=session_id,
            cost=spec.get("cost"),
            trade_offs=spec.get("trade_offs", ""),
            harness_id=spec.get("harness_id", "reproducibility_pack_2326"),
            notes=spec.get("notes", ""),
            use_exact_shapley=spec.get("use_exact_shapley", False),
            score_fn_for_shapley=spec.get("score_fn_for_shapley"),
            index=index,
        )
        results.append(signed)
    return results


# ── All-subsets enumeration helper ─────────────────────────────────────────────

def enumerate_all_subsets(
    primitive_ids: List[str],
    min_k: int = 1,
    max_k: Optional[int] = None,
) -> List[Tuple[str, ...]]:
    """
    Enumerate all non-empty subsets of primitive_ids with k ∈ [min_k, max_k].
    Returns sorted tuples (for use as primitive_tuple_keys).

    For N=20, total subsets = 2^20 - 1 = 1,048,575 — expensive.
    Use max_k to bound computation for Right-Recipe mode.
    """
    n = len(primitive_ids)
    if max_k is None:
        max_k = n
    max_k = min(max_k, n)
    subsets = []
    for k in range(min_k, max_k + 1):
        for combo in itertools.combinations(sorted(primitive_ids), k):
            subsets.append(combo)
    return subsets
