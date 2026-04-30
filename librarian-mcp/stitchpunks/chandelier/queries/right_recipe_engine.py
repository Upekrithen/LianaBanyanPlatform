"""
Right Recipe Argmax Engine — KN010 / A&A #2291

Given a target metric + optional subset-size cap, returns the empirically
optimal primitive subset with full provenance trace.

Strategy per D.2:
  N ≤ 12 : full enumeration (2^N - 1 subsets — exhaustive, exact)
  N > 12 : prerequisite-graph-pruned beam search + greedy initialization

Beam-search variant:
  1. Greedy initialisation: add primitives one-by-one, largest marginal-delta first
  2. Beam width = 8 (configurable)
  3. Prerequisite-graph pruning: reject subsets where hard_prerequisites are unmet
  4. Time budget: default 60s; configurable via query_time_budget_s parameter

Output format (D.3):
  {
    "winner": {primitive_ids: [...], delta: float, receipt_id: str},
    "subsets_evaluated": int,
    "method": "full_enum" | "beam_search",
    "confidence": "high" (full_enum) | "near_optimal" (beam_search),
    "provenance_hash": str,          # SHA-256 of winner receipt body
    "query_elapsed_s": float,
    "caveats": [str],
  }

Toolsmith log: TS-CHANDELIER-DIAGNOSTIC-QUERIES-KN010-BP002
"""

from __future__ import annotations

import hashlib
import json
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

_HERE = Path(__file__).parent
_STITCH_DIR = _HERE.parent.parent  # librarian-mcp/stitchpunks/
if str(_STITCH_DIR) not in sys.path:
    sys.path.insert(0, str(_STITCH_DIR))

from chandelier.chronos_chandelier_bridge import ReceiptIndex, build_index
from chandelier.chandelier_runner_ln import enumerate_all_subsets
from chandelier.prerequisite_graph_loader import PrerequisiteGraph, get_graph


# ── Prerequisite validation ────────────────────────────────────────────────────

def _validate_subset(
    subset: List[str],
    graph: Optional[PrerequisiteGraph],
) -> bool:
    """
    Return True if every primitive in the subset has its hard_prerequisites
    satisfied within the subset.
    """
    if graph is None:
        return True
    valid, _ = graph.validate_substrate_subset(subset)
    return valid


# ── Full enumeration (N ≤ 12) ─────────────────────────────────────────────────

def _full_enum_argmax(
    all_primitive_ids: List[str],
    metric: str,
    index: ReceiptIndex,
    max_k: Optional[int],
    prereq_graph: Optional[PrerequisiteGraph],
    time_budget_s: float,
) -> Tuple[Optional[List[str]], Optional[float], Optional[str], int, float]:
    """
    Exhaustive argmax over all valid subsets.

    Returns: (best_subset, best_delta, best_receipt_id, subsets_evaluated, elapsed_s)
    """
    t0 = time.perf_counter()
    best_delta: Optional[float] = None
    best_subset: Optional[List[str]] = None
    best_receipt_id: Optional[str] = None
    subsets_evaluated = 0

    for subset_tuple in enumerate_all_subsets(all_primitive_ids, min_k=1, max_k=max_k):
        if time.perf_counter() - t0 > time_budget_s:
            break
        subset_list = list(subset_tuple)
        if prereq_graph and not _validate_subset(subset_list, prereq_graph):
            continue
        receipts = index.query(subset_list, metric=metric)
        if not receipts:
            continue
        latest = receipts[-1]
        delta = latest.get("delta")
        if delta is None:
            continue
        subsets_evaluated += 1
        if best_delta is None or delta > best_delta:
            best_delta = delta
            best_subset = subset_list
            best_receipt_id = latest.get("receipt_id")

    return best_subset, best_delta, best_receipt_id, subsets_evaluated, time.perf_counter() - t0


# ── Beam search (N > 12) ───────────────────────────────────────────────────────

def _get_delta(
    subset: List[str],
    metric: str,
    index: ReceiptIndex,
) -> Optional[float]:
    receipts = index.query(subset, metric=metric)
    if not receipts:
        return None
    return receipts[-1].get("delta")


def _greedy_init(
    all_primitive_ids: List[str],
    metric: str,
    index: ReceiptIndex,
    prereq_graph: Optional[PrerequisiteGraph],
) -> List[str]:
    """
    Greedy initialization: build a starting subset by adding the primitive
    with the largest individual (L1) delta first.
    """
    # Score each primitive individually
    scored: List[Tuple[float, str]] = []
    for pid in all_primitive_ids:
        delta = _get_delta([pid], metric, index)
        if delta is not None:
            scored.append((delta, pid))

    scored.sort(reverse=True)

    # Build greedy sequence respecting prerequisites
    current: List[str] = []
    for _, pid in scored:
        candidate = sorted(current + [pid])
        if not prereq_graph or _validate_subset(candidate, prereq_graph):
            current = candidate

    return current


def _beam_search_argmax(
    all_primitive_ids: List[str],
    metric: str,
    index: ReceiptIndex,
    max_k: Optional[int],
    prereq_graph: Optional[PrerequisiteGraph],
    time_budget_s: float,
    beam_width: int = 8,
) -> Tuple[Optional[List[str]], Optional[float], Optional[str], int, float]:
    """
    Beam-search argmax with prerequisite pruning.

    Starts from greedy init, expands by adding/removing single primitives,
    keeps top beam_width candidates per iteration.

    Returns: (best_subset, best_delta, best_receipt_id, subsets_evaluated, elapsed_s)
    """
    t0 = time.perf_counter()
    subsets_evaluated = 0
    best_delta: Optional[float] = None
    best_subset: Optional[List[str]] = None
    best_receipt_id: Optional[str] = None

    effective_max_k = max_k or len(all_primitive_ids)
    primitive_set = set(all_primitive_ids)

    # Start beam from greedy init + empty set
    init = _greedy_init(all_primitive_ids, metric, index, prereq_graph)
    beam: List[Tuple[float, List[str]]] = []

    for start in [init, []]:
        d = _get_delta(start, metric, index) if start else None
        beam.append((d if d is not None else float("-inf"), start))
        # Seed best_delta from the starting points themselves
        if d is not None and (best_delta is None or d > best_delta):
            best_delta = d
            best_subset = start
            receipt = (index.query(start, metric=metric) or [None])[-1]
            if receipt:
                best_receipt_id = receipt.get("receipt_id")

    # Track visited to avoid re-evaluating
    visited: set = set()

    def _tuple_key(s: List[str]) -> Tuple[str, ...]:
        return tuple(sorted(s))

    for start_subset in [init, []]:
        visited.add(_tuple_key(start_subset))

    while beam and (time.perf_counter() - t0) < time_budget_s:
        # Expand each beam candidate
        candidates: List[Tuple[float, List[str]]] = list(beam)

        for _, current in beam:
            if (time.perf_counter() - t0) >= time_budget_s:
                break

            # Generate neighbours: add or remove one primitive
            for pid in all_primitive_ids:
                if pid in current:
                    neighbour = sorted(p for p in current if p != pid)
                else:
                    neighbour = sorted(current + [pid])

                if len(neighbour) > effective_max_k:
                    continue
                key = _tuple_key(neighbour)
                if key in visited:
                    continue
                visited.add(key)

                if prereq_graph and not _validate_subset(neighbour, prereq_graph):
                    continue

                receipts = index.query(neighbour, metric=metric)
                if not receipts:
                    continue
                latest = receipts[-1]
                delta = latest.get("delta")
                if delta is None:
                    continue

                subsets_evaluated += 1
                candidates.append((delta, neighbour))

                if best_delta is None or delta > best_delta:
                    best_delta = delta
                    best_subset = neighbour
                    best_receipt_id = latest.get("receipt_id")

        # Keep top beam_width by delta
        candidates.sort(key=lambda x: x[0] if x[0] is not None else float("-inf"), reverse=True)
        new_beam = candidates[:beam_width]

        if new_beam == beam:
            break  # Converged

        beam = new_beam

    return best_subset, best_delta, best_receipt_id, subsets_evaluated, time.perf_counter() - t0


# ── Provenance hash ────────────────────────────────────────────────────────────

def _provenance_hash(receipt_body: Dict[str, Any]) -> str:
    """SHA-256 of canonical receipt body (for Reproducibility Pack #2326 compat)."""
    body_no_sig = {k: v for k, v in receipt_body.items() if k != "chronos_signature"}
    canonical = json.dumps(body_no_sig, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


# ── Public API ─────────────────────────────────────────────────────────────────

class RightRecipeEngine:
    """
    Right Recipe argmax engine.

    Automatically selects full enumeration (N ≤ 12) or beam search (N > 12).
    Prerequisite-graph pruning applied in both modes.
    """

    FULL_ENUM_THRESHOLD = 12
    DEFAULT_TIME_BUDGET_S = 60.0
    DEFAULT_BEAM_WIDTH = 8

    #: Sentinel meaning "load default graph from disk" (distinct from None = disable)
    _USE_DEFAULT_GRAPH = object()

    def __init__(
        self,
        index: Optional[ReceiptIndex] = None,
        prereq_graph: Any = _USE_DEFAULT_GRAPH,
    ) -> None:
        self._index = index or build_index()
        if prereq_graph is RightRecipeEngine._USE_DEFAULT_GRAPH:
            try:
                self._prereq_graph: Optional[PrerequisiteGraph] = get_graph()
            except Exception:
                self._prereq_graph = None
        else:
            # Caller passed an explicit value: None (disabled) or a PrerequisiteGraph
            self._prereq_graph = prereq_graph

    def compute(
        self,
        metric: str,
        all_primitive_ids: Optional[List[str]] = None,
        max_k: Optional[int] = None,
        query_time_budget_s: float = DEFAULT_TIME_BUDGET_S,
        beam_width: int = DEFAULT_BEAM_WIDTH,
    ) -> Dict[str, Any]:
        """
        Compute the empirically optimal primitive subset for a given metric.

        Parameters
        ----------
        metric              : metric to optimise (e.g. "hot_accuracy_pct")
        all_primitive_ids   : candidates; if None, inferred from all indexed receipts
        max_k               : max subset size cap (None = uncapped)
        query_time_budget_s : abort if wall-clock exceeds this (default 60s)
        beam_width          : beam search width for N > FULL_ENUM_THRESHOLD

        Returns
        -------
        Structured result per D.3 schema.
        """
        # Infer candidates if not provided
        if all_primitive_ids is None:
            raw_keys = self._index.all_keys()
            inferred: set = set()
            for key in raw_keys:
                for pid in key.split("|"):
                    if pid:
                        inferred.add(pid)
            all_primitive_ids = sorted(inferred)

        n = len(all_primitive_ids)
        method = "full_enum" if n <= self.FULL_ENUM_THRESHOLD else "beam_search"

        if method == "full_enum":
            best_subset, best_delta, best_receipt_id, n_eval, elapsed = _full_enum_argmax(
                all_primitive_ids, metric, self._index,
                max_k, self._prereq_graph, query_time_budget_s,
            )
            confidence = "high"
        else:
            best_subset, best_delta, best_receipt_id, n_eval, elapsed = _beam_search_argmax(
                all_primitive_ids, metric, self._index,
                max_k, self._prereq_graph, query_time_budget_s, beam_width,
            )
            confidence = "near_optimal"

        caveats: List[str] = []
        if elapsed >= query_time_budget_s * 0.95:
            caveats.append(f"Time budget ({query_time_budget_s}s) approached — result may not be globally optimal.")
        if method == "beam_search":
            caveats.append(
                f"Beam search used (N={n} > {self.FULL_ENUM_THRESHOLD}). "
                "Result is near-optimal, not provably global optimum."
            )
        if not best_subset:
            caveats.append("No receipts found for any valid subset. Run measurements first.")

        prov_hash = ""
        if best_receipt_id:
            receipt = self._index.get_by_id(best_receipt_id)
            if receipt:
                prov_hash = _provenance_hash(receipt)

        return {
            "metric": metric,
            "winner": {
                "primitive_ids": best_subset or [],
                "delta": best_delta,
                "receipt_id": best_receipt_id,
            },
            "subsets_evaluated": n_eval,
            "method": method,
            "n_candidates": n,
            "max_k": max_k,
            "confidence": confidence,
            "provenance_hash": prov_hash,
            "query_elapsed_s": round(elapsed, 3),
            "caveats": caveats,
            "toolsmith_log": "TS-CHANDELIER-DIAGNOSTIC-QUERIES-KN010-BP002",
        }
