"""
Three-Mode Comparator Engine — KN009 / A&A #2291

Four comparison modes per Founder articulation (BP002 turn 13 / Property 4):

  1. Basic Stock    — single-primitive baseline (cheapest/simplest substrate)
  2. Modified Stock — explicit subset of primitives chosen by query
  3. Full Stack     — all primitives on simultaneously (overladen)
  4. Right Recipe   — empirically optimal subset (argmax over 2^N-1 subsets)

Right Recipe is lazy: computed only when explicitly requested
(avoids 2^N pre-computation cost for large N).

For N=10, Right Recipe evaluates 2^10-1 = 1,023 subsets.
For N=20, Right Recipe evaluates 2^20-1 = 1,048,575 subsets — expensive.
Set right_recipe_max_k to limit search depth (e.g., max_k=4 restricts to
subsets of size ≤ 4, which covers 99% of practical recipes).

Toolsmith log: TS-CHANDELIER-EMPIRICAL-MEASUREMENT-KN009-BP002
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple

from .chronos_chandelier_bridge import ReceiptIndex, build_index
from .chandelier_runner_ln import enumerate_all_subsets


# ── Comparison result schema ───────────────────────────────────────────────────

def _mode_result(
    mode: str,
    primitive_ids: List[str],
    receipts: List[Dict[str, Any]],
    metric: str,
) -> Dict[str, Any]:
    """
    Aggregate receipts for a given mode into a summary dict.
    Uses the most recent receipt per subset key.
    """
    if not receipts:
        return {
            "mode": mode,
            "primitive_ids": sorted(primitive_ids),
            "receipts_found": 0,
            "latest_delta": None,
            "latest_receipt_id": None,
            "metric": metric,
        }
    latest = receipts[-1]
    return {
        "mode": mode,
        "primitive_ids": sorted(primitive_ids),
        "receipts_found": len(receipts),
        "latest_delta": latest.get("delta"),
        "latest_combined_score": latest.get("treatment", {}).get("score"),
        "latest_baseline_score": latest.get("baseline", {}).get("score"),
        "synergy_delta": latest.get("synergy_delta"),
        "synergy_type": latest.get("synergy_type"),
        "decomposition": latest.get("decomposition"),
        "latest_receipt_id": latest.get("receipt_id"),
        "metric": metric,
    }


# ── Main comparator ────────────────────────────────────────────────────────────

class ThreeModeComparator:
    """
    Three-mode (+ Right Recipe) combinatorial comparator.

    Usage:
        index = build_index()
        cmp = ThreeModeComparator(index)
        result = cmp.compare(
            subset=["cathedral_effect", "wrasse_scribe"],
            metric="hot_accuracy_pct",
            all_primitive_ids=["cathedral_effect", "wrasse_scribe", "pheromone_substrate", ...],
            include_right_recipe=True,
            right_recipe_max_k=4,
        )
    """

    def __init__(self, index: Optional[ReceiptIndex] = None) -> None:
        self._index = index or build_index()

    def _query(
        self,
        primitive_ids: List[str],
        metric: str,
        time_range: Optional[Tuple[str, str]] = None,
    ) -> List[Dict[str, Any]]:
        return self._index.query(primitive_ids, metric=metric, time_range=time_range)

    def compare(
        self,
        subset: List[str],
        metric: str,
        all_primitive_ids: Optional[List[str]] = None,
        basic_stock_primitive: Optional[str] = None,
        include_right_recipe: bool = False,
        right_recipe_max_k: Optional[int] = None,
        time_range: Optional[Tuple[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Run all four comparison modes for a subset query.

        Parameters
        ----------
        subset                : the Modified-Stock subset (primitives to compare)
        metric                : which metric to compare on
        all_primitive_ids     : full list of primitives for Full-Stack + Right-Recipe
                                (if None, only Basic-Stock and Modified-Stock run)
        basic_stock_primitive : single primitive ID for Basic-Stock baseline
                                (if None, uses first primitive in subset)
        include_right_recipe  : if True, compute Right Recipe (argmax; lazy)
        right_recipe_max_k    : max subset size for Right Recipe search
        time_range            : optional (start_iso, end_iso) receipt filter

        Returns
        -------
        dict with keys: basic_stock, modified_stock, full_stack (if all_primitive_ids),
                        right_recipe (if include_right_recipe), comparison_summary
        """
        sorted_subset = sorted(subset)

        # ── Mode 1: Basic Stock ────────────────────────────────────────────────
        bs_id = basic_stock_primitive or (sorted_subset[0] if sorted_subset else "")
        bs_receipts = self._query([bs_id], metric, time_range) if bs_id else []
        basic_stock = _mode_result("basic_stock", [bs_id], bs_receipts, metric)

        # ── Mode 2: Modified Stock ─────────────────────────────────────────────
        ms_receipts = self._query(sorted_subset, metric, time_range)
        modified_stock = _mode_result("modified_stock", sorted_subset, ms_receipts, metric)

        result: Dict[str, Any] = {
            "query": {
                "subset": sorted_subset,
                "metric": metric,
                "basic_stock_primitive": bs_id,
            },
            "basic_stock": basic_stock,
            "modified_stock": modified_stock,
            "full_stack": None,
            "right_recipe": None,
        }

        if all_primitive_ids is not None:
            sorted_all = sorted(all_primitive_ids)

            # ── Mode 3: Full Stack ─────────────────────────────────────────────
            fs_receipts = self._query(sorted_all, metric, time_range)
            result["full_stack"] = _mode_result("full_stack", sorted_all, fs_receipts, metric)

            # ── Mode 4: Right Recipe (lazy) ────────────────────────────────────
            if include_right_recipe:
                result["right_recipe"] = self._compute_right_recipe(
                    all_primitive_ids=sorted_all,
                    metric=metric,
                    max_k=right_recipe_max_k,
                    time_range=time_range,
                )

        # ── Comparison summary ─────────────────────────────────────────────────
        result["comparison_summary"] = self._build_summary(result)

        return result

    def _compute_right_recipe(
        self,
        all_primitive_ids: List[str],
        metric: str,
        max_k: Optional[int] = None,
        time_range: Optional[Tuple[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Compute the empirically optimal subset (argmax over 2^N-1 receipts).

        For each subset that has a receipt, picks the one with the highest delta.
        Subsets with no receipt are skipped (not invented yet).
        """
        best_delta: Optional[float] = None
        best_subset: Optional[List[str]] = None
        best_receipt_id: Optional[str] = None
        subsets_evaluated = 0

        for subset_tuple in enumerate_all_subsets(
            all_primitive_ids,
            min_k=1,
            max_k=max_k,
        ):
            subset_list = list(subset_tuple)
            receipts = self._query(subset_list, metric, time_range)
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

        if best_subset is None:
            return {
                "mode": "right_recipe",
                "found": False,
                "subsets_evaluated": subsets_evaluated,
                "message": "No receipts found for any subset. Run measurements first.",
            }

        return {
            "mode": "right_recipe",
            "found": True,
            "primitive_ids": best_subset,
            "best_delta": best_delta,
            "best_receipt_id": best_receipt_id,
            "subsets_evaluated": subsets_evaluated,
            "metric": metric,
        }

    def _build_summary(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Build a human-readable summary comparing the modes.
        """
        bs_delta = result["basic_stock"].get("latest_delta")
        ms_delta = result["modified_stock"].get("latest_delta")
        fs_delta = result["full_stack"].get("latest_delta") if result["full_stack"] else None
        rr = result["right_recipe"]

        lines = []

        if bs_delta is not None and ms_delta is not None:
            lean_vs_basic = round(ms_delta - bs_delta, 6)
            lines.append(
                f"Modified-Stock lift over Basic-Stock: {lean_vs_basic:+.4f} ({result['query']['metric']})"
            )

        if fs_delta is not None and ms_delta is not None:
            lean_vs_full = round(ms_delta - fs_delta, 6)
            lines.append(
                f"Modified-Stock vs Full-Stack: {lean_vs_full:+.4f} "
                f"({'leaner wins' if lean_vs_full >= 0 else 'full stack wins'})"
            )

        if rr and rr.get("found"):
            is_optimal = (
                rr["primitive_ids"] == result["query"]["subset"]
            )
            lines.append(
                f"Right Recipe: {rr['primitive_ids']} (delta={rr['best_delta']:.4f}) "
                f"{'← this IS the optimal subset' if is_optimal else '← different from Modified-Stock'}"
            )

        if not lines:
            lines.append("Insufficient receipts for comparison. Run measurements first.")

        return {
            "lines": lines,
            "has_basic_stock": result["basic_stock"].get("receipts_found", 0) > 0,
            "has_modified_stock": result["modified_stock"].get("receipts_found", 0) > 0,
            "has_full_stack": bool(result["full_stack"] and result["full_stack"].get("receipts_found", 0) > 0),
            "has_right_recipe": bool(rr and rr.get("found")),
        }
